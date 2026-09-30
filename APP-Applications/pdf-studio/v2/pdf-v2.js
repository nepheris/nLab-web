import{mountStudioV2}from'../../_shared/studio-v2/frame.js';
import{setStatus}from'../../_shared/studio-v2/core.js';
import studioManifest from'./studio-manifest.js';
import{findFeature,renderFeatureHelp}from'../../_shared/studio-v2/help.js';
import{PDFEngine}from'../v1/pdf-engine.js';
import{recordHistory}from'../../_shared/studio-v2/history.js';
import{StudioPageViewer}from'../../_shared/studio-v2/page-viewer.js';
import{createStudioContext}from'../../_shared/studio-v2/studio-context.js';
import{detectFileCapabilities}from'../../_shared/studio-v2/file-capabilities.js';
import{registerPipelineHandler,runPipeline}from'../../_shared/studio-v2/pipeline-service.js';
import{runCapabilitySelfTests}from'../../_shared/studio-v2/capability-tests.js';
import{DocumentSession}from'../../_shared/studio-v2/document-session.js';
import{CollectionBrowser}from'../../_shared/studio-v2/collection-browser.js';
import{mountDropZone,collectDirectoryHandle,mountSortableList}from'../../_shared/studio-v2/drop-zone.js';
import{loadStudioSettings,saveStudioSettings}from'../../_shared/studio-v2/settings.js';
import{lightweightThumbnail}from'../../_shared/studio-v2/thumbnail-service.js';
import{TemplateEngine,templateVariableHelp}from'../../_shared/studio-v2/template-engine.js';
import{OutputService}from'../../_shared/studio-v2/output-service.js';
import{acceptAttribute,isSupportedFile,formatInfo}from'../../_shared/studio-v2/format-registry.js';
import{enhanceStudioWindow}from'../../_shared/studio-v2/window-system.js';
import{mountPersonalProfileUI}from'../../_shared/studio-v2/personal-profile-ui.js';
import{loadPersonalProfile,updatePersonalProfile,profileTemplateValues,getPersonalAsset,listPersonalTemplates,savePersonalTemplate,removePersonalTemplate}from'../../_shared/studio-v2/personal-profile-service.js';
import{listRecentLocations,rememberLocation,resolveRecentLocation}from'../../_shared/studio-v2/recent-locations-service.js';
import{resolveStudioVersions,applyVersionDocumentMeta}from'../../_shared/studio-v2/version-service.js';
import{PdfSignatureService}from'./signature-service.js';

const runtimeVersion=await resolveStudioVersions({versionsHref:'../versions.json',coreVersionHref:'../../_shared/studio-v2/version.json',channel:'test'});
applyVersionDocumentMeta({studioName:studioManifest.name,studioVersion:runtimeVersion.studioVersion,studioStatus:runtimeVersion.studioStatus,coreVersion:runtimeVersion.coreVersion});
await mountStudioV2({manifest:studioManifest,versionInfo:{version:runtimeVersion.studioVersion,status:runtimeVersion.studioStatus,coreVersion:runtimeVersion.coreVersion}});
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
let personalProfile=loadPersonalProfile();
const engine=new PDFEngine(),session=new DocumentSession(),templates=new TemplateEngine(profileTemplateValues(personalProfile)),output=new OutputService(),signatureService=new PdfSignatureService();
let undoStack=[],redoStack=[],loadedFiles=[],activeFileCapabilities=null,lastFeature=null,resizeWidth=null,cryptoSignatureState=null,assemblyItems=[],assemblySelectedIndex=-1,assemblyInsertFile=null;
let activeInputLocation=null,activeOutputLocation=null,assemblySortUnmount=null;
function setValidatedButton(el,on,label=''){if(!el)return;el.classList.toggle('validatedChoice',!!on);el.setAttribute('aria-pressed',on?'true':'false');if(label)el.title=label}
function renderRecentLocationSelects(){
 personalProfile=loadPersonalProfile();
 for(const [kind,id] of [['input','recentInputSelect'],['output','recentOutputSelect']]){
  const select=$('#'+id);if(!select)continue;const items=listRecentLocations(kind),caption=kind==='input'?'Entrées récentes…':'Sorties récentes…';
  select.innerHTML='<option value="">'+caption+'</option>'+items.map(x=>'<option value="'+x.id+'">'+String(x.label||x.name||x.path||'Dossier').replace(/[<>]/g,'')+'</option>').join('');
  select.disabled=!items.length
 }
}
function renderNamingPresets(){
 const sel=$('#namingPresetSelect');if(!sel)return;const items=listPersonalTemplates('naming');
 sel.innerHTML='<option value="">Personnalisé</option>'+items.map(x=>'<option value="'+x.id+'">'+String(x.label||x.id).replace(/[<>]/g,'')+'</option>').join('')
}


mountPersonalProfileUI($('#personalProfileHost'));
$('#fileInput').accept=acceptAttribute();
const fileBrowser=new CollectionBrowser({host:$('#fileCollection'),view:'list',key:'pdf-files',getThumbnail:item=>lightweightThumbnail(item.data)});
fileBrowser.addEventListener('activate',e=>{const file=e.detail?.data;if(file)load(file)});
fileBrowser.addEventListener('selection',()=>{syncViewerMeta();const count=fileBrowser.selectedItems().filter(x=>formatInfo(x.data).family==='pdf').length;if($('#assemblySelectionCount'))$('#assemblySelectionCount').textContent=count+' PDF sélectionné(s)'});
$('#fileCollectionView').value=fileBrowser.view;$('#fileSort').value=fileBrowser.sortMode;$('#fileGroupBy').value=fileBrowser.groupBy;
$('#fileCollectionView').addEventListener('change',()=>fileBrowser.setView($('#fileCollectionView').value));
$('#fileSort').addEventListener('change',()=>fileBrowser.setSort($('#fileSort').value,fileBrowser.sortDirection));
$('#fileSortDirection').onclick=()=>{fileBrowser.setSort(fileBrowser.sortMode,-fileBrowser.sortDirection);$('#fileSortDirection').textContent=fileBrowser.sortDirection>0?'↑':'↓'};
$('#fileGroupBy').addEventListener('change',()=>fileBrowser.setGroupBy($('#fileGroupBy').value));
$('#fileSelectAll').onclick=()=>fileBrowser.selectAll();$('#fileSelectNone').onclick=()=>fileBrowser.clearSelection();
$('#filePrev').onclick=()=>fileBrowser.previous({selectedOnly:$('#navigateSelectedOnly').checked});
$('#fileNext').onclick=()=>fileBrowser.next({selectedOnly:$('#navigateSelectedOnly').checked});

