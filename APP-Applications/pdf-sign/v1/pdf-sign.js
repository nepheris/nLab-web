import{mountStudioV2}from'../../_shared/studio-v2/frame.js';
import{resolveStudioVersions,applyVersionDocumentMeta}from'../../_shared/studio-v2/version-service.js';
import{PDFEngine,fileStem}from'../../pdf-studio/v1/pdf-engine.js';
import{downloadBlob}from'../../_shared/studio-v2/download-service.js';
import{listPersonalAssetRefs,getPersonalAsset,putPersonalAsset,addPersonalAssetRef}from'../../_shared/studio-v2/personal-profile-service.js';
import{recordHistory}from'../../_shared/studio-v2/history.js';
import studioManifest from'./studio-manifest.js';

const $=s=>document.querySelector(s);
const versionInfo=await resolveStudioVersions({
 versionsHref:'../versions.json',
 coreVersionHref:'../../_shared/studio-v2/version.json',
 channel:'test',
 sourcePath:studioManifest.sourcePath
});
applyVersionDocumentMeta({studioName:studioManifest.name,studioVersion:versionInfo.version,studioStatus:versionInfo.status,coreVersion:versionInfo.coreVersion,build:versionInfo.build});
await mountStudioV2({manifest:studioManifest,versionInfo});

const engine=new PDFEngine();
let currentAssetBlob=null,currentAssetLabel='';
const status=msg=>{$('#localStatus').textContent=msg;const s=$('#studioStatusText');if(s)s.textContent=msg};
const build=versionInfo.build||{};$('#buildMeta').textContent=[versionInfo.version&&('v'+versionInfo.version),build.commitShort,build.commitDate&&new Date(build.commitDate).toLocaleString('fr-FR')].filter(Boolean).join(' · ');

async function render(){
 if(!engine.pageCount){$('#pdfCanvas').hidden=true;$('#pageInfo').textContent='Aucun document';return}
 $('#pdfCanvas').hidden=false;await engine.renderPage($('#pdfCanvas'),engine.currentPage,1.25);
 $('#pageInfo').textContent='Page '+engine.currentPage+' / '+engine.pageCount;
 $('#prevPage').disabled=engine.currentPage<=1;$('#nextPage').disabled=engine.currentPage>=engine.pageCount;
 $('#applyAsset').disabled=!currentAssetBlob;$('#downloadPdf').disabled=false;
}
async function loadPdf(file){
 if(!file)return;if(!/\.pdf$/i.test(file.name||'')&&file.type!=='application/pdf')throw new Error('Sélectionnez un fichier PDF.');
 await engine.loadFile(file);engine.dirty=false;await render();status(file.name+' · '+engine.pageCount+' page(s)');
 recordHistory({studio:'pdf-sign',type:'file',label:'PDF chargé',target:file.name});
}
async function loadSourceFromQuery(){
 const raw=new URLSearchParams(location.search).get('source');if(!raw)return;
 try{const u=new URL(raw,location.href);if(!/^https?:$/.test(u.protocol))return;status('Chargement du document préconfiguré…');const r=await fetch(u.href,{mode:'cors'});if(!r.ok)throw new Error('HTTP '+r.status);const blob=await r.blob(),name=u.pathname.split('/').pop()||'document.pdf';await loadPdf(new File([blob],name,{type:'application/pdf'}))}catch(e){status('Document préchargé indisponible : '+(e.message||e))}
}
function refsFor(kind){return listPersonalAssetRefs(kind)||[]}
async function refreshAssets(){
 const kind=$('#assetKind').value,items=refsFor(kind),select=$('#assetSelect');
 select.innerHTML='<option value="">Aucun preset</option>'+items.map(x=>'<option value="'+x.assetId+'">'+String(x.label||x.name||kind).replace(/[<>]/g,'')+'</option>').join('');
 currentAssetBlob=null;currentAssetLabel='';$('#applyAsset').disabled=true;
}
async function chooseAsset(id){
 if(!id){currentAssetBlob=null;currentAssetLabel='';$('#applyAsset').disabled=true;return}
 const a=await getPersonalAsset(id);if(!a?.blob)throw new Error('Preset indisponible.');
 currentAssetBlob=a.blob;currentAssetLabel=a.name||'preset';$('#applyAsset').disabled=!engine.pageCount;status('Preset prêt : '+currentAssetLabel);
}
async function saveAssetBlob(blob,kind,label){
 const a=await putPersonalAsset(kind,blob,{name:label+'.png',meta:{source:'pdf-sign'}});addPersonalAssetRef(kind,{assetId:a.id,label,name:a.name,type:a.type,size:a.size,variant:'pdf-sign'});
 await refreshAssets();$('#assetSelect').value=a.id;await chooseAsset(a.id);return a
}
async function applyAsset(){
 if(!engine.pageCount)throw new Error('Chargez un PDF.');if(!currentAssetBlob)throw new Error('Choisissez ou dessinez une signature/paraphe.');
 const scope=$('#targetScope').value,pages=scope==='all'?engine.targetPages('all'):[engine.currentPage];
 await engine.applyImageOverlay(currentAssetBlob,pages,{position:$('#position').value,widthPct:Number($('#widthPct').value)||24,opacity:1});
 await render();const label=$('#assetKind').value==='initials'?'Paraphe':'Signature';status(label+' appliqué sur '+pages.length+' page(s).');
 recordHistory({studio:'pdf-sign',type:'action',label:label+' visuel',detail:pages.length+' page(s)',target:engine.fileName,action:'sign'});
}
function outputName(){return fileStem(engine.fileName||'document')+'_signed.pdf'}
async function savePdf(){
 if(!engine.pageCount)throw new Error('Chargez un PDF.');const bytes=await engine.baseBytes();downloadBlob(new Blob([bytes],{type:'application/pdf'}),outputName());status('PDF signé téléchargé : '+outputName());
 recordHistory({studio:'pdf-sign',type:'output',label:'PDF signé téléchargé',target:outputName()});
}

