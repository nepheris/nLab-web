async function readEntry(entry,path=''){
  if(entry.isFile)return new Promise(res=>entry.file(f=>{try{Object.defineProperty(f,'relativePath',{value:path+f.name})}catch{}res([f])},()=>res([])));
  if(entry.isDirectory){const reader=entry.createReader(),all=[];while(true){const batch=await new Promise(res=>reader.readEntries(res,()=>res([])));if(!batch.length)break;for(const child of batch)all.push(...await readEntry(child,path+entry.name+'/'))}return all}
  return[];
}
export async function collectDirectoryHandle(handle,{recursive=true,path=''}={}){
  const files=[];if(!handle?.values)return files;
  for await(const entry of handle.values()){
    if(entry.kind==='file'){
      const f=await entry.getFile();try{Object.defineProperty(f,'relativePath',{value:path+f.name,configurable:true})}catch{}files.push(f)
    }else if(entry.kind==='directory'&&recursive)files.push(...await collectDirectoryHandle(entry,{recursive,path:path+entry.name+'/'}))
  }
  return files
}
export function mountDropZone(element,{onFiles,onStateChange}={}){
  if(!element)return()=>{};
  const over=e=>{e.preventDefault();element.classList.add('dragover');onStateChange?.('over',e)},leave=e=>{e.preventDefault();element.classList.remove('dragover');onStateChange?.('idle',e)};
  const drop=async e=>{leave(e);const items=[...(e.dataTransfer?.items||[])],files=[];for(const item of items){const entry=item.webkitGetAsEntry?.();if(entry)files.push(...await readEntry(entry));else{const f=item.getAsFile?.();if(f)files.push(f)}}if(!files.length)files.push(...[...(e.dataTransfer?.files||[])]);await onFiles?.(files,e);onStateChange?.('dropped',e)};
  element.addEventListener('dragenter',over);element.addEventListener('dragover',over);element.addEventListener('dragleave',leave);element.addEventListener('drop',drop);
  return()=>{element.removeEventListener('dragenter',over);element.removeEventListener('dragover',over);element.removeEventListener('dragleave',leave);element.removeEventListener('drop',drop)}
}
export function mountSortableList(element,{itemSelector='[draggable="true"]',onReorder}={}){
 if(!element)return()=>{};let dragged=null;
 const start=e=>{const item=e.target.closest(itemSelector);if(!item)return;dragged=item;item.classList.add('dragging');e.dataTransfer.effectAllowed='move';try{e.dataTransfer.setData('text/plain',item.dataset.sortId||'')}catch{}};
 const over=e=>{e.preventDefault();if(!dragged)return;const target=e.target.closest(itemSelector);if(!target||target===dragged)return;const r=target.getBoundingClientRect(),after=e.clientY>r.top+r.height/2;element.insertBefore(dragged,after?target.nextSibling:target)};
 const end=()=>{if(!dragged)return;dragged.classList.remove('dragging');dragged=null;onReorder?.([...element.querySelectorAll(itemSelector)].map(x=>x.dataset.sortId||x.dataset.assemblyId||x.dataset.assemblyIndex))};
 element.addEventListener('dragstart',start);element.addEventListener('dragover',over);element.addEventListener('dragend',end);
 return()=>{element.removeEventListener('dragstart',start);element.removeEventListener('dragover',over);element.removeEventListener('dragend',end)}
}
