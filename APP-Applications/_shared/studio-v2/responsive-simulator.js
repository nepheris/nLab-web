// Studio Core reusable responsive viewport simulator (same-origin, CSS viewport only).
// Does NOT emulate Android Chrome OS, touch hardware, UA or native file-picker permissions.
const BASE_PRESETS=Object.freeze({
 desktop:{label:'Ordinateur',width:1440,height:900},
 laptop:{label:'Portable',width:1280,height:800},
 tablet:{label:'Tablette',width:768,height:1024},
 phone:{label:'Téléphone',width:393,height:852},
 phoneSmall:{label:'Petit mobile',width:360,height:800}
});
const clamp=(n,min,max)=>Math.max(min,Math.min(max,n));
const dimension=value=>{const n=Number(value);return Number.isFinite(n)?Math.round(clamp(n,240,2560)):null};
const el=(tag,attrs={},text='')=>{const node=document.createElement(tag);for(const [k,v] of Object.entries(attrs)){if(k==='className')node.className=v;else node.setAttribute(k,String(v))}if(text)node.textContent=text;return node};
export function mountResponsiveSimulator(host,{src='./?embed=1',presets=BASE_PRESETS,initialPreset='phone'}={}){
 const root=typeof host==='string'?document.querySelector(host):host;
 if(!root)throw Error('Responsive simulator host missing');
 if(root.__responsiveSimulator)return root.__responsiveSimulator;
 const dest=new URL(src,location.href);
 if(dest.origin!==location.origin)throw Error('Responsive preview must be same-origin');
 const presetList=Object.entries(presets);
 if(!presetList.length||!presets[initialPreset])throw Error('Invalid responsive simulator presets');
 let state={preset:initialPreset,width:presets[initialPreset].width,height:presets[initialPreset].height,zoom:'fit',grid:false};
 root.classList.add('responsiveSimulator');
 root.innerHTML=`<div class="rs-head">
 <div><strong>Simulateur responsive</strong><p>Vraie page Core dans un viewport limité. Ce n'est pas un appareil Android.</p></div>
 <div class="rs-presets" role="group" aria-label="Formats d'écran">
 ${presetList.map(([id,x])=>`<button type="button" data-rs-preset="${id}" aria-pressed="false">${x.label}</button>`).join('')}
 </div></div>
 <div class="rs-controls">
 <label>Largeur <input id="rs-width" data-rs-width type="number" min="240" max="2560" inputmode="numeric"> px</label>
 <label>Hauteur <input id="rs-height" data-rs-height type="number" min="240" max="2560" inputmode="numeric"> px</label>
 <button data-rs-rotate type="button" title="Inverser largeur et hauteur">↻ Pivoter</button>
 <label>Échelle <select data-rs-zoom><option value="fit">Ajuster</option><option value="1">100 %</option><option value="0.75">75 %</option><option value="0.5">50 %</option><option value="0.25">25 %</option></select></label>
 <label class="rs-grid-toggle"><input type="checkbox" data-rs-grid> Grille</label>
 <button type="button" data-rs-refresh>Actualiser</button>
 <a data-rs-open target="_blank" rel="noopener noreferrer">Plein écran ↗</a>
 </div>
 <div class="rs-caption" aria-live="polite" data-rs-info></div>
 <div class="rs-scroller" data-rs-scroller>
 <div class="rs-stage" data-rs-stage>
  <div class="rs-device" data-rs-device>
   <div class="rs-device-bar"><span aria-hidden="true">●</span><span data-rs-address>Core Lab · aperçu</span><span aria-hidden="true">⋯</span></div>
   <div class="rs-viewport" data-rs-viewport><iframe data-rs-frame title="Studio Core Lab en viewport simulé" loading="eager" referrerpolicy="same-origin"></iframe><div class="rs-grid" data-rs-grid-overlay hidden aria-hidden="true"></div></div>
  </div>
 </div></div>
 <p class="rs-foot">La largeur CSS de la page est réelle dans l'iframe. Les fichiers et autorisations Android, le clavier natif et les gestes multitouch devront être testés sur téléphone.</p>`;
 const find=s=>root.querySelector(s);
 const frame=find('[data-rs-frame]'),box=find('[data-rs-viewport]'),device=find('[data-rs-device]'),stage=find('[data-rs-stage]'),scroll=find('[data-rs-scroller]'),info=find('[data-rs-info]');
 const w=find('[data-rs-width]'),h=find('[data-rs-height]'),select=find('[data-rs-zoom]'),grid=find('[data-rs-grid]'),overlay=find('[data-rs-grid-overlay]');
 frame.src=dest.href;
 find('[data-rs-open]').href=dest.href;
 const refreshScale=()=>{
  const available=Math.max(240,scroll.clientWidth-24);
  const maxHeight=760;
  const raw=state.zoom==='fit'?Math.min(1,available/(state.width+24),maxHeight/(state.height+55)):Number(state.zoom);
  const scale=clamp(raw,.15,1);
  device.style.width=(state.width+24)+'px';
  device.style.height=(state.height+55)+'px';
  device.style.transform='scale('+scale+')';
  stage.style.width=Math.ceil((state.width+24)*scale)+'px';
  stage.style.height=Math.ceil((state.height+55)*scale)+'px';
  box.style.width=frame.style.width=state.width+'px';
  box.style.height=frame.style.height=state.height+'px';
  const cssViewport=(()=>{try{return frame.contentWindow?.innerWidth}catch{return null}})();
  const measure=cssViewport===state.width?' · iframe '+cssViewport+' px':cssViewport?' · iframe '+cssViewport+' px':'';
  info.textContent=state.width+' × '+state.height+' px · affichage '+Math.round(scale*100)+' %'+measure;
  // Do not overwrite a custom dimension while a user is editing it (especially on narrow layouts).
  if(document.activeElement!==w)w.value=state.width;
  if(document.activeElement!==h)h.value=state.height;
  select.value=state.zoom;
  for(const btn of root.querySelectorAll('[data-rs-preset]'))btn.setAttribute('aria-pressed',String(btn.dataset.rsPreset===state.preset));
 };
 const apply=patch=>{state={...state,...patch};refreshScale();return {...state}};
 const setDimensions=(width,height)=>{
  const nw=dimension(width),nh=dimension(height);
  if(nw===null||nh===null)return false;
  apply({width:nw,height:nh,preset:'custom'});return true;
 };
 const setPreset=id=>{
  const p=presets[id];if(!p)return false;
  apply({preset:id,width:p.width,height:p.height});return true;
 };
 for(const btn of root.querySelectorAll('[data-rs-preset]'))btn.addEventListener('click',()=>setPreset(btn.dataset.rsPreset));
 for(const input of [w,h])input.addEventListener('change',()=>{
  if(!setDimensions(w.value,h.value)){w.value=state.width;h.value=state.height}
 });
 find('[data-rs-rotate]').addEventListener('click',()=>apply({width:state.height,height:state.width,preset:'custom'}));
 select.addEventListener('change',()=>apply({zoom:select.value}));
 grid.addEventListener('change',()=>{state.grid=grid.checked;overlay.hidden=!grid.checked});
 find('[data-rs-refresh]').addEventListener('click',()=>{frame.src=dest.href});
 frame.addEventListener('load',()=>refreshScale());
 let observer=null;
 if(typeof ResizeObserver!=='undefined'){observer=new ResizeObserver(()=>refreshScale());observer.observe(scroll)}
 else window.addEventListener('resize',refreshScale,{passive:true});
 const api={getState:()=>({...state}),setDimensions,setPreset,rotate:()=>apply({width:state.height,height:state.width,preset:'custom'}),refresh:()=>{frame.src=dest.href},getFrame:()=>frame,destroy:()=>{observer?.disconnect();root.innerHTML='';delete root.__responsiveSimulator}};
 root.__responsiveSimulator=api;
 refreshScale();
 return api;
}
export const RESPONSIVE_PRESETS=BASE_PRESETS;
