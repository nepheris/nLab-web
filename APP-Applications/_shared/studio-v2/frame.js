import{qs,qsa,bindStudioChrome,applyRibbonGroups,setRibbonGroupVisible,setStatus}from'./core.js';
import{applyStudioSettings,renderStudioSettingsPanel,saveStudioSettings,loadStudioSettings}from'./settings.js';
import{enhanceStudioWindow}from'./window-system.js';
import{mountHistoryUI,recordHistory}from'./history.js';
import{icon}from'./icon-registry.js';
import{registerCapabilities}from'./capability-registry.js';
import{mountCommandPalette}from'./command-palette.js';
import{mountWorkflowUI}from'./workflow-ui.js';
import{openStudio as openResolvedStudio}from'./studio-link-resolver.js';
import{findFeature,renderContextualHelp}from'./help.js';

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
  const domId=it.id||('studio-action-'+String(it.action||featureId).replace(/[^a-z0-9_-]+/gi,'-').toLowerCase());
  return '<button id="'+esc(domId)+'" data-ui-id="'+esc(featureId)+'"'+
    ' class="ribbonBtn scope-'+visualScope+(it.primary?' primary':'')+(dev?' devFeatureBtn':'')+'"'+
    ' data-scope="'+scope+'" data-plugin="'+esc(plugin)+'" data-feature-id="'+esc(featureId)+'" data-feature-status="'+esc(status)+'" data-capability="'+esc(capability)+'" data-studio-action="'+esc(it.action||it.id||'')+'" title="'+esc(it.title||it.label||'')+'">'+
    '<span class="scopeIcon">'+icon(it.icon||'command')+'</span><span>'+esc(it.label||'')+'</span>'+
    '<small class="scopeBadge">'+scope.toUpperCase()+'</small>'+(dev?'<small class="devBadge">DEV</small>':'')+'</button>';
}
export async function mountStudioV2({manifest,versionInfo={version:'',status:'TEST'},root=document.body}={}){
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
    <div class="studioIdentity">
      <span class="studioAppIcon" style="--studio-icon:url('${esc(manifest.studioIconHref||('../../assets/studios/'+manifest.id+'.svg'))}')" aria-hidden="true"></span>
      <div class="studioBrand">
      <b>${esc(manifest.name)}</b>
      <small>${esc(manifest.subtitle||'nLab Studio')}${versionInfo.version?' · v'+esc(versionInfo.version):''}</small>
      <span class="studioHeaderMeta">
        <span class="studioPill local">● local-first</span>
        <span class="studioPill test">${esc(versionInfo.status||'TEST')}</span>
      </span>
      </div>
    </div>
    <nav class="studioGlobalNav" aria-label="Navigation nLab">
      <a class="scope-core" data-scope="core" href="${esc((manifest.homeHref||'../../')+'APP-Applications/')}">Applications</a>
      <a class="scope-core" data-scope="core" href="${esc(manifest.studiosHref||'../studios-v2/')}">Studios</a>
      <a class="scope-core" data-scope="core" href="${esc((manifest.homeHref||'../../')+'Library/demo/')}">Démos</a>
      <a class="scope-core" data-scope="core" href="${esc((manifest.homeHref||'../../')+'Info/')}">Info</a>
      <a class="scope-core" data-scope="core" href="https://github.com/nepheris/nLab-web">GitHub</a>
      <button id="studioCommandOpen" class="studioNavAction scope-core" data-scope="core" title="Rechercher une commande (Ctrl+K)">⌕ Commandes</button><button id="studioWorkflowOpen" class="studioNavAction scope-core" data-scope="core" title="Workflows enregistrés">Workflows</button><button id="studioCoreSettings" class="studioNavAction scope-core" data-scope="core" title="Paramètres du Studio Core">⚙ Core</button>
      <a class="studioNavAction scope-core" data-scope="core" href="${esc(manifest.versionsHref||'./versions.html')}">Versions</a>
    </nav>
  </div>
</header>
<nav class="studioMenu">
  ${(manifest.menus||[]).map((m,i)=>'<button class="scope-'+scopeClass(m)+(i===0?' active':'')+'" data-scope="'+scopeOf(m)+'" data-menu="'+esc(m.id)+'">'+esc(m.label)+'<small class="scopeBadge">'+scopeOf(m).toUpperCase()+'</small></button>').join('')}
  <button id="studioVisibilityOpen" class="studioMenuUtility scope-core" data-scope="core" title="Afficher / masquer les menus et groupes du ruban">${icon('eye')}<span>Affichage</span></button>
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
 <div class="coreSettingsHead"><strong>Paramètres Studio Core</strong><button id="studioCoreSettingsClose">×</button></div>
 <div id="studioCoreSettingsBody"></div>
</div>`;
  root.prepend(chrome);
  const visibility=document.createElement('div');visibility.id='studioVisibilityPanel';visibility.className='studioVisibilityPanel scope-core';visibility.dataset.scope='core';visibility.hidden=true;root.insertBefore(visibility,root.querySelector('#studioMain')||root.firstChild?.nextSibling);
  const applyMenuVisibility=()=>qsa('[data-menu]',qs('.studioMenu')).forEach(b=>b.classList.toggle('menuHidden',localStorage.getItem('nlab-studio-v2-menu-'+b.dataset.menu)==='0'));
  const renderVisibility=()=>{const s=loadStudioSettings(),menus=(manifest.menus||[]),groups=qsa('[data-ribbon-group]').map(g=>({id:g.dataset.ribbonGroup,label:g.querySelector('.ribbonLabel')?.textContent?.trim()||g.dataset.ribbonGroup}));visibility.innerHTML='<div class="visibilityGrid"><section><strong>Menus</strong>'+menus.map(m=>'<label><input type="checkbox" data-vis-menu="'+esc(m.id)+'" '+(localStorage.getItem('nlab-studio-v2-menu-'+m.id)==='0'?'':'checked')+'> '+esc(m.label)+'</label>').join('')+'</section><section><strong>Ruban</strong>'+groups.map(g=>'<label><input type="checkbox" data-vis-ribbon="'+esc(g.id)+'" '+(localStorage.getItem('nlab-studio-v2-ribbon-'+g.id)==='0'?'':'checked')+'> '+esc(g.label)+'</label>').join('')+'</section><section><strong>Disposition</strong><label>Ruban <select id="visibilityRibbonRows"><option value="auto">Auto</option><option value="one">1 ligne</option><option value="two">2 lignes</option></select></label></section></div>';visibility.querySelector('#visibilityRibbonRows').value=s.ribbonRows||'auto';visibility.querySelectorAll('[data-vis-menu]').forEach(x=>x.onchange=()=>{localStorage.setItem('nlab-studio-v2-menu-'+x.dataset.visMenu,x.checked?'1':'0');applyMenuVisibility()});visibility.querySelectorAll('[data-vis-ribbon]').forEach(x=>x.onchange=()=>{setRibbonGroupVisible(x.dataset.visRibbon,x.checked);applyRibbonGroups()});visibility.querySelector('#visibilityRibbonRows').onchange=e=>saveStudioSettings({ribbonRows:e.target.value})};
  applyMenuVisibility();
  document.addEventListener('nlab:portable-settings-imported',()=>{applyStudioSettings(loadStudioSettings());applyMenuVisibility();applyRibbonGroups();renderVisibility()});
  qs('#studioVisibilityOpen')?.addEventListener('click',()=>{visibility.hidden=!visibility.hidden;if(!visibility.hidden)renderVisibility()});

  if(!qs('#sidebarRestore')){
    const b=document.createElement('button');b.id='sidebarRestore';b.className='studioSidebarRestore scope-core';b.dataset.scope='core';b.hidden=true;b.textContent='▶';root.append(b);
  }
  if(!qs('.studioStatus[data-core-owned]')){
    const s=document.createElement('div');s.className='studioStatus scope-core';s.dataset.coreOwned='1';s.dataset.scope='core';
    const studioVer=versionInfo.version?' v'+esc(versionInfo.version):'',coreVer=versionInfo.coreVersion?' v'+esc(versionInfo.coreVersion):'';
    s.innerHTML='<span><span class="statusDot"></span><span id="studioStatusText">Prêt</span></span><span class="grow">'+esc(manifest.name)+studioVer+' '+esc(versionInfo.status||'')+' · Studio Core'+coreVer+'</span>';root.append(s);
  }

  document.body.dataset.studio=manifest.id||'studio';
  document.body.dataset.studioVersion=versionInfo.version||'';
  document.body.dataset.studioCoreVersion=versionInfo.coreVersion||'';
  registerCapabilities(manifest);
  applyStudioSettings();
  mountHistoryUI();
  mountCommandPalette();
  mountWorkflowUI();
  bindStudioChrome();
  applyRibbonGroups();
  qsa('[id]').forEach(el=>{if(!el.dataset.uiId)el.dataset.uiId=(manifest.id+'-'+el.id).replace(/[^a-z0-9_-]+/gi,'-').toLowerCase()});
  qsa('[data-studio-action]:not([id])').forEach(el=>{const a=String(el.dataset.studioAction||'action').replace(/[^a-z0-9_-]+/gi,'-').toLowerCase();el.id=(manifest.id+'-action-'+a);el.dataset.uiId=el.id});
  qsa('[data-icon]').forEach(el=>{if(!el.querySelector('.studioIcon'))el.insertAdjacentHTML('afterbegin',icon(el.dataset.icon||'command'))});
  qsa('details[id]').forEach(d=>{
    const key='nlab-studio-v2-panel-'+manifest.id+'-'+d.id;
    const saved=localStorage.getItem(key);if(saved!==null)d.open=saved==='1';
    d.addEventListener('toggle',()=>{
      localStorage.setItem(key,d.open?'1':'0');
      const main=qs('#studioMain');
      if(d.open&&main?.classList.contains('sidebarCompact'))saveStudioSettings({sidebarMode:'normal'});
    });
  });
  const settingsPanel=qs('#studioCoreSettingsPanel');
  if(settingsPanel)enhanceStudioWindow(settingsPanel,{key:'core-settings',title:'Paramètres Studio Core'});
  qs('#studioCoreSettings')?.addEventListener('click',()=>{if(!settingsPanel)return;settingsPanel.hidden=!settingsPanel.hidden;if(!settingsPanel.hidden){renderStudioSettingsPanel(qs('#studioCoreSettingsBody'));settingsPanel.style.zIndex='230'}});
  qs('#studioCoreSettingsClose')?.addEventListener('click',()=>{if(settingsPanel)settingsPanel.hidden=true});
  qs('#studioCommandOpen')?.addEventListener('click',()=>document.dispatchEvent(new Event('studio-v2:open-command-palette')));
  qs('#studioWorkflowOpen')?.addEventListener('click',()=>document.dispatchEvent(new Event('studio-v2:open-workflows')));

  const ribbon=qs('.studioRibbon');

  const showContextHelp=(el,feature=null)=>{
    const panel=qs('#ribbonContext'),body=qs('#ribbonContextBody'),title=qs('#ribbonContextTitle');
    if(!panel||!body||!el)return;
    const m=renderContextualHelp(body,el,{manifest,versionInfo,feature});
    if(title)title.textContent=m?.sectionLabel||m?.controlLabel||'Aide contextuelle';
    panel.hidden=false;
    panel.classList.remove('collapsed');
  };
  ribbon?.addEventListener('click',e=>{
    const b=e.target.closest('[data-studio-action]');if(!b)return;
    showContextHelp(b,findFeature(manifest,b.dataset.studioAction)||null);
  });
  root.addEventListener('click',e=>{
    const el=e.target.closest('button,input,select,textarea,[role="button"],a[data-ui-id]');
    if(!el||el.closest('#nlabStudioV2Chrome')||el.closest('#ribbonContext'))return;
    showContextHelp(el,null);
  },true);
  root.addEventListener('focusin',e=>{
    const el=e.target.closest?.('input,select,textarea,button');
    if(!el||el.closest('#nlabStudioV2Chrome')||el.closest('#ribbonContext'))return;
    showContextHelp(el,null);
  });

  ribbon?.addEventListener('click',e=>{
    const b=e.target.closest('[data-studio-action]');if(!b)return;
    const detail={action:b.dataset.studioAction,element:b,scope:b.dataset.scope,plugin:b.dataset.plugin,featureId:b.dataset.featureId,status:b.dataset.featureStatus,capability:b.dataset.capability,studio:manifest.id};
    recordHistory({studio:manifest.id,type:'action',label:b.textContent.trim().replace(/\\s+/g,' '),detail:b.title||b.dataset.featureId||'',action:b.dataset.studioAction,repeatable:!['openPdf','openFolder','openDemo'].includes(b.dataset.studioAction)});
    document.dispatchEvent(new CustomEvent('studio-v2:action',{detail}));
  });
  root.addEventListener('click',async e=>{
    const b=e.target.closest('[data-specialized-studio],[data-advanced-studio]');if(!b)return;
    e.preventDefault();const target=b.dataset.specializedStudio||b.dataset.advancedStudio;if(!target)return;
    const detail={target,sourceStudio:manifest.id,element:b};document.dispatchEvent(new CustomEvent('studio-v2:before-specialized-open',{detail}));
    try{await openResolvedStudio(target,{query:{from:manifest.id,return:manifest.id}})}catch(err){setStatus('Studio spécialisé indisponible : '+(err.message||target));document.dispatchEvent(new CustomEvent('studio-v2:specialized-open-error',{detail:{...detail,error:err}}))}
  });
  const menu=qs('.studioMenu');
  menu?.addEventListener('click',e=>{
    const b=e.target.closest('[data-menu]');if(!b)return;
    qsa('[data-menu]',menu).forEach(x=>x.classList.toggle('active',x===b));
    recordHistory({studio:manifest.id,type:'navigation',label:'Menu '+b.textContent.trim(),detail:b.dataset.menu});
    document.dispatchEvent(new CustomEvent('studio-v2:menu',{detail:{tab:b.dataset.menu,scope:b.dataset.scope,studio:manifest.id}}));
  });
  return{manifest,versionInfo,chrome,setRibbonGroupVisible};
}
