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
import{mountDropZone}from'../../_shared/studio-v2/drop-zone.js';
import{loadStudioSettings,saveStudioSettings}from'../../_shared/studio-v2/settings.js';
import{lightweightThumbnail}from'../../_shared/studio-v2/thumbnail-service.js';
import{TemplateEngine,templateVariableHelp}from'../../_shared/studio-v2/template-engine.js';
import{OutputService}from'../../_shared/studio-v2/output-service.js';
import{acceptAttribute,isSupportedFile,formatInfo}from'../../_shared/studio-v2/format-registry.js';
import{enhanceStudioWindow}from'../../_shared/studio-v2/window-system.js';

const VERSION='2.1.0';
await mountStudioV2({manifest:studioManifest,versionInfo:{version:VERSION,status:'TEST'}});
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const engine=new PDFEngine(),session=new DocumentSession(),templates=new TemplateEngine(),output=new OutputService();
let undoStack=[],redoStack=[],loadedFiles=[],activeFileCapabilities=null,lastFeature=null,resizeWidth=null;

$('#fileInput').accept=acceptAttribute();
const fileBrowser=new CollectionBrowser({host:$('#fileCollection'),view:'list',key:'pdf-files',getThumbnail:item=>lightweightThumbnail(item.data)});
fileBrowser.addEventListener('activate',e=>{const file=e.detail?.data;if(file)load(file)});
fileBrowser.addEventListener('selection',()=>syncViewerMeta());
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
async function undo(){if(!undoStack.length||!engine.pageCount)return;redoStack.push(await engine.baseBytes());await engine.setBytes(undoStack.pop());syncSession();await renderAll();syncUndoRedo();setStatus('Modification annulée');recordHistory({studio:'pdf-studio',type:'action',label:'Annulation',target:engine.fileName})}
async function redo(){if(!redoStack.length||!engine.pageCount)return;undoStack.push(await engine.baseBytes());await engine.setBytes(redoStack.pop());syncSession();await renderAll();syncUndoRedo();setStatus('Modification rétablie');recordHistory({studio:'pdf-studio',type:'action',label:'Rétablissement',target:engine.fileName})}

