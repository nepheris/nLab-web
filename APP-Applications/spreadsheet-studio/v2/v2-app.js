import{mountStudioV2}from'../../_shared/studio-v2/frame.js';
import{resolveStudioVersions}from'../../_shared/studio-v2/version-service.js';
import{readWorkbook,workbookFromCsv,workbookFromJson,workbookToRows,rowsToObjects,toCsv,workbookBlob}from'../../_shared/studio-v2/tabular-service.js';
import{downloadBlob,downloadJson,downloadCsv}from'../../_shared/studio-v2/download-service.js';
import studioManifest from'./studio-manifest.js';
const VERSION_INFO=await resolveStudioVersions({versionsHref:'../versions.json',coreVersionHref:'../../_shared/studio-v2/version.json',channel:'test'});
await mountStudioV2({manifest:studioManifest,versionInfo:VERSION_INFO});
const $=s=>document.querySelector(s);let wb=XLSX.utils.book_new(),bookName='classeur.xlsx',rows=[];
function esc(s){return String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]))}
function sheetRows(){return workbookToRows(wb,$('#sheetSelect').value)}
function render(){const all=sheetRows(),q=$('#search').value.trim().toLowerCase();rows=q?all.filter((r,i)=>i===0||r.some(v=>String(v??'').toLowerCase().includes(q))):all;const cols=Math.max(0,...rows.map(r=>r.length));$('#dims').textContent=Math.max(0,rows.length-1)+' × '+cols;if(!rows.length){$('#tableWrap').innerHTML='<div class="statusBox">Feuille vide.</div>';return}$('#tableWrap').innerHTML='<table><thead><tr>'+rows[0].map(x=>'<th>'+esc(x)+'</th>').join('')+'</tr></thead><tbody>'+rows.slice(1,251).map(r=>'<tr>'+Array.from({length:cols},(_,i)=>'<td>'+esc(r[i]??'')+'</td>').join('')+'</tr>').join('')+'</tbody></table>'}
function syncSheets(){const names=wb.SheetNames||[];$('#sheetSelect').innerHTML=names.map(n=>'<option value="'+esc(n)+'">'+esc(n)+'</option>').join('');render()}
async function openFile(file){bookName=file.name;$('#bookName').textContent=file.name;const ext=(file.name.split('.').pop()||'').toLowerCase();if(ext==='json')wb=workbookFromJson(JSON.parse(await file.text()));else if(ext==='csv'||ext==='tsv')wb=workbookFromCsv(await file.text(),{delimiter:ext==='tsv'?'\t':''});else wb=await readWorkbook(file);syncSheets();$('#status').textContent='Chargé · '+file.name+' · '+wb.SheetNames.length+' feuille(s) · moteur tabulaire partagé'}
$('#fileInput').onchange=e=>{const f=e.target.files?.[0];if(f)openFile(f).catch(err=>$('#status').textContent=err.message)};$('#openSheet').onclick=()=>$('#fileInput').click();$('#sheetSelect').onchange=render;$('#search').oninput=render;
$('#exportJson').onclick=()=>downloadJson(rowsToObjects(sheetRows()),bookName.replace(/\.[^.]+$/,'.json'));
$('#exportCsv').onclick=()=>{const sep=$('#delimiter').value==='\t'?'\t':$('#delimiter').value,csv=toCsv(sheetRows(),{delimiter:sep,bom:false});downloadCsv(csv,bookName.replace(/\.[^.]+$/,'.csv'),{bom:$('#bom').checked})};
$('#exportXlsx').onclick=()=>downloadBlob(workbookBlob(wb,'xlsx'),bookName.replace(/\.[^.]+$/,'.xlsx'));
$('#exportOds').onclick=()=>downloadBlob(workbookBlob(wb,'ods'),bookName.replace(/\.[^.]+$/,'.ods'));
document.addEventListener('studio-v2:action',e=>{const a=e.detail?.action,map={openSheet:'#openSheet',exportCsv:'#exportCsv',exportJson:'#exportJson',exportXlsx:'#exportXlsx',exportOds:'#exportOds'};const sel=map[a];if(sel)$(sel)?.click()});
const ws=XLSX.utils.aoa_to_sheet([['Colonne A','Colonne B'],['Exemple',123]]);XLSX.utils.book_append_sheet(wb,ws,'Feuille1');syncSheets();window.__NLAB_SPREADSHEET_STUDIO__={openFile,getWorkbook:()=>wb};
