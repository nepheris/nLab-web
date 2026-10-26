import {icon} from './icon-registry.js';
import {TemplateEngine} from './template-engine.js';
// Shared native date picker with Core formatting and canonical calendar SVG.
// This wrapper is used by Studios; it does not implement another calendar engine.
export function createStudioDatePicker({label='Date',value='',format='DD/MM/YYYY',onChange}={}){
 const host=document.createElement('div');host.className='nlabDatePicker';
 const name=document.createElement('label');name.className='nlabDateLabel';name.textContent=label;
 const row=document.createElement('div');row.className='nlabDateRow';
 const symbol=document.createElement('span');symbol.className='nlabDateIcon';
 symbol.setAttribute('aria-hidden','true');symbol.innerHTML=icon('calendar');
 const input=document.createElement('input');input.type='date';input.className='nlabDateInput';
 input.setAttribute('aria-label',label);input.value=value;
 const output=document.createElement('output');output.className='nlabDateFormatted';
 const engine=new TemplateEngine();
 const paint=()=>{output.textContent=input.value?engine.formatDate(input.value,format):'Aucune date';
  onChange?.(input.value,output.textContent)};
 input.addEventListener('change',paint);row.append(symbol,input);host.append(name,row,output);paint();
 return{element:host,input,get value(){return input.value},setValue(next){input.value=next||'';paint()},
  destroy(){input.removeEventListener('change',paint)}};
}
