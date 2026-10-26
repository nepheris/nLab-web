/* nLab share menu — reusable, dependency-free except QRCode.js loaded on demand.
 * This module owns the share/link/QR/print actions, not the header layout.
 * QRCode.js pinned at the same version as the existing nLab page actions.
 */
const feedbackTimers=new WeakMap();
export function notifyUi(host,message){
 if(!host)return;
 const old=feedbackTimers.get(host);
 if(old)clearTimeout(old);
 host.textContent=String(message);
 host.hidden=false;
 feedbackTimers.set(host,setTimeout(()=>{host.hidden=true;feedbackTimers.delete(host)},3500));
}
export function mountShareMenu({trigger,menu,dialog,notice}={}){
 if(!trigger||!menu||!dialog)return()=>{};
 const close=()=>{menu.hidden=true;trigger.setAttribute('aria-expanded','false')};
 const setOpen=open=>{menu.hidden=!open;trigger.setAttribute('aria-expanded',String(open))};
 let qrLoader;
 const notify=message=>notifyUi(notice,message);
 async function copyLink(){
  try{await navigator.clipboard.writeText(location.href);return true}catch{}
  const input=document.createElement('textarea');
  input.value=location.href;input.style.cssText='position:fixed;opacity:0';
  document.body.append(input);input.select();
  let success=false;
  try{success=document.execCommand('copy')}catch{}
  input.remove();return success;
 }
 function qrLibrary(){
  if(window.QRCode)return Promise.resolve(window.QRCode);
  if(!qrLoader)qrLoader=new Promise((resolve,reject)=>{
   const script=document.createElement('script');
   script.src='https://cdn.jsdelivr.net/npm/qrcodejs@1.0.0/qrcode.min.js';
   script.onload=()=>window.QRCode?resolve(window.QRCode):reject(Error('QRCode indisponible'));
   script.onerror=()=>reject(Error('Téléchargement du QR impossible'));
   document.head.append(script);
  });
  return qrLoader;
 }
 async function openQr(){
  const target=dialog.querySelector('#qrCanvas');
  if(!target)return;
  target.textContent='Chargement du QR code…';
  dialog.querySelector('#qrUrl').textContent=location.href;
  if(typeof dialog.showModal==='function')dialog.showModal();
  else dialog.setAttribute('open','');
  try{
   const QR=await qrLibrary();
   if(!dialog.open)return;
   target.replaceChildren();
   new QR(target,{text:location.href,width:208,height:208,correctLevel:QR.CorrectLevel.M});
  }catch{target.textContent='QR indisponible hors connexion. Copiez le lien.'}
 }
 const onTrigger=()=>setOpen(menu.hidden);
 const onOutside=e=>{if(!trigger.parentElement.contains(e.target))close()};
 const onEscape=e=>{if(e.key==='Escape')close()};
 const onAction=async e=>{
  const item=e.target.closest('[data-share]');if(!item)return;
  const action=item.dataset.share;
  if(action==='link'){
   close();
   try{if(navigator.share){await navigator.share({title:document.title,url:location.href});return}}
   catch(err){if(err?.name==='AbortError')return}
   notify(await copyLink()?'Lien copié':'Impossible de partager ou copier le lien');
  }else if(action==='copy'){
   notify(await copyLink()?'Lien copié':'Copie impossible');
  }else if(action==='qr'){close();await openQr()}
  else if(action==='pdf'){close();window.print()}
 };
 const closeQr=()=>dialog.close?.();
 const backdrop=e=>{if(e.target===dialog)closeQr()};
 trigger.addEventListener('click',onTrigger);
 document.addEventListener('pointerdown',onOutside);
 document.addEventListener('keydown',onEscape);
 menu.addEventListener('click',onAction);
 dialog.addEventListener('click',onAction);
 dialog.querySelector('#closeQr')?.addEventListener('click',closeQr);
 dialog.addEventListener('click',backdrop);
 return ()=>{
  close();trigger.removeEventListener('click',onTrigger);
  document.removeEventListener('pointerdown',onOutside);
  document.removeEventListener('keydown',onEscape);
  menu.removeEventListener('click',onAction);
  dialog.removeEventListener('click',onAction);
  dialog.querySelector('#closeQr')?.removeEventListener('click',closeQr);
  dialog.removeEventListener('click',backdrop);
 };
}
