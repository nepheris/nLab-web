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

const VERSION='2.0.2';
await mountStudioV2({manifest:studioManifest,versionInfo:{version:VERSION,status:'TEST'}});
const $=s=>document.querySelector(s);
const $$=s=>[...document.querySelectorAll(s)];
const engine=new PDFEngine();
const session=new DocumentSession();
let undoStack=[],redoStack=[],loadedFiles=[],activeFileCapabilities=null;
const fileBrowser=new CollectionBrowser({host:$('#fileCollection'),view:'list',key:'pdf-files'});
fileBrowser.addEventListener('activate',e=>{const file=e.detail?.data;if(file)load(file)});
$('#fileCollectionView').value=fileBrowser.view;
$('#fileCollectionView').addEventListener('change',()=>fileBrowser.setView($('#fileCollectionView').value));
$('#fileSelectAll').onclick=()=>fileBrowser.selectAll();
$('#fileSelectNone').onclick=()=>fileBrowser.clearSelection();

const viewer=new StudioPageViewer({
  engine,
  mainHost:$('#mainPageGrid'),
  previewHost:$('#previewGrid'),
  onActivate:page=>{session.setPage(page);syncViewerMeta()},
  onSelection:pages=>{session.selectedPages=new Set(pages);session.dispatchEvent(new Event('selection'));syncViewerMeta()}
});

function syncUndoRedo(){const u=$('#history-undo'),r=$('#history-redo');if(u)u.disabled=!undoStack.length;if(r)r.disabled=!redoStack.length}
async function checkpoint(){if(!engine.pageCount)return;undoStack.push(await engine.baseBytes());if(undoStack.length>30)undoStack.shift();redoStack=[];syncUndoRedo()}
async function undo(){if(!undoStack.length||!engine.pageCount)return;redoStack.push(await engine.baseBytes());await engine.setBytes(undoStack.pop());await renderAll();syncUndoRedo();setStatus('Modification annulée');recordHistory({studio:'pdf-studio',type:'action',label:'Annulation',target:engine.fileName})}
async function redo(){if(!redoStack.length||!engine.pageCount)return;undoStack.push(await engine.baseBytes());await engine.setBytes(redoStack.pop());await renderAll();syncUndoRedo();setStatus('Modification rétablie');recordHistory({studio:'pdf-studio',type:'action',label:'Rétablissement',target:engine.fileName})}

