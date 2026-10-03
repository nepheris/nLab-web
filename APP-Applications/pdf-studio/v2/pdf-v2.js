import{mountStudioV2}from'../../_shared/studio-v2/frame.js';
import{setStatus}from'../../_shared/studio-v2/core.js';
import studioManifest from'./studio-manifest.js';
import{findFeature,renderFeatureHelp,renderHelpCatalog,listManifestFeatures}from'../../_shared/studio-v2/help.js';
import{PDFEngine}from'../v1/pdf-engine.js';
import{recordHistory,loadHistory}from'../../_shared/studio-v2/history.js';
import{StudioPageViewer}from'../../_shared/studio-v2/page-viewer.js';
import{createStudioContext}from'../../_shared/studio-v2/studio-context.js';
import{detectFileCapabilities}from'../../_shared/studio-v2/file-capabilities.js';
import{registerPipelineHandler,runPipeline}from'../../_shared/studio-v2/pipeline-service.js';
import{runCapabilitySelfTests}from'../../_shared/studio-v2/capability-tests.js';
import{DocumentSession}from'../../_shared/studio-v2/document-session.js';
import{CollectionBrowser}from'../../_shared/studio-v2/collection-browser.js';
import{mountDropZone,collectDirectoryHandle,mountSortableList}from'../../_shared/studio-v2/drop-zone.js';
import{loadStudioSettings,saveStudioSettings}from'../../_shared/studio-v2/settings.js';
import{mountSteppedPresetControl}from'../../_shared/studio-v2/stepped-preset-control.js';
import{mountAssetPicker}from'../../_shared/studio-v2/asset-picker.js';
import{bindColorHexControl}from'../../_shared/studio-v2/color-control.js';
import{lightweightThumbnail}from'../../_shared/studio-v2/thumbnail-service.js';
import{renderMarkdownFilePreview,renderPlainTextPreview}from'../../_shared/studio-v2/file-preview-service.js';
import{TemplateEngine,templateVariableHelp}from'../../_shared/studio-v2/template-engine.js';
import{OutputService}from'../../_shared/studio-v2/output-service.js';
import{acceptAttribute,isSupportedFile,formatInfo}from'../../_shared/studio-v2/format-registry.js';
import{enhanceStudioWindow}from'../../_shared/studio-v2/window-system.js';
import{mountPersonalProfileUI}from'../../_shared/studio-v2/personal-profile-ui.js';
import{loadPersonalProfile,updatePersonalProfile,profileTemplateValues,getPersonalAsset,putPersonalAsset,addPersonalAssetRef,listPersonalTemplates,savePersonalTemplate,removePersonalTemplate}from'../../_shared/studio-v2/personal-profile-service.js';
import{listRecentLocations,rememberLocation,resolveRecentLocation}from'../../_shared/studio-v2/recent-locations-service.js';
import{resolveStudioVersions,applyVersionDocumentMeta}from'../../_shared/studio-v2/version-service.js';
import{PdfSignatureService}from'./signature-service.js';
import{PdfSecurityService}from'./pdf-security-service.js';
import{PDFTools}from'../v1/pdf-tools.js';
import{AdvancedPDFTools}from'../v1/advanced-tools.js';
import{PdfObjectLayer}from'./object-layer.js';
import{DriveService}from'../../_shared/studio-v2/drive-service.js';
import{DocumentConversion}from'./document-conversion.js';

