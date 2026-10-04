import{qs,qsa,setRibbonGroupVisible,applyRibbonGroups}from'./core.js';
import{setIconTheme,iconThemeNames}from'./icon-registry.js';

const KEY='nlab-studio-v2-settings';
const DEFAULTS={
  theme:'system',
  iconTheme:'nlab-line',
  architectureMarkers:false,
  showUiIds:false,
  showDevelopment:true,
  showScopeBadges:true,
  showDevBadges:true,
  fontFamily:'system',
  fontScale:1,
  density:'normal',
  responsiveProfile:'auto',
  mobileAutoOptimize:true,
  ribbonMode:'auto',
  ribbonFavorites:[],
  sidebarMode:'normal',
  sidebarWidth:360,
  floatingWindows:true,
  headerMode:'sticky',
  headerShadow:true,
  headerBlur:true,
  headerVisible:true,
  historyLimit:10,
  historyGroupBy:'date',
  historyRetention:'keep',
  ribbonRows:'auto',
  navPlacement:'header',
  contextualHelpMode:'explicit',
  sidebarLocked:false,
  thumbnailQuality:'light',
  collectionThumbnailSize:104,
  specializedStudioPolicy:'latest',
  specializedStudioOverrides:{}
};

export function loadStudioSettings(){
  try{return {...DEFAULTS,...JSON.parse(localStorage.getItem(KEY)||'{}')}}catch{return {...DEFAULTS}}
}
export function saveStudioSettings(next){
  const value={...loadStudioSettings(),...next};
  localStorage.setItem(KEY,JSON.stringify(value));
  applyStudioSettings(value);
  document.dispatchEvent(new CustomEvent('studio-v2:settings-changed',{detail:{settings:value,changed:next}}));
  return value;
}
function resolvedResponsiveProfile(settings){
  const pref=settings.responsiveProfile||'auto';
  if(pref!=='auto')return pref;
  if(typeof matchMedia==='function'){
    if(matchMedia('(max-width: 700px)').matches)return 'mobile';
    if(matchMedia('(max-width: 1100px)').matches)return 'compact';
  }
  return 'desktop';
}
function resolvedRibbonMode(settings,profile){
  const pref=settings.ribbonMode||'auto';
  if(pref!=='auto')return pref;
  if(profile==='mobile')return 'primary';
  if(profile==='compact')return 'icons';
  return 'full';
}
export function applyStudioSettings(settings=loadStudioSettings()){
  const b=document.body;
  b.dataset.theme=settings.theme;
  setIconTheme(settings.iconTheme||'nlab-line');
  b.classList.toggle('architectureMarkers',!!settings.architectureMarkers);
  b.classList.toggle('showUiIds',!!settings.showUiIds);
  b.classList.toggle('hideDevelopment',!settings.showDevelopment);
  b.classList.toggle('hideScopeBadges',!settings.showScopeBadges);
  b.classList.toggle('hideDevBadges',!settings.showDevBadges);
  const dark=settings.theme==='dark'||(settings.theme==='system'&&matchMedia?.('(prefers-color-scheme: dark)').matches);
  b.classList.toggle('themeDark',!!dark);
  const profile=resolvedResponsiveProfile(settings);
  const ribbonMode=resolvedRibbonMode(settings,profile);
  b.dataset.responsivePreference=settings.responsiveProfile||'auto';
  b.dataset.responsiveProfile=profile;
  b.dataset.ribbonMode=ribbonMode;
  b.classList.toggle('studioMobileOptimized',profile==='mobile'&&settings.mobileAutoOptimize!==false);
  const density=(profile==='mobile'&&settings.mobileAutoOptimize!==false&&(!settings.density||settings.density==='normal'))?'mobile':(settings.density||'normal');
  b.dataset.density=density;
  b.style.setProperty('--studio-font-scale',String(settings.fontScale||1));
  const fonts={system:'system-ui,Arial,sans-serif',arial:'Arial,Helvetica,sans-serif',verdana:'Verdana,Arial,sans-serif',georgia:'Georgia,serif',mono:'ui-monospace,SFMono-Regular,Consolas,monospace'};
  b.style.setProperty('--studio-font-family',fonts[settings.fontFamily]||fonts.system);
  b.style.setProperty('--studio-sidebar-width',(Number(settings.sidebarWidth)||360)+'px');
  b.classList.toggle('studioFloatingWindowsDisabled',settings.floatingWindows===false);
  b.classList.toggle('headerHidden',settings.headerVisible===false);
  b.classList.toggle('headerShadow',!!settings.headerShadow);
  b.classList.toggle('headerBlur',!!settings.headerBlur);
  b.dataset.headerMode=settings.headerMode||'sticky';
  b.dataset.ribbonRows=settings.ribbonRows||'auto';
  const requestedNav=settings.navPlacement||'header';
  b.dataset.navPlacement=(profile==='mobile'&&settings.mobileAutoOptimize!==false&&requestedNav==='header')?'separate':requestedNav;
  b.dataset.contextualHelpMode=settings.contextualHelpMode||'explicit';
  b.classList.toggle('sidebarLocked',!!settings.sidebarLocked);
  b.dataset.thumbnailQuality=settings.thumbnailQuality||'light';
  b.style.setProperty('--collection-thumb-size',(Number(settings.collectionThumbnailSize)||104)+'px');
  const main=qs('#studioMain');if(main){main.classList.toggle('sidebarCompact',settings.sidebarMode==='compact');main.classList.toggle('sidebarWide',settings.sidebarMode==='wide');main.classList.toggle('sidebarHidden',settings.sidebarMode==='hidden')}
  if(!applyStudioSettings._responsiveBound&&typeof window!=='undefined'){
    applyStudioSettings._responsiveBound=true;
    const mqMobile=matchMedia('(max-width: 700px)'),mqCompact=matchMedia('(max-width: 1100px)');
    const refresh=()=>{const current=loadStudioSettings();if((current.responsiveProfile||'auto')==='auto')applyStudioSettings(current)};
    mqMobile.addEventListener?.('change',refresh);mqCompact.addEventListener?.('change',refresh);
  }
  return settings;
}
export function renderStudioSettingsPanel(host){
  if(!host)return;
  const s=loadStudioSettings();
  host.innerHTML=`
  <div class="coreSettingsDangerTop"><button type="button" data-core-pref="reset-ui-top">⚠ Réinitialiser l'interface</button><span>Restaure la disposition, les fenêtres et préférences du Studio Core.</span></div>
  <div class="coreSettingsGrid">
    <section>
      <h3>Apparence</h3>
      <label class="field"><span>Thème</span>
        <select data-setting="theme">
          <option value="system">Système</option>
          <option value="light">Clair</option>
          <option value="dark">Sombre</option>
        </select>
      </label>
      <label class="field"><span>Thème d’icônes</span>
        <select data-setting="iconTheme">
          ${iconThemeNames().map(id=>'<option value="'+id+'">'+id+'</option>').join('')}
        </select>
      </label>
    </section>
    <section>
      <h3>Typographie & densité</h3>
      <label class="field"><span>Police</span>
        <select data-setting="fontFamily">
          <option value="system">Système</option>
          <option value="arial">Arial</option>
          <option value="verdana">Verdana</option>
          <option value="georgia">Georgia</option>
          <option value="mono">Monospace</option>
        </select>
      </label>
      <label class="field"><span>Taille interface</span>
        <input type="range" min="0.85" max="1.25" step="0.05" data-setting="fontScale">
      </label>
      <div class="settingsScaleValue" data-scale-value></div>
      <label class="field"><span>Densité</span>
        <select data-setting="density">
          <option value="compact">Compacte</option>
          <option value="normal">Normale</option>
          <option value="comfortable">Confortable</option>
          <option value="mobile">Mobile / tactile</option>
        </select>
      </label>
      <label class="field"><span>Profil responsive</span>
        <select data-setting="responsiveProfile">
          <option value="auto">Automatique selon l’écran</option>
          <option value="desktop">Desktop</option>
          <option value="compact">Compact / tablette</option>
          <option value="mobile">Mobile / tactile</option>
        </select>
      </label>
      <label class="checkboxField"><input type="checkbox" data-setting="mobileAutoOptimize"><span>Optimiser automatiquement les panneaux et commandes en mobile</span></label>
    </section>
    <section>
      <h3>Mode développement</h3>
      <label class="checkboxField"><input type="checkbox" data-setting="architectureMarkers"><span>Repères architecture CORE / STUDIO</span></label>
      <label class="checkboxField"><input type="checkbox" data-setting="showUiIds"><span>Afficher les IDs UI dans les repères</span></label>
      <label class="checkboxField"><input type="checkbox" data-setting="showDevelopment"><span>Afficher les fonctions DÉVELOPPEMENT</span></label>
      <label class="checkboxField"><input type="checkbox" data-setting="showScopeBadges"><span>Afficher les badges CORE / STUDIO</span></label>
      <label class="checkboxField"><input type="checkbox" data-setting="showDevBadges"><span>Afficher les badges DEV</span></label>
    </section>
    <section>
      <h3>Header & navigation</h3>
      <label class="field"><span>Comportement du header</span>
        <select data-setting="headerMode">
          <option value="sticky">Sticky / suit le défilement</option>
          <option value="fixed">Fixe</option>
          <option value="static">Statique</option>
        </select>
      </label>
      <label class="checkboxField"><input type="checkbox" data-setting="headerVisible"><span>Afficher le header</span></label>
      <label class="checkboxField"><input type="checkbox" data-setting="headerShadow"><span>Ombre du header</span></label>
      <label class="checkboxField"><input type="checkbox" data-setting="headerBlur"><span>Fond translucide / blur</span></label>
    </section>
    <section>
      <h3>Historique & récents</h3>
      <label class="field"><span>Historique rapide</span>
        <select id="history-display-limit" data-setting="historyLimit">
          <option value="5">5 éléments</option>
          <option value="10">10 éléments</option>
          <option value="15">15 éléments</option>
          <option value="20">20 éléments</option>
        </select>
      </label>
      <label class="field"><span>Regroupement par défaut</span>
        <select id="history-default-group" data-setting="historyGroupBy">
          <option value="date">Date</option>
          <option value="studio">Studio</option>
          <option value="type">Type d’action</option>
        </select>
      </label>
      <label class="field"><span>Conservation</span>
        <select id="history-retention-mode" data-setting="historyRetention">
          <option value="keep">Conserver l’historique</option>
          <option value="30d">Conserver 30 jours</option>
          <option value="90d">Conserver 90 jours</option>
          <option value="manual">Nettoyage manuel</option>
        </select>
      </label>
      <button id="history-settings-view-all" type="button" data-open-full-history>Voir tout l’historique</button>
    </section>
    <section>
      <h3>Studios spécialisés</h3>
      <label class="field"><span>Version par défaut</span>
        <select data-setting="specializedStudioPolicy">
          <option value="latest">Dernière version disponible</option>
          <option value="current">CURRENT</option>
          <option value="test">TEST</option>
        </select>
      </label>
      <p class="settingsHint">« Dernière version disponible » compare CURRENT et TEST et ouvre la version sémantiquement la plus récente. Les versions historiques sont exclues.</p>
      <details><summary>Overrides par Studio</summary><div id="specialized-studio-overrides" class="studioOverrideList"><span class="muted">Chargement du catalogue…</span></div></details>
    </section>
    <section>
      <h3>Interface & panneaux</h3>
      <label class="field"><span>Volet détaillé</span>
        <select data-setting="sidebarMode">
          <option value="normal">Normal</option>
          <option value="compact">Compact</option>
          <option value="wide">Large</option>
          <option value="hidden">Masqué</option>
        </select>
      </label>
      <label class="field"><span>Largeur du volet</span><div class="settingsDualInput"><input type="range" min="220" max="720" step="10" data-setting="sidebarWidth"><input type="number" min="220" max="720" step="10" data-setting-number="sidebarWidth"></div></label>
      <label class="checkboxField"><input type="checkbox" data-setting="sidebarLocked"><span>Figer la largeur du volet</span></label>
      <label class="checkboxField"><input type="checkbox" data-setting="floatingWindows"><span>Fenêtres flottantes / ancrables</span></label>
      <label class="field"><span>Menus Studio</span><select data-setting="navPlacement"><option value="header">Dans la bande haute</option><option value="separate">Bande séparée</option><option value="hidden">Masqués</option></select></label>
      <label class="field"><span>Aide contextuelle</span><select data-setting="contextualHelpMode"><option value="explicit">À la demande</option><option value="auto">Automatique</option></select></label>
      <label class="field"><span>Ruban</span><select data-setting="ribbonRows"><option value="auto">Auto</option><option value="one">1 ligne</option><option value="two">2 lignes</option></select></label>
      <label class="field"><span>Présentation du ruban</span><select data-setting="ribbonMode"><option value="auto">Auto</option><option value="full">Complet</option><option value="compact">Compact</option><option value="icons">Icônes seules</option><option value="primary">Actions principales</option></select></label>
      <div id="ribbon-action-settings"></div>
      <label class="field"><span>Miniatures collections</span><select data-setting="thumbnailQuality"><option value="light">Légères / rapides</option><option value="standard">Standard</option></select></label>
      <label class="field"><span>Taille des vignettes</span><input type="range" min="64" max="220" step="8" data-setting="collectionThumbnailSize"></label>
      <div class="settingsScaleValue" data-thumbnail-size-value></div>
      <button data-core-pref="expand-ribbon">Déplier le ruban</button>
      <button data-core-pref="collapse-ribbon">Replier le ruban</button>
      <div id="ribbon-group-settings"></div>
      <button data-core-pref="reset-ui">Réinitialiser l'interface</button>
    </section>
  </div>`;
  host.querySelector('[data-setting="theme"]').value=s.theme;
  for(const k of ['fontFamily','density','responsiveProfile','ribbonMode','sidebarMode','headerMode','historyLimit','historyGroupBy','historyRetention','ribbonRows','thumbnailQuality','specializedStudioPolicy','navPlacement','contextualHelpMode']){const el=host.querySelector('[data-setting="'+k+'"]');if(el)el.value=s[k]}
  const iconThemeSelect=host.querySelector('[data-setting="iconTheme"]');if(iconThemeSelect)iconThemeSelect.value=s.iconTheme||'nlab-line';
  host.querySelector('[data-setting="fontScale"]').value=s.fontScale;
  host.querySelector('[data-setting="sidebarWidth"]').value=s.sidebarWidth;
  const sidebarNumber=host.querySelector('[data-setting-number="sidebarWidth"]');if(sidebarNumber)sidebarNumber.value=s.sidebarWidth;
  host.querySelector('[data-setting="collectionThumbnailSize"]').value=s.collectionThumbnailSize;
  const scaleOut=host.querySelector('[data-scale-value]');if(scaleOut)scaleOut.textContent=Math.round(Number(s.fontScale||1)*100)+' %';const thumbOut=host.querySelector('[data-thumbnail-size-value]');if(thumbOut)thumbOut.textContent=Math.round(Number(s.collectionThumbnailSize||104))+' px';
  for(const k of ['architectureMarkers','showUiIds','showDevelopment','showScopeBadges','showDevBadges','mobileAutoOptimize','floatingWindows','headerVisible','headerShadow','headerBlur','sidebarLocked']){
    host.querySelector('[data-setting="'+k+'"]').checked=!!s[k];
  }
  const overrideHost=host.querySelector('#specialized-studio-overrides');
  if(overrideHost){(async()=>{try{const catalogUrl=new URL('../../studios/catalog.json',import.meta.url),r=await fetch(catalogUrl,{cache:'no-store'});if(!r.ok)throw new Error('HTTP '+r.status);const data=await r.json(),current=loadStudioSettings().specializedStudioOverrides||{};overrideHost.innerHTML=(data.studios||[]).filter(x=>x.id!=='pdf-studio').map(x=>'<label class="field studioOverrideRow"><span>'+x.name+'</span><select data-studio-override="'+x.id+'"><option value="inherit">Hériter</option><option value="latest">Dernière version</option><option value="current">CURRENT</option><option value="test">TEST</option></select></label>').join('')||'<span class="muted">Aucun Studio spécialisé.</span>';overrideHost.querySelectorAll('[data-studio-override]').forEach(el=>{el.value=current[el.dataset.studioOverride]||'inherit';el.onchange=()=>{const s=loadStudioSettings(),next={...(s.specializedStudioOverrides||{}),[el.dataset.studioOverride]:el.value};saveStudioSettings({specializedStudioOverrides:next})}})}catch(e){overrideHost.textContent='Catalogue indisponible : '+e.message}})()}
  const actionHost=host.querySelector('#ribbon-action-settings');
  if(actionHost){
    const buttons=qsa('.ribbonBtn[data-studio-action]').map(b=>({action:b.dataset.studioAction,label:b.querySelector('.ribbonBtnLabel')?.textContent?.trim()||b.title||b.dataset.studioAction,primary:b.classList.contains('primary')})).filter(x=>x.action);
    const chosen=new Set(Array.isArray(s.ribbonFavorites)?s.ribbonFavorites:[]);
    const useDefault=chosen.size===0;
    actionHost.innerHTML='<details><summary>Actions principales du ruban</summary><div class="ribbonFavoriteGrid">'+buttons.map(x=>'<label class="checkboxField"><input type="checkbox" data-ribbon-favorite="'+x.action+'" '+((chosen.has(x.action)||(useDefault&&x.primary))?'checked':'')+'><span>'+x.label+'</span></label>').join('')+'</div><button type="button" data-reset-ribbon-favorites>Réinitialiser les actions principales</button></details>';
    const saveFavorites=()=>saveStudioSettings({ribbonFavorites:[...actionHost.querySelectorAll('[data-ribbon-favorite]:checked')].map(x=>x.dataset.ribbonFavorite)});
    actionHost.querySelectorAll('[data-ribbon-favorite]').forEach(el=>el.addEventListener('change',saveFavorites));
    actionHost.querySelector('[data-reset-ribbon-favorites]')?.addEventListener('click',()=>saveStudioSettings({ribbonFavorites:[]}));
  }
  const ribbonHost=host.querySelector('#ribbon-group-settings');
  if(ribbonHost){
    const groups=qsa('[data-ribbon-group]').map(g=>({id:g.dataset.ribbonGroup,label:g.querySelector('.ribbonLabel')?.textContent?.trim()||g.dataset.ribbonGroup}));
    ribbonHost.innerHTML='<h4>Groupes du ruban</h4>'+groups.map(g=>'<label class="checkboxField"><input type="checkbox" data-ribbon-setting="'+g.id+'" '+(localStorage.getItem('nlab-studio-v2-ribbon-'+g.id)==='0'?'':'checked')+'><span>'+g.label+'</span></label>').join('');
    ribbonHost.querySelectorAll('[data-ribbon-setting]').forEach(el=>el.addEventListener('change',()=>{setRibbonGroupVisible(el.dataset.ribbonSetting,el.checked);applyRibbonGroups()}));
  }
  host.querySelectorAll('[data-setting-number]').forEach(el=>el.addEventListener('change',()=>{const k=el.dataset.settingNumber,v=Math.max(220,Math.min(720,Number(el.value)||360));const range=host.querySelector('[data-setting="'+k+'"]');if(range)range.value=v;saveStudioSettings({[k]:v})}));
  host.querySelectorAll('[data-setting]').forEach(el=>{
    const handler=()=>{const k=el.dataset.setting;let v=el.type==='checkbox'?el.checked:el.value;if(['fontScale','sidebarWidth','historyLimit','collectionThumbnailSize'].includes(k))v=Number(v);saveStudioSettings({[k]:v});if(k==='historyGroupBy'){try{localStorage.setItem('nlab-studio-v2-history-filter',JSON.stringify({...JSON.parse(localStorage.getItem('nlab-studio-v2-history-filter')||'{}'),groupBy:v}))}catch{}}document.dispatchEvent(new CustomEvent('studio-v2:history-changed'));const o=host.querySelector('[data-scale-value]');if(o)o.textContent=Math.round(Number(loadStudioSettings().fontScale||1)*100)+' %';const t=host.querySelector('[data-thumbnail-size-value]');if(t)t.textContent=Math.round(Number(loadStudioSettings().collectionThumbnailSize||104))+' px'};
    el.addEventListener('change',handler);if(el.type==='range')el.addEventListener('input',handler);
  });
  host.querySelector('[data-core-pref="expand-ribbon"]')?.addEventListener('click',()=>{localStorage.setItem('nlab-studio-v2-ribbon-collapsed','0');location.reload()});
  host.querySelector('[data-core-pref="collapse-ribbon"]')?.addEventListener('click',()=>{localStorage.setItem('nlab-studio-v2-ribbon-collapsed','1');location.reload()});
  const resetInterface=()=>{
    if(!confirm("Réinitialiser complètement l’interface Studio Core ? Cette action efface les préférences de disposition, fenêtres et ruban."))return;
    localStorage.removeItem(KEY);
    [...Object.keys(localStorage)].filter(k=>k.startsWith('nlab-studio-v2-')||k.startsWith('nlab.inputPicker.')).forEach(k=>localStorage.removeItem(k));
    location.reload();
  };
  host.querySelector('[data-core-pref="reset-ui"]')?.addEventListener('click',resetInterface);
  host.querySelector('[data-core-pref="reset-ui-top"]')?.addEventListener('click',resetInterface);
}
