import{mountStudioV2}from'../../_shared/studio-v2/frame.js';
import{resolveStudioVersions,applyVersionDocumentMeta}from'../../_shared/studio-v2/version-service.js';
import{PDFEngine,fileStem}from'../../pdf-studio/v1/pdf-engine.js';
import{downloadBlob}from'../../_shared/studio-v2/download-service.js';
import{canvasToBlob}from'../../_shared/studio-v2/image-service.js';
import{openInputPicker,filesFromDrop}from'../../_shared/studio-v2/input-picker.js';
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
let currentAssetBlob=null,currentAssetLabel='',assetUrl='',placement={xPct:72,yPct:6,widthPct:24};
const status=msg=>{$('#localStatus').textContent=msg;const s=$('#studioStatusText');if(s)s.textContent=msg};
const build=versionInfo.build||{};$('#buildMeta').textContent=[versionInfo.version&&('v'+versionInfo.version),build.commitShort,build.commitDate&&new Date(build.commitDate).toLocaleString('fr-FR')].filter(Boolean).join(' · ');

function updateOverlay(){
 const overlay=$('#signatureOverlay'),canvas=$('#pdfCanvas');if(!overlay||!canvas||!currentAssetBlob||canvas.hidden){if(overlay)overlay.hidden=true;return}
 overlay.hidden=false;const w=Math.max(48,canvas.clientWidth*placement.widthPct/100),h=Math.max(24,w*.28),availX=Math.max(0,canvas.clientWidth-w),availY=Math.max(0,canvas.clientHeight-h);
 overlay.style.width=w+'px';overlay.style.left=(canvas.offsetLeft+availX*placement.xPct/100)+'px';overlay.style.top=(canvas.offsetTop+availY*(1-placement.yPct/100))+'px'
}
async function render(){
 if(!engine.pageCount){$('#pdfCanvas').hidden=true;$('#pageInfo').textContent='Aucun document';updateOverlay();return}
 $('#pdfCanvas').hidden=false;await engine.renderPage($('#pdfCanvas'),engine.currentPage,1.25);
 $('#pageInfo').textContent='Page '+engine.currentPage+' / '+engine.pageCount;
 $('#prevPage').disabled=engine.currentPage<=1;$('#nextPage').disabled=engine.currentPage>=engine.pageCount;
 $('#applyAsset').disabled=!currentAssetBlob;$('#downloadPdf').disabled=false;requestAnimationFrame(updateOverlay)
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
function showAssetPreview(){
 if(assetUrl)URL.revokeObjectURL(assetUrl);assetUrl=currentAssetBlob?URL.createObjectURL(currentAssetBlob):'';const host=$('#assetPreview'),img=$('#signatureOverlayImage');
 host.innerHTML=currentAssetBlob?'<img src="'+assetUrl+'" alt="Aperçu signature" style="max-width:100%;max-height:90px;object-fit:contain">':'Aucune image de signature.';
 if(img)img.src=assetUrl;updateOverlay()
}
async function chooseAsset(id){
 if(!id){currentAssetBlob=null;currentAssetLabel='';$('#applyAsset').disabled=true;showAssetPreview();return}
 const a=await getPersonalAsset(id);if(!a?.blob)throw new Error('Preset indisponible.');
 currentAssetBlob=a.blob;currentAssetLabel=a.name||'preset';$('#applyAsset').disabled=!engine.pageCount;showAssetPreview();status('Preset prêt : '+currentAssetLabel);
}
async function saveAssetBlob(blob,kind,label){
 const a=await putPersonalAsset(kind,blob,{name:label+'.png',meta:{source:'pdf-sign'}});addPersonalAssetRef(kind,{assetId:a.id,label,name:a.name,type:a.type,size:a.size,variant:'pdf-sign'});
 await refreshAssets();$('#assetSelect').value=a.id;await chooseAsset(a.id);return a
}
async function applyAsset(){
 if(!engine.pageCount)throw new Error('Chargez un PDF.');if(!currentAssetBlob)throw new Error('Choisissez ou dessinez une signature/paraphe.');
 const scope=$('#targetScope').value,pages=scope==='all'?engine.targetPages('all'):[engine.currentPage];
 const mode=$('#position').value;await engine.applyImageOverlay(currentAssetBlob,pages,{position:mode,widthPct:placement.widthPct,xPct:placement.xPct,yPct:placement.yPct,opacity:1});
 await render();const label=$('#assetKind').value==='initials'?'Paraphe':'Signature';status(label+' appliqué sur '+pages.length+' page(s).');
 recordHistory({studio:'pdf-sign',type:'action',label:label+' visuel',detail:pages.length+' page(s)',target:engine.fileName,action:'sign'});
}
function outputName(){return fileStem(engine.fileName||'document')+'_signed.pdf'}
async function savePdf(){
 if(!engine.pageCount)throw new Error('Chargez un PDF.');const bytes=await engine.baseBytes();downloadBlob(new Blob([bytes],{type:'application/pdf'}),outputName());status('PDF signé téléchargé : '+outputName());
 recordHistory({studio:'pdf-sign',type:'output',label:'PDF signé téléchargé',target:outputName()});
}

$('#fileInput').addEventListener('change',e=>loadPdf(e.target.files?.[0]).catch(x=>status(x.message)));
async function pickPdf(){const files=await openInputPicker({accept:'.pdf,application/pdf',multiple:false,folders:false,url:true});if(files?.[0])await loadPdf(files[0])}
$('#dropTarget').addEventListener('click',()=>pickPdf().catch(x=>status(x.message)));$('#dropTarget').addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();pickPdf().catch(x=>status(x.message))}});
for(const ev of ['dragenter','dragover'])$('#viewerStage').addEventListener(ev,e=>{e.preventDefault();$('#dropTarget')?.classList.add('drag')});
for(const ev of ['dragleave','drop'])$('#viewerStage').addEventListener(ev,e=>{e.preventDefault();$('#dropTarget')?.classList.remove('drag')});
$('#viewerStage').addEventListener('drop',async e=>{try{const files=await filesFromDrop(e.dataTransfer),f=files.find(x=>/\.pdf$/i.test(x.name)||x.type==='application/pdf');if(f)await loadPdf(f)}catch(x){status(x.message)}});
$('#prevPage').onclick=()=>{if(engine.currentPage>1){engine.selectPage(engine.currentPage-1);render()}};
$('#nextPage').onclick=()=>{if(engine.currentPage<engine.pageCount){engine.selectPage(engine.currentPage+1);render()}};
$('#assetKind').onchange=()=>refreshAssets().catch(e=>status(e.message));$('#assetSelect').onchange=e=>chooseAsset(e.target.value).catch(x=>status(x.message));
async function importAssetCommon(){const files=await openInputPicker({accept:'image/*',multiple:false,folders:false,camera:true,url:true});const f=files?.[0];if(!f)return;await saveAssetBlob(f,$('#assetKind').value,fileStem(f.name)||($('#assetKind').value==='initials'?'Paraphe':'Signature'));status('Preset importé.')}
$('#importAsset').onclick=()=>importAssetCommon().catch(x=>status(x.message));$('#assetFile').onchange=async e=>{try{const f=e.target.files?.[0];if(!f)return;await saveAssetBlob(f,$('#assetKind').value,fileStem(f.name)||($('#assetKind').value==='initials'?'Paraphe':'Signature'));status('Preset importé.')}catch(x){status(x.message)}};
$('#widthPct').oninput=e=>{placement.widthPct=Number(e.target.value)||24;$('#widthValue').textContent=e.target.value+' %';updateOverlay()};
$('#applyAsset').onclick=()=>applyAsset().catch(e=>status(e.message));$('#downloadPdf').onclick=()=>savePdf().catch(e=>status(e.message));

