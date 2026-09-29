export const qs=(s,r=document)=>r.querySelector(s);
export const qsa=(s,r=document)=>[...r.querySelectorAll(s)];
export const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));

export const STUDIO_V2={
  version:null,
  architecture:'single-core',
  devScopeMarkers:true
};

export function setArchitectureMarkers(enabled){
  localStorage.setItem('nlab-studio-v2-architecture-markers',enabled?'1':'0');
  document.body.classList.toggle('architectureMarkers',enabled);
  return enabled;
}
export function architectureMarkersEnabled(){
  return localStorage.getItem('nlab-studio-v2-architecture-markers')!=='0';
}
export function bindArchitectureMarkers(toggle){
  const el=typeof toggle==='string'?qs(toggle):toggle;
  const apply=()=>{
    const on=architectureMarkersEnabled();
    document.body.classList.toggle('architectureMarkers',on);
    if(el){el.checked=on;el.setAttribute('aria-checked',String(on))}
  };
  el?.addEventListener('change',()=>{setArchitectureMarkers(el.checked);apply()});
  apply();
}
export function setStatus(message){
  const el=qs('#studioStatusText');if(el)el.textContent=message;
}
export function openStudioSection(section){
  document.dispatchEvent(new CustomEvent('studio-v2:open-section',{detail:{section}}));
}
export function bindStudioChrome(){
  const body=document.body;
  const ribbonToggle=qs('#studioRibbonToggle');
  const context=qs('#ribbonContext');
  const contextToggle=qs('#ribbonContextToggle');
  const contextClose=qs('#ribbonContextClose');
  const sidebarRestore=qs('#sidebarRestore');
  const main=qs('#studioMain');

  const apply=()=>{
    const rc=localStorage.getItem('nlab-studio-v2-ribbon-collapsed')==='1';
    const cc=localStorage.getItem('nlab-studio-v2-context-collapsed')==='1';
    body.classList.toggle('studioRibbonCollapsed',rc);
    context?.classList.toggle('collapsed',cc);
  };
  ribbonToggle?.addEventListener('click',()=>{
    localStorage.setItem('nlab-studio-v2-ribbon-collapsed',body.classList.contains('studioRibbonCollapsed')?'0':'1');apply();
  });
  contextToggle?.addEventListener('click',()=>{
    localStorage.setItem('nlab-studio-v2-context-collapsed',context?.classList.contains('collapsed')?'0':'1');apply();
  });
  contextClose?.addEventListener('click',()=>{if(context)context.hidden=true});
  sidebarRestore?.addEventListener('click',()=>{main?.classList.remove('sidebarHidden','sidebarCompact');sidebarRestore.hidden=true});
  document.addEventListener('studio-v2:open-section',e=>{
    const id=e.detail?.section,el=id?qs(id):null;if(!el)return;
    main?.classList.remove('sidebarHidden');if(sidebarRestore)sidebarRestore.hidden=true;
    el.open=true;el.scrollIntoView({behavior:'smooth',block:'nearest'});
  });
  apply();
}
export function applyRibbonGroups(prefix='nlab-studio-v2-ribbon-'){
  qsa('[data-ribbon-group]').forEach(g=>g.classList.toggle('ribbonHidden',localStorage.getItem(prefix+g.dataset.ribbonGroup)==='0'));
}
export function setRibbonGroupVisible(group,visible,prefix='nlab-studio-v2-ribbon-'){
  localStorage.setItem(prefix+group,visible?'1':'0');applyRibbonGroups(prefix);
}
