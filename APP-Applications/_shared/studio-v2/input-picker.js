import{enhanceStudioWindow}from'./window-system.js';

const esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const asset=(group,name)=>new URL(`../../../assets/icons/${group}/${name}`,import.meta.url).href;
const FILETYPE_ICONS=new Set(['7z','avif','bmp','csv','doc','docx','epub','flac','gif','heic','html','ico','jpeg','jpg','json','markdown','mobi','mov','mp3','mp4','odp','ods','odt','parquet','pdf','png','ppt','pptx','sql','svg','tar','tif','tiff','tsv','txt','wav','webm','webp','xls','xlsx','xml','yaml','zip']);
let sessionFiles=[];
let sessionSelected=new Set();
let state={files:[],options:{},resolve:null,view:'text',meta:new Map(),busy:false,selected:new Set(),active:null,sortBy:'order',sortDir:'asc',groupBy:'none',thumbScale:1,textScale:1};
let pdfJsPromise=null,pdfLibPromise=null,jsZipPromise=null;

function keyOf(f){return [f.webkitRelativePath||f.__relativePath||'',f.name,f.size,f.lastModified].join('|')}
function dedupe(files){const seen=new Set(),out=[];for(const f of files){const k=keyOf(f);if(seen.has(k))continue;seen.add(k);out.push(f)}return out}
function extOf(f){const m=String(f?.name||'').toLowerCase().match(/\.([a-z0-9]+)$/);return m?m[1]:''}
function kindOf(f){
 const e=extOf(f),t=String(f?.type||'').toLowerCase();
 if(e==='pdf'||t==='application/pdf')return'pdf';
 if(t.startsWith('image/')||['png','jpg','jpeg','gif','webp','bmp','svg','tif','tiff','avif','heic','ico'].includes(e))return'image';
 if(t.startsWith('audio/')||['mp3','wav','flac','ogg','m4a','aac'].includes(e))return'audio';
 if(t.startsWith('video/')||['mp4','webm','mov','mkv','avi'].includes(e))return'video';
 if(['xls','xlsx','ods','csv','tsv','parquet'].includes(e))return'spreadsheet';
 if(['ppt','pptx','odp'].includes(e))return'presentation';
 if(['zip','7z','tar','gz','rar'].includes(e))return'archive';
 if(['html','htm','css','js','ts','json','xml','yaml','yml','sql','py','java','c','cpp'].includes(e))return'code';
 if(['doc','docx','odt','txt','md','rtf','epub'].includes(e))return'document';
 return'file'
}
function typeLabel(f){return(extOf(f)||kindOf(f)||'fichier').toUpperCase()}
function iconName(f){
 const e=extOf(f);if(FILETYPE_ICONS.has(e))return e+'.svg';
 const k=kindOf(f),m={image:'generic-image.svg',audio:'generic-audio.svg',video:'generic-video.svg',spreadsheet:'generic-spreadsheet.svg',presentation:'generic-presentation.svg',archive:'generic-archive.svg',code:'generic-code.svg',document:'generic-document.svg'};
 return m[k]||'generic-document.svg' /* canonical generic file SVG fallback */
}
function rotationOf(f){return((Number(f?.__nlabRotation||0)%360)+360)%360}
function setRotation(f,deg){try{Object.defineProperty(f,'__nlabRotation',{value:((deg%360)+360)%360,writable:true,configurable:true})}catch{}}
function relativePathOf(f){return String(f.webkitRelativePath||f.__relativePath||f.name||'')}
function folderPathOf(f){const p=relativePathOf(f);return p.includes('/')?p.split('/').slice(0,-1).join('/'):''}
function folderRoot(f){const p=relativePathOf(f);return p.includes('/')?p.split('/')[0]:''}
function isSelected(f){return state.selected.has(keyOf(f))}
function selectedFiles(){return state.files.filter(isSelected)}
function setAllSelected(value){state.selected=new Set(value?state.files.map(keyOf):[]);if(value&&!state.active&&state.files[0])state.active=keyOf(state.files[0])}
function syncSession(){if(state.options.preserveSession===false)return;sessionFiles=[...state.files];sessionSelected=new Set(state.selected)}
function orderedFiles(){
 const rows=state.files.map((f,i)=>({f,i})),dir=state.sortDir==='desc'?-1:1;
 const val=(f)=>{const m=metaFor(f);if(state.sortBy==='name')return String(f.name||'').toLocaleLowerCase();if(state.sortBy==='path')return relativePathOf(f).toLocaleLowerCase();if(state.sortBy==='type')return typeLabel(f);if(state.sortBy==='size')return Number(f.size||0);if(state.sortBy==='pages')return Number(m.pages||0);return rows.findIndex(x=>x.f===f)};
 if(state.sortBy!=='order')rows.sort((a,b)=>{const av=val(a.f),bv=val(b.f);return(typeof av==='number'&&typeof bv==='number'?(av-bv):String(av).localeCompare(String(bv),'fr',{numeric:true,sensitivity:'base'}))*dir});
 else if(dir<0)rows.reverse();return rows
}
function groupKey(f){if(state.groupBy==='folder')return folderPathOf(f)||'Sans dossier';if(state.groupBy==='type')return typeLabel(f);return''}
function formatKb(n){return Math.max(1,Math.round(Number(n||0)/1024))+' Ko'}
function canRotate(f){return['image','pdf'].includes(kindOf(f))}
function metaFor(f){const k=keyOf(f);if(!state.meta.has(k))state.meta.set(k,{pages:null,thumb:null,loading:false,error:null});return state.meta.get(k)}