const viewer=new StudioPageViewer({
 engine,mainHost:$('#mainPageGrid'),previewHost:$('#previewGrid'),
 onActivate:page=>{session.setPage(page);syncViewerMeta()},
 onSelection:pages=>{session.selectedPages=new Set(pages);session.dispatchEvent(new Event('selection'));syncViewerMeta()},
 onDelete:page=>deletePageNumber(page),onAdd:()=>addPage(),onRotate:(page,delta)=>rotate(delta,[page])
});

function syncSession(){session.patch({file:engine.sourceFile,fileName:engine.fileName,page:engine.currentPage,pageCount:engine.pageCount,selectedPages:new Set(engine.selected),dirty:engine.dirty,meta:{sourceCapabilities:activeFileCapabilities}})}
function syncUndoRedo(){const u=$('#history-undo'),r=$('#history-redo');if(u)u.disabled=!undoStack.length;if(r)r.disabled=!redoStack.length}
async function checkpoint(){if(!engine.pageCount)return;undoStack.push(await engine.baseBytes());if(undoStack.length>30)undoStack.shift();redoStack=[];syncUndoRedo()}
async function undo(){if(!undoStack.length||!engine.pageCount)return;redoStack.push(await engine.baseBytes());await engine.setBytes(undoStack.pop());cryptoSignatureState=null;syncSession();await renderAll();syncUndoRedo();setStatus('Modification annulée');recordHistory({studio:'pdf-studio',type:'action',label:'Annulation',target:engine.fileName})}
async function redo(){if(!redoStack.length||!engine.pageCount)return;undoStack.push(await engine.baseBytes());await engine.setBytes(redoStack.pop());cryptoSignatureState=null;syncSession();await renderAll();syncUndoRedo();setStatus('Modification rétablie');recordHistory({studio:'pdf-studio',type:'action',label:'Rétablissement',target:engine.fileName})}

function loadPdfProfilePreferences(){
 personalProfile=loadPersonalProfile();templates.setValues(profileTemplateValues(personalProfile));
 const pref=personalProfile.preferences?.studios?.['pdf-studio']||{};
 if(pref.naming){if(pref.naming.template!=null)$('#namingTemplate').value=pref.naming.template;if(pref.naming.prefix!=null)$('#namingPrefix').value=pref.naming.prefix;if(pref.naming.suffix!=null)$('#namingSuffix').value=pref.naming.suffix}
 if(pref.output){if(pref.output.structure)$('#outputStructure').value=pref.output.structure;if(pref.output.pathTemplate!=null)$('#outputPathTemplate').value=pref.output.pathTemplate;if(pref.output.format)$('#outputFormat').value=pref.output.format}
}
function savePdfProfilePreferences(){
 const naming={template:$('#namingTemplate').value||'{FILENAME}',prefix:$('#namingPrefix').value||'',suffix:$('#namingSuffix').value||''};
 const outputPref={structure:$('#outputStructure').value||'root',pathTemplate:$('#outputPathTemplate').value||'',format:$('#outputFormat').value||'pdf'};
 personalProfile=updatePersonalProfile(p=>{p.preferences=p.preferences||{};p.preferences.studios=p.preferences.studios||{};p.preferences.studios['pdf-studio']={...(p.preferences.studios['pdf-studio']||{}),naming,output:outputPref};return p});
}

function namingExtra(){const item=fileBrowser.active();return{RELATIVE_PATH:item?.relativePath||engine.sourceFile?.webkitRelativePath||engine.fileName,PATH:item?.relativePath||engine.fileName,FILESIZE:String(engine.sourceFile?.size||0),PAGES:String(engine.pageCount||1),PAGE:String(engine.currentPage||1),SELECTED_COUNT:String(engine.selected.size),INDEX:String(Math.max(1,fileBrowser.items.findIndex(x=>x.id===fileBrowser.activeId)+1))}}
function outputName(extension='.pdf'){return templates.buildName(engine.sourceFile?.name||engine.fileName,{prefix:$('#namingPrefix').value,template:$('#namingTemplate').value||'{FILENAME}',suffix:$('#namingSuffix').value,extension,extra:namingExtra()})}
function updateNamingPreview(){const ext=$('#outputFormat').value==='same'?('.'+(formatInfo(engine.sourceFile).extension||'pdf')):'.pdf';$('#namingPreview').textContent=outputName(ext)}
function outputContext(){return templates.context(engine.sourceFile?.name||engine.fileName,namingExtra())}
function outputParts(){const mode=$('#outputStructure').value,custom=templates.resolve($('#outputPathTemplate').value,engine.fileName,outputContext());return output.structureParts(mode,outputContext(),custom)}
function updateOutputPreview(){const provider=$('#outputProvider').value==='local'?(output.handle?'Dossier : '+output.handle.name:'Dossier local non choisi'):'Téléchargement navigateur',parts=outputParts();$('#outputPathPreview').textContent=provider+(parts.length?' / '+parts.join(' / '):' / racine')}
['namingTemplate','namingPrefix','namingSuffix'].forEach(id=>$('#'+id).addEventListener('input',()=>{updateNamingPreview();savePdfProfilePreferences()}));
['outputFormat','outputProvider','outputStructure','outputPathTemplate'].forEach(id=>$('#'+id).addEventListener('input',()=>{updateNamingPreview();updateOutputPreview();if(id!=='outputProvider')savePdfProfilePreferences()}));
loadPdfProfilePreferences();renderRecentLocationSelects();renderNamingPresets();
$('#namingVariables').innerHTML=templateVariableHelp().map(x=>'<code>{'+x.name+'}</code><span>'+x.description+'</span>').join('');
document.addEventListener('nlab:personal-profile-changed',e=>{personalProfile=e.detail?.profile||loadPersonalProfile();templates.setValues(profileTemplateValues(personalProfile));updateNamingPreview();updateOutputPreview()});
document.addEventListener('nlab:personal-profile-imported',()=>{loadPdfProfilePreferences();renderRecentLocationSelects();renderNamingPresets();updateNamingPreview();updateOutputPreview();setStatus('Profil personnel importé et appliqué au PDF Studio.')});
$('#namingPresetSelect').onchange=()=>{const id=$('#namingPresetSelect').value,item=listPersonalTemplates('naming').find(x=>x.id===id);if(!item)return;$('#namingTemplate').value=item.template||'{FILENAME}';$('#namingPrefix').value=item.prefix||'';$('#namingSuffix').value=item.suffix||'';updateNamingPreview();savePdfProfilePreferences()};
$('#saveNamingPreset').onclick=()=>{const label=$('#namingPresetLabel').value.trim();if(!label){setStatus('Donnez un nom au modèle.');return}const existing=$('#namingPresetSelect').value;savePersonalTemplate('naming',{id:existing&&existing.startsWith('user-')?existing:'user-'+Date.now(),label,template:$('#namingTemplate').value||'{FILENAME}',prefix:$('#namingPrefix').value||'',suffix:$('#namingSuffix').value||''});renderNamingPresets();$('#namingPresetLabel').value='';setStatus('Modèle de nommage enregistré dans le profil.')};
$('#deleteNamingPreset').onclick=()=>{const id=$('#namingPresetSelect').value;if(!id||!id.startsWith('user-')){setStatus('Seuls les modèles personnels peuvent être supprimés.');return}removePersonalTemplate('naming',id);renderNamingPresets();setStatus('Modèle personnel supprimé.')};