function download(bytes,name){const blob=new Blob([bytes],{type:'application/pdf'}),a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=name||'document.pdf';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1200)}
function syncViewerMeta(){
  $('#pageNumberInput').value=engine.currentPage||1;
  $('#pageNumberInput').max=Math.max(1,engine.pageCount);
  $('#pageInfo').textContent='/ '+engine.pageCount;
  $('#zoomInput').value=Math.round(viewer.zoom*100);
  $('#pagesPerRow').value=viewer.pagesPerRow;
  $('#previewColumns').value=viewer.previewColumns;
  const capInfo=activeFileCapabilities?.extension?(' · '+activeFileCapabilities.extension.toUpperCase()):'';
  $('#sourceStatus').textContent=engine.pageCount?engine.fileName+' · '+engine.pageCount+' page(s) · '+engine.selected.size+' sélectionnée(s)'+capInfo:'Aucun document chargé.';
  viewer.refreshActive();
}
async function renderAll(){if(!engine.pageCount){$('#mainPageGrid').innerHTML='';$('#previewGrid').innerHTML='';syncViewerMeta();return}await viewer.renderMain();await viewer.renderPreview();syncViewerMeta()}
async function load(file){
  if(!file)return;
  setStatus('Chargement…');
  try{
    activeFileCapabilities=detectFileCapabilities(file);
    await engine.loadFile(file);
    session.patch({file,fileName:engine.fileName,page:engine.currentPage,pageCount:engine.pageCount,selectedPages:new Set(),dirty:false,meta:{sourceCapabilities:activeFileCapabilities}});undoStack=[];redoStack=[];syncUndoRedo();viewer.setZoom(1);viewer.setPagesPerRow(1);await renderAll();
    const converted=!/\.pdf$/i.test(file.name)&&!/^image\//.test(file.type||'')?' · conversion PDF simplifiée':'';
    setStatus('Document chargé'+converted);
    recordHistory({studio:'pdf-studio',type:'file',label:'Fichier chargé',detail:engine.pageCount+' page(s)',target:engine.fileName});
  }catch(e){setStatus('Erreur : '+e.message)}
}
async function loadFiles(files){
  loadedFiles=[...files];
  fileBrowser.setItems(loadedFiles.map((file,i)=>({id:'file-'+i+'-'+file.name,label:file.name,subtitle:(file.relativePath||'')+(file.size?' · '+Math.round(file.size/1024)+' Ko':''),data:file})));
  const compatible=loadedFiles.find(x=>/\.(pdf|png|jpe?g|webp|txt|docx|odt)$/i.test(x.name));
  if(compatible){fileBrowser.activate(fileBrowser.items.find(x=>x.data===compatible)?.id);await load(compatible)}
  else setStatus('Aucun fichier compatible');
}
async function rotate(delta){if(!engine.pageCount)return;await checkpoint();await engine.rotate(engine.targetPages($('#pageScope').value),delta);await renderAll();setStatus('Rotation '+(delta>0?'+90°':'−90°'));recordHistory({studio:'pdf-studio',type:'action',label:'Rotation '+(delta>0?'+90°':'−90°'),detail:'Portée : '+$('#pageScope').value,target:engine.fileName,action:delta>0?'rotateRight':'rotateLeft',repeatable:true})}
async function addPage(){if(!engine.pageCount)return;await checkpoint();await engine.addBlank(engine.pageCount);await renderAll();setStatus('Page ajoutée en fin de document');recordHistory({studio:'pdf-studio',type:'action',label:'Page ajoutée',target:engine.fileName,action:'addPage',repeatable:true})}
async function deletePages(){if(!engine.pageCount)return;const pages=engine.targetPages($('#pageScope').value);if(!pages.length)return;await checkpoint();try{await engine.deletePages(pages);await renderAll();setStatus('Page(s) supprimée(s)')}catch(e){setStatus(e.message)}}
async function deleteSelected(){if(!engine.selected.size)return;await checkpoint();try{await engine.deletePages([...engine.selected]);await renderAll();setStatus('Sélection supprimée')}catch(e){setStatus(e.message)}}
async function save(){if(!engine.pageCount)return;download(await engine.baseBytes(),engine.fileName.replace(/\.pdf$/i,'')+'-v2.pdf');setStatus('PDF enregistré');recordHistory({studio:'pdf-studio',type:'action',label:'PDF enregistré',target:engine.fileName,action:'savePdf',repeatable:true})}

$('#pickFile').onclick=()=>$('#fileInput').click();
$('#fileInput').onchange=e=>loadFiles(e.target.files||[]);
$('#pickFolder').onclick=()=>$('#folderInput').click();
$('#folderInput').onchange=e=>loadFiles(e.target.files||[]);

mountDropZone($('#inputDropZone'),{onFiles:loadFiles});

$('#firstPage').onclick=()=>{if(engine.pageCount){engine.selectPage(1);syncViewerMeta()}};
$('#prevPage').onclick=()=>{if(engine.currentPage>1){engine.selectPage(engine.currentPage-1);syncViewerMeta()}};
$('#nextPage').onclick=()=>{if(engine.currentPage<engine.pageCount){engine.selectPage(engine.currentPage+1);syncViewerMeta()}};
$('#lastPage').onclick=()=>{if(engine.pageCount){engine.selectPage(engine.pageCount);syncViewerMeta()}};
$('#pageNumberInput').addEventListener('change',()=>{if(engine.pageCount){engine.selectPage(Number($('#pageNumberInput').value)||1);syncViewerMeta()}});

