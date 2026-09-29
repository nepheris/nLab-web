import{bindArchitectureMarkers,bindStudioChrome,applyRibbonGroups,setRibbonGroupVisible}from'./core.js';

const esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const scopeOf=x=>x?.scope==='core'?'core':'studio';
function itemButton(it){
  const scope=scopeOf(it);
  const dev=it.status==='development';
  return '<button'+(it.id?' id="'+esc(it.id)+'"':'')+
    ' class="ribbonBtn scope-'+scope+(it.primary?' primary':'')+(dev?' devFeatureBtn':'')+'"'+
    ' data-scope="'+scope+'" data-studio-action="'+esc(it.action||it.id||'')+'" title="'+esc(it.title||it.label||'')+'">'+
    '<span class="scopeIcon">'+(it.icon||'•')+'</span><span>'+esc(it.label||'')+'</span>'+
    '<small class="scopeBadge">'+scope.toUpperCase()+'</small>'+(dev?'<small class="devBadge">DEV</small>':'')+'</button>';
}
export async function mountStudioV2({manifest,versionInfo={version:'2.0.0',status:'TEST'},root=document.body}={}){
  if(!manifest)throw new Error('Manifest Studio V2 requis');
  root.querySelector('#nlabStudioV2Chrome')?.remove();

  const chrome=document.createElement('div');
  chrome.id='nlabStudioV2Chrome';
  chrome.innerHTML=`
<header class="studioHeader">
  <a class="studioBrand" href="${esc(manifest.homeHref||'../../')}">
    <img src="${esc(manifest.logoHref||'../../assets/branding/nlab-wordmark.svg')}" alt="nLab">
    <span class="studioBrandText"><strong>${esc(manifest.name)}</strong><small>${esc(manifest.subtitle||'nLab Studio')} · ${esc(versionInfo.version)}</small></span>
  </a>
  <div class="studioHeaderRight">
    <span class="studioPill local">● local-first</span>
    <span class="studioPill test">${esc(versionInfo.status||'TEST')}</span>
    <label class="architectureToggle" title="Afficher les repères CORE / STUDIO"><input id="architectureMarkersToggle" type="checkbox"> Repères architecture</label>
    <a class="btn scope-core" data-scope="core" href="${esc(manifest.studiosHref||'../studios/')}">Studios</a>
    <a class="btn scope-core" data-scope="core" href="${esc(manifest.versionsHref||'./versions.html')}">Versions</a>
  </div>
</header>
<nav class="studioMenu">
  ${(manifest.menus||[]).map((m,i)=>'<button class="scope-'+scopeOf(m)+(i===0?' active':'')+'" data-scope="'+scopeOf(m)+'" data-menu="'+esc(m.id)+'">'+esc(m.label)+'<small class="scopeBadge">'+scopeOf(m).toUpperCase()+'</small></button>').join('')}
</nav>
<div class="studioRibbon">
  ${(manifest.ribbon||[]).map(g=>'<div class="ribbonGroup scope-'+scopeOf(g)+'" data-scope="'+scopeOf(g)+'" data-ribbon-group="'+esc(g.id)+'">'+(g.items||[]).map(itemButton).join('')+'<span class="ribbonLabel">'+esc(g.label||g.id)+'</span></div>').join('')}
  <button id="studioRibbonToggle" class="studioRibbonToggle scope-core" data-scope="core" title="Replier/déplier le ruban">⌃<small class="scopeBadge">CORE</small></button>
</div>
<div id="ribbonContext" class="ribbonContext scope-core" data-scope="core" hidden>
  <div class="ribbonContextHead"><strong id="ribbonContextTitle">Outil</strong><button id="ribbonContextDetails">Détails</button><button id="ribbonContextToggle">⌃</button><button id="ribbonContextClose">×</button></div>
  <div id="ribbonContextBody"></div>
</div>`;
  root.prepend(chrome);

  if(!qs('#sidebarRestore')){
    const b=document.createElement('button');b.id='sidebarRestore';b.className='studioSidebarRestore scope-core';b.dataset.scope='core';b.hidden=true;b.textContent='▶';root.append(b);
  }
  if(!qs('.studioStatus[data-core-owned]')){
    const s=document.createElement('div');s.className='studioStatus scope-core';s.dataset.coreOwned='1';s.dataset.scope='core';
    s.innerHTML='<span><span class="statusDot"></span><span id="studioStatusText">Prêt</span></span><span class="grow">'+esc(manifest.name)+' · Studio Core V2</span>';root.append(s);
  }

  bindArchitectureMarkers('#architectureMarkersToggle');
  bindStudioChrome();
  applyRibbonGroups();

  const ribbon=qs('.studioRibbon');
  ribbon?.addEventListener('click',e=>{
    const b=e.target.closest('[data-studio-action]');if(!b)return;
    document.dispatchEvent(new CustomEvent('studio-v2:action',{detail:{action:b.dataset.studioAction,element:b,scope:b.dataset.scope,studio:manifest.id}}));
  });
  const menu=qs('.studioMenu');
  menu?.addEventListener('click',e=>{
    const b=e.target.closest('[data-menu]');if(!b)return;
    qsa('[data-menu]',menu).forEach(x=>x.classList.toggle('active',x===b));
    document.dispatchEvent(new CustomEvent('studio-v2:menu',{detail:{tab:b.dataset.menu,scope:b.dataset.scope,studio:manifest.id}}));
  });
  return{manifest,versionInfo,chrome,setRibbonGroupVisible};
}
