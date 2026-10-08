export async function loadStudioVersion({registryUrl,channel='test',appName='Studio',fallback='TEST'}={}){
  const params=new URLSearchParams(location.search),requested=params.get('version'),requestedChannel=params.get('channel');
  const effectiveChannel=['current','test','historical'].includes(String(requestedChannel||'').toLowerCase())?String(requestedChannel).toLowerCase():channel;
  let version=fallback,status=effectiveChannel.toUpperCase(),entry=null;
  try{
    const r=await fetch(registryUrl,{cache:'no-store'});
    if(!r.ok)throw new Error('HTTP '+r.status);
    const data=await r.json(),known=Array.isArray(data?.versions)?data.versions:[];
    const knownVersions=new Set(known.map(v=>String(v.version)));
    version=requested&&knownVersions.has(String(requested))?String(requested):String(data?.[effectiveChannel]||data?.[channel]||fallback);
    entry=known.find(v=>String(v.version)===version)||null;
    status=String(entry?.status||(requested?'historical':effectiveChannel)).toUpperCase();
  }catch(e){
    console.warn('[StudioVersion] registry unavailable',e);
  }
  const label=(appName?appName+' ':'')+version+(status==='TEST'?' TEST':'');
  document.querySelectorAll('[data-version]').forEach(el=>el.textContent=version);
  document.querySelectorAll('[data-version-status]').forEach(el=>el.textContent=status==='TEST'?version+' TEST':version+' '+status);
  document.querySelectorAll('[data-version-label]').forEach(el=>el.textContent=label);
  document.documentElement.dataset.studioVersion=version;
  window.__NLAB_STUDIO_VERSION__={version,status,entry,channel:effectiveChannel,requestedVersion:requested||null};
  return window.__NLAB_STUDIO_VERSION__;
}
