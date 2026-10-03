import{mountStudioV2}from'../../_shared/studio-v2/frame.js';
import{resolveStudioVersions}from'../../_shared/studio-v2/version-service.js';
import studioManifest from'./studio-manifest.js';
const VERSION_INFO=await resolveStudioVersions({versionsHref:'../versions.json',coreVersionHref:'../../_shared/studio-v2/version.json',channel:'test'});
await mountStudioV2({manifest:studioManifest,versionInfo:VERSION_INFO});
const $=s=>document.querySelector(s);let wb=XLSX.utils.book_new(),bookName='classeur.xlsx',rows=[];
function esc(s){return String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]))}
function sheetRows(){const n=$('#sheetSelect').value;if(!n||!wb.Sheets[n])return[];return XLSX.utils.sheet_to_json(wb.Sheets[n],{header:1,defval:''})}
function render(){const all=sheetRows(),q=$('#search').value.trim().toLowerCase();rows=q?all.filter((r,i)=>i===0||r.some(v=>String(v??'').toLowerCase().includes(q))):all;const cols=Math.max(0,...rows.map(r=>r.length));$('#dims').textContent=Math.max(0,rows.length-1)+' × '+cols;if(!rows.length){$('#tableWrap').innerHTML='<div class="statusBox">Feuille vide.</div>';return}$('#tableWrap').innerHTML='<table><thead><tr>'+rows[0].map(x=>'<th>'+esc(x)+'</th>').join('')+'</tr></thead><tbody>'+rows.slice(1,251).map(r=>'<tr>'+Array.from({length:cols},(_,i)=>'<td>'+esc(r[i]??'')+'</td>').join('')+'</tr>').join('')+'</tbody></table>'}
function syncSheets(){const names=wb.SheetNames||[];$('#sheetSelect').innerHTML=names.map(n=>'<option value="'+esc(n)+'">'+esc(n)+'</option>').join('');render()}
async function openFile(file){bookName=file.name;$('#bookName').textContent=file.name;const ext=(file.name.split('.').pop()||'').toLowerCase();if(ext==='json'){const data=JSON.parse(await file.text()),arr=Array.isArray(data)?data:(data.records||[data]);wb=XLSX.utils.book_new();XLSX.utils.book_append_sheet(wb,XLSX.utils.json_to_sheet(arr),'Data')}else if(ext==='csv'||ext==='tsv'){const txt=await file.text(),del=ext==='tsv'?'\t':undefined;wb=XLSX.read(txt,{type:'string',FS:del})}else{wb=XLSX.read(await file.arrayBuffer(),{type:'array',cellDates:true})}syncSheets();$('#status').textContent='Chargé · '+file.name+' · '+wb.SheetNames.length+' feuille(s)'}
$('#fileInput').onchange=e=>{const f=e.target.files?.[0];if(f)openFile(f).catch(err=>$('#status').textContent=err.message)};$('#openSheet').onclick=()=>$('#fileInput').click();$('#sheetSelect').onchange=render;$('#search').oninput=render;
function dl(blob,name){const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000)}
function currentObjects(){const a=sheetRows(),head=a[0]||[];return a.slice(1).map(r=>Object.fromEntries(head.map((h,i)=>[String(h||'col_'+(i+1)),r[i]??''])))}
$('#exportJson').onclick=()=>dl(new Blob([JSON.stringify(currentObjects(),null,2)],{type:'application/json'}),bookName.replace(/\.[^.]+$/,'.json'));
$('#exportCsv').onclick=()=>{const sep=$('#delimiter').value==='\t'?'\t':$('#delimiter').value,q=v=>'"'+String(v??'').replaceAll('"','""')+'"',csv=sheetRows().map(r=>r.map(q).join(sep)).join('\r\n'),bom=$('#bom').checked?'\ufeff':'';dl(new Blob([bom+csv],{type:'text/csv;charset=utf-8'}),bookName.replace(/\.[^.]+$/,'.csv'))};
$('#exportXlsx').onclick=()=>XLSX.writeFile(wb,bookName.replace(/\.[^.]+$/,'.xlsx'),{bookType:'xlsx'});
$('#exportOds').onclick=()=>XLSX.writeFile(wb,bookName.replace(/\.[^.]+$/,'.ods'),{bookType:'ods'});
document.addEventListener('studio-v2:action',e=>{const a=e.detail?.action,map={openSheet:'#openSheet',exportCsv:'#exportCsv',exportJson:'#exportJson',exportXlsx:'#exportXlsx',exportOds:'#exportOds'};const sel=map[a];if(sel)$(sel)?.click()});
const ws=XLSX.utils.aoa_to_sheet([['Colonne A','Colonne B'],['Exemple',123]]);XLSX.utils.book_append_sheet(wb,ws,'Feuille1');syncSheets();window.__NLAB_SPREADSHEET_STUDIO__={openFile,getWorkbook:()=>wb};
