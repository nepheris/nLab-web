import{PERSONAL_VARIABLES,loadPersonalProfile,savePersonalProfile,putPersonalAsset,getPersonalAsset,deletePersonalAsset,exportPersonalProfileZip,inspectPersonalProfileZip,importPersonalProfileZip}from'./personal-profile-service.js';

const esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const assetAccept='image/png,image/jpeg,image/webp,image/svg+xml';
function assetName(ref){return ref?.name||'Aucun fichier'}
async function previewAsset(img,ref){
 if(!img)return;if(img.dataset.url){URL.revokeObjectURL(img.dataset.url);delete img.dataset.url}
 if(!ref?.assetId){img.removeAttribute('src');img.hidden=true;return}
 const a=await getPersonalAsset(ref.assetId);if(!a?.blob){img.hidden=true;return}
 const url=URL.createObjectURL(a.blob);img.dataset.url=url;img.src=url;img.hidden=false
}
function saveInputs(host){
 const p=loadPersonalProfile();
 p.identity.displayName=host.querySelector('[data-profile-identity="displayName"]')?.value||'';
 p.identity.initials=host.querySelector('[data-profile-identity="initials"]')?.value||'';
 for(const [k]of PERSONAL_VARIABLES){const el=host.querySelector('[data-profile-var="'+k+'"]');if(el)p.variables[k]=el.value}
 p.variables.INITIALS=p.identity.initials||p.variables.INITIALS||'';
 savePersonalProfile(p);return p
}
function status(host,msg,kind='info'){const el=host.querySelector('[data-profile-status]');if(el){el.textContent=msg;el.dataset.kind=kind}}

