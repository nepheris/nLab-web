// Studio Core workspace shell — opt-in layout used first by Core Test Lab.
// The caller owns panels and commands; this module only composes navigation and layout.
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[c]));
export function mountStudioWorkspace({main,tabs=[],initial='files',title='Planche de travail',subtitle='',storageKey='nlab-workspace-v1'}={}){
 if(!main)throw Error('Workspace main required');
 main.classList.add('studioUx');
 main.innerHTML='<aside class="studioUxSidebar"><nav class="studioUxRail" role="tablist" aria-label="Panneaux du Studio"></nav><div class="studioUxSideContent"><header><strong id="studioUxSideTitle"></strong><div><button type="button" id="studioUxDetach" title="Détacher le panneau" aria-label="Détacher le panneau">↗</button><button type="button" id="studioUxCollapse" title="Replier le volet" aria-label="Replier le volet">‹</button></div></header><div id="studioUxPanelHost"></div></div></aside><section class="studioUxMain"><header class="studioUxWorkHeader"><div><strong>'+esc(title)+'</strong><small>'+esc(subtitle)+'</small></div><div class="studioUxWorkActions" id="studioUxWorkActions"></div></header><div class="studioUxWorkBody" id="studioUxWorkBody"></div></section><button type="button" id="studioUxMobileOpen" class="studioUxMobileOpen" aria-label="Afficher les panneaux">☰ Panneaux</button>';
 const nav=main.querySelector('.studioUxRail'),host=main.querySelector('#studioUxPanelHost'),heading=main.querySelector('#studioUxSideTitle');
 const nodes=new Map();
 for(const t of tabs){const panel=document.createElement('section');panel.className='studioUxTabPanel';panel.dataset.uxPanel=t.id;panel.hidden=true;panel.append(...(t.children||[]).filter(Boolean));nodes.set(t.id,panel);host.append(panel);const b=document.createElement('button');b.type='button';b.dataset.uxTab=t.id;b.setAttribute('role','tab');b.innerHTML='<span class="uxRailGlyph" aria-hidden="true">'+esc(t.icon||'◫')+'</span><span class="uxRailName">'+esc(t.label)+'</span>';b.title=t.label;b.setAttribute('aria-controls','studioUxPanelHost');if(t.workTab)b.dataset.uxWorkTab='true';nav.append(b)}
 let active=null;
 const switchTab=id=>{if(!nodes.has(id))return;active=id;for(const [key,panel] of nodes)panel.hidden=key!==id;nav.querySelectorAll('[data-ux-tab]').forEach(b=>{const yes=b.dataset.uxTab===id;b.classList.toggle('active',yes);b.setAttribute('aria-selected',String(yes))});heading.textContent=tabs.find(t=>t.id===id)?.label||id;main.dataset.activeTab=id;main.classList.add('uxSidebarOpen');main.classList.remove('uxSidebarClosed');try{localStorage.setItem(storageKey+':tab',id)}catch{}const tab=tabs.find(t=>t.id===id);const isWork=!!tab?.workTab;main.dataset.workTabActive=String(isWork);if(isWork){main.querySelector('#studioUxWorkBody')?.setAttribute('tabindex','-1');if(matchMedia('(max-width:700px)').matches)main.classList.remove('uxSidebarOpen')}main.dispatchEvent(new CustomEvent('studio-v2:workspace-tab',{detail:{id,isWork}}))};
 nav.addEventListener('click',e=>{const b=e.target.closest('[data-ux-tab]');if(b)switchTab(b.dataset.uxTab)});
 nav.addEventListener('keydown',e=>{if(!['ArrowDown','ArrowUp','Home','End'].includes(e.key))return;const buttons=Array.from(nav.querySelectorAll('[data-ux-tab]'));let i=buttons.indexOf(document.activeElement);if(e.key==='Home')i=0;else if(e.key==='End')i=buttons.length-1;else i=(i+(e.key==='ArrowDown'?1:-1)+buttons.length)%buttons.length;e.preventDefault();buttons[i]?.focus();switchTab(buttons[i]?.dataset.uxTab)});
 main.querySelector('#studioUxMobileOpen').addEventListener('click',()=>main.classList.toggle('uxSidebarOpen'));
 main.querySelector('#studioUxCollapse').addEventListener('click',()=>{if(matchMedia('(max-width:700px)').matches)main.classList.remove('uxSidebarOpen');else main.classList.toggle('uxSidebarClosed')});
 main.querySelector('#studioUxDetach').addEventListener('click',()=>{
  const detachedId=active,panel=nodes.get(detachedId);if(!panel)return;
  const existing=document.querySelector('[data-ux-float="'+detachedId+'"]');if(existing){existing.querySelector('[data-ux-float-close]').click();return}
  const floater=document.createElement('div');floater.className='studioUxFloat studioWindow';floater.dataset.uxFloat=detachedId;floater.innerHTML='<header class="studioUxFloatHead"><strong>'+esc(tabs.find(t=>t.id===detachedId)?.label||detachedId)+'</strong><button type="button" data-ux-float-close aria-label="Rattacher">↙ Rattacher</button></header><div class="studioUxFloatBody"></div>';floater.querySelector('.studioUxFloatBody').append(panel);document.body.append(floater);const reattach=()=>{if(!floater.isConnected)return;host.append(panel);floater.remove();switchTab(detachedId)};
  floater.querySelector('[data-ux-float-close]').addEventListener('click',reattach);floater.addEventListener('studio-window-close',reattach);floater.hidden=false;
  // Use the same shared draggable/dockable Studio window manager as PDF Studio.
  import('./window-system.js').then(m=>m.enhanceStudioWindow(floater,{key:'core-ux-'+detachedId,title:'Panneau · '+detachedId})).catch(()=>{});
 });
 let saved=initial;try{saved=localStorage.getItem(storageKey+':tab')||initial}catch{}
 const detectViewport=()=>{main.dataset.layoutProfile=innerWidth<=700?'mobile':innerWidth<=1100?'tablet':'desktop'};
 window.addEventListener('resize',detectViewport);detectViewport();
 switchTab(nodes.has(saved)?saved:initial);
 if(matchMedia('(max-width:700px)').matches)main.classList.remove('uxSidebarOpen');
 return{main,panels:nodes,switchTab,get activeTab(){return active},work:main.querySelector('#studioUxWorkBody'),actions:main.querySelector('#studioUxWorkActions')};
}