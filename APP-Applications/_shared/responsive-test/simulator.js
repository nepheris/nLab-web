/**
 * nLab Responsive Test Studio — reusable iframe viewport renderer.
 * Restricts CSS dimensions only; cannot emulate Android OS, UA, sensors, file permissions.
 * Cross-origin pages may refuse framing (X-Frame-Options / CSP frame-ancestors).
 */
export const SCREEN_PRESETS=Object.freeze({
 desktop:{label:'Ordinateur',portrait:[800,1280],landscape:[1280,800]},
 tablet:{label:'Tablette',portrait:[768,1024],landscape:[1024,768]},
 phone:{label:'Téléphone',portrait:[393,852],landscape:[852,393]},
 small:{label:'Petit téléphone',portrait:[360,800],landscape:[800,360]}
});
export const DESKTOP_RESOLUTIONS=Object.freeze([{"id":"640x480","label":"VGA · 640 × 480 · 4:3","group":"Classiques · 4:3 / 5:4"},{"id":"800x600","label":"SVGA · 800 × 600 · 4:3","group":"Classiques · 4:3 / 5:4"},{"id":"1024x768","label":"XGA · 1024 × 768 · 4:3","group":"Classiques · 4:3 / 5:4"},{"id":"1152x864","label":"1152 × 864 · 4:3","group":"Classiques · 4:3 / 5:4"},{"id":"1280x960","label":"1280 × 960 · 4:3","group":"Classiques · 4:3 / 5:4"},{"id":"1280x1024","label":"SXGA · 1280 × 1024 · 5:4","group":"Classiques · 4:3 / 5:4"},{"id":"1600x1200","label":"UXGA · 1600 × 1200 · 4:3","group":"Classiques · 4:3 / 5:4"},{"id":"1280x720","label":"HD · 1280 × 720","group":"HD · 16:9"},{"id":"1366x768","label":"1366 × 768","group":"HD · 16:9"},{"id":"1600x900","label":"HD+ · 1600 × 900","group":"HD · 16:9"},{"id":"1920x1080","label":"Full HD · 1920 × 1080","group":"HD · 16:9"},{"id":"2560x1440","label":"QHD · 2560 × 1440","group":"HD · 16:9"},{"id":"3840x2160","label":"4K UHD · 3840 × 2160","group":"HD · 16:9"},{"id":"1280x800","label":"WXGA · 1280 × 800","group":"Widescreen · 16:10"},{"id":"1440x900","label":"WXGA+ · 1440 × 900","group":"Widescreen · 16:10"},{"id":"1680x1050","label":"WSXGA+ · 1680 × 1050","group":"Widescreen · 16:10"},{"id":"1920x1200","label":"WUXGA · 1920 × 1200","group":"Widescreen · 16:10"},{"id":"2560x1600","label":"WQXGA · 2560 × 1600","group":"Widescreen · 16:10"},{"id":"2560x1080","label":"2560 × 1080 · ultra-wide","group":"Ultra-wide · 21:9 et plus"},{"id":"3440x1440","label":"3440 × 1440 · ultra-wide","group":"Ultra-wide · 21:9 et plus"},{"id":"3840x1600","label":"3840 × 1600 · ultra-wide","group":"Ultra-wide · 21:9 et plus"}].map(entry=>Object.freeze(entry)));
export const TABLET_RESOLUTIONS=Object.freeze([{"id":"600x960","label":"Petite tablette · 600 × 960"},{"id":"768x1024","label":"Tablette classique · 768 × 1024"},{"id":"800x1280","label":"Tablette 8–10 pouces · 800 × 1280"},{"id":"820x1180","label":"Tablette moderne · 820 × 1180"},{"id":"834x1194","label":"Grande tablette · 834 × 1194"},{"id":"1024x1366","label":"Tablette XL · 1024 × 1366"}].map(entry=>Object.freeze(entry)));
export const MOBILE_RESOLUTIONS=Object.freeze([{"id":"320x568","label":"Mini mobile · 320 × 568"},{"id":"360x740","label":"Petit mobile · 360 × 740"},{"id":"360x800","label":"Mobile compact · 360 × 800"},{"id":"375x667","label":"Mobile classique · 375 × 667"},{"id":"390x844","label":"Mobile récent · 390 × 844"},{"id":"393x852","label":"Mobile standard · 393 × 852"},{"id":"412x915","label":"Grand mobile · 412 × 915"},{"id":"430x932","label":"Grand mobile XL · 430 × 932"},{"id":"480x960","label":"Très grand mobile · 480 × 960"}].map(entry=>Object.freeze(entry)));
export const MIN_VIEWPORT=240, MAX_VIEWPORT=4096;
const clamp=(n,min,max)=>Math.min(max,Math.max(min,n));
const integer=value=>{if(value===null||String(value).trim()==='')return null;const n=Number(value);return Number.isFinite(n)&&Number.isInteger(n)&&n>=MIN_VIEWPORT&&n<=MAX_VIEWPORT?n:null};
export function resolvePreviewUrl(value,base){
 const text=String(value||'').trim();
 if(!text)throw Error('Indiquez une adresse HTTP ou HTTPS.');
 const u=new URL(text,base);
 if(!['http:','https:'].includes(u.protocol)||u.username||u.password)throw Error('Adresse HTTP(S) sans identifiants requise.');
 return u;
}
export function presetDimensions(preset,orientation='portrait',custom=[420,880]){
 const p=SCREEN_PRESETS[preset];
 if(!p&&preset!=='custom')throw Error('Format inconnu : '+preset);
 if(!['portrait','landscape'].includes(orientation))throw Error('Orientation inconnue');
 const pair=p?[...p[orientation]]:[...custom];
 if(preset==='custom'){
  if(pair.length!==2||integer(pair[0])===null||integer(pair[1])===null)throw Error('Dimensions personnalisées invalides');
  if(orientation==='portrait'&&pair[0]>pair[1]||orientation==='landscape'&&pair[0]<pair[1])pair.reverse();
 }
 return {width:pair[0],height:pair[1]};
}
const safePrefs=s=>{try{const a=JSON.parse(s);if(!a||typeof a!=='object'||!['desktop','tablet','phone','small','custom'].includes(a.preset)||!['portrait','landscape'].includes(a.orientation))return null;const w=integer(a.width),h=integer(a.height);return w&&h?{preset:a.preset,orientation:a.orientation,width:w,height:h,desktopResolution:DESKTOP_RESOLUTIONS.some(x=>x.id===a.desktopResolution)?a.desktopResolution:'1280x800',tabletResolution:TABLET_RESOLUTIONS.some(x=>x.id===a.tabletResolution)?a.tabletResolution:'768x1024',mobileResolution:MOBILE_RESOLUTIONS.some(x=>x.id===a.mobileResolution)?a.mobileResolution:(a.preset==='small'?'360x800':'393x852')}:null}catch{return null}};