function namingExtra(){const item=fileBrowser.active();return{RELATIVE_PATH:item?.relativePath||engine.sourceFile?.webkitRelativePath||engine.fileName,PATH:item?.relativePath||engine.fileName,FILESIZE:String(engine.sourceFile?.size||0),PAGES:String(engine.pageCount||1),PAGE:String(engine.currentPage||1),SELECTED_COUNT:String(engine.selected.size),INDEX:String(Math.max(1,fileBrowser.items.findIndex(x=>x.id===fileBrowser.activeId)+1))}}
function outputName(extension='.pdf'){return templates.buildName(engine.sourceFile?.name||engine.fileName,{prefix:$('#namingPrefix').value,template:$('#namingTemplate').value||'{FILENAME}',suffix:$('#namingSuffix').value,extension,extra:namingExtra()})}
function updateNamingPreview(){const ext=$('#outputFormat').value==='same'?('.'+(formatInfo(engine.sourceFile).extension||'pdf')):'.pdf';$('#namingPreview').textContent=outputName(ext)}
function outputContext(){return templates.context(engine.sourceFile?.name||engine.fileName,namingExtra())}
function outputParts(){const mode=$('#outputStructure').value,custom=templates.resolve($('#outputPathTemplate').value,engine.fileName,outputContext());return output.structureParts(mode,outputContext(),custom)}
function updateOutputPreview(){const provider=$('#outputProvider').value==='local'?(output.handle?'Dossier : '+output.handle.name:'Dossier local non choisi'):'Téléchargement navigateur',parts=outputParts();$('#outputPathPreview').textContent=provider+(parts.length?' / '+parts.join(' / '):' / racine')}
['namingTemplate','namingPrefix','namingSuffix'].forEach(id=>$('#'+id).addEventListener('input',updateNamingPreview));
['outputFormat','outputProvider','outputStructure','outputPathTemplate'].forEach(id=>$('#'+id).addEventListener('input',()=>{updateNamingPreview();updateOutputPreview()}));
$('#namingVariables').innerHTML=templateVariableHelp().map(x=>'<code>{'+x.name+'}</code><span>'+x.description+'</span>').join('');

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
  await engine.loadFile(file);undoStack=[];redoStack=[];syncUndoRedo();viewer.setZoom(1);viewer.setPagesPerRow(1);syncSession();await renderAll();
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
async function rotate(delta,pagesOverride=null){if(!engine.pageCount)return;const pages=pagesOverride||engine.targetPages($('#pageScope').value);if(!pages.length)return;await checkpoint();await engine.rotate(pages,delta);await renderAll();setStatus('Rotation '+(delta>0?'+90°':'−90°'));recordHistory({studio:'pdf-studio',type:'action',label:'Rotation '+(delta>0?'+90°':'−90°'),detail:pages.length+' page(s)',target:engine.fileName,action:delta>0?'rotateRight':'rotateLeft',repeatable:true})}
async function addPage(){if(!engine.pageCount)return;await checkpoint();await engine.addBlank(engine.pageCount);await renderAll();setStatus('Page ajoutée');recordHistory({studio:'pdf-studio',type:'action',label:'Page ajoutée',target:engine.fileName,action:'addPage',repeatable:true})}
async function duplicatePage(){if(!engine.pageCount)return;await checkpoint();await engine.duplicate(engine.currentPage);await renderAll();setStatus('Page dupliquée');recordHistory({studio:'pdf-studio',type:'action',label:'Page dupliquée',target:engine.fileName,action:'duplicatePage',repeatable:true})}
async function deletePageNumber(page){if(!engine.pageCount)return;await checkpoint();try{await engine.deletePages([page]);await renderAll();setStatus('Page '+page+' supprimée')}catch(e){setStatus(e.message)}}
async function deletePages(){if(!engine.pageCount)return;const pages=engine.targetPages($('#pageScope').value);if(!pages.length)return;await checkpoint();try{await engine.deletePages(pages);await renderAll();setStatus('Page(s) supprimée(s)')}catch(e){setStatus(e.message)}}
async function deleteSelected(){if(!engine.selected.size)return;await checkpoint();try{await engine.deletePages([...engine.selected]);await renderAll();setStatus('Sélection supprimée')}catch(e){setStatus(e.message)}}
async function currentBlob(){return new Blob([await engine.baseBytes()],{type:'application/pdf'})}
async function saveCurrent({classify=false,forcePicker=false}={}){
 if(!engine.pageCount)return;const format=$('#outputFormat').value;if(format==='zip')return saveZip({classify});
 let blob,name;if(format==='same'&&engine.sourceFile){blob=engine.sourceFile;name=outputName('.'+(formatInfo(engine.sourceFile).extension||'bin'))}else{blob=await currentBlob();name=outputName('.pdf')}
 if(forcePicker&&window.showSaveFilePicker){const h=await showSaveFilePicker({suggestedName:name,types:[{description:'Document',accept:{[blob.type||'application/octet-stream']:['.'+(name.split('.').pop()||'pdf')]}}]}),w=await h.createWritable();await w.write(blob);await w.close()}
 else{if($('#outputProvider').value==='local'&&!output.handle)await output.chooseDirectory();await output.saveBlob(blob,name,{parts:classify?outputParts():[]})}
 setStatus('Enregistré : '+name);recordHistory({studio:'pdf-studio',type:'action',label:classify?'Enregistrer + classer':'Enregistrer',detail:(classify?outputParts().join('/'):'')||'racine',target:name,action:'savePdf',repeatable:true})
}
async function saveZip({classify=false}={}){if(!engine.pageCount)return;const pdf=await engine.baseBytes(),pdfName=outputName('.pdf'),zipName=outputName('.zip');if($('#outputProvider').value==='local'&&!output.handle)await output.chooseDirectory();const old=output.handle;if($('#outputProvider').value!=='local')output.handle=null;await output.saveZip([{name:pdfName,data:pdf}],zipName,{parts:classify?outputParts():[]});output.handle=old;setStatus('ZIP enregistré : '+zipName);recordHistory({studio:'pdf-studio',type:'action',label:classify?'ZIP enregistré + classé':'ZIP enregistré',detail:classify?outputParts().join('/'):'',target:zipName})}