function loadScript(src,test){
 if(test())return Promise.resolve();
 return new Promise((resolve,reject)=>{
  const existing=[...document.scripts].find(s=>s.src===src);
  if(existing){existing.addEventListener('load',()=>resolve(),{once:true});existing.addEventListener('error',reject,{once:true});return}
  const s=document.createElement('script');s.src=src;s.onload=()=>resolve();s.onerror=reject;document.head.append(s)
 })
}
async function ensurePdfJs(){
 if(window.pdfjsLib)return window.pdfjsLib;
 if(!pdfJsPromise)pdfJsPromise=loadScript('https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js',()=>!!window.pdfjsLib).then(()=>{
  window.pdfjsLib.GlobalWorkerOptions.workerSrc='https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';return window.pdfjsLib
 });
 return pdfJsPromise
}
async function ensurePdfLib(){
 if(window.PDFLib)return window.PDFLib;
 if(!pdfLibPromise)pdfLibPromise=loadScript('https://cdn.jsdelivr.net/npm/pdf-lib@1.17.1/dist/pdf-lib.min.js',()=>!!window.PDFLib).then(()=>window.PDFLib);
 return pdfLibPromise
}
async function ensureJsZip(){
 if(window.JSZip)return window.JSZip;
 if(!jsZipPromise)jsZipPromise=loadScript('https://cdn.jsdelivr.net/npm/jszip@3.10.1/dist/jszip.min.js',()=>!!window.JSZip).then(()=>window.JSZip);
 return jsZipPromise
}
function fileNameFromUrl(url,contentType=''){
 try{const u=new URL(url,location.href),raw=decodeURIComponent(u.pathname.split('/').filter(Boolean).pop()||'import-url');if(/\.[a-z0-9]{1,8}$/i.test(raw))return raw;const ext={'application/pdf':'.pdf','application/json':'.json','text/plain':'.txt','text/html':'.html','image/png':'.png','image/jpeg':'.jpg','image/webp':'.webp','image/svg+xml':'.svg'}[String(contentType).split(';')[0].toLowerCase()]||'';return raw+ext}catch{return'import-url'}
}
async function fileFromUrl(url){
 const value=String(url||'').trim();if(!value)throw new Error('URL_REQUIRED');
 let r;try{r=await fetch(value,{mode:'cors'})}catch{throw new Error('URL_IMPORT_BLOCKED_CORS')}
 if(!r.ok)throw new Error('URL_IMPORT_HTTP_'+r.status);
 const blob=await r.blob(),name=fileNameFromUrl(value,blob.type),file=new File([blob],name,{type:blob.type,lastModified:Date.now()});
 try{Object.defineProperty(file,'__sourceUrl',{value:value,configurable:true})}catch{}return file
}
async function extractZip(file){
 const JSZip=await ensureJsZip(),zip=await JSZip.loadAsync(await file.arrayBuffer()),out=[],entries=Object.entries(zip.files).filter(([,entry])=>!entry.dir),maxEntries=Number(state.options.maxArchiveEntries||500),maxBytes=Number(state.options.maxArchiveBytes||250*1024*1024);let total=0;
 if(entries.length>maxEntries)throw new Error('Archive trop volumineuse : '+entries.length+' fichiers (limite '+maxEntries+').');
 for(const [path,entry] of entries){const blob=await entry.async('blob');total+=blob.size;if(total>maxBytes)throw new Error('Archive décompressée trop volumineuse (limite '+Math.round(maxBytes/1024/1024)+' Mo).');const name=path.split('/').pop()||'file',child=new File([blob],name,{type:blob.type,lastModified:file.lastModified});try{Object.defineProperty(child,'__relativePath',{value:file.name+'/'+path,configurable:true})}catch{}out.push(child)}
 return out
}
async function normalizeIncoming(files){
 const out=[];for(const f of files||[]){if(extOf(f)==='zip'&&state.options.expandZip!==false){try{out.push(...await extractZip(f))}catch(e){state.error='ZIP : '+(e?.message||e)}}else out.push(f)}return out
}
async function imageThumb(file){
 const url=URL.createObjectURL(file);try{
  const im=await new Promise((res,rej)=>{const x=new Image();x.onload=()=>res(x);x.onerror=rej;x.src=url});
  const maxW=180,maxH=130,ratio=Math.min(maxW/im.naturalWidth,maxH/im.naturalHeight,1),w=Math.max(1,Math.round(im.naturalWidth*ratio)),h=Math.max(1,Math.round(im.naturalHeight*ratio));
  const c=document.createElement('canvas');c.width=w;c.height=h;c.getContext('2d').drawImage(im,0,0,w,h);return c.toDataURL('image/jpeg',.55)
 }finally{URL.revokeObjectURL(url)}
}
async function pdfInfo(file){
 const lib=await ensurePdfJs(),task=lib.getDocument({data:new Uint8Array(await file.arrayBuffer())}),doc=await task.promise,page=await doc.getPage(1),vp=page.getViewport({scale:.25});
 const scale=Math.min(180/vp.width,130/vp.height,1),view=page.getViewport({scale:.25*scale}),c=document.createElement('canvas');c.width=Math.max(1,Math.ceil(view.width));c.height=Math.max(1,Math.ceil(view.height));
 await page.render({canvasContext:c.getContext('2d'),viewport:view}).promise;
 const out={pages:doc.numPages,thumb:c.toDataURL('image/jpeg',.55)};try{await doc.destroy()}catch{}return out
}
async function analyzeFile(file){
 const m=metaFor(file);if(m.loading||m.thumb||m.error)return;m.loading=true;render();
 try{
  if(kindOf(file)==='image')m.thumb=await imageThumb(file);
  else if(kindOf(file)==='pdf'){const p=await pdfInfo(file);m.thumb=p.thumb;m.pages=p.pages}
 }catch(e){m.error=e?.message||String(e)}finally{m.loading=false;render()}
}
async function analyzeVisible(){
 if(state.view!=='preview')return;
 await Promise.allSettled(state.files.filter(f=>['image','pdf'].includes(kindOf(f))).map(analyzeFile))
}
async function fileEntry(entry,path=''){
 return new Promise((resolve,reject)=>entry.file(file=>{try{Object.defineProperty(file,'__relativePath',{value:path+file.name,configurable:true})}catch{}resolve(file)},reject))
}
async function readDirectory(entry,path=''){
 const reader=entry.createReader(),entries=[];while(true){const batch=await new Promise((res,rej)=>reader.readEntries(res,rej));if(!batch.length)break;entries.push(...batch)}
 const out=[];for(const child of entries){if(child.isFile)out.push(await fileEntry(child,path));else if(child.isDirectory)out.push(...await readDirectory(child,path+child.name+'/'))}return out
}
async function filesFromDrop(dt){
 const items=[...(dt?.items||[])],out=[];if(items.length&&items.some(x=>x.webkitGetAsEntry)){
  for(const item of items){const entry=item.webkitGetAsEntry?.();if(!entry)continue;if(entry.isFile)out.push(await fileEntry(entry,''));else if(entry.isDirectory)out.push(...await readDirectory(entry,entry.name+'/'))}
 }else out.push(...[...(dt?.files||[])]);
 return dedupe(out)
}
function ensure(){
 let host=document.querySelector('#studioInputPicker');if(host)return host;
 host=document.createElement('div');host.id='studioInputPicker';host.className='studioInputPicker studioWindow scope-core';host.dataset.scope='core';host.hidden=true;
 host.innerHTML='<div class="studioInputPickerBody">'+
 '<div class="inputPickerActions"><button id="studioInputPickFiles" type="button">Fichier(s)</button><button id="studioInputPickFolder" type="button">Dossier</button><button id="studioInputPickCamera" type="button">Photo</button><button id="studioInputClear" type="button">Tout effacer</button><span class="inputPickerSpacer"></span><div class="inputPickerViews" role="group" aria-label="Mode d’affichage"><button type="button" data-input-view="text">Liste</button><button type="button" data-input-view="icon">Icônes</button><button type="button" data-input-view="preview">Vignettes</button></div></div>'+ 
 '<div class="inputPickerCollectionBar"><button type="button" data-input-select-all>Tout sélectionner</button><button type="button" data-input-select-none>Tout désélectionner</button><span data-input-selection-count>0 sélectionné</span><label>Tri <select data-input-sort><option value="order">Ordre</option><option value="name">Nom</option><option value="path">Chemin</option><option value="type">Type</option><option value="size">Taille</option><option value="pages">Pages</option></select></label><button type="button" data-input-sort-dir title="Inverser le tri">A→Z</button><label>Grouper <select data-input-group><option value="none">Aucun</option><option value="folder">Dossier</option><option value="type">Type</option></select></label><label class="inputPickerScale">Vignettes <input data-input-thumb-scale type="range" min="0.7" max="1.8" step="0.1" value="1"><output data-input-thumb-output>100 %</output></label><label class="inputPickerScale">Texte <input data-input-text-scale type="range" min="0.8" max="1.5" step="0.1" value="1"><output data-input-text-output>100 %</output></label></div>'+
 '<input id="studioInputFilesNative" type="file" multiple hidden><input id="studioInputFolderNative" type="file" webkitdirectory multiple hidden><input id="studioInputCameraNative" type="file" accept="image/*" capture="environment" hidden>'+
 '<div class="inputPickerUrlRow"><input id="studioInputUrl" type="url" inputmode="url" placeholder="https://… image, PDF, texte, JSON…"><button id="studioInputUrlImport" type="button">Importer URL</button></div>'+
 '<div id="studioInputDrop" class="studioInputDrop" tabindex="0" role="button"><strong>Glisser-déposer</strong><span>Fichiers, dossiers ou ZIP</span></div>'+
 '<div class="inputPickerMeta"><strong id="studioInputCount">0 élément</strong><span id="studioInputAccept"></span></div>'+
 '<div id="studioInputList" class="studioInputList"></div>'+
 '<div class="inputPickerFooter"><button id="studioInputCancel" type="button">Annuler</button><button id="studioInputConfirm" class="primary" type="button">Utiliser la sélection</button></div>'+
 '</div>';
 document.body.append(host);enhanceStudioWindow(host,{key:'core-input-picker',title:'Choisir une entrée'});
 const fileInput=host.querySelector('#studioInputFilesNative'),folderInput=host.querySelector('#studioInputFolderNative'),cameraInput=host.querySelector('#studioInputCameraNative'),drop=host.querySelector('#studioInputDrop');
 host.querySelector('#studioInputPickFiles').onclick=()=>fileInput.click();host.querySelector('#studioInputPickFolder').onclick=()=>folderInput.click();host.querySelector('#studioInputPickCamera').onclick=()=>cameraInput.click();
 fileInput.onchange=async e=>await add([...e.target.files]);folderInput.onchange=async e=>await add([...e.target.files]);cameraInput.onchange=async e=>await add([...e.target.files]);
 host.querySelector('#studioInputUrlImport').onclick=async()=>{const input=host.querySelector('#studioInputUrl');state.error='';render(host);try{await add([await fileFromUrl(input.value)]);input.value=''}catch(e){state.error=e?.message||String(e);render(host)}};
 host.querySelector('#studioInputClear').onclick=()=>{state.files=[];state.selected.clear();state.active=null;state.meta.clear();syncSession();render(host)};
 host.querySelector('#studioInputCancel').onclick=()=>close(null);
 host.querySelector('#studioInputConfirm').onclick=async()=>{if(state.busy)return;const chosen=selectedFiles();state.busy=true;render(host);try{syncSession();close(await materializeSelection(chosen))}catch(e){state.busy=false;const a=host.querySelector('#studioInputAccept');if(a)a.textContent='Erreur : '+(e?.message||e);render(host)}};
 host.querySelector('.inputPickerViews').onclick=e=>{const b=e.target.closest('[data-input-view]');if(!b)return;state.view=b.dataset.inputView;try{localStorage.setItem('nlab.inputPicker.view',state.view)}catch{}render(host);analyzeVisible()};
 host.querySelector('[data-input-select-all]').onclick=()=>{setAllSelected(true);render(host)};host.querySelector('[data-input-select-none]').onclick=()=>{setAllSelected(false);render(host)};
 host.querySelector('[data-input-sort]').onchange=e=>{state.sortBy=e.target.value;render(host)};host.querySelector('[data-input-sort-dir]').onclick=()=>{state.sortDir=state.sortDir==='asc'?'desc':'asc';render(host)};host.querySelector('[data-input-group]').onchange=e=>{state.groupBy=e.target.value;render(host)};
 host.querySelector('[data-input-thumb-scale]').oninput=e=>{state.thumbScale=Number(e.target.value)||1;render(host)};host.querySelector('[data-input-text-scale]').oninput=e=>{state.textScale=Number(e.target.value)||1;render(host)};
 drop.onclick=()=>fileInput.click();drop.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();fileInput.click()}};
 for(const ev of ['dragenter','dragover'])drop.addEventListener(ev,e=>{e.preventDefault();drop.classList.add('dragover')});
 for(const ev of ['dragleave','drop'])drop.addEventListener(ev,e=>{e.preventDefault();drop.classList.remove('dragover')});
 drop.addEventListener('drop',async e=>{drop.classList.add('loading');try{await add(await filesFromDrop(e.dataTransfer))}finally{drop.classList.remove('loading')}});
 host.querySelector('#studioInputList').onclick=e=>{
  const check=e.target.closest('[data-input-select]');if(check){const i=Number(check.dataset.inputSelect),f=state.files[i];if(!f)return;const k=keyOf(f);if(check.checked)state.selected.add(k);else state.selected.delete(k);state.active=k;syncSession();render(host);return}
  const card=e.target.closest('[data-input-item]');if(card&&!e.target.closest('button,input,select,label')){const i=Number(card.dataset.inputItem),f=state.files[i];if(f){state.active=keyOf(f);render(host)}return}
  const rm=e.target.closest('[data-input-remove]');if(rm){const i=Number(rm.dataset.inputRemove),f=state.files[i];if(f){state.meta.delete(keyOf(f));state.selected.delete(keyOf(f));if(state.active===keyOf(f))state.active=null}state.files.splice(i,1);syncSession();render(host);return}
  const rot=e.target.closest('[data-input-rotate]');if(rot){const i=Number(rot.dataset.inputIndex),f=state.files[i];if(!f)return;setRotation(f,rotationOf(f)+Number(rot.dataset.inputRotate));render(host);return}
 };
 host.addEventListener('studio-window-close',()=>close(null));return host
}
function accepted(f){
 const a=String(state.options.accept||'').trim();if(!a)return true;
 const parts=a.split(',').map(x=>x.trim().toLowerCase()).filter(Boolean),name=String(f.name||'').toLowerCase(),type=String(f.type||'').toLowerCase();
 return parts.some(x=>x.startsWith('.')?name.endsWith(x):x.endsWith('/*')?type.startsWith(x.slice(0,-1)):type===x)
}
async function add(files){state.busy=true;state.error='';render(ensure());try{const normalized=await normalizeIncoming(files),next=normalized.filter(accepted);state.files=dedupe([...(state.options.multiple===false?[]:state.files),...next]);if(state.options.multiple===false&&state.files.length>1)state.files=state.files.slice(-1);for(const f of next)state.selected.add(keyOf(f));if(!state.active&&state.files[0])state.active=keyOf(state.files[0]);syncSession()}finally{state.busy=false;render(ensure());analyzeVisible()}}
function folderSummaries(){
 const m=new Map();for(const f of state.files){const root=folderRoot(f);if(!root)continue;const v=m.get(root)||{name:root,count:0,size:0};v.count++;v.size+=Number(f.size||0);m.set(root,v)}return[...m.values()]
}
function fileActions(f,i){
 const rot=canRotate(f)?'<button type="button" data-input-rotate="-90" data-input-index="'+i+'" title="Tourner de 90° à gauche" aria-label="Tourner de 90° à gauche">↶</button><button type="button" data-input-rotate="90" data-input-index="'+i+'" title="Tourner de 90° à droite" aria-label="Tourner de 90° à droite">↷</button>':'';
 return '<div class="studioInputItemActions"><label class="studioInputSelect" title="Sélectionner"><input type="checkbox" data-input-select="'+i+'" '+(isSelected(f)?'checked':'')+' aria-label="Sélectionner '+esc(f.name)+'"></label>'+rot+'<button type="button" data-input-remove="'+i+'" aria-label="Retirer '+esc(f.name)+'" title="Supprimer">×</button></div>'
}
function textItem(f,i){
 const m=metaFor(f),pages=m.pages?' · '+m.pages+' page'+(m.pages>1?'s':''):'',path=f.webkitRelativePath||f.__relativePath||'';
 return '<div class="studioInputItem studioInputTextItem '+(state.active===keyOf(f)?'active':'')+'" data-input-item="'+i+'"><img class="studioInputTypeIcon" src="'+asset('filetype',iconName(f))+'" alt=""><div><strong>'+esc(f.name)+'</strong><small>'+typeLabel(f)+' · '+formatKb(f.size)+pages+(path?' · '+esc(path):'')+'</small></div>'+fileActions(f,i)+'</div>'
}
function iconItem(f,i){
 const m=metaFor(f),pages=m.pages?'<span>'+m.pages+' p.</span>':'';
 return '<div class="studioInputCard '+(state.active===keyOf(f)?'active':'')+'" data-input-item="'+i+'"><div class="studioInputVisual"><img class="studioInputFileIcon" src="'+asset('filetype',iconName(f))+'" alt=""><span class="studioInputTypeBadge">'+typeLabel(f)+'</span></div><strong title="'+esc(f.name)+'">'+esc(f.name)+'</strong><small>'+formatKb(f.size)+' '+pages+'<br>'+esc(folderPathOf(f))+'</small>'+fileActions(f,i)+'</div>'
}
function previewItem(f,i){
 const m=metaFor(f),rot=rotationOf(f),visual=m.thumb?'<img class="studioInputThumb" src="'+m.thumb+'" alt="Aperçu de '+esc(f.name)+'" style="transform:rotate('+rot+'deg)">':m.loading?'<div class="studioInputThumbLoading">Aperçu…</div>':'<img class="studioInputFileIcon" src="'+asset('filetype',iconName(f))+'" alt="">';
 const pages=m.pages?'<span>'+m.pages+' page'+(m.pages>1?'s':'')+'</span>':'';
 return '<div class="studioInputCard studioInputPreviewCard '+(state.active===keyOf(f)?'active':'')+'" data-input-item="'+i+'"><div class="studioInputVisual">'+visual+'<span class="studioInputTypeBadge">'+typeLabel(f)+'</span></div><strong title="'+esc(f.name)+'">'+esc(f.name)+'</strong><small><span>'+formatKb(f.size)+'</span>'+pages+'<span>'+esc(folderPathOf(f))+'</span></small>'+fileActions(f,i)+'</div>'
}
function render(host=ensure()){
 const list=host.querySelector('#studioInputList'),count=host.querySelector('#studioInputCount'),accept=host.querySelector('#studioInputAccept'),selected=selectedFiles();
 count.textContent=state.files.length+' élément'+(state.files.length>1?'s':'')+' · '+selected.length+' sélectionné'+(selected.length>1?'s':'');accept.textContent=state.error?state.error:(state.options.accept?'Formats : '+state.options.accept:'Tous formats');accept.classList.toggle('inputPickerError',!!state.error);
 host.querySelector('#studioInputPickFolder').hidden=state.options.folders===false;host.querySelector('#studioInputPickCamera').hidden=state.options.camera!==true;host.querySelector('.inputPickerUrlRow').hidden=state.options.url===false;host.querySelector('#studioInputFilesNative').accept=state.options.accept||'';host.querySelector('#studioInputFilesNative').multiple=state.options.multiple!==false;
 host.querySelectorAll('[data-input-view]').forEach(b=>b.classList.toggle('active',b.dataset.inputView===state.view));
 host.querySelector('[data-input-selection-count]').textContent=selected.length+' sélectionné'+(selected.length>1?'s':'');host.querySelector('[data-input-sort]').value=state.sortBy;host.querySelector('[data-input-group]').value=state.groupBy;host.querySelector('[data-input-sort-dir]').textContent=state.sortDir==='asc'?'A→Z':'Z→A';host.querySelector('[data-input-thumb-scale]').value=String(state.thumbScale);host.querySelector('[data-input-text-scale]').value=String(state.textScale);host.querySelector('[data-input-thumb-output]').textContent=Math.round(state.thumbScale*100)+' %';host.querySelector('[data-input-text-output]').textContent=Math.round(state.textScale*100)+' %';
 list.style.setProperty('--input-thumb-scale',String(state.thumbScale));list.style.setProperty('--input-text-scale',String(state.textScale));
 const rows=orderedFiles();let filesHtml='';
 if(state.groupBy==='none')filesHtml=rows.map(({f,i})=>state.view==='preview'?previewItem(f,i):state.view==='icon'?iconItem(f,i):textItem(f,i)).join('');
 else{const groups=new Map();for(const row of rows){const g=groupKey(row.f);if(!groups.has(g))groups.set(g,[]);groups.get(g).push(row)}filesHtml=[...groups].map(([g,items])=>'<section class="studioInputGroup"><h4>'+esc(g)+' <small>'+items.length+'</small></h4><div class="studioInputGroupItems">'+items.map(({f,i})=>state.view==='preview'?previewItem(f,i):state.view==='icon'?iconItem(f,i):textItem(f,i)).join('')+'</div></section>').join('')}
 list.dataset.view=state.view;list.innerHTML=filesHtml||'<div class="studioInputEmpty">Aucun fichier sélectionné.</div>';
 const confirm=host.querySelector('#studioInputConfirm');confirm.disabled=!selected.length||state.busy;confirm.textContent=state.busy?'Préparation…':'Utiliser la sélection ('+selected.length+')'
}
async function rotateImageFile(file,deg){
 const url=URL.createObjectURL(file);try{
  const im=await new Promise((res,rej)=>{const x=new Image();x.onload=()=>res(x);x.onerror=rej;x.src=url}),swap=deg===90||deg===270,c=document.createElement('canvas');c.width=swap?im.naturalHeight:im.naturalWidth;c.height=swap?im.naturalWidth:im.naturalHeight;
  const ctx=c.getContext('2d');ctx.translate(c.width/2,c.height/2);ctx.rotate(deg*Math.PI/180);ctx.drawImage(im,-im.naturalWidth/2,-im.naturalHeight/2);
  const blob=await new Promise((res,rej)=>c.toBlob(b=>b?res(b):rej(new Error('Rotation image impossible')),file.type||'image/png',.92)),out=new File([blob],file.name,{type:blob.type,lastModified:file.lastModified});
  const rel=file.webkitRelativePath||file.__relativePath;if(rel)try{Object.defineProperty(out,'__relativePath',{value:rel,configurable:true})}catch{}return out
 }finally{URL.revokeObjectURL(url)}
}
async function rotatePdfFile(file,deg){
 const lib=await ensurePdfLib(),doc=await lib.PDFDocument.load(await file.arrayBuffer(),{ignoreEncryption:true});for(const p of doc.getPages()){const a=p.getRotation()?.angle||0;p.setRotation(lib.degrees((a+deg+360)%360))}
 const bytes=await doc.save(),out=new File([bytes],file.name,{type:'application/pdf',lastModified:file.lastModified}),rel=file.webkitRelativePath||file.__relativePath;if(rel)try{Object.defineProperty(out,'__relativePath',{value:rel,configurable:true})}catch{}return out
}
async function materializeSelection(files){
 const out=[];for(const f of files){const deg=rotationOf(f);if(!deg){out.push(f);continue}if(kindOf(f)==='pdf')out.push(await rotatePdfFile(f,deg));else if(kindOf(f)==='image')out.push(await rotateImageFile(f,deg));else out.push(f)}return out
}
function close(value){const host=ensure();syncSession();host.hidden=true;const resolve=state.resolve;state.resolve=null;state.busy=false;if(resolve)resolve(value)}
export function openInputPicker(options={}){
 const host=ensure();let saved='text';try{saved=localStorage.getItem('nlab.inputPicker.view')||'text'}catch{}
 const preserve=options.preserveSession!==false,initial=Array.isArray(options.files)?options.files:(preserve?[...sessionFiles]:[]),sel=preserve?new Set([...sessionSelected].filter(k=>initial.some(f=>keyOf(f)===k))):new Set();if(!sel.size)for(const f of initial)sel.add(keyOf(f));
 state={files:initial,options:{multiple:true,folders:true,url:true,expandZip:true,accept:'',view:saved,preserveSession:true,...options},resolve:null,view:['text','icon','preview'].includes(options.view)?options.view:saved,meta:new Map(),busy:false,error:'',selected:sel,active:initial[0]?keyOf(initial[0]):null,sortBy:'order',sortDir:'asc',groupBy:'none',thumbScale:1,textScale:1};render(host);host.hidden=false;host.style.zIndex='260';analyzeVisible();return new Promise(resolve=>{state.resolve=resolve})
}
export function mountInputPicker(){ensure();return{open:openInputPicker}}
export{filesFromDrop,materializeSelection};
