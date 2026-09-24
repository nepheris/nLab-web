(()=>{'use strict';
if(window.__NLAB_0918_GOOGLE_DRIVE__)return;
window.__NLAB_0918_GOOGLE_DRIVE__=true;
const SCOPE0918='openid email profile https://www.googleapis.com/auth/drive.file';
const FOLDER_MIME='application/vnd.google-apps.folder';
const DRIVE_STATE_KEY=(PROFILE.storagePrefix||'nlab-pdf')+'-drive-state-v2';
const GOOGLE_CLIENT_KEY0918=(PROFILE.storagePrefix||'nlab-pdf')+'-google-oauth-client-id';
const googleDriveClientIdBase0918=googleDriveClientId;
googleDriveClientId=function(){return String(window.NLAB_GOOGLE_DRIVE_CONFIG?.clientId||localStorage.getItem(GOOGLE_CLIENT_KEY0918)||googleDriveClientIdBase0918()||'').trim()};
let state={rootId:'',studioId:'',signaturesId:'',documentsId:'',exportsId:'',workspaceFileId:'',user:null};
try{state=Object.assign(state,JSON.parse(localStorage.getItem(DRIVE_STATE_KEY)||'{}'))}catch(e){}
function persist(){try{localStorage.setItem(DRIVE_STATE_KEY,JSON.stringify(state))}catch(e){}}
function qesc(s){return String(s).replace(/\\/g,'\\\\').replace(/'/g,"\\'")}
async function list(q,fields='files(id,name,mimeType,parents,modifiedTime,size)'){
 const p=new URLSearchParams({spaces:'drive',pageSize:'100',fields:fields,q:q});const out=await driveApiFetch('https://www.googleapis.com/drive/v3/files?'+p);return out.files||[];
}
async function ensureFolder(name,parentId){
 const q="name = '"+qesc(name)+"' and mimeType = '"+FOLDER_MIME+"' and trashed = false and '"+qesc(parentId||'root')+"' in parents";
 const found=(await list(q))[0];if(found)return found;
 return driveApiFetch('https://www.googleapis.com/drive/v3/files?fields=id,name,mimeType,parents',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name:name,mimeType:FOLDER_MIME,parents:[parentId||'root']})});
}
async function ensureStructure(){
 const root=await ensureFolder('nLab','root'),studio=await ensureFolder('PDF Studio',root.id),sig=await ensureFolder('Signatures',studio.id),docs=await ensureFolder('Documents',studio.id),exp=await ensureFolder('Exports',studio.id);
 state.rootId=root.id;state.studioId=studio.id;state.signaturesId=sig.id;state.documentsId=docs.id;state.exportsId=exp.id;persist();updateUi();return state;
}
async function userInfo(){
 const r=await fetch('https://openidconnect.googleapis.com/v1/userinfo',{headers:{Authorization:'Bearer '+S.driveAccessToken}});if(!r.ok)return null;return r.json();
}
function statusPath(){return 'Mon Drive / nLab / PDF Studio'}
function updateUi(){
 const ws=document.getElementById('workspaceStatus0918');if(ws){const who=state.user?.email?' · '+state.user.email:'';ws.textContent=S.driveConnected?'Google connecté'+who+' · '+statusPath():'Workspace local prêt · connexion Google non active';}
 const st=document.getElementById('googleDriveState');if(st&&S.driveConnected)st.textContent='Google Drive connecté · '+statusPath();
}
function connect0918(){
 const clientId=googleDriveClientId();if(!clientId)return toast('Client ID OAuth Google nLab non configuré.');if(!window.google?.accounts?.oauth2)return toast('Google Identity Services est encore en chargement');
 S.driveTokenClient=google.accounts.oauth2.initTokenClient({client_id:clientId,scope:SCOPE0918,include_granted_scopes:true,prompt:'select_account',callback:async resp=>{
  if(resp.error){toast('Connexion Google refusée : '+resp.error);return}
  S.driveAccessToken=resp.access_token;S.driveConnected=true;try{state.user=await userInfo()}catch(e){}
  setGoogleDriveUi();try{await ensureStructure();await loadWorkspaceDrive();toast('Espace personnel Google connecté')}catch(e){toast('Google connecté, initialisation Drive incomplète : '+e.message)}
 },error_callback:()=>toast('Erreur OAuth Google')});
 S.driveTokenClient.requestAccessToken({prompt:'select_account'});
}
connectGoogleDrive=connect0918;

async function findWorkspaceFile(){
 await ensureStructure();if(state.workspaceFileId){try{return await driveApiFetch('https://www.googleapis.com/drive/v3/files/'+encodeURIComponent(state.workspaceFileId)+'?fields=id,name,mimeType,parents,modifiedTime')}catch(e){state.workspaceFileId='';persist()}}
 const name=window.__NLAB_WORKSPACE_0918__?.fileName||'nlab-pdf-studio-workspace.json';const q="name = '"+qesc(name)+"' and trashed = false and '"+qesc(state.studioId)+"' in parents";const f=(await list(q))[0]||null;if(f){state.workspaceFileId=f.id;persist()}return f;
}
async function uploadJson(name,obj,parentId,fileId){
 const body=JSON.stringify(obj,null,2)+'\n';if(fileId)return driveApiFetch('https://www.googleapis.com/upload/drive/v3/files/'+encodeURIComponent(fileId)+'?uploadType=media',{method:'PATCH',headers:{'Content-Type':'application/json; charset=UTF-8'},body:body});
 const boundary='nlab_'+Date.now(),metadata={name:name,mimeType:'application/json',parents:[parentId]};
 return driveApiFetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,parents',{method:'POST',headers:{'Content-Type':'multipart/related; boundary='+boundary},body:driveMultipart(metadata,obj,boundary)});
}
async function saveWorkspaceDrive(){
 requirePersonalWorkspace('synchroniser votre workspace');await ensureStructure();const api=window.__NLAB_WORKSPACE_0918__;if(!api)throw new Error('Workspace 0.9.18 indisponible');const ws=api.capture();const f=await findWorkspaceFile();const out=await uploadJson(api.fileName,ws,state.studioId,f?.id||'');if(out?.id){state.workspaceFileId=out.id;persist()}api.render('Workspace synchronisé · '+statusPath());return out;
}
async function loadWorkspaceDrive(){
 requirePersonalWorkspace('charger votre workspace');await ensureStructure();const api=window.__NLAB_WORKSPACE_0918__,f=await findWorkspaceFile();if(!f){api.render('Aucun workspace Drive : le prochain enregistrement créera le fichier dans '+statusPath());return null}
 const data=await driveApiFetch('https://www.googleapis.com/drive/v3/files/'+encodeURIComponent(f.id)+'?alt=media');const ws=typeof data==='string'?JSON.parse(data):data;api.apply(ws);await hydrateSignatureFiles(ws);api.render('Workspace chargé · '+statusPath());return ws;
}
function dataUrlBlob(dataUrl){const [meta,b64]=String(dataUrl).split(','),mime=(/data:([^;]+)/.exec(meta)||[])[1]||'image/png',bin=atob(b64||''),u=new Uint8Array(bin.length);for(let i=0;i<bin.length;i++)u[i]=bin.charCodeAt(i);return new Blob([u],{type:mime})}
async function uploadBlob(name,blob,parentId,existingId){
 if(existingId)return driveApiFetch('https://www.googleapis.com/upload/drive/v3/files/'+encodeURIComponent(existingId)+'?uploadType=media',{method:'PATCH',headers:{'Content-Type':blob.type||'application/octet-stream'},body:blob});
 const boundary='nlab_blob_'+Date.now(),meta={name:name,parents:[parentId]},head='--'+boundary+'\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n'+JSON.stringify(meta)+'\r\n--'+boundary+'\r\nContent-Type: '+(blob.type||'application/octet-stream')+'\r\n\r\n';
 const tail='\r\n--'+boundary+'--',body=new Blob([head,blob,tail],{type:'multipart/related; boundary='+boundary});return driveApiFetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,mimeType,parents',{method:'POST',headers:{'Content-Type':'multipart/related; boundary='+boundary},body:body});
}
async function saveSignatureAssets(items){
 await ensureStructure();const wsapi=window.__NLAB_WORKSPACE_0918__,ws=wsapi?.capture();const src=items||S.signatureLibrary||[],saved=[];
 for(const it of src){const x=Object.assign({},it);if(x.dataUrl){const ext=x.dataUrl.startsWith('data:image/jpeg')?'jpg':'png',name=(x.type==='paraphe'?'paraphe-':'signature-')+(x.id||Date.now())+'.'+ext,out=await uploadBlob(name,dataUrlBlob(x.dataUrl),state.signaturesId,x.driveFileId||'');if(out?.id)x.driveFileId=out.id;x.mimeType=out?.mimeType||dataUrlBlob(x.dataUrl).type;delete x.dataUrl;}saved.push(x)}
 if(ws){ws.signatures.items=saved;wsapi.apply(ws);await saveWorkspaceDrive();await hydrateSignatureFiles(ws)}return saved;
}
async function blobToDataUrl(blob){return new Promise((res,rej)=>{const r=new FileReader();r.onload=()=>res(r.result);r.onerror=()=>rej(r.error);r.readAsDataURL(blob)})}
async function fetchBlob(id){const r=await fetch('https://www.googleapis.com/drive/v3/files/'+encodeURIComponent(id)+'?alt=media',{headers:{Authorization:'Bearer '+S.driveAccessToken}});if(!r.ok)throw new Error('Drive '+r.status);return r.blob()}
async function uploadCurrentDocument0918(){
 requirePersonalWorkspace('copier le document dans votre Drive');await ensureStructure();
 const cur=current();let blob,name;
 if(cur?.file){blob=cur.file;name=cur.name||cur.file.name||'document.pdf';}
 else if(S.pdfBytes){blob=new Blob([S.pdfBytes],{type:'application/pdf'});name=S.workingName||'document.pdf';}
 else throw new Error('Aucun fichier courant à copier.');
 const out=await uploadBlob(name,blob,state.documentsId,'');
 toast('Copié dans Google Drive / nLab / PDF Studio / Documents');
 return out;
}
async function hydrateSignatureFiles(ws){
 const items=ws?.signatures?.items||[];const out=[];for(const it of items){const x=Object.assign({},it);if(x.driveFileId){try{x.dataUrl=await blobToDataUrl(await fetchBlob(x.driveFileId))}catch(e){x.unavailable=true}}out.push(x)}S.signatureLibrary=out;try{renderSignatureLibrary();renderEditorOptions()}catch(e){}return out;
}
saveSignatureLibraryDrive=async function(items){requirePersonalWorkspace('enregistrer une signature ou un paraphe');S.signatureLibrary=items||[];return saveSignatureAssets(S.signatureLibrary)};
loadSignatureLibraryDrive=async function(){if(!S.driveConnected)return[];const ws=await loadWorkspaceDrive();return ws?S.signatureLibrary:[]};

// DSS/APP13 reste découplé de Google Drive OAuth.
const writeBase0918=writeFinalDirect;
writeFinalDirect=async function(bytes,name,dest){const r=await writeBase0918(bytes,name,dest);try{const ws=window.__NLAB_WORKSPACE_0918__?.get?.();if(S.driveConnected&&ws?.output?.drive?.autoUploadExports){await ensureStructure();const blob=new Blob([bytes],{type:'application/pdf'});await uploadBlob(name,blob,state.exportsId,'');toast('PDF enregistré + copié dans Google Drive / nLab / PDF Studio / Exports')}}catch(e){toast('PDF local enregistré ; copie Drive impossible : '+e.message)}return r;};

function installConfig(){
 window.NLAB_GOOGLE_DRIVE_CONFIG=window.NLAB_GOOGLE_DRIVE_CONFIG||{};window.NLAB_GOOGLE_DRIVE_CONFIG.scope=SCOPE0918;
 const panel=document.getElementById('workspacePanel0918');if(panel&&!document.getElementById('drivePathHelp0918')){const body=panel.querySelector('.userConfigBody'),d=document.createElement('div');d.id='drivePathHelp0918';d.className='userConfigHelp';d.innerHTML='<b>Dossier Google créé après connexion :</b> <code>Mon Drive / nLab / PDF Studio</code> avec <code>Signatures</code>, <code>Documents</code> et <code>Exports</code>. Le workspace JSON est visible à la racine de PDF Studio.';body?.appendChild(d);const copy=document.createElement('button');copy.id='workspaceCopyDocument0918';copy.type='button';copy.textContent='Copier le fichier courant dans Drive / Documents';body?.appendChild(copy);copy.onclick=()=>uploadCurrentDocument0918().catch(e=>toast(e.message));const cfg=document.createElement('label');cfg.className='userConfigHelp';cfg.innerHTML='Client ID OAuth Web Google nLab<input id="workspaceGoogleClient0918" type="text" value="'+String(googleDriveClientId()).replace(/"/g,'&quot;')+'" placeholder="xxxxxxxx.apps.googleusercontent.com">';body?.appendChild(cfg);const save=document.createElement('button');save.id='workspaceGoogleClientSave0918';save.type='button';save.textContent='Enregistrer le Client ID OAuth';body?.appendChild(save);save.onclick=()=>{const v=(document.getElementById('workspaceGoogleClient0918')?.value||'').trim();if(v&&!/^[A-Za-z0-9._-]+\.apps\.googleusercontent\.com$/.test(v))return toast('Client ID OAuth invalide');if(v)localStorage.setItem(GOOGLE_CLIENT_KEY0918,v);else localStorage.removeItem(GOOGLE_CLIENT_KEY0918);window.NLAB_GOOGLE_DRIVE_CONFIG=window.NLAB_GOOGLE_DRIVE_CONFIG||{};window.NLAB_GOOGLE_DRIVE_CONFIG.clientId=v;setGoogleDriveUi();toast(v?'Client ID OAuth enregistré':'Client ID OAuth effacé')}}updateUi();
}
window.__NLAB_DRIVE_0918__={ensureStructure,saveWorkspace:saveWorkspaceDrive,loadWorkspace:loadWorkspaceDrive,state:()=>state,scope:SCOPE0918,saveSignatureAssets,hydrateSignatureFiles,uploadCurrentDocument:uploadCurrentDocument0918};
const mo=new MutationObserver(()=>setTimeout(installConfig,0));if(document.body)mo.observe(document.body,{childList:true,subtree:true});
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(installConfig,550),{once:true});else setTimeout(installConfig,550);
})();