$('#pickFile').onclick=()=>$('#fileInput').click();$('#fileInput').onchange=e=>loadFiles(e.target.files||[]);
$('#pickFolder').onclick=()=>$('#folderInput').click();$('#folderInput').onchange=e=>loadFiles(e.target.files||[]);
mountDropZone($('#inputDropZone'),{onFiles:loadFiles});
$('#loadLastSource').onclick=()=>setStatus('Réouverture de source mémorisée : prévue dans InputSelectionService Core.');
$('#pickOutputFolder').onclick=async()=>{try{await output.chooseDirectory();$('#outputProvider').value='local';updateOutputPreview();setStatus('Dossier de sortie : '+output.handle.name)}catch(e){setStatus(e.message)}};
$('#loadLastOutput').onclick=async()=>{try{await output.loadLastDirectory();$('#outputProvider').value='local';updateOutputPreview();setStatus('Dernière sortie : '+output.handle.name)}catch(e){setStatus(e.message)}};
$('#savePdfSide').onclick=()=>saveCurrent();$('#saveZipSide').onclick=saveZip;$('#saveAndClassify').onclick=()=>saveCurrent({classify:true});$('#saveAs').onclick=()=>saveCurrent({forcePicker:true});

function goPage(p){if(!engine.pageCount)return;engine.selectPage(p);session.setPage(engine.currentPage);syncViewerMeta()}
$('#firstPage').onclick=()=>goPage(1);$('#prevPage').onclick=()=>goPage(engine.currentPage-1);$('#nextPage').onclick=()=>goPage(engine.currentPage+1);$('#lastPage').onclick=()=>goPage(engine.pageCount);$('#pageNumberInput').addEventListener('change',()=>goPage(Number($('#pageNumberInput').value)||1));
$('#zoomOut').onclick=async()=>{viewer.setPagesPerRow(1);viewer.setZoom(viewer.zoom-.1);await viewer.renderMain();syncViewerMeta()};$('#zoomIn').onclick=async()=>{viewer.setPagesPerRow(1);viewer.setZoom(viewer.zoom+.1);await viewer.renderMain();syncViewerMeta()};$('#zoomInput').addEventListener('change',async()=>{viewer.setPagesPerRow(1);viewer.setZoom(Number($('#zoomInput').value)/100);await viewer.renderMain();syncViewerMeta()});$('#fitWidth').onclick=async()=>{viewer.setPagesPerRow(1);viewer.setZoom(viewer.fitScale($('#canvasStage'),1));await viewer.renderMain();syncViewerMeta()};$('#pagesPerRow').addEventListener('change',async()=>{viewer.setPagesPerRow($('#pagesPerRow').value);await viewer.renderMain();syncViewerMeta()});
$('#previewColumns').addEventListener('change',async()=>{viewer.setPreviewColumns($('#previewColumns').value);await viewer.renderPreview();syncViewerMeta()});
const setPreviewZoom=async v=>{viewer.setPreviewScale(v);await viewer.renderPreview();syncViewerMeta()};$('#previewZoom').addEventListener('input',()=>setPreviewZoom(Number($('#previewZoom').value)/100));$('#previewZoomOut').onclick=()=>setPreviewZoom(viewer.previewScale-.02);$('#previewZoomIn').onclick=()=>setPreviewZoom(viewer.previewScale+.02);
$('#previewSelectAll').onclick=async()=>{engine.selectAll();session.selectedPages=new Set(engine.selected);await viewer.renderPreview();syncViewerMeta()};$('#previewSelectNone').onclick=async()=>{engine.selectNone();session.selectedPages.clear();await viewer.renderPreview();syncViewerMeta()};$('#previewAddPage').onclick=addPage;$('#previewDeleteSelected').onclick=deleteSelected;$('#previewRotateLeft').onclick=()=>rotate(-90);$('#previewRotateRight').onclick=()=>rotate(90);
$('#history-undo').onclick=undo;$('#history-redo').onclick=redo;$('#history-view-all-inline').onclick=()=>$('#history-view-all')?.click();$('[data-open-core-settings]').onclick=()=>$('#studioCoreSettings')?.click();$('#sidebar-open-workflows').onclick=()=>document.dispatchEvent(new Event('studio-v2:open-workflows'));

