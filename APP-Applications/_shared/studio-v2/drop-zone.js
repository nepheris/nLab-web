async function readEntry(entry,path=''){
  if(entry.isFile)return new Promise(res=>entry.file(f=>{try{Object.defineProperty(f,'relativePath',{value:path+f.name})}catch{}res([f])},()=>res([])));
  if(entry.isDirectory){const reader=entry.createReader(),all=[];while(true){const batch=await new Promise(res=>reader.readEntries(res,()=>res([])));if(!batch.length)break;for(const child of batch)all.push(...await readEntry(child,path+entry.name+'/'))}return all}
  return[];
}
export function mountDropZone(element,{onFiles}={}){
  if(!element)return()=>{};
  const over=e=>{e.preventDefault();element.classList.add('dragover')},leave=e=>{e.preventDefault();element.classList.remove('dragover')};
  const drop=async e=>{leave(e);const items=[...(e.dataTransfer?.items||[])],files=[];for(const item of items){const entry=item.webkitGetAsEntry?.();if(entry)files.push(...await readEntry(entry));else{const f=item.getAsFile?.();if(f)files.push(f)}}if(!files.length)files.push(...[...(e.dataTransfer?.files||[])]);await onFiles?.(files,e)};
  element.addEventListener('dragenter',over);element.addEventListener('dragover',over);element.addEventListener('dragleave',leave);element.addEventListener('drop',drop);
  return()=>{element.removeEventListener('dragenter',over);element.removeEventListener('dragover',over);element.removeEventListener('dragleave',leave);element.removeEventListener('drop',drop)}
}
