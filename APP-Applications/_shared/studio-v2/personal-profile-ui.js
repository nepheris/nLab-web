import{
 PERSONAL_VARIABLES,loadPersonalProfile,savePersonalProfile,putPersonalAsset,getPersonalAsset,deletePersonalAsset,
 exportPersonalProfileZip,inspectPersonalProfileZip,importPersonalProfileZip,getPersonalProfileSecurityMode,
 initializePersonalProfileSecurity,setPersonalProfileSecurityMode,clearPrivateSession,setDefaultPersonalAsset,removePersonalAssetRef
}from'./personal-profile-service.js';

const esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const assetAccept='image/png,image/jpeg,image/webp';
const labelOf=(kind,ref)=>ref?.label||ref?.name||(kind==='signature'?'Signature':'Paraphe');

async function previewAsset(img,ref){
 if(!img)return;
 if(img.dataset.url){URL.revokeObjectURL(img.dataset.url);delete img.dataset.url}
 if(!ref?.assetId){img.removeAttribute('src');img.hidden=true;return}
 const a=await getPersonalAsset(ref.assetId);
 if(!a?.blob){img.removeAttribute('src');img.hidden=true;img.title='Asset verrouillé ou indisponible';return}
 const url=URL.createObjectURL(a.blob);img.dataset.url=url;img.src=url;img.hidden=false
}
function saveInputs(host){
 const p=loadPersonalProfile();
 p.identity.displayName=host.querySelector('[data-profile-identity="displayName"]')?.value||'';
 p.identity.firstName=host.querySelector('[data-profile-identity="firstName"]')?.value||'';
 p.identity.lastName=host.querySelector('[data-profile-identity="lastName"]')?.value||'';
 p.identity.initials=host.querySelector('[data-profile-identity="initials"]')?.value||'';
 p.identity.displayFormat=host.querySelector('[data-profile-identity="displayFormat"]')?.value||'first-last';
 for(const [k]of PERSONAL_VARIABLES){const el=host.querySelector('[data-profile-var="'+k+'"]');if(el)p.variables[k]=el.value}
 p.variables.FIRST_NAME=p.identity.firstName||'';p.variables.LAST_NAME=p.identity.lastName||'';p.variables.FULL_NAME=[p.identity.firstName,p.identity.lastName].filter(Boolean).join(' ');p.variables.LAST_FIRST=[p.identity.lastName,p.identity.firstName].filter(Boolean).join(' ');p.variables.INITIALS=p.identity.initials||[p.identity.firstName,p.identity.lastName].filter(Boolean).map(x=>x[0]?.toUpperCase()||'').join('')||p.variables.INITIALS||'';const displayChoices={'first-last':p.variables.FULL_NAME,'last-first':p.variables.LAST_FIRST,last:p.variables.LAST_NAME,first:p.variables.FIRST_NAME,initials:p.variables.INITIALS};p.variables.DISPLAY_NAME=displayChoices[p.identity.displayFormat]||p.variables.FULL_NAME;
 savePersonalProfile(p);return p
}
function status(host,msg,kind='info'){const el=host.querySelector('[data-profile-status]');if(el){el.textContent=msg;el.dataset.kind=kind}}
function libraryMarkup(kind,items,defaultId){
 const title=kind==='signature'?'Signatures':'Paraphes';
 const addLabel=kind==='signature'?'Ajouter une signature':'Ajouter un paraphe';
 const rows=items.length?items.map(ref=>'<div class="profileAssetLibraryRow" data-lib-row="'+esc(ref.assetId)+'"><label class="profileDefaultRadio" title="Définir par défaut"><input type="radio" name="profile-default-'+kind+'" data-asset-default="'+kind+'" value="'+esc(ref.assetId)+'" '+(ref.assetId===defaultId?'checked':'')+'></label><img data-asset-preview-id="'+esc(ref.assetId)+'" hidden alt=""><div class="profileAssetInfo"><b>'+esc(labelOf(kind,ref))+'</b><small>'+esc(ref.variant||'custom')+' · '+esc(ref.name||'')+'</small></div><button type="button" data-asset-remove="'+kind+'" data-asset-id="'+esc(ref.assetId)+'">Supprimer</button></div>').join(''):'<div class="profileAssetEmpty">Aucun '+(kind==='signature'?'modèle de signature':'paraphe')+' enregistré.</div>';
 const variant=kind==='signature'?'<select data-new-asset-variant="'+kind+'"><option value="simple">Signature simple</option><option value="stamp">Signature + tampon</option><option value="title">Signature + titre</option><option value="custom">Personnalisée</option></select>':'<select data-new-asset-variant="'+kind+'"><option value="initials">Paraphe simple</option><option value="stamp">Paraphe + tampon</option><option value="custom">Personnalisé</option></select>';
 return'<details class="profileAssetLibrary" open><summary>'+title+' <small>'+items.length+'</small></summary><div class="profileAssetLibraryList">'+rows+'</div><div class="profileAssetAdd"><input data-new-asset-label="'+kind+'" placeholder="'+(kind==='signature'?'Ex. Signature simple, Signature + tampon':'Ex. Paraphe VA')+'">'+variant+'<button type="button" data-asset-add="'+kind+'">'+addLabel+'</button><input type="file" accept="'+assetAccept+'" data-asset-add-file="'+kind+'" hidden></div></details>'
}

