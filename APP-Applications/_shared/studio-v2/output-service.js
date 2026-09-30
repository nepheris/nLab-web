const DB='nlab-studio-v2-handles',STORE='handles';
function openDb(){return new Promise((res,rej)=>{const r=indexedDB.open(DB,1);r.onupgradeneeded=()=>r.result.createObjectStore(STORE);r.onsuccess=()=>res(r.result);r.onerror=()=>rej(r.error)})}
async function putHandle(k,h){try{const db=await openDb(),tx=db.transaction(STORE,'readwrite');tx.objectStore(STORE).put(h,k);await new Promise((res,rej)=>{tx.oncomplete=res;tx.onerror=()=>rej(tx.error)});db.close()}catch{}}
async function getHandle(k){try{const db=await openDb(),tx=db.transaction(STORE,'readonly'),r=tx.objectStore(STORE).get(k),v=await new Promise((res,rej)=>{r.onsuccess=()=>res(r.result);r.onerror=()=>rej(r.error)});db.close();return v||null}catch{return null}}
async function permission(h,mode='readwrite'){if(!h)return false;const o={mode};if((await h.queryPermission?.(o))==='granted')return true;return(await h.requestPermission?.(o))==='granted'}
export class OutputService{
 constructor(){this.handle=null}
 async chooseDirectory(){if(!window.showDirectoryPicker)throw new Error('Choix de dossier non pris en charge par ce navigateur');this.handle=await showDirectoryPicker({mode:'readwrite'});await putHandle('output',this.handle);return this.handle}
 async loadLastDirectory(){const h=await getHandle('output');if(!h||!(await permission(h)))throw new Error('Dernière destination indisponible');this.handle=h;return h}
 structureParts(mode,ctx={},custom=''){const d=new Date(),year=String(ctx.YEAR||d.getFullYear()),month=String(ctx.MONTH||d.getMonth()+1).padStart(2,'0'),t=String(ctx.TREATMENT||'TRAITEMENT');if(mode==='treatment')return[t];if(mode==='year-month')return[year,month];if(mode==='year-month-week')return[year,month,'S'+String(ctx.WEEK||'')];if(mode==='treatment-date')return[t,year,month];if(mode==='custom')return String(custom||'').split(/[\\/]+/).filter(Boolean);return[]}
 async targetDir(parts=[]){if(!this.handle)return null;let d=this.handle;for(const raw of parts){const p=String(raw).trim().replace(/[<>:"|?*\x00-\x1F]/g,'_');if(p)d=await d.getDirectoryHandle(p,{create:true})}return d}
 async saveBlob(blob,name,{parts=[]}={}){if(this.handle){const d=await this.targetDir(parts),f=await d.getFileHandle(name,{create:true}),w=await f.createWritable();await w.write(blob);await w.close();return{kind:'filesystem',name}}const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1200);return{kind:'download',name}}
 async saveZip(entries,name='export.zip'){if(!window.JSZip)throw new Error('JSZip indisponible');const z=new JSZip();for(const e of entries)z.file(e.name,e.data);const blob=await z.generateAsync({type:'blob'});return this.saveBlob(blob,name)}
}
