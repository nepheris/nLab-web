const KEY='nlab-studio-v2-windows';
let z=220;
const live=new Map();

function load(){try{return{windows:{},...JSON.parse(localStorage.getItem(KEY)||'{}')}}catch{return{windows:{}}}}
let prefs=load();
function save(){localStorage.setItem(KEY,JSON.stringify(prefs))}
function cfg(key){return prefs.windows[key]=prefs.windows[key]||{locked:false,docked:false,collapsed:false,scrollX:true,scrollY:true,size:'normal',hidden:false,left:null,top:null,width:null,height:null}}
function svg(name){
 const p={
  grip:'<circle cx="8" cy="6" r="1"/><circle cx="16" cy="6" r="1"/><circle cx="8" cy="12" r="1"/><circle cx="16" cy="12" r="1"/><circle cx="8" cy="18" r="1"/><circle cx="16" cy="18" r="1"/>',
  collapse:'<path d="M5 12h14"/>',expand:'<path d="M5 12h14M12 5v14"/>',
  lock:'<rect x="5" y="10" width="14" height="10" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/>',
  unlock:'<rect x="5" y="10" width="14" height="10" rx="2"/><path d="M8 10V7a4 4 0 0 1 7-2.6"/>',
  dock:'<path d="M4 5h16v5H4zM4 14h16v5H4z"/>',
  free:'<rect x="5" y="5" width="14" height="14" rx="2"/><path d="M9 5v14"/>',
  scrollX:'<path d="M4 12h16M4 12l4-4M4 12l4 4M20 12l-4-4M20 12l-4 4"/>',
  scrollY:'<path d="M12 4v16M12 4l-4 4M12 4l4 4M12 20l-4-4M12 20l4-4"/>',
  size:'<path d="M5 9V5h4M19 15v4h-4M9 5 5 9M15 19l4-4"/>',
  close:'<path d="m6 6 12 12M18 6 6 18"/>'
 }[name]||'';
 return '<svg viewBox="0 0 24 24" aria-hidden="true">'+p+'</svg>';
}
function topOffset(){const h=document.querySelector('.studioHeader');return (h?Math.ceil(h.getBoundingClientRect().height):48)+8}
function bringToFront(panel){panel.style.zIndex=String(++z);return z}
function ensureRestoreTray(){
 let tray=document.querySelector('#studioWindowRestoreTray');
 if(tray)return tray;
 tray=document.createElement('aside');tray.id='studioWindowRestoreTray';tray.className='studioWindowRestoreTray';tray.setAttribute('aria-label','Fenêtres masquées');tray.hidden=true;
 tray.innerHTML='<div class="studioWindowRestoreHead"><strong>Fenêtres masquées</strong><button type="button" data-win-restore-all title="Tout restaurer">Tout restaurer</button></div><div data-win-restore-list></div>';
 document.body.append(tray);
 tray.addEventListener('click',e=>{
  const one=e.target.closest('[data-win-restore]');if(one){restoreStudioWindow(one.dataset.winRestore);return}
  if(e.target.closest('[data-win-restore-all]'))restoreAllStudioWindows();
 });
 return tray
}
function refreshRestoreTray(){
 const tray=ensureRestoreTray(),list=tray.querySelector('[data-win-restore-list]'),hidden=[...live.entries()].filter(([k])=>cfg(k).hidden);
 tray.hidden=!hidden.length;
 list.innerHTML=hidden.map(([k,v])=>'<button type="button" data-win-restore="'+k+'" title="Restaurer '+String(v.title||k).replace(/"/g,'&quot;')+'">'+String(v.title||k)+'</button>').join('');
}
function sync(panel,key){
 const c=cfg(key);
 panel.classList.add('studioWindow');
 panel.classList.toggle('studioWindowLocked',!!c.locked);
 panel.classList.toggle('studioWindowDocked',!!c.docked);
 panel.classList.toggle('studioWindowCollapsed',!!c.collapsed);
 panel.classList.toggle('studioWindowLarge',c.size==='large');
 panel.hidden=!!c.hidden;
 panel.style.overflowX=c.scrollX===false?'hidden':'auto';
 panel.style.overflowY=c.scrollY===false?'hidden':'auto';
 if(!c.docked){
  if(c.left)panel.style.left=c.left;if(c.top)panel.style.top=c.top;if(c.width)panel.style.width=c.width;if(c.height)panel.style.height=c.height;
  panel.style.right='auto';panel.style.transform='none';
 }
 const lock=panel.querySelector('[data-win-lock]'),dock=panel.querySelector('[data-win-dock]'),collapse=panel.querySelector('[data-win-collapse]'),sx=panel.querySelector('[data-win-scroll-x]'),sy=panel.querySelector('[data-win-scroll-y]'),size=panel.querySelector('[data-win-size]');
 if(lock){lock.innerHTML=svg(c.locked?'lock':'unlock');lock.classList.toggle('active',!!c.locked);lock.classList.toggle('locked',!!c.locked);lock.title=c.locked?'Déverrouiller la fenêtre':'Verrouiller la fenêtre'}
 if(dock){dock.innerHTML=svg(c.docked?'free':'dock');dock.classList.toggle('active',!!c.docked);dock.title=c.docked?'Détacher la fenêtre':'Rattacher / ancrer la fenêtre'}
 if(collapse){collapse.innerHTML=svg(c.collapsed?'expand':'collapse');collapse.classList.toggle('active',!!c.collapsed);collapse.title=c.collapsed?'Tout déplier':'Tout plier'}
 if(sx){sx.classList.toggle('active',c.scrollX!==false);sx.title=(c.scrollX===false?'Activer':'Désactiver')+' le défilement horizontal'}
 if(sy){sy.classList.toggle('active',c.scrollY!==false);sy.title=(c.scrollY===false?'Activer':'Désactiver')+' le défilement vertical'}
 if(size){size.classList.toggle('active',c.size==='large');size.title=c.size==='large'?'Taille normale':'Agrandir la fenêtre'}
 refreshRestoreTray()
}
function addBar(panel,key,title){
 if(panel.querySelector(':scope > .studioWindowBar'))return;
 const bar=document.createElement('div');bar.className='studioWindowBar';
 bar.innerHTML='<span class="studioWindowGrip" data-win-grip title="Déplacer la fenêtre">'+svg('grip')+'</span><strong>'+String(title||key)+'</strong><span class="grow"></span>'+
 '<button type="button" data-win-collapse title="Tout plier" aria-label="Plier ou déplier"></button>'+
 '<button type="button" data-win-size title="Agrandir la fenêtre" aria-label="Taille normale ou large">'+svg('size')+'</button>'+
 '<button type="button" data-win-lock title="Verrouiller la fenêtre" aria-label="Verrouiller ou déverrouiller"></button>'+
 '<button type="button" data-win-dock title="Rattacher / ancrer" aria-label="Détacher ou rattacher"></button>'+
 '<button type="button" data-win-scroll-x title="Défilement horizontal" aria-label="Défilement horizontal">'+svg('scrollX')+'</button>'+
 '<button type="button" data-win-scroll-y title="Défilement vertical" aria-label="Défilement vertical">'+svg('scrollY')+'</button>'+
 '<button type="button" data-win-close title="Masquer la fenêtre" aria-label="Masquer">'+svg('close')+'</button>';
 panel.insertBefore(bar,panel.firstChild);
}
function constrain(panel){
 if(panel.hidden)return;
 const r=panel.getBoundingClientRect(),pad=6,maxW=Math.max(220,innerWidth-pad*2),maxH=Math.max(120,innerHeight-pad*2);
 if(r.width>maxW)panel.style.width=maxW+'px';if(r.height>maxH)panel.style.height=maxH+'px';
 const rr=panel.getBoundingClientRect();if(rr.left<pad)panel.style.left=pad+'px';if(rr.top<pad)panel.style.top=Math.max(pad,topOffset())+'px';
 if(rr.right>innerWidth-pad)panel.style.left=Math.max(pad,innerWidth-pad-rr.width)+'px';
 if(rr.bottom>innerHeight-pad)panel.style.top=Math.max(pad,innerHeight-pad-rr.height)+'px';
}
function hide(panel,key){
 const c=cfg(key);c.hidden=true;save();sync(panel,key);panel.dispatchEvent(new CustomEvent('studio-window-close',{detail:{key}}));
}
function bind(panel,key,title){
 const existed=Object.prototype.hasOwnProperty.call(prefs.windows,key),initiallyHidden=panel.hidden;
 addBar(panel,key,title);live.set(key,{panel,title});if(panel.dataset.studioWinBound){sync(panel,key);return panel}
 panel.dataset.studioWinBound='1';const c=cfg(key);if(!existed&&initiallyHidden){c.hidden=true;save()}let drag=null;const grip=panel.querySelector('[data-win-grip]');
 panel.addEventListener('pointerdown',()=>bringToFront(panel),{capture:true});
 grip?.addEventListener('pointerdown',e=>{if(c.locked||c.docked)return;e.preventDefault();bringToFront(panel);const r=panel.getBoundingClientRect();drag={dx:e.clientX-r.left,dy:e.clientY-r.top};grip.setPointerCapture?.(e.pointerId);document.body.classList.add('studioWindowDragging')});
 grip?.addEventListener('pointermove',e=>{if(!drag)return;const vw=innerWidth,vh=innerHeight;panel.style.left=Math.max(4,Math.min(vw-panel.offsetWidth-4,e.clientX-drag.dx))+'px';panel.style.top=Math.max(topOffset(),Math.min(vh-40,e.clientY-drag.dy))+'px';panel.style.right='auto';panel.style.transform='none'});
 const finish=()=>{if(!drag)return;drag=null;c.left=panel.style.left;c.top=panel.style.top;c.width=panel.offsetWidth+'px';c.height=panel.offsetHeight+'px';save();document.body.classList.remove('studioWindowDragging')};
 grip?.addEventListener('pointerup',finish);grip?.addEventListener('pointercancel',finish);
 panel.querySelector('[data-win-collapse]')?.addEventListener('click',()=>{c.collapsed=!c.collapsed;save();sync(panel,key)});
 panel.querySelector('[data-win-lock]')?.addEventListener('click',()=>{c.locked=!c.locked;save();sync(panel,key)});
 panel.querySelector('[data-win-dock]')?.addEventListener('click',()=>{c.docked=!c.docked;c.hidden=false;save();sync(panel,key);panel.dispatchEvent(new CustomEvent('studio-window-dock',{detail:{key,docked:c.docked}}))});
 panel.querySelector('[data-win-size]')?.addEventListener('click',()=>{c.size=c.size==='large'?'normal':'large';if(c.size==='large'){c.width='min(920px,calc(100vw - 24px))';c.height='min(78vh,760px)'}else{c.width=null;c.height=null}save();sync(panel,key);constrain(panel)});
 panel.querySelector('[data-win-scroll-x]')?.addEventListener('click',()=>{c.scrollX=c.scrollX===false;save();sync(panel,key)});
 panel.querySelector('[data-win-scroll-y]')?.addEventListener('click',()=>{c.scrollY=c.scrollY===false;save();sync(panel,key)});
 panel.querySelector('[data-win-close]')?.addEventListener('click',()=>hide(panel,key));
 panel.addEventListener('pointerup',()=>{if(!c.locked&&!c.collapsed&&!c.docked&&!panel.hidden){c.width=panel.offsetWidth+'px';c.height=panel.offsetHeight+'px';save()}});
 sync(panel,key);constrain(panel);window.addEventListener('resize',()=>constrain(panel),{passive:true});return panel;
}
export function enhanceStudioWindow(panel,{key,title}={}){
 const el=typeof panel==='string'?document.querySelector(panel):panel;if(!el)return null;
 return bind(el,key||el.id||'window',title||el.dataset.windowTitle||el.querySelector('h1,h2,h3,strong')?.textContent?.trim()||'Fenêtre');
}
export function showStudioWindow(key){const item=live.get(key);if(!item)return false;const c=cfg(key);c.hidden=false;save();sync(item.panel,key);bringToFront(item.panel);constrain(item.panel);return true}
export function restoreStudioWindow(key){return showStudioWindow(key)}
export function restoreAllStudioWindows(){for(const [key,item] of live){const c=cfg(key);if(c.hidden){c.hidden=false;sync(item.panel,key)}}save();refreshRestoreTray()}
export function hideStudioWindow(key){const item=live.get(key);if(!item)return false;hide(item.panel,key);return true}
export function bringStudioWindowToFront(panelOrKey){const panel=typeof panelOrKey==='string'?live.get(panelOrKey)?.panel:panelOrKey;if(!panel)return false;bringToFront(panel);return true}
export function resetStudioWindows(){localStorage.removeItem(KEY);prefs=load();for(const [key,item] of live){sync(item.panel,key)}refreshRestoreTray()}
