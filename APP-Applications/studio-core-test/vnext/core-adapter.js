/* VNext adapter to canonical Studio Core services.
 * UI widgets remain in app.js; files, collection, preview, output and history have
 * one source of truth here. No server upload and no global mutations.
 */
import {CollectionBrowser} from '../../_shared/studio-v2/collection-browser.js';
import {thumbnailFor} from '../../_shared/studio-v2/thumbnail-service.js';
import {OutputService} from '../../_shared/studio-v2/output-service.js';
import {recordHistory,loadHistory} from '../../_shared/studio-v2/history.js';
import {pushUndoRedo,undo,redo,getUndoRedoState,subscribeUndoRedo} from '../../_shared/studio-v2/undo-redo.js';

const EXTS_TEXT=new Set(['txt','md','markdown','json','csv','tsv','yaml','yml','xml','html','css','js','mjs','svg','log']);
const extension=name=>String(name||'').split('.').pop()?.toLowerCase()||'';
const humanBytes=n=>n>=1048576?(n/1048576).toFixed(1)+' Mo':n>=1024?(n/1024).toFixed(1)+' Ko':n+' o';
export function createCoreAdapter({collectionHost,previewHost,onUpdate}={}){
 if(!collectionHost||!previewHost)throw Error('Collection et aperçu requis');
 const output=new OutputService();
 const entries=new Map();
 const files=[];
 let lastUrl=null;
 let seq=0;
 const collection=new CollectionBrowser({
  host:collectionHost,key:'core-vnext',view:'list',thumbnailTools:true,
  getThumbnail:item=>thumbnailFor(item.data)
 });
 function history(label,detail='',type='action'){
  recordHistory({studio:'studio-core-vnext',type,label,detail});
 }
 function notify(){if(onUpdate)onUpdate(api)}
 function revoke(){if(lastUrl){URL.revokeObjectURL(lastUrl);lastUrl=null}}
 function active(){return collection.active()}
 function selectedFiles(){
  const selection=collection.selectedItems();
  return (selection.length?selection:active()?[active()]:[]).map(i=>entries.get(i.id)?.file).filter(Boolean);
 }
 function snapshot(){return{files:[...files],selected:[...collection.selected],activeId:collection.activeId}}
 function restore(snapshotState){
  files.splice(0,files.length,...snapshotState.files);
  entries.clear();
  for(const entry of files)entries.set(entry.id,entry);
  collection.selected=new Set(snapshotState.selected);
  collection.activeId=snapshotState.activeId;
  sync();
  history('Collection restaurée','Annuler / rétablir');
 }
 function transact(label,action){
  const before=snapshot();
  const value=action();
  const after=snapshot();
  pushUndoRedo({
   label,
   undo:()=>restore(before),
   redo:()=>restore(after),
   meta:{studio:'studio-core-vnext',scope:'collection'}
  });
  return value;
 }
 function sync(){
  collection.setItems(files.map(entry=>({
   id:entry.id,label:entry.file.name,data:entry.file,size:entry.file.size,
   type:entry.file.type||'Fichier',relativePath:entry.file.webkitRelativePath||''
  })));
  notify();previewActive();
 }
 function addFiles(input){
  const batch=Array.from(input||[]).filter(f=>f instanceof File);
  if(!batch.length)return 0;
  transact('Importer '+batch.length+' fichier(s)',()=>{
   for(const file of batch){
    const entry={id:'core-file-'+(++seq),file};
    entries.set(entry.id,entry);files.push(entry);
   }
   sync();
  });
  history('Import de fichiers',batch.length+' fichier(s)','file');
  return batch.length;
 }
 function clear(){
  if(!files.length)return;
  transact('Vider la collection',()=>{files.length=0;entries.clear();collection.clearSelection();revoke();sync()});
  history('Collection vidée');
 }
 function removeSelected(){
  const ids=new Set(collection.selectedItems().map(i=>i.id));
  if(!ids.size&&active())ids.add(active().id);
  if(!ids.size)return 0;
  transact('Retirer '+ids.size+' fichier(s)',()=>{
   for(let i=files.length-1;i>=0;i--)if(ids.has(files[i].id)){entries.delete(files[i].id);files.splice(i,1)}
   sync();
  });
  history('Fichiers retirés',ids.size+' élément(s)');
  return ids.size;
 }
 async function previewActive(){
  const target=active();
  const file=target?entries.get(target.id)?.file:null;
  revoke();previewHost.replaceChildren();
  if(!file){previewHost.textContent='Aucun fichier actif. Importez puis sélectionnez un fichier.';return}
  const title=document.createElement('p');
  title.className='hint';
  title.textContent=file.name+' · '+humanBytes(file.size)+' · '+(file.type||'type inconnu');
  previewHost.append(title);
  const ext=extension(file.name);
  if(file.type.startsWith('image/')&&ext!=='svg'){
   lastUrl=URL.createObjectURL(file);
   const image=document.createElement('img');image.alt='Prévisualisation de '+file.name;
   image.className='corePreviewImage';image.src=lastUrl;previewHost.append(image);return;
  }
  if(file.type==='application/pdf'||ext==='pdf'){
   lastUrl=URL.createObjectURL(file);
   const frame=document.createElement('iframe');frame.className='corePreviewFrame';
   frame.title='Aperçu PDF : '+file.name;frame.src=lastUrl;previewHost.append(frame);return;
  }
  if(EXTS_TEXT.has(ext)&&file.size<=1048576){
   try{
    const text=await file.text();
    if(collection.activeId!==target.id)return;
    const pre=document.createElement('pre');
    pre.className='corePreviewText';pre.textContent=text.slice(0,25000);previewHost.append(pre);
   }catch{previewHost.append(document.createTextNode('Aperçu texte indisponible.'))}
   return;
  }
  previewHost.append(document.createTextNode('Aucun aperçu compatible pour ce type de fichier.'));
 }
 collection.addEventListener('activate',()=>{previewActive();notify()});
 collection.addEventListener('selection',notify);
 collection.addEventListener('rotate',()=>notify());
 async function saveSelected({name=null}={}){
  const data=selectedFiles();
  if(!data.length)throw Error('Sélectionnez un fichier avant de l’enregistrer.');
  const file=data[0];
  // Name changes are allowed; bytes and MIME type remain unchanged (not conversion).
  const result=await output.saveBlob(file,name||file.name);
  history('Fichier enregistré',result.name,'file');
  return result;
 }
 function destroy(){revoke();collection.resizeObserver?.disconnect?.()}
 const api={collection,addFiles,clear,removeSelected,active,selectedFiles,
  get size(){return files.length},get items(){return collection.items},
  previewActive,saveSelected,destroy,history,loadHistory,output,undo,redo,getUndoRedoState,subscribeUndoRedo};
 sync();
 return api;
}