const clamp=(n,min,max)=>Math.max(min,Math.min(max,n));
const num=v=>Number(String(v??'').replace('%','').trim());

function dispatch(host,detail){
  const payload={viewerId:host.dataset.viewerId||host.id||'viewer',...detail};
  host.dispatchEvent(new CustomEvent('studio-v2:viewer-command',{detail:payload,bubbles:true}));
  document.dispatchEvent(new CustomEvent('studio-v2:viewer-command-global',{detail:payload}));
}
function render(host,state){
  const input=host.querySelector('[data-viewer-percent]');
  if(input&&document.activeElement!==input)input.value=String(Math.round(state.zoom));
  const out=host.querySelector('[data-viewer-state]');
  if(out)out.textContent=state.fit?'Ajusté':Math.round(state.zoom)+' %';
}
export function mountViewerControls(host,options={}){
  const el=typeof host==='string'?document.querySelector(host):host;if(!el)return null;
  if(el.dataset.viewerMounted==='1')return el.__viewerApi||null;
  const min=Number(options.min??el.dataset.min??25),max=Number(options.max??el.dataset.max??400),step=Number(options.step??el.dataset.step??25);
  const presets=String(options.presets??el.dataset.presets??'25,50,75,100,150,200').split(',').map(Number).filter(Number.isFinite);
  const state={zoom:clamp(Number(options.value??el.dataset.value??100),min,max),fit:false};
  el.classList.add('coreViewerControls');el.dataset.viewerMounted='1';
  el.innerHTML='<button type="button" data-viewer-minus aria-label="Zoom arrière" title="Zoom arrière">−</button>'+
    '<label class="coreViewerPercent"><input data-viewer-percent type="number" inputmode="decimal" min="'+min+'" max="'+max+'" step="1" aria-label="Zoom en pourcentage"><span>%</span></label>'+
    '<button type="button" data-viewer-plus aria-label="Zoom avant" title="Zoom avant">+</button>'+
    '<button type="button" data-viewer-fit>Ajuster</button><button type="button" data-viewer-actual>100 %</button>'+
    '<select data-viewer-preset aria-label="Zoom prédéfini"><option value="">Zoom…</option>'+presets.map(v=>'<option value="'+v+'">'+v+' %</option>').join('')+'</select>'+
    '<span data-viewer-state class="coreViewerState"></span>';
  const setZoom=(value,{emit=true}={})=>{const z=clamp(num(value)||100,min,max);state.zoom=z;state.fit=false;render(el,state);if(emit)dispatch(el,{action:'zoom',zoom:z,ratio:z/100});return z};
  const fit=({emit=true}={})=>{state.fit=true;render(el,state);if(emit)dispatch(el,{action:'fit',zoom:state.zoom,ratio:state.zoom/100})};
  const actual=({emit=true}={})=>{state.zoom=100;state.fit=false;render(el,state);if(emit)dispatch(el,{action:'actual',zoom:100,ratio:1})};
  el.querySelector('[data-viewer-minus]').onclick=()=>setZoom(state.zoom-step);
  el.querySelector('[data-viewer-plus]').onclick=()=>setZoom(state.zoom+step);
  el.querySelector('[data-viewer-fit]').onclick=()=>fit();
  el.querySelector('[data-viewer-actual]').onclick=()=>actual();
  const input=el.querySelector('[data-viewer-percent]');
  input.onchange=()=>setZoom(input.value);input.onkeydown=e=>{if(e.key==='Enter'){e.preventDefault();input.blur();setZoom(input.value)}};
  el.querySelector('[data-viewer-preset]').onchange=e=>{if(e.target.value)setZoom(e.target.value);e.target.value=''};
  const api={setZoom,fit,actual,getState:()=>({...state}),sync({zoom,fit:fitMode}={}){if(Number.isFinite(Number(zoom)))state.zoom=clamp(Number(zoom),min,max);state.fit=!!fitMode;render(el,state)}};
  el.__viewerApi=api;render(el,state);return api
}
export function mountAllViewerControls(root=document){root.querySelectorAll('[data-core-viewer-controls]').forEach(el=>mountViewerControls(el))}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>mountAllViewerControls());else mountAllViewerControls();
