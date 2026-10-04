import{mountStudioV2}from'../../_shared/studio-v2/frame.js';
import{resolveStudioVersions,applyVersionDocumentMeta}from'../../_shared/studio-v2/version-service.js';
import{SYMBOLOGIES,symbologyInfo,defaultPayload,bwipOptions,validatePayload}from'../../_shared/studio-v2/symbology-service.js';
import{bindColorControl}from'../../_shared/studio-v2/color-control.js';
import studioManifest from'./studio-manifest.js';
const VERSION_INFO=await resolveStudioVersions({versionsHref:'../versions.json',coreVersionHref:'../../_shared/studio-v2/version.json',channel:'test',sourcePath:studioManifest.sourcePath});
applyVersionDocumentMeta({studioName:studioManifest.name,studioVersion:VERSION_INFO.version,studioStatus:VERSION_INFO.status,coreVersion:VERSION_INFO.coreVersion,build:VERSION_INFO.build});
await mountStudioV2({manifest:studioManifest,versionInfo:VERSION_INFO});
const $=s=>document.querySelector(s),qsa=s=>[...document.querySelectorAll(s)];
let type='qrcode',qr=null,logoUrl='',hist=JSON.parse(localStorage.getItem('nlab-qr-history')||'[]');
const presets=Object.fromEntries(SYMBOLOGIES.map(x=>[x.id,defaultPayload(x.id)]));
const colorControls=['fg','fg2','bg'].map(id=>bindColorControl({colorInput:'#'+id,textInput:'#'+id+'Text',formatInput:'#colorMode',defaultValue:$('#'+id).value,onChange:()=>{clearTimeout(window.__colorRender);window.__colorRender=setTimeout(render,40)}}));
function common(){return{size:+$('#size').value||360,margin:+$('#margin').value||0,fg:$('#fg').value,bg:$('#bg').value}}
function renderQR(){const c=common(),grad=$('#gradient').checked?{type:'linear',rotation:Math.PI/4,colorStops:[{offset:0,color:c.fg},{offset:1,color:$('#fg2').value}]}:undefined;qr=new QRCodeStyling({width:c.size,height:c.size,type:'svg',data:$('#value').value||' ',margin:c.margin,qrOptions:{errorCorrectionLevel:$('#ecc').value},dotsOptions:{type:$('#dots').value,color:c.fg,gradient:grad},cornersSquareOptions:{type:$('#corners').value,color:c.fg},cornersDotOptions:{type:$('#cornerDots').value,color:$('#fg2').value},backgroundOptions:{color:$('#transparent').checked?'transparent':c.bg},image:logoUrl||undefined,imageOptions:{hideBackgroundDots:true,imageSize:.24,margin:5,crossOrigin:'anonymous'}});qr.append($('#preview'))}
function renderBar(){const cc=common(),canvas=document.createElement('canvas'),valid=validatePayload(type,$('#value').value);if(!valid.ok)throw new Error(valid.message);bwipjs.toCanvas(canvas,bwipOptions(type,valid.value,cc));$('#preview').append(canvas)}
function render(){try{$('#preview').innerHTML='';$('#qrOptions').hidden=type!=='qrcode';$('#transparentWrap').hidden=type!=='qrcode';$('#previewType').textContent=symbologyInfo(type).label;type==='qrcode'?renderQR():renderBar();$('#status').textContent='Aperçu actualisé.'}catch(e){$('#status').textContent='Erreur : '+e.message}}
$('#symTabs').onclick=e=>{const b=e.target.closest('[data-type]');if(!b)return;type=b.dataset.type;qsa('#symTabs button').forEach(x=>x.classList.toggle('active',x===b));$('#value').value=presets[type];render()};
['value','dots','corners','cornerDots','ecc','size','margin','gradient','transparent'].forEach(id=>$('#'+id)?.addEventListener(id==='value'?'input':'change',()=>{clearTimeout(window.__r);window.__r=setTimeout(render,100)}));
$('#logo').onchange=e=>{const f=e.target.files?.[0];if(logoUrl)URL.revokeObjectURL(logoUrl);logoUrl=f?URL.createObjectURL(f):'';render()};
$('#refreshPreview').onclick=render;
$('#downloadPng').onclick=()=>{if(type==='qrcode')qr?.download({name:'nlab-qrcode',extension:'png'});else{const canvas=$('#preview canvas');if(!canvas)return;const a=document.createElement('a');a.href=canvas.toDataURL('image/png');a.download='nlab-'+type+'.png';a.click()}};
$('#downloadSvg').onclick=()=>{if(type==='qrcode')qr?.download({name:'nlab-qrcode',extension:'svg'});else $('#status').textContent='Export SVG : disponible pour QR dans cette TEST; autres symbologies à compléter.'};
function addHist(v,kind='scan'){hist.unshift({at:new Date().toISOString(),v,kind});hist=hist.slice(0,100);localStorage.setItem('nlab-qr-history',JSON.stringify(hist));renderHistory()}
function renderHistory(){$('#history').innerHTML=hist.length?hist.map(x=>'<div class="historyItem"><small>'+new Date(x.at).toLocaleString('fr-FR')+' · '+x.kind+'</small><b>'+String(x.v).replace(/[&<>]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]))+'</b></div>').join(''):'<span class="hint">Aucun historique.</span>'}
$('#scan').onkeydown=e=>{if(e.key==='Enter'){e.preventDefault();const v=e.currentTarget.value.trim();if(!v)return;$('#scanStatus').textContent='HID : '+v;addHist(v,'HID');e.currentTarget.value=''}};
async function scanImage(file){if(!file)return;try{$('#scanStatus').textContent='Lecture en cours…';if(!window.Html5Qrcode)throw new Error('Moteur image indisponible');const reader=new Html5Qrcode('preview');const v=await reader.scanFile(file,true);$('#scanStatus').textContent='Détecté : '+v;addHist(v,'image');try{reader.clear()}catch{}render()}catch(e){$('#scanStatus').textContent='Aucun code détecté : '+(e?.message||e)}}
$('#pickImage').onclick=()=>$('#scanFile').click();$('#scanFile').onchange=e=>scanImage(e.target.files?.[0]);
const dz=$('#dropZone');['dragenter','dragover'].forEach(ev=>dz.addEventListener(ev,e=>{e.preventDefault();dz.classList.add('drag')}));['dragleave','drop'].forEach(ev=>dz.addEventListener(ev,e=>{e.preventDefault();dz.classList.remove('drag')}));dz.addEventListener('drop',e=>scanImage(e.dataTransfer.files?.[0]));
$('#clearHistory').onclick=()=>{hist=[];localStorage.removeItem('nlab-qr-history');renderHistory()};
$('#openDemo').onclick=()=>window.open('../../Library/demo/','_blank');
renderHistory();render();