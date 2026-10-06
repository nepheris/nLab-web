import{findCommands,executeCommand}from'./command-registry.js';
import{icon}from'./icon-registry.js';
import{enhanceStudioWindow}from'./window-system.js';
const esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
export function mountCommandPalette(){
  if(document.querySelector('#studioCommandPalette'))return;
  const p=document.createElement('div');p.id='studioCommandPalette';p.className='studioWindow commandPaletteWindow';p.hidden=true;
  p.innerHTML='<div class="commandPaletteBox"><div class="commandPaletteHead">'+icon('command')+'<input id="command-palette-search" type="search" placeholder="Rechercher une commande, un outil ou une fonction…"><button id="command-palette-close" type="button">×</button></div><div id="command-palette-list" class="commandPaletteList"></div></div>';
  document.body.append(p);enhanceStudioWindow(p,{key:'command-palette',title:'Commandes'});
  const input=p.querySelector('#command-palette-search'),list=p.querySelector('#command-palette-list');
  const render=()=>{
    const items=findCommands(input.value).slice(0,100);
    list.innerHTML=items.map(x=>'<button type="button" data-command-id="'+esc(x.id)+'" '+(x.available?'':'disabled')+' title="'+esc(x.available?'Exécuter '+x.label:'Commande indisponible dans le contexte actuel')+'"><span>'+icon(x.icon||'command')+'</span><span><strong>'+esc(x.label)+(x.shortcut?' <kbd>'+esc(x.shortcut)+'</kbd>':'')+'</strong><small>'+esc(x.group||x.scope)+' · '+esc(x.id)+' · '+esc(x.status)+(x.available?'':' · indisponible')+'</small></span></button>').join('')||'<div class="commandEmpty">Aucune commande.</div>'
  };
  const open=()=>{p.hidden=false;input.value='';render();setTimeout(()=>input.focus(),0)};
  const close=()=>{p.hidden=true};
  input.addEventListener('input',render);p.querySelector('#command-palette-close').onclick=close;
  list.addEventListener('click',async e=>{const b=e.target.closest('[data-command-id]');if(!b||b.disabled)return;await executeCommand(b.dataset.commandId,{source:'command-palette'});close()});
  document.addEventListener('keydown',e=>{if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'){e.preventDefault();p.hidden?open():close()}else if(e.key==='Escape'&&!p.hidden)close()});
  document.addEventListener('studio-v2:open-command-palette',open);
  document.addEventListener('studio-v2:context-changed',()=>{if(!p.hidden)render()});
  document.addEventListener('studio-v2:undo-redo-changed',()=>{if(!p.hidden)render()});
  document.addEventListener('studio-v2:action',e=>{if(e.detail?.action==='core.commands')open()});
}
