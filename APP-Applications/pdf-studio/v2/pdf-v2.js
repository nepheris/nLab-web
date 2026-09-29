import{mountStudioV2}from'../../_shared/studio-v2/frame.js';
import{setStatus,openStudioSection}from'../../_shared/studio-v2/core.js';
import studioManifest from'./studio-manifest.js';
import{findFeature,renderFeatureHelp}from'../../_shared/studio-v2/help.js';
import{PDFEngine}from'../v1/pdf-engine.js';

await mountStudioV2({manifest:studioManifest,versionInfo:{version:'2.0.0',status:'TEST'}});
const $=s=>document.querySelector(s);
const engine=new PDFEngine();
let zoom=1;

function download(bytes,name){
  const blob=new Blob([bytes],{type:'application/pdf'});
  const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=name||'document.pdf';a.click();
  setTimeout(()=>URL.revokeObjectURL(a.href),1200);
}
async function render(){
  if(!engine.pageCount){$('#pageInfo').textContent='0 / 0';return}
  await engine.renderPage($('#pageCanvas'),engine.currentPage,zoom);
  $('#pageInfo').textContent=engine.currentPage+' / '+engine.pageCount;
  $('#zoomLabel').textContent=Math.round(zoom*100)+' %';
  $('#sourceStatus').textContent=engine.fileName+' · '+engine.pageCount+' page(s)';
}
async function load(file){
  if(!file)return;
  setStatus('Chargement…');
  await engine.loadFile(file);
  zoom=1;
  await render();
  setStatus('Document chargé');
}
async function rotate(delta){
  if(!engine.pageCount)return;
  await engine.rotate(engine.targetPages($('#pageScope').value),delta);await render();setStatus('Rotation '+(delta>0?'+90°':'−90°'));
}
async function addPage(){if(!engine.pageCount)return;await engine.addBlank(engine.currentPage);await render();setStatus('Page ajoutée')}
async function deletePage(){if(!engine.pageCount)return;await engine.deletePages(engine.targetPages($('#pageScope').value));await render();setStatus('Page(s) supprimée(s)')}
async function save(){if(!engine.pageCount)return;download(await engine.baseBytes(),engine.fileName.replace(/\.pdf$/i,'')+'-v2.pdf');setStatus('PDF enregistré')}

$('#pickFile').onclick=()=>$('#fileInput').click();
$('#fileInput').onchange=e=>load(e.target.files?.[0]);
$('#pickFolder').onclick=()=>$('#folderInput').click();
$('#folderInput').onchange=e=>{const f=[...(e.target.files||[])].find(x=>/\.pdf$/i.test(x.name));if(f)load(f);else setStatus('Aucun PDF trouvé dans le dossier')};
$('#prevPage').onclick=()=>{if(engine.currentPage>1){engine.selectPage(engine.currentPage-1);render()}};
$('#nextPage').onclick=()=>{if(engine.currentPage<engine.pageCount){engine.selectPage(engine.currentPage+1);render()}};
$('#zoomOut').onclick=()=>{zoom=Math.max(.3,zoom-.1);render()};
$('#zoomIn').onclick=()=>{zoom=Math.min(2.5,zoom+.1);render()};
$('#fitWidth').onclick=()=>{if(!engine.pageCount)return;const stage=$('#canvasStage'),canvas=$('#pageCanvas');const base=canvas.width/zoom;zoom=Math.max(.3,Math.min(2.5,(stage.clientWidth-50)/base));render()};
$('#rotateLeftSide').onclick=()=>rotate(-90);$('#rotateRightSide').onclick=()=>rotate(90);$('#addPageSide').onclick=addPage;$('#deletePageSide').onclick=deletePage;$('#savePdfSide').onclick=save;

function showHelp(action){
  const feature=findFeature(studioManifest,action)||{
    featureId:'pdf.unknown.'+action,
    label:action,
    scope:'pdf',
    plugin:'pdf-studio',
    status:'development',
    capability:'',
    help:{summary:'Fonction non documentée dans le manifest V2.',details:'Ajouter ses métadonnées dans studio-manifest.js.'}
  };
  renderFeatureHelp($('#helpContent'),feature);
  openStudioSection('#sectionHelp');
}
document.addEventListener('studio-v2:action',e=>{
  const a=e.detail.action;
  if(a==='openPdf')$('#pickFile').click();
  else if(a==='openFolder')$('#pickFolder').click();
  else if(a==='savePdf')save();
  else if(a==='rotateLeft')rotate(-90);
  else if(a==='rotateRight')rotate(90);
  else if(a==='addPage')addPage();
  else if(a==='deletePage')deletePage();
  else if(a==='openDemo'){window.open('../../../Library/demo/','_blank')}
  else showHelp(a);
  if(['openPdf','openFolder','openDemo'].includes(a))openStudioSection('#sectionInput');
  else if(['rotateLeft','rotateRight','addPage','deletePage'].includes(a))openStudioSection('#sectionPages');
  else if(['savePdf','classifyPdf'].includes(a))openStudioSection('#sectionOutput');
});
document.addEventListener('studio-v2:menu',e=>{if(e.detail.tab==='help')openStudioSection('#sectionHelp');if(e.detail.tab==='view')document.querySelector('#studioCoreSettings')?.click()});
setStatus('PDF Studio V2 TEST 2.0.0 prêt');
