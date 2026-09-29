import{qs,qsa,setRibbonGroupVisible,applyRibbonGroups}from'./core.js';

const KEY='nlab-studio-v2-settings';
const DEFAULTS={
  theme:'system',
  architectureMarkers:true,
  showUiIds:true,
  showDevelopment:true,
  showScopeBadges:true,
  showDevBadges:true,
  fontFamily:'system',
  fontScale:1,
  density:'normal',
  sidebarMode:'normal',
  sidebarWidth:360,
  floatingWindows:true,
  headerMode:'sticky',
  headerShadow:true,
  headerBlur:true,
  headerVisible:true,
  historyLimit:10,
  historyGroupBy:'date',
  historyRetention:'keep'
};

export function loadStudioSettings(){
  try{return {...DEFAULTS,...JSON.parse(localStorage.getItem(KEY)||'{}')}}catch{return {...DEFAULTS}}
}
export function saveStudioSettings(next){
  const value={...loadStudioSettings(),...next};
  localStorage.setItem(KEY,JSON.stringify(value));
  applyStudioSettings(value);
  return value;
}
export function applyStudioSettings(settings=loadStudioSettings()){
  const b=document.body;
  b.dataset.theme=settings.theme;
  b.classList.toggle('architectureMarkers',!!settings.architectureMarkers);
  b.classList.toggle('showUiIds',!!settings.showUiIds);
  b.classList.toggle('hideDevelopment',!settings.showDevelopment);
  b.classList.toggle('hideScopeBadges',!settings.showScopeBadges);
  b.classList.toggle('hideDevBadges',!settings.showDevBadges);
  const dark=settings.theme==='dark'||(settings.theme==='system'&&matchMedia?.('(prefers-color-scheme: dark)').matches);
  b.classList.toggle('themeDark',!!dark);
  b.dataset.density=settings.density||'normal';
  b.style.setProperty('--studio-font-scale',String(settings.fontScale||1));
  const fonts={system:'system-ui,Arial,sans-serif',arial:'Arial,Helvetica,sans-serif',verdana:'Verdana,Arial,sans-serif',georgia:'Georgia,serif',mono:'ui-monospace,SFMono-Regular,Consolas,monospace'};
  b.style.setProperty('--studio-font-family',fonts[settings.fontFamily]||fonts.system);
  b.style.setProperty('--studio-sidebar-width',(Number(settings.sidebarWidth)||360)+'px');
  b.classList.toggle('studioFloatingWindowsDisabled',settings.floatingWindows===false);
  b.classList.toggle('headerHidden',settings.headerVisible===false);
  b.classList.toggle('headerShadow',!!settings.headerShadow);
  b.classList.toggle('headerBlur',!!settings.headerBlur);
  b.dataset.headerMode=settings.headerMode||'sticky';
  const main=qs('#studioMain');if(main){main.classList.toggle('sidebarCompact',settings.sidebarMode==='compact');main.classList.toggle('sidebarWide',settings.sidebarMode==='wide');main.classList.toggle('sidebarHidden',settings.sidebarMode==='hidden')}
  return settings;
}
export function renderStudioSettingsPanel(host){
  if(!host)return;
  const s=loadStudioSettings();
  host.innerHTML=`
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
        </select>
      </label>
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
      <h3>Interface & panneaux</h3>
      <label class="field"><span>Volet détaillé</span>
        <select data-setting="sidebarMode">
          <option value="normal">Normal</option>
          <option value="compact">Compact</option>
          <option value="wide">Large</option>
          <option value="hidden">Masqué</option>
        </select>
      </label>
      <label class="field"><span>Largeur du volet</span><input type="range" min="220" max="620" step="10" data-setting="sidebarWidth"></label>
      <label class="checkboxField"><input type="checkbox" data-setting="floatingWindows"><span>Fenêtres flottantes / ancrables</span></label>
      <button data-core-pref="expand-ribbon">Déplier le ruban</button>
      <button data-core-pref="collapse-ribbon">Replier le ruban</button>
      <div id="ribbon-group-settings"></div>
      <button data-core-pref="reset-ui">Réinitialiser l'interface</button>
    </section>
  </div>`;
  host.querySelector('[data-setting="theme"]').value=s.theme;
  for(const k of ['fontFamily','density','sidebarMode','headerMode','historyLimit','historyGroupBy','historyRetention'])host.querySelector('[data-setting="'+k+'"]').value=s[k];
  host.querySelector('[data-setting="fontScale"]').value=s.fontScale;
  host.querySelector('[data-setting="sidebarWidth"]').value=s.sidebarWidth;
  const scaleOut=host.querySelector('[data-scale-value]');if(scaleOut)scaleOut.textContent=Math.round(Number(s.fontScale||1)*100)+' %';
  for(const k of ['architectureMarkers','showUiIds','showDevelopment','showScopeBadges','showDevBadges','floatingWindows','headerVisible','headerShadow','headerBlur']){
    host.querySelector('[data-setting="'+k+'"]').checked=!!s[k];
  }
  const ribbonHost=host.querySelector('#ribbon-group-settings');
  if(ribbonHost){
    const groups=qsa('[data-ribbon-group]').map(g=>({id:g.dataset.ribbonGroup,label:g.querySelector('.ribbonLabel')?.textContent?.trim()||g.dataset.ribbonGroup}));
    ribbonHost.innerHTML='<h4>Groupes du ruban</h4>'+groups.map(g=>'<label class="checkboxField"><input type="checkbox" data-ribbon-setting="'+g.id+'" '+(localStorage.getItem('nlab-studio-v2-ribbon-'+g.id)==='0'?'':'checked')+'><span>'+g.label+'</span></label>').join('');
    ribbonHost.querySelectorAll('[data-ribbon-setting]').forEach(el=>el.addEventListener('change',()=>{setRibbonGroupVisible(el.dataset.ribbonSetting,el.checked);applyRibbonGroups()}));
  }
  host.querySelectorAll('[data-setting]').forEach(el=>{
    const handler=()=>{const k=el.dataset.setting;let v=el.type==='checkbox'?el.checked:el.value;if(['fontScale','sidebarWidth','historyLimit'].includes(k))v=Number(v);saveStudioSettings({[k]:v});if(k==='historyGroupBy'){try{localStorage.setItem('nlab-studio-v2-history-filter',JSON.stringify({...JSON.parse(localStorage.getItem('nlab-studio-v2-history-filter')||'{}'),groupBy:v}))}catch{}}document.dispatchEvent(new CustomEvent('studio-v2:history-changed'));const o=host.querySelector('[data-scale-value]');if(o)o.textContent=Math.round(Number(loadStudioSettings().fontScale||1)*100)+' %'};
    el.addEventListener('change',handler);if(el.type==='range')el.addEventListener('input',handler);
  });
  host.querySelector('[data-core-pref="expand-ribbon"]')?.addEventListener('click',()=>{localStorage.setItem('nlab-studio-v2-ribbon-collapsed','0');location.reload()});
  host.querySelector('[data-core-pref="collapse-ribbon"]')?.addEventListener('click',()=>{localStorage.setItem('nlab-studio-v2-ribbon-collapsed','1');location.reload()});
  host.querySelector('[data-core-pref="reset-ui"]')?.addEventListener('click',()=>{
    localStorage.removeItem(KEY);
    [...Object.keys(localStorage)].filter(k=>k.startsWith('nlab-studio-v2-')).forEach(k=>localStorage.removeItem(k));
    location.reload();
  });
}
