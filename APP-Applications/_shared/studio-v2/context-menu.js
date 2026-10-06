import{findCommands,executeCommand}from'./command-registry.js';
import{getStudioContext}from'./context-selection.js';
import{icon}from'./icon-registry.js';
const esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));

function ensure(){
  let menu=document.querySelector('#studioContextMenu');if(menu)return menu;
  menu=document.createElement('div');menu.id='studioContextMenu';menu.className='studioContextMenu';menu.hidden=true;menu.setAttribute('role','menu');document.body.append(menu);
  menu.addEventListener('click',async e=>{const b=e.target.closest('[data-command-id]');if(!b||b.disabled)return;await executeCommand(b.dataset.commandId,{source:'context-menu'});hide()});
  return menu
}
function hide(){const m=ensure();m.hidden=true}
function show(x,y){
  const m=ensure(),ctx=getStudioContext(),items=findCommands('',ctx,{includeDisabled:false}).filter(c=>c.quickAction!==false).slice(0,18);
  m.innerHTML=items.map(c=>'<button type="button" role="menuitem" data-command-id="'+esc(c.id)+'"><span>'+icon(c.icon||'command')+'</span><span><strong>'+esc(c.shortLabel||c.label)+'</strong>'+(c.shortcut?'<kbd>'+esc(c.shortcut)+'</kbd>':'')+'</span></button>').join('')||'<div class="contextMenuEmpty">Aucune action disponible</div>';
  m.hidden=false;m.style.left=Math.min(x,window.innerWidth-m.offsetWidth-8)+'px';m.style.top=Math.min(y,window.innerHeight-m.offsetHeight-8)+'px'
}
export function mountContextMenu(root=document){
  ensure();
  root.addEventListener('contextmenu',e=>{
    const target=e.target.closest('[data-context-menu],[data-input-item],.pageTile,.previewTile,[data-selection-item]');
    if(!target)return;
    e.preventDefault();show(e.clientX,e.clientY)
  });
  document.addEventListener('click',e=>{if(!e.target.closest('#studioContextMenu'))hide()});
  document.addEventListener('keydown',e=>{if(e.key==='Escape')hide()});
  window.addEventListener('blur',hide);
}
export const StudioContextMenu=Object.freeze({mount:mountContextMenu,show,hide});
if(typeof window!=='undefined')window.NLABStudioContextMenu=StudioContextMenu;
