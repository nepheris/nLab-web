import{mountStudioFrame}from'../_shared/studio-v1/frame.js';
import studioManifest from'./studio-manifest.js';
await mountStudioFrame({manifest:studioManifest,registryUrl:'./versions.json',versionChannel:'test'});
const $=s=>document.querySelector(s),qsa=s=>[...document.querySelectorAll(s)];
let data=[];
function rng(seed){let x=seed>>>0;return()=>((x=(1664525*x+1013904223)>>>0)/4294967296)}
function cols(){return new Set(qsa('[data-col]:checked').map(x=>x.dataset.col))}
function make(){const n=Math.max(1,Math.min(5000,+$('#rows').value||40)),r=rng(+$('#seed').value||1),c=cols(),preset=$('#preset').value;const cats=['A','B','C','D'];data=[];for(let i=1;i<=n;i++){const o={};if(c.has('id'))o.test_id='NLAB-TEST-'+String(i).padStart(4,'0');if(c.has('name'))o.name=['Alpha','Bêta','Gamma','Delta'][Math.floor(r()*4)]+' Test '+i;if(c.has('category'))o.category=cats[Math.floor(r()*cats.length)];if(c.has('number'))o.value=preset==='finance'?Math.round((r()*20000-5000)*100)/100:Math.round(r()*100000)/100;if(c.has('date'))o.date='2026-09-'+String(1+Math.floor(r()*28)).padStart(2,'0');if(c.has('url'))o.public_url=['https://www.data.gouv.fr/','https://www.insee.fr/','https://fr.wikipedia.org/'][Math.floor(r()*3)];if(preset==='catalog')o.sku='DEMO-'+String(100000+i);if(preset==='people'){o.email='demo.'+i+'@example.test';o.phone='+33 0 00 00 '+String(i).padStart(2,'0')+' 00'}data.push(o)}render();$('#status').textContent=n+' lignes générées localement.'}
function render(){const keys=[...new Set(data.flatMap(Object.keys))];$('#count').textContent=data.length+' ligne(s)';$('#table').innerHTML='<thead><tr>'+keys.map(k=>'<th style="border:1px solid #d8e0e7;padding:6px;background:#f4f7f9;text-align:left">'+k+'</th>').join('')+'</tr></thead><tbody>'+data.slice(0,250).map(o=>'<tr>'+keys.map(k=>'<td style="border:1px solid #e4e9ed;padding:6px">'+String(o[k]??'')+'</td>').join('')+'</tr>').join('')+'</tbody>'}
function dl(blob,name){const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000)}
function csv(){if(!data.length)return'';const k=Object.keys(data[0]),q=v=>'"'+String(v??'').replace(/"/g,'""')+'"';return k.map(q).join(';')+'\n'+data.map(o=>k.map(x=>q(o[x])).join(';')).join('\n')}
$('#generate').onclick=make;$('#randomize').onclick=()=>{$('#seed').value=Math.floor(Math.random()*2147483647);make()};
$('#exportJson').onclick=()=>dl(new Blob([JSON.stringify({schema:'nlab-demo-dataset/v1',synthetic:true,records:data},null,2)],{type:'application/json'}),'nlab-dataset-demo.json');
$('#exportCsv').onclick=()=>dl(new Blob([csv()],{type:'text/csv;charset=utf-8'}),'nlab-dataset-demo.csv');
$('#exportMd').onclick=()=>dl(new Blob(['# nLab Dataset Demo\n\n~~~json\n'+JSON.stringify(data.slice(0,20),null,2)+'\n~~~\n'],{type:'text/markdown'}),'nlab-dataset-demo.md');
$('#exportXlsx').onclick=()=>{if(!window.XLSX){$('#status').textContent='XLSX indisponible';return}const wb=XLSX.utils.book_new(),ws=XLSX.utils.json_to_sheet(data);XLSX.utils.book_append_sheet(wb,ws,'Dataset');XLSX.writeFile(wb,'nlab-dataset-demo.xlsx')};
$('#advanced').onclick=()=>$('#status').textContent='Générateurs avancés (images, QR, arborescences, packs) : moteur existant côté scripts, intégration navigateur en développement.';
make();