import{qs,qsa,bindStudioChrome,applyRibbonGroups,setRibbonGroupVisible,setStatus}from'./core.js';
import{applyStudioSettings,renderStudioSettingsPanel,saveStudioSettings,loadStudioSettings}from'./settings.js';
import{enhanceStudioWindow,showStudioWindow,hideStudioWindow,bringStudioWindowToFront,restoreAllStudioWindows}from'./window-system.js';
import{mountHistoryUI,recordHistory}from'./history.js';
import{icon,loadIconThemeCatalog}from'./icon-registry.js';
import{registerCapabilities}from'./capability-registry.js';
import{mountCommandPalette}from'./command-palette.js';
import{mountWorkflowUI}from'./workflow-ui.js';
import{openStudio as openResolvedStudio}from'./studio-link-resolver.js';
import{findFeature,renderContextualHelp}from'./help.js';
import{registerCorePanel,getCorePanel,listCorePanels}from'./panel-registry.js';

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
  const isInputLauncher=scope==='core'&&String(it.action||'')==='open';
  const iconName=isInputLauncher?'inputAcquire':(it.icon||'command');
  const label=isInputLauncher?(it.inputLabel||'Ajouter / Choisir une entrée'):(it.label||'');
  return '<button id="'+esc(domId)+'" data-ui-id="'+esc(featureId)+'"'+
    ' class="ribbonBtn scope-'+visualScope+(it.primary?' primary':'')+(isInputLauncher?' ribbonInputLauncher':'')+(dev?' devFeatureBtn':'')+'"'+
    ' data-scope="'+scope+'" data-plugin="'+esc(plugin)+'" data-feature-id="'+esc(featureId)+'" data-feature-status="'+esc(status)+'" data-capability="'+esc(capability)+'" data-studio-action="'+esc(it.action||it.id||'')+'" data-tooltip="'+esc(it.title||label)+'" aria-label="'+esc(it.title||label)+'" title="'+esc(it.title||label)+'">'+
    '<span class="scopeIcon">'+icon(iconName)+'</span><span class="ribbonBtnLabel">'+esc(label)+'</span>'+
    '<small class="scopeBadge">'+scope.toUpperCase()+'</small>'+(dev?'<small class="devBadge">DEV</small>':'')+'</button>';
}
export async function mountStudioV2({manifest,versionInfo={version:'',status:'TEST'},root=document.body}={}){
  if(!manifest)throw new Error('Manifest Studio V2 requis');
  try{await loadIconThemeCatalog()}catch(e){console.warn('Icon theme catalog unavailable',e)}
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
      <button id="studioCommandOpen" class="studioNavAction scope-core" data-scope="core" title="Rechercher une commande (Ctrl+K)">⌕ Commandes</button><button id="studioWorkflowOpen" class="studioNavAction scope-core" data-scope="core" title="Workflows enregistrés">Workflows</button><button id="studioContextHelpOpen" class="studioNavAction scope-core" data-scope="core" title="Aide contextuelle">? Aide</button><button id="studioCoreSettings" class="studioNavAction scope-core" data-scope="core" title="Paramètres du Studio Core">⚙ Core</button>
      <a class="studioNavAction scope-core" data-scope="core" href="${esc(manifest.versionsHref||'./versions.html')}">Versions</a>
    </nav>
  </div>
</header>
<nav class="studioMenu">
  ${(manifest.menus||[]).map((m,i)=>'<button class="scope-'+scopeClass(m)+(i===0?' active':'')+'" data-scope="'+scopeOf(m)+'" data-menu="'+esc(m.id)+'">'+esc(m.label)+'<small class="scopeBadge">'+scopeOf(m).toUpperCase()+'</small></button>').join('')}
  <button id="studioVisibilityOpen" class="studioMenuUtility scope-core" data-scope="core" title="Afficher / masquer les menus et groupes du ruban">${icon('eye')}<span>Affichage</span></button><button id="studioRestoreWindows" class="studioMenuUtility scope-core" data-scope="core" title="Restaurer toutes les fenêtres masquées">${icon('restore')}<span>Fenêtres</span></button>
</nav>
<div class="studioRibbon">
  ${(manifest.ribbon||[]).map(g=>'<div class="ribbonGroup scope-'+scopeClass(g)+'" data-scope="'+scopeOf(g)+'" data-ribbon-group="'+esc(g.id)+'">'+(g.items||[]).map(itemButton).join('')+'<span class="ribbonLabel">'+esc(g.label||g.id)+'</span></div>').join('')}
  <button id="studioRibbonToggle" class="studioRibbonToggle scope-core" data-scope="core" title="Replier/déplier le ruban">⌃<small class="scopeBadge">CORE</small></button>
</div>
<div id="ribbonContext" class="ribbonContext scope-core" data-scope="core" hidden>
  <div class="ribbonContextHead"><strong id="ribbonContextTitle">Outil</strong><button id="ribbonContextDetails">Détails</button><button id="ribbonContextToggle">⌃</button><button id="ribbonContextClose">×</button></div>
  <div id="ribbonContextBody"></div>
</div>
<div id="studioMobileBackdrop" class="studioMobileBackdrop" hidden></div>
<nav id="studioMobileDock" class="studioMobileDock scope-core" data-scope="core" aria-label="Accès rapides mobile">
  <button type="button" data-mobile-action="ribbon" title="Afficher toutes les actions">${icon('command')}<span>Ruban</span></button>
  <button type="button" data-mobile-action="tools" title="Ouvrir les outils">${icon('settings')}<span>Outils</span></button>
  <button type="button" data-mobile-action="commands" title="Rechercher une commande">${icon('search')}<span>Commandes</span></button>
  <button type="button" data-mobile-action="settings" title="Paramètres d’affichage">${icon('settings')}<span>Réglages</span></button>
</nav>
<div id="studioTouchTooltip" class="studioTouchTooltip" hidden></div>
<div id="studioCoreSettingsPanel" class="coreSettingsPanel scope-core" data-scope="core" hidden>
 <div class="coreSettingsHead"><strong>Paramètres Studio Core</strong><button id="studioCoreSettingsClose" aria-label="Fermer">×</button></div>
 <div id="studioCoreSettingsBody"></div>
</div>
<div id="studioContextHelpWindow" class="floatingHelpWindow scope-core" data-scope="core" hidden>
 <div id="studioContextHelpBody"></div>
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
    const commit=versionInfo.build?.commitShort||'',commitDate=versionInfo.build?.commitDate||'',buildMeta=commit?(' · '+commit+(commitDate?' · '+new Date(commitDate).toLocaleDateString('fr-FR'):'')):'';
    s.innerHTML='<span><span class="statusDot"></span><span id="studioStatusText">Prêt</span></span><span class="grow">'+esc(manifest.name)+studioVer+' '+esc(versionInfo.status||'')+' · Studio Core'+coreVer+esc(buildMeta)+'</span>';root.append(s);
  }

  document.body.dataset.studio=manifest.id||'studio';
  document.body.dataset.studioVersion=versionInfo.version||'';
  document.body.dataset.studioCoreVersion=versionInfo.coreVersion||'';
  registerCapabilities(manifest);
  applyStudioSettings();
  const syncRibbonPersonalization=()=>{
    const settings=loadStudioSettings(),favorites=new Set(Array.isArray(settings.ribbonFavorites)?settings.ribbonFavorites:[]);
    qsa('.ribbonBtn[data-studio-action]',chrome).forEach(b=>{
      const selected=favorites.size?favorites.has(b.dataset.studioAction):b.classList.contains('primary');
      b.classList.toggle('ribbonFavorite',selected);
      if(!b.dataset.tooltip)b.dataset.tooltip=b.title||b.querySelector('.ribbonBtnLabel')?.textContent?.trim()||b.dataset.studioAction;
    });
  };
  const applySavedRibbonOrder=()=>{
    qsa('[data-ribbon-group]',chrome).forEach(group=>{
      let order=[];try{order=JSON.parse(localStorage.getItem('nlab-studio-v2-ribbon-order-'+manifest.id+'-'+group.dataset.ribbonGroup)||'[]')}catch{}
      if(!Array.isArray(order)||!order.length)return;
      const byAction=new Map(qsa('.ribbonBtn[data-studio-action]',group).map(b=>[b.dataset.studioAction,b]));
      for(const action of order){const b=byAction.get(action);if(b)group.insertBefore(b,group.querySelector('.ribbonLabel'))}
    });
  };
  syncRibbonPersonalization();applySavedRibbonOrder();
  document.addEventListener('studio-v2:settings-changed',syncRibbonPersonalization);
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
  const helpWindow=qs('#studioContextHelpWindow');
  registerCorePanel({key:'core-settings',title:'Paramètres Studio Core',selector:'#studioCoreSettingsPanel',priority:'normal',defaultMode:'free',restorable:true,escapeCloses:true});
  registerCorePanel({key:'context-help',title:'Aide contextuelle',selector:'#studioContextHelpWindow',priority:'topmost',defaultMode:'free',restorable:true,escapeCloses:true});
  for(const def of listCorePanels()){
    const panel=def.selector?qs(def.selector):null;if(!panel)continue;
    enhanceStudioWindow(panel,{key:def.key,title:def.title,topmost:def.priority==='topmost',restorable:def.restorable,escapeCloses:def.escapeCloses,capabilities:def.capabilities});
  }
  const syncCorePanelModes=()=>{
    const s=loadStudioSettings();
    const applyMode=(panel,mode,kind)=>{
      if(!panel)return;
      panel.classList.remove('corePanelFree','corePanelFixedLeft','corePanelFixedRight');
      panel.classList.add(mode==='fixed-left'?'corePanelFixedLeft':mode==='fixed-right'?'corePanelFixedRight':'corePanelFree');
      panel.dataset.panelMode=mode||'free';
      panel.dataset.panelRegistryKey=kind==='help'?'context-help':'core-settings';
      if(mode==='hidden'){
        panel.hidden=true;
      }else if(!panel.hidden){
        bringStudioWindowToFront(panel);
      }
      if(kind==='help')panel.classList.toggle('contextHelpDisabled',s.contextualHelpEnabled===false);
    };
    applyMode(settingsPanel,s.coreSettingsPanelMode||'free','settings');
    applyMode(helpWindow,s.contextualHelpPanelMode||'free','help');
    if(s.contextualHelpEnabled===false&&helpWindow)helpWindow.hidden=true;
  };
  syncCorePanelModes();
  document.addEventListener('studio-v2:settings-changed',syncCorePanelModes);
  qs('#studioCoreSettings')?.addEventListener('click',()=>{if(!settingsPanel)return;renderStudioSettingsPanel(qs('#studioCoreSettingsBody'));const s=loadStudioSettings();if(s.coreSettingsPanelMode==='hidden'){settingsPanel.classList.remove('corePanelFixedLeft','corePanelFixedRight');settingsPanel.classList.add('corePanelFree')}showStudioWindow('core-settings');bringStudioWindowToFront(settingsPanel)});
  qs('#studioCoreSettingsClose')?.addEventListener('click',()=>{if(settingsPanel)hideStudioWindow('core-settings')});
  qs('#studioCommandOpen')?.addEventListener('click',()=>document.dispatchEvent(new Event('studio-v2:open-command-palette')));
  qs('#studioWorkflowOpen')?.addEventListener('click',()=>document.dispatchEvent(new Event('studio-v2:open-workflows')));
  qs('#studioRestoreWindows')?.addEventListener('click',()=>restoreAllStudioWindows());
  document.addEventListener('studio-v2:window-state',e=>{const d=e.detail||{};if(!d.key)return;document.body.dataset.lastCoreWindow=d.key;document.body.dataset.lastCoreWindowAction=d.action||''});

  const ribbon=qs('.studioRibbon');
  const mobileDock=qs('#studioMobileDock'),mobileBackdrop=qs('#studioMobileBackdrop'),touchTooltip=qs('#studioTouchTooltip');
  const studioMenu=qs('.studioMenu');
  const headerInner=qs('.studioHeaderInner');
  const syncMenuPlacement=()=>{
    const mode=document.body.dataset.navPlacement||'header';
    if(!studioMenu||!headerInner)return;
    studioMenu.hidden=mode==='hidden';
    if(mode==='header'){
      studioMenu.classList.add('studioMenuIntegrated');
      if(studioMenu.parentElement!==headerInner)headerInner.append(studioMenu);
    }else{
      studioMenu.classList.remove('studioMenuIntegrated');
      if(studioMenu.parentElement!==chrome)chrome.insertBefore(studioMenu,qs('.studioRibbon'));
    }
  };
  syncMenuPlacement();
  const mo=new MutationObserver(syncMenuPlacement);mo.observe(document.body,{attributes:true,attributeFilter:['data-nav-placement']});

  const closeMobileSurfaces=()=>{document.body.classList.remove('studioMobileSidebarOpen','studioMobileRibbonExpanded');if(mobileBackdrop)mobileBackdrop.hidden=true};
  const setMobileSidebar=open=>{document.body.classList.toggle('studioMobileSidebarOpen',!!open);if(mobileBackdrop)mobileBackdrop.hidden=!open};
  mobileDock?.addEventListener('click',e=>{
    const action=e.target.closest('[data-mobile-action]')?.dataset.mobileAction;if(!action)return;
    if(action==='tools'){setMobileSidebar(!document.body.classList.contains('studioMobileSidebarOpen'));return}
    if(action==='ribbon'){document.body.classList.toggle('studioMobileRibbonExpanded');return}
    if(action==='commands'){document.dispatchEvent(new Event('studio-v2:open-command-palette'));return}
    if(action==='settings'){const panel=qs('#studioCoreSettingsPanel');if(panel){renderStudioSettingsPanel(qs('#studioCoreSettingsBody'));showStudioWindow('core-settings');bringStudioWindowToFront(panel)}return}
  });
  mobileBackdrop?.addEventListener('click',closeMobileSurfaces);
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&document.body.dataset.responsiveProfile==='mobile')closeMobileSurfaces()});

  qsa('[data-ribbon-group]',chrome).forEach(group=>{
    const buttons=qsa('.ribbonBtn[data-studio-action]',group);
    buttons.forEach(b=>{
      b.draggable=true;
      b.addEventListener('dragstart',e=>{if(matchMedia?.('(pointer: coarse)').matches){e.preventDefault();return}e.dataTransfer?.setData('text/plain',b.dataset.studioAction);b.classList.add('ribbonDragging')});
      b.addEventListener('dragend',()=>b.classList.remove('ribbonDragging'));
      b.addEventListener('dragover',e=>{if(!matchMedia?.('(pointer: coarse)').matches)e.preventDefault()});
      b.addEventListener('drop',e=>{
        e.preventDefault();const action=e.dataTransfer?.getData('text/plain'),src=buttons.find(x=>x.dataset.studioAction===action);if(!src||src===b)return;
        const rect=b.getBoundingClientRect(),before=e.clientX<rect.left+rect.width/2;group.insertBefore(src,before?b:b.nextSibling);
        const order=qsa('.ribbonBtn[data-studio-action]',group).map(x=>x.dataset.studioAction);
        localStorage.setItem('nlab-studio-v2-ribbon-order-'+manifest.id+'-'+group.dataset.ribbonGroup,JSON.stringify(order));
      });
    });
  });

  let tooltipTimer=null;
  const hideTouchTooltip=()=>{clearTimeout(tooltipTimer);tooltipTimer=null;if(touchTooltip)touchTooltip.hidden=true};
  root.addEventListener('pointerdown',e=>{
    if(e.pointerType!=='touch')return;const target=e.target.closest('[data-tooltip],button[title]');if(!target)return;
    hideTouchTooltip();tooltipTimer=setTimeout(()=>{
      if(!touchTooltip)return;const label=target.dataset.tooltip||target.title||target.getAttribute('aria-label');if(!label)return;
      const r=target.getBoundingClientRect();touchTooltip.textContent=label;touchTooltip.hidden=false;
      touchTooltip.style.left=Math.max(8,Math.min(window.innerWidth-220,r.left+r.width/2-100))+'px';
      touchTooltip.style.top=Math.max(8,r.top-46)+'px';
    },520);
  },true);
  root.addEventListener('pointerup',()=>setTimeout(hideTouchTooltip,900),true);
  root.addEventListener('pointercancel',hideTouchTooltip,true);
  root.addEventListener('scroll',hideTouchTooltip,true);

  let lastContextEl=null,lastContextFeature=null;
  const rememberContext=(el,feature=null)=>{if(el){lastContextEl=el;lastContextFeature=feature}};
  const showContextHelp=(el=lastContextEl,feature=lastContextFeature)=>{
    const panel=helpWindow,body=qs('#studioContextHelpBody'),s=loadStudioSettings();
    if(!panel||!body||!el||s.contextualHelpEnabled===false||s.contextualHelpPanelMode==='hidden')return;
    renderContextualHelp(body,el,{manifest,versionInfo,feature});
    showStudioWindow('context-help');bringStudioWindowToFront(panel);
  };
  ribbon?.addEventListener('click',e=>{
    const b=e.target.closest('[data-studio-action]');if(!b)return;
    const feature=findFeature(manifest,b.dataset.studioAction)||null;rememberContext(b,feature);
    if((document.body.dataset.contextualHelpMode||'explicit')==='auto')showContextHelp(b,feature);
  });
  root.addEventListener('click',e=>{
    const el=e.target.closest('button,input,select,textarea,[role="button"],a[data-ui-id]');
    if(!el||el.closest('#studioContextHelpWindow'))return;
    const feature=el.dataset?.studioAction?findFeature(manifest,el.dataset.studioAction)||null:null;rememberContext(el,feature);
    if((document.body.dataset.contextualHelpMode||'explicit')==='auto'&&!el.closest('#nlabStudioV2Chrome'))setTimeout(()=>showContextHelp(el,feature),0);
  },true);
  root.addEventListener('focusin',e=>{
    const el=e.target.closest?.('input,select,textarea,button');if(el&&!el.closest('#studioContextHelpWindow'))rememberContext(el,null);
  });
  qs('#studioContextHelpOpen')?.addEventListener('click',()=>{const s=loadStudioSettings();if(!helpWindow||s.contextualHelpEnabled===false||s.contextualHelpPanelMode==='hidden')return;if(!helpWindow.hidden){hideStudioWindow('context-help');return}showContextHelp(lastContextEl||document.activeElement,lastContextFeature)});

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
