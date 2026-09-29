import{qs}from'./core.js';

const KEY='nlab-studio-v2-settings';
const DEFAULTS={
  theme:'system',
  architectureMarkers:true,
  showDevelopment:true,
  showScopeBadges:true,
  showDevBadges:true
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
  b.classList.toggle('hideDevelopment',!settings.showDevelopment);
  b.classList.toggle('hideScopeBadges',!settings.showScopeBadges);
  b.classList.toggle('hideDevBadges',!settings.showDevBadges);
  const dark=settings.theme==='dark'||(settings.theme==='system'&&matchMedia?.('(prefers-color-scheme: dark)').matches);
  b.classList.toggle('themeDark',!!dark);
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
      <h3>Mode développement</h3>
      <label class="checkboxField"><input type="checkbox" data-setting="architectureMarkers"><span>Repères architecture CORE / STUDIO</span></label>
      <label class="checkboxField"><input type="checkbox" data-setting="showDevelopment"><span>Afficher les fonctions DÉVELOPPEMENT</span></label>
      <label class="checkboxField"><input type="checkbox" data-setting="showScopeBadges"><span>Afficher les badges CORE / STUDIO</span></label>
      <label class="checkboxField"><input type="checkbox" data-setting="showDevBadges"><span>Afficher les badges DEV</span></label>
    </section>
    <section>
      <h3>Interface</h3>
      <button data-core-pref="expand-ribbon">Déplier le ruban</button>
      <button data-core-pref="collapse-ribbon">Replier le ruban</button>
      <button data-core-pref="reset-ui">Réinitialiser l'interface</button>
    </section>
  </div>`;
  host.querySelector('[data-setting="theme"]').value=s.theme;
  for(const k of ['architectureMarkers','showDevelopment','showScopeBadges','showDevBadges']){
    host.querySelector('[data-setting="'+k+'"]').checked=!!s[k];
  }
  host.querySelectorAll('[data-setting]').forEach(el=>el.addEventListener('change',()=>{
    const k=el.dataset.setting,v=el.type==='checkbox'?el.checked:el.value;
    saveStudioSettings({[k]:v});
  }));
  host.querySelector('[data-core-pref="expand-ribbon"]')?.addEventListener('click',()=>{localStorage.setItem('nlab-studio-v2-ribbon-collapsed','0');location.reload()});
  host.querySelector('[data-core-pref="collapse-ribbon"]')?.addEventListener('click',()=>{localStorage.setItem('nlab-studio-v2-ribbon-collapsed','1');location.reload()});
  host.querySelector('[data-core-pref="reset-ui"]')?.addEventListener('click',()=>{
    localStorage.removeItem(KEY);
    [...Object.keys(localStorage)].filter(k=>k.startsWith('nlab-studio-v2-')).forEach(k=>localStorage.removeItem(k));
    location.reload();
  });
}
