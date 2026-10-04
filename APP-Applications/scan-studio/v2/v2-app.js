import{mountStudioV2}from'../../_shared/studio-v2/frame.js';
import{resolveStudioVersions,applyVersionDocumentMeta}from'../../_shared/studio-v2/version-service.js';
import{runOcr}from'../../_shared/studio-v2/ocr-service.js';
import{downloadBlob}from'../../_shared/studio-v2/download-service.js';
import{fileToDataUrl,renderImageTransformed,canvasToBlob}from'../../_shared/studio-v2/image-service.js';
import{openInputPicker,filesFromDrop}from'../../_shared/studio-v2/input-picker.js';
import{createEditHistory}from'../../_shared/studio-v2/edit-history.js';
import manifest from'./studio-manifest.js';

const VERSION_INFO=await resolveStudioVersions({versionsHref:'../versions.json',coreVersionHref:'../../_shared/studio-v2/version.json',channel:'test',sourcePath:manifest.sourcePath});
applyVersionDocumentMeta({studioName:manifest.name,studioVersion:VERSION_INFO.version,studioStatus:VERSION_INFO.status,coreVersion:VERSION_INFO.coreVersion,build:VERSION_INFO.build});
await mountStudioV2({manifest,versionInfo:VERSION_INFO});

const $=s=>document.querySelector(s),canvas=$('#canvas'),ctx=canvas.getContext('2d');
let pages=[],active=-1,deskewCheckpointed=false;
const editHistory=createEditHistory({limit:100});
const status=m=>{$('#status').textContent=m;const x=$('#studioStatusText');if(x)x.textContent=m};
const snapshot=()=>({pages,active});
function restore(s){pages=s?.pages||[];active=Math.min(Number(s?.active??-1),pages.length-1);renderList();renderActive();syncHistoryButtons()}
function checkpoint(label){editHistory.checkpoint(snapshot(),label);syncHistoryButtons()}
function syncHistoryButtons(){$('#undoScan').disabled=!editHistory.canUndo();$('#redoScan').disabled=!editHistory.canRedo()}
function selectedIndexes(){return pages.map((p,i)=>p.selected?i:-1).filter(i=>i>=0)}
async function addFiles(files){
 const valid=[...(files||[])].filter(f=>(f.type||'').startsWith('image/'));if(!valid.length)return;
 checkpoint('Ajouter des pages');
 for(const f of valid)pages.push({name:f.name||('page-'+(pages.length+1)+'.png'),src:await fileToDataUrl(f),rotation:0,deskew:0,cleanup:'original',brightness:0,contrast:0,blackPoint:0,whitePoint:255,threshold:155,selected:true,ocr:null,relativePath:f.webkitRelativePath||f.__relativePath||''});
 if(active<0&&pages.length)active=0;renderList();renderActive();status(pages.length+' page(s) chargée(s).')
}
function renderList(){
 $('#pageList').innerHTML=pages.map((p,i)=>'<div class="pageItem '+(i===active?'active':'')+'" data-i="'+i+'"><input type="checkbox" data-page-check="'+i+'" '+(p.selected?'checked':'')+' title="Inclure cette page"><img src="'+p.src+'" alt=""><div><strong>Page '+(i+1)+'</strong><br><small>'+p.name+(p.ocr?' · OCR ✓':'')+'</small></div><button data-select="'+i+'" type="button">Ouvrir</button></div>').join('')||'<div class="status">Aucune page.</div>';
 $('#pageList').onclick=e=>{const b=e.target.closest('[data-select]');if(!b)return;active=Number(b.dataset.select);renderList();renderActive()};
 $('#pageList').onchange=e=>{const cb=e.target.closest('[data-page-check]');if(!cb)return;checkpoint('Sélection des pages');pages[Number(cb.dataset.pageCheck)].selected=cb.checked;renderList()}
}
function drawImageWithEffects(img,p){return renderImageTransformed(canvas,img,{rotation:p.rotation,deskew:p.deskew,cleanup:p.cleanup,brightness:p.brightness||0,contrast:p.contrast||0,blackPoint:p.blackPoint||0,whitePoint:p.whitePoint??255,threshold:p.threshold??155})}
function renderPageToCanvas(i){
 return new Promise((resolve,reject)=>{const p=pages[i];if(!p)return reject(new Error('Page absente'));const img=new Image();img.onload=()=>{try{drawImageWithEffects(img,p);resolve(p)}catch(e){reject(e)}};img.onerror=()=>reject(new Error('Image illisible : '+p.name));img.src=p.src})
}
function renderActive(){
 if(active<0||!pages[active]){ctx.clearRect(0,0,canvas.width,canvas.height);$('#pageTitle').textContent='Aucune page';$('#ocrOut').value='';return}
 const p=pages[active],img=new Image();img.onload=()=>drawImageWithEffects(img,p);img.src=p.src;
 $('#pageTitle').textContent='Page '+(active+1)+' / '+pages.length+' · '+p.name;$('#freeRotation').value=p.rotation;$('#deskew').value=p.deskew;$('#deskewVal').textContent=p.deskew+'°';$('#cleanupMode').value=p.cleanup;$('#brightness').value=p.brightness||0;$('#contrast').value=p.contrast||0;$('#blackPoint').value=p.blackPoint||0;$('#whitePoint').value=p.whitePoint??255;$('#threshold').value=p.threshold??155;$('#ocrOut').value=p.ocr?.text||''
}
async function pickImages(camera=false){
 const files=await openInputPicker({accept:'image/*',multiple:!camera,folders:!camera,camera:true,url:!camera,view:'preview'});if(files?.length)await addFiles(files)
}
$('#pickFiles').onclick=()=>pickImages(false).catch(e=>status(e.message));$('#takePhoto').onclick=()=>pickImages(true).catch(e=>status(e.message));
$('#fileInput').onchange=e=>addFiles(e.target.files);$('#cameraInput').onchange=e=>addFiles(e.target.files);
$('#drop').onclick=()=>pickImages(false).catch(e=>status(e.message));$('#drop').onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();pickImages(false).catch(x=>status(x.message))}};
for(const ev of ['dragenter','dragover'])$('#drop').addEventListener(ev,e=>{e.preventDefault();e.currentTarget.classList.add('drag')});
for(const ev of ['dragleave','drop'])$('#drop').addEventListener(ev,e=>{e.preventDefault();e.currentTarget.classList.remove('drag')});
$('#drop').addEventListener('drop',async e=>{try{await addFiles(await filesFromDrop(e.dataTransfer))}catch(x){status(x.message)}});
function mutate(label,fn){if(active<0)return;checkpoint(label);fn(pages[active]);pages[active].ocr=null;renderActive();renderList()}
$('#rotateLeft').onclick=()=>mutate('Rotation gauche',p=>p.rotation=(p.rotation-90)%360);$('#rotateRight').onclick=()=>mutate('Rotation droite',p=>p.rotation=(p.rotation+90)%360);$('#freeRotation').onchange=e=>mutate('Rotation libre',p=>p.rotation=Math.max(-180,Math.min(180,Number(e.target.value)||0)));
$('#deskew').addEventListener('pointerdown',()=>{if(active>=0&&!deskewCheckpointed){checkpoint('Deskew');deskewCheckpointed=true}});
$('#deskew').addEventListener('focus',()=>{if(active>=0&&!deskewCheckpointed){checkpoint('Deskew');deskewCheckpointed=true}});
$('#deskew').oninput=e=>{$('#deskewVal').textContent=e.target.value+'°';if(active>=0){pages[active].deskew=Number(e.target.value);pages[active].ocr=null;renderActive()}};
$('#deskew').addEventListener('change',()=>{deskewCheckpointed=false;renderList()});
$('#cleanupMode').onchange=e=>{if(active>=0){checkpoint('Mode de nettoyage');pages[active].cleanup=e.target.value;pages[active].ocr=null;renderActive();renderList()}};
const adjustmentIds=['brightness','contrast','blackPoint','whitePoint','threshold'];let adjustmentCheckpoint=null;
for(const id of adjustmentIds){const el=$('#'+id);el.addEventListener('pointerdown',()=>{if(active>=0&&adjustmentCheckpoint!==id){checkpoint('Ajustement '+id);adjustmentCheckpoint=id}});el.addEventListener('focus',()=>{if(active>=0&&adjustmentCheckpoint!==id){checkpoint('Ajustement '+id);adjustmentCheckpoint=id}});el.addEventListener('input',e=>{if(active<0)return;pages[active][id]=Number(e.target.value);pages[active].ocr=null;renderActive()});el.addEventListener('change',()=>{adjustmentCheckpoint=null;renderList()})}
$('#applyCleanup').onclick=()=>renderActive();
$('#moveUp').onclick=()=>{if(active>0){checkpoint('Réordonner les pages');[pages[active-1],pages[active]]=[pages[active],pages[active-1]];active--;renderList();renderActive()}};
$('#moveDown').onclick=()=>{if(active>=0&&active<pages.length-1){checkpoint('Réordonner les pages');[pages[active+1],pages[active]]=[pages[active],pages[active+1]];active++;renderList();renderActive()}};
$('#removePage').onclick=()=>{if(active<0)return;checkpoint('Supprimer une page');pages.splice(active,1);active=Math.min(active,pages.length-1);renderList();renderActive()};
$('#selectAll').onclick=()=>{checkpoint('Tout sélectionner');pages.forEach(p=>p.selected=true);renderList()};$('#selectNone').onclick=()=>{checkpoint('Tout désélectionner');pages.forEach(p=>p.selected=false);renderList()};
$('#undoScan').onclick=()=>{const r=editHistory.undo(snapshot());if(r)restore(r.state)};$('#redoScan').onclick=()=>{const r=editHistory.redo(snapshot());if(r)restore(r.state)};
$('#resetLot').onclick=()=>{if(!pages.length)return;checkpoint('Réinitialiser le lot');pages=pages.map(p=>({...p,rotation:0,deskew:0,cleanup:'original',brightness:0,contrast:0,blackPoint:0,whitePoint:255,threshold:155,selected:true,ocr:null}));renderList();renderActive()};
$('#downloadPage').onclick=async()=>{if(active<0)return;await renderPageToCanvas(active);const blob=await canvasToBlob(canvas,'image/png');downloadBlob(blob,'scan-page-'+(active+1)+'.png')};

