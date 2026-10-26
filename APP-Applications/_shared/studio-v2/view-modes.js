import {icon} from './icon-registry.js';
export const STUDIO_VIEW_MODES=Object.freeze([
 {id:'list',label:'Liste',icon:'list'},
 {id:'icons',label:'Icônes',icon:'grid'},
 {id:'thumbs',label:'Vignettes',icon:'image'},
 {id:'table',label:'Tableau',icon:'table'}
]);
export function mountStudioViewModes({host,value='list',onChange}={}){
 if(!host)throw new TypeError('View host required');
 host.classList.add('studioViewModes');
 host.setAttribute('role','group');
 host.setAttribute('aria-label','Vues disponibles');
 host.replaceChildren();
 for(const mode of STUDIO_VIEW_MODES){
  const button=document.createElement('button');
  button.type='button';button.dataset.studioView=mode.id;
  button.setAttribute('aria-label','Vue '+mode.label);
  button.title='Afficher les fichiers : '+mode.label;
  const graphic=document.createElement('span');graphic.className='studioViewIcon';
  graphic.setAttribute('aria-hidden','true');graphic.innerHTML=icon(mode.icon);
  const text=document.createElement('span');text.textContent=mode.label;
  button.append(graphic,text);
  button.addEventListener('click',()=>{setValue(mode.id);onChange?.(mode.id)});
  host.append(button);
 }
 let current;
 function setValue(mode){current=STUDIO_VIEW_MODES.some(x=>x.id===mode)?mode:'list';
  host.querySelectorAll('[data-studio-view]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.studioView===current)));}
 setValue(value);return{setValue,get value(){return current}};
}
