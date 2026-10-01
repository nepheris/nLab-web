const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
export class SteppedPresetControl extends EventTarget{
 constructor({host,min=0,max=100,step=1,value,presets=[],unit='',describe=null,name='Réglage'}={}){
  super();this.host=typeof host==='string'?document.querySelector(host):host;this.min=Number(min);this.max=Number(max);this.step=Number(step)||1;this.value=clamp(Number(value??min),this.min,this.max);this.presets=presets;this.unit=unit;this.describe=describe||((v,p)=>p?.label||String(v));this.name=name;this.render()
 }
 nearestPreset(v=this.value){if(!this.presets.length)return null;return [...this.presets].sort((a,b)=>Math.abs(Number(a.value)-v)-Math.abs(Number(b.value)-v))[0]||null}
 presetForValue(v=this.value){const exact=this.presets.find(p=>Number(p.value)===Number(v));if(exact)return exact;const ranged=this.presets.find(p=>p.min!=null&&p.max!=null&&v>=Number(p.min)&&v<=Number(p.max));return ranged||this.nearestPreset(v)}
 setValue(v,{emit=true}={}){const n=clamp(Math.round(Number(v)/this.step)*this.step,this.min,this.max);this.value=Number.isFinite(n)?n:this.min;this.sync();if(emit)this.dispatchEvent(new CustomEvent('change',{detail:{value:this.value,preset:this.presetForValue(this.value)}}));return this.value}
 render(){
  if(!this.host)return;this.host.classList.add('steppedPresetControl');
  this.host.innerHTML='<div class="steppedPresetButtons">'+this.presets.map(p=>'<button type="button" data-step-preset="'+esc(p.id||p.label)+'" data-value="'+Number(p.value)+'">'+esc(p.label)+'</button>').join('')+'</div><div class="steppedPresetRow"><button type="button" data-step-minus aria-label="Diminuer">−</button><input data-step-number type="number" min="'+this.min+'" max="'+this.max+'" step="'+this.step+'"><span class="steppedPresetUnit">'+esc(this.unit)+'</span><button type="button" data-step-plus aria-label="Augmenter">+</button></div><input data-step-range type="range" min="'+this.min+'" max="'+this.max+'" step="'+this.step+'"><div class="steppedPresetDescription"></div>';
  this.host.querySelectorAll('[data-step-preset]').forEach(b=>b.onclick=()=>this.setValue(Number(b.dataset.value)));
  this.host.querySelector('[data-step-minus]').onclick=()=>this.setValue(this.value-this.step);
  this.host.querySelector('[data-step-plus]').onclick=()=>this.setValue(this.value+this.step);
  const num=this.host.querySelector('[data-step-number]'),range=this.host.querySelector('[data-step-range]');
  num.onchange=()=>this.setValue(Number(num.value));range.oninput=()=>this.setValue(Number(range.value));
  this.sync()
 }
 sync(){
  if(!this.host)return;const p=this.presetForValue(this.value);
  const num=this.host.querySelector('[data-step-number]'),range=this.host.querySelector('[data-step-range]'),desc=this.host.querySelector('.steppedPresetDescription');
  if(num)num.value=String(this.value);if(range)range.value=String(this.value);
  this.host.querySelectorAll('[data-step-preset]').forEach(b=>b.classList.toggle('active',p&&String(b.dataset.stepPreset)===String(p.id||p.label)));
  if(desc)desc.textContent=this.describe(this.value,p)
 }
}
export function mountSteppedPresetControl(host,config={}){return new SteppedPresetControl({host,...config})}
