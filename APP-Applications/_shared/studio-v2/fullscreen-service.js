/**
 * nLab Studio Core — fullscreen controller.
 *
 * One behaviour for any Studio: click to enter, click again or Escape to leave;
 * aria-pressed, descriptive button text and data-fullscreen are kept in sync
 * with fullscreenchange. The target can be a viewport or the complete Studio.
 * Browser permissions/gesture requirements remain enforced by the browser.
 */
export function createFullscreenController({target,button,onChange=()=>{},onMessage=()=>{},doc=globalThis.document}={}){
 if(!target || !button || !doc)throw new TypeError('Full screen requires a target and button');
 const isFullscreen=()=>doc.fullscreenElement===target;
 let disposed=false;
 const synchronize=()=>{
  if(disposed)return;
  const active=isFullscreen();
  const label=button.querySelector('.ribbonBtnLabel')||button;
  label.textContent=active?'⛶ Quitter plein écran':'⛶ Plein écran';
  button.setAttribute('aria-pressed',String(active));
  button.setAttribute('title',active?'Quitter le plein écran':'Afficher en plein écran');
  target.dataset.fullscreen=String(active);
  onChange(active);
 };
 const toggle=async()=>{
  if(disposed)return false;
  try{
   if(isFullscreen()){
    if(typeof doc.exitFullscreen!=='function'){onMessage('Le navigateur ne prend pas en charge le mode plein écran.');return false}
    await doc.exitFullscreen();
   }else if(typeof target.requestFullscreen==='function')await target.requestFullscreen();
   else{onMessage('Le navigateur ne prend pas en charge le mode plein écran.');return false}
   synchronize();
   return true;
  }catch{
   onMessage('Plein écran non autorisé par le navigateur.');
   synchronize();
   return false;
  }
 };
 // listen to Escape / browser UI / another consumer taking over fullscreen
 doc.addEventListener('fullscreenchange',synchronize);
 // In Chromium headless and embedded app windows Escape may not trigger the
 // browser-level exit. Use the same explicit fallback for every Studio.
 const escapeToExit=event=>{
  if(event.key==='Escape'&&isFullscreen()&&typeof doc.exitFullscreen==='function'){
   doc.exitFullscreen().catch(()=>{});
  }
 };
 doc.addEventListener('keydown',escapeToExit);
 button.addEventListener('click',toggle);
 synchronize();
 const destroy=()=>{
  if(disposed)return;
  doc.removeEventListener('fullscreenchange',synchronize);
  doc.removeEventListener('keydown',escapeToExit);
  button.removeEventListener('click',toggle);
  const active=isFullscreen();
  disposed=true;
  if(active&&typeof doc.exitFullscreen==='function')doc.exitFullscreen().catch(()=>{});
 };
 return Object.freeze({isFullscreen,toggle,synchronize,destroy});
}