let signatureMode='visual',signaturePreviewUrl=null;
function signatureTargetPages(){
 const mode=$('#signaturePageScope')?.value||'current';
 if(mode==='all')return engine.targetPages('all');
 if(mode==='selected')return engine.selected.size?[...engine.selected]:[engine.currentPage];
 return[engine.currentPage]
}
function signatureRefs(){
 const p=loadPersonalProfile(),kind=$('#signatureAppearanceType')?.value||'signature';
 if(kind==='initials')return{kind,items:p.assets?.initialsImages||[],defaultId:p.assets?.defaultInitialsImageId||null};
 if(kind==='signature')return{kind,items:p.assets?.signatures||[],defaultId:p.assets?.defaultSignatureId||null};
 return{kind:'none',items:[],defaultId:null}
}
async function refreshSignatureAssets(){
 const sel=$('#signatureAssetSelect'),box=$('#signatureAssetPreview');if(!sel||!box)return;
 const {kind,items,defaultId}=signatureRefs();sel.innerHTML='';
 if(kind==='none'){sel.disabled=true;box.innerHTML='<span>Aucune apparence visuelle.</span>';return}
 sel.disabled=false;
 for(const ref of items){const o=document.createElement('option');o.value=ref.assetId;o.textContent=ref.label||ref.name||ref.assetId;sel.append(o)}
 if(defaultId&&items.some(x=>x.assetId===defaultId))sel.value=defaultId;
 if(!items.length){box.innerHTML='<span>Aucune image '+(kind==='signature'?'de signature':'de paraphe')+' dans le profil personnel.</span>';return}
 await refreshSignaturePreview()
}
async function refreshSignaturePreview(){
 const box=$('#signatureAssetPreview'),id=$('#signatureAssetSelect')?.value;if(!box)return;
 if(signaturePreviewUrl){URL.revokeObjectURL(signaturePreviewUrl);signaturePreviewUrl=null}
 if(!id){box.innerHTML='<span>Aucune image sélectionnée.</span>';return}
 const a=await getPersonalAsset(id);if(!a?.blob){box.innerHTML='<span>Image verrouillée ou indisponible.</span>';return}
 signaturePreviewUrl=URL.createObjectURL(a.blob);box.innerHTML='<img src="'+signaturePreviewUrl+'" alt="Aperçu de la signature ou du paraphe">'
}
function setSignatureMode(mode){
 signatureMode=['visual','digital','certified'].includes(mode)?mode:'visual';
 $('[data-signature-mode]').forEach(b=>b.classList.toggle('active',b.dataset.signatureMode===signatureMode));
 const visual=signatureMode==='visual',certified=signatureMode==='certified';
 $('#signatureVisualControls').hidden=false;$('#applyVisualSignature').hidden=!visual;$('#signatureCryptoControls').hidden=visual;
 $('#signatureCertificationField').hidden=!certified;
 $('#signatureModeHelp').textContent=visual
  ?'PDF Signature visuelle — image uniquement, non cryptographique.'
  :signatureMode==='digital'
   ?'PDF Signature digitale — signature cryptographique PAdES du document. Toute modification ultérieure peut rendre la validation invalide.'
   :'PDF Signature certifiée — signature cryptographique PAdES avec règles DocMDP sur les modifications autorisées.';
 $('#applyCryptographicSignature').textContent=certified?'Certifier et signer le PDF':'Signer digitalement le PDF'
}
async function applyVisualSignature(){
 assertPdfMutationAllowed();
 if(!engine.pageCount)throw new Error('Chargez d’abord un PDF.');
 const id=$('#signatureAssetSelect')?.value;if(!id)throw new Error('Choisissez une signature ou un paraphe.');
 const asset=await getPersonalAsset(id);if(!asset?.blob)throw new Error('Image de signature/paraphe indisponible.');
 const pages=signatureTargetPages();await checkpoint();
 await engine.applyImageOverlay(asset.blob,pages,{
  position:$('#signaturePosition').value,widthPct:Number($('#signatureWidthPct').value)||24,
  xPct:Number($('#signatureXPct').value)||70,yPct:Number($('#signatureYPct').value)||6,
  opacity:(Number($('#signatureOpacityPct').value)||100)/100
 });
 markPdfModifiedAfterSignature();
 await renderAll();setStatus('Signature visuelle appliquée sur '+pages.length+' page(s).');
 recordHistory({studio:'pdf-studio',type:'action',label:$('#signatureAppearanceType').value==='initials'?'Paraphe visuel':'Signature visuelle',detail:pages.length+' page(s) · non cryptographique',target:engine.fileName,action:'signature',repeatable:false})
}
async function bytesWithOptionalSignatureAppearance(){
 const appearance=$('#signatureAppearanceType')?.value||'none';
 const before=await engine.baseBytes();
 if(appearance==='none')return{bytes:before,restore:null};
 const id=$('#signatureAssetSelect')?.value;if(!id)throw new Error('Choisissez une apparence de signature/paraphe ou « Aucune apparence ».');
 const asset=await getPersonalAsset(id);if(!asset?.blob)throw new Error('Image de signature/paraphe indisponible.');
 const pages=signatureTargetPages();
 await engine.applyImageOverlay(asset.blob,pages,{
  position:$('#signaturePosition').value,widthPct:Number($('#signatureWidthPct').value)||24,
  xPct:Number($('#signatureXPct').value)||70,yPct:Number($('#signatureYPct').value)||6,
  opacity:(Number($('#signatureOpacityPct').value)||100)/100
 });
 return{bytes:await engine.baseBytes(),restore:before}
}
async function applyCryptographicSignature(){
 if(!engine.pageCount)throw new Error('Chargez d’abord un PDF.');
 const cert=$('#signatureCertificate')?.files?.[0];if(!cert)throw new Error('Sélectionnez un certificat .p12 ou .pfx.');
 const status=$('#signatureCryptoStatus');status.textContent='Préparation de la signature…';
 const before=await engine.baseBytes();let prepared=null;
 try{
  prepared=await bytesWithOptionalSignatureAppearance();
  const signed=await signatureService.sign({
   pdfBytes:prepared.bytes,certificateFile:cert,password:$('#signatureCertificatePassword').value||'',
   padesLevel:$('#signaturePadesLevel').value,
   certificationLevel:signatureMode==='certified'?$('#signatureCertificationLevel').value:'NOT_CERTIFIED',
   reason:templates.resolve($('#signatureReason').value||'',engine.fileName,outputContext()),
   location:templates.resolve($('#signatureLocation').value||'',engine.fileName,outputContext()),
   contact:templates.resolve($('#signatureContact').value||'',engine.fileName,outputContext()),
   signerName:templates.resolve($('#signatureSignerName').value||'{DISPLAY_NAME}',engine.fileName,outputContext()),
   appearance:$('#signatureAppearanceType').value||'none'
  });
  undoStack.push(before);if(undoStack.length>30)undoStack.shift();redoStack=[];syncUndoRedo();
  await engine.setBytes(signed);cryptoSignatureState={mode:signatureMode,certificationLevel:signatureMode==='certified'?$('#signatureCertificationLevel').value:'NOT_CERTIFIED',padesLevel:$('#signaturePadesLevel').value,modified:false};await renderAll();$('#signatureCertificatePassword').value='';
  status.textContent=(signatureMode==='certified'?'PDF certifié et signé':'PDF signé digitalement')+' avec succès.';
  setStatus(status.textContent);
  recordHistory({studio:'pdf-studio',type:'action',label:signatureMode==='certified'?'Signature certifiée':'Signature digitale',detail:$('#signaturePadesLevel').value,target:engine.fileName,action:'signature',repeatable:false})
 }catch(e){
  if(prepared?.restore)await engine.setBytes(before);
  await renderAll();status.textContent='Échec : '+(e.message||e);throw e
 }
}
async function validateCurrentSignature(){
 if(!engine.pageCount)throw new Error('Aucun PDF chargé.');const s=$('#signatureCryptoStatus');s.textContent='Validation DSS…';
 const r=await signatureService.validate(await engine.baseBytes());s.textContent=typeof r==='string'?r:JSON.stringify(r,null,2)
}
$('[data-signature-mode]').forEach(b=>b.onclick=()=>setSignatureMode(b.dataset.signatureMode));
$('#signatureAppearanceType').onchange=refreshSignatureAssets;$('#signatureAssetSelect').onchange=refreshSignaturePreview;
$('#signaturePosition').onchange=()=>{$('#signatureCustomPosition').hidden=$('#signaturePosition').value!=='custom'};
$('#saveSignatureDssUrl').onclick=()=>{try{signatureService.setBaseUrl($('#signatureDssUrl').value);$('#signatureCryptoStatus').textContent='URL DSS enregistrée.'}catch(e){$('#signatureCryptoStatus').textContent=e.message}};
$('#testSignatureDss').onclick=async()=>{try{$('#signatureCryptoStatus').textContent='Test DSS…';const r=await signatureService.health();$('#signatureCryptoStatus').textContent=JSON.stringify(r,null,2)}catch(e){$('#signatureCryptoStatus').textContent=e.message}};
$('#validateSignaturePdf').onclick=()=>validateCurrentSignature().catch(e=>$('#signatureCryptoStatus').textContent=e.message);
$('#applyVisualSignature').onclick=()=>applyVisualSignature().catch(e=>setStatus(e.message));
$('#applyCryptographicSignature').onclick=()=>applyCryptographicSignature().catch(e=>setStatus(e.message));
$('#signatureDssUrl').value=signatureService.baseUrl||'';
$('#signatureSignerName').value='{DISPLAY_NAME}';$('#signatureLocation').value='{SITE}';
setSignatureMode('visual');refreshSignatureAssets();
document.addEventListener('nlab:personal-profile-changed',()=>refreshSignatureAssets());


