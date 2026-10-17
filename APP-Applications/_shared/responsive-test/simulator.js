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
 root.innerHTML=`<div class="rt-top"><div class="rt-preset">
 <label>Appareil <select data-rt-device><option value="desktop">Ordinateur</option><option value="tablet">Tablette</option><option value="phone">Téléphone</option><option value="small">Petit téléphone</option><option value="custom">Personnalisé</option></select></label>
 <fieldset class="rt-orientation"><legend>Orientation</legend><label><input type="radio" name="rt-orientation" value="portrait" checked> Portrait</label><label><input type="radio" name="rt-orientation" value="landscape"> Paysage</label></fieldset>
 <label>Largeur <input data-rt-width type="number" inputmode="numeric" min="240" max="2560" step="1">px</label>
 <label>Hauteur <input data-rt-height type="number" inputmode="numeric" min="240" max="2560" step="1">px</label>
 <button type="button" data-rt-default title="Mémoriser cet écran comme format initial">★ Par défaut</button>
 <button type="button" data-rt-rotate title="Échanger les orientations">↻ Pivoter</button>
 <label>Échelle <select data-rt-scale><option value="fit">Ajuster</option><option value="1">100 %</option><option value="0.75">75 %</option><option value="0.5">50 %</option><option value="0.25">25 %</option></select></label>
 </div><div class="rt-address">
 <label for="rt-target-url">Page à tester</label><input id="rt-target-url" data-rt-url type="url" spellcheck="false" placeholder="https://exemple.fr ou ../studios/" autocomplete="off">
 <button data-rt-load type="button">Charger dans l’iframe</button><button data-rt-reload type="button">Actualiser</button><a data-rt-open target="_blank" rel="noopener noreferrer">Ouvrir dans un onglet ↗</a>
 </div><div role="status" aria-live="polite" class="rt-message" data-rt-message></div></div>
 <div class="rt-monitor"><div class="rt-metrics" data-rt-metrics></div><div class="rt-scroll" data-rt-scroll><div class="rt-stage" data-rt-stage>
 <div class="rt-device-frame" data-rt-frame-box><div class="rt-chrome"><span aria-hidden="true">●</span><span data-rt-address-label>Prévisualisation</span><span>⋯</span></div>
 <div class="rt-viewport" data-rt-viewport><iframe data-rt-frame title="Page web testée en résolution simulée" loading="eager" referrerpolicy="no-referrer"></iframe></div>
 </div></div></div></div>
 <p class="rt-note">Le simulateur limite la largeur et la hauteur CSS d’un iframe, pas les API d’un véritable appareil Android. Certains sites interdisent leur chargement en iframe : ouvrez-les dans un onglet.</p>`;
 const query=s=>root.querySelector(s),ui={device:query('[data-rt-device]'),width:query('[data-rt-width]'),height:query('[data-rt-height]'),scale:query('[data-rt-scale]'),message:query('[data-rt-message]'),url:query('[data-rt-url]'),open:query('[data-rt-open]'),frame:query('[data-rt-frame]'),frameBox:query('[data-rt-frame-box]'),viewport:query('[data-rt-viewport]'),scroll:query('[data-rt-scroll]'),stage:query('[data-rt-stage]'),metrics:query('[data-rt-metrics]'),label:query('[data-rt-address-label]')};
 const message=t=>{ui.message.textContent=t};
 const update=()=>{
  const w=state.width,h=state.height;
  const maxW=Math.max(120,ui.scroll.clientWidth-24);
  const scale=scaleMode==='fit'?clamp(Math.min(1,maxW/(w+16),720/(h+42)),.12,1):Number(scaleMode);
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