$('#zoomOut').onclick=async()=>{viewer.setPagesPerRow(1);viewer.setZoom(viewer.zoom-.1);await viewer.renderMain();syncViewerMeta()};
$('#zoomIn').onclick=async()=>{viewer.setPagesPerRow(1);viewer.setZoom(viewer.zoom+.1);await viewer.renderMain();syncViewerMeta()};
$('#zoomInput').addEventListener('change',async()=>{viewer.setPagesPerRow(1);viewer.setZoom(Number($('#zoomInput').value)/100);await viewer.renderMain();syncViewerMeta()});
$('#fitWidth').onclick=async()=>{viewer.setPagesPerRow(1);viewer.setZoom(viewer.fitScale($('#canvasStage'),1));await viewer.renderMain();syncViewerMeta()};
$('#pagesPerRow').addEventListener('change',async()=>{viewer.setPagesPerRow($('#pagesPerRow').value);await viewer.renderMain();syncViewerMeta()});
$('#previewColumns').addEventListener('change',async()=>{viewer.setPreviewColumns($('#previewColumns').value);await viewer.renderPreview();syncViewerMeta()});

$('#previewSelectAll').onclick=async()=>{engine.selectAll();await viewer.renderPreview();syncViewerMeta()};
$('#previewSelectNone').onclick=async()=>{engine.selectNone();await viewer.renderPreview();syncViewerMeta()};
$('#previewAddPage').onclick=addPage;
$('#previewDeleteSelected').onclick=deleteSelected;
$('#rotateLeftSide').onclick=()=>rotate(-90);$('#rotateRightSide').onclick=()=>rotate(90);$('#addPageSide').onclick=addPage;$('#deletePageSide').onclick=deletePages;$('#savePdfSide').onclick=save;
$('#history-undo').onclick=undo;$('#history-redo').onclick=redo;
$('#history-view-all-inline').onclick=()=>$('#history-view-all')?.click();
$('[data-open-core-settings]').onclick=()=>$('#studioCoreSettings')?.click();
$('#sidebar-open-workflows').onclick=()=>document.dispatchEvent(new Event('studio-v2:open-workflows'));

function activateSidebarTab(tab){
  $$('[data-sidebar-tab]').forEach(x=>x.classList.toggle('active',x.dataset.sidebarTab===tab));
  $$('[data-sidebar-pane]').forEach(x=>{const on=x.dataset.sidebarPane===tab;x.hidden=!on;x.classList.toggle('active',on)});
}
$$('[data-sidebar-tab]').forEach(b=>b.onclick=()=>activateSidebarTab(b.dataset.sidebarTab));
$('#sidebar-collapse-all').onclick=()=>$$('#sidebar-pane-tools details').forEach(x=>x.open=false);
$('#sidebar-expand-all').onclick=()=>$$('#sidebar-pane-tools details').forEach(x=>x.open=true);

const resizer=$('#sidebarResizer');
let resizing=false;
resizer.addEventListener('pointerdown',e=>{resizing=true;resizer.setPointerCapture(e.pointerId)});
resizer.addEventListener('pointermove',e=>{if(!resizing)return;const w=Math.max(220,Math.min(720,e.clientX-10));document.body.style.setProperty('--studio-sidebar-width',w+'px');localStorage.setItem('nlab-studio-v2-sidebar-width-live',String(w))});
resizer.addEventListener('pointerup',()=>resizing=false);
const savedWidth=Number(localStorage.getItem('nlab-studio-v2-sidebar-width-live'));if(savedWidth)document.body.style.setProperty('--studio-sidebar-width',savedWidth+'px');