function syncViewerMeta(){
 $('#pageNumberInput').value=engine.currentPage||1;$('#pageNumberInput').max=Math.max(1,engine.pageCount);$('#pageInfo').textContent='/ '+engine.pageCount;$('#zoomInput').value=Math.round(viewer.zoom*100);$('#pagesPerRow').value=viewer.pagesPerRow;$('#previewColumns').value=viewer.previewColumns;$('#previewZoom').value=Math.round(viewer.previewScale*100);
 const capInfo=activeFileCapabilities?.extension?(' · '+activeFileCapabilities.extension.toUpperCase()):'',selectedFiles=fileBrowser.selected.size?(' · '+fileBrowser.selected.size+' fichier(s) sélectionné(s)'):'';
 $('#sourceStatus').textContent=engine.pageCount?engine.fileName+' · '+engine.pageCount+' page(s) · '+engine.selected.size+' page(s) sélectionnée(s)'+capInfo+selectedFiles:'Aucun document chargé.';
 syncSession();viewer.refreshActive();updateNamingPreview();updateOutputPreview();
}
async function renderAll(){if(!engine.pageCount){$('#mainPageGrid').innerHTML='';$('#previewGrid').innerHTML='';syncViewerMeta();return}await viewer.renderMain();await viewer.renderPreview();syncViewerMeta()}

