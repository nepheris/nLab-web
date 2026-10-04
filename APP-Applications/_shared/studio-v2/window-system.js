const KEY='nlab-studio-v2-windows';
let z=220;
let topZ=100000;
const live=new Map();
let keyboardBound=false;

function load(){try{return{windows:{},...JSON.parse(localStorage.getItem(KEY)||'{}')}}catch{return{windows:{}}}}
let prefs=load();
function save(){localStorage.setItem(KEY,JSON.stringify(prefs))}
function emit(panel,key,action,extra={}){const detail={key,action,...extra};panel?.dispatchEvent(new CustomEvent('studio-window-state',{detail}));document.dispatchEvent(new CustomEvent('studio-v2:window-state',{detail}))}
function cfg(key){return prefs.windows[key]=prefs.windows[key]||{locked:false,docked:false,collapsed:false,scrollX:true,scrollY:true,size:'normal',hidden:false,restorable:false,left:null,top:null,width:null,height:null}}
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
function bringToFront(panel){
 const topmost=panel?.dataset?.studioWindowTopmost==='1';
 const next=topmost?++topZ:++z;
 panel.style.zIndex=String(next);
 return next
}
function ensureRestoreTray(){
 let tray=document.querySelector('#studioWindowRestoreTray');
 if(tray)return tray;
 tray=document.createElement('aside');tray.id='studioWindowRestoreTray';tray.className='studioWindowRestoreTray';tray.setAttribute('aria-label','Fenêtres masquées');tray.hidden=true;
 tray.innerHTML='<button type="button" class="studioWindowRestoreToggle" data-win-restore-toggle title="Fenêtres masquées" aria-expanded="false"><span aria-hidden="true">▣</span><b data-win-restore-count>0</b></button><div class="studioWindowRestorePanel" data-win-restore-panel hidden><div class="studioWindowRestoreHead"><strong>Fenêtres masquées</strong><button type="button" data-win-restore-all title="Tout restaurer">Tout restaurer</button></div><div data-win-restore-list></div></div>';
 document.body.append(tray);
 tray.addEventListener('click',e=>{
  const toggle=e.target.closest('[data-win-restore-toggle]');if(toggle){const open=!tray.classList.contains('open');tray.classList.toggle('open',open);toggle.setAttribute('aria-expanded',open?'true':'false');tray.querySelector('[data-win-restore-panel]').hidden=!open;return}
  const one=e.target.closest('[data-win-restore]');if(one){restoreStudioWindow(one.dataset.winRestore);tray.classList.remove('open');tray.querySelector('[data-win-restore-panel]').hidden=true;tray.querySelector('[data-win-restore-toggle]')?.setAttribute('aria-expanded','false');return}
  if(e.target.closest('[data-win-restore-all]')){restoreAllStudioWindows();tray.classList.remove('open')}
 });
 document.addEventListener('pointerdown',e=>{if(!tray.classList.contains('open')||tray.contains(e.target))return;tray.classList.remove('open');tray.querySelector('[data-win-restore-panel]').hidden=true;tray.querySelector('[data-win-restore-toggle]')?.setAttribute('aria-expanded','false')});
 return tray
}
function refreshRestoreTray(){
 const tray=ensureRestoreTray(),list=tray.querySelector('[data-win-restore-list]'),hidden=[...live.entries()].filter(([k])=>{const c=cfg(k);return c.hidden&&c.restorable});
 tray.hidden=!hidden.length;
 tray.querySelector('[data-win-restore-count]').textContent=String(hidden.length);
 list.innerHTML=hidden.map(([k,v])=>'<button type="button" data-win-restore="'+k+'" title="Restaurer '+String(v.title||k).replace(/"/g,'&quot;')+'">'+String(v.title||k)+'</button>').join('');
 if(!hidden.length){tray.classList.remove('open');tray.querySelector('[data-win-restore-panel]').hidden=true;tray.querySelector('[data-win-restore-toggle]')?.setAttribute('aria-expanded','false')}
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
 const item=live.get(key),c=cfg(key);c.hidden=true;c.restorable=item?.restorable!==false;save();sync(panel,key);emit(panel,key,'hide');panel.dispatchEvent(new CustomEvent('studio-window-close',{detail:{key}}));
}
function bind(panel,key,title,{topmost=false,restorable=true,escapeCloses=true,capabilities={}}={}){
 const existed=Object.prototype.hasOwnProperty.call(prefs.windows,key),initiallyHidden=panel.hidden;
 addBar(panel,key,title);panel.dataset.studioWindowTopmost=topmost?'1':'0';panel.dataset.studioWindowKey=key;panel.setAttribute('role',panel.getAttribute('role')||'dialog');panel.setAttribute('aria-label',panel.getAttribute('aria-label')||title||key);panel.tabIndex=panel.tabIndex>=0?panel.tabIndex:-1;live.set(key,{panel,title,topmost:!!topmost,restorable:restorable!==false,escapeCloses:escapeCloses!==false,capabilities});if(panel.dataset.studioWinBound){sync(panel,key);return panel}
 panel.dataset.studioWinBound='1';const c=cfg(key);if(!existed&&initiallyHidden){c.hidden=true;c.restorable=false;save()}let drag=null;const grip=panel.querySelector('[data-win-grip]');
 panel.addEventListener('pointerdown',()=>{bringToFront(panel);emit(panel,key,'focus')},{capture:true});
 grip?.addEventListener('pointerdown',e=>{if(capabilities.move===false||c.locked||c.docked)return;e.preventDefault();bringToFront(panel);const r=panel.getBoundingClientRect();drag={dx:e.clientX-r.left,dy:e.clientY-r.top};grip.setPointerCapture?.(e.pointerId);document.body.classList.add('studioWindowDragging')});
 grip?.addEventListener('pointermove',e=>{if(!drag)return;const vw=innerWidth,vh=innerHeight;panel.style.left=Math.max(4,Math.min(vw-panel.offsetWidth-4,e.clientX-drag.dx))+'px';panel.style.top=Math.max(topOffset(),Math.min(vh-40,e.clientY-drag.dy))+'px';panel.style.right='auto';panel.style.transform='none'});
 const finish=()=>{if(!drag)return;drag=null;c.left=panel.style.left;c.top=panel.style.top;c.width=panel.offsetWidth+'px';c.height=panel.offsetHeight+'px';save();document.body.classList.remove('studioWindowDragging');emit(panel,key,'move',{left:c.left,top:c.top,width:c.width,height:c.height})};
 grip?.addEventListener('pointerup',finish);grip?.addEventListener('pointercancel',finish);
 panel.querySelector('[data-win-collapse]')?.addEventListener('click',()=>{if(capabilities.collapse===false)return;c.collapsed=!c.collapsed;save();sync(panel,key);emit(panel,key,'collapse',{collapsed:c.collapsed})});
 panel.querySelector('[data-win-lock]')?.addEventListener('click',()=>{if(capabilities.lock===false)return;c.locked=!c.locked;save();sync(panel,key);emit(panel,key,'lock',{locked:c.locked})});
 panel.querySelector('[data-win-dock]')?.addEventListener('click',()=>{if(capabilities.dock===false)return;c.docked=!c.docked;c.hidden=false;save();sync(panel,key);emit(panel,key,'dock',{docked:c.docked});panel.dispatchEvent(new CustomEvent('studio-window-dock',{detail:{key,docked:c.docked}}))});
 panel.querySelector('[data-win-size]')?.addEventListener('click',()=>{if(capabilities.resize===false)return;c.size=c.size==='large'?'normal':'large';if(c.size==='large'){c.width='min(920px,calc(100vw - 24px))';c.height='min(78vh,760px)'}else{c.width=null;c.height=null}save();sync(panel,key);constrain(panel);emit(panel,key,'resize',{size:c.size,width:c.width,height:c.height})});
 panel.querySelector('[data-win-scroll-x]')?.addEventListener('click',()=>{if(capabilities.scrollX===false)return;c.scrollX=c.scrollX===false;save();sync(panel,key);emit(panel,key,'scroll-x',{enabled:c.scrollX!==false})});
 panel.querySelector('[data-win-scroll-y]')?.addEventListener('click',()=>{if(capabilities.scrollY===false)return;c.scrollY=c.scrollY===false;save();sync(panel,key);emit(panel,key,'scroll-y',{enabled:c.scrollY!==false})});
 panel.querySelector('[data-win-close]')?.addEventListener('click',()=>{if(capabilities.hide===false)return;hide(panel,key)});
 panel.addEventListener('pointerup',()=>{if(!c.locked&&!c.collapsed&&!c.docked&&!panel.hidden){c.width=panel.offsetWidth+'px';c.height=panel.offsetHeight+'px';save()}});
 for(const [name,allowed] of Object.entries({collapse:capabilities.collapse,lock:capabilities.lock,dock:capabilities.dock,size:capabilities.resize,'scroll-x':capabilities.scrollX,'scroll-y':capabilities.scrollY,close:capabilities.hide})){if(allowed===false){const b=panel.querySelector('[data-win-'+name+']');if(b){b.disabled=true;b.hidden=true}}}
 if(!keyboardBound){keyboardBound=true;document.addEventListener('keydown',e=>{if(e.key!=='Escape'||e.defaultPrevented)return;const visible=[...live.entries()].filter(([,v])=>!v.panel.hidden&&v.escapeCloses!==false).sort((a,b)=>(Number(getComputedStyle(b[1].panel).zIndex)||0)-(Number(getComputedStyle(a[1].panel).zIndex)||0));if(!visible.length)return;const [topKey,topItem]=visible[0];hide(topItem.panel,topKey);e.preventDefault()})}
 sync(panel,key);constrain(panel);window.addEventListener('resize',()=>constrain(panel),{passive:true});return panel;
}
export function enhanceStudioWindow(panel,{key,title,topmost=false,restorable=true,escapeCloses=true,capabilities={}}={}){
 const el=typeof panel==='string'?document.querySelector(panel):panel;if(!el)return null;
 return bind(el,key||el.id||'window',title||el.dataset.windowTitle||el.querySelector('h1,h2,h3,strong')?.textContent?.trim()||'Fenêtre',{topmost,restorable,escapeCloses,capabilities});
}
export function showStudioWindow(key){const item=live.get(key);if(!item)return false;const c=cfg(key);c.hidden=false;c.restorable=false;save();sync(item.panel,key);bringToFront(item.panel);constrain(item.panel);item.panel.focus?.({preventScroll:true});emit(item.panel,key,'show');return true}
export function restoreStudioWindow(key){return showStudioWindow(key)}
export function restoreAllStudioWindows(){for(const [key,item] of live){const c=cfg(key);if(c.hidden&&c.restorable){c.hidden=false;c.restorable=false;sync(item.panel,key);emit(item.panel,key,'restore')}}save();refreshRestoreTray()}
export function hideStudioWindow(key){const item=live.get(key);if(!item)return false;hide(item.panel,key);return true}
export function bringStudioWindowToFront(panelOrKey){const key=typeof panelOrKey==='string'?panelOrKey:panelOrKey?.dataset?.studioWindowKey;const panel=typeof panelOrKey==='string'?live.get(panelOrKey)?.panel:panelOrKey;if(!panel)return false;bringToFront(panel);emit(panel,key||panel.id,'focus');return true}
export function getStudioWindowState(key){const item=live.get(key);if(!item)return null;return{key,...cfg(key),title:item.title,topmost:item.topmost,restorable:item.restorable,escapeCloses:item.escapeCloses}}
export function resetStudioWindows(){localStorage.removeItem(KEY);prefs=load();for(const [key,item] of live){sync(item.panel,key)}refreshRestoreTray()}
