import{PDFEngine,pdfPageCount}from'../../pdf-studio/v1/pdf-engine.js';
import{downloadBlob}from'../../_shared/studio-v2/download-service.js';
const $=id=>document.getElementById(id),engine=new PDFEngine();let items=[],selected=-1;
function esc(s){return String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]))}
const pageCount=file=>pdfPageCount(file)
async function addFiles(files){for(const f of files||[]){if(!/\.pdf$/i.test(f.name)&&f.type!=='application/pdf')continue;items.push({file:f,name:f.name,size:f.size,pages:await pageCount(f),relativePath:f.webkitRelativePath||f.__relativePath||''})}if(selected<0&&items.length)selected=0;render();await previewSelected()}
function setText(id,value){const el=$(id);if(el)el.textContent=value}
function render(){const host=$('mergeList');if(!host)return;host.innerHTML=items.map((x,i)=>'<div class="mergeItem '+(i===selected?'active':'')+'" data-merge-index="'+i+'" draggable="true" title="Glisser pour réordonner"><span class="mergeOrder">'+(i+1)+'</span><div><strong>'+esc(x.name)+'</strong><small>'+x.pages+' page(s) · '+Math.max(1,Math.round(x.size/1024))+' Ko'+(x.relativePath?' · '+esc(x.relativePath):'')+'</small></div><button type="button" data-remove-merge="'+i+'" title="Retirer">×</button></div>').join('')||'<div class="status">Aucun PDF.</div>';setText('mergeFileCount',items.length);setText('mergePageCount',items.reduce((s,x)=>s+x.pages,0));setText('mergeSize',Math.round(items.reduce((s,x)=>s+x.size,0)/1024)+' Ko');setText('mergeStatus',items.length<2?'Ajoutez au moins deux PDF.':items.length+' PDF prêts à fusionner.')}
async function previewSelected(){const x=items[selected],cv=$('mergePreview');if(!cv)return;const ctx=cv.getContext('2d');ctx.clearRect(0,0,cv.width,cv.height);if(!x){setText('previewLabel','Aucun document');return}try{await engine.loadFile(x.file);await engine.renderPage(cv,1,.8);setText('previewLabel',x.name+' · '+x.pages+' p.')}catch(e){setText('previewLabel','Aperçu indisponible');setText('mergeStatus',e.message)}}
function move(delta){const i=selected,j=i+delta;if(i<0||j<0||j>=items.length)return;[items[i],items[j]]=[items[j],items[i]];selected=j;render();previewSelected()}
function bindUi(){
 const add=$('addMergeFiles'),native=$('mergeFilesNative'),clear=$('clearMergeFiles'),up=$('moveMergeUp'),down=$('moveMergeDown'),list=$('mergeList'),merge=$('mergeNow'),outputName=$('mergeOutputName'),status=$('mergeStatus');
 if(!add||!native||!clear||!up||!down||!list||!merge||!outputName||!status)throw new Error('Merge Studio UI incomplète');
 add.addEventListener('click',()=>document.dispatchEvent(new CustomEvent('studio-v2:action',{detail:{action:'open',source:'merge-ui'}})));
 native.addEventListener('change',e=>addFiles(e.target.files));
 clear.addEventListener('click',()=>{items=[];selected=-1;render();previewSelected()});
 up.addEventListener('click',()=>move(-1));down.addEventListener('click',()=>move(1));
 let dragIndex=-1;
 list.addEventListener('dragstart',e=>{const row=e.target.closest('[data-merge-index]');if(!row)return;dragIndex=Number(row.dataset.mergeIndex);e.dataTransfer.effectAllowed='move'});
 list.addEventListener('dragover',e=>{if(e.target.closest('[data-merge-index]'))e.preventDefault()});
 list.addEventListener('drop',e=>{const row=e.target.closest('[data-merge-index]');if(!row||dragIndex<0)return;e.preventDefault();const to=Number(row.dataset.mergeIndex);if(to===dragIndex)return;const [moved]=items.splice(dragIndex,1);items.splice(to,0,moved);selected=to;dragIndex=-1;render();previewSelected()});
 list.addEventListener('dragend',()=>{dragIndex=-1});
 list.addEventListener('click',e=>{const rm=e.target.closest('[data-remove-merge]');if(rm){const i=Number(rm.dataset.removeMerge);items.splice(i,1);if(selected>=items.length)selected=items.length-1;render();previewSelected();return}const row=e.target.closest('[data-merge-index]');if(row){selected=Number(row.dataset.mergeIndex);render();previewSelected()}});
 document.addEventListener('studio-v2:input-picked',e=>{if(e.detail?.studio==='merge-studio')addFiles(e.detail.files)});
 merge.addEventListener('click',async()=>{if(items.length<2){status.textContent='Ajoutez au moins deux PDF.';return}try{status.textContent='Fusion en cours…';const entries=[];for(const x of items)entries.push({name:x.name,bytes:new Uint8Array(await x.file.arrayBuffer())});const name=(outputName.value||'fusion.pdf').trim().replace(/[^a-zA-Z0-9._ -]+/g,'_');await engine.mergePdfBytes(entries,{fileName:/\.pdf$/i.test(name)?name:name+'.pdf'});const bytes=await engine.baseBytes();downloadBlob(new Blob([bytes],{type:'application/pdf'}),engine.fileName);status.textContent='Fusion créée : '+engine.fileName+' · '+engine.pageCount+' pages'}catch(e){console.error(e);status.textContent='Erreur : '+(e?.message||e)}});
 render();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',bindUi,{once:true});else bindUi();