async function load(file){
 if(!file)return;setStatus('Chargement…');activeFileCapabilities=detectFileCapabilities(file);
 try{
  await engine.loadFile(file);undoStack=[];redoStack=[];cryptoSignatureState=null;syncUndoRedo();viewer.setZoom(1);viewer.setPagesPerRow(1);syncSession();await renderAll();
  const item=fileBrowser.items.find(x=>x.data===file);if(item){item.pages=engine.pageCount;item.subtitle=item.relativePath||activeFileCapabilities.family;fileBrowser.render()}
  const converted=activeFileCapabilities.family!=='pdf'?' · aperçu PDF rapide':'';
  setStatus('Document chargé'+converted);recordHistory({studio:'pdf-studio',type:'file',label:'Fichier chargé',detail:engine.pageCount+' page(s) · '+activeFileCapabilities.family,target:file.name});
 }catch(e){setStatus('Aperçu indisponible : '+e.message);$('#mainPageGrid').innerHTML='<div class="statusBox">Aperçu rapide indisponible pour <b>'+file.name+'</b>.<br>Le format est détecté par le Core ; utiliser Conversion Studio lorsqu’une conversion avancée est requise.</div>';$('#previewGrid').innerHTML=''}
}
async function loadFiles(files){
 const recursive=$('#recursiveFolders').checked;
 loadedFiles=[...files].filter(isSupportedFile).filter(f=>recursive||!f.webkitRelativePath||f.webkitRelativePath.split('/').length<=2);
 fileBrowser.setItems(loadedFiles.map((file,i)=>({id:'file-'+i+'-'+file.name,label:file.name,subtitle:file.webkitRelativePath||'',relativePath:file.webkitRelativePath||file.name,size:file.size,type:file.type,extension:formatInfo(file).extension,data:file})));
 const compatible=loadedFiles.find(x=>formatInfo(x).family!=='archive');if(compatible){fileBrowser.activeId=fileBrowser.items.find(x=>x.data===compatible)?.id||null;fileBrowser.render();await load(compatible)}else setStatus(loadedFiles.length?'Formats chargés dans la collection ; aucun aperçu PDF rapide disponible':'Aucun fichier compatible');
}
function assertPdfMutationAllowed(){
 if(cryptoSignatureState?.mode==='certified'&&cryptoSignatureState?.certificationLevel==='CERTIFIED_NO_CHANGES_ALLOWED')throw new Error('PDF certifié : aucune modification n’est autorisée. Utilisez Annuler pour revenir avant la certification.');
}
function markPdfModifiedAfterSignature(){
 if(!cryptoSignatureState)return;cryptoSignatureState={...cryptoSignatureState,modified:true};setStatus('Document modifié après signature cryptographique — la validation de signature doit être contrôlée.')
}
async function rotate(delta,pagesOverride=null){assertPdfMutationAllowed();if(!engine.pageCount)return;const pages=pagesOverride||engine.targetPages($('#pageScope').value);if(!pages.length)return;await checkpoint();await engine.rotate(pages,delta);markPdfModifiedAfterSignature();await renderAll();setStatus('Rotation '+(delta>0?'+90°':'−90°'));recordHistory({studio:'pdf-studio',type:'action',label:'Rotation '+(delta>0?'+90°':'−90°'),detail:pages.length+' page(s)',target:engine.fileName,action:delta>0?'rotateRight':'rotateLeft',repeatable:true})}
async function addPage(){assertPdfMutationAllowed();if(!engine.pageCount)return;await checkpoint();await engine.addBlank(engine.pageCount);markPdfModifiedAfterSignature();await renderAll();setStatus('Page ajoutée');recordHistory({studio:'pdf-studio',type:'action',label:'Page ajoutée',target:engine.fileName,action:'addPage',repeatable:true})}
async function duplicatePage(){assertPdfMutationAllowed();if(!engine.pageCount)return;await checkpoint();await engine.duplicate(engine.currentPage);markPdfModifiedAfterSignature();await renderAll();setStatus('Page dupliquée');recordHistory({studio:'pdf-studio',type:'action',label:'Page dupliquée',target:engine.fileName,action:'duplicatePage',repeatable:true})}
async function deletePageNumber(page){assertPdfMutationAllowed();if(!engine.pageCount)return;await checkpoint();try{await engine.deletePages([page]);markPdfModifiedAfterSignature();await renderAll();setStatus('Page '+page+' supprimée')}catch(e){setStatus(e.message)}}
async function deletePages(){assertPdfMutationAllowed();if(!engine.pageCount)return;const pages=engine.targetPages($('#pageScope').value);if(!pages.length)return;await checkpoint();try{await engine.deletePages(pages);markPdfModifiedAfterSignature();await renderAll();setStatus('Page(s) supprimée(s)')}catch(e){setStatus(e.message)}}
async function deleteSelected(){assertPdfMutationAllowed();if(!engine.selected.size)return;await checkpoint();try{await engine.deletePages([...engine.selected]);markPdfModifiedAfterSignature();await renderAll();setStatus('Sélection supprimée')}catch(e){setStatus(e.message)}}
function renderAssemblyList(){
 const host=$('#assemblyList');if(!host)return;$('#assemblySelectionCount').textContent=assemblyItems.length+' PDF';
 host.innerHTML=assemblyItems.length?assemblyItems.map((x,i)=>'<button type="button" draggable="true" class="assemblyItem '+(i===assemblySelectedIndex?'active':'')+'" data-assembly-index="'+i+'" data-sort-id="'+x.id+'"><span class="assemblyOrder">'+(i+1)+'</span><span><b>'+x.name+'</b><small>'+((x.isCurrent?'Document courant · ':'')+(x.size?Math.round(x.size/1024)+' Ko':''))+'</small></span></button>').join(''):'<div class="collectionEmpty">Sélectionnez au moins deux PDF dans la collection.</div>';
 host.querySelectorAll('[data-assembly-index]').forEach(b=>b.onclick=()=>{assemblySelectedIndex=Number(b.dataset.assemblyIndex);renderAssemblyList()});
 assemblySortUnmount?.();assemblySortUnmount=mountSortableList(host,{itemSelector:'.assemblyItem',onReorder:ids=>{const map=new Map(assemblyItems.map(x=>[x.id,x]));assemblyItems=ids.map(id=>map.get(id)).filter(Boolean);assemblySelectedIndex=-1;renderAssemblyList()}})
}
function fillAssemblyFromSelection(){
 const selected=fileBrowser.selectedItems().filter(x=>formatInfo(x.data).family==='pdf');
 assemblyItems=selected.map(x=>({id:x.id,name:x.label,file:x.data,size:x.size,isCurrent:x.id===fileBrowser.activeId}));
 assemblySelectedIndex=assemblyItems.length?0:-1;renderAssemblyList();
 if(assemblyItems.length<2)setStatus('Sélectionnez au moins deux PDF dans la collection pour les fusionner.')
}
function moveAssemblyItem(delta){
 const i=assemblySelectedIndex,j=i+delta;if(i<0||j<0||j>=assemblyItems.length)return;
 [assemblyItems[i],assemblyItems[j]]=[assemblyItems[j],assemblyItems[i]];assemblySelectedIndex=j;renderAssemblyList()
}
async function mergeAssemblySelection(){
 assertPdfMutationAllowed();if(assemblyItems.length<2)throw new Error('Sélectionnez au moins deux PDF à fusionner.');
 const entries=[];
 for(const x of assemblyItems){
  if(x.isCurrent&&engine.pageCount)entries.push({name:x.name,bytes:await engine.baseBytes()});
  else entries.push({name:x.name,bytes:new Uint8Array(await x.file.arrayBuffer())})
 }
 const previous=engine.pageCount?await engine.baseBytes():null;
 if(previous){undoStack.push(previous);if(undoStack.length>30)undoStack.shift();redoStack=[];syncUndoRedo()}
 const name=($('#assemblyOutputName').value||'fusion.pdf').trim().replace(/[^a-zA-Z0-9._ -]+/g,'_');
 const sources=await engine.mergePdfBytes(entries,{fileName:/\.pdf$/i.test(name)?name:name+'.pdf'});
 cryptoSignatureState=null;activeFileCapabilities={family:'pdf',extension:'pdf'};fileBrowser.activeId=null;fileBrowser.render();await renderAll();
 setStatus('Fusion créée : '+engine.fileName+' · '+engine.pageCount+' pages');
 recordHistory({studio:'pdf-studio',type:'action',label:'Fusion PDF',detail:sources.map(x=>x.name+' ('+x.pages+' p.)').join(' + '),target:engine.fileName,action:'assemblePdf',repeatable:false})
}
async function insertAssemblyPdf(){
 assertPdfMutationAllowed();if(!engine.pageCount)throw new Error('Chargez d’abord le PDF de destination.');if(!assemblyInsertFile)throw new Error('Choisissez un PDF à insérer.');
 await checkpoint();const r=await engine.insertPdfFile(assemblyInsertFile,{position:$('#assemblyInsertPosition').value});markPdfModifiedAfterSignature();await renderAll();
 setStatus(assemblyInsertFile.name+' inséré · '+r.count+' page(s)');
 recordHistory({studio:'pdf-studio',type:'action',label:'PDF inséré',detail:r.count+' page(s) · position '+$('#assemblyInsertPosition').value,target:engine.fileName,action:'assemblePdf',repeatable:false})
}
async function extractSelectedPages(){
 if(!engine.pageCount)return;const pages=engine.selected.size?[...engine.selected]:[engine.currentPage],bytes=await engine.extractPages(pages),stem=(engine.fileName||'document').replace(/\.pdf$/i,'');
 const name=stem+'_extrait_'+pages.join('-')+'.pdf';await output.saveBlob(new Blob([bytes],{type:'application/pdf'}),name,{parts:[]});setStatus('Pages extraites : '+name);
 recordHistory({studio:'pdf-studio',type:'action',label:'Pages extraites',detail:pages.join(', '),target:name,action:'extractPages',repeatable:false})
}
async function currentBlob(){return new Blob([await engine.baseBytes()],{type:'application/pdf'})}
async function saveCurrent({classify=false,forcePicker=false}={}){
 if(!engine.pageCount)return;const format=$('#outputFormat').value;if(format==='zip')return saveZip({classify});
 let blob,name;if(format==='same'&&engine.sourceFile){blob=engine.sourceFile;name=outputName('.'+(formatInfo(engine.sourceFile).extension||'bin'))}else{blob=await currentBlob();name=outputName('.pdf')}
 if(forcePicker&&window.showSaveFilePicker){const h=await showSaveFilePicker({suggestedName:name,types:[{description:'Document',accept:{[blob.type||'application/octet-stream']:['.'+(name.split('.').pop()||'pdf')]}}]}),w=await h.createWritable();await w.write(blob);await w.close()}
 else{if($('#outputProvider').value==='local'&&!output.handle)await output.chooseDirectory();await output.saveBlob(blob,name,{parts:classify?outputParts():[]})}
 setStatus('Enregistré : '+name);recordHistory({studio:'pdf-studio',type:'action',label:classify?'Enregistrer + classer':'Enregistrer',detail:(classify?outputParts().join('/'):'')||'racine',target:name,action:'savePdf',repeatable:true})
}
async function saveZip({classify=false}={}){if(!engine.pageCount)return;const pdf=await engine.baseBytes(),pdfName=outputName('.pdf'),zipName=outputName('.zip');if($('#outputProvider').value==='local'&&!output.handle)await output.chooseDirectory();const old=output.handle;if($('#outputProvider').value!=='local')output.handle=null;await output.saveZip([{name:pdfName,data:pdf}],zipName,{parts:classify?outputParts():[]});output.handle=old;setStatus('ZIP enregistré : '+zipName);recordHistory({studio:'pdf-studio',type:'action',label:classify?'ZIP enregistré + classé':'ZIP enregistré',detail:classify?outputParts().join('/'):'',target:zipName})}

