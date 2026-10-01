const valid=v=>/^#[0-9a-f]{6}$/i.test(String(v||'').trim());
export function bindColorHexControl({colorInput,hexInput,onChange}={}){
 const color=typeof colorInput==='string'?document.querySelector(colorInput):colorInput,hex=typeof hexInput==='string'?document.querySelector(hexInput):hexInput;if(!color||!hex)return null;
 const apply=v=>{if(!valid(v))return false;const value=String(v).toUpperCase();color.value=value;hex.value=value;onChange?.(value);return true};
 const fromColor=()=>apply(color.value);color.addEventListener('input',fromColor);hex.addEventListener('change',()=>{if(!apply(hex.value))hex.value=String(color.value||'#000000').toUpperCase()});hex.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();hex.blur()}});
 apply(color.value||hex.value||'#000000');
 return{setValue:apply,get value(){return color.value.toUpperCase()},destroy(){color.removeEventListener('input',fromColor)}}
}