const canvas=$('#drawCanvas'),ctx=canvas.getContext('2d');ctx.lineCap='round';ctx.lineJoin='round';ctx.lineWidth=4;ctx.strokeStyle='#111';let drawing=false,last=null;
const point=e=>{const r=canvas.getBoundingClientRect();return{x:(e.clientX-r.left)*canvas.width/r.width,y:(e.clientY-r.top)*canvas.height/r.height}};
canvas.addEventListener('pointerdown',e=>{e.preventDefault();canvas.setPointerCapture?.(e.pointerId);drawing=true;last=point(e)});
canvas.addEventListener('pointermove',e=>{if(!drawing)return;e.preventDefault();const p=point(e);ctx.beginPath();ctx.moveTo(last.x,last.y);ctx.lineTo(p.x,p.y);ctx.stroke();last=p});
canvas.addEventListener('pointerup',()=>{drawing=false;last=null});canvas.addEventListener('pointercancel',()=>{drawing=false;last=null});
$('#clearDraw').onclick=()=>ctx.clearRect(0,0,canvas.width,canvas.height);
$('#saveDraw').onclick=async()=>{try{const blob=await canvasToBlob(canvas,'image/png');if(!blob)throw new Error('Dessin indisponible.');const kind=$('#assetKind').value,label=(kind==='initials'?'Paraphe':'Signature')+' PDF Sign';await saveAssetBlob(blob,kind,label);status(label+' enregistré comme preset.')}catch(e){status(e.message)}};

document.addEventListener('studio-v2:action',e=>{const a=e.detail?.action;if(a==='openPdf')pickPdf().catch(x=>status(x.message));if(a==='applySignature'){$('#assetKind').value='signature';refreshAssets()};if(a==='applyInitials'){$('#assetKind').value='initials';refreshAssets()};if(a==='savePdf')savePdf().catch(x=>status(x.message))});
const overlay=$('#signatureOverlay');let drag=null;
overlay.addEventListener('pointerdown',e=>{if(!currentAssetBlob)return;e.preventDefault();const r=overlay.getBoundingClientRect();drag={dx:e.clientX-r.left,dy:e.clientY-r.top};overlay.setPointerCapture?.(e.pointerId)});
overlay.addEventListener('pointermove',e=>{if(!drag)return;const canvas=$('#pdfCanvas'),cr=canvas.getBoundingClientRect(),or=overlay.getBoundingClientRect(),availX=Math.max(1,cr.width-or.width),availY=Math.max(1,cr.height-or.height),left=Math.max(0,Math.min(availX,e.clientX-drag.dx-cr.left)),top=Math.max(0,Math.min(availY,e.clientY-drag.dy-cr.top));placement.xPct=left/availX*100;placement.yPct=(1-top/availY)*100;updateOverlay();$('#position').value='custom'});
overlay.addEventListener('pointerup',()=>drag=null);overlay.addEventListener('pointercancel',()=>drag=null);
$('#position').addEventListener('change',()=>{const map={'bottom-left':[0,0],'bottom-center':[50,0],'bottom-right':[100,0],'top-left':[0,100],'top-center':[50,100],'top-right':[100,100]};const v=map[$('#position').value];if(v){placement.xPct=v[0];placement.yPct=v[1]}updateOverlay()});
window.addEventListener('resize',updateOverlay,{passive:true});
await refreshAssets();await loadSourceFromQuery();
