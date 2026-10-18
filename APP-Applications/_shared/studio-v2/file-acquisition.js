import {describeInput,fileFromUrl} from './input-service.js';

/**
 * Acquisition Core : collecte et sélection sans moteur métier.
 * Les fichiers restent dans le navigateur. Les Studios consomment onChange
 * ou l'événement studio-v2:files-acquired ; aucune conversion automatique.
 */
export function mountCoreFileAcquisition(root,{
  onChange=()=>{}, onSelect=()=>{}, onMessage=()=>{}, multiple=true,
  accept='', enableFolders=true, maxFiles=500
}={}){
  if(!root)throw new TypeError('Acquisition host required');
  const doc=root.ownerDocument;
  const get=s=>root.querySelector(s);
  const files=[],selected=new Set();
  const nameFor=f=>f.webkitRelativePath||f.name;
  const unique=f=>[nameFor(f),f.size,f.lastModified].join('\u0000');
  const escape=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  root.innerHTML=`
  <section class="coreAcquisition scope-core" data-scope="core" aria-label="Acquisition commune des fichiers">
    <div class="coreAcquireActions">
      <button type="button" data-acquire="files">📄 Parcourir les fichiers</button>
      ${enableFolders?'<button type="button" data-acquire="folder">📁 Parcourir un dossier</button>':''}
      <button type="button" data-acquire="clear">Retirer tout</button>
    </div>
    <div class="coreAcquireDrop" data-acquire-drop tabindex="0" role="button" aria-label="Déposer des fichiers ou sélectionner des fichiers">Déposer vos fichiers ici, ou appuyer pour les parcourir</div>
    <div class="coreAcquireUrl"><label for="coreAcquireUrl-${root.id||'root'}">URL d’un fichier accessible (CORS)</label><div><input id="coreAcquireUrl-${root.id||'root'}" data-acquire-url type="url" placeholder="https://…" autocomplete="off"><button type="button" data-acquire="url">Importer l’URL</button></div></div>
    <input data-acquire-input type="file" ${multiple?'multiple':''} ${accept?'accept="'+escape(accept)+'"':''} hidden>
    ${enableFolders?'<input data-acquire-folder type="file" webkitdirectory multiple hidden>':''}
    <div class="coreAcquireSummary" data-acquire-summary aria-live="polite">Aucun fichier importé.</div>
    <div class="coreAcquireList" data-acquire-list role="list" aria-label="Fichiers chargés"></div>
  </section>`;
  const fileInput=get('[data-acquire-input]'),folderInput=get('[data-acquire-folder]');
  const summary=get('[data-acquire-summary]'),list=get('[data-acquire-list]');
  function render(){
    const size=files.reduce((n,f)=>n+f.size,0),unit=size<1048576?(size/1024).toFixed(1)+' Ko':(size/1048576).toFixed(1)+' Mo';
    summary.textContent=files.length?files.length+' fichier(s), '+unit+' · '+selected.size+' sélectionné(s)':'Aucun fichier importé.';
    list.innerHTML=files.map((file,i)=>`<div class="coreAcquireItem" role="listitem">
      <label><input type="checkbox" data-acquire-index="${i}" ${selected.has(file)?'checked':''}><span class="coreAcquireName">${escape(nameFor(file))}</span></label>
      <small>${escape(describeInput(file).format?.family||file.type||'fichier')} · ${Math.max(0.1,file.size/1024).toFixed(1)} Ko</small>
      <button type="button" data-acquire-remove="${i}" aria-label="Retirer ${escape(file.name)}">×</button>
    </div>`).join('')||'<p class="coreAcquireEmpty">Importez un fichier ou un dossier pour commencer.</p>';
    const items=[...selected];
    onSelect(items);
  }
  const message=value=>{onMessage(value);summary.setAttribute('title',String(value))};
  function add(input,{source='files'}={}){
    const originals=[...(input||[])].filter(x=>x instanceof File);
    const known=new Set(files.map(unique)),accepted=[];
    for(const file of originals){
      if(files.length>=maxFiles)break;
      const key=unique(file);if(known.has(key))continue;
      known.add(key);files.push(file);selected.add(file);accepted.push(file);
    }
    render();
    if(accepted.length){
      const detail={files:[...files],added:accepted,selected:[...selected],source};
      root.dispatchEvent(new CustomEvent('studio-v2:files-acquired',{bubbles:true,detail}));
      onChange(detail);
    }
    if(originals.length>accepted.length)message('Fichiers déjà présents ou limite atteinte : '+maxFiles+' maximum.');
    return accepted;
  }
  function clear(){
    files.length=0;selected.clear();render();
    onChange({files:[],added:[],selected:[],source:'clear'});
  }
  function remove(index){
    const file=files[index];if(!file)return;
    files.splice(index,1);selected.delete(file);render();
    onChange({files:[...files],added:[],selected:[...selected],source:'remove'});
  }
  const onClick=e=>{
    const action=e.target.closest('[data-acquire]')?.dataset.acquire;
    if(action==='files')fileInput.click();
    if(action==='folder')folderInput?.click();
    if(action==='clear')clear();
    if(action==='url')loadUrl();
    const rm=e.target.closest('[data-acquire-remove]');if(rm)remove(Number(rm.dataset.acquireRemove));
  };
  const onChangeSelection=e=>{
    if(!e.target.matches('[data-acquire-index]'))return;
    const f=files[Number(e.target.dataset.acquireIndex)];if(!f)return;
    if(e.target.checked)selected.add(f);else selected.delete(f);
    render();
  };
  const open=()=>fileInput.click();
  async function loadUrl(){
    const input=get('[data-acquire-url]'),raw=input?.value.trim();
    if(!raw){message('Renseignez une URL HTTP/HTTPS.');return false}
    try{const f=await fileFromUrl(raw);add([f],{source:'url'});return true}
    catch(err){message('Import URL impossible (CORS/réseau) : '+(err.message||err));return false}
  }
  const dragOver=e=>{e.preventDefault();root.classList.add('coreAcquireDragOver')};
  const dragLeave=e=>{if(!root.contains(e.relatedTarget))root.classList.remove('coreAcquireDragOver')};
  const drop=e=>{
    e.preventDefault();root.classList.remove('coreAcquireDragOver');
    // dataTransfer.files handles files; directory drop support varies by browser.
    add(e.dataTransfer?.files,{source:'drop'});
  };
  fileInput.addEventListener('change',()=>{add(fileInput.files,{source:'files'});fileInput.value=''});
  folderInput?.addEventListener('change',()=>{add(folderInput.files,{source:'folder'});folderInput.value=''});
  root.addEventListener('click',onClick);
  root.addEventListener('change',onChangeSelection);
  root.addEventListener('dragover',dragOver);root.addEventListener('dragleave',dragLeave);
  root.addEventListener('drop',drop);
  get('[data-acquire-drop]')?.addEventListener('click',open);
  get('[data-acquire-drop]')?.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();open()}});
  render();
  return Object.freeze({
    add,getFiles:()=>[...files],getSelected:()=>[...selected],clear,open,loadUrl,
    destroy(){root.replaceChildren()}
  });
}
