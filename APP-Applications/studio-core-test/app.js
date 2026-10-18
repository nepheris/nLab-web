import {mountStudioV2} from '../_shared/studio-v2/frame.js';
import {mountCoreLabUx} from './ux-lab.js';
import {resolveStudioVersions} from '../_shared/studio-v2/version-service.js';
import {createFullscreenController} from '../_shared/studio-v2/fullscreen-service.js';
import {createApplicationModeController} from '../_shared/studio-v2/application-mode-service.js';
import {openInputPicker} from '../_shared/studio-v2/input-picker.js';
import {CollectionBrowser} from '../_shared/studio-v2/collection-browser.js';
import {thumbnailFor} from '../_shared/studio-v2/thumbnail-service.js';
import {recordHistory} from '../_shared/studio-v2/history.js';
import {pushUndoRedo,getUndoRedoState,subscribeUndoRedo} from '../_shared/studio-v2/undo-redo.js';

const $=selector=>document.querySelector(selector);
const INITIAL=Object.freeze({
 name:'Composant de démonstration nLab',
 description:'Élément synthétique pour éprouver les fonctions transversales du Studio Core.'
});
const STORAGE='nlab:studio-core-test:manual:v1';
const manifest={
 id:'studio-core-test',
 name:'Studio Core Test Lab',
 subtitle:'Laboratoire des fonctions transversales',
 studioIconHref:new URL('../../assets/branding/nlab-favicon.svg',import.meta.url).href,
 sourcePath:'APP-Applications/studio-core-test/index.html',
 versionsHref:'./versions.html',
 coreFeatures:{acquisition:true},
 menus:[{id:'home',label:'Accueil',scope:'studio'},{id:'file',label:'Fichier',scope:'studio'},{id:'edit',label:'Édition',scope:'studio'},{id:'view',label:'Affichage',scope:'studio'},{id:'tools',label:'Outils',scope:'studio'}],
 ribbon:[{id:'lab-file',label:'Fichier',scope:'studio',items:[
  {id:'lab-ux-save',action:'lab.ux-save',label:'Enregistrer',icon:'save',scope:'studio',status:'stable'},
  {id:'lab-ux-save-as',action:'lab.ux-save-as',label:'Enregistrer sous',icon:'save',scope:'studio',status:'stable'}
 ]},{id:'lab-panels',label:'Panneaux',scope:'studio',items:[
  {id:'lab-ux-files',action:'lab.ux-files',label:'Fichiers',icon:'file',scope:'studio',status:'stable'},
  {id:'lab-ux-history',action:'lab.ux-history',label:'Historique',icon:'history',scope:'studio',status:'stable'},
  {id:'lab-ux-properties',action:'lab.ux-properties',label:'Propriétés',icon:'settings',scope:'studio',status:'stable'}
 ]},{id:'lab-diagnostics',label:'Validation',scope:'studio',items:[
  {id:'lab-run-action',action:'lab.run-checks',label:'Contrôles',icon:'check',scope:'studio',status:'stable'},
  {id:'lab-select-action',action:'lab.select',label:'Sélectionner',icon:'select',scope:'studio',status:'stable'},
  {id:'lab-reset-action',action:'lab.restore',label:'Réinitialiser',icon:'restore',scope:'studio',status:'stable'}
 ]}]
};

