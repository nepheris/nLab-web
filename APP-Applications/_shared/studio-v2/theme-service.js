// One canonical appearance policy for all Studio Core V2 consumers.
// Palette values are CSS tokens; specialized Studios must consume the same tokens.
export const DEFAULT_ACCENT='#316D9A';
export const ACCENT_PRESETS=Object.freeze({
  nlab:'#316D9A',blue:'#086BBB',teal:'#247B78',green:'#287B48',
  purple:'#7854A8',orange:'#AE641C',red:'#A34052'
});
export function normalizedAccent(value){
  return typeof value==='string'&&/^#[0-9a-f]{6}$/i.test(value)?value.toUpperCase():DEFAULT_ACCENT;
}
function rgb(hex){return [1,3,5].map(i=>parseInt(hex.slice(i,i+2),16))}
function mix(a,b,ratio){
  const x=rgb(a),y=rgb(b);
  return '#'+x.map((v,i)=>Math.round(v*(1-ratio)+y[i]*ratio).toString(16).padStart(2,'0')).join('').toUpperCase();
}
function contrast(hex){
  const luminance=rgb(hex).map(v=>{const c=v/255;return c<=.04045?c/12.92:((c+.055)/1.055)**2.4;});
  const l=.2126*luminance[0]+.7152*luminance[1]+.0722*luminance[2];
  return l>.179?'#111827':'#FFFFFF';
}
export function applySharedTheme(root,{theme='system',accentColor=DEFAULT_ACCENT}={}){
  if(!root)throw Error('Studio theme root is required');
  const preference=['system','light','dark'].includes(theme)?theme:'system';
  const dark=preference==='dark'||(preference==='system'&&typeof matchMedia==='function'&&matchMedia('(prefers-color-scheme: dark)').matches);
  root.classList.toggle('themeDark',dark);
  root.dataset.themeEffective=dark?'dark':'light';
  root.style.colorScheme=dark?'dark':'light';
  const base=normalizedAccent(accentColor);
  // Brighten the selected hue on dark surfaces; preserve one preference in both modes.
  const accent=dark?mix(base,'#FFFFFF',.24):base;
  const soft=mix(accent,dark?'#202D3C':'#FFFFFF',dark?.77:.87);
  root.style.setProperty('--nlab-brand',accent);
  root.style.setProperty('--nlab-accent',accent);
  root.style.setProperty('--nlab-brand-soft',soft);
  root.style.setProperty('--nlab-brand-contrast',contrast(accent));
  root.style.setProperty('--ux-accent',accent);
  root.style.setProperty('--ux-accent-soft',soft);
  root.style.setProperty('--studio-theme-accent',accent);
  return {preference,effective:dark?'dark':'light',accent};
}
