export async function loadStudioVersion({registryUrl,channel='test',appName='Studio',fallback='TEST'}={}){
  let version=fallback,status=channel.toUpperCase(),entry=null;
  try{
    const r=await fetch(registryUrl,{cache:'no-store'});
    if(!r.ok)throw new Error('HTTP '+r.status);
    const data=await r.json();
    version=String(data?.[channel]||fallback);
    entry=Array.isArray(data?.versions)?data.versions.find(v=>String(v.version)===version):null;
    status=String(entry?.status||channel).toUpperCase();
  }catch(e){
    console.warn('[StudioVersion] registry unavailable',e);
  }
  const label=(appName?appName+' ':'')+version+(status==='TEST'?' TEST':'');
  document.querySelectorAll('[data-version]').forEach(el=>el.textContent=version);
  document.querySelectorAll('[data-version-status]').forEach(el=>el.textContent=status==='TEST'?version+' TEST':version+' '+status);
  document.querySelectorAll('[data-version-label]').forEach(el=>el.textContent=label);
  document.documentElement.dataset.studioVersion=version;
  window.__NLAB_STUDIO_VERSION__={version,status,entry,channel};
  return window.__NLAB_STUDIO_VERSION__;
}