export function mountPersonalProfileUI(host){
 if(!host)return;const render=async()=>{
  const p=loadPersonalProfile();
  host.innerHTML='<div class="personalProfileCard"><div class="personalProfileHead"><div><strong>Profil personnel nLab</strong><small>Local · portable par ZIP</small></div><span class="personalProfileBadge">v'+esc(p.profileVersion||'1.0')+'</span></div>'+
  '<div class="profileGrid2"><label>Nom / profil<input data-profile-identity="displayName" value="'+esc(p.identity?.displayName||'')+'" placeholder="Ex. Vincent"></label><label>Initiales<input data-profile-identity="initials" value="'+esc(p.identity?.initials||'')+'" placeholder="Ex. VA"></label></div>'+
  '<details class="profileVariables" open><summary>Variables personnelles</summary><div class="profileVariableGrid">'+PERSONAL_VARIABLES.filter(([k])=>k!=='INITIALS').map(([k,l])=>'<label><span><code>{'+k+'}</code> '+esc(l)+'</span><input data-profile-var="'+k+'" value="'+esc(p.variables?.[k]||'')+'" placeholder="'+esc(l)+'"></label>').join('')+'</div></details>'+
  '<div class="profileAssets"><strong>Assets personnels</strong><div class="profileAssetRow" data-asset-row="signature"><img data-asset-preview="signature" hidden alt=""><div><b>Signature</b><small data-asset-name="signature">'+esc(assetName(p.assets?.signature))+'</small></div><button type="button" data-asset-pick="signature">Choisir</button><button type="button" data-asset-clear="signature">Retirer</button><input type="file" accept="'+assetAccept+'" data-asset-file="signature" hidden></div>'+
  '<div class="profileAssetRow" data-asset-row="initials"><img data-asset-preview="initials" hidden alt=""><div><b>Paraphe</b><small data-asset-name="initials">'+esc(assetName(p.assets?.initialsImage))+'</small></div><button type="button" data-asset-pick="initials">Choisir</button><button type="button" data-asset-clear="initials">Retirer</button><input type="file" accept="'+assetAccept+'" data-asset-file="initials" hidden></div></div>'+
  '<div class="profileTemplateSummary"><span>'+Number(p.templates?.naming?.length||0)+' modèles de nommage</span><span>'+Number(p.templates?.classification?.length||0)+' modèles de classement</span><span>'+Number(p.templates?.stamps?.length||0)+' modèles de tampons</span></div>'+
  '<div class="profileActions"><button type="button" data-profile-save>Enregistrer localement</button><button type="button" data-profile-export>Exporter le profil ZIP</button><button type="button" data-profile-import>Importer un profil ZIP</button><input type="file" accept=".zip,application/zip" data-profile-import-file hidden></div>'+
  '<div class="profileImportPreview" data-profile-import-preview hidden></div><div class="statusBox" data-profile-status>Le profil reste sur cet appareil tant qu’il n’est pas exporté.</div></div>';
  await previewAsset(host.querySelector('[data-asset-preview="signature"]'),p.assets?.signature);
  await previewAsset(host.querySelector('[data-asset-preview="initials"]'),p.assets?.initialsImage);

  host.querySelector('[data-profile-save]').onclick=()=>{saveInputs(host);status(host,'Profil enregistré localement.','ok')};
  host.querySelector('[data-profile-export]').onclick=async()=>{try{saveInputs(host);status(host,'Création du ZIP…');const r=await exportPersonalProfileZip();status(host,'Profil exporté : '+r.name,'ok')}catch(e){status(host,e.message||String(e),'error')}};
  const importInput=host.querySelector('[data-profile-import-file]'),preview=host.querySelector('[data-profile-import-preview]');
  host.querySelector('[data-profile-import]').onclick=()=>importInput.click();
  importInput.onchange=async()=>{const file=importInput.files?.[0];if(!file)return;try{status(host,'Analyse du profil…');const x=await inspectPersonalProfileZip(file),s=x.summary;preview.hidden=false;preview.innerHTML='<strong>Profil détecté</strong><div class="profileImportStats"><span>'+esc(s.displayName||s.initials||'Profil nLab')+'</span><span>'+s.variables+' variables</span><span>'+s.namingTemplates+' modèles nommage</span><span>'+s.classificationTemplates+' modèles classement</span><span>'+s.stampTemplates+' tampons</span><span>'+s.assets+' fichiers personnels</span></div><div class="profileActions"><button type="button" data-import-replace>Remplacer mon profil</button><button type="button" data-import-merge>Fusionner</button><button type="button" data-import-cancel>Annuler</button></div>';
    preview.querySelector('[data-import-cancel]').onclick=()=>{preview.hidden=true;importInput.value='';status(host,'Import annulé.')};
    const go=async mode=>{try{status(host,'Import du profil…');await importPersonalProfileZip(file,{mode});await render();status(host,'Profil importé. Les variables et préférences sont actives.','ok')}catch(e){status(host,e.message||String(e),'error')}};
    preview.querySelector('[data-import-replace]').onclick=()=>go('replace');preview.querySelector('[data-import-merge]').onclick=()=>go('merge');status(host,'Profil vérifié. Choisir Fusionner ou Remplacer.','ok')
   }catch(e){preview.hidden=true;status(host,e.message||String(e),'error')}};

  for(const kind of ['signature','initials']){
   const pick=host.querySelector('[data-asset-pick="'+kind+'"]'),file=host.querySelector('[data-asset-file="'+kind+'"]'),clear=host.querySelector('[data-asset-clear="'+kind+'"]');
   pick.onclick=()=>file.click();
   file.onchange=async()=>{const f=file.files?.[0];if(!f)return;try{const old=loadPersonalProfile(),oldRef=kind==='signature'?old.assets?.signature:old.assets?.initialsImage;if(oldRef?.assetId)await deletePersonalAsset(oldRef.assetId);const a=await putPersonalAsset(kind,f,{name:f.name}),ref={assetId:a.id,name:a.name,type:a.type,size:a.size};if(kind==='signature')old.assets.signature=ref;else old.assets.initialsImage=ref;savePersonalProfile(old);status(host,(kind==='signature'?'Signature':'Paraphe')+' enregistré.','ok');await render()}catch(e){status(host,e.message||String(e),'error')}};
   clear.onclick=async()=>{const p2=loadPersonalProfile(),ref=kind==='signature'?p2.assets?.signature:p2.assets?.initialsImage;if(ref?.assetId)await deletePersonalAsset(ref.assetId);if(kind==='signature')p2.assets.signature=null;else p2.assets.initialsImage=null;savePersonalProfile(p2);status(host,'Asset retiré.','ok');await render()}
  }
 };
 render();
 return{refresh:render}
}
