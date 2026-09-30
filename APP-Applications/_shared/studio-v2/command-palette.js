import{findCapabilities}from'./capability-registry.js';
import{icon}from'./icon-registry.js';
import{enhanceStudioWindow}from'./window-system.js';
const esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
export function mountCommandPalette(){
  if(document.querySelector('#studioCommandPalette'))return;
  const p=document.createElement('div');p.id='studioCommandPalette';p.className='studioWindow commandPaletteWindow';p.hidden=true;
  p.innerHTML='<div class="commandPaletteBox"><div class="commandPaletteHead">'+icon('command')+'<input id="command-palette-search" type="search" placeholder="Rechercher une commande…"><button id="command-palette-close" type="button">×</button></div><div id="command-palette-list" class="commandPaletteList"></div></div>';
  document.body.append(p);enhanceStudioWindow(p,{key:'command-palette',title:'Commandes'});
  const input=p.querySelector('#command-palette-search'),list=p.querySelector('#command-palette-list');
  const render=()=>{const items=findCapabilities(input.value).slice(0,80);list.innerHTML=items.map(x=>'<button type="button" data-command-action="'+esc(x.action)+'"><span>'+icon(x.icon||'command')+'</span><span><strong>'+esc(x.label)+'</strong><small>'+esc(x.id)+' · '+esc(x.status)+'</small></span></button>').join('')||'<div class="commandEmpty">Aucune commande.</div>'};
  const open=()=>{p.hidden=false;input.value='';render();setTimeout(()=>input.focus(),0)};
  const close=()=>{p.hidden=true};
  input.addEventListener('input',render);p.querySelector('#command-palette-close').onclick=close;
  list.addEventListener('click',e=>{const b=e.target.closest('[data-command-action]');if(!b)return;document.dispatchEvent(new CustomEvent('studio-v2:action',{detail:{action:b.dataset.commandAction,source:'command-palette'}}));close()});
  document.addEventListener('keydown',e=>{if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'){e.preventDefault();p.hidden?open():close()}else if(e.key==='Escape'&&!p.hidden)close()});
  document.addEventListener('studio-v2:open-command-palette',open);
}
