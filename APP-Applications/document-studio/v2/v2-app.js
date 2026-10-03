import{mountStudioV2}from'../../_shared/studio-v2/frame.js';
import{resolveStudioVersions}from'../../_shared/studio-v2/version-service.js';
import{readDocx,readOdt,extractRtfText,writeDocx,writeOdt,textToHtml}from'../../_shared/studio-v2/document-format-service.js';
import{downloadBlob,downloadText}from'../../_shared/studio-v2/download-service.js';
import studioManifest from'./studio-manifest.js';
const VERSION_INFO=await resolveStudioVersions({versionsHref:'../versions.json',coreVersionHref:'../../_shared/studio-v2/version.json',channel:'test'});
await mountStudioV2({manifest:studioManifest,versionInfo:VERSION_INFO});
const $=s=>document.querySelector(s),editor=$('#editor'),preview=$('#preview');let fileName='nouveau.txt',format='txt';
const esc=s=>String(s??'').replace(/[&<>"]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[m]));
function render(){const t=editor.value;$('#words').textContent=(t.trim().match(/\S+/g)||[]).length;$('#chars').textContent=t.length;$('#lines').textContent=t?t.split(/\r?\n/).length:0;const q=$('#search').value.trim();preview.innerHTML=esc(t).replace(/\n/g,'<br>');if(q){const re=new RegExp(q.replace(/[.*+?^$()|[\]{}\\]/g,'\\$&'),'gi');preview.innerHTML=preview.innerHTML.replace(re,m=>'<mark>'+m+'</mark>')}}
async function openFile(file){fileName=file.name;const ext=(file.name.split('.').pop()||'').toLowerCase();format=ext;$('#docName').textContent=file.name;$('#formatBadge').textContent=ext.toUpperCase();if(ext==='doc')throw new Error('DOC binaire legacy : conversion préalable vers DOCX, ODT ou RTF recommandée.');if(ext==='docx')editor.value=await readDocx(file);else if(ext==='odt')editor.value=await readOdt(file);else{const t=await file.text();if(ext==='html'||ext==='htm')editor.value=new DOMParser().parseFromString(t,'text/html').body.textContent||'';else if(ext==='rtf')editor.value=extractRtfText(t);else editor.value=t}render();$('#status').textContent='Chargé · '+file.name+' · moteur documentaire partagé'}
function stem(){return(fileName||'document').replace(/\.[^.]+$/,'')}
$('#fileInput').onchange=e=>{const f=e.target.files?.[0];if(f)openFile(f).catch(err=>$('#status').textContent=err.message)};$('#openDocument').onclick=()=>$('#fileInput').click();editor.addEventListener('input',render);$('#search').addEventListener('input',render);
$('#exportTxt').onclick=()=>downloadText(editor.value,stem()+'.txt','text/plain;charset=utf-8');
$('#exportMd').onclick=()=>downloadText(editor.value,stem()+'.md','text/markdown;charset=utf-8');
$('#exportHtml').onclick=()=>downloadText(textToHtml(editor.value,{title:stem()}),stem()+'.html','text/html;charset=utf-8');
$('#exportDocx').onclick=async()=>downloadBlob(await writeDocx(editor.value),stem()+'.docx');$('#exportOdt').onclick=async()=>downloadBlob(await writeOdt(editor.value),stem()+'.odt');
$('#printPdf').onclick=()=>{const w=window.open('','_blank','noopener,noreferrer');if(!w)return $('#status').textContent='Fenêtre d’impression bloquée';w.document.write('<!doctype html><meta charset="utf-8"><title>'+esc(stem())+'</title><style>@page{margin:18mm}body{font:12pt/1.55 Arial;white-space:pre-wrap}</style><body>'+esc(editor.value).replace(/\n/g,'<br>')+'<script>onload=()=>print()<\/script></body>');w.document.close();$('#status').textContent='Impression ouverte · choisir Enregistrer au format PDF'};
document.addEventListener('studio-v2:action',e=>{const a=e.detail?.action,map={openDocument:'#openDocument',exportTxt:'#exportTxt',exportMd:'#exportMd',exportHtml:'#exportHtml',exportDocx:'#exportDocx',exportOdt:'#exportOdt',printPdf:'#printPdf'};const sel=map[a];if(sel)$(sel)?.click()});
render();window.__NLAB_DOCUMENT_STUDIO__={getText:()=>editor.value,openFile};
