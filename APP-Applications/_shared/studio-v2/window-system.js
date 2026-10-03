const KEY='nlab-studio-v2-windows';
let z=180;

function load(){try{return{windows:{},...JSON.parse(localStorage.getItem(KEY)||'{}')}}catch{return{windows:{}}}}
let prefs=load();
function save(){localStorage.setItem(KEY,JSON.stringify(prefs))}
function cfg(key){return prefs.windows[key]=prefs.windows[key]||{locked:false,docked:false,collapsed:false,scrollbars:true,left:null,top:null,width:null,height:null}}
function svg(name){
 const p={
  grip:'<circle cx="8" cy="6" r="1"/><circle cx="16" cy="6" r="1"/><circle cx="8" cy="12" r="1"/><circle cx="16" cy="12" r="1"/><circle cx="8" cy="18" r="1"/><circle cx="16" cy="18" r="1"/>',
  collapse:'<path d="M5 12h14"/>',expand:'<path d="M5 12h14M12 5v14"/>',
  lock:'<rect x="5" y="10" width="14" height="10" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/>',
  unlock:'<rect x="5" y="10" width="14" height="10" rx="2"/><path d="M8 10V7a4 4 0 0 1 7-2.6"/>',
  dock:'<path d="M4 5h16v5H4zM4 14h16v5H4z"/>',
  free:'<rect x="5" y="5" width="14" height="14" rx="2"/><path d="M9 5v14"/>',
  scroll:'<path d="M8 5h8M8 9h8M8 13h8M8 17h8M5 5h.01M5 9h.01M5 13h.01M5 17h.01"/>',
  close:'<path d="m6 6 12 12M18 6 6 18"/>'
 }[name]||'';
 return '<svg viewBox="0 0 24 24" aria-hidden="true">'+p+'</svg>';
}
function topOffset(){const h=document.querySelector('.studioHeader');return (h?Math.ceil(h.getBoundingClientRect().height):48)+8}
function sync(panel,key){
 const c=cfg(key);
 panel.classList.add('studioWindow');
 panel.classList.toggle('studioWindowLocked',!!c.locked);
 panel.classList.toggle('studioWindowDocked',!!c.docked);
 panel.classList.toggle('studioWindowCollapsed',!!c.collapsed);
 panel.style.overflow=c.scrollbars===false?'hidden':'auto';
 if(!c.docked){
  if(c.left)panel.style.left=c.left;if(c.top)panel.style.top=c.top;if(c.width)panel.style.width=c.width;if(c.height)panel.style.height=c.height;
  panel.style.right='auto';panel.style.transform='none';
 }
 const lock=panel.querySelector('[data-win-lock]'),dock=panel.querySelector('[data-win-dock]'),collapse=panel.querySelector('[data-win-collapse]'),scroll=panel.querySelector('[data-win-scroll]');
 if(lock){lock.innerHTML=svg(c.locked?'lock':'unlock');lock.classList.toggle('active',!!c.locked)}
 if(dock){dock.innerHTML=svg(c.docked?'free':'dock');dock.classList.toggle('active',!!c.docked)}
 if(collapse){collapse.innerHTML=svg(c.collapsed?'expand':'collapse');collapse.classList.toggle('active',!!c.collapsed)}
 if(scroll)scroll.classList.toggle('active',c.scrollbars!==false);
}
function addBar(panel,key,title){
 if(panel.querySelector(':scope > .studioWindowBar'))return;
 const bar=document.createElement('div');bar.className='studioWindowBar';
 bar.innerHTML='<span class="studioWindowGrip" data-win-grip title="Déplacer">'+svg('grip')+'</span><strong>'+String(title||key)+'</strong><span class="grow"></span><button data-win-collapse title="Réduire / restaurer" aria-label="Réduire ou restaurer"></button><button data-win-lock title="Verrouiller / déverrouiller" aria-label="Verrouiller ou déverrouiller"></button><button data-win-dock title="Ancrer / libérer" aria-label="Ancrer ou libérer"></button><button data-win-scroll title="Activer / désactiver le défilement" aria-label="Défilement">'+svg('scroll')+'</button><button data-win-close title="Fermer" aria-label="Fermer">'+svg('close')+'</button>';
 panel.insertBefore(bar,panel.firstChild);
}
function constrain(panel){
 const r=panel.getBoundingClientRect(),pad=6,maxW=Math.max(220,innerWidth-pad*2),maxH=Math.max(120,innerHeight-pad*2);
 if(r.width>maxW)panel.style.width=maxW+'px';if(r.height>maxH)panel.style.height=maxH+'px';
 const rr=panel.getBoundingClientRect();if(rr.left<pad)panel.style.left=pad+'px';if(rr.top<pad)panel.style.top=pad+'px';
 if(rr.right>innerWidth-pad)panel.style.left=Math.max(pad,innerWidth-pad-rr.width)+'px';
 if(rr.bottom>innerHeight-pad)panel.style.top=Math.max(pad,innerHeight-pad-rr.height)+'px';
}
function bind(panel,key,title){
 addBar(panel,key,title); if(panel.dataset.studioWinBound)return panel;
 panel.dataset.studioWinBound='1';const c=cfg(key);let drag=null;const grip=panel.querySelector('[data-win-grip]');
 grip?.addEventListener('pointerdown',e=>{if(c.locked||c.docked)return;e.preventDefault();const r=panel.getBoundingClientRect();drag={dx:e.clientX-r.left,dy:e.clientY-r.top};grip.setPointerCapture?.(e.pointerId);panel.style.zIndex=String(++z);document.body.classList.add('studioWindowDragging')});
 grip?.addEventListener('pointermove',e=>{if(!drag)return;const vw=innerWidth,vh=innerHeight;panel.style.left=Math.max(4,Math.min(vw-panel.offsetWidth-4,e.clientX-drag.dx))+'px';panel.style.top=Math.max(topOffset(),Math.min(vh-40,e.clientY-drag.dy))+'px';panel.style.right='auto';panel.style.transform='none'});
 const finish=()=>{if(!drag)return;drag=null;c.left=panel.style.left;c.top=panel.style.top;c.width=panel.offsetWidth+'px';c.height=panel.offsetHeight+'px';save();document.body.classList.remove('studioWindowDragging')};
 grip?.addEventListener('pointerup',finish);grip?.addEventListener('pointercancel',finish);
 panel.querySelector('[data-win-collapse]')?.addEventListener('click',()=>{c.collapsed=!c.collapsed;save();sync(panel,key)});
 panel.querySelector('[data-win-lock]')?.addEventListener('click',()=>{c.locked=!c.locked;save();sync(panel,key)});
 panel.querySelector('[data-win-dock]')?.addEventListener('click',()=>{c.docked=!c.docked;save();sync(panel,key);panel.dispatchEvent(new CustomEvent('studio-window-dock',{detail:{key,docked:c.docked}}))});
 panel.querySelector('[data-win-scroll]')?.addEventListener('click',()=>{c.scrollbars=c.scrollbars===false;save();sync(panel,key)});
 panel.querySelector('[data-win-close]')?.addEventListener('click',()=>{panel.hidden=true;panel.dispatchEvent(new CustomEvent('studio-window-close',{detail:{key}}))});
 panel.addEventListener('pointerup',()=>{if(!c.locked&&!c.collapsed&&!c.docked){c.width=panel.offsetWidth+'px';c.height=panel.offsetHeight+'px';save()}});
 sync(panel,key);constrain(panel);window.addEventListener('resize',()=>constrain(panel),{passive:true});return panel;
}
export function enhanceStudioWindow(panel,{key,title}={}){
 const el=typeof panel==='string'?document.querySelector(panel):panel;if(!el)return null;
 return bind(el,key||el.id||'window',title||el.dataset.windowTitle||el.querySelector('h1,h2,h3,strong')?.textContent?.trim()||'Fenêtre');
}
export function resetStudioWindows(){localStorage.removeItem(KEY);prefs=load()}