async function ocrPage(i,{display=true}={}){
 if(i<0||!pages[i])throw new Error('Page absente');await renderPageToCanvas(i);status('OCR page '+(i+1)+'…');const blob=await canvasToBlob(canvas,'image/png');
 const res=await runOcr(blob,{engine:'auto',language:$('#ocrLang').value,logger:m=>status((m.status||'OCR')+(m.progress!=null?' '+Math.round(m.progress*100)+' %':''))});
 pages[i].ocr={...res,width:canvas.width,height:canvas.height};if(display){$('#ocrOut').value=res.text;status('OCR page '+(i+1)+' terminé · '+res.detectedLanguage)}renderList();return res
}
async function ocrIndexes(indexes,label){if(!indexes.length)return status('Aucune page dans cette portée.');const before=active;for(let n=0;n<indexes.length;n++){const i=indexes[n];status(label+' · '+(n+1)+'/'+indexes.length);await ocrPage(i,{display:i===before})}active=before;renderActive();status(label+' terminé · '+indexes.length+' page(s).')}
$('#runOcr').onclick=()=>active<0?status('Aucune page.'):ocrIndexes([active],'OCR page').catch(e=>status('Erreur OCR : '+(e?.message||e)));
$('#runOcrSelection').onclick=()=>ocrIndexes(selectedIndexes(),'OCR sélection').catch(e=>status('Erreur OCR : '+(e?.message||e)));
$('#runOcrDocument').onclick=()=>ocrIndexes(pages.map((_,i)=>i),'OCR document').catch(e=>status('Erreur OCR : '+(e?.message||e)));