function showHelp(action,element=null){
  const base=findFeature(studioManifest,action)||{featureId:'pdf.unknown.'+action,label:action,scope:'pdf',plugin:'pdf-studio',status:'development',capability:'',help:{summary:'Fonction non encore reconnectée.',details:'La fonction reste déclarée pour la convergence avec les versions historiques.'}};
  const feature={...base,uiId:element?.dataset?.uiId||element?.id||base.uiId};
  renderFeatureHelp($('#helpContent'),feature);activateSidebarTab('help');
  $('#activeToolProperties').innerHTML='<b>'+feature.label+'</b><br><code>'+feature.featureId+'</code><br>'+String(feature.help?.summary||'');
}
function openAdvancedStudio(id){
  createStudioContext({sourceStudio:'pdf-studio',targetStudio:id,capability:id,fileName:engine.fileName,page:engine.currentPage,selectedPages:[...engine.selected],returnTarget:location.href});
  const u=new URL(studioManifest.studiosHref,location.href);u.searchParams.set('target',id);u.searchParams.set('return','pdf-studio');location.href=u.href;
}
$$('[data-advanced-studio]').forEach(b=>b.onclick=()=>openAdvancedStudio(b.dataset.advancedStudio));
document.addEventListener('click',e=>{const b=e.target.closest('[data-studio-action]');if(b&&!b.closest('.studioRibbon'))document.dispatchEvent(new CustomEvent('studio-v2:action',{detail:{action:b.dataset.studioAction,source:'sidebar',element:b}}))});

document.addEventListener('studio-v2:action',e=>{
  const a=e.detail.action;
  if(a==='openPdf')$('#pickFile').click();
  else if(a==='openFolder')$('#pickFolder').click();
  else if(a==='savePdf')save();
  else if(a==='rotateLeft')rotate(-90);
  else if(a==='rotateRight')rotate(90);
  else if(a==='addPage')addPage();
  else if(a==='deletePage')deletePages();
  else if(a==='history')activateSidebarTab('history');
  else if(a==='commands')document.dispatchEvent(new Event('studio-v2:open-command-palette'));
  else if(a==='workflows')document.dispatchEvent(new Event('studio-v2:open-workflows'));
  else showHelp(a,e.detail.element||null);
});
document.addEventListener('studio-v2:menu',e=>{if(e.detail.tab==='help')activateSidebarTab('help');if(e.detail.tab==='history')activateSidebarTab('history');if(e.detail.tab==='view')$('#studioCoreSettings')?.click()});
document.addEventListener('studio-v2:repeat-action',e=>{const a=e.detail?.action;if(a==='rotateLeft')rotate(-90);else if(a==='rotateRight')rotate(90);else if(a==='addPage')addPage();else if(a==='savePdf')save();else showHelp(a||'history')});

registerPipelineHandler('rotateLeft',async()=>{await rotate(-90);return engine});
registerPipelineHandler('rotateRight',async()=>{await rotate(90);return engine});
registerPipelineHandler('addPage',async()=>{await addPage();return engine});
registerPipelineHandler('savePdf',async()=>{await save();return engine});
document.addEventListener('studio-v2:workflow-run',async e=>{
  const steps=(e.detail?.steps||[]).map(action=>({capability:action}));
  if(!steps.length)return;
  try{await runPipeline({steps,context:{input:engine,studio:'pdf-studio',fileName:engine.fileName},onProgress:x=>setStatus('Workflow '+(x.index+1)+'/'+x.total+' · '+x.capability)})}
  catch(err){setStatus('Workflow interrompu : '+err.message)}
});

$('#copyDiagnostics').onclick=async()=>{
  const tests=runCapabilitySelfTests({manifest:studioManifest,root:document});
  const info={studio:'pdf-studio',version:VERSION,documentSession:session.snapshot(),file:engine.fileName,pages:engine.pageCount,currentPage:engine.currentPage,selectedPages:[...engine.selected],pagesPerRow:viewer.pagesPerRow,zoom:viewer.zoom,fileCapabilities:activeFileCapabilities,capabilityTests:tests,userAgent:navigator.userAgent};
  await navigator.clipboard?.writeText(JSON.stringify(info,null,2));setStatus('Diagnostic copié');
};

setStatus('PDF Studio TEST '+VERSION+' prêt');
