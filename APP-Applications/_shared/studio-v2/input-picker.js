import{enhanceStudioWindow}from'./window-system.js';

const esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const asset=(group,name)=>new URL(`../../../assets/icons/${group}/${name}`,import.meta.url).href;
const FILETYPE_ICONS=new Set(['7z','avif','bmp','csv','doc','docx','epub','flac','gif','heic','html','ico','jpeg','jpg','json','mp4','odp','ods','odt','parquet','pdf','png','ppt','pptx','sql','svg','tar','tif','tiff','tsv','txt','wav','webm','webp','xls','xlsx','xml','yaml','zip']);
let state={files:[],options:{},resolve:null,view:'text',meta:new Map(),busy:false};
let pdfJsPromise=null,pdfLibPromise=null;

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
function folderRoot(f){const p=String(f.webkitRelativePath||f.__relativePath||'');return p.includes('/')?p.split('/')[0]:''}
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
 '<div class="inputPickerActions"><button id="studioInputPickFiles" type="button">Fichier(s)</button><button id="studioInputPickFolder" type="button">Dossier</button><button id="studioInputClear" type="button">Tout effacer</button><span class="inputPickerSpacer"></span><div class="inputPickerViews" role="group" aria-label="Mode d’affichage"><button type="button" data-input-view="text">Texte</button><button type="button" data-input-view="icon">Icône</button><button type="button" data-input-view="preview">Preview</button></div></div>'+
 '<input id="studioInputFilesNative" type="file" multiple hidden><input id="studioInputFolderNative" type="file" webkitdirectory multiple hidden>'+
 '<div id="studioInputDrop" class="studioInputDrop" tabindex="0" role="button"><strong>Glisser-déposer</strong><span>Fichiers ou dossiers</span></div>'+
 '<div class="inputPickerMeta"><strong id="studioInputCount">0 élément</strong><span id="studioInputAccept"></span></div>'+
 '<div id="studioInputList" class="studioInputList"></div>'+
 '<div class="inputPickerFooter"><button id="studioInputCancel" type="button">Annuler</button><button id="studioInputConfirm" class="primary" type="button">Utiliser la sélection</button></div>'+
 '</div>';
 document.body.append(host);enhanceStudioWindow(host,{key:'core-input-picker',title:'Choisir une entrée'});
 const fileInput=host.querySelector('#studioInputFilesNative'),folderInput=host.querySelector('#studioInputFolderNative'),drop=host.querySelector('#studioInputDrop');
 host.querySelector('#studioInputPickFiles').onclick=()=>fileInput.click();host.querySelector('#studioInputPickFolder').onclick=()=>folderInput.click();
 fileInput.onchange=e=>add([...e.target.files]);folderInput.onchange=e=>add([...e.target.files]);
 host.querySelector('#studioInputClear').onclick=()=>{state.files=[];state.meta.clear();render(host)};
 host.querySelector('#studioInputCancel').onclick=()=>close(null);
 host.querySelector('#studioInputConfirm').onclick=async()=>{if(state.busy)return;state.busy=true;render(host);try{close(await materializeSelection(state.files))}catch(e){state.busy=false;const a=host.querySelector('#studioInputAccept');if(a)a.textContent='Erreur : '+(e?.message||e);render(host)}};
 host.querySelector('.inputPickerViews').onclick=e=>{const b=e.target.closest('[data-input-view]');if(!b)return;state.view=b.dataset.inputView;try{localStorage.setItem('nlab.inputPicker.view',state.view)}catch{}render(host);analyzeVisible()};
 drop.onclick=()=>fileInput.click();drop.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();fileInput.click()}};
 for(const ev of ['dragenter','dragover'])drop.addEventListener(ev,e=>{e.preventDefault();drop.classList.add('dragover')});
 for(const ev of ['dragleave','drop'])drop.addEventListener(ev,e=>{e.preventDefault();drop.classList.remove('dragover')});
 drop.addEventListener('drop',async e=>{drop.classList.add('loading');try{add(await filesFromDrop(e.dataTransfer))}finally{drop.classList.remove('loading')}});
 host.querySelector('#studioInputList').onclick=e=>{
  const rm=e.target.closest('[data-input-remove]');if(rm){const i=Number(rm.dataset.inputRemove),f=state.files[i];if(f)state.meta.delete(keyOf(f));state.files.splice(i,1);render(host);return}
  const rot=e.target.closest('[data-input-rotate]');if(rot){const i=Number(rot.dataset.inputIndex),f=state.files[i];if(!f)return;setRotation(f,rotationOf(f)+Number(rot.dataset.inputRotate));render(host);return}
 };
 host.addEventListener('studio-window-close',()=>close(null));return host
}
function accepted(f){
 const a=String(state.options.accept||'').trim();if(!a)return true;
 const parts=a.split(',').map(x=>x.trim().toLowerCase()).filter(Boolean),name=String(f.name||'').toLowerCase(),type=String(f.type||'').toLowerCase();
 return parts.some(x=>x.startsWith('.')?name.endsWith(x):x.endsWith('/*')?type.startsWith(x.slice(0,-1)):type===x)
}
function add(files){const next=(files||[]).filter(accepted);state.files=dedupe([...(state.options.multiple===false?[]:state.files),...next]);if(state.options.multiple===false&&state.files.length>1)state.files=state.files.slice(-1);render(ensure());analyzeVisible()}
function folderSummaries(){
 const m=new Map();for(const f of state.files){const root=folderRoot(f);if(!root)continue;const v=m.get(root)||{name:root,count:0,size:0};v.count++;v.size+=Number(f.size||0);m.set(root,v)}return[...m.values()]
}
function fileActions(f,i){
 const rot=canRotate(f)?'<button type="button" data-input-rotate="-90" data-input-index="'+i+'" title="Tourner de 90° à gauche" aria-label="Tourner de 90° à gauche">↶</button><button type="button" data-input-rotate="90" data-input-index="'+i+'" title="Tourner de 90° à droite" aria-label="Tourner de 90° à droite">↷</button>':'';
 return '<div class="studioInputItemActions">'+rot+'<button type="button" data-input-remove="'+i+'" aria-label="Retirer '+esc(f.name)+'" title="Supprimer">×</button></div>'
}
function textItem(f,i){
 const m=metaFor(f),pages=m.pages?' · '+m.pages+' page'+(m.pages>1?'s':''):'',path=f.webkitRelativePath||f.__relativePath||'';
 return '<div class="studioInputItem studioInputTextItem"><img class="studioInputTypeIcon" src="'+asset('filetype',iconName(f))+'" alt=""><div><strong>'+esc(f.name)+'</strong><small>'+typeLabel(f)+' · '+formatKb(f.size)+pages+(path?' · '+esc(path):'')+'</small></div>'+fileActions(f,i)+'</div>'
}
function iconItem(f,i){
 const m=metaFor(f),pages=m.pages?'<span>'+m.pages+' p.</span>':'';
 return '<div class="studioInputCard"><div class="studioInputVisual"><img class="studioInputFileIcon" src="'+asset('filetype',iconName(f))+'" alt=""><span class="studioInputTypeBadge">'+typeLabel(f)+'</span></div><strong title="'+esc(f.name)+'">'+esc(f.name)+'</strong><small>'+formatKb(f.size)+' '+pages+'</small>'+fileActions(f,i)+'</div>'
}
function previewItem(f,i){
 const m=metaFor(f),rot=rotationOf(f),visual=m.thumb?'<img class="studioInputThumb" src="'+m.thumb+'" alt="Aperçu de '+esc(f.name)+'" style="transform:rotate('+rot+'deg)">':m.loading?'<div class="studioInputThumbLoading">Aperçu…</div>':'<img class="studioInputFileIcon" src="'+asset('filetype',iconName(f))+'" alt="">';
 const pages=m.pages?'<span>'+m.pages+' page'+(m.pages>1?'s':'')+'</span>':'';
 return '<div class="studioInputCard studioInputPreviewCard"><div class="studioInputVisual">'+visual+'<span class="studioInputTypeBadge">'+typeLabel(f)+'</span></div><strong title="'+esc(f.name)+'">'+esc(f.name)+'</strong><small><span>'+formatKb(f.size)+'</span>'+pages+'</small>'+fileActions(f,i)+'</div>'
}
function render(host=ensure()){
 const list=host.querySelector('#studioInputList'),count=host.querySelector('#studioInputCount'),accept=host.querySelector('#studioInputAccept');
 count.textContent=state.files.length+' élément'+(state.files.length>1?'s':'');accept.textContent=state.options.accept?'Formats : '+state.options.accept:'Tous formats';
 host.querySelector('#studioInputPickFolder').hidden=state.options.folders===false;host.querySelector('#studioInputFilesNative').accept=state.options.accept||'';host.querySelector('#studioInputFilesNative').multiple=state.options.multiple!==false;
 host.querySelectorAll('[data-input-view]').forEach(b=>b.classList.toggle('active',b.dataset.inputView===state.view));
 const folders=folderSummaries(),folderHtml=state.view==='text'?'':folders.map(x=>'<div class="studioInputFolderCard"><div class="studioInputVisual"><img class="studioInputFolderIcon" src="'+asset('ui','folder-closed.svg')+'" alt=""><span class="studioInputTypeBadge">DOSSIER</span></div><strong>'+esc(x.name)+'</strong><small>'+x.count+' fichier'+(x.count>1?'s':'')+' · '+formatKb(x.size)+'</small></div>').join('');
 const filesHtml=state.files.map((f,i)=>state.view==='preview'?previewItem(f,i):state.view==='icon'?iconItem(f,i):textItem(f,i)).join('');
 list.dataset.view=state.view;list.innerHTML=(folderHtml+filesHtml)||'<div class="studioInputEmpty">Aucun fichier sélectionné.</div>';
 const confirm=host.querySelector('#studioInputConfirm');confirm.disabled=!state.files.length||state.busy;confirm.textContent=state.busy?'Préparation…':'Utiliser la sélection'
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
function close(value){const host=ensure();host.hidden=true;const resolve=state.resolve;state.resolve=null;state.busy=false;if(resolve)resolve(value)}
export function openInputPicker(options={}){
 const host=ensure();let saved='text';try{saved=localStorage.getItem('nlab.inputPicker.view')||'text'}catch{}
 state={files:[],options:{multiple:true,folders:true,accept:'',view:saved,...options},resolve:null,view:['text','icon','preview'].includes(options.view)?options.view:saved,meta:new Map(),busy:false};render(host);host.hidden=false;host.style.zIndex='260';return new Promise(resolve=>{state.resolve=resolve})
}
export function mountInputPicker(){ensure();return{open:openInputPicker}}
export{filesFromDrop,materializeSelection};
