import{loadStudioSettings}from'./settings.js';

const CATALOG_URL=new URL('../../studios/catalog.json',import.meta.url);
function semver(v='0.0.0'){const m=String(v).match(/(\d+)(?:\.(\d+))?(?:\.(\d+))?/);return m?[Number(m[1]||0),Number(m[2]||0),Number(m[3]||0)]:[0,0,0]}
function cmp(a,b){const A=semver(a),B=semver(b);for(let i=0;i<3;i++){if(A[i]!==B[i])return A[i]-B[i]}return 0}
async function json(url){const r=await fetch(url,{cache:'no-store'});if(!r.ok)throw new Error('HTTP '+r.status+' · '+url);return r.json()}
export async function loadStudioCatalog(){return json(CATALOG_URL)}
export async function resolveSpecializedStudio(studioId,{policy=null}={}){
 const settings=loadStudioSettings(),catalog=await loadStudioCatalog(),entry=(catalog.studios||[]).find(x=>x.id===studioId);
 if(!entry)throw new Error('Studio spécialisé inconnu : '+studioId);
 const override=settings.specializedStudioOverrides?.[studioId],effective=policy||(override&&override!=='inherit'?override:settings.specializedStudioPolicy)||'latest';
 const registryUrl=new URL(entry.version_registry||'versions.json',CATALOG_URL),reg=await json(registryUrl),versions=Array.isArray(reg.versions)?reg.versions:[];
 const current=reg.current?versions.find(v=>v.version===reg.current)||{version:reg.current,status:'current',href:'./'}:versions.find(v=>v.status==='current'||v.current);
 const test=reg.test?versions.find(v=>v.version===reg.test)||{version:reg.test,status:'test',href:'./'}:versions.find(v=>v.status==='test');
 let chosen=null;
 if(effective==='current')chosen=current||test;
 else if(effective==='test')chosen=test||current;
 else{
  if(current&&test)chosen=cmp(test.version,current.version)>0?test:current;
  else chosen=test||current;
 }
 if(!chosen)throw new Error('Aucune version CURRENT/TEST disponible pour '+entry.name);
 const studioBase=new URL(entry.path,CATALOG_URL),href=chosen.href||'./',url=new URL(href,studioBase);
 return{studioId,name:entry.name,policy:effective,version:chosen.version,status:chosen.status||(chosen.current?'current':'unknown'),url:url.href,entry,registry:reg}
}
export async function openSpecializedStudio(studioId,{capability=null,context={},policy=null}={}){
 const resolved=await resolveSpecializedStudio(studioId,{policy});
 const {createStudioContext}=await import('./studio-context.js'),ctx=createStudioContext({...context,targetStudio:studioId,capability});
 const u=new URL(resolved.url);u.searchParams.set('nlabSession',ctx.sessionId);u.searchParams.set('sourceStudio',context.sourceStudio||document.body.dataset.studio||'studio');location.href=u.href;return resolved
}
export const StudioLinkResolver=Object.freeze({resolve:resolveSpecializedStudio,open:openSpecializedStudio});

export async function resolveStudioLink(studioId,options={}){return resolveSpecializedStudio(studioId,options)}
export async function openStudio(studioId,{query={},policy=null,context=null}={}){
 const resolved=await resolveSpecializedStudio(studioId,{policy}),u=new URL(resolved.url);
 for(const [k,v] of Object.entries(query||{}))if(v!=null)u.searchParams.set(k,String(v));
 const ctxApi=await import('./studio-context.js');let ctx=null;
 if(context)ctx=ctxApi.createStudioContext({...context,targetStudio:studioId,capability:context.capability||studioId});
 else{const existing=ctxApi.loadStudioContext?.();if(existing?.targetStudio===studioId)ctx=existing}
 if(ctx?.sessionId)u.searchParams.set('nlabSession',ctx.sessionId);
 u.searchParams.set('resolvedVersion',resolved.version);u.searchParams.set('resolvedChannel',resolved.status||resolved.policy);
 location.href=u.href;return resolved
}
