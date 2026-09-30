import{loadPersonalProfile,updatePersonalProfile}from'./personal-profile-service.js';

const DB='nlab-studio-v2-handles',STORE='handles',MAX=12;
const now=()=>new Date().toISOString();
const uid=()=>globalThis.crypto?.randomUUID?.()||('loc-'+Date.now()+'-'+Math.random().toString(16).slice(2));
function openDb(){return new Promise((res,rej)=>{const r=indexedDB.open(DB,2);r.onupgradeneeded=()=>{const db=r.result;if(!db.objectStoreNames.contains(STORE))db.createObjectStore(STORE)};r.onsuccess=()=>res(r.result);r.onerror=()=>rej(r.error)})}
async function putHandle(k,h){try{const db=await openDb(),tx=db.transaction(STORE,'readwrite');tx.objectStore(STORE).put(h,k);await new Promise((res,rej)=>{tx.oncomplete=res;tx.onerror=()=>rej(tx.error)});db.close();return true}catch{return false}}
async function getHandle(k){try{const db=await openDb(),tx=db.transaction(STORE,'readonly'),r=tx.objectStore(STORE).get(k),v=await new Promise((res,rej)=>{r.onsuccess=()=>res(r.result||null);r.onerror=()=>rej(r.error)});db.close();return v}catch{return null}}
async function removeHandle(k){try{const db=await openDb(),tx=db.transaction(STORE,'readwrite');tx.objectStore(STORE).delete(k);await new Promise((res,rej)=>{tx.oncomplete=res;tx.onerror=()=>rej(tx.error)});db.close()}catch{}}
export async function ensureHandlePermission(handle,mode='readwrite'){
 if(!handle)return false;try{const o={mode};if((await handle.queryPermission?.(o))==='granted')return true;return(await handle.requestPermission?.(o))==='granted'}catch{return false}
}
function list(kind){const p=loadPersonalProfile();return Array.isArray(p.recentLocations?.[kind])?p.recentLocations[kind]:[]}
export function listRecentLocations(kind){return list(kind)}
export async function rememberLocation(kind,handle,{label='',path='',provider='local'}={}){
 if(!['input','output'].includes(kind))throw new Error('Type de dossier récent invalide');
 if(!handle)throw new Error('Handle de dossier absent');
 const id=uid(),name=label||handle.name||'Dossier',item={id,name,label:name,path:path||name,provider,kind,updatedAt:now(),portable:true,handleKey:'location:'+id};
 await putHandle(item.handleKey,handle);
 updatePersonalProfile(p=>{p.recentLocations=p.recentLocations||{input:[],output:[]};const prior=Array.isArray(p.recentLocations[kind])?p.recentLocations[kind]:[];p.recentLocations[kind]=[item,...prior.filter(x=>(x.path||x.name)!==(item.path||item.name))].slice(0,MAX);return p});
 return item
}
export async function resolveRecentLocation(kind,id,{mode}={}){
 const item=list(kind).find(x=>x.id===id);if(!item)throw new Error('Dossier récent inconnu');
 const h=await getHandle(item.handleKey||('location:'+item.id));if(!h)throw new Error('Ce dossier vient du profil mais doit être re-sélectionné sur cet appareil.');
 const ok=await ensureHandlePermission(h,mode|| (kind==='output'?'readwrite':'read'));if(!ok)throw new Error('Autorisation refusée pour ce dossier');
 updatePersonalProfile(p=>{const a=p.recentLocations?.[kind]||[];const x=a.find(x=>x.id===id);if(x)x.updatedAt=now();return p});
 return{item,handle:h}
}
export async function forgetRecentLocation(kind,id){
 const item=list(kind).find(x=>x.id===id);if(item?.handleKey)await removeHandle(item.handleKey);
 updatePersonalProfile(p=>{if(Array.isArray(p.recentLocations?.[kind]))p.recentLocations[kind]=p.recentLocations[kind].filter(x=>x.id!==id);return p})
}
export const RecentLocationsService=Object.freeze({list:listRecentLocations,remember:rememberLocation,resolve:resolveRecentLocation,forget:forgetRecentLocation,permission:ensureHandlePermission});
