(()=>{'use strict';
if(window.NLAB_ARCHIVE_WORKSPACE)return;
const DEFAULT_LIMITS={maxEntries:500,maxBytes:250*1024*1024};
function requireZip(ref){const Z=ref||window.JSZip;if(!Z)throw new Error('JSZip requis');return Z}
function sanitize(path){
 const parts=String(path||'').replace(/\\/g,'/').split('/'),out=[];
 for(const p of parts){if(!p||p==='.')continue;if(p==='..')throw new Error('Chemin ZIP dangereux');out.push(p)}
 const v=out.join('/');if(!v||v.startsWith('/')||/^[A-Za-z]:/.test(v))throw new Error('Chemin ZIP dangereux');return v;
}
async function open(file,{JSZipRef,limits=DEFAULT_LIMITS,budget={entries:0,bytes:0}}={}){
 const Z=requireZip(JSZipRef);let zip;try{zip=await Z.loadAsync(await file.arrayBuffer())}catch(e){throw new Error('ZIP illisible ou protégé par mot de passe')}
 const entries=new Map();
 for(const ent of Object.values(zip.files)){
  if(ent.dir)continue;if(++budget.entries>limits.maxEntries)throw new Error('ZIP refusé : trop d’entrées');
  const path=sanitize(ent.name),declared=Number(ent?._data?.uncompressedSize||0);
  if(declared&&budget.bytes+declared>limits.maxBytes)throw new Error('ZIP refusé : taille décompressée excessive');
  const blob=await ent.async('blob');budget.bytes+=blob.size;if(budget.bytes>limits.maxBytes)throw new Error('ZIP refusé : taille décompressée excessive');
  entries.set(path,{path,blob,size:blob.size,deleted:false,modified:false});
 }
 return{schema:'nlab.archive.workspace/v1',sourceName:file.name,entries,limits:{...limits},budget};
}
function replace(workspace,path,blob){const safe=sanitize(path);workspace.entries.set(safe,{path:safe,blob,size:blob.size,deleted:false,modified:true});return workspace}
function remove(workspace,path){const e=workspace.entries.get(sanitize(path));if(e)e.deleted=true;return workspace}
async function build(workspace,{JSZipRef,compression='DEFLATE',level=6}={}){
 const Z=requireZip(JSZipRef),zip=new Z();for(const e of workspace.entries.values())if(!e.deleted)zip.file(e.path,e.blob);
 return zip.generateAsync({type:'blob',compression,compressionOptions:{level}});
}
async function ensureDir(root,parts){let d=root;for(const p of parts)d=await d.getDirectoryHandle(p,{create:true});return d}
async function extract(workspace,directoryHandle){
 if(!directoryHandle)throw new Error('Dossier de destination requis');let count=0;
 for(const e of workspace.entries.values()){if(e.deleted)continue;const parts=e.path.split('/'),name=parts.pop(),d=await ensureDir(directoryHandle,parts),h=await d.getFileHandle(name,{create:true}),w=await h.createWritable();await w.write(e.blob);await w.close();count++}
 return count;
}
window.NLAB_ARCHIVE_WORKSPACE={open,replace,remove,build,extract,sanitize,DEFAULT_LIMITS,version:'1.0.0'};
})();