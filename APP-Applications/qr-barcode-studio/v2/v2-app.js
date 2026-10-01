import{mountStudioV2}from'../../_shared/studio-v2/frame.js';
import{resolveStudioVersions}from'../../_shared/studio-v2/version-service.js';
import studioManifest from'./studio-manifest.js';
const VERSION_INFO=await resolveStudioVersions({versionsHref:'../versions.json',coreVersionHref:'../../_shared/studio-v2/version.json',channel:'test'});
await mountStudioV2({manifest:studioManifest,versionInfo:VERSION_INFO});
const $=s=>document.querySelector(s),qsa=s=>[...document.querySelectorAll(s)];
let type='qrcode',qr=null,logoUrl='',hist=JSON.parse(localStorage.getItem('nlab-qr-history')||'[]');
const presets={qrcode:'https://nepheris.github.io/nLab-web/',datamatrix:'NLAB-DEMO-DATAMATRIX-001',code128:'NLAB-DEMO-CODE128-001','gs1-128':'(01)09501101530003(10)ABC123',ean13:'123456789012',ean8:'1234567'};
function hexToRgb(h){h=h.replace('#','');return [parseInt(h.slice(0,2),16),parseInt(h.slice(2,4),16),parseInt(h.slice(4,6),16)]}
function rgbToHsl([r,g,b]){r/=255;g/=255;b/=255;const M=Math.max(r,g,b),m=Math.min(r,g,b),d=M-m;let h=0,s=0,l=(M+m)/2;if(d){s=d/(1-Math.abs(2*l-1));if(M===r)h=60*((g-b)/d%6);else if(M===g)h=60*((b-r)/d+2);else h=60*((r-g)/d+4);if(h<0)h+=360}return [Math.round(h),Math.round(s*100),Math.round(l*100)]}
function colorText(hex){const mode=$('#colorMode').value;if(mode==='hex')return hex.toUpperCase();const rgb=hexToRgb(hex);if(mode==='rgb')return 'rgb('+rgb.join(', ')+')';const hsl=rgbToHsl(rgb);return 'hsl('+hsl[0]+', '+hsl[1]+'%, '+hsl[2]+'%)'}
function syncColorText(){for(const id of ['fg','fg2','bg'])$('#'+id+'Text').value=colorText($('#'+id).value)}
for(const id of ['fg','fg2','bg']){$('#'+id).oninput=()=>{syncColorText();render()}}
$('#colorMode').onchange=syncColorText;
function common(){return{size:+$('#size').value||360,margin:+$('#margin').value||0,fg:$('#fg').value,bg:$('#bg').value}}
function renderQR(){const c=common(),grad=$('#gradient').checked?{type:'linear',rotation:Math.PI/4,colorStops:[{offset:0,color:c.fg},{offset:1,color:$('#fg2').value}]}:undefined;qr=new QRCodeStyling({width:c.size,height:c.size,type:'svg',data:$('#value').value||' ',margin:c.margin,qrOptions:{errorCorrectionLevel:$('#ecc').value},dotsOptions:{type:$('#dots').value,color:c.fg,gradient:grad},cornersSquareOptions:{type:$('#corners').value,color:c.fg},cornersDotOptions:{type:$('#cornerDots').value,color:$('#fg2').value},backgroundOptions:{color:$('#transparent').checked?'transparent':c.bg},image:logoUrl||undefined,imageOptions:{hideBackgroundDots:true,imageSize:.24,margin:5,crossOrigin:'anonymous'}});qr.append($('#preview'))}
function renderBar(){const c=common(),canvas=document.createElement('canvas');let value=$('#value').value.trim()||presets[type];const opts={bcid:type,text:value,scale:4,backgroundcolor:c.bg.slice(1),barcolor:c.fg.slice(1),paddingwidth:c.margin/2,paddingheight:c.margin/2};if(['code128','gs1-128','ean13','ean8'].includes(type)){opts.height=20;opts.includetext=true;opts.textxalign='center'}bwipjs.toCanvas(canvas,opts);$('#preview').append(canvas)}
function render(){try{$('#preview').innerHTML='';$('#qrOptions').hidden=type!=='qrcode';$('#transparentWrap').hidden=type!=='qrcode';$('#previewType').textContent=qsa('#symTabs button').find(b=>b.dataset.type===type)?.textContent||type;type==='qrcode'?renderQR():renderBar();$('#status').textContent='Aperçu actualisé.'}catch(e){$('#status').textContent='Erreur : '+e.message}}
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
syncColorText();renderHistory();render();