function setSample(sample){
 $('#labItemName').value=sample.name;
 $('#labItemDescription').value=sample.description;
 publishSelection('sample');
}
function readSample(){
 return{name:$('#labItemName').value,description:$('#labItemDescription').value};
}
function publishSelection(source='core-lab'){
 const sample=readSample();
 document.dispatchEvent(new CustomEvent('studio-v2:selection-change',{detail:{
  selection:[{name:sample.name}],active:{name:sample.name},scope:'object',kind:'core-test',
  meta:{description:sample.description,synthetic:true},source
 }}));
 $('#labSampleStatus').textContent='Objet sélectionné : '+sample.name;
}
function commitSample(after,label='Modifier l’échantillon'){
 const before=committed;
 if(after.name===before.name&&after.description===before.description){
  $('#labSampleStatus').textContent='Aucune modification à enregistrer.';
  return;
 }
 const next={...after};
 pushUndoRedo({
  label,meta:{studio:'studio-core-test',synthetic:true},
  undo:()=>{committed={...before};setSample(committed);$('#labSampleStatus').textContent='Modification annulée.'},
  redo:()=>{committed={...next};setSample(committed);$('#labSampleStatus').textContent='Modification rétablie.'}
 });
 committed=next;
 setSample(committed);
 $('#labSampleStatus').textContent='Transaction enregistrée dans l’historique du Core.';
}
function updateMetrics(){
 const app=$('[data-studio-action="core.app-mode"]');
 const state=app?.dataset.appMode||'unknown';
 const labels={standalone:'Application installée',installable:'Installation proposée',browser:'Mode navigateur', 'not-configured':'Manifeste absent',unknown:'Indisponible'};
 $('#labApplicationState').textContent=labels[state]||state;
 $('#labFullscreenState').textContent=document.fullscreenElement===document.documentElement?'Actif':'Inactif';
 $('#labViewport').textContent=window.innerWidth+' × '+window.innerHeight;
 $('#labProfile').textContent='Profil Core : '+(document.body.dataset.responsiveProfile||'non détecté');
 const h=getUndoRedoState();
 $('#labHistory').textContent=h.undoDepth+' action(s) · '+h.redoDepth+' à rétablir';
}
let labCollectionBrowser=null;
const TESTS=[
 ['chrome','Chrome commun',()=>Boolean($('#nlabStudioV2Chrome')&&$('.studioHeader')&&$('.studioRibbon'))],
 ['ribbon','Commandes du ruban',()=>Boolean($('[data-studio-action="core.fullscreen"]')&&$('[data-studio-action="core.app-mode"]'))],
 ['fullscreen','Service plein écran partagé',()=>typeof createFullscreenController==='function'&&typeof document.documentElement.requestFullscreen==='function'],
 ['pwa','Service PWA partagé',()=>typeof createApplicationModeController==='function'&&Boolean($('[data-studio-action="core.app-mode"]')?.dataset.appMode)],
 ['settings','Paramètres Core',()=>Boolean($('#studioCoreSettings')&&$('#studioCoreSettingsPanel'))],
 ['commands','Palette de commandes',()=>Boolean(window.NLABStudioCommands?.get?.('core.fullscreen')&&window.NLABStudioCommands?.get?.('core.app-mode'))],
 ['undo','Annuler / Rétablir Core',()=>typeof window.NLABStudioUndoRedo?.undo==='function'&&typeof window.NLABStudioUndoRedo?.redo==='function'],
 ['responsive','Lanceur Responsive',()=>Boolean($('[data-studio-action="core.responsive-test"]'))],
 ['version','Version Core issue du référentiel',()=>Boolean(document.body.dataset.studioCoreVersion)],
 ['storage','Stockage local navigateur',()=>{try{const k='nlab:core-lab:storage-probe';localStorage.setItem(k,'ok');const ok=localStorage.getItem(k)==='ok';localStorage.removeItem(k);return ok}catch{return false}}],
 ['acquisition','Acquisition Core partagée',()=>typeof openInputPicker==='function'&&Boolean($('#labPickerOpen'))],
 ['thumbnail-controls','Zoom, ajustement auto et rotation des vignettes',()=>Boolean(labCollectionBrowser?.thumbnailTools&&typeof labCollectionBrowser?.setThumbnailSize==='function'&&typeof labCollectionBrowser?.rotate==='function'&&$('#labThumbAuto')&&$('#labThumbPlus')&&$('#labThumbMinus'))],
 ['workspace-ux','Espace de travail UX mutualisé',()=>Boolean($('#studioMain.studioUx')&&$('#studioUxWorkBody')&&$('#studioUxSideTitle')&&$('#uxSaveDialog')&&$('#uxPreviewCanvas'))],
 ['history-nav','Navigation historique Core',()=>Boolean($('#studioCoreRail [data-core-rail="history"]'))],
 ['manifest','Manifeste PWA accessible',async()=>{const link=$('link[rel="manifest"]');if(!link)return false;const response=await fetch(link.href,{cache:'no-store'});if(!response.ok)return false;const data=await response.json();return data.display==='standalone'&&data.start_url==='./'}]
];
async function runChecks(){
 const result=await Promise.all(TESTS.map(async([id,label,check])=>{
  try{return{id,label,pass:Boolean(await check())}}catch(e){return{id,label,pass:false,error:String(e.message||e)}}
 }));
 const list=$('#labCheckList');
 list.replaceChildren(...result.map(item=>{
  const li=document.createElement('li');li.className=item.pass?'pass':'fail';
  const mark=document.createElement('span');mark.textContent=item.pass?'✓':'!';
  const name=document.createElement('span');name.textContent=item.label;
  const state=document.createElement('small');state.textContent=item.pass?'PASS':(item.error||'À vérifier');
  li.append(mark,name,state);return li;
 }));
 const passed=result.filter(r=>r.pass).length;
 $('#labCheckSummary').textContent=passed+'/'+result.length+' contrôles techniques PASS. Les tests de navigation, installation et rendu visuel exigent une recette humaine.';
 document.documentElement.dataset.coreLabChecks=passed===result.length?'pass':'partial';
 updateMetrics();
 return result;
}
function initManualChecks(){
 let saved={};
 try{saved=JSON.parse(localStorage.getItem(STORAGE)||'{}')}catch{}
 const checks=[...document.querySelectorAll('[data-manual]')];
 for(const input of checks){
  input.checked=saved[input.dataset.manual]===true;
  input.addEventListener('change',()=>{
   saved[input.dataset.manual]=input.checked;
   try{localStorage.setItem(STORAGE,JSON.stringify(saved))}catch{}
   summary();
  });
 }
 function summary(){
  const passed=checks.filter(input=>input.checked).length;
  $('#labManualSummary').textContent=passed+'/'+checks.length+' contrôles déclarés validés sur cet appareil.';
 }
 summary();
}

