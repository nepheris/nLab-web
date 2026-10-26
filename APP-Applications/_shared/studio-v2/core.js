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
  sidebarRestore?.addEventListener('click',()=>{main?.classList.remove('sidebarHidden','sidebarCompact');sidebarRestore.hidden=true;if(body.dataset.responsiveProfile==='mobile')body.classList.add('studioMobileSidebarOpen')});
  document.addEventListener('studio-v2:open-section',e=>{
    const id=e.detail?.section,el=id?qs(id):null;if(!el)return;
    main?.classList.remove('sidebarHidden');if(sidebarRestore)sidebarRestore.hidden=true;
    if(body.dataset.responsiveProfile==='mobile')body.classList.add('studioMobileSidebarOpen');
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

/**
 * Shared ribbon-tab presentation controller. Commands stay owned by the
 * Studio command registry; tabs only select which pre-existing groups appear.
 * A specialized Studio may extend "views" without cloning Core actions.
 */
export function mountStudioRibbonTabs({tabs,groups,views,initial='home'}={}){
 const root=typeof tabs==='string'?qs(tabs):tabs;
 const ribbon=typeof groups==='string'?qs(groups):groups;
 if(!root||!ribbon)throw new TypeError('Ribbon tabs and groups are required');
 const allTabs=qsa('[data-ribbon-tab]',root);
 const allGroups=qsa('[data-ribbon-group]',ribbon);
 let selected=initial;
 const select=(name,{focus=false}={})=>{
  if(!Object.hasOwn(views||{},name))return false;
  selected=name;
  for(const tab of allTabs){
   const active=tab.dataset.ribbonTab===selected;
   tab.setAttribute('aria-selected',String(active));
   tab.tabIndex=active?0:-1;
   if(active&&focus)tab.focus();
  }
  for(const group of allGroups){
   group.hidden=!(views[name]||[]).includes(group.dataset.ribbonGroup);
  }
  root.dispatchEvent(new CustomEvent('studio-v2:ribbon-tab',{detail:{tab:name,bubble:false}}));
  return true;
 };
 const click=e=>{const b=e.target.closest('[data-ribbon-tab]');if(b&&root.contains(b))select(b.dataset.ribbonTab)};
 const keyboard=e=>{
  if(!['ArrowRight','ArrowLeft','Home','End'].includes(e.key))return;
  const index=allTabs.findIndex(b=>b.dataset.ribbonTab===selected);
  const next=e.key==='Home'?0:e.key==='End'?allTabs.length-1:
   (index+(e.key==='ArrowRight'?1:-1)+allTabs.length)%allTabs.length;
  if(next<0)return;
  e.preventDefault();select(allTabs[next].dataset.ribbonTab,{focus:true});
 };
 root.addEventListener('click',click);
 root.addEventListener('keydown',keyboard);
 select(Object.hasOwn(views||{},initial)?initial:Object.keys(views||{})[0]);
 return{select,get activeTab(){return selected},destroy(){
  root.removeEventListener('click',click);root.removeEventListener('keydown',keyboard);
 }};
}
