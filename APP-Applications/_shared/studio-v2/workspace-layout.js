// Studio Core workspace shell — opt-in layout used first by Core Test Lab.
// The caller owns panels and commands; this module only composes navigation and layout.
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[c]));
let workspaceInstance=0;
export function mountStudioWorkspace({main,tabs=[],initial='files',title='Planche de travail',subtitle='',storageKey='nlab-workspace-v1',resizable=false}={}){
 if(!main)throw Error('Workspace main required');
 main.classList.add('studioUx');
 main.innerHTML='<aside class="studioUxSidebar"><nav class="studioUxRail" role="tablist" aria-label="Panneaux du Studio"></nav><div class="studioUxSideContent"><header><strong id="studioUxSideTitle"></strong><div><button type="button" id="studioUxLock" title="Verrouiller la largeur du panneau" aria-label="Verrouiller la largeur du panneau" aria-pressed="false" hidden>♧</button><button type="button" id="studioUxDetach" title="Détacher le panneau" aria-label="Détacher le panneau">↗</button><button type="button" id="studioUxCollapse" title="Replier le volet" aria-label="Replier le volet">‹</button></div></header><div id="studioUxPanelHost"></div></div><div class="studioUxResizeGrip" id="studioUxResizeGrip" role="separator" tabindex="0" aria-label="Modifier la largeur du volet" aria-orientation="vertical" hidden></div></aside><section class="studioUxMain"><header class="studioUxWorkHeader"><div><strong>'+esc(title)+'</strong><small>'+esc(subtitle)+'</small></div><div class="studioUxWorkActions" id="studioUxWorkActions"></div></header><div class="studioUxWorkBody" id="studioUxWorkBody"></div></section><button type="button" id="studioUxMobileOpen" class="studioUxMobileOpen" aria-label="Afficher les panneaux">☰ Panneaux</button>';
 const nav=main.querySelector('.studioUxRail'),host=main.querySelector('#studioUxPanelHost'),heading=main.querySelector('#studioUxSideTitle');
 // Opt-in resizable drawer. Never resize existing studios or overwrite CURRENT layout settings.
 if(resizable){
  main.dataset.uxResizable='true';
  const grip=main.querySelector('#studioUxResizeGrip'),lock=main.querySelector('#studioUxLock');
  grip.hidden=false;lock.hidden=false;
  const clamp=n=>Math.max(240,Math.min(520,Math.round(Number(n)||342)));
  const get=(key,fallback)=>{try{return localStorage.getItem(storageKey+':'+key)??fallback}catch{return fallback}};
  const put=(key,value)=>{try{localStorage.setItem(storageKey+':'+key,String(value))}catch{}};
  let width=clamp(get('sidebar-width','342')),locked=get('sidebar-locked','false')==='true';
  const update=()=>{main.style.setProperty('--ux-sidebar-width',width+'px');grip.setAttribute('aria-valuenow',String(width));grip.setAttribute('aria-valuemin','240');grip.setAttribute('aria-valuemax','520');grip.setAttribute('aria-valuetext',width+' pixels');grip.setAttribute('aria-disabled',String(locked));lock.setAttribute('aria-pressed',String(locked));lock.textContent=locked?'🔒':'🔓';lock.title=locked?'Déverrouiller la largeur du panneau':'Verrouiller la largeur du panneau';grip.title=locked?'Déverrouiller le panneau pour redimensionner':'Faire glisser pour modifier la largeur';main.dataset.uxSidebarLocked=String(locked)};
  lock.addEventListener('click',()=>{locked=!locked;put('sidebar-locked',locked);update()});
  let dragging=false;
  grip.addEventListener('pointerdown',e=>{if(locked||e.button!==0||innerWidth<=700)return;dragging=true;grip.setPointerCapture(e.pointerId);e.preventDefault()});
  grip.addEventListener('pointermove',e=>{if(!dragging)return;const left=main.getBoundingClientRect().left;width=clamp(e.clientX-left);update()});
  const stop=()=>{if(!dragging)return;dragging=false;put('sidebar-width',width)};
  grip.addEventListener('pointerup',stop);grip.addEventListener('pointercancel',stop);
  grip.addEventListener('keydown',e=>{if(locked||!['ArrowLeft','ArrowRight','Home','End'].includes(e.key))return;e.preventDefault();width=e.key==='Home'?240:e.key==='End'?520:clamp(width+(e.key==='ArrowRight'?16:-16));put('sidebar-width',width);update()});
  update();
 }

 const nodes=new Map();
 let tabIndex=0;const scope='studio-ux-'+(++workspaceInstance)+'-';
 for(const t of tabs){const panel=document.createElement('section');panel.className='studioUxTabPanel';panel.dataset.uxPanel=t.id;panel.id=scope+'panel-'+tabIndex;panel.setAttribute('role','tabpanel');panel.hidden=true;panel.tabIndex=0;panel.append(...(t.children||[]).filter(Boolean));nodes.set(t.id,panel);host.append(panel);const b=document.createElement('button');b.type='button';b.dataset.uxTab=t.id;b.id=scope+'tab-'+tabIndex;b.setAttribute('role','tab');b.setAttribute('tabindex','-1');b.setAttribute('aria-selected','false');b.innerHTML='<span class="uxRailGlyph" aria-hidden="true">'+esc(t.icon||'◫')+'</span><span class="uxRailName">'+esc(t.label)+'</span>';b.title=t.label;b.setAttribute('aria-controls',panel.id);panel.setAttribute('aria-labelledby',b.id);if(t.workTab)b.dataset.uxWorkTab='true';nav.append(b);tabIndex++}
 const railToggle=document.createElement('button');railToggle.id='studioUxRailToggle';railToggle.className='uxRailToggle';railToggle.type='button';railToggle.title='Replier le volet gauche';nav.prepend(railToggle);
 const updateRail=()=>{const closed=main.classList.contains('uxSidebarClosed');railToggle.textContent=closed?'»':'«';railToggle.title=closed?'Déplier le volet gauche':'Replier le volet gauche';railToggle.setAttribute('aria-label',railToggle.title);railToggle.setAttribute('aria-expanded',String(!closed));main.querySelector('#studioUxCollapse').title=railToggle.title};
 let active=null;
 const switchTab=id=>{if(!nodes.has(id))return;active=id;for(const [key,panel] of nodes)panel.hidden=key!==id&&!panel.closest('.studioUxFloat');nav.querySelectorAll('[data-ux-tab]').forEach(b=>{const yes=b.dataset.uxTab===id;b.classList.toggle('active',yes);b.setAttribute('aria-selected',String(yes));b.tabIndex=yes?0:-1});heading.textContent=tabs.find(t=>t.id===id)?.label||id;main.dataset.activeTab=id;main.classList.add('uxSidebarOpen');main.classList.remove('uxSidebarClosed');updateRail();try{localStorage.setItem(storageKey+':tab',id)}catch{}const tab=tabs.find(t=>t.id===id);const isWork=!!tab?.workTab;main.dataset.workTabActive=String(isWork);if(isWork){main.querySelector('#studioUxWorkBody')?.setAttribute('tabindex','-1');if(matchMedia('(max-width:700px)').matches)main.classList.remove('uxSidebarOpen')}main.dispatchEvent(new CustomEvent('studio-v2:workspace-tab',{detail:{id,isWork}}))};
 nav.addEventListener('click',e=>{const b=e.target.closest('[data-ux-tab]');if(b)switchTab(b.dataset.uxTab)});
 nav.addEventListener('keydown',e=>{if(!['ArrowDown','ArrowUp','Home','End'].includes(e.key))return;const buttons=Array.from(nav.querySelectorAll('[data-ux-tab]'));let i=buttons.indexOf(document.activeElement);if(e.key==='Home')i=0;else if(e.key==='End')i=buttons.length-1;else i=(i+(e.key==='ArrowDown'?1:-1)+buttons.length)%buttons.length;e.preventDefault();buttons[i]?.focus();switchTab(buttons[i]?.dataset.uxTab)});
 main.querySelector('#studioUxMobileOpen').addEventListener('click',()=>main.classList.toggle('uxSidebarOpen'));
 const toggleRail=()=>{if(matchMedia('(max-width:700px)').matches)main.classList.toggle('uxSidebarOpen');else main.classList.toggle('uxSidebarClosed');updateRail()};
 railToggle.addEventListener('click',toggleRail);
 main.querySelector('#studioUxCollapse').addEventListener('click',()=>{if(matchMedia('(max-width:700px)').matches)main.classList.remove('uxSidebarOpen');else toggleRail();updateRail()});
 main.querySelector('#studioUxDetach').addEventListener('click',()=>{
  const detachedId=active,panel=nodes.get(detachedId);if(!panel)return;
  const existing=document.querySelector('[data-ux-float="'+detachedId+'"]');if(existing){existing.querySelector('[data-ux-float-close]').click();return}
  const floater=document.createElement('div');floater.className='studioUxFloat studioWindow';floater.dataset.uxFloat=detachedId;floater.innerHTML='<header class="studioUxFloatHead"><strong>'+esc(tabs.find(t=>t.id===detachedId)?.label||detachedId)+'</strong><button type="button" data-ux-float-close aria-label="Rattacher">↙ Rattacher</button></header><div class="studioUxFloatBody"></div>';floater.querySelector('.studioUxFloatBody').append(panel);document.body.append(floater);
  // Keep the shared rail accessible when a window is first detached on tablet/desktop.
  // The window manager can still restore an explicitly moved position from its preferences.
  if(innerWidth>700){const railRight=nav.getBoundingClientRect().right,windowWidth=Math.min(400,innerWidth*.9);floater.style.left=Math.max(8,Math.min(railRight+16,innerWidth-windowWidth-8))+'px'}
  const reattach=()=>{if(panel.parentElement===host)return;host.append(panel);floater.remove();switchTab(detachedId)};
  floater.querySelector('[data-ux-float-close]').addEventListener('click',reattach);floater.addEventListener('studio-window-close',reattach);floater.hidden=false;
  // Use the same shared draggable/dockable Studio window manager as PDF Studio.
  import('./window-system.js').then(m=>m.enhanceStudioWindow(floater,{key:'core-ux-'+detachedId,title:'Panneau · '+detachedId})).catch(()=>{});
 });
 let saved=initial;try{saved=localStorage.getItem(storageKey+':tab')||initial}catch{}
 const detectViewport=()=>{main.dataset.layoutProfile=innerWidth<=700?'mobile':innerWidth<=1100?'tablet':'desktop'};
 window.addEventListener('resize',detectViewport);detectViewport();
 switchTab(nodes.has(saved)?saved:initial);
 if(matchMedia('(max-width:700px)').matches)main.classList.remove('uxSidebarOpen');
 updateRail();
 return{main,panels:nodes,switchTab,get activeTab(){return active},work:main.querySelector('#studioUxWorkBody'),actions:main.querySelector('#studioUxWorkActions')};
}