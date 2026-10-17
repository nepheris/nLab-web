// Shared Studio Core color conversions and opt-in editor. No global state or CDN.
const bound=(value,min,max)=>Math.max(min,Math.min(max,Number(value)));
const finite=(...values)=>values.every(value=>value!==''&&value!==null&&Number.isFinite(Number(value)));
export function normalizeHex(value){
 const raw=String(value??'').trim().replace(/^#/,'');
 if(/^[0-9a-f]{3}$/i.test(raw))return '#'+[...raw].map(x=>x+x).join('').toUpperCase();
 if(/^[0-9a-f]{6}$/i.test(raw))return '#'+raw.toUpperCase();
 return null;
}
export function hexToRgb(value){
 const hex=normalizeHex(value);
 if(!hex)return null;
 return {r:parseInt(hex.slice(1,3),16),g:parseInt(hex.slice(3,5),16),b:parseInt(hex.slice(5,7),16)};
}
export function rgbToHex({r,g,b}={}){
 if(!finite(r,g,b))return null;
 return '#'+[r,g,b].map(v=>Math.round(bound(v,0,255)).toString(16).padStart(2,'0')).join('').toUpperCase();
}
export function rgbToHsl({r,g,b}={}){
 if(!finite(r,g,b))return null;
 const channels=[r,g,b].map(v=>bound(v,0,255)/255),max=Math.max(...channels),min=Math.min(...channels),delta=max-min;
 let h=0,s=0;const l=(max+min)/2;
 if(delta){
  s=delta/(1-Math.abs(2*l-1));
  if(max===channels[0])h=((channels[1]-channels[2])/delta)%6;
  else if(max===channels[1])h=(channels[2]-channels[0])/delta+2;
  else h=(channels[0]-channels[1])/delta+4;
  h=(h*60+360)%360;
 }
 return {h:Math.round(h),s:Math.round(s*100),l:Math.round(l*100)};
}
export function hslToRgb({h,s,l}={}){
 if(!finite(h,s,l))return null;
 const hue=((Number(h)%360)+360)%360,sat=bound(s,0,100)/100,light=bound(l,0,100)/100;
 const chroma=(1-Math.abs(2*light-1))*sat,x=chroma*(1-Math.abs((hue/60)%2-1)),m=light-chroma/2;
 let channels;
 if(hue<60)channels=[chroma,x,0];
 else if(hue<120)channels=[x,chroma,0];
 else if(hue<180)channels=[0,chroma,x];
 else if(hue<240)channels=[0,x,chroma];
 else if(hue<300)channels=[x,0,chroma];
 else channels=[chroma,0,x];
 const [r,g,b]=channels.map(v=>Math.round((v+m)*255));
 return {r,g,b};
}
export function mountColorPicker(host,{value='#316D9A',onChange}={}){
 const root=typeof host==='string'?document.querySelector(host):host;
 if(!root)return null;
 if(root.__studioColorPicker)return root.__studioColorPicker;
 const original=normalizeHex(value)||'#316D9A';
 root.innerHTML='<fieldset class="studioCoreColorPicker"><legend>Couleur</legend>'+
  '<label>Nuancier <input type="color" data-color-native></label>'+
  '<label>HEX <input type="text" data-color-hex maxlength="7" spellcheck="false" aria-label="Couleur hexadécimale"></label>'+
  '<label>RGB <input type="number" data-color-r min="0" max="255" aria-label="Rouge"> <input type="number" data-color-g min="0" max="255" aria-label="Vert"> <input type="number" data-color-b min="0" max="255" aria-label="Bleu"></label>'+
  '<label>HSL <input type="number" data-color-h min="0" max="360" aria-label="Teinte"> <input type="number" data-color-s min="0" max="100" aria-label="Saturation"> <input type="number" data-color-l min="0" max="100" aria-label="Luminosité"></label>'+
  '</fieldset>';
 const field=name=>root.querySelector('[data-color-'+name+']');
 let hex=original;
 const render=()=>{
  const rgb=hexToRgb(hex),hsl=rgbToHsl(rgb);
  field('native').value=hex.toLowerCase();field('hex').value=hex;
  for(const key of ['r','g','b'])field(key).value=rgb[key];
  for(const key of ['h','s','l'])field(key).value=hsl[key];
 };
 const set=(next,{emit=true}={})=>{
  const normalized=normalizeHex(next);
  if(!normalized)return false;
  const changed=normalized!==hex;hex=normalized;render();
  if(changed&&emit){
   const detail={hex,rgb:hexToRgb(hex),hsl:rgbToHsl(hexToRgb(hex))};
   root.dispatchEvent(new CustomEvent('studio-v2:color-change',{bubbles:true,detail}));
   onChange?.(detail);
  }
  return true;
 };
 const convert=group=>{
  const keys=group==='rgb'?['r','g','b']:['h','s','l'];
  const values=Object.fromEntries(keys.map(k=>[k,field(k).value]));
  if(!keys.every(k=>finite(values[k])))return false;
  return set(group==='rgb'?rgbToHex(values):rgbToHex(hslToRgb(values)));
 };
 field('native').addEventListener('input',()=>set(field('native').value));
 field('hex').addEventListener('change',()=>{if(!set(field('hex').value))render()});
 for(const k of ['r','g','b'])field(k).addEventListener('change',()=>{if(!convert('rgb'))render()});
 for(const k of ['h','s','l'])field(k).addEventListener('change',()=>{if(!convert('hsl'))render()});
 const api={getValue:()=>hex,setValue:value=>set(value)};
 root.__studioColorPicker=api;render();return api;
}
