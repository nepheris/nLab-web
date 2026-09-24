(()=>{'use strict';
if(window.__NLAB_0917_PROFILE__)return;
window.__NLAB_0917_PROFILE__=true;
const VERSION0917='Alpha 0.9.17 TEST';
const $17=id=>document.getElementById(id);
const qa17=(s,r=document)=>Array.from(r.querySelectorAll(s));
const esc17=s=>String(s==null?'':s).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const PROFILE_FILE0917='nlab-pdf-studio-profile-v1.json';
const PROFILE_KEY0917=(PROFILE.storagePrefix||'nlab-pdf')+'-personal-profile-v1';

function defaults0917(){
 return {
  schema:'nlab-pdf-personal-profile/v1',
  updatedAt:new Date().toISOString(),
  identity:{initials:''},
  defaults:{stampId:'',signatureId:'',parapheId:'',outputMode:'',filenameTemplate:''},
  favorites:{stamps:[],sources:[],outputs:[],extensions:['pdf']},
  naming:{presets:[],activeIds:[]}
 };
}
function normalize0917(x){
 const d=defaults0917(),v=x&&typeof x==='object'?x:{};
 return Object.assign({},d,v,{
  identity:Object.assign({},d.identity,v.identity||{}),
  defaults:Object.assign({},d.defaults,v.defaults||{}),
  favorites:Object.assign({},d.favorites,v.favorites||{}),
  naming:Object.assign({},d.naming,v.naming||{})
 });
}
function loadLocal0917(){
 try{return normalize0917(JSON.parse(localStorage.getItem(PROFILE_KEY0917)||'{}'))}catch(e){return defaults0917()}
}
let personal0917=loadLocal0917();
window.__NLAB_PERSONAL_PROFILE_0917__=personal0917;
function saveLocal0917(){
 personal0917.updatedAt=new Date().toISOString();
 window.__NLAB_PERSONAL_PROFILE_0917__=personal0917;
 try{localStorage.setItem(PROFILE_KEY0917,JSON.stringify(personal0917))}catch(e){}
}
async function findDriveProfile0917(){
 const files=await listPrivateAppData();
 return files.find(f=>f.name===PROFILE_FILE0917)||null;
}
async function saveDriveProfile0917(){
 requirePersonalWorkspace('enregistrer votre profil personnel');
 capture0917();saveLocal0917();
 const payload=personal0917,existing=await findDriveProfile0917();
 if(existing){
  await driveApiFetch('https://www.googleapis.com/upload/drive/v3/files/'+encodeURIComponent(existing.id)+'?uploadType=media',{
   method:'PATCH',headers:{'Content-Type':'application/json; charset=UTF-8'},body:JSON.stringify(payload)
  });
 }else{
  const boundary='nlab_profile_'+Date.now();
  await driveApiFetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart',{
   method:'POST',headers:{'Content-Type':'multipart/related; boundary='+boundary},
   body:driveMultipart({name:PROFILE_FILE0917,parents:['appDataFolder']},payload,boundary)
  });
 }
 render0917('Profil synchronisé avec Google Drive.','ok');
 return payload;
}
async function loadDriveProfile0917(){
 if(!S.driveConnected)return null;
 const f=await findDriveProfile0917();
 if(!f){render0917('Drive connecté · aucun profil personnel enregistré.','ok');return null}
 const data=await driveApiFetch('https://www.googleapis.com/drive/v3/files/'+encodeURIComponent(f.id)+'?alt=media');
 personal0917=normalize0917(typeof data==='string'?JSON.parse(data):data);
 window.__NLAB_PERSONAL_PROFILE_0917__=personal0917;
 saveLocal0917();apply0917();render0917('Profil chargé depuis Google Drive.','ok');
 return personal0917;
}
function capture0917(){
 personal0917.identity.initials=E.form&&E.form.querySelector('[name=initials]')?E.form.querySelector('[name=initials]').value:personal0917.identity.initials;
 personal0917.defaults.stampId=E.form&&E.form.querySelector('[name=preset]')?E.form.querySelector('[name=preset]').value:personal0917.defaults.stampId;
 personal0917.defaults.outputMode=$17('outputMode')?$17('outputMode').value:personal0917.defaults.outputMode;
 personal0917.defaults.filenameTemplate=E.tpl?E.tpl.value:personal0917.defaults.filenameTemplate;
 const sig=E.form&&E.form.querySelector('[name=savedSignature]');
 if(sig&&sig.value){
  const item=(S.signatureLibrary||[]).find(x=>x.id===sig.value);
  if(item&&item.type==='paraphe')personal0917.defaults.parapheId=sig.value;
  else personal0917.defaults.signatureId=sig.value;
 }
 saveLocal0917();
}
function apply0917(){
 const ini=personal0917.identity.initials||'';
 const input=E.form&&E.form.querySelector('[name=initials]');if(input&&ini)input.value=ini;
 if(E.tpl&&personal0917.defaults.filenameTemplate)E.tpl.value=personal0917.defaults.filenameTemplate;
 if($17('outputMode')&&personal0917.defaults.outputMode)$17('outputMode').value=personal0917.defaults.outputMode;
 const p=E.form&&E.form.querySelector('[name=preset]');
 if(p&&personal0917.defaults.stampId&&Array.from(p.options).some(o=>o.value===personal0917.defaults.stampId)){p.value=personal0917.defaults.stampId;try{updateStampPreview()}catch(e){}}
 const sig=E.form&&E.form.querySelector('[name=savedSignature]');
 const wanted=personal0917.defaults.signatureId||personal0917.defaults.parapheId;
 if(sig&&wanted&&Array.from(sig.options).some(o=>o.value===wanted))sig.value=wanted;
 if(window.__NLAB_RENDER_NAMING_0917__)window.__NLAB_RENDER_NAMING_0917__();
 renderFavorites0917();try{updatePath()}catch(e){}
}
async function addFolderFavorite0917(kind){
 const h=kind==='source'?(S.source||S.lastSource):(S.dest||S.lastDest);
 if(!h)return toast('Choisissez d’abord un dossier '+(kind==='source'?'source.':'de sortie.'));
 const label=prompt('Nom du favori',h.name)||h.name,id=kind+'-'+Date.now(),key=kind==='source'?'sources':'outputs';
 await saveHandle('fav-'+id,h);
 personal0917.favorites[key].push({id:id,label:label,name:h.name,kind:'local-directory',deviceOnlyHandle:true});
 saveLocal0917();renderFavorites0917();if(S.driveConnected)saveDriveProfile0917().catch(()=>{});
}
async function openFolderFavorite0917(kind,id){
 const h=await getHandle('fav-'+id);
 if(!h)return toast('Favori connu dans le profil, mais accès local absent sur cet appareil.');
 if(!(await ensurePermission(h,kind==='source'?'read':'readwrite')))return toast('Autorisation refusée.');
 if(kind==='source'){
  S.source=h;S.lastSource=h;sourceInfo(h.name,h.name+'/ (favori personnel)');
  S.files=(await collectDir(h,$17('recursiveInput')?$17('recursiveInput').checked:true)).sort((a,b)=>a.relativePath.localeCompare(b.relativePath,'fr',{numeric:true}));
  await afterFiles();
 }else{
  S.dest=h;S.lastDest=h;destInfo(h.name,h.name+'/ (favori personnel)');updatePath();
 }
 renderFavorites0917();
}
function toggleStampFavorite0917(){
 const id=E.form&&E.form.querySelector('[name=preset]')?E.form.querySelector('[name=preset]').value:'';
 if(!id)return toast('Choisissez un tampon.');
 const a=new Set(personal0917.favorites.stamps||[]);a.has(id)?a.delete(id):a.add(id);personal0917.favorites.stamps=Array.from(a);
 saveLocal0917();renderFavorites0917();if(S.driveConnected)saveDriveProfile0917().catch(()=>{});
}
function renderFavorites0917(){
 const box=$17('favoriteWorkspace0917');if(!box)return;
 const fs=(personal0917.favorites.stamps||[]).map(id=>(S.stampLibrary||[]).find(x=>x.id===id)).filter(Boolean);
 const src=personal0917.favorites.sources||[],out=personal0917.favorites.outputs||[];
 let html='<div class="favBlock0917"><b>⭐ Tampons favoris</b><div>';
 html+=fs.length?fs.map(x=>'<button type="button" data-fs0917="'+esc17(x.id)+'">'+esc17(x.label)+'</button>').join(' '):'<span class="hint">Aucun.</span>';
 html+='</div></div><div class="favBlock0917"><b>📥 Sources favorites</b><div>';
 html+=src.length?src.map(x=>'<button type="button" data-src0917="'+esc17(x.id)+'">'+esc17(x.label)+'</button>').join(' '):'<span class="hint">Aucune.</span>';
 html+='</div><button id="addSrc0917" type="button">＋ Source actuelle</button></div><div class="favBlock0917"><b>📤 Sorties favorites</b><div>';
 html+=out.length?out.map(x=>'<button type="button" data-out0917="'+esc17(x.id)+'">'+esc17(x.label)+'</button>').join(' '):'<span class="hint">Aucune.</span>';
 html+='</div><button id="addOut0917" type="button">＋ Sortie actuelle</button></div>';
 box.innerHTML=html;
 qa17('[data-fs0917]',box).forEach(b=>b.onclick=()=>{const p=E.form&&E.form.querySelector('[name=preset]');if(p&&Array.from(p.options).some(o=>o.value===b.dataset.fs0917)){p.value=b.dataset.fs0917;p.dispatchEvent(new Event('change',{bubbles:true}))}});
 qa17('[data-src0917]',box).forEach(b=>b.onclick=()=>openFolderFavorite0917('source',b.dataset.src0917).catch(e=>toast(e.message)));
 qa17('[data-out0917]',box).forEach(b=>b.onclick=()=>openFolderFavorite0917('output',b.dataset.out0917).catch(e=>toast(e.message)));
 if($17('addSrc0917'))$17('addSrc0917').onclick=()=>addFolderFavorite0917('source');
 if($17('addOut0917'))$17('addOut0917').onclick=()=>addFolderFavorite0917('output');
}
function render0917(msg,kind){
 const box=$17('personalWorkspace0917');if(!box)return;
 const connected=!!S.driveConnected,ext=(personal0917.favorites.extensions||['pdf']).join(', ');
 let html='<h4>👤 Mon espace personnel</h4>';
 html+='<div class="authState0916 '+(connected?'ok':'warn')+'">'+esc17(msg||(connected?'Google Drive privé connecté':'Connexion Google requise pour synchroniser le profil'))+'</div>';
 html+='<div class="hint">Initiales, signature/paraphe par défaut, tampons favoris, favoris source/sortie, extensions et règles de nommage sont synchronisables dans <code>drive.appdata</code>. Les autorisations de dossiers locaux restent sur cet appareil.</div>';
 html+='<div class="row"><label>Initiales<input id="profileInitials0917" value="'+esc17(personal0917.identity.initials||'')+'" placeholder="AB"></label><label>Extensions favorites<input id="profileExt0917" value="'+esc17(ext)+'" placeholder="pdf, png, jpg"></label></div>';
 html+='<div class="row"><button id="profileSaveLocal0917" type="button">Enregistrer mes réglages</button><button id="profileLoadDrive0917" type="button" '+(connected?'':'disabled')+'>Charger Drive</button><button id="profileSaveDrive0917" type="button" '+(connected?'':'disabled')+'>Synchroniser Drive</button></div>';
 html+='<div class="row"><button id="profileFavStamp0917" type="button">⭐ Tampon favori</button><button id="profileSig0917" type="button">Signature par défaut</button><button id="profileParaphe0917" type="button">Paraphe par défaut</button></div><div id="favoriteWorkspace0917"></div>';
 box.innerHTML=html;
 $17('profileInitials0917').oninput=()=>{personal0917.identity.initials=$17('profileInitials0917').value;const i=E.form&&E.form.querySelector('[name=initials]');if(i)i.value=personal0917.identity.initials;saveLocal0917()};
 $17('profileExt0917').onchange=()=>{personal0917.favorites.extensions=$17('profileExt0917').value.split(',').map(x=>x.trim().replace(/^\./,'').toLowerCase()).filter(Boolean);saveLocal0917()};
 $17('profileSaveLocal0917').onclick=()=>{capture0917();toast('Préférences enregistrées sur cet appareil.');if(S.driveConnected)saveDriveProfile0917().catch(e=>toast(e.message));render0917()};
 $17('profileLoadDrive0917').onclick=()=>loadDriveProfile0917().catch(e=>toast(e.message));
 $17('profileSaveDrive0917').onclick=()=>saveDriveProfile0917().catch(e=>toast(e.message));
 $17('profileFavStamp0917').onclick=toggleStampFavorite0917;
 $17('profileSig0917').onclick=()=>{const s=E.form&&E.form.querySelector('[name=savedSignature]');if(!s||!s.value)return toast('Sélectionnez une signature.');personal0917.defaults.signatureId=s.value;saveLocal0917();if(S.driveConnected)saveDriveProfile0917().catch(()=>{});toast('Signature par défaut enregistrée')};
 $17('profileParaphe0917').onclick=()=>{const s=E.form&&E.form.querySelector('[name=savedSignature]');if(!s||!s.value)return toast('Sélectionnez un paraphe.');personal0917.defaults.parapheId=s.value;saveLocal0917();if(S.driveConnected)saveDriveProfile0917().catch(()=>{});toast('Paraphe par défaut enregistré')};
 renderFavorites0917();
}
function ensureUi0917(){
 const base=$17('personalStamp0916');if(!base||$17('personalWorkspace0917'))return;
 const box=document.createElement('div');box.id='personalWorkspace0917';box.className='personalWorkspace0917';base.after(box);render0917();apply0917();
}
function style0917(){
 if($17('profileStyle0917'))return;
 const st=document.createElement('style');st.id='profileStyle0917';st.textContent='.personalWorkspace0917{border:1px solid #c7d9e5;background:#f7fbfe;border-radius:9px;padding:9px;margin:9px 0}.personalWorkspace0917 h4{margin:0 0 7px;color:#174f78;font-size:12px}.favBlock0917{border-top:1px solid #dbe5eb;padding-top:7px;margin-top:7px}.favBlock0917>div{display:flex;gap:4px;flex-wrap:wrap;margin:5px 0}.favBlock0917 button{font-size:10px;padding:5px 7px}';document.head.appendChild(st);
}
const driveUiBase0917=setGoogleDriveUi;
setGoogleDriveUi=function(){driveUiBase0917();if($17('personalWorkspace0917'))render0917();if(S.driveConnected)loadDriveProfile0917().catch(()=>{})};
const sigLoadBase0917=loadSignatureLibraryDrive;
loadSignatureLibraryDrive=async function(){const x=await sigLoadBase0917();apply0917();return x};
window.__NLAB_PROFILE_API_0917__={get:()=>personal0917,saveLocal:saveLocal0917,saveDrive:saveDriveProfile0917,loadDrive:loadDriveProfile0917,render:render0917,apply:apply0917};
function install0917(){style0917();ensureUi0917();document.querySelectorAll('.buildBadge strong').forEach(x=>x.textContent=VERSION0917)}
const mo=new MutationObserver(()=>setTimeout(install0917,0));if(E.form)mo.observe(E.form,{childList:true,subtree:true});
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(install0917,320),{once:true});else setTimeout(install0917,320);
})();