$('#pickFile').onclick=()=>$('#fileInput').click();
$('#fileInput').onchange=async e=>{const files=e.target.files||[];if(files.length){activeInputLocation={kind:'files',label:files.length===1?files[0].name:files.length+' fichiers'};setValidatedButton($('#pickFile'),true,activeInputLocation.label);setValidatedButton($('#pickFolder'),false);await loadFiles(files)}};
async function chooseInputDirectory(){
 if(window.showDirectoryPicker){
  const handle=await showDirectoryPicker({mode:'read'}),files=await collectDirectoryHandle(handle,{recursive:$('#recursiveFolders').checked});
  activeInputLocation=await rememberLocation('input',handle,{label:handle.name,path:handle.name});setValidatedButton($('#pickFolder'),true,'Dossier validé : '+handle.name);setValidatedButton($('#pickFile'),false);renderRecentLocationSelects();await loadFiles(files);return
 }
 $('#folderInput').click()
}
$('#pickFolder').onclick=()=>chooseInputDirectory().catch(e=>setStatus(e.message));
$('#folderInput').onchange=async e=>{const files=e.target.files||[];if(files.length){const root=files[0].webkitRelativePath?.split('/')[0]||'Dossier';activeInputLocation={kind:'folder',label:root};setValidatedButton($('#pickFolder'),true,'Dossier validé : '+root);setValidatedButton($('#pickFile'),false);await loadFiles(files)}};
mountDropZone($('#inputDropZone'),{onFiles:async files=>{if(files.length){activeInputLocation={kind:'drop',label:files.length+' élément(s) déposé(s)'};$('#inputDropZone').classList.add('validatedDropZone');await loadFiles(files)}}});
$('#loadRecentInput').onclick=async()=>{const id=$('#recentInputSelect').value;if(!id)return;try{const {item,handle}=await resolveRecentLocation('input',id,{mode:'read'}),files=await collectDirectoryHandle(handle,{recursive:$('#recursiveFolders').checked});activeInputLocation=item;setValidatedButton($('#pickFolder'),true,'Entrée récente : '+item.label);setValidatedButton($('#pickFile'),false);await loadFiles(files);setStatus('Entrée récente chargée : '+item.label)}catch(e){setStatus(e.message)}};
$('#pickOutputFolder').onclick=async()=>{try{const h=await output.chooseDirectory();activeOutputLocation=await rememberLocation('output',h,{label:h.name,path:h.name});$('#outputProvider').value='local';setValidatedButton($('#pickOutputFolder'),true,'Dossier de sortie validé : '+h.name);renderRecentLocationSelects();updateOutputPreview();setStatus('Dossier de sortie : '+h.name)}catch(e){setStatus(e.message)}};
$('#loadRecentOutput').onclick=async()=>{const id=$('#recentOutputSelect').value;if(!id)return;try{const {item,handle}=await resolveRecentLocation('output',id,{mode:'readwrite'});output.handle=handle;activeOutputLocation=item;$('#outputProvider').value='local';setValidatedButton($('#pickOutputFolder'),true,'Sortie récente : '+item.label);updateOutputPreview();setStatus('Sortie récente chargée : '+item.label)}catch(e){setStatus(e.message)}};
$('#savePdfSide').onclick=()=>saveCurrent();$('#saveZipSide').onclick=saveZip;$('#saveAndClassify').onclick=()=>saveCurrent({classify:true});$('#saveAs').onclick=()=>saveCurrent({forcePicker:true});
$('[data-assembly-mode]').forEach(b=>b.onclick=()=>{const mode=b.dataset.assemblyMode;$('[data-assembly-mode]').forEach(x=>x.classList.toggle('active',x===b));$('#assemblyMergePanel').hidden=mode!=='merge';$('#assemblyInsertPanel').hidden=mode!=='insert'});
$('#assemblyUseSelection').onclick=fillAssemblyFromSelection;$('#assemblyMoveUp').onclick=()=>moveAssemblyItem(-1);$('#assemblyMoveDown').onclick=()=>moveAssemblyItem(1);
$('#assemblyRemove').onclick=()=>{if(assemblySelectedIndex<0)return;assemblyItems.splice(assemblySelectedIndex,1);assemblySelectedIndex=Math.min(assemblySelectedIndex,assemblyItems.length-1);renderAssemblyList()};
$('#assemblyMergeNow').onclick=()=>mergeAssemblySelection().catch(e=>setStatus(e.message));
$('#assemblyPickInsertPdf').onclick=()=>$('#assemblyInsertFile').click();
$('#assemblyInsertFile').onchange=e=>{assemblyInsertFile=e.target.files?.[0]||null;$('#assemblyInsertFileName').textContent=assemblyInsertFile?.name||'Aucun fichier'};
$('#assemblyInsertNow').onclick=()=>insertAssemblyPdf().catch(e=>setStatus(e.message));
renderAssemblyList();
mountDropZone($('#assemblyList'),{onFiles:async files=>{const pdfs=[...files].filter(f=>/\.pdf$/i.test(f.name)||f.type==='application/pdf');if(!pdfs.length)return;for(const file of pdfs)assemblyItems.push({id:'drop-'+Date.now()+'-'+Math.random().toString(16).slice(2),name:file.name,file,size:file.size,isCurrent:false});assemblySelectedIndex=assemblyItems.length-1;renderAssemblyList();setStatus(pdfs.length+' PDF ajouté(s) à la fusion par glisser-déposer.')}});

