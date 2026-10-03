const DEFAULT_REPO='nepheris/nLab-web';
const cache=new Map();

async function readJson(url){
  const r=await fetch(url,{cache:'no-store'});
  if(!r.ok)throw new Error('Build metadata HTTP '+r.status);
  return r.json();
}
async function githubLastCommit(repo,path,ref='main'){
  if(!repo||!path)return null;
  const key=repo+'|'+ref+'|'+path;
  if(cache.has(key))return cache.get(key);
  const url='https://api.github.com/repos/'+encodeURIComponent(repo).replace('%2F','/')+'/commits?sha='+encodeURIComponent(ref)+'&path='+encodeURIComponent(path)+'&per_page=1';
  const controller=typeof AbortController!=='undefined'?new AbortController():null;
  const timer=controller?setTimeout(()=>controller.abort(),1200):null;
  const p=fetch(url,{headers:{Accept:'application/vnd.github+json'},signal:controller?.signal}).then(async r=>{
    if(!r.ok)throw new Error('GitHub commit metadata HTTP '+r.status);
    const rows=await r.json(),c=rows?.[0];
    if(!c)return null;
    return{
      commitSha:c.sha||'',
      commitShort:(c.sha||'').slice(0,8),
      commitDate:c.commit?.committer?.date||c.commit?.author?.date||'',
      commitUrl:c.html_url||'',
      source:'github-api'
    };
  }).catch(()=>null).finally(()=>{if(timer)clearTimeout(timer)});
  cache.set(key,p);return p;
}
export async function resolveBuildMetadata({
  buildHref='build.json',
  repo=DEFAULT_REPO,
  ref='main',
  sourcePath='',
  fallback={}
}={}){
  let out={
    schema:'nlab.studio-build/v1',
    studioId:'',
    productName:'',
    version:'',
    channel:'',
    commitSha:'',
    commitShort:'',
    commitDate:'',
    branch:ref,
    builtAt:'',
    releasedAt:'',
    sourcePath:sourcePath||'',
    source:'fallback',
    ...fallback
  };
  try{
    const data=await readJson(buildHref);
    out={...out,...data,source:'build-manifest'};
  }catch{}
  if((!out.commitSha||!out.commitDate)&&sourcePath){
    const git=await githubLastCommit(repo,sourcePath,ref);
    if(git)out={...out,...git,sourcePath};
  }
  if(!out.commitShort&&out.commitSha)out.commitShort=out.commitSha.slice(0,8);
  return out;
}
export function applyBuildMetadata(meta={},root=document.documentElement){
  root.dataset.studioCommit=meta.commitShort||meta.commitSha||'';
  root.dataset.studioCommitDate=meta.commitDate||'';
  root.dataset.studioSourcePath=meta.sourcePath||'';
  document.dispatchEvent(new CustomEvent('nlab:studio-build-metadata',{detail:meta}));
  return meta;
}
