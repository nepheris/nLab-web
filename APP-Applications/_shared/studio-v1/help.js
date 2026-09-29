export class ContextHelp{
 constructor({items={}}={}){this.items={...items};this.modal=null;this.bind()}
 set(key,value){this.items[key]=value;return this}
 bind(root=document){root.querySelectorAll('[data-help-key]').forEach(el=>{if(el.dataset.helpBound)return;el.dataset.helpBound='1';el.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();this.open(el.dataset.helpKey)})})}
 ensureModal(){if(this.modal)return this.modal;const m=document.createElement('div');m.className='modal';m.hidden=true;m.innerHTML='<div class="modalCard helpCard"><div class="helpHead"><h3 id="studioHelpTitle">Aide contextuelle</h3><button type="button" id="studioHelpClose">Fermer</button></div><div id="studioHelpBody" class="helpBody"></div></div>';document.body.appendChild(m);m.querySelector('#studioHelpClose').onclick=()=>m.hidden=true;m.addEventListener('click',e=>{if(e.target===m)m.hidden=true});this.modal=m;return m}
 open(key){const item=this.items[key]||{title:'Aide',body:'Aucune aide documentée pour ce paramètre.'},m=this.ensureModal();m.querySelector('#studioHelpTitle').textContent=item.title||key;const body=m.querySelector('#studioHelpBody');if(Array.isArray(item.body)){body.innerHTML='<ul>'+item.body.map(x=>'<li>'+escapeHtml(x)+'</li>').join('')+'</ul>'}else body.innerHTML=String(item.body||'');m.hidden=false}
}
export function helpButton(key,label='?'){return '<button type="button" class="helpDot" data-help-key="'+String(key).replace(/"/g,'&quot;')+'" aria-label="Aide">'+label+'</button>'}
function escapeHtml(s){return String(s??'').replace(/[&<>"]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[m]))}