function goPage(p){if(!engine.pageCount)return;engine.selectPage(p);session.setPage(engine.currentPage);syncViewerMeta()}
$('#firstPage').onclick=()=>goPage(1);$('#prevPage').onclick=()=>goPage(engine.currentPage-1);$('#nextPage').onclick=()=>goPage(engine.currentPage+1);$('#lastPage').onclick=()=>goPage(engine.pageCount);$('#pageNumberInput').addEventListener('change',()=>goPage(Number($('#pageNumberInput').value)||1));
$('#zoomOut').onclick=async()=>{viewer.setPagesPerRow(1);viewer.setZoom(viewer.zoom-.1);await viewer.renderMain();syncViewerMeta()};$('#zoomIn').onclick=async()=>{viewer.setPagesPerRow(1);viewer.setZoom(viewer.zoom+.1);await viewer.renderMain();syncViewerMeta()};$('#zoomInput').addEventListener('change',async()=>{viewer.setPagesPerRow(1);viewer.setZoom(Number($('#zoomInput').value)/100);await viewer.renderMain();syncViewerMeta()});$('#fitWidth').onclick=async()=>{viewer.setPagesPerRow(1);viewer.setZoom(viewer.fitScale($('#canvasStage'),1));await viewer.renderMain();syncViewerMeta()};$('#pagesPerRow').addEventListener('change',async()=>{viewer.setPagesPerRow($('#pagesPerRow').value);await viewer.renderMain();syncViewerMeta()});
$('#previewColumns').addEventListener('change',async()=>{viewer.setPreviewColumns($('#previewColumns').value);await viewer.renderPreview();syncViewerMeta()});
const setPreviewZoom=async v=>{viewer.setPreviewScale(v);await viewer.renderPreview();syncViewerMeta()};$('#previewZoom').addEventListener('input',()=>setPreviewZoom(Number($('#previewZoom').value)/100));$('#previewZoomOut').onclick=()=>setPreviewZoom(viewer.previewScale-.02);$('#previewZoomIn').onclick=()=>setPreviewZoom(viewer.previewScale+.02);
$('#previewSelectAll').onclick=async()=>{engine.selectAll();session.selectedPages=new Set(engine.selected);await viewer.renderPreview();syncViewerMeta()};$('#previewSelectNone').onclick=async()=>{engine.selectNone();session.selectedPages.clear();await viewer.renderPreview();syncViewerMeta()};$('#previewAddPage').onclick=addPage;$('#previewDeleteSelected').onclick=deleteSelected;$('#previewRotateLeft').onclick=()=>rotate(-90);$('#previewRotateRight').onclick=()=>rotate(90);
$('#history-undo').onclick=undo;$('#history-redo').onclick=redo;$('#history-view-all-inline').onclick=()=>activateSidebarTab('history');$('[data-open-core-settings]').onclick=()=>$('#studioCoreSettings')?.click();$('#sidebar-open-workflows').onclick=()=>document.dispatchEvent(new Event('studio-v2:open-workflows'));

function activateSidebarTab(tab){$$('[data-sidebar-tab]').forEach(x=>x.classList.toggle('active',x.dataset.sidebarTab===tab));$$('[data-sidebar-pane]').forEach(x=>{const on=x.dataset.sidebarPane===tab;x.hidden=!on;x.classList.toggle('active',on)})}
$$('[data-sidebar-tab]').forEach(b=>b.onclick=()=>activateSidebarTab(b.dataset.sidebarTab));$('#sidebar-collapse-all').onclick=()=>$$('#sidebar-pane-tools details').forEach(x=>x.open=false);$('#sidebar-expand-all').onclick=()=>$$('#sidebar-pane-tools details').forEach(x=>x.open=true);
$('#sidebarModeQuick').value=loadStudioSettings().sidebarMode||'normal';$('#sidebarModeQuick').addEventListener('change',()=>saveStudioSettings({sidebarMode:$('#sidebarModeQuick').value}));
const resizer=$('#sidebarResizer');let resizing=false;resizer.addEventListener('pointerdown',e=>{resizing=true;resizeWidth=loadStudioSettings().sidebarWidth;resizer.setPointerCapture(e.pointerId)});resizer.addEventListener('pointermove',e=>{if(!resizing)return;resizeWidth=Math.max(220,Math.min(720,e.clientX-10));document.body.style.setProperty('--studio-sidebar-width',resizeWidth+'px')});resizer.addEventListener('pointerup',()=>{resizing=false;if(resizeWidth)saveStudioSettings({sidebarWidth:resizeWidth})});

