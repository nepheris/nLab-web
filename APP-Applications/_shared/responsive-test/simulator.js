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
 let scaleMode='fit';
 let currentUrl=null;
 root.innerHTML=\`<div class="rt-workspace" data-rt-workspace>
 <div class="rt-address" role="group" aria-label="Adresse du site à prévisualiser">
  <label for="rt-target-url">URL à tester</label>
  <input id="rt-target-url" data-rt-url type="url" spellcheck="false" placeholder="https://exemple.fr ou ../studios/" autocomplete="off">
  <button type="button" data-rt-load>Afficher</button>
  <button type="button" data-rt-reload title="Actualiser le site testé">↻ Actualiser</button>
  <a data-rt-open target="_blank" rel="noopener noreferrer" title="Ouvrir l'URL dans un autre onglet">↗ Onglet</a>
  <button type="button" data-rt-show-settings aria-controls="rt-settings" aria-expanded="true">⚙ Réglages</button>
 </div>
 <div role="status" aria-live="polite" class="rt-message" data-rt-message></div>
 <div class="rt-monitor" data-rt-monitor>
  <div class="rt-metrics" data-rt-metrics></div>
  <div class="rt-scroll" data-rt-scroll>
   <div class="rt-stage" data-rt-stage>
    <div class="rt-device-frame" data-rt-frame-box>
     <div class="rt-chrome"><span aria-hidden="true">●</span><span data-rt-address-label>Prévisualisation</span><span>⋯</span></div>
     <div class="rt-viewport" data-rt-viewport><iframe data-rt-frame title="Site web à tester en résolution simulée" loading="eager" referrerpolicy="no-referrer"></iframe></div>
    </div>
   </div>
  </div>
  <aside class="rt-top" id="rt-settings" data-rt-panel data-collapsed="false" aria-label="Réglages de l'écran simulé">
   <div class="rt-panel-head" data-rt-panel-head>
    <strong>⚙ Réglages d'écran</strong>
    <button type="button" data-rt-collapse aria-controls="rt-screen-fields" aria-expanded="true">Réduire</button>
   </div>
   <div class="rt-panel-fields" id="rt-screen-fields" data-rt-panel-fields>
    <div class="rt-preset">
     <label>Appareil <select data-rt-device><option value="desktop">Ordinateur</option><option value="tablet">Tablette</option><option value="phone">Téléphone</option><option value="small">Petit téléphone</option><option value="custom">Personnalisé</option></select></label>
     <fieldset class="rt-orientation"><legend>Orientation</legend><label><input type="radio" name="rt-orientation" value="portrait" checked> Portrait</label><label><input type="radio" name="rt-orientation" value="landscape"> Paysage</label></fieldset>
    </div>
    <div class="rt-preset">
     <label>Largeur <input data-rt-width type="number" inputmode="numeric" min="240" max="2560" step="1">px</label>
     <label>Hauteur <input data-rt-height type="number" inputmode="numeric" min="240" max="2560" step="1">px</label>
    </div>
    <div class="rt-preset">
     <label>Échelle <select data-rt-scale><option value="fit">Ajuster</option><option value="1">100 %</option><option value="0.75">75 %</option><option value="0.5">50 %</option><option value="0.25">25 %</option></select></label>
     <button type="button" data-rt-rotate title="Permuter portrait et paysage">↻ Pivoter</button>
     <button type="button" data-rt-default title="Mémoriser ce format dans ce navigateur">★ Par défaut</button>
    </div>
   </div>
  </aside>
 </div>
 <p class="rt-note">Aperçu en dimensions CSS réelles : le zoom n'altère pas le viewport de l'iframe. Cette prévisualisation ne simule pas les API Android, les permissions natives ou le navigateur tactile. Des sites peuvent interdire l'iframe via CSP ou X-Frame-Options.</p>
</div>\`;
 const query=s=>root.querySelector(s),ui={device:query('[data-rt-device]'),width:query('[data-rt-width]'),height:query('[data-rt-height]'),scale:query('[data-rt-scale]'),message:query('[data-rt-message]'),url:query('[data-rt-url]'),open:query('[data-rt-open]'),frame:query('[data-rt-frame]'),frameBox:query('[data-rt-frame-box]'),viewport:query('[data-rt-viewport]'),scroll:query('[data-rt-scroll]'),stage:query('[data-rt-stage]'),metrics:query('[data-rt-metrics]'),label:query('[data-rt-address-label]'),workspace:query('[data-rt-workspace]'),monitor:query('[data-rt-monitor]'),panel:query('[data-rt-panel]'),panelHead:query('[data-rt-panel-head]'),settingsButton:query('[data-rt-show-settings]'),collapseButton:query('[data-rt-collapse]')};
 const message=t=>{ui.message.textContent=t};
 const update=()=>{
  const w=state.width,h=state.height;
  const reserved=ui.workspace.dataset.panelOpen==='true'&&window.matchMedia('(min-width:1100px)').matches?348:0;
  const maxW=Math.max(120,ui.scroll.clientWidth-reserved-36);
  const maxH=Math.max(160,ui.scroll.clientHeight-36);
  const scale=scaleMode==='fit'?clamp(Math.min(1,maxW/(w+16),maxH/(h+42)),.12,1):Number(scaleMode);
  ui.frameBox.style.width=w+16+'px';ui.frameBox.style.height=h+42+'px';ui.frameBox.style.transform='scale('+scale+')';
  ui.viewport.style.width=ui.frame.style.width=w+'px';ui.viewport.style.height=ui.frame.style.height=h+'px';
  ui.stage.style.width=Math.ceil((w+16)*scale)+'px';ui.stage.style.height=Math.ceil((h+42)*scale)+'px';
  ui.device.value=state.preset;ui.scale.value=scaleMode;
  root.querySelectorAll('input[name="rt-orientation"]').forEach(r=>{r.checked=r.value===state.orientation});
  if(document.activeElement!==ui.width)ui.width.value=w;
  if(document.activeElement!==ui.height)ui.height.value=h;
  let measured='';try{const frameW=ui.frame.contentWindow?.innerWidth;measured=frameW?' · iframe '+frameW+' px':''}catch{measured=' · domaine externe'}
  ui.metrics.textContent=w+' × '+h+' px · '+state.orientation+' · échelle '+Math.round(scale*100)+' %'+measured;
 };
 const setPreset=(id,orientation=state.orientation)=>{
  if(!SCREEN_PRESETS[id]&&id!=='custom')return false;
  const pair=presetDimensions(id,orientation,id==='custom'?[state.width,state.height]:undefined);
  state={preset:id,orientation,...pair};update();return true;
 };
 const setDimensions=(w,h)=>{
  const width=integer(w),height=integer(h);
  if(width===null||height===null){message('Dimensions attendues : nombres entiers de 240 à 2560 px.');return false}
  state={preset:'custom',orientation:width>height?'landscape':'portrait',width,height};update();message('Format personnalisé appliqué.');return true;
 };
 const setOrientation=orientation=>{
  if(!['portrait','landscape'].includes(orientation))return false;
  if(state.preset==='custom'){
   const [w,h]=[state.width,state.height];
   state={...state,orientation,width:orientation==='portrait'?Math.min(w,h):Math.max(w,h),height:orientation==='portrait'?Math.max(w,h):Math.min(w,h)};
  }else{const next=presetDimensions(state.preset,orientation);state={...state,orientation,...next}}
  update();return true;
 };
 const load=(value=ui.url.value)=>{
  let u;try{u=resolvePreviewUrl(value,location.href)}catch(error){message(error.message);return false}
  currentUrl=u;ui.url.value=u.href;ui.frame.src=u.href;ui.open.href=u.href;ui.label.textContent=u.hostname+(u.pathname==='/'?'':u.pathname);
  const external=u.origin!==location.origin;
  message(external?'Domaine externe : affichage dépendant des protections iframe (CSP / X-Frame-Options). La page interne ne peut pas être inspectée.':'Chargement du site local dans l’iframe…');
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
 // Optional pointer drag: the palette moves inside the preview surface, not inside the tested iframe.
 let drag=null;
 ui.panelHead.addEventListener('pointerdown',event=>{
  if(event.button!==0||event.target.closest('button,a,input,select')||window.matchMedia('(max-width:640px)').matches)return;
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
 setPanelOpen(!window.matchMedia('(max-width:760px)').matches);
 ui.device.addEventListener('change',()=>setPreset(ui.device.value));
 root.querySelectorAll('input[name="rt-orientation"]').forEach(r=>r.addEventListener('change',()=>{if(r.checked)setOrientation(r.value)}));
 for(const input of [ui.width,ui.height])input.addEventListener('change',()=>setDimensions(ui.width.value,ui.height.value));
 query('[data-rt-rotate]').addEventListener('click',()=>setOrientation(state.orientation==='portrait'?'landscape':'portrait'));
 ui.scale.addEventListener('change',()=>{scaleMode=ui.scale.value;update()});
 query('[data-rt-load]').addEventListener('click',()=>load());
 ui.url.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();load()}});
 query('[data-rt-reload]').addEventListener('click',()=>{if(currentUrl)ui.frame.src=currentUrl.href});
 query('[data-rt-default]').addEventListener('click',()=>{
  try{localStorage.setItem(storageKey,JSON.stringify(state));message('Format par défaut enregistré dans ce navigateur.')}catch{message('Le navigateur ne permet pas de mémoriser ce format.')}
 });
 ui.frame.addEventListener('load',()=>{update();if(currentUrl?.origin===location.origin)message('Page locale chargée dans le viewport.')});
 let observer=null;
 if(typeof ResizeObserver!=='undefined'){observer=new ResizeObserver(update);observer.observe(ui.scroll)}
 else window.addEventListener('resize',update,{passive:true});
 update();load(src);
 const api={getState:()=>({...state,scale:scaleMode,url:currentUrl?.href||null}),setPreset,setDimensions,setOrientation,load,getFrame:()=>ui.frame,destroy:()=>{observer?.disconnect();root.innerHTML='';delete root.__responsiveSimulator}};
 root.__responsiveSimulator=api;return api;
}