let committed={...INITIAL};
try{
 const versionInfo=await resolveStudioVersions({
  versionsHref:new URL('./versions.json',import.meta.url).href,
  coreVersionHref:new URL('../_shared/studio-v2/version.json',import.meta.url).href,
  channel:'test',sourcePath:manifest.sourcePath
 });
 await mountStudioV2({manifest,versionInfo});
 let acquiredFiles=[],collectionSerial=0,rotationUndo=false;
 const collection=new CollectionBrowser({host:$('#labCollection'),key:'core-lab-v3.5',view:'thumbs',thumbnailTools:true,getThumbnail:item=>thumbnailFor(item.data)});
 labCollectionBrowser=collection;
 function updateCollectionControls(){
  const size=collection.thumbnailSize;
  $('#labThumbSize').textContent=size==='auto'?'Auto':size+' px';
  for(const view of ['list','grid','thumbs'])$('#labView'+view[0].toUpperCase()+view.slice(1)).setAttribute('aria-pressed',String(collection.view===view));
  $('#labCollectionSort').value=collection.sortMode;
  const active=collection.active();
  $('#labCollectionInfo').textContent=collection.items.length+' fichier(s) · '+collection.selectedItems().length+' sélectionné(s) · actif : '+(active?.label||'aucun')+(active?.meta?.rotation?' · orientation '+active.meta.rotation+'°':'')+'. La rotation ne modifie pas le fichier source.';
 }
 function publishCollection(source='core-lab-collection'){
  const active=collection.active(),selected=collection.selectedItems();
  if(active)document.dispatchEvent(new CustomEvent('studio-v2:selection-change',{detail:{
   active:active.data,selection:selected.map(x=>x.data),scope:'collection',kind:'file',source,
   meta:{name:active.label,count:collection.items.length,selectedCount:selected.length,rotation:active.meta.rotation||0}
  }}));
  updateCollectionControls();
 }
 function appendFiles(files){
  const valid=Array.from(files||[]).filter(f=>f instanceof File);if(!valid.length)return;
  acquiredFiles=[...acquiredFiles,...valid];
  const next=valid.map(f=>({id:'lab-file-'+(++collectionSerial),label:f.name,data:f,relativePath:f.webkitRelativePath||f.__relativePath||f.name}));
  collection.setItems([...collection.items,...next]);
  for(const x of next)collection.selected.add(x.id);
  collection.activate(next[0].id);
  collection.render();publishCollection('import');
  $('#labAcquiredInfo').textContent=acquiredFiles.length+' fichier(s) importé(s). Utilisez Liste/Grille/Vignettes et −/+ ou Auto.';
  $('#labPickedFiles').replaceChildren(...acquiredFiles.map(f=>{const li=document.createElement('li');li.textContent=f.name+' — '+(f.size/1024).toFixed(1)+' Ko';return li}));
  recordHistory({studio:'studio-core-test',type:'file',label:valid.length+' fichier(s) ajoutés',detail:'collection-browser',target:valid.map(f=>f.name).join(', ').slice(0,500)});
 }
 collection.addEventListener('selection',()=>publishCollection('selection'));
 collection.addEventListener('activate',()=>publishCollection('activate'));
 collection.addEventListener('rotate',e=>{
  const {item,rotation,delta}=e.detail;
  if(!rotationUndo){
   pushUndoRedo({label:'Tourner '+item.label+' '+(delta>0?'+':'')+delta+'°',meta:{studio:'studio-core-test',thumbnail:true},
    undo:()=>{rotationUndo=true;try{collection.rotate(item.id,-delta)}finally{rotationUndo=false}},
    redo:()=>{rotationUndo=true;try{collection.rotate(item.id,delta)}finally{rotationUndo=false}}});
  }
  publishCollection('rotate');
 });
 for(const [id,view] of [['labViewList','list'],['labViewGrid','grid'],['labViewThumbs','thumbs']])$(('#'+id)).addEventListener('click',()=>{collection.setView(view);updateCollectionControls()});
 function changeThumb(delta){const base=collection.thumbnailSize==='auto'?(parseInt(collection.host.style.getPropertyValue('--nlab-collection-card-width'),10)||160):Number(collection.thumbnailSize);collection.setThumbnailSize(base+delta);if(collection.view==='list')collection.setView('thumbs');updateCollectionControls()}
 $('#labThumbPlus').addEventListener('click',()=>changeThumb(24));
 $('#labThumbMinus').addEventListener('click',()=>changeThumb(-24));
 $('#labThumbAuto').addEventListener('click',()=>{collection.setThumbnailSize('auto');updateCollectionControls()});
 $('#labCollectionSort').addEventListener('change',e=>{collection.setSort(e.target.value);updateCollectionControls()});
 $('#labSelectAllFiles').addEventListener('click',()=>collection.selectAll());
 $('#labInvertFiles').addEventListener('click',()=>{const before=new Set(collection.selected);for(const item of collection.items)before.has(item.id)?collection.selected.delete(item.id):collection.selected.add(item.id);collection.render();publishCollection('invert')});
 const drop=$('#labCollectionDrop'),native=$('#labFilesNative');
 drop.addEventListener('click',()=>native.click());
 drop.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();native.click()}});
 native.addEventListener('change',()=>{appendFiles(native.files);native.value=''});
 for(const name of ['dragenter','dragover'])drop.addEventListener(name,e=>{e.preventDefault();drop.classList.add('dragOver')});
 for(const name of ['dragleave','dragend'])drop.addEventListener(name,e=>{e.preventDefault();drop.classList.remove('dragOver')});
 drop.addEventListener('drop',e=>{e.preventDefault();drop.classList.remove('dragOver');appendFiles(e.dataTransfer?.files)});
 updateCollectionControls();
 const labUx=mountCoreLabUx({main:$('#studioMain'),collection});
 const openAcquisition=async()=>{
  try{
   const selected=await openInputPicker({multiple:true,folders:true,url:true,preserveSession:true,view:'icon'});
   if(!selected)return;
   appendFiles(selected);
  }catch(error){$('#labAcquiredInfo').textContent='Sélection impossible : '+(error.message||error)}
 };
 $('#labPickerOpen').addEventListener('click',openAcquisition);
 document.addEventListener('studio-v2:action',e=>{
  if(e.detail?.action==='core.acquire')openAcquisition();
 });
 $('#labCoreVersion').textContent='Core '+(versionInfo.coreVersion||'—');
 document.documentElement.dataset.coreLabReady='1';
 $('#labResponsiveLink').href=new URL('../responsive-test-studio/?url='+encodeURIComponent(location.href),location.href).href;
 $('#labRunChecks').addEventListener('click',runChecks);
 $('#labCommit').addEventListener('click',()=>commitSample(readSample()));
 $('#labSelect').addEventListener('click',()=>publishSelection('manual'));
 $('#labRestore').addEventListener('click',()=>commitSample({...INITIAL},'Restaurer le modèle'));
 $('#labOpenSettings').addEventListener('click',()=>$('#studioCoreSettings')?.click());
 $('#labAppGuide').addEventListener('click',()=>{
  const state=$('[data-studio-action="core.app-mode"]')?.dataset.appMode||'unknown';
  $('#labSampleStatus').textContent={
   standalone:'Application installée et ouverte dans sa propre fenêtre.',
   installable:'Le navigateur propose une installation. Utilisez le bouton « Installer l’application » du ruban.',
   browser:'PWA configurée ; aucune invite d’installation reçue. Consultez le menu de Chrome ou Edge.',
   'not-configured':'Manifeste PWA manquant : installation impossible sans migration.'
  }[state]||'Statut du navigateur non déterminé.';
 });
 document.addEventListener('studio-v2:action',event=>{
  const action=event.detail?.action;
  if(action==='lab.run-checks')runChecks();
  if(action==='lab.select')publishSelection('ribbon');
  if(action==='lab.restore')commitSample({...INITIAL},'Restaurer le modèle');
 });
 document.addEventListener('studio-v2:menu',event=>{
  const target={diagnostic:'#labRunChecks',acquisition:'#labAcquisitionPanel',specimen:'#labItemName',validation:'#labManual'}[event.detail?.tab];
  if(target)$(target)?.scrollIntoView({behavior:'smooth',block:'nearest'});
 });
 window.addEventListener('resize',updateMetrics);
 document.addEventListener('fullscreenchange',updateMetrics);
 document.addEventListener('studio-v2:app-mode-state',updateMetrics);
 subscribeUndoRedo(updateMetrics);
 initManualChecks();
 publishSelection('ready');
 updateMetrics();
 await runChecks();
 window.NLabCoreLab={runChecks,getSample:readSample,getHistory:getUndoRedoState,versionInfo,collection,labUx};
}catch(error){
 document.documentElement.dataset.coreLabReady='error';
 $('#labCheckSummary').textContent='Initialisation du Core impossible : '+(error.message||error);
 console.error('Studio Core Test Lab',error);
}
