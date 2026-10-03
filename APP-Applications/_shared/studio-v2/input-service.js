import{formatInfo,isSupportedFile}from'./format-registry.js';
export function normalizeFiles(input){return [...(input||[])].filter(Boolean)}
export function acceptedFiles(input){return normalizeFiles(input).filter(isSupportedFile)}
export async function readText(file){if(!(file instanceof Blob))throw new Error('Fichier requis');return file.text()}
export async function readJson(file){return JSON.parse(await readText(file))}
export async function readBytes(file){if(!(file instanceof Blob))throw new Error('Fichier requis');return new Uint8Array(await file.arrayBuffer())}
export async function fileFromUrl(url,{name='',credentials='omit'}={}){
 const u=new URL(url,location.href);if(!/^https?:$/.test(u.protocol))throw new Error('URL HTTP/HTTPS requise');
 const r=await fetch(u,{mode:'cors',credentials});if(!r.ok)throw new Error('HTTP '+r.status);
 const blob=await r.blob(),cd=r.headers.get('content-disposition')||'',m=cd.match(/filename\*?=(?:UTF-8''|"?)([^";]+)/i),fallback=decodeURIComponent(u.pathname.split('/').filter(Boolean).pop()||'remote-file');
 return new File([blob],name||decodeURIComponent(m?.[1]||fallback),{type:blob.type||r.headers.get('content-type')||''})
}
export function describeInput(file){return{file,name:file?.name||'',size:file?.size||0,type:file?.type||'',format:formatInfo(file)}}
