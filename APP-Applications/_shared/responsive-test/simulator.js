/**
 * nLab Responsive Test Studio — reusable iframe viewport renderer.
 * Restricts CSS dimensions only; cannot emulate Android OS, UA, sensors, file permissions.
 * Cross-origin pages may refuse framing (X-Frame-Options / CSP frame-ancestors).
 */
export const SCREEN_PRESETS=Object.freeze({
 desktop:{label:'Ordinateur',portrait:[900,1440],landscape:[1440,900]},
 tablet:{label:'Tablette',portrait:[768,1024],landscape:[1024,768]},
 phone:{label:'Téléphone',portrait:[393,852],landscape:[852,393]},
 small:{label:'Petit téléphone',portrait:[360,800],landscape:[800,360]}
});
export const MIN_VIEWPORT=240, MAX_VIEWPORT=2560;
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
const safePrefs=s=>{try{const a=JSON.parse(s);if(!a||typeof a!=='object'||!['desktop','tablet','phone','small','custom'].includes(a.preset)||!['portrait','landscape'].includes(a.orientation))return null;const w=integer(a.width),h=integer(a.height);return w&&h?{preset:a.preset,orientation:a.orientation,width:w,height:h}:null}catch{return null}};

export function mountResponsiveSimulator(host,{src='../studios/',storageKey='nlab:responsive-test-studio:default:v1'}={}){
 const root=typeof host==='string'?document.querySelector(host):host;
 if(!root)throw Error('Responsive simulator host absent');
 if(root.__responsiveSimulator)return root.__responsiveSimulator;
 let initial=null;
 try{initial=safePrefs(localStorage.getItem(storageKey))}catch{}
 let state=initial||{preset:'phone',orientation:'portrait',width:393,height:852};
 let scaleMode='fit',dual=false,reloadOnChange=true,currentUrl=null;
 root.innerHTML="<div class=\"rt-workspace\" data-rt-workspace>\n <div class=\"rt-address\" role=\"group\" aria-label=\"Adresse du site à prévisualiser\">\n  <label for=\"rt-target-url\">URL à tester</label>\n  <input id=\"rt-target-url\" data-rt-url type=\"url\" spellcheck=\"false\" placeholder=\"https://exemple.fr ou ../studios/\" autocomplete=\"off\">\n  <button type=\"button\" data-rt-load>Afficher</button>\n  <button type=\"button\" data-rt-reload title=\"Actualiser les prévisualisations\">↻ Actualiser</button>\n  <a data-rt-open target=\"_blank\" rel=\"noopener noreferrer\" title=\"Ouvrir l'URL dans un autre onglet\">↗ Onglet</a>\n  <button type=\"button\" data-rt-dual aria-pressed=\"false\">◫ Vue double</button>\n  <button type=\"button\" data-rt-show-settings aria-controls=\"rt-settings\" aria-expanded=\"true\">⚙ Réglages</button>\n </div>\n <div role=\"status\" aria-live=\"polite\" class=\"rt-message\" data-rt-message></div>\n <div class=\"rt-monitor\" data-rt-monitor>\n  <div class=\"rt-metrics\" data-rt-metrics></div>\n  <div class=\"rt-scroll\" data-rt-scroll>\n   <div class=\"rt-stages\" data-rt-stages>\n    <section class=\"rt-stage\" data-rt-stage aria-label=\"Écran principal\">\n     <div class=\"rt-screen-title\" data-rt-screen-title>Portrait</div>\n     <div class=\"rt-device-frame\" data-rt-frame-box>\n      <div class=\"rt-chrome\"><span aria-hidden=\"true\">●</span><span data-rt-address-label>Prévisualisation</span><span>⋯</span></div>\n      <div class=\"rt-viewport\" data-rt-viewport><iframe data-rt-frame title=\"Site web testé — écran principal\" loading=\"eager\" referrerpolicy=\"no-referrer\"></iframe></div>\n     </div>\n    </section>\n    <section class=\"rt-stage\" data-rt-stage-secondary aria-label=\"Deuxième orientation\" hidden>\n     <div class=\"rt-screen-title\" data-rt-screen-title-secondary>Paysage</div>\n     <div class=\"rt-device-frame\" data-rt-frame-box-secondary>\n      <div class=\"rt-chrome\"><span aria-hidden=\"true\">●</span><span data-rt-address-label-secondary>Prévisualisation</span><span>⋯</span></div>\n      <div class=\"rt-viewport\" data-rt-viewport-secondary><iframe data-rt-frame-secondary title=\"Site web testé — orientation opposée\" loading=\"eager\" referrerpolicy=\"no-referrer\"></iframe></div>\n     </div>\n    </section>\n   </div>\n  </div>\n  <aside class=\"rt-top\" id=\"rt-settings\" data-rt-panel data-collapsed=\"false\" aria-label=\"Réglages de l'écran simulé\">\n   <div class=\"rt-panel-head\" data-rt-panel-head>\n    <strong>⚙ Réglages d'écran</strong>\n    <button type=\"button\" data-rt-collapse aria-controls=\"rt-screen-fields\" aria-expanded=\"true\">Réduire</button>\n   </div>\n   <div class=\"rt-panel-fields\" id=\"rt-screen-fields\">\n    <div class=\"rt-preset\">\n     <label>Appareil <select data-rt-device><option value=\"desktop\">Ordinateur</option><option value=\"tablet\">Tablette</option><option value=\"phone\">Téléphone</option><option value=\"small\">Petit téléphone</option><option value=\"custom\">Personnalisé</option></select></label>\n     <fieldset class=\"rt-orientation\"><legend>Orientation principale</legend><label><input type=\"radio\" name=\"rt-orientation\" value=\"portrait\" checked> Portrait</label><label><input type=\"radio\" name=\"rt-orientation\" value=\"landscape\"> Paysage</label></fieldset>\n    </div>\n    <div class=\"rt-preset\">\n     <label>Largeur <input data-rt-width type=\"number\" inputmode=\"numeric\" min=\"240\" max=\"2560\" step=\"1\">px</label>\n     <label>Hauteur <input data-rt-height type=\"number\" inputmode=\"numeric\" min=\"240\" max=\"2560\" step=\"1\">px</label>\n    </div>\n    <div class=\"rt-preset\">\n     <label>Échelle <select data-rt-scale><option value=\"fit\">Ajuster</option><option value=\"1\">100 %</option><option value=\"0.75\">75 %</option><option value=\"0.5\">50 %</option><option value=\"0.25\">25 %</option></select></label>\n     <button type=\"button\" data-rt-rotate title=\"Échanger portrait et paysage\">↻ Pivoter</button>\n     <button type=\"button\" data-rt-default title=\"Mémoriser ce format comme favori\">★ Par défaut</button>\n    </div>\n    <label class=\"rt-reload-label\"><input data-rt-auto-reload type=\"checkbox\" checked> Recharger le site au changement de format</label>\n   </div>\n  </aside>\n </div>\n <p class=\"rt-note\">Chaque iframe possède son propre viewport CSS : les media queries responsive et les événements de redimensionnement s'y appliquent. Le rechargement optionnel aide les sites qui calculent leur affichage au démarrage. Le zoom change seulement l'échelle du cadre, pas les API d'un vrai appareil Android (ni User-Agent, tactile ou permissions). Certains sites refusent les iframes (CSP / X-Frame-Options). En vue double, les deux pages sont indépendantes après chargement.</p>\n</div>";
 const query=s=>root.querySelector(s);
 const ui={
  device:query('[data-rt-device]'),width:query('[data-rt-width]'),height:query('[data-rt-height]'),scale:query('[data-rt-scale]'),
  message:query('[data-rt-message]'),url:query('[data-rt-url]'),open:query('[data-rt-open]'),
  frame:query('[data-rt-frame]'),frameB:query('[data-rt-frame-secondary]'),
  boxA:query('[data-rt-frame-box]'),boxB:query('[data-rt-frame-box-secondary]'),
  viewportA:query('[data-rt-viewport]'),viewportB:query('[data-rt-viewport-secondary]'),
  stageA:query('[data-rt-stage]'),stageB:query('[data-rt-stage-secondary]'),
  stages:query('[data-rt-stages]'),titleA:query('[data-rt-screen-title]'),titleB:query('[data-rt-screen-title-secondary]'),
  scroll:query('[data-rt-scroll]'),metrics:query('[data-rt-metrics]'),labelA:query('[data-rt-address-label]'),labelB:query('[data-rt-address-label-secondary]'),
  workspace:query('[data-rt-workspace]'),monitor:query('[data-rt-monitor]'),panel:query('[data-rt-panel]'),panelHead:query('[data-rt-panel-head]'),
  settingsButton:query('[data-rt-show-settings]'),collapseButton:query('[data-rt-collapse]'),
  dualButton:query('[data-rt-dual]'),reload:query('[data-rt-auto-reload]')
 };
 const message=t=>{ui.message.textContent=t};
 const opposed=()=>({width:state.height,height:state.width});
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
  const scale=scaleMode==='fit'?clamp(Math.min(1,maxW/rawWidth,maxH/rawHeight),.10,1):Number(scaleMode);
  ui.stageB.hidden=!dual;
  ui.stages.style.gap=dual?18*scale+'px':'0px';
  dimensions(ui.boxA,ui.viewportA,ui.frame,w,h,scale,ui.stageA,ui.titleA);
  if(dual)dimensions(ui.boxB,ui.viewportB,ui.frameB,other.width,other.height,scale,ui.stageB,ui.titleB);
  ui.stages.style.width=Math.ceil(rawWidth*scale)+'px';
  ui.stages.style.height=Math.ceil(rawHeight*scale)+29+'px';
  ui.device.value=state.preset;ui.scale.value=scaleMode;
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
  if(!SCREEN_PRESETS[id]&&id!=='custom')return false;
  const pair=presetDimensions(id,orientation,id==='custom'?[state.width,state.height]:undefined);
  state={preset:id,orientation,...pair};afterDimensionChange();return true;
 };
 const setDimensions=(w,h)=>{
  const width=integer(w),height=integer(h);
  if(width===null||height===null){message('Dimensions attendues : nombres entiers de 240 à 2560 px.');return false}
  state={preset:'custom',orientation:width>height?'landscape':'portrait',width,height};
  afterDimensionChange();message('Format personnalisé appliqué.');return true;
 };
 const setOrientation=orientation=>{
  if(!['portrait','landscape'].includes(orientation))return false;
  if(state.preset==='custom'){
   const [w,h]=[state.width,state.height];
   state={...state,orientation,width:orientation==='portrait'?Math.min(w,h):Math.max(w,h),height:orientation==='portrait'?Math.max(w,h):Math.min(w,h)};
  }else state={...state,orientation,...presetDimensions(state.preset,orientation)};
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
  ui.collapseButton.setAttribute('aria-expanded',String(open));
  ui.collapseButton.textContent=open?'Réduire':'Déployer';
  update();
 };
 ui.settingsButton.addEventListener('click',()=>setPanelOpen(ui.panel.dataset.collapsed==='true'));
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
 ui.device.addEventListener('change',()=>setPreset(ui.device.value));
 root.querySelectorAll('input[name="rt-orientation"]').forEach(r=>r.addEventListener('change',()=>{if(r.checked)setOrientation(r.value)}));
 for(const input of [ui.width,ui.height])input.addEventListener('change',()=>setDimensions(ui.width.value,ui.height.value));
 query('[data-rt-rotate]').addEventListener('click',()=>setOrientation(state.orientation==='portrait'?'landscape':'portrait'));
 ui.scale.addEventListener('change',()=>{scaleMode=ui.scale.value;update()});
 ui.dualButton.addEventListener('click',()=>setDual(!dual));
 ui.reload.addEventListener('change',()=>{reloadOnChange=ui.reload.checked;message(reloadOnChange?'Rechargement automatique activé.':'Rechargement désactivé : le viewport se redimensionne sans navigation.')});
 query('[data-rt-load]').addEventListener('click',()=>load());
 ui.url.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();load()}});
 query('[data-rt-reload]').addEventListener('click',refresh);
 query('[data-rt-default]').addEventListener('click',()=>{
  try{localStorage.setItem(storageKey,JSON.stringify(state));message('Format par défaut enregistré dans ce navigateur.')}
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
  getState:()=>({...state,scale:scaleMode,dual,reloadOnChange,url:currentUrl?.href||null}),
  setPreset,setDimensions,setOrientation,setDual,load,refresh,getFrame:()=>ui.frame,getFrames:()=>dual?[ui.frame,ui.frameB]:[ui.frame],
  destroy:()=>{observer?.disconnect();root.innerHTML='';delete root.__responsiveSimulator}
 };
 root.__responsiveSimulator=api;return api;
}
