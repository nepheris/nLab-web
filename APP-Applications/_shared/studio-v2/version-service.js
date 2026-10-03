import{resolveBuildMetadata,applyBuildMetadata}from'./build-metadata-service.js';

const fallback={studioVersion:'',studioStatus:'TEST',coreVersion:'',requestedVersion:null,build:null};
async function json(url){const r=await fetch(url,{cache:'no-store'});if(!r.ok)throw new Error('Version registry HTTP '+r.status);return r.json()}
export async function resolveStudioVersions({
 versionsHref='../versions.json',
 coreVersionHref='../../_shared/studio-v2/version.json',
 channel='test',
 buildHref='build.json',
 sourcePath='',
 repo='nepheris/nLab-web',
 ref='main'
}={}){
 const out={...fallback};const requested=new URLSearchParams(location.search).get('version');out.requestedVersion=requested;
 try{
  const reg=await json(versionsHref),known=Array.isArray(reg.versions)?reg.versions:[];
  const active=new Set([reg.test,reg.current].filter(Boolean));const candidate=requested&&active.has(requested)?requested:(reg[channel]||reg.test||reg.current||known[0]?.version||'');
  const item=known.find(v=>v.version===candidate);out.studioVersion=candidate;out.studioStatus=String(item?.status||channel||'test').toUpperCase()
 }catch{}
 try{const core=await json(coreVersionHref);out.coreVersion=core.version||''}catch{}
 out.build=await resolveBuildMetadata({
  buildHref,repo,ref,sourcePath,
  fallback:{version:out.studioVersion,channel:out.studioStatus}
 });
 out.version=out.studioVersion;out.status=out.studioStatus;
 applyBuildMetadata(out.build||{});
 return out
}
export function applyVersionDocumentMeta({studioName='Studio',studioVersion='',studioStatus='',coreVersion='',build=null}={}){
 const suffix=[studioVersion&&'v'+studioVersion,studioStatus].filter(Boolean).join(' ');
 document.title=['nLab',studioName,suffix].filter(Boolean).join(' — ');
 document.documentElement.dataset.studioVersion=studioVersion||'';
 document.documentElement.dataset.studioCoreVersion=coreVersion||'';
 if(build)applyBuildMetadata(build);
}