function addInvisibleTextLayer(pdf,p){
 const o=p.ocr;if(!o)return;const words=o.words||[];
 if(words.length){for(const w of words){if(!w.text||!w.bbox)continue;const x=w.bbox.x0*(canvas.width/o.width),y=w.bbox.y1*(canvas.height/o.height),fs=Math.max(5,(w.bbox.y1-w.bbox.y0)*(canvas.height/o.height)*.85);pdf.setFontSize(fs);try{pdf.text(w.text,x,y,{renderingMode:'invisible'})}catch{pdf.text(w.text,x,y)}}
 }else if(o.text){pdf.setFontSize(7);try{pdf.text(o.text,4,10,{maxWidth:Math.max(20,canvas.width-8),renderingMode:'invisible'})}catch{}}
}
$('#exportPdf').onclick=async()=>{
 const indexes=selectedIndexes();if(!indexes.length)return status('Sélectionnez au moins une page.');const JsPdf=window.jspdf?.jsPDF;if(!JsPdf)return status('jsPDF indisponible.');const previousActive=active,searchable=$('#searchablePdf').checked;let pdf=null;
 try{for(let n=0;n<indexes.length;n++){const i=indexes[n],p=pages[i];if(searchable&&!p.ocr)await ocrPage(i,{display:false});await renderPageToCanvas(i);const portrait=canvas.height>=canvas.width,fmt=[canvas.width,canvas.height];if(!pdf)pdf=new JsPdf({unit:'px',format:fmt,orientation:portrait?'portrait':'landscape'});else pdf.addPage(fmt,portrait?'portrait':'landscape');pdf.addImage(canvas.toDataURL('image/jpeg',.92),'JPEG',0,0,canvas.width,canvas.height);if(searchable)addInvisibleTextLayer(pdf,p)}pdf.save(searchable?'nlab-scan-ocr.pdf':'nlab-scan.pdf');status('PDF '+(searchable?'recherchable ':'')+'créé · '+indexes.length+' page(s).')}
 catch(e){status('Erreur PDF : '+(e?.message||e))}
 finally{active=Math.max(0,Math.min(previousActive,pages.length-1));renderList();renderActive()}
};
document.addEventListener('studio-v2:action',e=>{const a=e.detail?.action;if(a==='open')pickImages(false).catch(x=>status(x.message));if(a==='camera')pickImages(true).catch(x=>status(x.message));if(a==='clean')$('#applyCleanup').click();if(a==='ocr')$('#runOcr').click();if(a==='pdf')$('#exportPdf').click()});
renderList();renderActive();syncHistoryButtons();