function activateSidebarTab(tab){$$('[data-sidebar-tab]').forEach(x=>x.classList.toggle('active',x.dataset.sidebarTab===tab));$$('[data-sidebar-pane]').forEach(x=>{const on=x.dataset.sidebarPane===tab;x.hidden=!on;x.classList.toggle('active',on)})}
$$('[data-sidebar-tab]').forEach(b=>b.onclick=()=>activateSidebarTab(b.dataset.sidebarTab));$('#sidebar-collapse-all').onclick=()=>$$('#sidebar-pane-tools details').forEach(x=>x.open=false);$('#sidebar-expand-all').onclick=()=>$$('#sidebar-pane-tools details').forEach(x=>x.open=true);
$('#sidebarModeQuick').value=loadStudioSettings().sidebarMode||'normal';$('#sidebarModeQuick').addEventListener('change',()=>saveStudioSettings({sidebarMode:$('#sidebarModeQuick').value}));
const resizer=$('#sidebarResizer');let resizing=false;resizer.addEventListener('pointerdown',e=>{resizing=true;resizeWidth=loadStudioSettings().sidebarWidth;resizer.setPointerCapture(e.pointerId)});resizer.addEventListener('pointermove',e=>{if(!resizing)return;resizeWidth=Math.max(220,Math.min(720,e.clientX-10));document.body.style.setProperty('--studio-sidebar-width',resizeWidth+'px')});resizer.addEventListener('pointerup',()=>{resizing=false;if(resizeWidth)saveStudioSettings({sidebarWidth:resizeWidth})});

function showHelp(action,element=null){const base=findFeature(studioManifest,action)||{featureId:'pdf.unknown.'+action,label:action,scope:'pdf',plugin:'pdf-studio',status:'development',capability:'',help:{summary:'Fonction déclarée dans la base de convergence.',details:'La fonction reste visible pendant son raccordement au moteur correspondant.'}};lastFeature={...base,uiId:element?.dataset?.uiId||element?.id||base.uiId};renderFeatureHelp($('#helpContent'),lastFeature);activateSidebarTab('help');$('#activeToolProperties').innerHTML='<b>'+lastFeature.label+'</b><br><code>'+lastFeature.featureId+'</code><br>'+String(lastFeature.help?.summary||'')}
$('#propertiesToHelp').onclick=()=>activateSidebarTab('help');$('#detachHelp').onclick=()=>{let p=$('#floatingHelpWindow');if(!p){p=document.createElement('div');p.id='floatingHelpWindow';p.className='studioWindow floatingHelpWindow';p.hidden=true;document.body.append(p);enhanceStudioWindow(p,{key:'help',title:'Aide contextuelle'})}p.hidden=false;renderFeatureHelp(p,lastFeature||{label:'PDF Studio',help:{summary:'Aide contextuelle'}})};
function openAdvancedStudio(id){createStudioContext({sourceStudio:'pdf-studio',targetStudio:id,capability:id,fileName:engine.fileName,page:engine.currentPage,selectedPages:[...engine.selected],returnTarget:location.href});const u=new URL(studioManifest.studiosHref,location.href);u.searchParams.set('target',id);u.searchParams.set('return','pdf-studio');location.href=u.href}
$$('[data-advanced-studio]').forEach(b=>b.onclick=()=>openAdvancedStudio(b.dataset.advancedStudio));document.addEventListener('click',e=>{const b=e.target.closest('[data-studio-action]');if(b&&!b.closest('.studioRibbon'))document.dispatchEvent(new CustomEvent('studio-v2:action',{detail:{action:b.dataset.studioAction,source:'sidebar',element:b}}))});