$('#fileInput').addEventListener('change',e=>loadPdf(e.target.files?.[0]).catch(x=>status(x.message)));
$('#dropTarget').addEventListener('click',()=>$('#fileInput').click());$('#dropTarget').addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' ')$('#fileInput').click()});
for(const ev of ['dragenter','dragover'])$('#viewerStage').addEventListener(ev,e=>{e.preventDefault();$('#dropTarget')?.classList.add('drag')});
for(const ev of ['dragleave','drop'])$('#viewerStage').addEventListener(ev,e=>{e.preventDefault();$('#dropTarget')?.classList.remove('drag')});
$('#viewerStage').addEventListener('drop',e=>loadPdf([...e.dataTransfer.files].find(f=>/\.pdf$/i.test(f.name)||f.type==='application/pdf')).catch(x=>status(x.message)));
$('#prevPage').onclick=()=>{if(engine.currentPage>1){engine.selectPage(engine.currentPage-1);render()}};
$('#nextPage').onclick=()=>{if(engine.currentPage<engine.pageCount){engine.selectPage(engine.currentPage+1);render()}};
$('#assetKind').onchange=()=>refreshAssets().catch(e=>status(e.message));$('#assetSelect').onchange=e=>chooseAsset(e.target.value).catch(x=>status(x.message));
$('#importAsset').onclick=()=>$('#assetFile').click();$('#assetFile').onchange=async e=>{try{const f=e.target.files?.[0];if(!f)return;await saveAssetBlob(f,$('#assetKind').value,fileStem(f.name)||($('#assetKind').value==='initials'?'Paraphe':'Signature'));status('Preset importé.')}catch(x){status(x.message)}};
$('#widthPct').oninput=e=>$('#widthValue').textContent=e.target.value+' %';
$('#applyAsset').onclick=()=>applyAsset().catch(e=>status(e.message));$('#downloadPdf').onclick=()=>savePdf().catch(e=>status(e.message));

const canvas=$('#drawCanvas'),ctx=canvas.getContext('2d');ctx.lineCap='round';ctx.lineJoin='round';ctx.lineWidth=4;ctx.strokeStyle='#111';let drawing=false,last=null;
const point=e=>{const r=canvas.getBoundingClientRect();return{x:(e.clientX-r.left)*canvas.width/r.width,y:(e.clientY-r.top)*canvas.height/r.height}};
canvas.addEventListener('pointerdown',e=>{e.preventDefault();canvas.setPointerCapture?.(e.pointerId);drawing=true;last=point(e)});
canvas.addEventListener('pointermove',e=>{if(!drawing)return;e.preventDefault();const p=point(e);ctx.beginPath();ctx.moveTo(last.x,last.y);ctx.lineTo(p.x,p.y);ctx.stroke();last=p});
canvas.addEventListener('pointerup',()=>{drawing=false;last=null});canvas.addEventListener('pointercancel',()=>{drawing=false;last=null});
$('#clearDraw').onclick=()=>ctx.clearRect(0,0,canvas.width,canvas.height);
$('#saveDraw').onclick=async()=>{try{const blob=await new Promise(r=>canvas.toBlob(r,'image/png'));if(!blob)throw new Error('Dessin indisponible.');const kind=$('#assetKind').value,label=(kind==='initials'?'Paraphe':'Signature')+' PDF Sign';await saveAssetBlob(blob,kind,label);status(label+' enregistré comme preset.')}catch(e){status(e.message)}};

document.addEventListener('studio-v2:action',e=>{const a=e.detail?.action;if(a==='openPdf')$('#fileInput').click();if(a==='applySignature'){$('#assetKind').value='signature';refreshAssets()};if(a==='applyInitials'){$('#assetKind').value='initials';refreshAssets()};if(a==='savePdf')savePdf().catch(x=>status(x.message))});
await refreshAssets();await loadSourceFromQuery();