const runtimeVersion=await resolveStudioVersions({versionsHref:'../versions.json',coreVersionHref:'../../_shared/studio-v2/version.json',channel:'test'});
applyVersionDocumentMeta({studioName:studioManifest.name,studioVersion:runtimeVersion.studioVersion,studioStatus:runtimeVersion.studioStatus,coreVersion:runtimeVersion.coreVersion});
await mountStudioV2({manifest:studioManifest,versionInfo:{version:runtimeVersion.studioVersion,status:runtimeVersion.studioStatus,coreVersion:runtimeVersion.coreVersion}});
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
let personalProfile=loadPersonalProfile();
const engine=new PDFEngine(),session=new DocumentSession(),templates=new TemplateEngine(profileTemplateValues(personalProfile)),output=new OutputService(),signatureService=new PdfSignatureService(),securityService=new PdfSecurityService(),drive=new DriveService({storageKey:'nlab-pdf-studio-v2-google'});
let objectLayer=null;
const annotationBridge={exportBytes:()=>objectLayer?.hasObjects()?objectLayer.exportBytes():engine.baseBytes()};const pdfTools=new PDFTools({engine,annotations:annotationBridge,variables:templates}),advancedTools=new AdvancedPDFTools({engine,annotations:annotationBridge,variables:templates}),documentConversion=new DocumentConversion({engine,workspace:null,variables:templates});
let undoStack=[],redoStack=[],loadedFiles=[],activeFileCapabilities=null,lastFeature=null,resizeWidth=null,cryptoSignatureState=null,assemblyItems=[],assemblySelectedIndex=-1,assemblyInsertFile=null;
let activeInputLocation=null,activeInputHandle=null,activeOutputLocation=null,driveOutputFolder=null,archiveWorkspace=null,assemblySortUnmount=null,zipCompressionControl=null,redactionRasterControl=null,optDpiControl=null,optJpegControl=null,objectOpacityControl=null,objectPenWidthControl=null,signatureWidthControl=null,signatureOpacityControl=null,codeSizeControl=null,objectAssetPicker=null,stampAssetPicker=null;
function setValidatedButton(el,on,label=''){if(!el)return;el.classList.toggle('validatedChoice',!!on);el.setAttribute('aria-pressed',on?'true':'false');if(label)el.title=label}
function renderDriveState(){
 const st=drive.state(),box=$('#googleDriveStatus');if(box)box.textContent=st.connected?'Google Drive connecté'+(st.user?.email?' · '+st.user.email:'')+(driveOutputFolder?.name?' · sortie : '+driveOutputFolder.name:''):'Google Drive non connecté.';
 if($('#googleClientId'))$('#googleClientId').value=st.config?.clientId||'';if($('#googleApiKey'))$('#googleApiKey').value=st.config?.apiKey||'';if($('#googleAppId'))$('#googleAppId').value=st.config?.appId||''
}
function migrateLegacyPdfConfig(raw){
 const src=raw&&typeof raw==='object'?raw:{},report=[];
 const legacyStamps=Array.isArray(src.stamps)?src.stamps:(Array.isArray(src.stamps?.stamps)?src.stamps.stamps:(Array.isArray(src.stamps?.library)?src.stamps.library:[]));
 personalProfile=updatePersonalProfile(p=>{
  const op=src.operator||src.profile||src.identity||{};p.identity=p.identity||{};p.variables=p.variables||{};
  if(op.initials){p.identity.initials=String(op.initials);p.variables.INITIALS=String(op.initials);report.push('initiales')}
  if(op.name||op.displayName){p.identity.displayName=String(op.displayName||op.name);p.variables.DISPLAY_NAME=p.identity.displayName;report.push('identité')}
  p.preferences=p.preferences||{};p.preferences.studios=p.preferences.studios||{};const pref=p.preferences.studios['pdf-studio']||{},out=src.output||src.workspaceDefaults?.output||{};
  pref.naming=pref.naming||{};pref.output=pref.output||{};
  if(out.filenameTemplate){pref.naming.template=String(out.filenameTemplate).replace(/\{YYYY\}/g,'{YEAR}').replace(/\{MM\}/g,'{MONTH}');report.push('nommage')}
  if(out.archivePattern){pref.output.structure='custom';pref.output.pathTemplate=String(out.archivePattern).replace(/\{YYYY\}/g,'{YEAR}').replace(/\{MM\}/g,'{MONTH}').replace(/\{WW\}/g,'{WEEK}');report.push('classement')}
  if(out.operationFolder)p.variables.TREATMENT=String(out.operationFolder);
  p.preferences.studios['pdf-studio']=pref;
  p.templates=p.templates||{};p.templates.stamps=Array.isArray(p.templates.stamps)?p.templates.stamps:[];
  for(const x of legacyStamps){const item=normalizeStampItem({...x,id:String(x.id||'').startsWith('user-stamp-')?x.id:'user-stamp-legacy-'+(x.id||Math.random().toString(16).slice(2)),system:false});const i=p.templates.stamps.findIndex(y=>y.id===item.id);if(i>=0)p.templates.stamps[i]=item;else p.templates.stamps.push(item)}
  if(legacyStamps.length)report.push(legacyStamps.length+' tampon(s)');
  return p
 });
 const google=src.auth?.google||src.google||{};if(google.clientId){drive.configure({clientId:String(google.clientId)});report.push('Google OAuth')}
 return report
}
function saveDriveConfig(){
 drive.configure({clientId:$('#googleClientId')?.value.trim()||'',apiKey:$('#googleApiKey')?.value.trim()||'',appId:$('#googleAppId')?.value.trim()||''});renderDriveState();setStatus('Configuration Google Drive enregistrée localement.')
}
async function connectDrive(){saveDriveConfig();await drive.connect();renderDriveState();setStatus('Google Drive connecté.')}
async function fetchRemoteFile(url){
 const u=new URL(url,location.href);if(!/^https?:$/.test(u.protocol))throw new Error('Seules les URL HTTP/HTTPS sont acceptées.');
 const r=await fetch(u.href,{mode:'cors',credentials:'omit'});if(!r.ok)throw new Error('Téléchargement distant impossible : HTTP '+r.status);
 const blob=await r.blob(),cd=r.headers.get('content-disposition')||'',m=/filename\*?=(?:UTF-8''|")?([^";]+)/i.exec(cd),raw=m?decodeURIComponent(m[1].replace(/"/g,'')):u.pathname.split('/').filter(Boolean).pop()||'document.pdf',name=raw.includes('.')?raw:(raw+'.pdf');
 return new File([blob],name,{type:blob.type||(/\.pdf$/i.test(name)?'application/pdf':'application/octet-stream')})
}
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

function escHtml(s){return String(s??'').replace(/[&<>"]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[m]))}
function todayValue(){return new Date().toISOString().slice(0,10)}
function allPersonalImageRefs(){
 const p=loadPersonalProfile(),a=p.assets||{};
 return[
  ...(a.signatures||[]).map(x=>({...x,group:'Signatures'})),
  ...(a.initialsImages||[]).map(x=>({...x,group:'Paraphes'})),
  ...(a.logos||[]).map(x=>({...x,group:'Logos'})),
  ...(a.stampImages||[]).map(x=>({...x,group:'Images de tampons'})),
  ...(a.personalImages||[]).map(x=>({...x,group:'Images personnelles'}))
 ]
}
function renderObjectAssetSelectors(){
 const refs=allPersonalImageRefs();
 for(const id of ['objectImageAsset','stampImageAsset']){
  const sel=$('#'+id);if(!sel)continue;const current=sel.value;
  const groups=new Map();for(const r of refs){if(!groups.has(r.group))groups.set(r.group,[]);groups.get(r.group).push(r)}
  sel.innerHTML='<option value="">'+(id==='stampImageAsset'?'Aucune image':'Choisir dans la bibliothèque…')+'</option>'+[...groups].map(([g,list])=>'<optgroup label="'+escHtml(g)+'">'+list.map(r=>'<option value="'+escHtml(r.assetId)+'">'+escHtml(r.label||r.name||r.assetId)+'</option>').join('')+'</optgroup>').join('');
  if([...sel.options].some(o=>o.value===current))sel.value=current
 }
}
function renderStampPresets(){
 const sel=$('#stampPresetSelect');if(!sel)return;const items=listPersonalTemplates('stamps'),current=sel.value,groups=new Map();
 for(const x of items){const g=x.category||'Autres';if(!groups.has(g))groups.set(g,[]);groups.get(g).push(x)}
 sel.innerHTML='<option value="">Personnalisé</option>'+[...groups].map(([g,list])=>'<optgroup label="'+escHtml(g)+'">'+list.map(x=>'<option value="'+escHtml(x.id)+'">'+escHtml(x.label||x.id)+'</option>').join('')+'</optgroup>').join('');
 if(items.some(x=>x.id===current))sel.value=current
}
function selectedStampTemplate(){return listPersonalTemplates('stamps').find(x=>x.id===$('#stampPresetSelect')?.value)||null}
function normalizeStampItem(x={}){
 return{id:String(x.id||('user-stamp-'+Date.now()+'-'+Math.random().toString(16).slice(2))),label:String(x.label||x.name||'Tampon importé'),category:String(x.category||'Personnalisés'),template:String(x.template||x.text||''),imageAssetId:String(x.imageAssetId||''),prefix:String(x.prefix||''),suffix:String(x.suffix||''),prefixEnabled:!!x.prefixEnabled,suffixEnabled:!!x.suffixEnabled,system:false}
}
function fillStampEditor(item=null){
 item=item||{label:'',category:'Personnalisés',template:$('#stampTemplate')?.value||'',imageAssetId:$('#stampImageAsset')?.value||'',prefix:'',suffix:'',prefixEnabled:false,suffixEnabled:false};
 $('#stampEditorLabel').value=item.label||'';$('#stampEditorCategory').value=item.category||'Personnalisés';$('#stampEditorTemplate').value=item.template||'';$('#stampEditorPrefix').value=item.prefix||'';$('#stampEditorSuffix').value=item.suffix||'';$('#stampEditorPrefixEnabled').checked=!!item.prefixEnabled;$('#stampEditorSuffixEnabled').checked=!!item.suffixEnabled;$('#stampEditorImageAsset').value=item.imageAssetId||'';refreshStampEditorPreview()
}
function stampEditorItem({copy=false}={}){
 const current=selectedStampTemplate(),editable=current&&String(current.id).startsWith('user-stamp-')&&!copy;
 return normalizeStampItem({id:editable?current.id:('user-stamp-'+Date.now()),label:$('#stampEditorLabel').value.trim()||'Tampon personnalisé',category:$('#stampEditorCategory').value.trim()||'Personnalisés',template:$('#stampEditorTemplate').value||'',imageAssetId:$('#stampEditorImageAsset').value||'',prefix:$('#stampEditorPrefix').value||'',suffix:$('#stampEditorSuffix').value||'',prefixEnabled:$('#stampEditorPrefixEnabled').checked,suffixEnabled:$('#stampEditorSuffixEnabled').checked})
}
function refreshStampEditorPreview(){
 if(!$('#stampEditorPreview'))return;syncStampDates();const tpl=$('#stampEditorTemplate').value||'',ctx=outputContext(),resolved=templates.resolve(tpl,engine.fileName,ctx);$('#stampEditorPreview').textContent=resolved||'—';
 const prefix=$('#stampEditorPrefixEnabled').checked?templates.resolve($('#stampEditorPrefix').value||'',engine.fileName,ctx):'',suffix=$('#stampEditorSuffixEnabled').checked?templates.resolve($('#stampEditorSuffix').value||'',engine.fileName,ctx):'';
 const base=(engine.fileName||'document.pdf').replace(/\.pdf$/i,'');$('#stampEditorFilenamePreview').textContent=(prefix||'')+base+(suffix||'')+'.pdf'
}
function downloadJson(data,name){const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json;charset=utf-8'}),a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(a.href),1000)}
function syncStampDates(){
 const values={STAMP_DATE:$('#stampDate')?.value||todayValue(),DATE_A:$('#stampDateA')?.value||todayValue(),DATE_B:$('#stampDateB')?.value||todayValue(),DATE_C:$('#stampDateC')?.value||todayValue(),DATE_D:$('#stampDateD')?.value||todayValue()};
 templates.setValues(values);return values
}
async function stampImageData(){
 const id=$('#stampImageAsset')?.value;if(!id)return null;const a=await getPersonalAsset(id);if(!a?.blob)throw new Error('Image du tampon indisponible.');
 return objectLayer.setImageBlob(a.blob,'image')
}
async function refreshStampPreview(){
 if(!$('#stampPreview'))return;syncStampDates();const text=templates.resolve($('#stampTemplate').value||'',engine.fileName,outputContext());$('#stampPreview').textContent=text||'—';
 const id=$('#stampImageAsset')?.value,box=$('#stampImagePreview');if(!box)return;if(!id){box.innerHTML='<span>Aucune image</span>';return}
 const a=await getPersonalAsset(id);if(!a?.blob){box.innerHTML='<span>Image indisponible</span>';return}
 const data=await objectLayer.setImageBlob(a.blob,'image');box.innerHTML='<img src="'+data+'" alt="Aperçu image tampon">'
}
function activateObjectTool(tool){
 assertPdfMutationAllowed();if(!engine.pageCount){setStatus('Chargez un PDF.');return}
 objectLayer.setText($('#objectText')?.value||'Texte');objectLayer.setStyle({color:$('#objectColor')?.value||'#316D9A',fontSize:Number($('#objectFontSize')?.value)||12,opacity:(Number($('#objectOpacity')?.value)||100)/100,penWidth:Number($('#objectPenWidth')?.value)||2});
 objectLayer.setTool(tool);$$('[data-object-tool]').forEach(b=>b.classList.toggle('active',b.dataset.objectTool===tool));setStatus(tool==='select'?'Mode sélection des objets.':'Cliquez dans la page pour placer/utiliser : '+tool)
}


mountPersonalProfileUI($('#personalProfileHost'));
stampAssetPicker=mountAssetPicker($('#stampAssetPickerHost'),{kinds:['logo','stamp-image','personal-image'],allowNone:true,labelNone:'Aucune image'});
objectAssetPicker=mountAssetPicker($('#objectAssetPickerHost'),{kinds:['logo','stamp-image','personal-image','signature','initials'],allowNone:false});
const signatureAssetPicker=mountAssetPicker($('#signatureAssetPickerHost'),{kinds:['signature','initials'],allowNone:false});
stampAssetPicker?.addEventListener('change',e=>{const id=e.detail.assetId||'';$('#stampImageAsset').value=id;refreshStampPreview().catch(err=>setStatus(err.message))});
objectAssetPicker?.addEventListener('change',async e=>{const id=e.detail.assetId;if(!id)return;try{const a=await getPersonalAsset(id);if(!a?.blob)throw new Error('Image indisponible');await objectLayer.setImageBlob(a.blob,'image');$('#objectImageAsset').value=id;$('#objectImageName').textContent=e.detail.ref?.label||a.name;activateObjectTool('image')}catch(err){setStatus(err.message)}});
signatureAssetPicker?.addEventListener('change',e=>{const {assetId,kind}=e.detail;if(kind==='initials')$('#signatureAppearanceType').value='initials';else if(kind==='signature')$('#signatureAppearanceType').value='signature';refreshSignatureAssets().then(()=>{$('#signatureAssetSelect').value=assetId;refreshSignaturePreview()}).catch(err=>setStatus(err.message))});
$('#fileInput').accept=acceptAttribute();
const fileBrowser=new CollectionBrowser({host:$('#fileCollection'),view:'list',key:'pdf-files',getThumbnail:item=>lightweightThumbnail(item.data)});
fileBrowser.addEventListener('activate',e=>{const file=e.detail?.data;if(file)load(file)});
fileBrowser.addEventListener('selection',()=>{syncViewerMeta();const count=fileBrowser.selectedItems().filter(x=>formatInfo(x.data).family==='pdf').length;if($('#assemblySelectionCount'))$('#assemblySelectionCount').textContent=count+' PDF sélectionné(s)'});
$('#fileCollectionView').value=fileBrowser.view;$('#fileSort').value=fileBrowser.sortMode;$('#fileGroupBy').value=fileBrowser.groupBy;
$('#fileCollectionView').addEventListener('change',()=>fileBrowser.setView($('#fileCollectionView').value));
$('#fileSort').addEventListener('change',()=>fileBrowser.setSort($('#fileSort').value,fileBrowser.sortDirection));
$('#fileSortDirection').onclick=()=>{fileBrowser.setSort(fileBrowser.sortMode,-fileBrowser.sortDirection);$('#fileSortDirection').textContent=fileBrowser.sortDirection>0?'↑':'↓'};
$('#fileGroupBy').addEventListener('change',()=>fileBrowser.setGroupBy($('#fileGroupBy').value));
$('#fileGroupsCollapse').onclick=()=>fileBrowser.collapseGroups();$('#fileGroupsExpand').onclick=()=>fileBrowser.expandGroups();
const thumbSize=loadStudioSettings().collectionThumbnailSize||104;$('#fileThumbnailSize').value=thumbSize;$('#fileThumbnailSizeValue').textContent=thumbSize+' px';
$('#fileThumbnailSize').addEventListener('input',()=>{const v=Number($('#fileThumbnailSize').value)||104;document.body.style.setProperty('--collection-thumb-size',v+'px');$('#fileThumbnailSizeValue').textContent=v+' px';saveStudioSettings({collectionThumbnailSize:v})});
$('#fileSelectAll').onclick=()=>fileBrowser.selectAll();$('#fileSelectNone').onclick=()=>fileBrowser.clearSelection();
$('#filePrev').onclick=()=>fileBrowser.previous({selectedOnly:$('#navigateSelectedOnly').checked});
$('#fileNext').onclick=()=>fileBrowser.next({selectedOnly:$('#navigateSelectedOnly').checked});

const viewer=new StudioPageViewer({
 engine,mainHost:$('#mainPageGrid'),previewHost:$('#previewGrid'),
 onActivate:page=>{session.setPage(page);syncViewerMeta()},
 onSelection:pages=>{session.selectedPages=new Set(pages);session.dispatchEvent(new Event('selection'));syncViewerMeta()},
 onDelete:page=>deletePageNumber(page),onAdd:()=>addPage(),onRotate:(page,delta)=>rotate(delta,[page])
});
objectLayer=new PdfObjectLayer({engine,mainHost:$('#mainPageGrid'),templates});
objectLayer.addEventListener('error',e=>setStatus(e.detail?.error?.message||'Erreur objet PDF'));
objectLayer.addEventListener('select',e=>{const o=e.detail?.object;if($('#selectedObjectInfo'))$('#selectedObjectInfo').textContent=o?(o.type+' · '+o.id+(o.locked?' · verrouillé':'')):'Aucun';if(!o)return;if($('#objectRotation'))$('#objectRotation').value=Number(o.rotation)||0;if(o.text!=null&&$('#objectText'))$('#objectText').value=o.text;if(o.color&&$('#objectColor')){$('#objectColor').value=o.color;$('#objectColorHex').value=String(o.color).toUpperCase()}if(o.fontSize&&$('#objectFontSize'))$('#objectFontSize').value=o.fontSize;if(o.opacity!=null&&$('#objectOpacity')){$('#objectOpacity').value=Math.round(o.opacity*100);objectOpacityControl?.setValue(Math.round(o.opacity*100),{emit:false})}if(o.width&&$('#objectPenWidth')){$('#objectPenWidth').value=o.width;objectPenWidthControl?.setValue(o.width,{emit:false})}});
engine.addEventListener('annotations',()=>objectLayer?.render());

async function exportBytesWithObjects(){return objectLayer?.hasObjects()?objectLayer.exportBytes():engine.baseBytes()}
async function commitObjectsIfNeeded(){if(!objectLayer?.hasObjects())return false;await objectLayer.commitToEngine();return true}

function syncSession(){session.patch({file:engine.sourceFile,fileName:engine.fileName,page:engine.currentPage,pageCount:engine.pageCount,selectedPages:new Set(engine.selected),dirty:engine.dirty,meta:{sourceCapabilities:activeFileCapabilities}})}
function syncUndoRedo(){const u=$('#history-undo'),r=$('#history-redo');if(u)u.disabled=!undoStack.length;if(r)r.disabled=!redoStack.length}
async function checkpoint(){if(!engine.pageCount)return;await commitObjectsIfNeeded();undoStack.push(await engine.baseBytes());if(undoStack.length>30)undoStack.shift();redoStack=[];syncUndoRedo()}
async function undo(){if(!undoStack.length||!engine.pageCount)return;redoStack.push(await engine.baseBytes());await engine.setBytes(undoStack.pop());cryptoSignatureState=null;syncSession();await renderAll();syncUndoRedo();setStatus('Modification annulée');recordHistory({studio:'pdf-studio',type:'action',label:'Annulation',target:engine.fileName})}
async function redo(){if(!redoStack.length||!engine.pageCount)return;undoStack.push(await engine.baseBytes());await engine.setBytes(redoStack.pop());cryptoSignatureState=null;syncSession();await renderAll();syncUndoRedo();setStatus('Modification rétablie');recordHistory({studio:'pdf-studio',type:'action',label:'Rétablissement',target:engine.fileName})}

function loadPdfProfilePreferences(){
 personalProfile=loadPersonalProfile();templates.setValues(profileTemplateValues(personalProfile));
 const pref=personalProfile.preferences?.studios?.['pdf-studio']||{};
 if(pref.naming){if(pref.naming.template!=null)$('#namingTemplate').value=pref.naming.template;if(pref.naming.prefix!=null)$('#namingPrefix').value=pref.naming.prefix;if(pref.naming.suffix!=null)$('#namingSuffix').value=pref.naming.suffix}
 if(pref.output){if(pref.output.structure)$('#outputStructure').value=pref.output.structure;if(pref.output.pathTemplate!=null)$('#outputPathTemplate').value=pref.output.pathTemplate;const legacyZip=pref.output.format==='zip';if(pref.output.format&&!legacyZip)$('#outputFormat').value=pref.output.format;if(pref.output.mode||legacyZip)$('#outputMode').value=pref.output.mode||(legacyZip?'zip':'classic');if(zipCompressionControl&&pref.output.zipLevel)zipCompressionControl.setValue(pref.output.zipLevel,{emit:false})}
}
function savePdfProfilePreferences(){
 const naming={template:$('#namingTemplate').value||'{FILENAME}',prefix:$('#namingPrefix').value||'',suffix:$('#namingSuffix').value||''};
 const outputPref={structure:$('#outputStructure').value||'root',pathTemplate:$('#outputPathTemplate').value||'',format:$('#outputFormat').value||'pdf',mode:$('#outputMode').value||'classic',zipLevel:zipCompressionControl?.value||6};
 personalProfile=updatePersonalProfile(p=>{p.preferences=p.preferences||{};p.preferences.studios=p.preferences.studios||{};p.preferences.studios['pdf-studio']={...(p.preferences.studios['pdf-studio']||{}),naming,output:outputPref};return p});
}

function namingExtra(){const item=fileBrowser.active();return{RELATIVE_PATH:item?.relativePath||engine.sourceFile?.webkitRelativePath||engine.fileName,PATH:item?.relativePath||engine.fileName,FILESIZE:String(engine.sourceFile?.size||0),PAGES:String(engine.pageCount||1),PAGE:String(engine.currentPage||1),SELECTED_COUNT:String(engine.selected.size),INDEX:String(Math.max(1,fileBrowser.items.findIndex(x=>x.id===fileBrowser.activeId)+1))}}
function outputName(extension='.pdf'){return templates.buildName(engine.sourceFile?.name||engine.fileName,{prefix:$('#namingPrefix').value,template:$('#namingTemplate').value||'{FILENAME}',suffix:$('#namingSuffix').value,extension,extra:namingExtra()})}
function updateNamingPreview(){const mode=$('#outputMode')?.value||'classic',ext=mode==='zip'?'.zip':($('#outputFormat').value==='same'?('.'+(formatInfo(engine.sourceFile).extension||'pdf')):'.pdf');$('#namingPreview').textContent=outputName(ext)}
function outputContext(){return templates.context(engine.sourceFile?.name||engine.fileName,namingExtra())}
function outputParts(){const mode=$('#outputStructure').value,custom=templates.resolve($('#outputPathTemplate').value,engine.fileName,outputContext());return output.structureParts(mode,outputContext(),custom)}
function updateOutputPreview(){const label=activeOutputLocation?.label||activeOutputLocation?.name||output.handle?.name||'',kind=$('#outputProvider').value;let provider='Téléchargement navigateur';if(kind==='local')provider=output.handle?'Dossier : '+label:'Dossier local non choisi';else if(kind==='same-source')provider=activeInputHandle?'Même dossier que la source':'Dossier source non accessible en écriture';else if(kind==='drive')provider=drive.connected?('Google Drive : '+(driveOutputFolder?.name||'nLab / PDF Studio / Exports')):'Google Drive non connecté';const parts=outputParts();$('#outputPathPreview').textContent=provider+(parts.length?' / '+parts.join(' / '):' / racine')}
['namingTemplate','namingPrefix','namingSuffix'].forEach(id=>$('#'+id).addEventListener('input',()=>{updateNamingPreview();savePdfProfilePreferences()}));
['outputFormat','outputProvider','outputStructure','outputPathTemplate'].forEach(id=>$('#'+id).addEventListener('input',()=>{updateNamingPreview();updateOutputPreview();if(id!=='outputProvider')savePdfProfilePreferences()}));
zipCompressionControl=mountSteppedPresetControl($('#zipCompressionControl'),{min:1,max:9,step:1,value:6,unit:'/ 9',name:'Compression ZIP',presets:[{id:'fast',label:'Rapide',value:2,min:1,max:3},{id:'balanced',label:'Équilibrée',value:6,min:4,max:7},{id:'max',label:'Maximum',value:9,min:8,max:9}],describe:(v,p)=>'Niveau '+v+'/9 · '+(p?.label||'Personnalisée')});
zipCompressionControl.addEventListener('change',()=>{savePdfProfilePreferences();updateOutputPreview()});
function setOutputMode(mode,{save=true}={}){mode=mode==='zip'?'zip':'classic';$('#outputMode').value=mode;$$('[data-output-mode]').forEach(b=>b.classList.toggle('active',b.dataset.outputMode===mode));$('#outputClassicPanel').hidden=mode==='zip';$('#outputZipPanel').hidden=mode!=='zip';updateNamingPreview();updateOutputPreview();if(save)savePdfProfilePreferences()}
$$('[data-output-mode]').forEach(b=>b.onclick=()=>setOutputMode(b.dataset.outputMode));
loadPdfProfilePreferences();renderRecentLocationSelects();renderNamingPresets();renderStampPresets();renderObjectAssetSelectors();if($('#stampEditorImageAsset'))$('#stampEditorImageAsset').innerHTML=$('#stampImageAsset').innerHTML;fillStampEditor(selectedStampTemplate());
setOutputMode($('#outputMode').value||'classic',{save:false});
const variableHelpHtml=templateVariableHelp().map(x=>'<code>{'+x.name+'}</code><span>'+x.description+'</span>').join('');$('#namingVariables').innerHTML=variableHelpHtml;if($('#stampVariables'))$('#stampVariables').innerHTML=variableHelpHtml;if($('#headerFooterVariables'))$('#headerFooterVariables').innerHTML=variableHelpHtml;if($('#codeVariables'))$('#codeVariables').innerHTML=variableHelpHtml;if($('#signatureVariables'))$('#signatureVariables').innerHTML=variableHelpHtml;if($('#outputVariables'))$('#outputVariables').innerHTML=variableHelpHtml;
document.addEventListener('nlab:personal-profile-changed',e=>{personalProfile=e.detail?.profile||loadPersonalProfile();templates.setValues(profileTemplateValues(personalProfile));renderStampPresets();renderObjectAssetSelectors();stampAssetPicker?.render();objectAssetPicker?.render();signatureAssetPicker?.render();updateNamingPreview();updateOutputPreview();refreshStampPreview().catch(()=>{})});
document.addEventListener('nlab:personal-profile-imported',()=>{loadPdfProfilePreferences();renderRecentLocationSelects();renderNamingPresets();renderStampPresets();renderObjectAssetSelectors();stampAssetPicker?.render();objectAssetPicker?.render();signatureAssetPicker?.render();updateNamingPreview();updateOutputPreview();refreshStampPreview().catch(()=>{});setStatus('Profil personnel importé et appliqué au PDF Studio.')});
$('#namingPresetSelect').onchange=()=>{const id=$('#namingPresetSelect').value,item=listPersonalTemplates('naming').find(x=>x.id===id);if(!item)return;$('#namingTemplate').value=item.template||'{FILENAME}';$('#namingPrefix').value=item.prefix||'';$('#namingSuffix').value=item.suffix||'';updateNamingPreview();savePdfProfilePreferences()};
$('#saveNamingPreset').onclick=()=>{const label=$('#namingPresetLabel').value.trim();if(!label){setStatus('Donnez un nom au modèle.');return}const existing=$('#namingPresetSelect').value;savePersonalTemplate('naming',{id:existing&&existing.startsWith('user-')?existing:'user-'+Date.now(),label,template:$('#namingTemplate').value||'{FILENAME}',prefix:$('#namingPrefix').value||'',suffix:$('#namingSuffix').value||''});renderNamingPresets();$('#namingPresetLabel').value='';setStatus('Modèle de nommage enregistré dans le profil.')};
$('#deleteNamingPreset').onclick=()=>{const id=$('#namingPresetSelect').value;if(!id||!id.startsWith('user-')){setStatus('Seuls les modèles personnels peuvent être supprimés.');return}removePersonalTemplate('naming',id);renderNamingPresets();setStatus('Modèle personnel supprimé.')};


for(const id of ['stampDate','stampDateA','stampDateB','stampDateC','stampDateD']){const el=$('#'+id);if(el&&!el.value)el.value=todayValue();el?.addEventListener('input',()=>refreshStampPreview().catch(()=>{}))}
$('#stampTemplate')?.addEventListener('input',()=>refreshStampPreview().catch(()=>{}));$('#stampImageAsset')?.addEventListener('change',()=>refreshStampPreview().catch(e=>setStatus(e.message)));
$('#importStampImage')?.addEventListener('click',()=>$('#stampImageInput').click());
$('#stampImageInput')?.addEventListener('change',async e=>{const file=e.target.files?.[0];if(!file)return;try{
 const a=await putPersonalAsset('stamp-image',file,{name:file.name,meta:{label:file.name,variant:'stamp-image'}}),ref={assetId:a.id,name:a.name,label:file.name,type:a.type,size:a.size,variant:'stamp-image',createdAt:new Date().toISOString()};
 addPersonalAssetRef('stamp-image',ref);renderObjectAssetSelectors();$('#stampImageAsset').value=a.id;await refreshStampPreview();setStatus('Image ajoutée à la bibliothèque « Images de tampons ».')
}catch(err){setStatus(err.message)}});
$$('[data-stamp-mode]').forEach(b=>b.addEventListener('click',()=>{const mode=b.dataset.stampMode;$$('[data-stamp-mode]').forEach(x=>x.classList.toggle('active',x===b));$('#stampUsePanel').hidden=mode!=='use';$('#stampEditorPanel').hidden=mode!=='editor';if(mode==='editor')fillStampEditor(selectedStampTemplate())}));
$('#stampPresetSelect')?.addEventListener('change',async()=>{const item=selectedStampTemplate();if(!item)return;$('#stampTemplate').value=item.template||'';$('#stampImageAsset').value=item.imageAssetId||'';fillStampEditor(item);await refreshStampPreview()});
for(const id of ['stampEditorTemplate','stampEditorPrefix','stampEditorSuffix','stampEditorLabel','stampEditorCategory'])$('#'+id)?.addEventListener('input',refreshStampEditorPreview);
for(const id of ['stampEditorPrefixEnabled','stampEditorSuffixEnabled','stampEditorImageAsset'])$('#'+id)?.addEventListener('change',refreshStampEditorPreview);
$('#newStampPreset')?.addEventListener('click',()=>{ $('#stampPresetSelect').value='';fillStampEditor(null);setStatus('Nouveau tampon prêt à être édité.')});
$('#loadStampPresetEditor')?.addEventListener('click',()=>{const item=selectedStampTemplate();if(!item){setStatus('Choisissez d’abord un modèle de tampon.');return}fillStampEditor(item);setStatus('Modèle chargé dans l’éditeur.')});
$('#saveStampPreset')?.addEventListener('click',()=>{const item=stampEditorItem();if(!item.template.trim()){setStatus('Saisissez le texte du tampon.');return}savePersonalTemplate('stamps',item);renderStampPresets();$('#stampPresetSelect').value=item.id;$('#stampTemplate').value=item.template;$('#stampImageAsset').value=item.imageAssetId||'';refreshStampPreview().catch(()=>{});setStatus('Tampon enregistré dans le profil.')});
$('#saveStampPresetCopy')?.addEventListener('click',()=>{const item=stampEditorItem({copy:true});savePersonalTemplate('stamps',item);renderStampPresets();$('#stampPresetSelect').value=item.id;setStatus('Copie personnelle du tampon enregistrée.')});
$('#deleteStampPreset')?.addEventListener('click',()=>{const id=$('#stampPresetSelect').value;if(!id.startsWith('user-stamp-')){setStatus('Seuls les tampons personnels peuvent être supprimés.');return}removePersonalTemplate('stamps',id);renderStampPresets();$('#stampPresetSelect').value='';fillStampEditor(null);setStatus('Tampon personnel supprimé.')});
const stampExamples={valid:{label:'VALIDÉ',category:'Validation',template:'VALIDÉ - {INITIALS}\nLe {STAMP_DATE:DD/MM/YYYY}'},period:{label:'PÉRIODE DE VALIDITÉ',category:'Validation',template:'Valable du {DATE_B:DD/MM/YYYY} au {DATE_C:DD/MM/YYYY}'},review:{label:'À RÉÉVALUER',category:'Suivi',template:'À réévaluer le {DATE_D:DD/MM/YYYY}',suffix:'_REV_{DATE_D:YYYYMMDD}',suffixEnabled:true},full:{label:'VALIDATION + RÉÉVALUATION',category:'Validation',template:'VALIDÉ - {INITIALS}\nLe {STAMP_DATE:DD/MM/YYYY}\nValable du {DATE_B:DD/MM/YYYY} au {DATE_C:DD/MM/YYYY}\nÀ réévaluer le {DATE_D:DD/MM/YYYY}',prefix:'VALIDE_{STAMP_DATE:YYYYMMDD}_',prefixEnabled:true,suffix:'_REV_{DATE_D:YYYYMMDD}',suffixEnabled:true}};
$$('[data-stamp-example]').forEach(b=>b.addEventListener('click',()=>fillStampEditor({...stampExamples[b.dataset.stampExample],imageAssetId:$('#stampEditorImageAsset').value||''})));
$('#exportStampJson')?.addEventListener('click',()=>downloadJson({schema:'nlab-pdf-stamps/v2',exportedAt:new Date().toISOString(),stamps:listPersonalTemplates('stamps')},'nlab-pdf-stamps-'+new Date().toISOString().slice(0,10)+'.json'));
$('#importStampJson')?.addEventListener('click',()=>$('#stampJsonInput').click());
$('#stampJsonInput')?.addEventListener('change',async e=>{const file=e.target.files?.[0];if(!file)return;try{const raw=JSON.parse(await file.text()),items=Array.isArray(raw)?raw:Array.isArray(raw.stamps)?raw.stamps:Array.isArray(raw.items)?raw.items:[];if(!items.length)throw new Error('Aucun tampon trouvé dans ce JSON.');for(const x of items){const item=normalizeStampItem(x);if(!String(item.id).startsWith('user-stamp-'))item.id='user-stamp-'+Date.now()+'-'+Math.random().toString(16).slice(2);savePersonalTemplate('stamps',item)}renderStampPresets();setStatus(items.length+' tampon(s) importé(s) / fusionné(s).')}catch(err){setStatus('Import tampons : '+err.message)}finally{e.target.value=''}});
$('#activateStampTool')?.addEventListener('click',async()=>{try{syncStampDates();objectLayer.setStamp({template:$('#stampTemplate').value||'',imageData:await stampImageData()});openToolSection('#sectionAnnotations');activateObjectTool('stamp')}catch(e){setStatus(e.message)}});
$('#applyStampScope')?.addEventListener('click',async()=>{try{
 assertPdfMutationAllowed();if(!engine.pageCount)throw new Error('Chargez un PDF.');syncStampDates();const stampDef=selectedStampTemplate();if($('#applyStampNamingRules')?.checked&&stampDef){if(stampDef.prefixEnabled)$('#namingPrefix').value=stampDef.prefix||'';if(stampDef.suffixEnabled)$('#namingSuffix').value=stampDef.suffix||'';updateNamingPreview();savePdfProfilePreferences()}objectLayer.setStamp({template:$('#stampTemplate').value||'',imageData:await stampImageData()});
 const pages=toolPages('stampScope'),pos=$('#stampPosition').value;if(pos==='manual')throw new Error('Pour appliquer le tampon à une portée, choisissez une position prédéfinie. Utilisez « Placer manuellement » pour le placement libre.');const xy={ 'top-left':[6,7],'top-right':[65,7],'bottom-left':[6,82],'bottom-right':[65,82],center:[35,45]}[pos];
 for(const p of pages)objectLayer.addAt(p,xy[0],xy[1],'stamp');objectLayer.setTool('select');objectLayer.render();setStatus('Tampon ajouté sur '+pages.length+' page(s).')
}catch(e){setStatus(e.message)}});
$$('[data-object-tool]').forEach(b=>b.addEventListener('click',()=>activateObjectTool(b.dataset.objectTool)));
objectOpacityControl=mountSteppedPresetControl($('#objectOpacityControl'),{min:5,max:100,step:1,value:100,unit:'%',presets:[{id:'light',label:'Léger',value:35,min:5,max:49},{id:'medium',label:'Moyen',value:70,min:50,max:89},{id:'opaque',label:'Opaque',value:100,min:90,max:100}],describe:(v,p)=>v+' % · '+(p?.label||'Personnalisé')});
objectPenWidthControl=mountSteppedPresetControl($('#objectPenWidthControl'),{min:1,max:20,step:1,value:2,unit:'px',presets:[{id:'fine',label:'Fin',value:1,min:1,max:2},{id:'normal',label:'Normal',value:3,min:3,max:5},{id:'thick',label:'Épais',value:8,min:6,max:12},{id:'very-thick',label:'Très épais',value:16,min:13,max:20}],describe:(v,p)=>v+' px · '+(p?.label||'Personnalisé')});
signatureWidthControl=mountSteppedPresetControl($('#signatureWidthControl'),{min:3,max:80,step:1,value:24,unit:'%',presets:[{id:'small',label:'Petite',value:12,min:3,max:17},{id:'normal',label:'Standard',value:24,min:18,max:34},{id:'large',label:'Grande',value:45,min:35,max:80}],describe:(v,p)=>v+' % · '+(p?.label||'Personnalisée')});
signatureOpacityControl=mountSteppedPresetControl($('#signatureOpacityControl'),{min:5,max:100,step:1,value:100,unit:'%',presets:[{id:'light',label:'Légère',value:45,min:5,max:59},{id:'medium',label:'Moyenne',value:75,min:60,max:89},{id:'opaque',label:'Opaque',value:100,min:90,max:100}],describe:(v,p)=>v+' % · '+(p?.label||'Personnalisée')});
codeSizeControl=mountSteppedPresetControl($('#codeSizeControl'),{min:4,max:40,step:1,value:12,unit:'%',presets:[{id:'small',label:'Petit',value:8,min:4,max:10},{id:'normal',label:'Standard',value:12,min:11,max:20},{id:'large',label:'Grand',value:28,min:21,max:40}],describe:(v,p)=>v+' % · '+(p?.label||'Personnalisé')});
objectOpacityControl?.addEventListener('change',e=>{$('#objectOpacity').value=e.detail.value;objectLayer.setStyle({opacity:e.detail.value/100});if(objectLayer.selected())objectLayer.updateSelected({opacity:e.detail.value/100})});
objectPenWidthControl?.addEventListener('change',e=>{$('#objectPenWidth').value=e.detail.value;objectLayer.setStyle({penWidth:e.detail.value});if(objectLayer.selected()?.type==='pen')objectLayer.updateSelected({width:e.detail.value})});
signatureWidthControl?.addEventListener('change',e=>$('#signatureWidthPct').value=e.detail.value);signatureOpacityControl?.addEventListener('change',e=>$('#signatureOpacityPct').value=e.detail.value);codeSizeControl?.addEventListener('change',e=>$('#qrWidthPct').value=e.detail.value);
bindColorHexControl({colorInput:$('#objectColor'),hexInput:$('#objectColorHex'),onChange:()=>{objectLayer.setStyle({color:$('#objectColor').value})}});
bindColorHexControl({colorInput:$('#redactionColor'),hexInput:$('#redactionColorHex'),onChange:v=>{objectLayer.setStyle({redactionColor:v})}});
$$('[data-redaction-color]').forEach(b=>b.onclick=()=>{const v=b.dataset.redactionColor;$('#redactionColor').value=v;$('#redactionColorHex').value=v.toUpperCase();$$('[data-redaction-color]').forEach(x=>x.classList.toggle('active',x===b));objectLayer.setStyle({redactionColor:v})});
redactionRasterControl=mountSteppedPresetControl($('#redactionRasterControl'),{min:75,max:300,step:1,value:150,unit:'DPI',presets:[{id:'very-light',label:'Très léger',value:75,min:75,max:85},{id:'screen',label:'Écran',value:96,min:86,max:120},{id:'standard',label:'Standard',value:150,min:121,max:174},{id:'good',label:'Bonne qualité',value:200,min:175,max:249},{id:'high',label:'Haute qualité',value:300,min:250,max:300}],describe:(v,p)=>v+' DPI · '+(p?.label||dpiMeaning(v))+(v<100?' · attention aux petits caractères':'')});
for(const id of ['objectText','objectColor','objectFontSize','objectOpacity','objectPenWidth'])$('#'+id)?.addEventListener('input',()=>{const style={color:$('#objectColor').value,fontSize:Number($('#objectFontSize').value)||12,opacity:(Number($('#objectOpacity').value)||100)/100,penWidth:Number($('#objectPenWidth').value)||2};objectLayer.setText($('#objectText').value);objectLayer.setStyle(style);const sel=objectLayer.selected();if(sel){const patch={};if(sel.type==='text'||sel.type==='stamp')patch.text=$('#objectText').value;if(['text','stamp','highlight','redaction','pen'].includes(sel.type))patch.color=style.color;if(sel.type==='text'||sel.type==='stamp')patch.fontSize=style.fontSize;patch.opacity=style.opacity;if(sel.type==='pen')patch.width=style.penWidth;objectLayer.updateSelected(patch)}});
$('#pickObjectImage')?.addEventListener('click',()=>$('#objectImageInput').click());
$('#objectImageInput')?.addEventListener('change',async e=>{const file=e.target.files?.[0];if(!file)return;try{await objectLayer.setImageBlob(file,'image');$('#objectImageName').textContent=file.name;activateObjectTool('image')}catch(err){setStatus(err.message)}});
$('#objectImageAsset')?.addEventListener('change',async()=>{const id=$('#objectImageAsset').value;if(!id)return;try{const a=await getPersonalAsset(id);if(!a?.blob)throw new Error('Image personnelle indisponible.');await objectLayer.setImageBlob(a.blob,'image');$('#objectImageName').textContent=a.meta?.label||a.name;activateObjectTool('image')}catch(e){setStatus(e.message)}});
$('#rotateObjectLeft')?.addEventListener('click',()=>{const o=objectLayer.rotateSelected(-90);if(o){$('#objectRotation').value=o.rotation;setStatus('Objet tourné de −90°')}});$('#rotateObjectRight')?.addEventListener('click',()=>{const o=objectLayer.rotateSelected(90);if(o){$('#objectRotation').value=o.rotation;setStatus('Objet tourné de +90°')}});
$('#applyObjectRotation')?.addEventListener('click',()=>{const o=objectLayer.setSelectedRotation($('#objectRotation').value);if(o)setStatus('Rotation objet : '+o.rotation+'°');else setStatus('Aucun objet sélectionné.')});
$('#lockSelectedObject')?.addEventListener('click',()=>{const o=objectLayer.toggleLock();if(o)setStatus(o.locked?'Objet verrouillé.':'Objet déverrouillé.');else setStatus('Aucun objet sélectionné.')});
$('#deleteSelectedObject')?.addEventListener('click',()=>{if(objectLayer.deleteSelected()){objectLayer.render();setStatus('Objet supprimé.')}else setStatus('Aucun objet sélectionné.')});
$('#commitObjects')?.addEventListener('click',async()=>{try{if(await commitObjectsIfNeeded()){markPdfModifiedAfterSignature();await renderAll();setStatus('Objets intégrés au PDF.')}else setStatus('Aucun objet à intégrer.')}catch(e){setStatus(e.message)}});
$('#markRedaction')?.addEventListener('click',()=>{objectLayer.setStyle({redactionColor:$('#redactionColor').value||'#000000'});openToolSection('#sectionAnnotations');activateObjectTool('redaction')});
$('#applyRedactions')?.addEventListener('click',async()=>{try{assertPdfMutationAllowed();if(!engine.pageCount)throw new Error('Chargez un PDF.');const pages=toolPages('redactionScope');undoStack.push(await engine.baseBytes());if(undoStack.length>30)undoStack.shift();redoStack=[];syncUndoRedo();await advancedTools.applySecureRedactions(pages,{dpi:redactionRasterControl?.value||150});markPdfModifiedAfterSignature();await renderAll();setStatus('Caviardage appliqué sur '+pages.length+' page(s).')}catch(e){setStatus(e.message)}});
refreshStampPreview().catch(()=>{});
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
 $$('[data-signature-mode]').forEach(b=>b.classList.toggle('active',b.dataset.signatureMode===signatureMode));
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
async function bytesWithOptionalSignatureAppearance({skipAppearance=false}={}){
 const appearance=skipAppearance?'none':($('#signatureAppearanceType')?.value||'none');
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
 const hadPlacedAppearance=[...engine.pageAnnotations.values()].some(list=>list.some(x=>x.type==='signature'));
 await commitObjectsIfNeeded();
 const cert=$('#signatureCertificate')?.files?.[0];if(!cert)throw new Error('Sélectionnez un certificat .p12 ou .pfx.');
 const status=$('#signatureCryptoStatus');status.textContent='Préparation de la signature…';
 const before=await engine.baseBytes();let prepared=null;
 try{
  prepared=await bytesWithOptionalSignatureAppearance({skipAppearance:hadPlacedAppearance});
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
$$('[data-signature-mode]').forEach(b=>b.onclick=()=>setSignatureMode(b.dataset.signatureMode));
$('#signatureAppearanceType').onchange=refreshSignatureAssets;$('#signatureAssetSelect').onchange=refreshSignaturePreview;

// Signature dessinée locale — convertie en asset personnel PNG.
const signatureDrawCanvas=$('#signatureDrawCanvas');
if(signatureDrawCanvas){
 const ctx=signatureDrawCanvas.getContext('2d');ctx.lineCap='round';ctx.lineJoin='round';ctx.lineWidth=3;ctx.strokeStyle='#111';
 let drawing=false,last=null;
 const pt=e=>{const r=signatureDrawCanvas.getBoundingClientRect(),t=e.touches?.[0]||e;return{x:(t.clientX-r.left)*signatureDrawCanvas.width/r.width,y:(t.clientY-r.top)*signatureDrawCanvas.height/r.height}};
 const start=e=>{e.preventDefault();drawing=true;last=pt(e)},move=e=>{if(!drawing)return;e.preventDefault();const p=pt(e);ctx.beginPath();ctx.moveTo(last.x,last.y);ctx.lineTo(p.x,p.y);ctx.stroke();last=p},end=e=>{if(drawing)e?.preventDefault?.();drawing=false;last=null};
 signatureDrawCanvas.addEventListener('pointerdown',start);signatureDrawCanvas.addEventListener('pointermove',move);window.addEventListener('pointerup',end);
 $('#clearSignatureDraw')?.addEventListener('click',()=>ctx.clearRect(0,0,signatureDrawCanvas.width,signatureDrawCanvas.height));
 $('#saveDrawnSignature')?.addEventListener('click',async()=>{try{const blob=await new Promise(r=>signatureDrawCanvas.toBlob(r,'image/png'));if(!blob)throw new Error('Signature vide ou non exportable');const kind=$('#newSignatureKind')?.value||'signature',label=$('#newSignatureLabel')?.value.trim()||('Signature dessinée '+new Date().toLocaleDateString('fr-FR'));const a=await putPersonalAsset(kind,blob,{name:label+'.png'});addPersonalAssetRef(kind,{assetId:a.id,label,name:a.name,type:a.type,size:a.size});await refreshSignatureAssets();$('#signatureAppearanceType').value=kind;await refreshSignatureAssets();$('#signatureAssetSelect').value=a.id;await refreshSignaturePreview();setStatus('Signature dessinée enregistrée dans le profil personnel.')}catch(e){setStatus(e.message)}})
}
$('#pickNewSignatureFile')?.addEventListener('click',()=>$('#newSignatureFile').click());
$('#newSignatureFile')?.addEventListener('change',async e=>{const file=e.target.files?.[0];if(!file)return;try{const kind=$('#newSignatureKind').value,label=$('#newSignatureLabel').value.trim()||file.name,a=await putPersonalAsset(kind,file,{name:file.name,meta:{label,variant:'custom'}}),ref={assetId:a.id,name:a.name,label,type:a.type,size:a.size,variant:'custom',createdAt:new Date().toISOString()};addPersonalAssetRef(kind,ref);$('#signatureAppearanceType').value=kind==='initials'?'initials':'signature';renderObjectAssetSelectors();stampAssetPicker?.render();objectAssetPicker?.render();signatureAssetPicker?.render();await refreshSignatureAssets();$('#signatureAssetSelect').value=a.id;await refreshSignaturePreview();setStatus((kind==='initials'?'Paraphe':'Signature')+' ajouté au profil personnel.')}catch(err){setStatus(err.message)}});
$('#signaturePosition').onchange=()=>{$('#signatureCustomPosition').hidden=$('#signaturePosition').value!=='custom'};
$('#saveSignatureDssUrl').onclick=()=>{try{signatureService.setBaseUrl($('#signatureDssUrl').value);$('#signatureCryptoStatus').textContent='URL DSS enregistrée.'}catch(e){$('#signatureCryptoStatus').textContent=e.message}};
$('#testSignatureDss').onclick=async()=>{try{$('#signatureCryptoStatus').textContent='Test DSS…';const r=await signatureService.health();$('#signatureCryptoStatus').textContent=JSON.stringify(r,null,2)}catch(e){$('#signatureCryptoStatus').textContent=e.message}};
$('#validateSignaturePdf').onclick=()=>validateCurrentSignature().catch(e=>$('#signatureCryptoStatus').textContent=e.message);
$('#placeVisualSignature').onclick=async()=>{try{const id=$('#signatureAssetSelect').value;if(!id)throw new Error('Choisissez une signature ou un paraphe.');const a=await getPersonalAsset(id);if(!a?.blob)throw new Error('Image de signature/paraphe indisponible.');await objectLayer.setImageBlob(a.blob,'signature');openToolSection('#sectionAnnotations');activateObjectTool('signature');setStatus('Cliquez dans la page pour placer la signature, puis déplacez/redimensionnez-la.')}catch(e){setStatus(e.message)}};
$('#applyVisualSignature').onclick=()=>applyVisualSignature().catch(e=>setStatus(e.message));
$('#applyCryptographicSignature').onclick=()=>applyCryptographicSignature().catch(e=>{const m=e?.message||String(e);if($('#signatureCryptoStatus'))$('#signatureCryptoStatus').textContent='Échec : '+m;setStatus(m)});
$('#signatureDssUrl').value=signatureService.baseUrl||'';
$('#signatureSignerName').value='{DISPLAY_NAME}';$('#signatureLocation').value='{SITE}';
setSignatureMode('visual');refreshSignatureAssets();
document.addEventListener('nlab:personal-profile-changed',()=>refreshSignatureAssets());
$('#runOcrQuick')?.addEventListener('click',()=>runOcrQuick().catch(e=>setStatus(e.message)));$('#copyOcrResult')?.addEventListener('click',async()=>{await navigator.clipboard?.writeText($('#ocrResult').value||'');setStatus('Texte OCR copié.')});
optDpiControl=mountSteppedPresetControl($('#optDpiControl'),{min:72,max:600,step:1,value:200,unit:'DPI',presets:[{id:'screen',label:'Écran',value:96,min:72,max:120},{id:'light',label:'Léger',value:150,min:121,max:179},{id:'scan',label:'Scan',value:200,min:180,max:249},{id:'print',label:'Impression',value:300,min:250,max:449},{id:'hd',label:'Haute',value:600,min:450,max:600}],describe:(v,p)=>v+' DPI · '+(p?.label||dpiMeaning(v))});
optJpegControl=mountSteppedPresetControl($('#optJpegControl'),{min:20,max:100,step:1,value:82,unit:'%',presets:[{id:'strong',label:'Forte compression',value:55,min:20,max:64},{id:'balanced',label:'Équilibré',value:82,min:65,max:89},{id:'quality',label:'Haute qualité',value:94,min:90,max:100}],describe:v=>'Qualité '+v+' % · '+jpegMeaning(v)});
$('#runOptimizeQuick')?.addEventListener('click',()=>runOptimizeQuick().catch(e=>setStatus(e.message)));
$('#runTranslateQuick')?.addEventListener('click',()=>runTranslateQuick().catch(e=>setStatus(e.message)));
$$('[data-code-type]').forEach(b=>b.onclick=()=>{$('#codeType').value=b.dataset.codeType;$$('[data-code-type]').forEach(x=>x.classList.toggle('active',x===b));refreshQrPreview()});$('#generateQrPreview')?.addEventListener('click',refreshQrPreview);$('#applyQrQuick')?.addEventListener('click',()=>applyQrQuick().catch(e=>setStatus(e.message)));
$$('[data-convert-direction]').forEach(b=>b.onclick=()=>{const d=b.dataset.convertDirection;$('#convertDirection').value=d;$$('[data-convert-direction]').forEach(x=>x.classList.toggle('active',x===b));$('#convertFromPdfPanel').hidden=d!=='from-pdf';$('#convertToPdfPanel').hidden=d!=='to-pdf'});$('#runQuickConversion')?.addEventListener('click',()=>runQuickConversion().catch(e=>setStatus(e.message)));
$('#protectCurrentPdf')?.addEventListener('click',()=>protectCurrentPdf().catch(e=>{$('#pdfSecurityStatus').textContent='Protection impossible : '+e.message;setStatus(e.message)}));
$('#pickUnlockPdf')?.addEventListener('click',()=>$('#unlockPdfInput').click());$('#unlockPdfInput')?.addEventListener('change',e=>{unlockPdfFile=e.target.files?.[0]||null;$('#unlockPdfName').textContent=unlockPdfFile?.name||'Aucun fichier'});
$('#unlockPdfNow')?.addEventListener('click',()=>unlockSelectedPdf().catch(e=>{$('#pdfSecurityStatus').textContent='Déverrouillage impossible : '+e.message;setStatus(e.message)}));
$('#inspectPdfSecurity')?.addEventListener('click',()=>inspectSecurityAndMetadata().catch(e=>setStatus(e.message)));$('#loadPdfMetadata')?.addEventListener('click',()=>{try{loadPdfMetadataFields()}catch(e){setStatus(e.message)}});$('#savePdfMetadata')?.addEventListener('click',()=>savePdfMetadataFields().catch(e=>setStatus(e.message)));$('#cleanPdfMetadata')?.addEventListener('click',()=>cleanPdfMetadata().catch(e=>setStatus(e.message)));
$('#pickComparePdfA')?.addEventListener('click',()=>$('#comparePdfAInput').click());$('#comparePdfAInput')?.addEventListener('change',e=>{compareFileA=e.target.files?.[0]||null;$('#comparePdfAName').textContent=compareFileA?.name||'Document courant'});$('#pickComparePdfB')?.addEventListener('click',()=>$('#comparePdfBInput').click());$('#comparePdfBInput')?.addEventListener('change',e=>{compareFileB=e.target.files?.[0]||null;$('#comparePdfBName').textContent=compareFileB?.name||'Aucun'});$('#runComparePdf')?.addEventListener('click',()=>runCompare().catch(e=>setStatus(e.message)));
$('#batchCleanMetadata')?.addEventListener('click',async()=>{try{const files=fileBrowser.selectedItems().map(x=>x.data).filter(f=>formatInfo(f).family==='pdf');if(!files.length)throw new Error('Sélectionnez au moins un PDF dans la collection.');$('#batchStatus').textContent='Nettoyage de '+files.length+' PDF…';const blob=await advancedTools.batchCleanMetadata(files),name='nlab-pdf-batch-metadata-'+new Date().toISOString().slice(0,10)+'.zip';await saveOutputBlob(blob,name,{parts:[]});$('#batchStatus').textContent=files.length+' PDF nettoyé(s) · '+name;recordHistory({studio:'pdf-studio',type:'action',label:'Batch métadonnées',detail:files.length+' PDF',target:name,action:'batch',repeatable:false})}catch(e){$('#batchStatus').textContent=e.message;setStatus(e.message)}});
$('#inspectForms')?.addEventListener('click',()=>inspectFormsQuick().catch(e=>setStatus(e.message)));$('#flattenForms')?.addEventListener('click',()=>flattenFormsQuick().catch(e=>setStatus(e.message)));
$('#addFormTextField')?.addEventListener('click',async()=>{try{assertPdfMutationAllowed();if(!engine.pageCount)throw new Error('Chargez un PDF.');await checkpoint();const page=Math.max(1,Math.min(engine.pageCount,Number($('#formFieldPage').value)||engine.currentPage));await advancedTools.addTextField(page,$('#formFieldName').value.trim()||('champ_'+Date.now()),{xPct:Number($('#formFieldX').value)||20,yPct:Number($('#formFieldY').value)||20,wPct:Number($('#formFieldW').value)||45,h:Number($('#formFieldH').value)||26});markPdfModifiedAfterSignature();await renderAll();await inspectFormsQuick();setStatus('Champ de formulaire ajouté.')}catch(e){setStatus(e.message)}});
$('#fillFormsJson')?.addEventListener('click',async()=>{try{assertPdfMutationAllowed();if(!engine.pageCount)throw new Error('Chargez un PDF.');const values=JSON.parse($('#formFillJson').value||'{}');await checkpoint();await advancedTools.fillForms(values);markPdfModifiedAfterSignature();await renderAll();await inspectFormsQuick();setStatus('Champs de formulaire remplis.')}catch(e){setStatus('Formulaire : '+e.message)}});

async function qrDataUrl(value){
 if(typeof QRCodeStyling!=='function')throw new Error('Moteur QR indisponible');
 const qr=new QRCodeStyling({width:360,height:360,type:'canvas',data:String(value||' '),margin:12,qrOptions:{errorCorrectionLevel:'M'},dotsOptions:{type:'square',color:'#000000'},backgroundOptions:{color:'#ffffff'}});
 const blob=await qr.getRawData('png');if(!blob)throw new Error('Génération QR impossible');
 return await new Promise((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve(r.result);r.onerror=()=>reject(r.error);r.readAsDataURL(blob)})
}
$('#applyHeaderFooter')?.addEventListener('click',async()=>{try{assertPdfMutationAllowed();if(!engine.pageCount)throw new Error('Chargez un PDF.');const pages=toolPages('headerFooterScope');await checkpoint();await advancedTools.headerFooter(pages,{headerLeft:$('#headerLeft').value,header:$('#headerCenter').value,headerRight:$('#headerRight').value,footerLeft:$('#footerLeft').value,footer:$('#footerCenter').value,footerRight:$('#footerRight').value,fontSize:Number($('#headerFooterFontSize').value)||9,qrTemplate:$('#headerFooterQr')?.value||'',qrPosition:$('#headerFooterQrPos')?.value||'none',qrSize:Number($('#headerFooterQrSize')?.value)||38,qrFactory:qrDataUrl});markPdfModifiedAfterSignature();await renderAll();setStatus('En-tête / pied appliqué sur '+pages.length+' page(s).')}catch(e){setStatus(e.message)}});
$('#applyWatermark')?.addEventListener('click',async()=>{try{assertPdfMutationAllowed();if(!engine.pageCount)throw new Error('Chargez un PDF.');const pages=toolPages('watermarkScope');await checkpoint();await advancedTools.watermarkText(pages,{text:$('#watermarkText').value||'CONFIDENTIEL',opacity:(Number($('#watermarkOpacity').value)||18)/100,rotation:Number($('#watermarkRotation').value)||0,fontSize:Number($('#watermarkFontSize').value)||42,position:$('#watermarkPosition').value});markPdfModifiedAfterSignature();await renderAll();setStatus('Watermark appliqué sur '+pages.length+' page(s).');recordHistory({studio:'pdf-studio',type:'action',label:'Watermark PDF',detail:pages.length+' page(s)',target:engine.fileName,action:'watermark',repeatable:false})}catch(e){setStatus(e.message)}});
$('#applyBates')?.addEventListener('click',async()=>{try{assertPdfMutationAllowed();if(!engine.pageCount)throw new Error('Chargez un PDF.');const pages=toolPages('batesScope');await checkpoint();await advancedTools.batesNumbering(pages,{prefix:$('#batesPrefix').value||'',suffix:$('#batesSuffix').value||'',start:Number($('#batesStart').value)||1,digits:Number($('#batesDigits').value)||6,position:$('#batesPosition').value,fontSize:9});markPdfModifiedAfterSignature();await renderAll();setStatus('Numérotation Bates appliquée sur '+pages.length+' page(s).');recordHistory({studio:'pdf-studio',type:'action',label:'Bates numbering',detail:( $('#batesPrefix').value||'')+'… · '+pages.length+' page(s)',target:engine.fileName,action:'bates',repeatable:false})}catch(e){setStatus(e.message)}});
$('#applyCrop')?.addEventListener('click',async()=>{try{assertPdfMutationAllowed();if(!engine.pageCount)throw new Error('Chargez un PDF.');const pages=toolPages('cropScope');await checkpoint();await advancedTools.cropPages(pages,{left:Number($('#cropLeft').value)||0,right:Number($('#cropRight').value)||0,top:Number($('#cropTop').value)||0,bottom:Number($('#cropBottom').value)||0});markPdfModifiedAfterSignature();await renderAll();setStatus('Recadrage appliqué sur '+pages.length+' page(s).')}catch(e){setStatus(e.message)}});




function toolPages(scopeId){
 const scope=$('#'+scopeId)?.value||'current';if(scope==='all')return engine.targetPages('all');if(scope==='selected')return engine.selected.size?[...engine.selected]:[engine.currentPage];return[engine.currentPage]
}
function dpiMeaning(v){v=Number(v);return v<=85?'Très léger':v<=120?'Écran':v<=180?'Document léger':v<=240?'Scan standard':v<=360?'Impression':'Haute définition'}
function jpegMeaning(v){v=Number(v);return v>=90?'haute qualité · compression faible':v>=75?'bonne qualité · compression moyenne':v>=55?'qualité moyenne · compression forte':'petit fichier · compression très forte'}
async function runOcrQuick(){
 if(!engine.pageCount)throw new Error('Chargez un PDF.');const pages=toolPages('ocrScope');$('#ocrResult').value='OCR en cours…';
 const text=await pdfTools.ocr(pages,{lang:$('#ocrLang').value,dpi:Number($('#ocrDpiPreset').value)||200});$('#ocrResult').value=text;
 recordHistory({studio:'pdf-studio',type:'action',label:'OCR rapide',detail:pages.length+' page(s) · '+$('#ocrLang').value+' · '+$('#ocrDpiPreset').value+' DPI',target:engine.fileName,action:'ocr',repeatable:false})
}
async function runOptimizeQuick(){
 assertPdfMutationAllowed();if(!engine.pageCount)throw new Error('Chargez un PDF.');const pages=toolPages('optScope');await checkpoint();
 const dpi=optDpiControl?.value||200,jpeg=optJpegControl?.value||82;await pdfTools.optimize(pages,{dpi,jpeg,gray:$('#optGray').checked});markPdfModifiedAfterSignature();await renderAll();
 recordHistory({studio:'pdf-studio',type:'action',label:'Optimisation PDF',detail:pages.length+' page(s) · '+dpi+' DPI · JPEG '+jpeg+'%',target:engine.fileName,action:'optimize',repeatable:false})
}
async function runTranslateQuick(){
 assertPdfMutationAllowed();if(!engine.pageCount)throw new Error('Chargez un PDF.');const pages=toolPages('translateScope');await checkpoint();
 const bytes=await pdfTools.bilingual({source:$('#translateSource').value,target:$('#translateTarget').value,layout:$('#translateLayout').value,endpoint:$('#translateEndpoint').value.trim(),pages});
 await engine.setBytes(bytes);cryptoSignatureState=null;await renderAll();setStatus('PDF bilingue généré.');
 recordHistory({studio:'pdf-studio',type:'action',label:'Traduction bilingue',detail:$('#translateSource').value+' → '+$('#translateTarget').value+' · '+pages.length+' page(s)',target:engine.fileName,action:'translate',repeatable:false})
}
async function codeBlob(){
 const raw=$('#qrValue').value.trim();if(!raw)throw new Error('Saisissez un contenu.');const value=templates.resolve(raw,engine.fileName,outputContext()),type=$('#codeType').value||'qrcode';
 if(type==='qrcode'){
  if(typeof QRCodeStyling!=='function')throw new Error('Moteur QR indisponible');
  const qr=new QRCodeStyling({width:720,height:720,type:'canvas',data:value,margin:24,qrOptions:{errorCorrectionLevel:'M'},dotsOptions:{type:'square',color:'#000000'},backgroundOptions:{color:'#ffffff'}});
  const blob=await qr.getRawData('png');if(!blob)throw new Error('Génération QR impossible');return{blob,value,type}
 }
 if(!window.bwipjs?.toCanvas)throw new Error('Moteur code-barres indisponible');
 const canvas=document.createElement('canvas'),map={'datamatrix':'datamatrix','code128':'code128','gs1-128':'gs1-128','ean13':'ean13','ean8':'ean8'},bcid=map[type]||'code128';
 const opts={bcid,text:value,scale:5,paddingwidth:8,paddingheight:8,backgroundcolor:'FFFFFF',barcolor:'000000'};if(['code128','gs1-128','ean13','ean8'].includes(type)){opts.height=18;opts.includetext=true;opts.textxalign='center'}bwipjs.toCanvas(canvas,opts);
 const blob=await new Promise((res,rej)=>canvas.toBlob(b=>b?res(b):rej(new Error('Génération du code impossible')),'image/png'));return{blob,value,type}
}
async function refreshQrPreview(){
 const p=$('#qrPreview');try{const q=await codeBlob(),url=URL.createObjectURL(q.blob);p.innerHTML='<img src="'+url+'" alt="Aperçu du code"><small>'+escHtml(q.value)+'</small>';p.querySelector('img').onload=()=>setTimeout(()=>URL.revokeObjectURL(url),500)}catch(e){p.innerHTML='<span>'+escHtml(e.message)+'</span>'}
}
async function applyQrQuick(){
 assertPdfMutationAllowed();if(!engine.pageCount)throw new Error('Chargez un PDF.');
 const q=await codeBlob(),pages=toolPages('qrScope'),widthPct=Number($('#qrWidthPct').value)||12,pos=$('#qrPosition').value,map={'top-left':[6,7],'top-right':[82,7],'bottom-left':[6,82],'bottom-right':[82,82]},xy=map[pos]||[82,82];
 if(!pages.length)throw new Error('Aucune page cible pour le code.');
 await objectLayer.setImageBlob(q.blob,'image');
 // Prépare l'UI avant l'écriture des annotations : aucune transition de panneau ne doit pouvoir effacer l'objet nouvellement créé.
 openToolSection('#sectionAnnotations');objectLayer.setTool('select');
 const created=[];
 for(const page of pages){
  const o=objectLayer.addAt(page,xy[0],xy[1],'image');
  if(!o)throw new Error('Le code a été généré mais l’objet PDF n’a pas pu être créé.');
  o.wPct=widthPct;o.subtype='code';o.codeType=q.type;o.codeValue=q.value;created.push({page,id:o.id})
 }
 objectLayer.render();
 const assertCreated=stage=>{const missing=created.filter(x=>!engine.annotations(x.page).some(a=>a.id===x.id));if(missing.length)throw new Error('Le code a été généré mais '+missing.length+' annotation(s) PDF ont disparu ('+stage+').')};
 assertCreated('après ajout');
 setStatus('Code '+q.type+' placé comme objet sur '+pages.length+' page(s) · déplaçable/redimensionnable.');
 assertCreated('après statut');
 recordHistory({studio:'pdf-studio',type:'action',label:'Code placé',detail:q.type+' · '+pages.length+' page(s) · objet éditable',target:engine.fileName,action:'qr',repeatable:false});
 assertCreated('après historique')
}
async function runQuickConversion(){
 if(!engine.pageCount)throw new Error('Chargez un document.');const direction=$('#convertDirection').value||'from-pdf',stem=(engine.fileName||'document').replace(/\.pdf$/i,'');
 if(direction==='to-pdf'){await saveOutputBlob(await currentBlob(),stem+'.pdf',{parts:[]});setStatus('PDF exporté depuis le document courant.');return}
 const type=$('#quickConversion').value,pages=toolPages('convertScope');
 if(['txt','docx','odt'].includes(type)){const r=await documentConversion.pdfTo(type,pages);await saveOutputBlob(r.blob,r.name,{parts:[]});setStatus(type.toUpperCase()+' exporté · fidélité '+r.fidelity+'.');return}
 const blob=await advancedTools.allImagesZip({type:type==='jpg'?'jpg':'png',scale:2,quality:.9,pages});await saveOutputBlob(blob,stem+'_'+type+'.zip',{parts:[]});setStatus('Images '+type.toUpperCase()+' exportées en ZIP.')
}
async function protectCurrentPdf(){
 if(!engine.pageCount)throw new Error('Chargez un PDF.');if(advancedTools.signatureStructure().hasSignature||cryptoSignatureState)throw new Error('Le PDF est déjà signé : le chiffrement modifierait les octets signés. Protégez le document avant de le signer.');const bytes=await exportBytesWithObjects(),user=$('#pdfOpenPassword').value||'',owner=$('#pdfOwnerPassword').value||'';
 $('#pdfSecurityStatus').textContent='Chargement de qpdf WASM et chiffrement AES-256…';
 const protectedBytes=await securityService.protect(bytes,{userPassword:user,ownerPassword:owner,print:$('#pdfPermissionPrint').value,modify:$('#pdfPermissionModify').value,extract:$('#pdfPermissionExtract').checked});
 const name=(engine.fileName||'document.pdf').replace(/\.pdf$/i,'')+'_protege.pdf';await saveOutputBlob(new Blob([protectedBytes],{type:'application/pdf'}),name,{parts:[]});
 $('#pdfOpenPassword').value='';$('#pdfOwnerPassword').value='';$('#pdfSecurityStatus').textContent='Copie AES-256 créée : '+name;setStatus('PDF protégé exporté : '+name)
}
async function unlockSelectedPdf(){
 if(!unlockPdfFile)throw new Error('Choisissez un PDF protégé.');const password=$('#unlockPdfPassword').value||'';$('#pdfSecurityStatus').textContent='Déverrouillage qpdf WASM…';
 const bytes=await securityService.unlock(unlockPdfFile,password),name=(unlockPdfFile.name||'document.pdf').replace(/\.pdf$/i,'')+'_deverrouille.pdf';await saveOutputBlob(new Blob([bytes],{type:'application/pdf'}),name,{parts:[]});
 $('#unlockPdfPassword').value='';$('#pdfSecurityStatus').textContent='Copie déverrouillée créée : '+name;setStatus('PDF déverrouillé exporté : '+name)
}
async function inspectSecurityAndMetadata(){
 if(!engine.pageCount)throw new Error('Chargez un PDF.');const sig=advancedTools.signatureStructure(),d=engine.pdfDoc;
 const info={signatures:sig,title:d.getTitle?.()||'',author:d.getAuthor?.()||'',subject:d.getSubject?.()||'',keywords:d.getKeywords?.()||'',creator:d.getCreator?.()||'',producer:d.getProducer?.()||'',creationDate:d.getCreationDate?.()?.toISOString?.()||'',modificationDate:d.getModificationDate?.()?.toISOString?.()||'',encryptionNote:'Inspection structurelle. Le moteur pdf-lib ne chiffre pas les sorties V2.'};
 $('#pdfSecurityStatus').textContent=JSON.stringify(info,null,2);return info
}
function loadPdfMetadataFields(){
 if(!engine.pageCount)throw new Error('Chargez un PDF.');const d=engine.pdfDoc;
 $('#pdfMetaTitle').value=d.getTitle?.()||'';$('#pdfMetaAuthor').value=d.getAuthor?.()||'';$('#pdfMetaSubject').value=d.getSubject?.()||'';const kw=d.getKeywords?.();$('#pdfMetaKeywords').value=Array.isArray(kw)?kw.join(', '):(kw||'');setStatus('Métadonnées chargées.')
}
async function savePdfMetadataFields(){
 assertPdfMutationAllowed();if(!engine.pageCount)throw new Error('Chargez un PDF.');await checkpoint();const d=engine.pdfDoc;
 d.setTitle($('#pdfMetaTitle').value||'');d.setAuthor($('#pdfMetaAuthor').value||'');d.setSubject($('#pdfMetaSubject').value||'');d.setKeywords(($('#pdfMetaKeywords').value||'').split(',').map(x=>x.trim()).filter(Boolean));d.setModificationDate?.(new Date());
 await engine.setBytes(new Uint8Array(await d.save()));markPdfModifiedAfterSignature();await renderAll();setStatus('Métadonnées PDF enregistrées.')
}
async function cleanPdfMetadata(){
 assertPdfMutationAllowed();if(!engine.pageCount)throw new Error('Chargez un PDF.');await checkpoint();await advancedTools.cleanMetadata();markPdfModifiedAfterSignature();await renderAll();setStatus('Métadonnées PDF nettoyées.')
}
let unlockPdfFile=null;
let compareFileA=null,compareFileB=null;
async function runCompare(){
 if(!engine.pageCount&&!compareFileA)throw new Error('Choisissez un PDF A ou chargez un PDF courant.');if(!compareFileB)throw new Error('Choisissez le PDF B.');
 const page=$('#compareScope').value==='page'?(engine.currentPage||1):null,r=await advancedTools.compareFiles(compareFileA,compareFileB,{page});$('#compareResult').textContent=JSON.stringify(r,null,2);setStatus('Comparaison A / B terminée.')
}
async function inspectFormsQuick(){if(!engine.pageCount)throw new Error('Chargez un PDF.');$('#formsResult').textContent=JSON.stringify(advancedTools.inspectForms(),null,2)}
async function flattenFormsQuick(){assertPdfMutationAllowed();if(!engine.pageCount)throw new Error('Chargez un PDF.');await checkpoint();await advancedTools.flattenForms();markPdfModifiedAfterSignature();await renderAll();setStatus('Formulaires aplatis.')}
function syncViewerMeta(){
 $('#pageNumberInput').value=engine.currentPage||1;$('#pageNumberInput').max=Math.max(1,engine.pageCount);$('#pageInfo').textContent='/ '+engine.pageCount;$('#zoomInput').value=Math.round(viewer.zoom*100);$('#pagesPerRow').value=viewer.pagesPerRow;$('#previewColumns').value=viewer.previewColumns;$('#previewZoom').value=Math.round(viewer.previewScale*100);
 const capInfo=activeFileCapabilities?.extension?(' · '+activeFileCapabilities.extension.toUpperCase()):'',selectedFiles=fileBrowser.selected.size?(' · '+fileBrowser.selected.size+' fichier(s) sélectionné(s)'):'';
 const sourceLoc=activeInputLocation?.label||activeInputLocation?.name||'';$('#sourceStatus').textContent=engine.pageCount?(sourceLoc?'Entrée : '+sourceLoc+' · ':'')+engine.fileName+' · '+engine.pageCount+' page(s) · '+engine.selected.size+' page(s) sélectionnée(s)'+capInfo+selectedFiles:'Aucun document chargé.';
 syncSession();viewer.refreshActive();updateNamingPreview();updateOutputPreview();
}
async function renderAll(){if(!engine.pageCount){$('#mainPageGrid').innerHTML='';$('#previewGrid').innerHTML='';syncViewerMeta();return}await viewer.renderMain();objectLayer?.render();await viewer.renderPreview();syncViewerMeta()}

async function load(file){
 if(!file)return;setStatus('Chargement…');activeFileCapabilities=detectFileCapabilities(file);const info=formatInfo(file),isMarkdown=['md','markdown'].includes(info.extension);
 if(isMarkdown){
  let convertedPages=0;try{await engine.loadFile(file);convertedPages=engine.pageCount}catch{engine.clear()}
  undoStack=[];redoStack=[];cryptoSignatureState=null;syncUndoRedo();$('#previewGrid').innerHTML='';
  try{await renderMarkdownFilePreview(file,$('#mainPageGrid'));setStatus('Aperçu Markdown affiché'+(convertedPages?' · copie PDF interne prête pour conversion':''));}
  catch(e){engine.clear();try{await renderPlainTextPreview(file,$('#mainPageGrid'));setStatus('Markdown rendu en texte brut après erreur isolée : '+e.message)}catch{$('#mainPageGrid').innerHTML='<div class="statusBox">Aperçu Markdown indisponible. La navigation reste utilisable.</div>'}}
  const item=fileBrowser.items.find(x=>x.data===file);if(item){item.pages=convertedPages||null;item.subtitle=item.relativePath||'Markdown';fileBrowser.render()}
  recordHistory({studio:'pdf-studio',type:'file',label:'Markdown chargé',detail:(convertedPages?convertedPages+' page(s) PDF interne · ':'')+'aperçu Markdown isolé',target:file.name});return
 }
 try{
  await engine.loadFile(file);undoStack=[];redoStack=[];cryptoSignatureState=null;syncUndoRedo();viewer.setZoom(1);viewer.setPagesPerRow(1);syncSession();await renderAll();
  const item=fileBrowser.items.find(x=>x.data===file);if(item){item.pages=engine.pageCount;item.subtitle=item.relativePath||activeFileCapabilities.family;fileBrowser.render()}
  const converted=activeFileCapabilities.family!=='pdf'?' · aperçu PDF rapide':'';
  setStatus('Document chargé'+converted);recordHistory({studio:'pdf-studio',type:'file',label:'Fichier chargé',detail:engine.pageCount+' page(s) · '+activeFileCapabilities.family,target:file.name});
 }catch(e){
  engine.clear();setStatus('Aperçu indisponible : '+e.message);
  if(info.family==='text'||['txt','csv','json','yaml','yml','xml','html','htm'].includes(info.extension)){try{await renderPlainTextPreview(file,$('#mainPageGrid'));$('#previewGrid').innerHTML='';setStatus('Aperçu texte brut affiché après échec du renderer.');return}catch{}}
  $('#mainPageGrid').innerHTML='<div class="statusBox">Aperçu rapide indisponible pour <b>'+escHtml(file.name)+'</b>.<br>Le renderer a été isolé : la navigation reste utilisable. Utilisez un Studio spécialisé si une conversion avancée est nécessaire.</div>';$('#previewGrid').innerHTML=''
 }
}
async function loadArchiveWorkspace(file){
 if(!window.NLAB_ARCHIVE_WORKSPACE)throw new Error('Moteur ZIP indisponible.');archiveWorkspace=await window.NLAB_ARCHIVE_WORKSPACE.open(file,{JSZipRef:window.JSZip});
 const items=[];loadedFiles=[];let i=0;
 for(const e of archiveWorkspace.entries.values()){const name=e.path.split('/').pop()||'fichier',type=/\.pdf$/i.test(name)?'application/pdf':/\.txt$/i.test(name)?'text/plain':'';const f=new File([e.blob],name,{type});if(!isSupportedFile(f))continue;loadedFiles.push(f);items.push({id:'zip-'+(i++)+'-'+e.path,label:name,subtitle:e.path,relativePath:e.path,size:e.size,type:f.type,extension:formatInfo(f).extension,data:f})}
 fileBrowser.setItems(items);$('#archiveWorkspaceControls').hidden=false;activeInputHandle=null;activeInputLocation={kind:'zip',label:file.name};
 const compatible=items.find(x=>formatInfo(x.data).family!=='archive');if(compatible){fileBrowser.activeId=compatible.id;fileBrowser.render();await load(compatible.data)}else setStatus('ZIP ouvert, mais aucune entrée compatible avec PDF Studio.');
 setStatus('Workspace ZIP ouvert : '+items.length+' fichier(s) compatible(s).')
}
async function loadFiles(files){
 const all=[...files],zip=all.find(f=>formatInfo(f).family==='archive'||/\.zip$/i.test(f.name));if(zip&&all.length===1)return loadArchiveWorkspace(zip);
 archiveWorkspace=null;if($('#archiveWorkspaceControls'))$('#archiveWorkspaceControls').hidden=true;
 const recursive=$('#recursiveFolders').checked;
 loadedFiles=all.filter(isSupportedFile).filter(f=>recursive||!f.webkitRelativePath||f.webkitRelativePath.split('/').length<=2);
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
  if(x.isCurrent&&engine.pageCount)entries.push({name:x.name,bytes:await exportBytesWithObjects()});
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
 if(!engine.pageCount)return;await commitObjectsIfNeeded();const pages=engine.selected.size?[...engine.selected]:[engine.currentPage],bytes=await engine.extractPages(pages),stem=(engine.fileName||'document').replace(/\.pdf$/i,'');
 const name=stem+'_extrait_'+pages.join('-')+'.pdf';await saveOutputBlob(new Blob([bytes],{type:'application/pdf'}),name,{parts:[]});setStatus('Pages extraites : '+name);
 recordHistory({studio:'pdf-studio',type:'action',label:'Pages extraites',detail:pages.join(', '),target:name,action:'extractPages',repeatable:false})
}
async function currentBlob(){return new Blob([await exportBytesWithObjects()],{type:'application/pdf'})}
async function ensureOutputDirectory(){
 if(output.handle)return output.handle;
 const h=await output.chooseDirectory();activeOutputLocation=await rememberLocation('output',h,{label:h.name,path:h.name});$('#outputProvider').value='local';setValidatedButton($('#pickOutputFolder'),true,'Dossier de sortie validé : '+h.name);renderRecentLocationSelects();updateOutputPreview();return h
}
async function saveOutputBlob(blob,name,{parts=[]}={}){
 const provider=$('#outputProvider')?.value||'download';
 if(provider==='drive'){
  if(!drive.connected)throw new Error('Connectez Google Drive avant d’enregistrer.');
  if(driveOutputFolder?.id)return drive.uploadToFolderId(blob,name,driveOutputFolder.id);
  return drive.upload(blob,name,'exports')
 }
 if(provider==='same-source'){
  if(!activeInputHandle)throw new Error('Le dossier source n’est pas accessible en écriture. Ouvrez le document depuis un dossier local sélectionné avec le navigateur, ou choisissez une autre destination.');
  const perm=await activeInputHandle.queryPermission?.({mode:'readwrite'});if(perm!=='granted'&&await activeInputHandle.requestPermission?.({mode:'readwrite'})!=='granted')throw new Error('Autorisation d’écriture refusée pour le dossier source.');
  let d=activeInputHandle;for(const raw of parts){const part=String(raw||'').trim().replace(/[<>:"|?*\x00-\x1F]/g,'_');if(part)d=await d.getDirectoryHandle(part,{create:true})}
  const fh=await d.getFileHandle(name,{create:true}),w=await fh.createWritable();await w.write(blob);await w.close();return{kind:'same-source',name}
 }
 if(provider==='local'&&!output.handle)await ensureOutputDirectory();
 return output.saveBlob(blob,name,{parts})
}

async function saveCurrent({classify=false,forcePicker=false}={}){
 if(!engine.pageCount)return;if($('#outputMode').value==='zip')return saveZip({classify});const format=$('#outputFormat').value;
 let blob,name;if(format==='same'&&engine.sourceFile&&activeFileCapabilities?.family!=='pdf'){blob=engine.sourceFile;name=outputName('.'+(formatInfo(engine.sourceFile).extension||'bin'))}else{blob=await currentBlob();name=outputName('.pdf')}
 if(forcePicker&&window.showSaveFilePicker){const h=await showSaveFilePicker({suggestedName:name,types:[{description:'Document',accept:{[blob.type||'application/octet-stream']:['.'+(name.split('.').pop()||'pdf')]}}]}),w=await h.createWritable();await w.write(blob);await w.close()}
 else{await saveOutputBlob(blob,name,{parts:classify?outputParts():[]})}
 setStatus('Enregistré : '+name);recordHistory({studio:'pdf-studio',type:'action',label:classify?'Enregistrer + classer':'Enregistrer',detail:(classify?outputParts().join('/'):'')||'racine',target:name,action:'savePdf',repeatable:true})
}
async function saveZip({classify=false}={}){if(!engine.pageCount)return;const pdf=await exportBytesWithObjects(),pdfName=outputName('.pdf'),zipName=outputName('.zip'),provider=$('#outputProvider').value,parts=classify?outputParts():[];
 if(provider==='drive'||provider==='same-source'){const z=new JSZip();z.file(pdfName,pdf);const blob=await z.generateAsync({type:'blob',compression:'DEFLATE',compressionOptions:{level:zipCompressionControl?.value||6}});await saveOutputBlob(blob,zipName,{parts})}
 else{if(provider==='local'&&!output.handle)await ensureOutputDirectory();const old=output.handle;if(provider!=='local')output.handle=null;await output.saveZip([{name:pdfName,data:pdf}],zipName,{parts,level:zipCompressionControl?.value||6});output.handle=old}
 setStatus('ZIP enregistré : '+zipName);recordHistory({studio:'pdf-studio',type:'action',label:classify?'ZIP enregistré + classé':'ZIP enregistré',detail:classify?parts.join('/'):'',target:zipName})}

$('#pickFile').onclick=()=>$('#fileInput').click();
$('#fileInput').onchange=async e=>{const files=e.target.files||[];if(files.length){activeInputHandle=null;activeInputLocation={kind:'files',label:files.length===1?files[0].name:files.length+' fichiers'};setValidatedButton($('#pickFile'),true,activeInputLocation.label);setValidatedButton($('#pickFolder'),false);await loadFiles(files)}};
async function chooseInputDirectory(){
 if(window.showDirectoryPicker){
  const handle=await showDirectoryPicker({mode:'read'}),files=await collectDirectoryHandle(handle,{recursive:$('#recursiveFolders').checked});
  activeInputHandle=handle;activeInputLocation=await rememberLocation('input',handle,{label:handle.name,path:handle.name});setValidatedButton($('#pickFolder'),true,'Dossier validé : '+handle.name);setValidatedButton($('#pickFile'),false);renderRecentLocationSelects();await loadFiles(files);return
 }
 $('#folderInput').click()
}
$('#pickFolder').onclick=()=>chooseInputDirectory().catch(e=>setStatus(e.message));
$('#folderInput').onchange=async e=>{const files=e.target.files||[];if(files.length){activeInputHandle=null;const root=files[0].webkitRelativePath?.split('/')[0]||'Dossier';activeInputLocation={kind:'folder',label:root};setValidatedButton($('#pickFolder'),true,'Dossier validé : '+root);setValidatedButton($('#pickFile'),false);await loadFiles(files)}};
mountDropZone($('#inputDropZone'),{onFiles:async files=>{if(files.length){activeInputHandle=null;activeInputLocation={kind:'drop',label:files.length+' élément(s) déposé(s)'};$('#inputDropZone').classList.add('validatedDropZone');await loadFiles(files)}}});
$('#loadRecentInput').onclick=async()=>{const id=$('#recentInputSelect').value;if(!id)return;try{const {item,handle}=await resolveRecentLocation('input',id,{mode:'read'}),files=await collectDirectoryHandle(handle,{recursive:$('#recursiveFolders').checked});activeInputHandle=handle;activeInputLocation=item;setValidatedButton($('#pickFolder'),true,'Entrée récente : '+item.label);setValidatedButton($('#pickFile'),false);$('#recentInputSelect').classList.add('validatedChoice');await loadFiles(files);setStatus('Entrée récente chargée : '+item.label)}catch(e){setStatus(e.message)}};
$('#importLegacyConfig')?.addEventListener('click',()=>$('#legacyConfigInput').click());
$('#legacyConfigInput')?.addEventListener('change',async e=>{const file=e.target.files?.[0];if(!file)return;try{const raw=JSON.parse(await file.text()),report=migrateLegacyPdfConfig(raw);loadPdfProfilePreferences();renderNamingPresets();renderStampPresets();renderObjectAssetSelectors();renderDriveState();updateNamingPreview();updateOutputPreview();$('#legacyConfigStatus').textContent=report.length?'Migration : '+report.join(' · '):'JSON reconnu mais aucun réglage migrable détecté.';setStatus('Ancienne configuration importée / fusionnée.')}catch(err){$('#legacyConfigStatus').textContent='Erreur : '+err.message;setStatus('Migration configuration : '+err.message)}finally{e.target.value=''}});
$('#saveGoogleConfig')?.addEventListener('click',saveDriveConfig);$('#connectGoogleDrive')?.addEventListener('click',()=>connectDrive().catch(e=>setStatus(e.message)));$('#disconnectGoogleDrive')?.addEventListener('click',()=>{drive.disconnect();driveOutputFolder=null;renderDriveState();setStatus('Google Drive déconnecté.')});drive.addEventListener('state',renderDriveState);renderDriveState();
$('#openRemoteUrl')?.addEventListener('click',async()=>{try{const url=$('#remoteFileUrl').value.trim();if(!url)throw new Error('Saisissez une URL.');setStatus('Chargement distant…');const file=await fetchRemoteFile(url);activeInputHandle=null;activeInputLocation={kind:'url',label:url};await loadFiles([file]);setValidatedButton($('#openRemoteUrl'),true,'URL chargée : '+url);setStatus('Fichier distant chargé : '+file.name)}catch(e){setStatus('URL : '+e.message)}});
$('#remoteFileUrl')?.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();$('#openRemoteUrl').click()}});
$('#pickDriveFile')?.addEventListener('click',async()=>{try{if(!drive.connected)await connectDrive();const files=await drive.pickManyAndDownload();if(!files.length)return;activeInputHandle=null;activeInputLocation={kind:'drive',label:files.length===1?files[0].name:files.length+' fichiers Drive'};await loadFiles(files);setValidatedButton($('#pickDriveFile'),true,activeInputLocation.label);setStatus('Fichier(s) Google Drive chargé(s).')}catch(e){setStatus('Google Drive : '+e.message)}});
$('#pickDriveOutputFolder')?.addEventListener('click',async()=>{try{if(!drive.connected)await connectDrive();const f=await drive.pickFolder();if(!f)return;driveOutputFolder={id:f.id,name:f.name||'Dossier Drive'};$('#outputProvider').value='drive';activeOutputLocation={kind:'drive',label:'Drive / '+driveOutputFolder.name};renderDriveState();updateOutputPreview();setStatus('Dossier de sortie Drive : '+driveOutputFolder.name)}catch(e){setStatus('Google Drive : '+e.message)}});
$('#updateArchiveEntry')?.addEventListener('click',async()=>{try{if(!archiveWorkspace)throw new Error('Aucun workspace ZIP actif.');if(!engine.pageCount)throw new Error('Aucun document PDF courant à réinjecter.');const item=fileBrowser.active(),path=item?.relativePath;if(!path)throw new Error('Chemin ZIP actif introuvable.');window.NLAB_ARCHIVE_WORKSPACE.replace(archiveWorkspace,path,await currentBlob());setStatus('Entrée ZIP mise à jour : '+path)}catch(e){setStatus(e.message)}});
$('#exportArchiveWorkspace')?.addEventListener('click',async()=>{try{if(!archiveWorkspace)throw new Error('Aucun workspace ZIP actif.');const blob=await window.NLAB_ARCHIVE_WORKSPACE.build(archiveWorkspace,{JSZipRef:window.JSZip,level:zipCompressionControl?.value||6}),name=(archiveWorkspace.sourceName||'workspace.zip').replace(/\.zip$/i,'')+'_modifie.zip';await saveOutputBlob(blob,name,{parts:[]});setStatus('Workspace ZIP exporté : '+name)}catch(e){setStatus(e.message)}});
$('#extractArchiveWorkspace')?.addEventListener('click',async()=>{try{if(!archiveWorkspace)throw new Error('Aucun workspace ZIP actif.');if(!window.showDirectoryPicker)throw new Error('Extraction vers dossier non prise en charge par ce navigateur.');const h=await showDirectoryPicker({mode:'readwrite'}),n=await window.NLAB_ARCHIVE_WORKSPACE.extract(archiveWorkspace,h);setStatus(n+' fichier(s) extraits vers '+h.name)}catch(e){setStatus(e.message)}});
$('#pickOutputFolder').onclick=async()=>{try{const h=await output.chooseDirectory();activeOutputLocation=await rememberLocation('output',h,{label:h.name,path:h.name});$('#outputProvider').value='local';setValidatedButton($('#pickOutputFolder'),true,'Dossier de sortie validé : '+h.name);renderRecentLocationSelects();updateOutputPreview();setStatus('Dossier de sortie : '+h.name)}catch(e){setStatus(e.message)}};
$('#loadRecentOutput').onclick=async()=>{const id=$('#recentOutputSelect').value;if(!id)return;try{const {item,handle}=await resolveRecentLocation('output',id,{mode:'readwrite'});output.handle=handle;activeOutputLocation=item;$('#outputProvider').value='local';setValidatedButton($('#pickOutputFolder'),true,'Sortie récente : '+item.label);$('#recentOutputSelect').classList.add('validatedChoice');updateOutputPreview();setStatus('Sortie récente chargée : '+item.label)}catch(e){setStatus(e.message)}};
$('#savePdfSide').onclick=()=>saveCurrent();$('#saveZipSide').onclick=saveZip;$('#saveAndClassify').onclick=()=>saveCurrent({classify:true});$('#saveAs').onclick=()=>saveCurrent({forcePicker:true});
$$('[data-assembly-mode]').forEach(b=>b.onclick=()=>{const mode=b.dataset.assemblyMode;$$('[data-assembly-mode]').forEach(x=>x.classList.toggle('active',x===b));$('#assemblyMergePanel').hidden=mode!=='merge';$('#assemblyInsertPanel').hidden=mode!=='insert'});
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
$('#zoomOut').onclick=async()=>{viewer.setPagesPerRow(1);viewer.setZoom(viewer.zoom-.1);await viewer.renderMain();objectLayer?.render();syncViewerMeta()};$('#zoomIn').onclick=async()=>{viewer.setPagesPerRow(1);viewer.setZoom(viewer.zoom+.1);await viewer.renderMain();objectLayer?.render();syncViewerMeta()};$('#zoomInput').addEventListener('change',async()=>{viewer.setPagesPerRow(1);viewer.setZoom(Number($('#zoomInput').value)/100);await viewer.renderMain();objectLayer?.render();syncViewerMeta()});$('#fitWidth').onclick=async()=>{viewer.setPagesPerRow(1);viewer.setZoom(viewer.fitScale($('#canvasStage'),1));await viewer.renderMain();objectLayer?.render();syncViewerMeta()};$('#fitPage')?.addEventListener('click',async()=>{if(!engine.pageCount)return;viewer.setPagesPerRow(1);const page=engine.pdfDoc.getPage(Math.max(0,engine.currentPage-1)),sz=page.getSize(),stage=$('#canvasStage'),w=Math.max(180,stage.clientWidth-32),h=Math.max(180,(window.innerHeight-stage.getBoundingClientRect().top)-48),scale=Math.max(.15,Math.min(3,w/sz.width,h/sz.height));viewer.setZoom(scale);await viewer.renderMain();objectLayer?.render();syncViewerMeta()});$('#pagesPerRow').addEventListener('change',async()=>{viewer.setPagesPerRow($('#pagesPerRow').value);await viewer.renderMain();objectLayer?.render();syncViewerMeta()});
$('#previewColumns').addEventListener('change',async()=>{viewer.setPreviewColumns($('#previewColumns').value);await viewer.renderPreview();syncViewerMeta()});
const setPreviewZoom=async v=>{viewer.setPreviewScale(v);await viewer.renderPreview();syncViewerMeta()};$('#previewZoom').addEventListener('input',()=>setPreviewZoom(Number($('#previewZoom').value)/100));$('#previewZoomOut').onclick=()=>setPreviewZoom(viewer.previewScale-.02);$('#previewZoomIn').onclick=()=>setPreviewZoom(viewer.previewScale+.02);
$('#previewSelectAll').onclick=async()=>{engine.selectAll();session.selectedPages=new Set(engine.selected);await viewer.renderPreview();syncViewerMeta()};$('#previewSelectNone').onclick=async()=>{engine.selectNone();session.selectedPages.clear();await viewer.renderPreview();syncViewerMeta()};$('#previewAddPage').onclick=addPage;$('#previewDeleteSelected').onclick=deleteSelected;$('#previewRotateLeft').onclick=()=>rotate(-90);$('#previewRotateRight').onclick=()=>rotate(90);
$('#history-undo').onclick=undo;$('#history-redo').onclick=redo;$('#history-view-all-inline').onclick=()=>activateSidebarTab('history');$('#exportHistoryJson')?.addEventListener('click',()=>{const blob=new Blob([JSON.stringify({schema:'nlab-studio-history/v2',exportedAt:new Date().toISOString(),items:loadHistory()},null,2)],{type:'application/json;charset=utf-8'}),a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='nlab-studio-history-'+new Date().toISOString().slice(0,10)+'.json';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000)});$('[data-open-core-settings]').onclick=()=>$('#studioCoreSettings')?.click();$('#sidebar-open-workflows').onclick=()=>document.dispatchEvent(new Event('studio-v2:open-workflows'));

function activateSidebarTab(tab){$$('[data-sidebar-tab]').forEach(x=>x.classList.toggle('active',x.dataset.sidebarTab===tab));$$('[data-sidebar-pane]').forEach(x=>{const on=x.dataset.sidebarPane===tab;x.hidden=!on;x.classList.toggle('active',on)})}
function currentSidebarPane(){return $('[data-sidebar-pane].active')||$('#sidebar-pane-tools')}
function setCurrentPaneDetails(open){currentSidebarPane()?.querySelectorAll('details').forEach(x=>x.open=open)}
$$('[data-sidebar-tab]').forEach(b=>b.onclick=()=>activateSidebarTab(b.dataset.sidebarTab));$('#sidebar-collapse-all').onclick=()=>setCurrentPaneDetails(false);$('#sidebar-expand-all').onclick=()=>setCurrentPaneDetails(true);
let sidebarFloating=false;
function setSidebarFloating(on){
 const sidebar=$('#studioSidebar'),main=$('#studioMain');sidebarFloating=!!on;sidebar.classList.toggle('studioSidebarFloating',sidebarFloating);main.classList.toggle('sidebarDetached',sidebarFloating);$('#sidebarDetach').textContent=sidebarFloating?'↙ Réancrer':'↗ Détacher';
 if(sidebarFloating&&!sidebar.dataset.studioWinBound){enhanceStudioWindow(sidebar,{key:'pdf-sidebar',title:'PDF Studio · Outils'});sidebar.addEventListener('studio-window-dock',()=>setSidebarFloating(false));sidebar.addEventListener('studio-window-close',()=>{setSidebarFloating(false);main.classList.add('sidebarHidden');$('#sidebarRestore').hidden=false})}
 if(!sidebarFloating){sidebar.classList.remove('studioWindowDocked');sidebar.style.left='';sidebar.style.top='';sidebar.style.right='';sidebar.style.width='';sidebar.style.height='';sidebar.style.transform=''}
}
$('#sidebarDetach').onclick=()=>setSidebarFloating(!sidebarFloating);
$('#sidebarModeQuick').value=loadStudioSettings().sidebarMode||'normal';$('#sidebarModeQuick').addEventListener('change',()=>saveStudioSettings({sidebarMode:$('#sidebarModeQuick').value}));
const resizer=$('#sidebarResizer');let resizing=false;resizer.addEventListener('pointerdown',e=>{resizing=true;resizeWidth=loadStudioSettings().sidebarWidth;resizer.setPointerCapture(e.pointerId)});resizer.addEventListener('pointermove',e=>{if(!resizing)return;resizeWidth=Math.max(220,Math.min(720,e.clientX-10));document.body.style.setProperty('--studio-sidebar-width',resizeWidth+'px')});resizer.addEventListener('pointerup',()=>{resizing=false;if(resizeWidth)saveStudioSettings({sidebarWidth:resizeWidth})});

function bindHelpCatalogActions(host){
 host?.querySelectorAll('[data-help-open]').forEach(b=>b.onclick=()=>document.dispatchEvent(new CustomEvent('studio-v2:action',{detail:{action:b.dataset.helpOpen,source:'help',element:b}})))
}
function renderAllHelp(activeAction=null,host=$('#helpContent'),query=''){renderHelpCatalog(host,studioManifest,{activeAction,query});bindHelpCatalogActions(host)}
function showHelp(action,element=null){
 const base=findFeature(studioManifest,action)||{featureId:'pdf.unknown.'+action,label:action,scope:'pdf',plugin:'pdf-studio',status:'development',capability:'',help:{summary:'Fonction déclarée dans la base de convergence.',details:'La fonction reste visible pendant son raccordement au moteur correspondant.'}};
 lastFeature={...base,uiId:element?.dataset?.uiId||element?.id||base.uiId};activateSidebarTab('properties');$('#activeToolProperties').innerHTML='<b>'+escHtml(lastFeature.label)+'</b><br><code>'+escHtml(lastFeature.featureId)+'</code><br>'+escHtml(lastFeature.help?.summary||'');renderAllHelp(lastFeature.action||action);
 const active=$('#helpContent [data-help-action="'+CSS.escape(lastFeature.action||action)+'"]');active?.scrollIntoView({block:'nearest'})
}
renderAllHelp();
function renderFunctionSearch(){
 const q=$('#functionSearchInput')?.value||'',host=$('#functionSearchResults');if(!host)return;renderHelpCatalog(host,studioManifest,{query:q});bindHelpCatalogActions(host)
}
$('#functionSearchInput')?.addEventListener('input',renderFunctionSearch);$('#functionSearchCollapse')?.addEventListener('click',()=>$('#functionSearchResults')?.querySelectorAll('details').forEach(x=>x.open=false));$('#functionSearchExpand')?.addEventListener('click',()=>$('#functionSearchResults')?.querySelectorAll('details').forEach(x=>x.open=true));renderFunctionSearch();
$('#detachHelp').onclick=()=>{
 let p=$('#floatingHelpWindow');if(!p){p=document.createElement('div');p.id='floatingHelpWindow';p.className='studioWindow floatingHelpWindow';p.hidden=true;p.innerHTML='<div class="studioWindowContent"></div>';document.body.append(p);enhanceStudioWindow(p,{key:'help',title:'Aide contextuelle'});p.addEventListener('studio-window-close',()=>{activateSidebarTab('properties');renderAllHelp(lastFeature?.action||null)})}
 p.hidden=false;const content=p.querySelector('.studioWindowContent');renderHelpCatalog(content,studioManifest,{activeAction:lastFeature?.action||null});bindHelpCatalogActions(content)
};
document.addEventListener('studio-v2:before-specialized-open',e=>{const id=e.detail?.target;if(!id)return;createStudioContext({sourceStudio:'pdf-studio',targetStudio:id,capability:id,fileName:engine.fileName,page:engine.currentPage,selectedPages:[...engine.selected],returnTarget:location.href})});
document.addEventListener('studio-v2:specialized-open-error',e=>setStatus('Studio spécialisé indisponible : '+(e.detail?.error?.message||e.detail?.target||'inconnu')));
document.addEventListener('click',e=>{const b=e.target.closest('[data-studio-action]');if(b&&!b.closest('.studioRibbon'))document.dispatchEvent(new CustomEvent('studio-v2:action',{detail:{action:b.dataset.studioAction,source:'sidebar',element:b}}))});

function openToolSection(id){activateSidebarTab('tools');const x=$(id);if(x){x.open=true;x.scrollIntoView({block:'nearest'})}}
const sectionHelpActions={sectionInput:'openPdf',sectionOutput:'savePdf',sectionNaming:'savePdf',sectionPages:'crop',sectionAssembly:'assemblePdf',sectionStamps:'stamp',sectionAnnotations:'text',sectionOcr:'ocr',sectionOptimize:'optimize',sectionTranslate:'translate',sectionSignature:'signature',sectionCodes:'qr',sectionPageOutput:'headerFooter',sectionConversion:'convert',sectionForms:'forms',sectionRedaction:'redaction',sectionCompare:'compare',sectionBatch:'batch',sectionSecurity:'security',sectionDiagnostics:'history'};
for(const [id,action] of Object.entries(sectionHelpActions)){const s=$('#'+id+'>summary');if(!s||s.querySelector('.sectionHelpButton'))continue;const b=document.createElement('button');b.type='button';b.className='sectionHelpButton';b.textContent='?';b.title='Aide contextuelle';b.onclick=e=>{e.preventDefault();e.stopPropagation();showHelp(action,b)};s.append(b)}

const contextSections={stamp:'#sectionStamps',text:'#sectionAnnotations',highlight:'#sectionAnnotations',pen:'#sectionAnnotations',image:'#sectionAnnotations',signature:'#sectionSignature',redaction:'#sectionRedaction',optimize:'#sectionOptimize',qr:'#sectionCodes',ocr:'#sectionOcr',convert:'#sectionConversion'};
function showRibbonContext(action){
 const host=$('#ribbonContext'),body=$('#ribbonContextBody'),title=$('#ribbonContextTitle');if(!host||!body)return;
 if(!contextSections[action]){host.hidden=true;return}host.hidden=false;title.textContent=findFeature(studioManifest,action)?.label||action;
 const color='<div class="colorHexControl"><input id="ctxColor" type="color" value="'+($('#objectColor')?.value||'#316D9A')+'"><input id="ctxColorHex" value="'+($('#objectColor')?.value||'#316D9A')+'"></div>';
 if(action==='stamp')body.innerHTML='<div class="contextRibbonFields"><label>Portée<select id="ctxStampScope"><option value="current">Page</option><option value="selected">Sélection</option><option value="all">Tout</option></select></label><label>Position<select id="ctxStampPosition"><option value="manual">Manuel</option><option value="top-left">Haut gauche</option><option value="top-right">Haut droite</option><option value="bottom-left">Bas gauche</option><option value="bottom-right">Bas droite</option><option value="center">Centre</option></select></label><button id="ctxStampPlace">Placer</button></div>';
 else if(action==='highlight')body.innerHTML='<div class="contextRibbonFields"><label>Couleur '+color+'</label><label>Opacité <input id="ctxOpacity" type="number" min="5" max="100" value="'+($('#objectOpacity')?.value||35)+'">%</label><button id="ctxActivate">Surligner</button></div>';
 else if(action==='pen')body.innerHTML='<div class="contextRibbonFields"><label>Couleur '+color+'</label><label>Épaisseur <input id="ctxPenWidth" type="number" min="1" max="20" value="'+($('#objectPenWidth')?.value||2)+'"></label><button id="ctxActivate">Stylo</button></div>';
 else if(action==='text')body.innerHTML='<div class="contextRibbonFields"><label>Texte <input id="ctxText" value="'+escHtml($('#objectText')?.value||'Texte')+'"></label><label>Couleur '+color+'</label><button id="ctxActivate">Placer texte</button></div>';
 else if(action==='image')body.innerHTML='<div class="contextRibbonFields"><button id="ctxImageGallery">Galerie personnelle</button><button id="ctxActivate">Placer l’image choisie</button></div>';
 else if(action==='signature')body.innerHTML='<div class="contextRibbonFields"><label>Mode<select id="ctxSignatureMode"><option value="visual">Visuelle</option><option value="digital">Digitale</option><option value="certified">Certifiée</option></select></label><button id="ctxSignaturePlace">Positionner</button></div>';
 else if(action==='redaction')body.innerHTML='<div class="contextRibbonFields"><label>Couleur <input id="ctxRedactionColor" type="color" value="'+($('#redactionColor')?.value||'#000000')+'"></label><span>'+(redactionRasterControl?.value||150)+' DPI</span><button id="ctxActivate">Marquer</button></div>';
 else if(action==='optimize')body.innerHTML='<div class="contextRibbonFields"><span><b>'+(optDpiControl?.value||200)+' DPI</b></span><span>JPEG <b>'+(optJpegControl?.value||82)+' %</b></span><button id="ctxOptimize">Optimiser</button></div>';
 else if(action==='qr')body.innerHTML='<div class="contextRibbonFields"><label>Type<select id="ctxCodeType"><option value="qrcode">QR</option><option value="datamatrix">Data Matrix</option><option value="code128">Code128</option><option value="gs1-128">GS1-128</option><option value="ean13">EAN-13</option><option value="ean8">EAN-8</option></select></label><button id="ctxQrPreview">Aperçu</button><button id="ctxQrApply">Placer</button></div>';
 else body.innerHTML='<div class="contextRibbonFields"><button id="ctxOpenDetails">Ouvrir les paramètres</button></div>';
 const syncCtxColor=()=>{const v=$('#ctxColor')?.value;if(!v)return;if($('#objectColor'))$('#objectColor').value=v;if($('#objectColorHex'))$('#objectColorHex').value=v.toUpperCase();objectLayer.setStyle({color:v})};
 $('#ctxColor')?.addEventListener('input',syncCtxColor);$('#ctxColorHex')?.addEventListener('change',()=>{const v=$('#ctxColorHex').value;if(/^#[0-9a-f]{6}$/i.test(v)){if($('#ctxColor'))$('#ctxColor').value=v;syncCtxColor()}});
 if($('#ctxStampScope')){$('#ctxStampScope').value=$('#stampScope').value;$('#ctxStampPosition').value=$('#stampPosition').value;$('#ctxStampScope').onchange=()=>$('#stampScope').value=$('#ctxStampScope').value;$('#ctxStampPosition').onchange=()=>$('#stampPosition').value=$('#ctxStampPosition').value;$('#ctxStampPlace').onclick=()=>$('#activateStampTool').click()}
 if($('#ctxOpacity'))$('#ctxOpacity').oninput=()=>{$('#objectOpacity').value=$('#ctxOpacity').value;objectLayer.setStyle({opacity:Number($('#ctxOpacity').value)/100})};
 if($('#ctxPenWidth'))$('#ctxPenWidth').oninput=()=>{$('#objectPenWidth').value=$('#ctxPenWidth').value;objectLayer.setStyle({penWidth:Number($('#ctxPenWidth').value)})};
 if($('#ctxText'))$('#ctxText').oninput=()=>{$('#objectText').value=$('#ctxText').value;objectLayer.setText($('#ctxText').value)};
 $('#ctxActivate')?.addEventListener('click',()=>activateObjectTool(action==='redaction'?'redaction':action));
 $('#ctxImageGallery')?.addEventListener('click',()=>{openToolSection('#sectionAnnotations');$('#objectAssetPickerHost')?.scrollIntoView({block:'nearest'})});
 if($('#ctxSignatureMode')){$('#ctxSignatureMode').value=signatureMode;$('#ctxSignatureMode').onchange=()=>setSignatureMode($('#ctxSignatureMode').value);$('#ctxSignaturePlace').onclick=()=>$('#placeVisualSignature').click()}
 if($('#ctxRedactionColor'))$('#ctxRedactionColor').oninput=()=>{$('#redactionColor').value=$('#ctxRedactionColor').value;$('#redactionColorHex').value=$('#ctxRedactionColor').value.toUpperCase();objectLayer.setStyle({redactionColor:$('#ctxRedactionColor').value})};
 $('#ctxOptimize')?.addEventListener('click',()=>$('#runOptimizeQuick').click());if($('#ctxCodeType')){$('#ctxCodeType').value=$('#codeType').value;$('#ctxCodeType').onchange=()=>{const v=$('#ctxCodeType').value;$('#codeType').value=v;$$('[data-code-type]').forEach(x=>x.classList.toggle('active',x.dataset.codeType===v))}}$('#ctxQrPreview')?.addEventListener('click',()=>refreshQrPreview());$('#ctxQrApply')?.addEventListener('click',()=>$('#applyQrQuick').click());$('#ctxOpenDetails')?.addEventListener('click',()=>openToolSection(contextSections[action]))
}
$('#ribbonContextDetails')?.addEventListener('click',()=>{const action=$('#ribbonContext')?.dataset.action;if(action&&contextSections[action])openToolSection(contextSections[action])});

document.addEventListener('studio-v2:action',e=>{const a=e.detail.action;if(contextSections[a]){$('#ribbonContext').dataset.action=a;showRibbonContext(a)}if(a==='openPdf')$('#pickFile').click();else if(a==='openFolder')$('#pickFolder').click();else if(a==='prevFile')$('#filePrev').click();else if(a==='nextFile')$('#fileNext').click();else if(a==='savePdf')saveCurrent();else if(a==='saveZip')saveZip();else if(a==='classifyPdf'){activateSidebarTab('tools');$('#sectionOutput').open=true;$('#sectionOutput').scrollIntoView({block:'nearest'})}else if(a==='rotateLeft')rotate(-90);else if(a==='rotateRight')rotate(90);else if(a==='addPage')addPage();else if(a==='duplicatePage')duplicatePage();else if(a==='deletePage')deletePages();else if(a==='extractPages')extractSelectedPages();else if(a==='assemblePdf'){activateSidebarTab('tools');$('#sectionAssembly').open=true;$('#sectionAssembly').scrollIntoView({block:'nearest'});fillAssemblyFromSelection();}else if(a==='undo')undo();else if(a==='redo')redo();else if(a==='text'){openToolSection('#sectionAnnotations');activateObjectTool('text')}else if(a==='stamp'){openToolSection('#sectionStamps')}else if(a==='highlight'){openToolSection('#sectionAnnotations');activateObjectTool('highlight')}else if(a==='pen'){openToolSection('#sectionAnnotations');activateObjectTool('pen')}else if(a==='image'){openToolSection('#sectionAnnotations');activateObjectTool('image')}else if(a==='signature'){openToolSection('#sectionSignature');setSignatureMode('visual')}else if(a==='redaction'){openToolSection('#sectionRedaction')}else if(a==='ocr')openToolSection('#sectionOcr');else if(a==='optimize')openToolSection('#sectionOptimize');else if(a==='translate')openToolSection('#sectionTranslate');else if(a==='qr')openToolSection('#sectionCodes');else if(a==='convert')openToolSection('#sectionConversion');else if(a==='headerFooter')openToolSection('#sectionPageOutput');else if(a==='crop')openToolSection('#sectionPages');else if(a==='forms')openToolSection('#sectionForms');else if(a==='compare')openToolSection('#sectionCompare');else if(a==='security'||a==='metadata')openToolSection('#sectionSecurity');else if(a==='history')activateSidebarTab('history');else if(a==='commands')document.dispatchEvent(new Event('studio-v2:open-command-palette'));else if(a==='workflows')document.dispatchEvent(new Event('studio-v2:open-workflows'));else showHelp(a,e.detail.element||null)});
document.addEventListener('studio-v2:menu',e=>{if(e.detail.tab==='help')activateSidebarTab('properties');if(e.detail.tab==='history')activateSidebarTab('history');if(e.detail.tab==='search')activateSidebarTab('search');if(e.detail.tab==='view')$('#studioVisibilityOpen')?.click();if(e.detail.tab==='file')$('#sectionInput').open=true});
document.addEventListener('studio-v2:repeat-action',e=>{const a=e.detail?.action;if(a==='rotateLeft')rotate(-90);else if(a==='rotateRight')rotate(90);else if(a==='addPage')addPage();else if(a==='duplicatePage')duplicatePage();else if(a==='savePdf')saveCurrent();else showHelp(a||'history')});
registerPipelineHandler('rotateLeft',async()=>{await rotate(-90);return engine});registerPipelineHandler('rotateRight',async()=>{await rotate(90);return engine});registerPipelineHandler('addPage',async()=>{await addPage();return engine});registerPipelineHandler('duplicatePage',async()=>{await duplicatePage();return engine});registerPipelineHandler('savePdf',async()=>{await saveCurrent();return engine});
document.addEventListener('studio-v2:workflow-run',async e=>{const steps=(e.detail?.steps||[]).map(action=>({capability:action}));if(!steps.length)return;try{await runPipeline({steps,context:{input:engine,studio:'pdf-studio',fileName:engine.fileName},onProgress:x=>setStatus('Workflow '+(x.index+1)+'/'+x.total+' · '+x.capability)})}catch(err){setStatus('Workflow interrompu : '+err.message)}});

$('#copyDiagnostics').onclick=async()=>{const tests=runCapabilitySelfTests({manifest:studioManifest,root:document}),info={studio:'pdf-studio',version:runtimeVersion.studioVersion,coreVersion:runtimeVersion.coreVersion,documentSession:session.snapshot(),file:engine.fileName,pages:engine.pageCount,currentPage:engine.currentPage,selectedPages:[...engine.selected],fileCollection:{count:fileBrowser.items.length,selected:fileBrowser.selected.size,view:fileBrowser.view,sort:fileBrowser.sortMode,groupBy:fileBrowser.groupBy},pagesPerRow:viewer.pagesPerRow,zoom:viewer.zoom,previewScale:viewer.previewScale,previewColumns:viewer.previewColumns,fileCapabilities:activeFileCapabilities,capabilityTests:tests,userAgent:navigator.userAgent};await navigator.clipboard?.writeText(JSON.stringify(info,null,2));setStatus('Diagnostic copié')};
window.__NLAB_PDF_STUDIO__={engine,objectLayer,viewer,session,getAnnotations:(page=engine.currentPage)=>engine.annotations(page),getAllAnnotations:()=>[...engine.pageAnnotations.entries()].map(([page,items])=>({page,type:typeof page,items:items.map(x=>({id:x.id,type:x.type,subtype:x.subtype,wPct:x.wPct}))})),version:runtimeVersion};
updateNamingPreview();updateOutputPreview();setStatus('PDF Studio '+runtimeVersion.studioStatus+' v'+runtimeVersion.studioVersion+' · Studio Core v'+runtimeVersion.coreVersion+' prêt');
