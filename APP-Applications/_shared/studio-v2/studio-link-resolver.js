import{loadStudioSettings}from'./settings.js';
const CATALOG_URL=new URL('../../studios/catalog.json',import.meta.url);
function semver(v){const m=String(v||'0').match(/^(\d+)(?:\.(\d+))?(?:\.(\d+))?(?:[-+](.*))?$/);return m?[Number(m[1]),Number(m[2]||0),Number(m[3]||0),m[4]||'']:[0,0,0,String(v||'')]}
export function compareVersions(a,b){const A=semver(a),B=semver(b);for(let i=0;i<3;i++)if(A[i]!==B[i])return A[i]-B[i];if(A[3]===B[3])return 0;if(!A[3])return 1;if(!B[3])return-1;return A[3].localeCompare(B[3])}
export function effectiveStudioPolicy(studioId,settings=loadStudioSettings()){const o=settings.specializedStudioOverrides||{};return o[studioId]&&o[studioId]!=='inherit'?o[studioId]:(settings.specializedStudioPolicy||'latest')}
export async function loadStudioCatalog(){const r=await fetch(CATALOG_URL,{cache:'no-store'});if(!r.ok)throw new Error('Catalogue Studios indisponible ('+r.status+')');return r.json()}
export async function resolveStudioVersion(studioId,{policy=null,settings=loadStudioSettings()}={}){
 const catalog=await loadStudioCatalog(),studio=(catalog.studios||[]).find(x=>x.id===studioId);if(!studio)throw new Error('Studio spécialisé inconnu : '+studioId);
 const registryUrl=new URL(studio.version_registry||('../'+studio.id+'/versions.json'),CATALOG_URL),rr=await fetch(registryUrl,{cache:'no-store'});if(!rr.ok)throw new Error('Registre de versions indisponible : '+studioId);const reg=await rr.json(),by=new Map((reg.versions||[]).map(v=>[String(v.version),v]));
 const current=reg.current?by.get(String(reg.current)):null,test=reg.test?by.get(String(reg.test)):null,p=policy||effectiveStudioPolicy(studioId,settings);let chosen=null;
 if(p==='current')chosen=current||test;else if(p==='test')chosen=test||current;else if(p==='latest'){if(current&&test)chosen=compareVersions(test.version,current.version)>=0?test:current;else chosen=test||current}
 if(!chosen){const all=[...(reg.versions||[])].filter(v=>v.status!=='historical'||p==='latest').sort((a,b)=>compareVersions(b.version,a.version));chosen=all[0]||null}
 if(!chosen)throw new Error('Aucune version disponible : '+studioId);
 const studioBase=new URL(studio.path,CATALOG_URL),href=new URL(chosen.href||'./',studioBase).href;
 return{studio,registry:reg,version:chosen,href,policy:p}
}
export async function openStudio(studioId,{policy=null,query={}}={}){
 const r=await resolveStudioVersion(studioId,{policy});const u=new URL(r.href);for(const[k,v]of Object.entries(query||{}))if(v!=null)u.searchParams.set(k,String(v));location.href=u.href;return r
}
export async function listResolvableStudios(){const c=await loadStudioCatalog();return(c.studios||[]).map(s=>({id:s.id,name:s.name,status:s.status}))}
