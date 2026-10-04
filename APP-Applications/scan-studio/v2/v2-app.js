import{mountStudioV2}from'../../_shared/studio-v2/frame.js';
import{resolveStudioVersions,applyVersionDocumentMeta}from'../../_shared/studio-v2/version-service.js';
import{runOcr}from'../../_shared/studio-v2/ocr-service.js';
import{downloadBlob}from'../../_shared/studio-v2/download-service.js';
import{fileToDataUrl,renderImageTransformed,canvasToBlob}from'../../_shared/studio-v2/image-service.js';
import manifest from'./studio-manifest.js';
const VERSION_INFO=await resolveStudioVersions({versionsHref:'../versions.json',coreVersionHref:'../../_shared/studio-v2/version.json',channel:'test',sourcePath:manifest.sourcePath});
applyVersionDocumentMeta({studioName:manifest.name,studioVersion:VERSION_INFO.version,studioStatus:VERSION_INFO.status,coreVersion:VERSION_INFO.coreVersion,build:VERSION_INFO.build});
await mountStudioV2({manifest,versionInfo:VERSION_INFO});
const $=s=>document.querySelector(s),canvas=$('#canvas'),ctx=canvas.getContext('2d');let pages=[],active=-1;
const status=m=>{$('#status').textContent=m;const x=$('#studioStatusText');if(x)x.textContent=m};
function fileToDataUrl(file){return new Promise((res,rej)=>{const r=new FileReader();r.onload=()=>res(r.result);r.onerror=rej;r.readAsDataURL(file)})}
async function addFiles(files){for(const f of files||[]){if(!(f.type||'').startsWith('image/'))continue;pages.push({name:f.name||('page-'+(pages.length+1)+'.png'),src:await fileToDataUrl(f),rotation:0,deskew:0,cleanup:'original'})}if(active<0&&pages.length)active=0;renderList();renderActive();status(pages.length+' page(s) chargée(s).')}
function renderList(){$('#pageList').innerHTML=pages.map((p,i)=>'<div class="pageItem '+(i===active?'active':'')+'" data-i="'+i+'"><img src="'+p.src+'" alt=""><div><strong>Page '+(i+1)+'</strong><br><small>'+p.name+'</small></div><button data-select="'+i+'" type="button">Ouvrir</button></div>').join('');$('#pageList').onclick=e=>{const b=e.target.closest('[data-select]');if(!b)return;active=Number(b.dataset.select);renderList();renderActive()}}
function drawImageWithEffects(img,p){return renderImageTransformed(canvas,img,{rotation:p.rotation,deskew:p.deskew,cleanup:p.cleanup})}
function renderActive(){if(active<0||!pages[active]){ctx.clearRect(0,0,canvas.width,canvas.height);$('#pageTitle').textContent='Aucune page';return}const p=pages[active],img=new Image();img.onload=()=>drawImageWithEffects(img,p);img.src=p.src;$('#pageTitle').textContent='Page '+(active+1)+' / '+pages.length+' · '+p.name;$('#deskew').value=p.deskew;$('#deskewVal').textContent=p.deskew+'°';$('#cleanupMode').value=p.cleanup}
$('#pickFiles').onclick=()=>$('#fileInput').click();$('#takePhoto').onclick=()=>$('#cameraInput').click();$('#fileInput').onchange=e=>addFiles(e.target.files);$('#cameraInput').onchange=e=>addFiles(e.target.files);
$('#drop').onclick=()=>$('#fileInput').click();$('#drop').onkeydown=e=>{if(e.key==='Enter'||e.key===' ')$('#fileInput').click()};
for(const ev of ['dragenter','dragover'])$('#drop').addEventListener(ev,e=>{e.preventDefault();e.currentTarget.classList.add('drag')});
for(const ev of ['dragleave','drop'])$('#drop').addEventListener(ev,e=>{e.preventDefault();e.currentTarget.classList.remove('drag')});
$('#drop').addEventListener('drop',e=>addFiles(e.dataTransfer.files));
function mutate(fn){if(active<0)return;fn(pages[active]);renderActive();renderList()}
$('#rotateLeft').onclick=()=>mutate(p=>p.rotation=(p.rotation-90)%360);$('#rotateRight').onclick=()=>mutate(p=>p.rotation=(p.rotation+90)%360);
$('#deskew').oninput=e=>{$('#deskewVal').textContent=e.target.value+'°';if(active>=0){pages[active].deskew=Number(e.target.value);renderActive()}};
$('#cleanupMode').onchange=e=>{if(active>=0){pages[active].cleanup=e.target.value;renderActive()}};
$('#applyCleanup').onclick=()=>renderActive();
$('#moveUp').onclick=()=>{if(active>0){[pages[active-1],pages[active]]=[pages[active],pages[active-1]];active--;renderList();renderActive()}};
$('#moveDown').onclick=()=>{if(active>=0&&active<pages.length-1){[pages[active+1],pages[active]]=[pages[active],pages[active+1]];active++;renderList();renderActive()}};
$('#removePage').onclick=()=>{if(active<0)return;pages.splice(active,1);active=Math.min(active,pages.length-1);renderList();renderActive()};
$('#downloadPage').onclick=async()=>{if(active<0)return;const blob=await canvasToBlob(canvas,'image/png');downloadBlob(blob,'scan-page-'+(active+1)+'.png')};
$('#runOcr').onclick=async()=>{if(active<0)return status('Aucune page.');try{status('OCR en cours…');const blob=await canvasToBlob(canvas,'image/png');const res=await runOcr(blob,{engine:'auto',language:$('#ocrLang').value,logger:m=>status((m.status||'OCR')+(m.progress!=null?' '+Math.round(m.progress*100)+' %':''))});$('#ocrOut').value=res.text;status('OCR terminé · '+res.detectedLanguage)}catch(e){status('Erreur OCR : '+(e?.message||e))}};
$('#exportPdf').onclick=async()=>{if(!pages.length)return status('Aucune page.');const JsPdf=window.jspdf?.jsPDF;if(!JsPdf)return status('jsPDF indisponible.');let pdf=null;for(let i=0;i<pages.length;i++){active=i;await new Promise(r=>{const im=new Image();im.onload=()=>{drawImageWithEffects(im,pages[i]);r()};im.src=pages[i].src});const portrait=canvas.height>=canvas.width,fmt=[canvas.width,canvas.height],page=pdf?(pdf.addPage(fmt,portrait?'portrait':'landscape'),pdf):new JsPdf({unit:'px',format:fmt,orientation:portrait?'portrait':'landscape'});page.addImage(canvas.toDataURL('image/jpeg',.92),'JPEG',0,0,canvas.width,canvas.height)}pdf.save('nlab-scan.pdf');active=0;renderList();renderActive();status('PDF assemblé.')};
document.addEventListener('studio-v2:action',e=>{const a=e.detail?.action;if(a==='open')$('#fileInput').click();if(a==='camera')$('#cameraInput').click();if(a==='clean')$('#applyCleanup').click();if(a==='ocr')$('#runOcr').click();if(a==='pdf')$('#exportPdf').click()});
renderList();renderActive();
