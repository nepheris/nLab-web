import{mountStudioV2}from'../../_shared/studio-v2/frame.js';
import{resolveStudioVersions,applyVersionDocumentMeta}from'../../_shared/studio-v2/version-service.js';
import{SYMBOLOGIES,symbologyInfo,defaultPayload,renderSymbology,generateSymbologyBlob}from'../../_shared/studio-v2/symbology-service.js';
import{bindColorControl}from'../../_shared/studio-v2/color-control.js';
import{downloadBlob}from'../../_shared/studio-v2/download-service.js';
import{openInputPicker}from'../../_shared/studio-v2/input-picker.js';
import studioManifest from'./studio-manifest.js';
const VERSION_INFO=await resolveStudioVersions({versionsHref:'../versions.json',coreVersionHref:'../../_shared/studio-v2/version.json',channel:'test',sourcePath:studioManifest.sourcePath});
applyVersionDocumentMeta({studioName:studioManifest.name,studioVersion:VERSION_INFO.version,studioStatus:VERSION_INFO.status,coreVersion:VERSION_INFO.coreVersion,build:VERSION_INFO.build});
await mountStudioV2({manifest:studioManifest,versionInfo:VERSION_INFO});
const $=s=>document.querySelector(s),qsa=s=>[...document.querySelectorAll(s)];
let type='qrcode',rendered=null,logoUrl='',zoom=1,hist=JSON.parse(localStorage.getItem('nlab-qr-history')||'[]');
const presets=Object.fromEntries(SYMBOLOGIES.map(x=>[x.id,defaultPayload(x.id)]));
const colorControls=['fg','fg2','bg'].map(id=>bindColorControl({colorInput:'#'+id,textInput:'#'+id+'Text',formatInput:'#colorMode',defaultValue:$('#'+id).value,onChange:()=>{clearTimeout(window.__colorRender);window.__colorRender=setTimeout(render,40)}}));
function common(){return{size:+$('#size').value||360,margin:+$('#margin').value||0,fg:$('#fg').value,fg2:$('#fg2').value,bg:$('#bg').value,ecc:$('#ecc').value,dots:$('#dots').value,corners:$('#corners').value,cornerDots:$('#cornerDots').value,gradient:$('#gradient').checked,transparent:$('#transparent').checked,logo:logoUrl||undefined}}
async function render(){try{$('#qrOptions').hidden=type!=='qrcode';$('#transparentWrap').hidden=type!=='qrcode';const label=symbologyInfo(type).label;$('#previewType').textContent=label;$('#contentType').textContent=label;$('#contentValue').textContent=$('#value').value;rendered=await renderSymbology($('#preview'),type,$('#value').value,common());$('#status').textContent='Aperçu actualisé.'}catch(e){$('#status').textContent='Erreur : '+e.message}}
$('#symTabs').onclick=e=>{const b=e.target.closest('[data-type]');if(!b)return;type=b.dataset.type;qsa('#symTabs button').forEach(x=>x.classList.toggle('active',x===b));$('#value').value=presets[type];render()};
['value','dots','corners','cornerDots','ecc','size','margin','gradient','transparent'].forEach(id=>$('#'+id)?.addEventListener(id==='value'?'input':'change',()=>{clearTimeout(window.__r);window.__r=setTimeout(render,100)}));
async function setLogoFile(f){if(logoUrl)URL.revokeObjectURL(logoUrl);logoUrl=f?URL.createObjectURL(f):'';render()}
$('#logo').onchange=e=>setLogoFile(e.target.files?.[0]);
$('#logo').addEventListener('click',async e=>{e.preventDefault();const files=await openInputPicker({accept:'image/*',multiple:false,folders:false,camera:true,url:true});if(files?.[0])setLogoFile(files[0])});
$('#refreshPreview').onclick=render;
$('#downloadPng').onclick=async()=>{try{const r=await generateSymbologyBlob(type,$('#value').value,common(),'png');downloadBlob(r.blob,'nlab-'+type+'.png')}catch(e){$('#status').textContent='Erreur export PNG : '+e.message}};
$('#downloadSvg').onclick=async()=>{try{const r=await generateSymbologyBlob(type,$('#value').value,common(),'svg');downloadBlob(r.blob,'nlab-'+type+'.svg')}catch(e){$('#status').textContent='Erreur export SVG : '+e.message}};
function addHist(v,kind='scan'){hist.unshift({at:new Date().toISOString(),v,kind});hist=hist.slice(0,100);localStorage.setItem('nlab-qr-history',JSON.stringify(hist));renderHistory()}
function renderHistory(){$('#history').innerHTML=hist.length?hist.map(x=>'<div class="historyItem"><small>'+new Date(x.at).toLocaleString('fr-FR')+' · '+x.kind+'</small><b>'+String(x.v).replace(/[&<>]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]))+'</b></div>').join(''):'<span class="hint">Aucun historique.</span>'}
$('#scan').onkeydown=e=>{if(e.key==='Enter'){e.preventDefault();const v=e.currentTarget.value.trim();if(!v)return;$('#scanStatus').textContent='HID : '+v;addHist(v,'HID');e.currentTarget.value=''}};
async function scanImage(file){if(!file)return;try{$('#scanStatus').textContent='Lecture en cours…';if(!window.Html5Qrcode)throw new Error('Moteur image indisponible');const reader=new Html5Qrcode('scanDecoderHost');const v=await reader.scanFile(file,true);$('#scanStatus').textContent='Détecté : '+v;$('#contentType').textContent='Code lu';$('#contentValue').textContent=v;addHist(v,'image');try{reader.clear()}catch{}}catch(e){$('#scanStatus').textContent='Aucun code détecté : '+(e?.message||e)}}
$('#pickImage').onclick=async()=>{const files=await openInputPicker({accept:'image/*',multiple:false,folders:true,camera:true,url:true});if(files?.[0])scanImage(files[0])};$('#scanFile').onchange=e=>scanImage(e.target.files?.[0]);
const dz=$('#dropZone');['dragenter','dragover'].forEach(ev=>dz.addEventListener(ev,e=>{e.preventDefault();dz.classList.add('drag')}));['dragleave','drop'].forEach(ev=>dz.addEventListener(ev,e=>{e.preventDefault();dz.classList.remove('drag')}));dz.addEventListener('drop',e=>scanImage(e.dataTransfer.files?.[0]));
$('#clearHistory').onclick=()=>{hist=[];localStorage.removeItem('nlab-qr-history');renderHistory()};
function applyZoom(){zoom=Math.max(.25,Math.min(3,zoom));$('#preview').style.transform='scale('+zoom+')';$('#zoomLabel').textContent=Math.round(zoom*100)+' %'}
$('#zoomIn').onclick=()=>{zoom+=.25;applyZoom()};$('#zoomOut').onclick=()=>{zoom-=.25;applyZoom()};$('#zoomActual').onclick=()=>{zoom=1;applyZoom()};$('#zoomFit').onclick=()=>{zoom=.75;applyZoom()};
$('#copyContent').onclick=async()=>{try{await navigator.clipboard.writeText($('#contentValue').textContent||'')}catch{}};
qsa('[data-workflow]').forEach(b=>b.addEventListener('click',()=>{const mode=b.dataset.workflow;qsa('[data-workflow]').forEach(x=>x.classList.toggle('active',x===b));$('.toolPanel').hidden=mode!=='generate';$('.scanPanel').hidden=mode!=='read';$('#previewType').textContent=mode==='read'?'Résultat de lecture':symbologyInfo(type).label;if(mode==='read')$('#contentType').textContent='En attente'}));
$('#openDemo')?.addEventListener('click',()=>window.open('../../Library/demo/','_blank'));
applyZoom();renderHistory();render();