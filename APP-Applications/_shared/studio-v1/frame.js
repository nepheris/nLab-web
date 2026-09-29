import{bindStudioChrome,applyRibbonGroups}from'./core.js';
import{loadStudioVersion}from'./version.js';

function esc(s){return String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]))}
function btn(it){
  const dev=it.status==='development'?'<small class="devBadge">DEV</small>':'';
  const id=it.id?' id="'+esc(it.id)+'"':'';
  const attrs=it.attrs?' '+it.attrs:'';
  return '<button'+id+' class="ribbonBtn '+(it.primary?'primary ':'')+(it.status==='development'?'devFeatureBtn':'')+'" data-studio-action="'+esc(it.action||it.id||'')+'" title="'+esc(it.title||it.label||'')+'"'+attrs+'>'+(it.icon||'')+'<span>'+esc(it.label||'')+'</span>'+dev+'</button>';
}

export async function mountStudioFrame({
  manifest,
  root=document.body,
  registryUrl='./versions.json',
  versionChannel='test',
  preserveExisting=false
}={}){
  if(!manifest)throw new Error('Studio manifest requis');
  if(!preserveExisting){
    root.querySelectorAll(':scope > .studioHeader, :scope > .studioMenu, :scope > .studioRibbon, :scope > .ribbonContext, :scope > .studioStatus').forEach(el=>el.remove());
  }
  const version=await loadStudioVersion({registryUrl,channel:versionChannel,appName:manifest.name,fallback:'—'});
  const chrome=document.createElement('div');
  chrome.id='nlabStudioCoreChrome';
  chrome.innerHTML=`
<header class="studioHeader">
  <a class="studioBrand" href="${esc(manifest.homeHref||'../../')}">
    <img src="${esc(manifest.logoHref||'../../assets/branding/nlab-wordmark.svg')}" alt="nLab">
    <span class="studioBrandText"><strong data-studio-name>${esc(manifest.name)}</strong><small><span data-studio-subtitle>${esc(manifest.subtitle||'nLab Studio')}</span> · <span data-version>${esc(version.version)}</span></small></span>
  </a>
  <div class="studioHeaderRight">
    <span class="studioPill local">● local-first</span>
    <span class="studioPill test" data-version-status>${esc(version.status||versionChannel.toUpperCase())}</span>
    <button class="studioHeaderControl" data-core-action="view-settings" title="Affichage / ruban">⚙</button>
    <a class="btn" href="${esc(manifest.studiosHref||'../studios/')}">Studios</a>
    <a class="btn" href="${esc(manifest.versionsHref||'./versions.html')}">Versions</a>
  </div>
</header>
<nav class="studioMenu" data-studio-slot="menu">${(manifest.menus||[]).map((m,i)=>'<button data-studio-menu="'+esc(m.id)+'" '+(i===0?'class="active"':'')+'>'+esc(m.label)+'</button>').join('')}</nav>
<div class="studioRibbon" data-studio-slot="ribbon">${(manifest.ribbon||[]).map(g=>'<div class="ribbonGroup" data-ribbon-group="'+esc(g.id)+'">'+(g.items||[]).map(btn).join('')+'<span class="ribbonLabel">'+esc(g.label||g.id)+'</span></div>').join('')}<button id="studioRibbonToggle" class="studioRibbonToggle studioChromeToggle" title="Replier le ruban" aria-expanded="true">⌃</button></div>
<div id="ribbonContext" class="ribbonContext" hidden>
 <div class="ribbonContextHead"><strong id="ribbonContextTitle">Outil</strong><button id="ribbonContextDetails">Détails</button><button id="ribbonContextToggle" class="contextToggle" title="Replier les détails" aria-expanded="true">⌃</button><button id="ribbonContextClose" title="Fermer">×</button></div>
 <div id="ribbonContextBody"></div>
</div>`;
  root.prepend(chrome);

  let status=document.querySelector('.studioStatus[data-core-owned]');
  if(!status){
    status=document.createElement('div');status.className='studioStatus';status.dataset.coreOwned='1';
    status.innerHTML='<span><span class="statusDot"></span><span id="studioStatusText">Prêt</span></span><span class="grow">'+esc(manifest.name)+' · Studio Core</span>';
    root.append(status);
  }
  if(!document.getElementById('sidebarRestore')){
    const b=document.createElement('button');b.id='sidebarRestore';b.className='studioSidebarRestore';b.hidden=true;b.title='Afficher le panneau';b.textContent='▶';root.append(b);
  }

  document.body.dataset.studioId=manifest.id||'studio';
  bindStudioChrome();
  applyRibbonGroups();

  const menu=document.querySelector('[data-studio-slot="menu"]');
  menu?.addEventListener('click',e=>{
    const b=e.target.closest('[data-studio-menu]');if(!b)return;
    [...menu.querySelectorAll('[data-studio-menu]')].forEach(x=>x.classList.toggle('active',x===b));
    document.dispatchEvent(new CustomEvent('studio:menu',{detail:{tab:b.dataset.studioMenu,studio:manifest.id}}));
  });
  document.querySelector('[data-studio-slot="ribbon"]')?.addEventListener('click',e=>{
    const b=e.target.closest('[data-studio-action]');if(!b)return;
    document.dispatchEvent(new CustomEvent('studio:action',{detail:{action:b.dataset.studioAction,element:b,studio:manifest.id}}));
  });
  document.querySelector('[data-core-action="view-settings"]')?.addEventListener('click',()=>{
    document.dispatchEvent(new CustomEvent('studio:view-settings',{detail:{studio:manifest.id}}));
  });
  return {manifest,version,chrome};
}
