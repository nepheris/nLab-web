/**
 * Canonical docked sidebar controls used by nLab Studios.
 * Reuses settings.js for width/visibility/lock and window-system.js for glyphs.
 * This is a UI adapter, not a second panel/window manager.
 */
import {loadStudioSettings,saveStudioSettings} from './settings.js';
import {studioWindowControlIcon} from './window-system.js';
const clampWidth=(width)=>Math.max(220,Math.min(720,Math.round(Number(width)||360)));

export function mountStudioSidebarControls({
 layout,side,rail,collapseButton,restoreButton,lockButton,handle,
 onState=()=>{},doc=globalThis.document
}={}){
 if(!layout||!side||!rail||!collapseButton||!restoreButton||!lockButton||!handle)
  throw new TypeError('Sidebar controls require layout, rail, panel and controls');
 let dragging=null;
 const getState=()=>{
  const settings=loadStudioSettings();
  return {expanded:settings.sidebarMode!=='hidden',locked:!!settings.sidebarLocked,width:clampWidth(settings.sidebarWidth)};
 };
 const paint=()=>{
  const state=getState();
  layout.classList.toggle('is-side-hidden',!state.expanded);
  layout.style.setProperty('--side-width',state.width+'px');
  // Two entry points, one Core preference: fold beside the lock, restore from rail.
  collapseButton.innerHTML=studioWindowControlIcon('sidebarLeft');
  restoreButton.innerHTML=studioWindowControlIcon(state.expanded?'sidebarLeft':'sidebarRight')
   +'<span class="sidebarRestoreLabel">'+(state.expanded?'Volet':'Afficher')+'</span>';
  lockButton.innerHTML=studioWindowControlIcon(state.locked?'lock':'unlock');
  side.setAttribute('aria-hidden',String(!state.expanded));
  restoreButton.classList.toggle('sidebarNeedsRestore',!state.expanded);
  collapseButton.title='Replier le volet latéral (rappel dans la barre de navigation)';
  restoreButton.title=state.expanded?'Replier le volet latéral':'Afficher le volet latéral';
  lockButton.title=state.locked?'Déverrouiller le volet latéral':'Verrouiller le volet latéral';
  collapseButton.setAttribute('aria-label',collapseButton.title);
  restoreButton.setAttribute('aria-label',restoreButton.title);
  lockButton.setAttribute('aria-label',lockButton.title);
  collapseButton.setAttribute('aria-expanded',String(state.expanded));
  restoreButton.setAttribute('aria-expanded',String(state.expanded));
  lockButton.setAttribute('aria-pressed',String(state.locked));
  handle.setAttribute('aria-valuenow',String(state.width));
  handle.setAttribute('aria-valuemin','220');
  handle.setAttribute('aria-valuemax','720');
  handle.setAttribute('aria-valuetext',state.width+' pixels');
  handle.tabIndex=state.locked?-1:0;
  handle.title=state.locked?'Déverrouiller pour redimensionner':'Glisser pour ajuster la largeur';
  restoreButton.dataset.state=state.expanded?'open':'closed';
  onState(state);
  return state;
 };
 const toggle=()=>saveStudioSettings({sidebarMode:getState().expanded?'hidden':'normal'});
 const collapse=()=>saveStudioSettings({sidebarMode:'hidden'});
 const lock=()=>saveStudioSettings({sidebarLocked:!getState().locked});
 const pointerDown=e=>{
  if(getState().locked||matchMedia('(max-width:700px)').matches||!getState().expanded)return;
  e.preventDefault();
  dragging={id:e.pointerId,startX:e.clientX,startWidth:getState().width};
  handle.setPointerCapture(e.pointerId);
  layout.classList.add('is-side-resizing');
 };
 const pointerMove=e=>{
  if(!dragging||e.pointerId!==dragging.id)return;
  const width=clampWidth(dragging.startWidth+(e.clientX-dragging.startX));
  layout.style.setProperty('--side-width',width+'px');
  handle.setAttribute('aria-valuenow',String(width));
 };
 const pointerDone=e=>{
  if(!dragging||e.pointerId!==dragging.id)return;
  const width=clampWidth(dragging.startWidth+(e.clientX-dragging.startX));
  dragging=null;
  layout.classList.remove('is-side-resizing');
  if(handle.hasPointerCapture?.(e.pointerId))handle.releasePointerCapture(e.pointerId);
  if(width!==getState().width)saveStudioSettings({sidebarWidth:width});
  else paint();
 };
 const keyboard=e=>{
  if(getState().locked)return;
  if(e.key==='ArrowLeft'||e.key==='ArrowRight'){
   e.preventDefault();
   saveStudioSettings({sidebarWidth:clampWidth(getState().width+(e.key==='ArrowLeft'?-16:16))});
  }else if(e.key==='Home'){e.preventDefault();saveStudioSettings({sidebarWidth:220})}
  else if(e.key==='End'){e.preventDefault();saveStudioSettings({sidebarWidth:720})}
 };
 const onSettings=()=>paint();
 const onResize=()=>paint();
 collapseButton.addEventListener('click',collapse);
 restoreButton.addEventListener('click',toggle);
 lockButton.addEventListener('click',lock);
 handle.addEventListener('pointerdown',pointerDown);
 handle.addEventListener('pointermove',pointerMove);
 handle.addEventListener('pointerup',pointerDone);
 handle.addEventListener('pointercancel',pointerDone);
 handle.addEventListener('keydown',keyboard);
 doc.addEventListener('studio-v2:settings-changed',onSettings);
 window.addEventListener('resize',onResize);
 paint();
 return {
  paint,getState,toggle,toggleLock:lock,open:()=>saveStudioSettings({sidebarMode:'normal'}),
  close:collapse,setWidth:width=>saveStudioSettings({sidebarWidth:clampWidth(width)}),
  destroy(){
   collapseButton.removeEventListener('click',collapse);
   restoreButton.removeEventListener('click',toggle);
   lockButton.removeEventListener('click',lock);
   handle.removeEventListener('pointerdown',pointerDown);
   handle.removeEventListener('pointermove',pointerMove);
   handle.removeEventListener('pointerup',pointerDone);
   handle.removeEventListener('pointercancel',pointerDone);
   handle.removeEventListener('keydown',keyboard);
   doc.removeEventListener('studio-v2:settings-changed',onSettings);
   window.removeEventListener('resize',onResize);
  }
 };
}
