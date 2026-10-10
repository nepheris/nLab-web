/* Shared nLab header actions: PDF, native share/copy, QR.
 * No telemetry. QR generation in-browser via pinned MIT QRCode.js. */
(()=>{'use strict';
function boot(){
 const nav=document.querySelector('header.nlab-header .nlab-nav');if(!nav||nav.querySelector('.nlab-page-actions'))return;
 const group=document.createElement('div');group.className='nlab-page-actions';group.setAttribute('aria-label','Outils de la page');
 group.innerHTML='<button type="button" data-nlab-action="pdf" title="Imprimer ou exporter en PDF">PDF</button><button type="button" data-nlab-action="share" title="Partager ou copier le lien">Partager</button><button type="button" data-nlab-action="qr" title="QR code de cette page">QR</button>';
 nav.prepend(group);
 const pop=document.createElement('dialog');pop.className='nlab-qr-modal';pop.innerHTML='<form method="dialog"><button class="nlab-qr-close" aria-label="Fermer">×</button></form><h2>QR code de cette page</h2><div class="nlab-qr-code" aria-live="polite">Préparation…</div><p class="nlab-qr-url"></p><button type="button" class="nlab-qr-copy">Copier le lien</button>';
 document.body.append(pop);
 const url=()=>location.href;
 async function copy(){try{await navigator.clipboard.writeText(url());return true}catch{const t=document.createElement('textarea');t.value=url();document.body.append(t);t.select();const ok=document.execCommand('copy');t.remove();return ok}}
 const notify=msg=>{const s=document.createElement('span');s.className='nlab-share-feedback';s.setAttribute('role','status');s.textContent=msg;group.append(s);setTimeout(()=>s.remove(),2500)};
 const loadQr=()=>new Promise((resolve,reject)=>{if(window.QRCode)return resolve();const s=document.createElement('script');s.src='https://cdn.jsdelivr.net/npm/qrcodejs@1.0.0/qrcode.min.js';s.onload=resolve;s.onerror=()=>reject(Error('Bibliothèque QR inaccessible'));document.head.append(s)});
 group.addEventListener('click',async e=>{
 const action=e.target.closest('button')?.dataset.nlabAction;if(!action)return;
 if(action==='pdf'){window.print();return}
 if(action==='share'){try{if(navigator.share){await navigator.share({title:document.title,url:url()});return}}catch(e){if(e.name==='AbortError')return}notify(await copy()?'Lien copié':'Copie impossible');return}
 if(action==='qr'){pop.showModal?.();if(!pop.open)pop.setAttribute('open','');const dest=pop.querySelector('.nlab-qr-code');dest.replaceChildren();pop.querySelector('.nlab-qr-url').textContent=url();try{await loadQr();new QRCode(dest,{text:url(),width:208,height:208,correctLevel:QRCode.CorrectLevel.M})}catch(err){dest.textContent='QR indisponible hors ligne. Copiez le lien.'}}
 });
 pop.querySelector('.nlab-qr-copy').addEventListener('click',async()=>notify(await copy()?'Lien copié':'Copie impossible'));
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();