export function mountResponsiveSimulator(host,{src='../studios/',storageKey='nlab:responsive-test-studio:default:v1'}={}){
 const root=typeof host==='string'?document.querySelector(host):host;
 if(!root)throw Error('Responsive simulator host absent');
 if(root.__responsiveSimulator)return root.__responsiveSimulator;
 let initial=null;
 try{initial=safePrefs(localStorage.getItem(storageKey))}catch{}
 let state=initial||{preset:'desktop',orientation:'landscape',width:1280,height:800};
 let desktopChoice=initial?.desktopResolution||'1280x800';
 let tabletChoice=initial?.tabletResolution||'768x1024';
 let mobileChoice=initial?.mobileResolution||'393x852';
 let scaleMode='fit',manualScale=1,dual=false,reloadOnChange=true,currentUrl=null;
 const zoomStorageKey='nlab:responsive-test-studio:zoom:v1';
 try{
  const saved=JSON.parse(localStorage.getItem(zoomStorageKey)||'null');
  if(saved&&['fit','custom'].includes(saved.mode)){
   scaleMode=saved.mode;
   if(saved.mode==='custom'&&Number.isFinite(saved.percent)&&saved.percent>=5&&saved.percent<=300)manualScale=saved.percent/100;
  }else if(saved&&['1','0.75','0.5','0.25'].includes(saved.mode)){
   scaleMode=saved.mode;
  }
 }catch{}
 root.innerHTML="<div class=\"rt-workspace\" data-rt-workspace>\n <div class=\"rt-address\" data-rt-address-bar data-collapsed=\"false\" role=\"group\" aria-label=\"Adresse du site à prévisualiser\">\n  <div class=\"rt-address-strip\"><strong>🔗 URL test</strong><span data-rt-url-summary title=\"Adresse actuellement prévisualisée\">Aucune adresse</span><button type=\"button\" data-rt-url-toggle aria-controls=\"rt-url-fields\" aria-expanded=\"true\">− Réduire</button></div>\n  <div id=\"rt-url-fields\" class=\"rt-address-fields\" data-rt-url-fields>\n  <label for=\"rt-target-url\">URL à tester</label>\n  <input id=\"rt-target-url\" data-rt-url type=\"url\" spellcheck=\"false\" placeholder=\"https://exemple.fr ou ../studios/\" autocomplete=\"off\">\n  <button type=\"button\" data-rt-load>Afficher</button>\n  <button type=\"button\" data-rt-reload title=\"Actualiser les prévisualisations\">↻ Actualiser</button>\n  <a data-rt-open target=\"_blank\" rel=\"noopener noreferrer\" title=\"Ouvrir l'URL dans un autre onglet\">↗ Onglet</a>\n  <button type=\"button\" data-rt-dual aria-pressed=\"false\">◫ Vue double</button>\n  <button type=\"button\" data-rt-show-settings aria-controls=\"rt-settings\" aria-expanded=\"true\">⚙ Réglages</button>\n </div>\n </div>\n <div role=\"status\" aria-live=\"polite\" class=\"rt-message\" data-rt-message></div>\n <div class=\"rt-monitor\" data-rt-monitor>\n  <div class=\"rt-monitor-header\"><div class=\"rt-metrics\" data-rt-metrics></div><div class=\"rt-monitor-actions\"><button type=\"button\" data-rt-full-settings aria-controls=\"rt-settings\" aria-expanded=\"true\">⚙ Réglages</button><button type=\"button\" data-rt-fullscreen aria-pressed=\"false\" title=\"Afficher le viewport en plein écran\">⛶ Plein écran</button></div></div>\n  <div class=\"rt-diagnostics\" data-rt-diagnostics aria-live=\"polite\"></div>\n  <div class=\"rt-scroll\" data-rt-scroll>\n   <div class=\"rt-stages\" data-rt-stages>\n    <section class=\"rt-stage\" data-rt-stage aria-label=\"Écran principal\">\n     <div class=\"rt-screen-title\" data-rt-screen-title>Portrait</div>\n     <div class=\"rt-device-frame\" data-rt-frame-box>\n      <div class=\"rt-chrome\"><span aria-hidden=\"true\">●</span><span data-rt-address-label>Prévisualisation</span><span>⋯</span></div>\n      <div class=\"rt-viewport\" data-rt-viewport><iframe data-rt-frame title=\"Site web testé — écran principal\" loading=\"eager\" referrerpolicy=\"no-referrer\"></iframe></div>\n     </div>\n    </section>\n    <section class=\"rt-stage\" data-rt-stage-secondary aria-label=\"Deuxième orientation\" hidden>\n     <div class=\"rt-screen-title\" data-rt-screen-title-secondary>Paysage</div>\n     <div class=\"rt-device-frame\" data-rt-frame-box-secondary>\n      <div class=\"rt-chrome\"><span aria-hidden=\"true\">●</span><span data-rt-address-label-secondary>Prévisualisation</span><span>⋯</span></div>\n      <div class=\"rt-viewport\" data-rt-viewport-secondary><iframe data-rt-frame-secondary title=\"Site web testé — orientation opposée\" loading=\"eager\" referrerpolicy=\"no-referrer\"></iframe></div>\n     </div>\n    </section>\n   </div>\n  </div>\n  <aside class=\"rt-top\" id=\"rt-settings\" data-rt-panel data-collapsed=\"false\" aria-label=\"Réglages de l'écran simulé\">\n   <div class=\"rt-panel-head\" data-rt-panel-head>\n    <strong>⚙ Réglages d'écran</strong>\n    <button type=\"button\" data-rt-collapse aria-controls=\"rt-screen-fields\" aria-expanded=\"true\">Réduire</button>\n   </div>\n   <div class=\"rt-panel-fields\" id=\"rt-screen-fields\">\n    <div class=\"rt-preset\">\n     <fieldset class=\"rt-family-fieldset\"><legend>Type d’écran</legend><div class=\"rt-device-families\" role=\"group\" aria-label=\"Type d’écran\"><button type=\"button\" data-rt-family=\"desktop\" aria-pressed=\"true\" title=\"Ordinateur\"><svg viewBox=\"0 0 24 24\" width=\"20\" height=\"20\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" aria-hidden=\"true\"><rect x=\"3\" y=\"4\" width=\"18\" height=\"13\" rx=\"1.5\"/><path d=\"M8 21h8M12 17v4\"/></svg><span>Ordinateur</span></button><button type=\"button\" data-rt-family=\"tablet\" aria-pressed=\"false\" title=\"Tablette\"><svg viewBox=\"0 0 24 24\" width=\"20\" height=\"20\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" aria-hidden=\"true\"><rect x=\"5\" y=\"2\" width=\"14\" height=\"20\" rx=\"2\"/><path d=\"M11 19h2\"/></svg><span>Tablette</span></button><button type=\"button\" data-rt-family=\"mobile\" aria-pressed=\"false\" title=\"Mobile\"><svg viewBox=\"0 0 24 24\" width=\"20\" height=\"20\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" aria-hidden=\"true\"><rect x=\"7\" y=\"2\" width=\"10\" height=\"20\" rx=\"2\"/><path d=\"M10 19h4\"/></svg><span>Mobile</span></button><button type=\"button\" data-rt-family=\"custom\" aria-pressed=\"false\" title=\"Sur mesure\"><svg viewBox=\"0 0 24 24\" width=\"20\" height=\"20\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" aria-hidden=\"true\"><rect x=\"4\" y=\"4\" width=\"16\" height=\"16\" rx=\"2\"/><path d=\"M12 8v8M8 12h8\"/></svg><span>Sur mesure</span></button></div></fieldset>\n     <fieldset class=\"rt-orientation\"><legend>Orientation principale</legend><label><input type=\"radio\" name=\"rt-orientation\" value=\"portrait\" checked> Portrait</label><label><input type=\"radio\" name=\"rt-orientation\" value=\"landscape\"> Paysage</label></fieldset>\n    </div>\n    <fieldset class=\"rt-theme-fieldset\">\n     <legend>Thème du Studio</legend>\n     <div class=\"rt-theme-controls\" role=\"group\" aria-label=\"Thème du Studio\">\n      <button type=\"button\" data-rt-theme=\"auto\" aria-pressed=\"true\" title=\"Suivre les préférences système\">◐ Auto</button>\n      <button type=\"button\" data-rt-theme=\"light\" aria-pressed=\"false\" title=\"Afficher le thème clair\">☀ Clair</button>\n      <button type=\"button\" data-rt-theme=\"dark\" aria-pressed=\"false\" title=\"Afficher le thème sombre\">☾ Sombre</button>\n     </div>\n    </fieldset>\n    <div class=\"rt-preset rt-resolution-preset\" data-rt-resolution-preset>\n     <label>Résolution écran <select data-rt-resolution aria-label=\"Résolution écran selon appareil\"></select></label>\n    </div>\n    <div class=\"rt-preset\">\n     <label>Largeur <input data-rt-width type=\"number\" inputmode=\"numeric\" min=\"240\" max=\"4096\" step=\"1\">px</label>\n     <label>Hauteur <input data-rt-height type=\"number\" inputmode=\"numeric\" min=\"240\" max=\"4096\" step=\"1\">px</label>\n    </div>\n    <div class=\"rt-preset\">\n     <label>Échelle <select data-rt-scale><option value=\"fit\">Ajuster</option><option value=\"1\">100 %</option><option value=\"0.75\">75 %</option><option value=\"0.5\">50 %</option><option value=\"0.25\">25 %</option><option value=\"custom\">Sur mesure</option></select></label>\n     <button type=\"button\" data-rt-rotate title=\"Échanger portrait et paysage\">↻ Pivoter</button>\n     <button type=\"button\" data-rt-default title=\"Mémoriser ce format comme favori\">★ Par défaut</button>\n    </div>\n\n    <div class=\"rt-zoom-editor\" role=\"group\" aria-label=\"Zoom précis du viewport\">\n     <button type=\"button\" data-rt-zoom-minus title=\"Réduire le zoom de 5 points\">−</button>\n     <input data-rt-zoom-slider type=\"range\" min=\"5\" max=\"300\" step=\"1\" value=\"100\" aria-label=\"Zoom en pourcentage\">\n     <button type=\"button\" data-rt-zoom-plus title=\"Augmenter le zoom de 5 points\">+</button>\n     <label><input data-rt-zoom-value type=\"number\" min=\"5\" max=\"300\" step=\"1\" inputmode=\"numeric\" value=\"100\" aria-label=\"Zoom manuel en pourcentage\"> %</label>\n     <button type=\"button\" data-rt-zoom-save title=\"Enregistrer le zoom préféré dans ce navigateur\">★ Sauver zoom</button>\n    </div>\n    <label class=\"rt-reload-label\"><input data-rt-auto-reload type=\"checkbox\" checked> Recharger le site au changement de format</label>\n   </div>\n  </aside>\n </div>\n <p class=\"rt-note\">Chaque iframe possède son propre viewport CSS : les media queries responsive et les événements de redimensionnement s'y appliquent. Le rechargement optionnel aide les sites qui calculent leur affichage au démarrage. Le zoom change seulement l'échelle du cadre, pas les API d'un vrai appareil Android (ni User-Agent, tactile ou permissions). Certains sites refusent les iframes (CSP / X-Frame-Options). En vue double, les deux pages sont indépendantes après chargement.</p>\n</div>";
 const query=s=>root.querySelector(s);
 const ui={
  families:[...root.querySelectorAll('[data-rt-family]')],resolution:query('[data-rt-resolution]'),resolutionPicker:query('[data-rt-resolution-preset]'),width:query('[data-rt-width]'),height:query('[data-rt-height]'),scale:query('[data-rt-scale]'),zoomSlider:query('[data-rt-zoom-slider]'),zoomValue:query('[data-rt-zoom-value]'),zoomMinus:query('[data-rt-zoom-minus]'),zoomPlus:query('[data-rt-zoom-plus]'),zoomSave:query('[data-rt-zoom-save]'),
  message:query('[data-rt-message]'),url:query('[data-rt-url]'),open:query('[data-rt-open]'),addressBar:query('[data-rt-address-bar]'),addressSummary:query('[data-rt-url-summary]'),addressToggle:query('[data-rt-url-toggle]'),addressFields:query('[data-rt-url-fields]'),
  frame:query('[data-rt-frame]'),frameB:query('[data-rt-frame-secondary]'),
  boxA:query('[data-rt-frame-box]'),boxB:query('[data-rt-frame-box-secondary]'),
  viewportA:query('[data-rt-viewport]'),viewportB:query('[data-rt-viewport-secondary]'),
  stageA:query('[data-rt-stage]'),stageB:query('[data-rt-stage-secondary]'),
  stages:query('[data-rt-stages]'),titleA:query('[data-rt-screen-title]'),titleB:query('[data-rt-screen-title-secondary]'),
  scroll:query('[data-rt-scroll]'),metrics:query('[data-rt-metrics]'),diagnostics:query('[data-rt-diagnostics]'),labelA:query('[data-rt-address-label]'),labelB:query('[data-rt-address-label-secondary]'),
  workspace:query('[data-rt-workspace]'),monitor:query('[data-rt-monitor]'),panel:query('[data-rt-panel]'),panelHead:query('[data-rt-panel-head]'),
  settingsButton:query('[data-rt-show-settings]'),fullSettings:query('[data-rt-full-settings]'),fullscreenButton:query('[data-rt-fullscreen]'),collapseButton:query('[data-rt-collapse]'),
  dualButton:query('[data-rt-dual]'),reload:query('[data-rt-auto-reload]')
 };
 const message=t=>{ui.message.textContent=t};
 const getFamily=()=>state.preset==='small'||state.preset==='phone'?'mobile':state.preset;
 const catalogFor=family=>family==='desktop'?DESKTOP_RESOLUTIONS:family==='tablet'?TABLET_RESOLUTIONS:family==='mobile'?MOBILE_RESOLUTIONS:[];
 const choiceFor=family=>family==='desktop'?desktopChoice:family==='tablet'?tabletChoice:mobileChoice;
 const chosenDimensions=(family,orientation)=>{
  const entry=catalogFor(family).find(x=>x.id===choiceFor(family));
  if(!entry)throw Error('Résolution inconnue pour '+family);
  const [w,h]=entry.id.split('x').map(Number);
  return orientation==='landscape'?{width:Math.max(w,h),height:Math.min(w,h)}:{width:Math.min(w,h),height:Math.max(w,h)};
 };
 let renderedFamily='';
 const renderResolutionOptions=family=>{
  if(renderedFamily===family)return;
  renderedFamily=family;ui.resolution.replaceChildren();
  const groups=new Map();
  for(const entry of catalogFor(family)){
   let target=ui.resolution;
   if(entry.group){
    if(!groups.has(entry.group)){
     const group=document.createElement('optgroup');group.label=entry.group;
     groups.set(entry.group,group);ui.resolution.append(group);
    }
    target=groups.get(entry.group);
   }
   const option=document.createElement('option');option.value=entry.id;option.textContent=entry.label;target.append(option);
  }
  ui.resolution.setAttribute('aria-label','Résolution '+(family==='desktop'?'ordinateur':family==='tablet'?'tablette':'mobile'));
 };
 const setAddressCollapsed=collapsed=>{
  ui.addressBar.dataset.collapsed=String(collapsed);
  ui.addressToggle.setAttribute('aria-expanded',String(!collapsed));
  ui.addressToggle.textContent=collapsed?'+ Modifier URL':'− Réduire';
  ui.addressFields.hidden=collapsed;
  ui.addressSummary.textContent=currentUrl?.href||'Aucune URL chargée';
  ui.addressSummary.title=currentUrl?.href||'';
 };
 const orientationText=(w,h)=>w>h?'Paysage':h>w?'Portrait':'Carré';
 const dimensions=(box,viewport,iframe,w,h,scale,stage,title)=>{
  box.style.width=w+16+'px';box.style.height=h+42+'px';
  box.style.transform='scale('+scale+')';
  viewport.style.width=iframe.style.width=w+'px';
  viewport.style.height=iframe.style.height=h+'px';
  stage.style.width=Math.ceil((w+16)*scale)+'px';
  stage.style.height=Math.ceil((h+42)*scale)+29+'px';
  title.textContent=orientationText(w,h)+' · '+w+' × '+h+' px';
 };
 const measure=frame=>{
  try{
   if(frame.contentWindow?.location.href==='about:blank')return 'en attente';
   const inner=frame.contentWindow;
   return inner.innerWidth+' × '+inner.innerHeight+' px ('+(inner.matchMedia('(orientation: portrait)').matches?'portrait':'paysage')+')';
  }catch{return 'site externe — mesure interne inaccessible'}
 };
 const update=()=>{
  const w=state.width,h=state.height,other=opposed();
  const reserved=ui.workspace.dataset.panelOpen==='true'&&matchMedia('(min-width:1100px)').matches?348:0;
  const maxW=Math.max(100,ui.scroll.clientWidth-reserved-36);
  const maxH=Math.max(160,ui.scroll.clientHeight-62);
  const rawWidth=dual?w+16+other.width+16+18:w+16;
  const rawHeight=dual?Math.max(h+42,other.height+42):h+42;
  const scale=scaleMode==='fit'?clamp(Math.min(1,maxW/rawWidth,maxH/rawHeight),.02,1):scaleMode==='custom'?manualScale:Number(scaleMode);
  ui.stageB.hidden=!dual;
  ui.stages.style.gap=dual?18*scale+'px':'0px';
  dimensions(ui.boxA,ui.viewportA,ui.frame,w,h,scale,ui.stageA,ui.titleA);
  if(dual)dimensions(ui.boxB,ui.viewportB,ui.frameB,other.width,other.height,scale,ui.stageB,ui.titleB);
  ui.stages.style.width=Math.ceil(rawWidth*scale)+'px';
  ui.stages.style.height=Math.ceil(rawHeight*scale)+29+'px';
  const family=getFamily();
  for(const button of ui.families)button.setAttribute('aria-pressed',String(button.dataset.rtFamily===family));
  renderResolutionOptions(family);
  ui.resolutionPicker.hidden=family==='custom';
  if(family!=='custom')ui.resolution.value=choiceFor(family);
  ui.scale.value=scaleMode;
  const percent=Math.round(scale*100);
  if(document.activeElement!==ui.zoomValue)ui.zoomValue.value=percent;
  ui.zoomSlider.value=clamp(percent,5,300);
  ui.zoomSlider.setAttribute('aria-valuetext',percent+' %'+(scaleMode==='fit'?' (Ajuster)':''));
  root.querySelectorAll('input[name="rt-orientation"]').forEach(r=>{r.checked=r.value===state.orientation});
  if(document.activeElement!==ui.width)ui.width.value=w;
  if(document.activeElement!==ui.height)ui.height.value=h;
  ui.dualButton.setAttribute('aria-pressed',String(dual));
  ui.dualButton.textContent=dual?'◧ Vue simple':'◫ Vue double';
  const resolution=w+' × '+h+' px · '+orientationText(w,h).toLowerCase();
  ui.metrics.textContent=dual
   ?'Comparaison côte à côte · '+resolution+' / '+other.width+' × '+other.height+' px · zoom '+Math.round(scale*100)+' %'
   :resolution+' · zoom '+Math.round(scale*100)+' %';
  ui.metrics.title='Iframe principal : '+measure(ui.frame)+(dual?' | Secondaire : '+measure(ui.frameB):'');
  const screenClass=px=>px<=600?'mobile CSS':px<=1024?'tablette CSS':'bureau CSS';
  const diagnostics=frame=>{
   try{
    const win=frame.contentWindow;
    if(!win||win.location.href==='about:blank')return 'chargement';
    const doc=win.document;
    return win.innerWidth+' × '+win.innerHeight+' px CSS · '+(win.matchMedia('(orientation:portrait)').matches?'portrait':'paysage')+' · '+(doc.documentElement.scrollWidth>win.innerWidth+2?'débordement horizontal':'sans débordement horizontal');
   }catch{return 'site externe : mesures internes inaccessibles'}
  };
  ui.diagnostics.textContent=dual
   ?'Orientation principale ('+screenClass(w)+') : '+diagnostics(ui.frame)+' | Seconde vue ('+screenClass(other.width)+') : '+diagnostics(ui.frameB)
   :'Simulation '+screenClass(w)+' : '+diagnostics(ui.frame);

 };
 const refresh=()=>{
  if(!currentUrl)return false;
  const frames=dual?[ui.frame,ui.frameB]:[ui.frame];
  for(const frame of frames){
   // Reload an existing iframe in-place to preserve its current navigation if same-origin.
   // Cross-origin navigation is isolated: fall back to the last explicit URL.
   try{
    if(frame.src&&frame.contentWindow&&frame.contentWindow.location.href!=='about:blank'){
     frame.contentWindow.location.reload();
     continue;
    }
   }catch{}
   frame.src=currentUrl.href;
  }
  message('Prévisualisation actualisée pour le format sélectionné.');
  return true;
 };
 const afterDimensionChange=()=>{
  update();
  if(reloadOnChange)refresh();
  else message('Dimensions appliquées : media queries responsive recalculées sans rechargement.');
 };
 const setPreset=(id,orientation=state.orientation)=>{
  if(id==='custom'){state={...state,preset:'custom',orientation};afterDimensionChange();return true}
  const family=id==='small'||id==='phone'?'mobile':id;
  if(!['desktop','tablet','mobile'].includes(family))return false;
  if(id==='small')mobileChoice='360x800';
  state={preset:id,orientation,...chosenDimensions(family,orientation)};
  afterDimensionChange();return true;
 };
 const setFamily=(family)=>{
  if(!['desktop','tablet','mobile','custom'].includes(family))return false;
  if(family==='custom')return setPreset('custom');
  const orientation=family==='desktop'?'landscape':'portrait';
  state={preset:family==='mobile'?'phone':family,orientation,...chosenDimensions(family,orientation)};
  afterDimensionChange();return true;
 };
 const setResolution=id=>{
  const family=getFamily();
  if(family==='custom'||!catalogFor(family).some(x=>x.id===id))return false;
  if(family==='desktop')desktopChoice=id;
  else if(family==='tablet')tabletChoice=id;
  else mobileChoice=id;
  state={...state,...chosenDimensions(family,state.orientation)};
  afterDimensionChange();return true;
 };
 const setDesktopResolution=id=>{
  if(!DESKTOP_RESOLUTIONS.some(x=>x.id===id))return false;
  desktopChoice=id;
  return setPreset('desktop',state.orientation);
 };
 const setDimensions=(w,h)=>{
  const width=integer(w),height=integer(h);
  if(width===null||height===null){message('Dimensions attendues : nombres entiers de 240 à 4096 px.');return false}
  state={preset:'custom',orientation:width>height?'landscape':'portrait',width,height};
  afterDimensionChange();message('Format personnalisé appliqué.');return true;
 };
 const setOrientation=orientation=>{
  if(!['portrait','landscape'].includes(orientation))return false;
  if(state.preset==='custom'){
   const [w,h]=[state.width,state.height];
   state={...state,orientation,width:orientation==='portrait'?Math.min(w,h):Math.max(w,h),height:orientation==='portrait'?Math.max(w,h):Math.min(w,h)};
  }else state={...state,orientation,...chosenDimensions(getFamily(),orientation)};
  afterDimensionChange();return true;
 };
 const setDual=value=>{
  const next=Boolean(value);
  if(dual===next)return true;
  dual=next;
  update();
  if(dual&&currentUrl){
   ui.frameB.src=currentUrl.href;
   if(reloadOnChange){
    // Existing preview receives a fresh viewport-aware navigation; the new frame was just loaded.
    try{ui.frame.contentWindow.location.reload()}catch{ui.frame.src=currentUrl.href}
   }
  }
  message(dual?'Comparaison portrait et paysage : deux iframes indépendantes.':'Vue simple restaurée.');
  return true;
 };
 const load=(value=ui.url.value)=>{
  let u;try{u=resolvePreviewUrl(value,location.href)}catch(error){message(error.message);return false}
  currentUrl=u;ui.url.value=u.href;
  ui.addressSummary.textContent=u.href;ui.addressSummary.title=u.href;
  ui.frame.src=u.href;if(dual)ui.frameB.src=u.href;
  ui.open.href=u.href;
  ui.labelA.textContent=ui.labelB.textContent=u.hostname+(u.pathname==='/'?'':u.pathname);
  message(u.origin!==location.origin?'Domaine externe : le site peut bloquer son affichage dans l’iframe (CSP / X-Frame-Options).':'Chargement du site dans le viewport CSS…');
  return true;
 };
 const setPanelOpen=open=>{
  ui.panel.dataset.collapsed=open?'false':'true';
  ui.workspace.dataset.panelOpen=String(open);
  ui.settingsButton.setAttribute('aria-expanded',String(open));
  ui.fullSettings.setAttribute('aria-expanded',String(open));
  ui.collapseButton.setAttribute('aria-expanded',String(open));
  ui.collapseButton.textContent=open?'Réduire':'Déployer';
  update();
 };
 ui.settingsButton.addEventListener('click',()=>setPanelOpen(ui.panel.dataset.collapsed==='true'));
 ui.fullSettings.addEventListener('click',()=>setPanelOpen(ui.panel.dataset.collapsed==='true'));
 ui.collapseButton.addEventListener('click',()=>setPanelOpen(ui.panel.dataset.collapsed==='true'));
 let drag=null;
 ui.panelHead.addEventListener('pointerdown',event=>{
  if(event.button!==0||event.target.closest('button,a,input,select')||matchMedia('(max-width:640px)').matches)return;
  const bounds=ui.monitor.getBoundingClientRect(),rect=ui.panel.getBoundingClientRect();
  drag={x:event.clientX,y:event.clientY,left:rect.left-bounds.left,top:rect.top-bounds.top};
  ui.panelHead.setPointerCapture(event.pointerId);
 });
 ui.panelHead.addEventListener('pointermove',event=>{
  if(!drag)return;
  const left=clamp(drag.left+event.clientX-drag.x,8,Math.max(8,ui.monitor.clientWidth-ui.panel.offsetWidth-8));
  const top=clamp(drag.top+event.clientY-drag.y,8,Math.max(8,ui.monitor.clientHeight-ui.panel.offsetHeight-8));
  ui.panel.style.left=left+'px';ui.panel.style.right='auto';ui.panel.style.top=top+'px';
 });
 for(const type of ['pointerup','pointercancel','lostpointercapture'])ui.panelHead.addEventListener(type,()=>{drag=null});
 setPanelOpen(!matchMedia('(max-width:760px)').matches);
 ui.families.forEach(button=>button.addEventListener('click',()=>setFamily(button.dataset.rtFamily)));
 ui.resolution.addEventListener('change',()=>setResolution(ui.resolution.value));
 ui.addressToggle.addEventListener('click',()=>setAddressCollapsed(ui.addressBar.dataset.collapsed!=='true'));
 root.querySelectorAll('input[name="rt-orientation"]').forEach(r=>r.addEventListener('change',()=>{if(r.checked)setOrientation(r.value)}));
 for(const input of [ui.width,ui.height])input.addEventListener('change',()=>setDimensions(ui.width.value,ui.height.value));
 query('[data-rt-rotate]').addEventListener('click',()=>setOrientation(state.orientation==='portrait'?'landscape':'portrait'));
 const setZoomPercent=value=>{
  const percent=Number(value);
  if(!Number.isFinite(percent)||percent<5||percent>300){message('Zoom de 5 à 300 % attendu.');return false}
  manualScale=Math.round(percent)/100;
  scaleMode='custom';update();return true;
 };
 ui.scale.addEventListener('change',()=>{scaleMode=ui.scale.value;update()});
 ui.zoomSlider.addEventListener('input',()=>setZoomPercent(ui.zoomSlider.value));
 ui.zoomValue.addEventListener('change',()=>setZoomPercent(ui.zoomValue.value));
 ui.zoomValue.addEventListener('keydown',event=>{if(event.key==='Enter'){event.preventDefault();ui.zoomValue.blur()}});
 const changeZoom=delta=>{
  const current=Number(ui.zoomValue.value)||Math.round(manualScale*100);
  setZoomPercent(clamp(current+delta,5,300));
 };
 ui.zoomMinus.addEventListener('click',()=>changeZoom(-5));
 ui.zoomPlus.addEventListener('click',()=>changeZoom(5));
 ui.zoomSave.addEventListener('click',()=>{
  try{
   localStorage.setItem(zoomStorageKey,JSON.stringify({mode:scaleMode,percent:Math.round(manualScale*100)}));
   message('Zoom préféré enregistré dans ce navigateur.');
  }catch{message('Impossible d’enregistrer le zoom.')}
 });
 const isFullscreen=()=>document.fullscreenElement===ui.monitor;
 const synchronizeFullscreen=()=>{
  const active=isFullscreen();
  ui.fullscreenButton.textContent=active?'⛶ Quitter plein écran':'⛶ Plein écran';
  ui.fullscreenButton.setAttribute('aria-pressed',String(active));
  ui.monitor.dataset.fullscreen=String(active);
  update();
 };
 const toggleFullscreen=async()=>{
  try{
   if(isFullscreen())await document.exitFullscreen();
   else if(ui.monitor.requestFullscreen)await ui.monitor.requestFullscreen();
   else{message('Le navigateur ne prend pas en charge le mode plein écran.');return false}
   synchronizeFullscreen();
   return true;
  }catch{message('Plein écran non autorisé par le navigateur.');return false}
 };
 ui.fullscreenButton.addEventListener('click',toggleFullscreen);
 document.addEventListener('fullscreenchange',synchronizeFullscreen);
 ui.dualButton.addEventListener('click',()=>setDual(!dual));
 ui.reload.addEventListener('change',()=>{reloadOnChange=ui.reload.checked;message(reloadOnChange?'Rechargement automatique activé.':'Rechargement désactivé : le viewport se redimensionne sans navigation.')});
 query('[data-rt-load]').addEventListener('click',()=>load());
 ui.url.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();load()}});
 query('[data-rt-reload]').addEventListener('click',refresh);
 query('[data-rt-default]').addEventListener('click',()=>{
  try{localStorage.setItem(storageKey,JSON.stringify({...state,desktopResolution:desktopChoice,tabletResolution:tabletChoice,mobileResolution:mobileChoice}));message('Format par défaut enregistré dans ce navigateur.')}
  catch{message('Le navigateur ne permet pas de mémoriser ce format.')}
 });
 for(const frame of [ui.frame,ui.frameB]){
  frame.addEventListener('load',()=>{update();if(currentUrl?.origin===location.origin)message('Page chargée dans le viewport CSS.')});
 }
 let observer=null;
 if(typeof ResizeObserver!=='undefined'){observer=new ResizeObserver(update);observer.observe(ui.scroll)}
 else window.addEventListener('resize',update,{passive:true});
 update();load(src);
 const api={
  getState:()=>({...state,desktopResolution:desktopChoice,tabletResolution:tabletChoice,mobileResolution:mobileChoice,screenFamily:getFamily(),scale:scaleMode,manualZoomPercent:Math.round(manualScale*100),fullscreen:isFullscreen(),dual,reloadOnChange,url:currentUrl?.href||null}),
  setPreset,setFamily,setResolution,setDesktopResolution,setDimensions,setOrientation,setDual,setZoomPercent,toggleFullscreen,load,refresh,getFrame:()=>ui.frame,getFrames:()=>dual?[ui.frame,ui.frameB]:[ui.frame],
  destroy:()=>{observer?.disconnect();document.removeEventListener('fullscreenchange',synchronizeFullscreen);if(isFullscreen())document.exitFullscreen().catch(()=>{});root.innerHTML='';delete root.__responsiveSimulator}
 };
 root.__responsiveSimulator=api;return api;
}