document.addEventListener('studio-v2:action',e=>{const a=e.detail.action;if(a==='openPdf')$('#pickFile').click();else if(a==='openFolder')$('#pickFolder').click();else if(a==='prevFile')$('#filePrev').click();else if(a==='nextFile')$('#fileNext').click();else if(a==='savePdf')saveCurrent();else if(a==='saveZip')saveZip();else if(a==='classifyPdf'){activateSidebarTab('tools');$('#sectionOutput').open=true;$('#sectionOutput').scrollIntoView({block:'nearest'})}else if(a==='rotateLeft')rotate(-90);else if(a==='rotateRight')rotate(90);else if(a==='addPage')addPage();else if(a==='duplicatePage')duplicatePage();else if(a==='deletePage')deletePages();else if(a==='undo')undo();else if(a==='redo')redo();else if(a==='history')activateSidebarTab('history');else if(a==='commands')document.dispatchEvent(new Event('studio-v2:open-command-palette'));else if(a==='workflows')document.dispatchEvent(new Event('studio-v2:open-workflows'));else showHelp(a,e.detail.element||null)});
document.addEventListener('studio-v2:menu',e=>{if(e.detail.tab==='help')activateSidebarTab('help');if(e.detail.tab==='history')activateSidebarTab('history');if(e.detail.tab==='view')$('#studioVisibilityOpen')?.click();if(e.detail.tab==='file')$('#sectionInput').open=true});
document.addEventListener('studio-v2:repeat-action',e=>{const a=e.detail?.action;if(a==='rotateLeft')rotate(-90);else if(a==='rotateRight')rotate(90);else if(a==='addPage')addPage();else if(a==='duplicatePage')duplicatePage();else if(a==='savePdf')saveCurrent();else showHelp(a||'history')});
registerPipelineHandler('rotateLeft',async()=>{await rotate(-90);return engine});registerPipelineHandler('rotateRight',async()=>{await rotate(90);return engine});registerPipelineHandler('addPage',async()=>{await addPage();return engine});registerPipelineHandler('duplicatePage',async()=>{await duplicatePage();return engine});registerPipelineHandler('savePdf',async()=>{await saveCurrent();return engine});
document.addEventListener('studio-v2:workflow-run',async e=>{const steps=(e.detail?.steps||[]).map(action=>({capability:action}));if(!steps.length)return;try{await runPipeline({steps,context:{input:engine,studio:'pdf-studio',fileName:engine.fileName},onProgress:x=>setStatus('Workflow '+(x.index+1)+'/'+x.total+' · '+x.capability)})}catch(err){setStatus('Workflow interrompu : '+err.message)}});

$('#copyDiagnostics').onclick=async()=>{const tests=runCapabilitySelfTests({manifest:studioManifest,root:document}),info={studio:'pdf-studio',version:VERSION,documentSession:session.snapshot(),file:engine.fileName,pages:engine.pageCount,currentPage:engine.currentPage,selectedPages:[...engine.selected],fileCollection:{count:fileBrowser.items.length,selected:fileBrowser.selected.size,view:fileBrowser.view,sort:fileBrowser.sortMode,groupBy:fileBrowser.groupBy},pagesPerRow:viewer.pagesPerRow,zoom:viewer.zoom,previewScale:viewer.previewScale,previewColumns:viewer.previewColumns,fileCapabilities:activeFileCapabilities,capabilityTests:tests,userAgent:navigator.userAgent};await navigator.clipboard?.writeText(JSON.stringify(info,null,2));setStatus('Diagnostic copié')};
updateNamingPreview();updateOutputPreview();setStatus('PDF Studio TEST '+VERSION+' prêt');
