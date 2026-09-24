(()=>{'use strict';
if(window.__NLAB_0917_SIGNATURE_AUTH_GATE__)return;
window.__NLAB_0917_SIGNATURE_AUTH_GATE__=true;
const $g=id=>document.getElementById(id);
function signatureSection0917(){
 const all=Array.from((E.form||document).querySelectorAll('details.toolSection'));
 return all.find(d=>{const s=d.querySelector(':scope>summary');return s&&/14\.\s*Signature/i.test(s.textContent||'')})||null;
}
function setDisabled0917(root,locked){
 if(!root)return;
 root.querySelectorAll('input,select,textarea,button').forEach(el=>{
  if(el.closest('#signatureAuthGate0917'))return;
  if(locked){
   if(!el.disabled){el.dataset.authDisabled0917='1';el.disabled=true}
  }else if(el.dataset.authDisabled0917==='1'){
   el.disabled=false;delete el.dataset.authDisabled0917;
  }
 });
}
function renderGate0917(){
 const sec=signatureSection0917();if(!sec)return;
 const body=sec.querySelector(':scope>.sectionBody');if(!body)return;
 let gate=$g('signatureAuthGate0917');
 if(!gate){gate=document.createElement('div');gate.id='signatureAuthGate0917';gate.className='signatureAuthGate0917';body.prepend(gate)}
 const connected=!!S.driveConnected,client=typeof googleDriveClientId==='function'?googleDriveClientId():'';
 if(connected){
  gate.className='signatureAuthGate0917 ok';
  gate.innerHTML='<b>🔐 Espace personnel connecté</b><span>Signature, paraphe, certificat P12/PFX et validation DSS sont accessibles. Les signatures/paraphes enregistrés restent dans votre espace privé Google Drive.</span>';
  setDisabled0917(body,false);
 }else{
  gate.className='signatureAuthGate0917 locked';
  gate.innerHTML='<b>🔒 Connexion Google requise pour la signature</b><span>Le module Signature est privé. Connectez votre espace personnel avant de charger/enregistrer une signature, un paraphe ou d’utiliser un certificat.</span><div class="row"><button id="signatureConnect0917" type="button">Connecter Google Drive</button><button id="signatureConfig0917" type="button">Configurer mon espace personnel</button></div>'+(client?'':'<small>OAuth Google n’est pas encore configuré sur cet appareil : renseignez le Client ID dans « Mon espace personnel ».</small>');
  setDisabled0917(body,true);
  const c=$g('signatureConnect0917');if(c)c.onclick=()=>connectGoogleDrive();
  const cfg=$g('signatureConfig0917');if(cfg)cfg.onclick=()=>{const x=$g('personalStamp0916')||$g('personalWorkspace0917');if(x){x.scrollIntoView({behavior:'smooth',block:'center'});const i=$g('stampGoogleClient0916');if(i)i.focus()}};
 }
}
function style0917(){
 if($g('signatureGateStyle0917'))return;
 const st=document.createElement('style');st.id='signatureGateStyle0917';
 st.textContent='.signatureAuthGate0917{display:grid;gap:6px;border-radius:8px;padding:9px;margin-bottom:9px;font-size:10px;line-height:1.45}.signatureAuthGate0917.locked{background:#fff6dd;border:1px solid #dfc56f;color:#604d0c}.signatureAuthGate0917.ok{background:#eef8f1;border:1px solid #acd0b6;color:#285c37}.signatureAuthGate0917 span{display:block}.signatureAuthGate0917 small{display:block}.signatureAuthGate0917 .row{margin-top:2px}';
 document.head.appendChild(st);
}
const baseSetGoogleDriveUi0917=setGoogleDriveUi;
setGoogleDriveUi=function(){baseSetGoogleDriveUi0917();renderGate0917()};
function install0917(){style0917();renderGate0917()}
const mo=new MutationObserver(()=>setTimeout(install0917,0));if(E.form)mo.observe(E.form,{childList:true,subtree:true});
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(install0917,420),{once:true});else setTimeout(install0917,420);
})();