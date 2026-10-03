import{enhanceStudioWindow}from'./window-system.js';
const esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
let state={files:[],options:{},resolve:null};
function keyOf(f){return [f.webkitRelativePath||f.__relativePath||'',f.name,f.size,f.lastModified].join('|')}
function dedupe(files){const seen=new Set(),out=[];for(const f of files){const k=keyOf(f);if(seen.has(k))continue;seen.add(k);out.push(f)}return out}
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
 '<div class="inputPickerActions"><button id="studioInputPickFiles" type="button">Fichier(s)</button><button id="studioInputPickFolder" type="button">Dossier</button><button id="studioInputClear" type="button">Tout effacer</button></div>'+
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
 host.querySelector('#studioInputClear').onclick=()=>{state.files=[];render(host)};
 host.querySelector('#studioInputCancel').onclick=()=>close(null);
 host.querySelector('#studioInputConfirm').onclick=()=>close([...state.files]);
 drop.onclick=()=>fileInput.click();drop.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();fileInput.click()}};
 for(const ev of ['dragenter','dragover'])drop.addEventListener(ev,e=>{e.preventDefault();drop.classList.add('dragover')});
 for(const ev of ['dragleave','drop'])drop.addEventListener(ev,e=>{e.preventDefault();drop.classList.remove('dragover')});
 drop.addEventListener('drop',async e=>{drop.classList.add('loading');try{add(await filesFromDrop(e.dataTransfer))}finally{drop.classList.remove('loading')}});
 host.querySelector('#studioInputList').onclick=e=>{const b=e.target.closest('[data-input-remove]');if(!b)return;state.files.splice(Number(b.dataset.inputRemove),1);render(host)};
 host.addEventListener('studio-window-close',()=>close(null));
 return host
}
function accepted(f){
 const a=String(state.options.accept||'').trim();if(!a)return true;
 const parts=a.split(',').map(x=>x.trim().toLowerCase()).filter(Boolean),name=String(f.name||'').toLowerCase(),type=String(f.type||'').toLowerCase();
 return parts.some(x=>x.startsWith('.')?name.endsWith(x):x.endsWith('/*')?type.startsWith(x.slice(0,-1)):type===x)
}
function add(files){const next=(files||[]).filter(accepted);state.files=dedupe([...(state.options.multiple===false?[]:state.files),...next]);if(state.options.multiple===false&&state.files.length>1)state.files=state.files.slice(-1);render(ensure())}
function render(host=ensure()){
 const list=host.querySelector('#studioInputList'),count=host.querySelector('#studioInputCount'),accept=host.querySelector('#studioInputAccept');
 count.textContent=state.files.length+' élément'+(state.files.length>1?'s':'');
 accept.textContent=state.options.accept?'Formats : '+state.options.accept:'Tous formats';
 host.querySelector('#studioInputPickFolder').hidden=state.options.folders===false;
 host.querySelector('#studioInputFilesNative').accept=state.options.accept||'';
 host.querySelector('#studioInputFilesNative').multiple=state.options.multiple!==false;
 list.innerHTML=state.files.map((f,i)=>'<div class="studioInputItem"><span class="studioInputItemIcon">▧</span><div><strong>'+esc(f.name)+'</strong><small>'+esc(f.webkitRelativePath||f.__relativePath||'')+(f.size!=null?' · '+Math.max(1,Math.round(f.size/1024))+' Ko':'')+'</small></div><button type="button" data-input-remove="'+i+'" aria-label="Retirer '+esc(f.name)+'" title="Retirer">×</button></div>').join('')||'<div class="studioInputEmpty">Aucun fichier sélectionné.</div>';
 host.querySelector('#studioInputConfirm').disabled=!state.files.length
}
function close(value){const host=ensure();host.hidden=true;const resolve=state.resolve;state.resolve=null;if(resolve)resolve(value)}
export function openInputPicker(options={}){
 const host=ensure();state={files:[],options:{multiple:true,folders:true,accept:'',...options},resolve:null};render(host);host.hidden=false;host.style.zIndex='260';
 return new Promise(resolve=>{state.resolve=resolve})
}
export function mountInputPicker(){ensure();return{open:openInputPicker}}
export{filesFromDrop};