export function mountPersonalProfileUI(host){
 if(!host)return;
 const render=async()=>{
  await initializePersonalProfileSecurity();
  const p=loadPersonalProfile(),securityMode=getPersonalProfileSecurityMode();
  host.innerHTML='<div class="personalProfileCard">'+
  '<div class="personalProfileHead"><div><strong>Profil personnel nLab</strong><small>'+(securityMode==='session'?'Session privée · données sensibles verrouillées hors session':'Appareil local · portable par ZIP')+'</small></div><span class="personalProfileBadge">v'+esc(p.profileVersion||'1.2')+'</span></div>'+
  '<details class="profileSecurity" open><summary>Sécurité du profil</summary><div class="profileSecurityGrid"><label>Stockage<select data-profile-security-mode><option value="device">Appareil local</option><option value="session">Session privée</option></select></label><div class="profileSecurityExplain" data-security-explain></div></div><div class="profileActions"><button type="button" data-security-apply>Appliquer le mode</button>'+(securityMode==='session'?'<button type="button" data-security-clear-session>Effacer et verrouiller cette session</button>':'')+'</div></details>'+
  '<div class="profileGrid2"><label>Nom du profil<input data-profile-identity="displayName" value="'+esc(p.identity?.displayName||'')+'" placeholder="Ex. Profil personnel"></label><label><span><code>{FIRST_NAME}</code> Prénom</span><input data-profile-identity="firstName" value="'+esc(p.identity?.firstName||'')+'" placeholder="Ex. Vincent"></label><label><span><code>{LAST_NAME}</code> Nom</span><input data-profile-identity="lastName" value="'+esc(p.identity?.lastName||'')+'" placeholder="Ex. Arese"></label><label><span><code>{INITIALS}</code> Initiales</span><input data-profile-identity="initials" value="'+esc(p.identity?.initials||'')+'" placeholder="Ex. VA"></label><label>Identité affichée<select data-profile-identity="displayFormat"><option value="first-last">Prénom Nom</option><option value="last-first">Nom Prénom</option><option value="last">Nom</option><option value="first">Prénom</option><option value="initials">Initiales</option></select></label></div><div class="profileDerivedVars"><code>{FULL_NAME}</code> Prénom Nom · <code>{LAST_FIRST}</code> Nom Prénom · <code>{DISPLAY_NAME}</code> format choisi</div>'+
  '<details class="profileVariables" open><summary>Variables personnelles</summary><div class="profileVariableGrid">'+PERSONAL_VARIABLES.filter(([k])=>!['FIRST_NAME','LAST_NAME','FULL_NAME','LAST_FIRST','DISPLAY_NAME','INITIALS'].includes(k)).map(([k,l])=>'<label><span><code>{'+k+'}</code> '+esc(l)+'</span><input data-profile-var="'+k+'" value="'+esc(p.variables?.[k]||'')+'" placeholder="'+esc(l)+'"></label>').join('')+'</div></details>'+
  '<div class="profileAssets"><strong>Bibliothèque personnelle</strong>'+
   libraryMarkup('signature',p.assets?.signatures||[],p.assets?.defaultSignatureId)+
   libraryMarkup('initials',p.assets?.initialsImages||[],p.assets?.defaultInitialsImageId)+
  '</div>'+
  '<div class="profileTemplateSummary"><span>'+Number(p.templates?.naming?.length||0)+' modèles de nommage</span><span>'+Number(p.templates?.classification?.length||0)+' modèles de classement</span><span>'+Number(p.templates?.stamps?.length||0)+' modèles de tampons</span></div>'+
  '<div class="profileActions"><button type="button" data-profile-save>Enregistrer localement</button><button type="button" data-profile-export>Exporter le profil ZIP</button><button type="button" data-profile-import>Importer un profil ZIP</button><input type="file" accept=".zip,application/zip" data-profile-import-file hidden></div>'+
  '<div class="profileSecurityNote">Le ZIP exporté est actuellement une archive portable standard : conservez-le dans un emplacement sûr. Les clés de session, tokens et autorisations navigateur ne sont jamais exportés.</div>'+
  '<div class="profileImportPreview" data-profile-import-preview hidden></div><div class="statusBox" data-profile-status>'+(securityMode==='session'?'Profil actif uniquement dans cette session privée.':'Profil conservé sur cet appareil dans ce profil navigateur.')+'</div></div>';

  const displayFormat=host.querySelector('[data-profile-identity="displayFormat"]');if(displayFormat)displayFormat.value=p.identity?.displayFormat||'first-last';
  const securitySelect=host.querySelector('[data-profile-security-mode]'),securityExplain=host.querySelector('[data-security-explain]');
  securitySelect.value=securityMode;
  const explain=()=>securityExplain.innerHTML=securitySelect.value==='session'
   ?'<b>Session privée</b><span>Le profil reste dans la session. Les images sont chiffrées en AES-GCM avec une clé gardée uniquement dans cette session. Une nouvelle session ne peut pas les relire.</span>'
   :'<b>Appareil local</b><span>Le profil reste disponible après fermeture. Toute personne utilisant le même profil navigateur peut potentiellement y accéder.</span>';
  explain();securitySelect.onchange=explain;

  const refs=[...(p.assets?.signatures||[]),...(p.assets?.initialsImages||[])];
  for(const ref of refs)await previewAsset(host.querySelector('[data-asset-preview-id="'+CSS.escape(ref.assetId)+'"]'),ref);

  host.querySelector('[data-profile-save]').onclick=()=>{saveInputs(host);status(host,'Profil enregistré.','ok')};
  host.querySelector('[data-security-apply]').onclick=async()=>{try{saveInputs(host);status(host,'Migration du profil…');await setPersonalProfileSecurityMode(securitySelect.value);await render();status(host,securitySelect.value==='session'?'Mode session privée activé.':'Mode appareil local activé.','ok')}catch(e){status(host,e.message||String(e),'error')}};
  host.querySelector('[data-security-clear-session]')?.addEventListener('click',async()=>{if(!confirm('Effacer le profil et les images de cette session privée ? Exportez d’abord un ZIP si vous voulez les conserver.'))return;await clearPrivateSession();await render();status(host,'Session privée effacée et verrouillée.','ok')});

  for(const kind of ['signature','initials']){
   host.querySelectorAll('[data-asset-default="'+kind+'"]').forEach(r=>r.onchange=()=>{setDefaultPersonalAsset(kind,r.value);status(host,(kind==='signature'?'Signature':'Paraphe')+' par défaut mis à jour.','ok')});
   host.querySelectorAll('[data-asset-remove="'+kind+'"]').forEach(btn=>btn.onclick=async()=>{try{const id=btn.dataset.assetId;await deletePersonalAsset(id);removePersonalAssetRef(kind,id);await render();status(host,(kind==='signature'?'Signature':'Paraphe')+' supprimé.','ok')}catch(e){status(host,e.message||String(e),'error')}});
   const add=host.querySelector('[data-asset-add="'+kind+'"]'),file=host.querySelector('[data-asset-add-file="'+kind+'"]');
   add.onclick=()=>file.click();
   file.onchange=async()=>{const selected=file.files?.[0];if(!selected)return;try{
    const label=host.querySelector('[data-new-asset-label="'+kind+'"]')?.value.trim()||selected.name;
    const variant=host.querySelector('[data-new-asset-variant="'+kind+'"]')?.value||'custom';
    const a=await putPersonalAsset(kind,selected,{name:selected.name,meta:{label,variant}}),ref={assetId:a.id,name:a.name,label,type:a.type,size:a.size,variant,createdAt:new Date().toISOString()};
    const profile=loadPersonalProfile(),listKey=kind==='signature'?'signatures':'initialsImages',defaultKey=kind==='signature'?'defaultSignatureId':'defaultInitialsImageId';
    profile.assets[listKey]=[...(profile.assets?.[listKey]||[]),ref];if(!profile.assets[defaultKey])profile.assets[defaultKey]=ref.assetId;
    savePersonalProfile(profile);await render();status(host,(kind==='signature'?'Signature':'Paraphe')+' ajouté à la bibliothèque.','ok')
   }catch(e){status(host,e.message||String(e),'error')}}
  }

  host.querySelector('[data-profile-export]').onclick=async()=>{try{saveInputs(host);status(host,'Création du ZIP…');const r=await exportPersonalProfileZip();status(host,'Profil exporté : '+r.name,'ok')}catch(e){status(host,e.message||String(e),'error')}};
  const importInput=host.querySelector('[data-profile-import-file]'),preview=host.querySelector('[data-profile-import-preview]');
  host.querySelector('[data-profile-import]').onclick=()=>importInput.click();
  importInput.onchange=async()=>{const file=importInput.files?.[0];if(!file)return;try{
   status(host,'Analyse du profil…');const x=await inspectPersonalProfileZip(file),s=x.summary;preview.hidden=false;
   preview.innerHTML='<strong>Profil détecté</strong><div class="profileImportStats"><span>'+esc(s.displayName||s.initials||'Profil nLab')+'</span><span>'+s.variables+' variables</span><span>'+s.namingTemplates+' modèles nommage</span><span>'+s.classificationTemplates+' modèles classement</span><span>'+s.stampTemplates+' tampons</span><span>'+s.signatures+' signatures</span><span>'+s.initialsImages+' paraphes</span><span>'+s.assets+' fichiers personnels</span></div><div class="profileActions"><button type="button" data-import-replace>Remplacer mon profil</button><button type="button" data-import-merge>Fusionner</button><button type="button" data-import-cancel>Annuler</button></div>';
   preview.querySelector('[data-import-cancel]').onclick=()=>{preview.hidden=true;importInput.value='';status(host,'Import annulé.')};
   const go=async mode=>{try{status(host,'Import du profil…');await importPersonalProfileZip(file,{mode});await render();status(host,'Profil importé. Les variables, signatures et préférences sont actives.','ok')}catch(e){status(host,e.message||String(e),'error')}};
   preview.querySelector('[data-import-replace]').onclick=()=>go('replace');preview.querySelector('[data-import-merge]').onclick=()=>go('merge');status(host,'Profil vérifié. Choisir Fusionner ou Remplacer.','ok')
  }catch(e){preview.hidden=true;status(host,e.message||String(e),'error')}}
 };
 render();
 return{refresh:render}
}
