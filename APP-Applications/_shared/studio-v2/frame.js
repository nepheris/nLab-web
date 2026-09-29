import{bindStudioChrome,applyRibbonGroups,setRibbonGroupVisible}from'./core.js';
import{applyStudioSettings,renderStudioSettingsPanel}from'./settings.js';
import{enhanceStudioWindow}from'./window-system.js';

const esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const scopeOf=x=>String(x?.scope||'studio').toLowerCase();
const scopeClass=x=>scopeOf(x)==='core'?'core':'studio';
function itemButton(it){
  const scope=scopeOf(it),visualScope=scopeClass(it);
  const dev=it.status==='development';
  const featureId=it.featureId||it.id||it.action||'unknown';
  const plugin=it.plugin||((scope==='core')?'studio-core':scope+'-studio');
  const status=it.status||'stable';
  const capability=it.capability||'';
  return '<button'+(it.id?' id="'+esc(it.id)+'"':'')+
    ' class="ribbonBtn scope-'+visualScope+(it.primary?' primary':'')+(dev?' devFeatureBtn':'')+'"'+
    ' data-scope="'+scope+'" data-plugin="'+esc(plugin)+'" data-feature-id="'+esc(featureId)+'" data-feature-status="'+esc(status)+'" data-capability="'+esc(capability)+'" data-studio-action="'+esc(it.action||it.id||'')+'" title="'+esc(it.title||it.label||'')+'">'+
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
  <div class="studioHeaderInner">
    <a class="studioLogo" href="${esc(manifest.homeHref||'../../')}" aria-label="nLab Web">
      <img src="${esc(manifest.logoHref||'../../assets/branding/nlab-wordmark.svg')}" alt="nLab">
    </a>
    <div class="studioBrand">
      <b>${esc(manifest.name)}</b>
      <small>${esc(manifest.subtitle||'nLab Studio')} · v${esc(versionInfo.version)}</small>
      <span class="studioHeaderMeta">
        <span class="studioPill local">● local-first</span>
        <span class="studioPill test">${esc(versionInfo.status||'TEST')}</span>
      </span>
    </div>
    <nav class="studioGlobalNav" aria-label="Navigation nLab">
      <a class="scope-core" data-scope="core" href="${esc((manifest.homeHref||'../../')+'APP-Applications/')}">Applications</a>
      <a class="scope-core" data-scope="core" href="${esc(manifest.studiosHref||'../studios-v2/')}">Studios</a>
      <a class="scope-core" data-scope="core" href="${esc((manifest.homeHref||'../../')+'Library/demo/')}">Démos</a>
      <a class="scope-core" data-scope="core" href="${esc((manifest.homeHref||'../../')+'Info/')}">Info</a>
      <a class="scope-core" data-scope="core" href="https://github.com/nepheris/nLab-web">GitHub</a>
      <button id="studioCoreSettings" class="studioNavAction scope-core" data-scope="core" title="Paramètres du Studio Core">⚙ Core</button>
      <a class="studioNavAction scope-core" data-scope="core" href="${esc(manifest.versionsHref||'./versions.html')}">Versions</a>
    </nav>
  </div>
</header>
<nav class="studioMenu">
  ${(manifest.menus||[]).map((m,i)=>'<button class="scope-'+scopeClass(m)+(i===0?' active':'')+'" data-scope="'+scopeOf(m)+'" data-menu="'+esc(m.id)+'">'+esc(m.label)+'<small class="scopeBadge">'+scopeOf(m).toUpperCase()+'</small></button>').join('')}
</nav>
<div class="studioRibbon">
  ${(manifest.ribbon||[]).map(g=>'<div class="ribbonGroup scope-'+scopeClass(g)+'" data-scope="'+scopeOf(g)+'" data-ribbon-group="'+esc(g.id)+'">'+(g.items||[]).map(itemButton).join('')+'<span class="ribbonLabel">'+esc(g.label||g.id)+'</span></div>').join('')}
  <button id="studioRibbonToggle" class="studioRibbonToggle scope-core" data-scope="core" title="Replier/déplier le ruban">⌃<small class="scopeBadge">CORE</small></button>
</div>
<div id="ribbonContext" class="ribbonContext scope-core" data-scope="core" hidden>
  <div class="ribbonContextHead"><strong id="ribbonContextTitle">Outil</strong><button id="ribbonContextDetails">Détails</button><button id="ribbonContextToggle">⌃</button><button id="ribbonContextClose">×</button></div>
  <div id="ribbonContextBody"></div>
</div>
<div id="studioCoreSettingsPanel" class="coreSettingsPanel scope-core" data-scope="core" hidden>
 <div class="coreSettingsHead"><strong>Paramètres Studio Core V2</strong><button id="studioCoreSettingsClose">×</button></div>
 <div id="studioCoreSettingsBody"></div>
</div>`;
  root.prepend(chrome);

  if(!qs('#sidebarRestore')){
    const b=document.createElement('button');b.id='sidebarRestore';b.className='studioSidebarRestore scope-core';b.dataset.scope='core';b.hidden=true;b.textContent='▶';root.append(b);
  }
  if(!qs('.studioStatus[data-core-owned]')){
    const s=document.createElement('div');s.className='studioStatus scope-core';s.dataset.coreOwned='1';s.dataset.scope='core';
    s.innerHTML='<span><span class="statusDot"></span><span id="studioStatusText">Prêt</span></span><span class="grow">'+esc(manifest.name)+' · Studio Core V2</span>';root.append(s);
  }

  applyStudioSettings();
  bindStudioChrome();
  applyRibbonGroups();
  const settingsPanel=qs('#studioCoreSettingsPanel');
  if(settingsPanel)enhanceStudioWindow(settingsPanel,{key:'core-settings',title:'Paramètres Studio Core V2'});
  qs('#studioCoreSettings')?.addEventListener('click',()=>{if(!settingsPanel)return;settingsPanel.hidden=!settingsPanel.hidden;if(!settingsPanel.hidden){renderStudioSettingsPanel(qs('#studioCoreSettingsBody'));settingsPanel.style.zIndex='230'}});
  qs('#studioCoreSettingsClose')?.addEventListener('click',()=>{if(settingsPanel)settingsPanel.hidden=true});

  const ribbon=qs('.studioRibbon');
  ribbon?.addEventListener('click',e=>{
    const b=e.target.closest('[data-studio-action]');if(!b)return;
    document.dispatchEvent(new CustomEvent('studio-v2:action',{detail:{action:b.dataset.studioAction,element:b,scope:b.dataset.scope,plugin:b.dataset.plugin,featureId:b.dataset.featureId,status:b.dataset.featureStatus,capability:b.dataset.capability,studio:manifest.id}}));
  });
  const menu=qs('.studioMenu');
  menu?.addEventListener('click',e=>{
    const b=e.target.closest('[data-menu]');if(!b)return;
    qsa('[data-menu]',menu).forEach(x=>x.classList.toggle('active',x===b));
    document.dispatchEvent(new CustomEvent('studio-v2:menu',{detail:{tab:b.dataset.menu,scope:b.dataset.scope,studio:manifest.id}}));
  });
  return{manifest,versionInfo,chrome,setRibbonGroupVisible};
}
