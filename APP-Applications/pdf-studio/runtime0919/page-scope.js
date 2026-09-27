(()=>{'use strict';
if(window.__NLAB_0919_PAGE_SCOPE__)return;
window.__NLAB_0919_PAGE_SCOPE__=true;
const $p=id=>document.getElementById(id);
S.pageSelection0919=S.pageSelection0919||new Set();
S.pageSelectionAnchor0919=S.pageSelectionAnchor0919||null;
S.pageScope0919=S.pageScope0919||'current';

function pageCount0919(){return S.pdfjs?.numPages||0}
function selectedPages0919(){return [...S.pageSelection0919].filter(p=>p>=1&&p<=pageCount0919()).sort((a,b)=>a-b)}
function targetPages0919(scope=S.pageScope0919){
 const n=pageCount0919();if(!n)return[];
 if(scope==='all')return Array.from({length:n},(_,i)=>i+1);
 const sel=selectedPages0919();if(scope==='selected'&&sel.length)return sel;
 return[Math.max(1,Math.min(n,S.page||1))];
}
window.NLAB_PAGE_SCOPE_0919={selected:selectedPages0919,target:targetPages0919,setScope:s=>{S.pageScope0919=s;renderScope0919()},selectAll:()=>{S.pageSelection0919=new Set(Array.from({length:pageCount0919()},(_,i)=>i+1));renderPageStrip();renderScope0919()},clear:()=>{S.pageSelection0919.clear();renderPageStrip();renderScope0919()}};

function selectClick0919(page,e){
 const n=pageCount0919(),multi=!!(e.ctrlKey||e.metaKey),range=!!e.shiftKey;
 if(range&&S.pageSelectionAnchor0919){
  const lo=Math.min(S.pageSelectionAnchor0919,page),hi=Math.max(S.pageSelectionAnchor0919,page);
  if(!multi)S.pageSelection0919.clear();
  for(let p=lo;p<=hi;p++)S.pageSelection0919.add(p);
 }else if(multi){
  S.pageSelection0919.has(page)?S.pageSelection0919.delete(page):S.pageSelection0919.add(page);
  S.pageSelectionAnchor0919=page;
 }else{
  S.pageSelection0919=new Set([page]);S.pageSelectionAnchor0919=page;
 }
 S.page=page;render();renderScope0919();
}
function decorateThumbs0919(){
 const thumbs=[...document.querySelectorAll('#pageStrip .pageThumb')],n=pageCount0919();
 for(let i=0;i<thumbs.length;i++){
  const t=thumbs[i],page=i+1;t.dataset.page=String(page);t.classList.toggle('multiSelected0919',S.pageSelection0919.has(page));
  t.title=(S.pageLocks.has(page)?'Page verrouillée':'Page '+page)+' · clic = sélection unique · Ctrl/Cmd+clic = multi-sélection · Maj+clic = plage';
  t.onclick=e=>{if(e.target.closest('button'))return;selectClick0919(page,e)};
 }
 S.pageSelection0919=new Set([...S.pageSelection0919].filter(p=>p<=n));
}
const renderPageStrip0919Base=renderPageStrip;
renderPageStrip=function(){renderPageStrip0919Base();decorateThumbs0919();renderScope0919()};

function ensureScopeUi0919(){
 if($p('pageScopeBar0919')||!E.pageStrip)return;
 const bar=document.createElement('div');bar.id='pageScopeBar0919';bar.className='pageScopeBar0919';
 bar.innerHTML='<b>Portée des opérations</b><select id="pageScope0919"><option value="current">Page courante</option><option value="selected">Page(s) sélectionnée(s)</option><option value="all">Tout le document</option></select><button id="pageSelectAll0919" type="button">Tout sélectionner</button><button id="pageClear0919" type="button">Effacer sélection</button><span id="pageSelectionInfo0919">0 sélectionnée</span><small>Ctrl/Cmd + clic : ajouter/retirer une page · Maj + clic : sélectionner une plage.</small>';
 E.pageStrip.before(bar);
 $p('pageScope0919').value=S.pageScope0919;
 $p('pageScope0919').onchange=e=>{S.pageScope0919=e.target.value;renderScope0919()};
 $p('pageSelectAll0919').onclick=()=>{S.pageSelection0919=new Set(Array.from({length:pageCount0919()},(_,i)=>i+1));renderPageStrip()};
 $p('pageClear0919').onclick=()=>{S.pageSelection0919.clear();renderPageStrip()};
}
function renderScope0919(){
 const x=$p('pageScope0919');if(x)x.value=S.pageScope0919;
 const sel=selectedPages0919(),info=$p('pageSelectionInfo0919');if(info)info.textContent=sel.length?sel.length+' page(s) : '+sel.join(', '):'Aucune page sélectionnée';
 document.querySelectorAll('#pageStrip .pageThumb').forEach((t,i)=>t.classList.toggle('multiSelected0919',S.pageSelection0919.has(i+1)));
}

rotatePage=async function(delta){
 assertUnsignedEditable('tourner les pages');if(!S.pdfBytes)throw new Error('Aucun document');
 const targets=targetPages0919();if(!targets.length)return;const keep=S.page,doc=await PDFLib.PDFDocument.load(S.pdfBytes.slice(0)),pages=doc.getPages();
 for(const pg of targets){const p=pages[pg-1],r=p.getRotation().angle;p.setRotation(PDFLib.degrees((r+delta+360)%360))}
 const b=await doc.save();await loadBytes(b,false);S.page=Math.min(keep,S.pdfjs?.numPages||1);await render();
 markOperation('rotate',{pages:targets,delta});recordDocumentAction('Rotation pages',targets.join(', ')+' · '+(delta>0?'droite':'gauche')+' 90°');
 st(targets.length+' page(s) tournée(s) de 90° vers '+(delta>0?'la droite':'la gauche')+'.');
};

const newStamp0919Base=newStampAnn;
newStampAnn=function(x=60,top=70){
 const targets=targetPages0919();
 if(targets.length<=1)return newStamp0919Base(x,top);
 const keep=S.page;S.page=targets[0];newStamp0919Base(x,top);const first=S.selectedAnn;
 if(!first||first.type!=='stamp'){S.page=keep;return}
 const created=[first];
 for(const pg of targets.slice(1)){const c={...first,id:crypto.randomUUID?crypto.randomUUID():String(Date.now()+Math.random()),page:pg};S.annotations.push(c);created.push(c)}
 S.page=keep;S.selectedAnn=created.find(a=>a.page===keep)||first;renderAnns();updatePath();commitAnnotationHistory('Tampon multi-pages '+targets.join(', '));
 st('Tampon « '+(first.stampLabel||'')+' » ajouté sur '+targets.length+' page(s).');
};

async function renderOptimizedPage0919(pg,dpi,q,gray){
 const page=await S.pdfjs.getPage(pg),scale=dpi/72,vp=page.getViewport({scale}),cv=document.createElement('canvas');cv.width=Math.max(1,Math.round(vp.width));cv.height=Math.max(1,Math.round(vp.height));const cx=cv.getContext('2d');
 await page.render({canvasContext:cx,viewport:vp}).promise;
 if(gray){const im=cx.getImageData(0,0,cv.width,cv.height),d=im.data;for(let j=0;j<d.length;j+=4){const y=.299*d[j]+.587*d[j+1]+.114*d[j+2];d[j]=d[j+1]=d[j+2]=y}cx.putImageData(im,0,0)}
 const blob=await new Promise((res,rej)=>cv.toBlob(b=>b?res(b):rej(new Error('Aperçu JPEG impossible')),'image/jpeg',q));
 return{page,canvas:cv,blob};
}
optimize=async function(){
 assertUnsignedEditable('optimiser le document');if(!S.pdfjs||!S.pdfBytes)throw new Error('Aucun document');
 const dpi=+(E.form.querySelector('[name=dpi]')?.value||120),q=+(E.form.querySelector('[name=jpegQuality]')?.value||.75),gray=!!E.form.querySelector('[name=grayscale]')?.checked,targets=targetPages0919(),set=new Set(targets);
 const src=await PDFLib.PDFDocument.load(S.pdfBytes.slice(0)),out=await PDFLib.PDFDocument.create(),n=S.pdfjs.numPages;
 for(let i=1;i<=n;i++){
  if(set.has(i)){
   st('Optimisation page '+i+'/'+n+'...');const r=await renderOptimizedPage0919(i,dpi,q,gray),ab=await r.blob.arrayBuffer(),jpg=await out.embedJpg(ab),base=r.page.getViewport({scale:1}),p=out.addPage([base.width,base.height]);p.drawImage(jpg,{x:0,y:0,width:base.width,height:base.height});
  }else{
   const [p]=await out.copyPages(src,[i-1]);out.addPage(p);
  }
 }
 const b=await out.save();markOperation('optimize',{dpi,jpeg:q,gray,pages:targets});if($p('operationFolderName')?.value==='TRAITEMENT')$p('operationFolderName').value='OPTIMISATION';updatePath();await loadBytes(b,false);
 st('Optimisation appliquée à '+targets.length+' page(s) : '+dpi+' DPI · JPEG '+Math.round(q*100)+' %'+(gray?' · gris':'')+'.');
};

let previewUrl0919='';
async function previewOptimization0919(){
 if(!S.pdfjs)throw new Error('Aucun document');const dpi=+(E.form.querySelector('[name=dpi]')?.value||120),q=+(E.form.querySelector('[name=jpegQuality]')?.value||.75),gray=!!E.form.querySelector('[name=grayscale]')?.checked,pg=targetPages0919()[0]||S.page;
 st('Prévisualisation optimisation…');const r=await renderOptimizedPage0919(pg,dpi,q,gray);if(previewUrl0919)URL.revokeObjectURL(previewUrl0919);previewUrl0919=URL.createObjectURL(r.blob);
 const img=$p('optimizationPreviewImg0919'),meta=$p('optimizationPreviewMeta0919');if(img)img.src=previewUrl0919;if(meta)meta.textContent='Page '+pg+' · '+dpi+' DPI · '+Math.round(q*100)+' % · '+r.canvas.width+'×'+r.canvas.height+' px · JPEG aperçu '+fileSize(r.blob.size);
 st('Aperçu actualisé sans modifier le PDF.');
}
function dpiLabel0919(v){v=+v;if(v<=75)return'Très compressé / écran';if(v<=96)return'Écran / léger';if(v<=120)return'Compact';if(v<=150)return'Lecture / impression';if(v<=200)return'Bonne qualité';if(v<=240)return'Détaillé';return'Très détaillé / lourd'}
function jpegLabel0919(v){v=+v;if(v<=.45)return'Très compressé';if(v<=.6)return'Compact';if(v<=.75)return'Standard';if(v<=.85)return'Bonne qualité';if(v<=.92)return'Haute qualité';return'Quasi maximal'}
function syncOptLabels0919(){const d=E.form.querySelector('[name=dpi]'),q=E.form.querySelector('[name=jpegQuality]');if($p('dpiLabel0919'))$p('dpiLabel0919').textContent=dpiLabel0919(d?.value);if($p('jpegLabel0919'))$p('jpegLabel0919').textContent=jpegLabel0919(q?.value)}
function ensureOptimizationUi0919(){
 const dpi=E.form?.querySelector('[name=dpi]');if(!dpi||$p('optimizationProfiles0919'))return;const sec=dpi.closest('details.toolSection')?.querySelector('.sectionBody');if(!sec)return;
 dpi.min='60';dpi.max='300';dpi.step='1';const dn=sec.querySelector('[data-number-pair=dpi]');if(dn){dn.min='60';dn.max='300';dn.step='1'}
 const q=E.form.querySelector('[name=jpegQuality]');if(q)q.step='.01';const qn=sec.querySelector('[data-number-pair=jpegQuality]');if(qn)qn.step='.01';
 const box=document.createElement('div');box.id='optimizationProfiles0919';box.className='optimizationProfiles0919';
 box.innerHTML='<div class="qualityLine0919"><b>DPI :</b><span id="dpiLabel0919"></span><div class="qualityChips0919">'+[75,96,120,150,200,240,300].map(v=>'<button type="button" data-dpi0919="'+v+'">'+v+'</button>').join('')+'</div></div>'+
 '<div class="qualityLine0919"><b>JPEG :</b><span id="jpegLabel0919"></span><div class="qualityChips0919">'+[40,55,70,80,90,95].map(v=>'<button type="button" data-jpeg0919="'+v+'">'+v+'%</button>').join('')+'</div></div>'+
 '<div class="row"><button id="optimizationPreview0919" type="button">👁 Preview / actualiser</button><span class="hint">L’aperçu n’altère pas le document.</span></div><div class="optimizationPreview0919"><img id="optimizationPreviewImg0919" alt="Aperçu optimisation"><div id="optimizationPreviewMeta0919" class="miniStatus">Aucun aperçu calculé.</div></div>';
 sec.appendChild(box);
 box.querySelectorAll('[data-dpi0919]').forEach(b=>b.onclick=()=>{dpi.value=b.dataset.dpi0919;dpi.dispatchEvent(new Event('input',{bubbles:true}));if(dn){dn.value=dpi.value}syncOptLabels0919()});
 box.querySelectorAll('[data-jpeg0919]').forEach(b=>b.onclick=()=>{q.value=(+b.dataset.jpeg0919/100).toFixed(2);q.dispatchEvent(new Event('input',{bubbles:true}));if(qn){qn.value=q.value}syncOptLabels0919()});
 $p('optimizationPreview0919').onclick=()=>run(previewOptimization0919,$p('optimizationPreview0919'));
 [dpi,q].forEach(x=>x?.addEventListener('input',syncOptLabels0919));syncOptLabels0919();
}

function style0919(){
 if($p('pageScopeStyle0919'))return;const st=document.createElement('style');st.id='pageScopeStyle0919';st.textContent='.pageScopeBar0919{display:flex;align-items:center;gap:6px;flex-wrap:wrap;padding:7px 8px;margin:5px 0;background:#f6f9fb;border:1px solid #d6e0e7;border-radius:8px;font-size:10px}.pageScopeBar0919 select,.pageScopeBar0919 button{height:30px}.pageScopeBar0919 small{color:#647482}.pageThumb.multiSelected0919{box-shadow:0 0 0 3px #1d7bb7 inset;background:#eaf5fc}.qualityLine0919{margin:8px 0}.qualityLine0919>b{display:inline-block;min-width:46px}.qualityLine0919>span{font-size:10px;color:#526675}.qualityChips0919{display:flex;gap:4px;flex-wrap:wrap;margin-top:5px}.qualityChips0919 button{padding:4px 7px;font-size:10px}.optimizationPreview0919{margin-top:7px;border:1px solid #d7e1e8;border-radius:8px;background:#fff;padding:7px}.optimizationPreview0919 img{display:block;max-width:100%;max-height:360px;margin:auto;background:#eee}';document.head.appendChild(st)
}
function install0919(){style0919();ensureScopeUi0919();decorateThumbs0919();ensureOptimizationUi0919();renderScope0919()}
const mo=new MutationObserver(()=>setTimeout(install0919,0));if(document.body)mo.observe(document.body,{childList:true,subtree:true});
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(install0919,600),{once:true});else setTimeout(install0919,600);
})();