function showHelp(action,element=null){const base=findFeature(studioManifest,action)||{featureId:'pdf.unknown.'+action,label:action,scope:'pdf',plugin:'pdf-studio',status:'development',capability:'',help:{summary:'Fonction déclarée dans la base de convergence.',details:'La fonction reste visible pendant son raccordement au moteur correspondant.'}};lastFeature={...base,uiId:element?.dataset?.uiId||element?.id||base.uiId};renderFeatureHelp($('#helpContent'),lastFeature);activateSidebarTab('properties');$('#activeToolProperties').innerHTML='<b>'+lastFeature.label+'</b><br><code>'+lastFeature.featureId+'</code><br>'+String(lastFeature.help?.summary||'')}
$('#detachHelp').onclick=()=>{let p=$('#floatingHelpWindow');if(!p){p=document.createElement('div');p.id='floatingHelpWindow';p.className='studioWindow floatingHelpWindow';p.hidden=true;document.body.append(p);enhanceStudioWindow(p,{key:'help',title:'Aide contextuelle'})}p.hidden=false;renderFeatureHelp(p,lastFeature||{label:'PDF Studio',help:{summary:'Aide contextuelle'}})};
function openAdvancedStudio(id){createStudioContext({sourceStudio:'pdf-studio',targetStudio:id,capability:id,fileName:engine.fileName,page:engine.currentPage,selectedPages:[...engine.selected],returnTarget:location.href});const u=new URL(studioManifest.studiosHref,location.href);u.searchParams.set('target',id);u.searchParams.set('return','pdf-studio');location.href=u.href}
$$('[data-advanced-studio]').forEach(b=>b.onclick=()=>openAdvancedStudio(b.dataset.advancedStudio));document.addEventListener('click',e=>{const b=e.target.closest('[data-studio-action]');if(b&&!b.closest('.studioRibbon'))document.dispatchEvent(new CustomEvent('studio-v2:action',{detail:{action:b.dataset.studioAction,source:'sidebar',element:b}}))});

document.addEventListener('studio-v2:action',e=>{const a=e.detail.action;if(a==='openPdf')$('#pickFile').click();else if(a==='openFolder')$('#pickFolder').click();else if(a==='prevFile')$('#filePrev').click();else if(a==='nextFile')$('#fileNext').click();else if(a==='savePdf')saveCurrent();else if(a==='saveZip')saveZip();else if(a==='classifyPdf'){activateSidebarTab('tools');$('#sectionOutput').open=true;$('#sectionOutput').scrollIntoView({block:'nearest'})}else if(a==='rotateLeft')rotate(-90);else if(a==='rotateRight')rotate(90);else if(a==='addPage')addPage();else if(a==='duplicatePage')duplicatePage();else if(a==='deletePage')deletePages();else if(a==='extractPages')extractSelectedPages();else if(a==='assemblePdf'){activateSidebarTab('tools');$('#sectionAssembly').open=true;$('#sectionAssembly').scrollIntoView({block:'nearest'});fillAssemblyFromSelection();}else if(a==='undo')undo();else if(a==='redo')redo();else if(a==='signature'){activateSidebarTab('tools');$('#sectionSignature').open=true;$('#sectionSignature').scrollIntoView({block:'nearest'});setSignatureMode('visual')}else if(a==='history')activateSidebarTab('history');else if(a==='commands')document.dispatchEvent(new Event('studio-v2:open-command-palette'));else if(a==='workflows')document.dispatchEvent(new Event('studio-v2:open-workflows'));else showHelp(a,e.detail.element||null)});
document.addEventListener('studio-v2:menu',e=>{if(e.detail.tab==='help')activateSidebarTab('properties');if(e.detail.tab==='history')activateSidebarTab('history');if(e.detail.tab==='view')$('#studioVisibilityOpen')?.click();if(e.detail.tab==='file')$('#sectionInput').open=true});
document.addEventListener('studio-v2:repeat-action',e=>{const a=e.detail?.action;if(a==='rotateLeft')rotate(-90);else if(a==='rotateRight')rotate(90);else if(a==='addPage')addPage();else if(a==='duplicatePage')duplicatePage();else if(a==='savePdf')saveCurrent();else showHelp(a||'history')});
registerPipelineHandler('rotateLeft',async()=>{await rotate(-90);return engine});registerPipelineHandler('rotateRight',async()=>{await rotate(90);return engine});registerPipelineHandler('addPage',async()=>{await addPage();return engine});registerPipelineHandler('duplicatePage',async()=>{await duplicatePage();return engine});registerPipelineHandler('savePdf',async()=>{await saveCurrent();return engine});
document.addEventListener('studio-v2:workflow-run',async e=>{const steps=(e.detail?.steps||[]).map(action=>({capability:action}));if(!steps.length)return;try{await runPipeline({steps,context:{input:engine,studio:'pdf-studio',fileName:engine.fileName},onProgress:x=>setStatus('Workflow '+(x.index+1)+'/'+x.total+' · '+x.capability)})}catch(err){setStatus('Workflow interrompu : '+err.message)}});

$('#copyDiagnostics').onclick=async()=>{const tests=runCapabilitySelfTests({manifest:studioManifest,root:document}),info={studio:'pdf-studio',version:runtimeVersion.studioVersion,coreVersion:runtimeVersion.coreVersion,documentSession:session.snapshot(),file:engine.fileName,pages:engine.pageCount,currentPage:engine.currentPage,selectedPages:[...engine.selected],fileCollection:{count:fileBrowser.items.length,selected:fileBrowser.selected.size,view:fileBrowser.view,sort:fileBrowser.sortMode,groupBy:fileBrowser.groupBy},pagesPerRow:viewer.pagesPerRow,zoom:viewer.zoom,previewScale:viewer.previewScale,previewColumns:viewer.previewColumns,fileCapabilities:activeFileCapabilities,capabilityTests:tests,userAgent:navigator.userAgent};await navigator.clipboard?.writeText(JSON.stringify(info,null,2));setStatus('Diagnostic copié')};
updateNamingPreview();updateOutputPreview();setStatus('PDF Studio '+runtimeVersion.studioStatus+' v'+runtimeVersion.studioVersion+' · Studio Core v'+runtimeVersion.coreVersion+' prêt');
