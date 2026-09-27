(()=>{'use strict';
if(window.__NLAB_0921_PAGE_SCOPE__)return;
window.__NLAB_0921_PAGE_SCOPE__=true;
const $p=id=>document.getElementById(id);
const Scope0921=window.NLAB_SELECTION_SCOPE;
if(!Scope0921)throw new Error('Brique commune NLAB_SELECTION_SCOPE non chargée');
S.selectionScope0921=S.selectionScope0921||Scope0921.create([]);
S.pageScope0921=S.pageScope0921||'current';

function pageCount0921(){return S.pdfjs?.numPages||0}
function syncItems0921(){Scope0921.setItems(S.selectionScope0921,Array.from({length:pageCount0921()},(_,i)=>i+1));return S.selectionScope0921}
function selectedPages0921(){syncItems0921();return Scope0921.resolve(S.selectionScope0921,'selected',S.page||1)}
function targetPages0921(scope=S.pageScope0921){syncItems0921();const resolved=Scope0921.resolve(S.selectionScope0921,scope,S.page||1);return(scope==='selected'&&!resolved.length)?[S.page||1]:resolved}
window.NLAB_PAGE_SCOPE_0921={selected:selectedPages0921,target:targetPages0921,setScope:s=>{S.pageScope0921=s;renderScope0921()},selectAll:()=>{syncItems0921();Scope0921.all(S.selectionScope0921);renderPageStrip();renderScope0921()},clear:()=>{Scope0921.clear(S.selectionScope0921);renderPageStrip();renderScope0921()},shared:Scope0921};

function selectClick0921(page,e){
 syncItems0921();Scope0921.click(S.selectionScope0921,page,e);S.page=page;render();renderScope0921();
}
function decorateThumbs0921(){
 const thumbs=[...document.querySelectorAll('#pageStrip .pageThumb')],n=pageCount0921();
 for(let i=0;i<thumbs.length;i++){
  const t=thumbs[i],page=i+1;t.dataset.page=String(page);t.classList.toggle('multiSelected0921',S.selectionScope0921.selected.has(page));
  t.title=(S.pageLocks.has(page)?'Page verrouillée':'Page '+page)+' · clic = sélection unique · Ctrl/Cmd+clic = multi-sélection · Maj+clic = plage';
  t.onclick=e=>{if(e.target.closest('button'))return;selectClick0921(page,e)};
 }
 syncItems0921();
}
const renderPageStrip0921Base=renderPageStrip;
renderPageStrip=function(){renderPageStrip0921Base();decorateThumbs0921();renderScope0921()};

function ensureScopeUi0921(){
 if($p('pageScopeBar0921')||!E.pageStrip)return;
 const bar=document.createElement('div');bar.id='pageScopeBar0921';bar.className='pageScopeBar0921';
 bar.innerHTML='<b>Portée commune</b><select id="pageScope0921"><option value="current">Page courante</option><option value="selected">Page(s) sélectionnée(s)</option><option value="all">Tout le document</option></select><button id="pageSelectAll0921" type="button">Tout sélectionner</button><button id="pageClear0921" type="button">Effacer sélection</button><span id="pageSelectionInfo0921">0 sélectionnée</span><small>Rotation, tampon et optimisation utilisent cette même portée. Ctrl/Cmd + clic : ajouter/retirer · Maj + clic : plage.</small>';
 E.pageStrip.before(bar);
 $p('pageScope0921').value=S.pageScope0921;
 $p('pageScope0921').onchange=e=>{S.pageScope0921=e.target.value;renderScope0921()};
 $p('pageSelectAll0921').onclick=()=>{syncItems0921();Scope0921.all(S.selectionScope0921);renderPageStrip()};
 $p('pageClear0921').onclick=()=>{Scope0921.clear(S.selectionScope0921);renderPageStrip()};
}
function renderScope0921(){
 const x=$p('pageScope0921');if(x)x.value=S.pageScope0921;
 const sel=selectedPages0921(),info=$p('pageSelectionInfo0921');if(info)info.textContent=sel.length?sel.length+' page(s) : '+sel.join(', '):'Aucune page sélectionnée';
 document.querySelectorAll('#pageStrip .pageThumb').forEach((t,i)=>t.classList.toggle('multiSelected0921',S.selectionScope0921.selected.has(i+1)));
}

rotatePage=async function(delta){
 assertUnsignedEditable('tourner les pages');if(!S.pdfBytes)throw new Error('Aucun document');
 const targets=targetPages0921();if(!targets.length)return;const keep=S.page,doc=await PDFLib.PDFDocument.load(S.pdfBytes.slice(0)),pages=doc.getPages();
 for(const pg of targets){const p=pages[pg-1],r=p.getRotation().angle;p.setRotation(PDFLib.degrees((r+delta+360)%360))}
 const b=await doc.save();await loadBytes(b,false);S.page=Math.min(keep,S.pdfjs?.numPages||1);await render();
 markOperation('rotate',{pages:targets,delta});recordDocumentAction('Rotation pages',targets.join(', ')+' · '+(delta>0?'droite':'gauche')+' 90°');
 st(targets.length+' page(s) tournée(s) de 90° vers '+(delta>0?'la droite':'la gauche')+'.');
};

const newStamp0921Base=newStampAnn;
newStampAnn=function(x=60,top=70){
 const targets=targetPages0921();
 if(targets.length<=1)return newStamp0921Base(x,top);
 const keep=S.page;S.page=targets[0];newStamp0921Base(x,top);const first=S.selectedAnn;
 if(!first||first.type!=='stamp'){S.page=keep;return}
 const created=[first];
 for(const pg of targets.slice(1)){const c={...first,id:crypto.randomUUID?crypto.randomUUID():String(Date.now()+Math.random()),page:pg};S.annotations.push(c);created.push(c)}
 S.page=keep;S.selectedAnn=created.find(a=>a.page===keep)||first;renderAnns();updatePath();commitAnnotationHistory('Tampon multi-pages '+targets.join(', '));
 st('Tampon « '+(first.stampLabel||'')+' » ajouté sur '+targets.length+' page(s).');
};

async function renderOptimizedPage0921(pg,dpi,q,gray){
 const page=await S.pdfjs.getPage(pg),scale=dpi/72,vp=page.getViewport({scale}),cv=document.createElement('canvas');cv.width=Math.max(1,Math.round(vp.width));cv.height=Math.max(1,Math.round(vp.height));const cx=cv.getContext('2d');
 await page.render({canvasContext:cx,viewport:vp}).promise;
 if(gray){const im=cx.getImageData(0,0,cv.width,cv.height),d=im.data;for(let j=0;j<d.length;j+=4){const y=.299*d[j]+.587*d[j+1]+.114*d[j+2];d[j]=d[j+1]=d[j+2]=y}cx.putImageData(im,0,0)}
 const blob=await new Promise((res,rej)=>cv.toBlob(b=>b?res(b):rej(new Error('Aperçu JPEG impossible')),'image/jpeg',q));
 return{page,canvas:cv,blob};
}
optimize=async function(){
 assertUnsignedEditable('optimiser le document');if(!S.pdfjs||!S.pdfBytes)throw new Error('Aucun document');
 const dpi=+(E.form.querySelector('[name=dpi]')?.value||120),q=+(E.form.querySelector('[name=jpegQuality]')?.value||.75),gray=!!E.form.querySelector('[name=grayscale]')?.checked,targets=targetPages0921(),set=new Set(targets);
 const src=await PDFLib.PDFDocument.load(S.pdfBytes.slice(0)),out=await PDFLib.PDFDocument.create(),n=S.pdfjs.numPages;
 for(let i=1;i<=n;i++){
  if(set.has(i)){
   st('Optimisation page '+i+'/'+n+'...');const r=await renderOptimizedPage0921(i,dpi,q,gray),ab=await r.blob.arrayBuffer(),jpg=await out.embedJpg(ab),base=r.page.getViewport({scale:1}),p=out.addPage([base.width,base.height]);p.drawImage(jpg,{x:0,y:0,width:base.width,height:base.height});
  }else{
   const [p]=await out.copyPages(src,[i-1]);out.addPage(p);
  }
 }
 const b=await out.save();markOperation('optimize',{dpi,jpeg:q,gray,pages:targets});if($p('operationFolderName')?.value==='TRAITEMENT')$p('operationFolderName').value='OPTIMISATION';updatePath();await loadBytes(b,false);
 st('Optimisation appliquée à '+targets.length+' page(s) : '+dpi+' DPI · JPEG '+Math.round(q*100)+' %'+(gray?' · gris':'')+'.');
};

let previewUrl0921='';
async function previewOptimization0921(){
 if(!S.pdfjs)throw new Error('Aucun document');const dpi=+(E.form.querySelector('[name=dpi]')?.value||120),q=+(E.form.querySelector('[name=jpegQuality]')?.value||.75),gray=!!E.form.querySelector('[name=grayscale]')?.checked,pg=targetPages0921()[0]||S.page;
 st('Prévisualisation optimisation…');const r=await renderOptimizedPage0921(pg,dpi,q,gray);if(previewUrl0921)URL.revokeObjectURL(previewUrl0921);previewUrl0921=URL.createObjectURL(r.blob);
 const img=$p('optimizationPreviewImg0921'),meta=$p('optimizationPreviewMeta0921');if(img)img.src=previewUrl0921;if(meta)meta.textContent='Page '+pg+' · '+dpi+' DPI · '+Math.round(q*100)+' % · '+r.canvas.width+'×'+r.canvas.height+' px · JPEG aperçu '+fileSize(r.blob.size);
 st('Aperçu actualisé sans modifier le PDF.');
}
function dpiLabel0921(v){v=+v;if(v<=75)return'Très compressé / écran';if(v<=96)return'Écran / léger';if(v<=120)return'Compact';if(v<=150)return'Lecture / impression';if(v<=200)return'Bonne qualité';if(v<=240)return'Détaillé';return'Très détaillé / lourd'}
function jpegLabel0921(v){v=+v;if(v<=.45)return'Très compressé';if(v<=.6)return'Compact';if(v<=.75)return'Standard';if(v<=.85)return'Bonne qualité';if(v<=.92)return'Haute qualité';return'Quasi maximal'}
function syncOptLabels0921(){const d=E.form.querySelector('[name=dpi]'),q=E.form.querySelector('[name=jpegQuality]');if($p('dpiLabel0921'))$p('dpiLabel0921').textContent=dpiLabel0921(d?.value);if($p('jpegLabel0921'))$p('jpegLabel0921').textContent=jpegLabel0921(q?.value)}
function ensureOptimizationUi0921(){
 const dpi=E.form?.querySelector('[name=dpi]');if(!dpi||$p('optimizationProfiles0921'))return;const sec=dpi.closest('details.toolSection')?.querySelector('.sectionBody');if(!sec)return;
 dpi.min='60';dpi.max='300';dpi.step='1';const dn=sec.querySelector('[data-number-pair=dpi]');if(dn){dn.min='60';dn.max='300';dn.step='1'}
 const q=E.form.querySelector('[name=jpegQuality]');if(q)q.step='.01';const qn=sec.querySelector('[data-number-pair=jpegQuality]');if(qn)qn.step='.01';
 const box=document.createElement('div');box.id='optimizationProfiles0921';box.className='optimizationProfiles0921';
 box.innerHTML='<div class="qualityLine0921"><b>DPI :</b><span id="dpiLabel0921"></span><div class="qualityChips0921">'+[75,96,120,150,200,240,300].map(v=>'<button type="button" data-dpi0921="'+v+'">'+v+'</button>').join('')+'</div></div>'+
 '<div class="qualityLine0921"><b>JPEG :</b><span id="jpegLabel0921"></span><div class="qualityChips0921">'+[40,55,70,80,90,95].map(v=>'<button type="button" data-jpeg0921="'+v+'">'+v+'%</button>').join('')+'</div></div>'+
 '<div class="row"><button id="optimizationPreview0921" type="button">👁 Preview / actualiser</button><span class="hint">L’aperçu n’altère pas le document.</span></div><div class="optimizationPreview0921"><img id="optimizationPreviewImg0921" alt="Aperçu optimisation"><div id="optimizationPreviewMeta0921" class="miniStatus">Aucun aperçu calculé.</div></div>';
 sec.appendChild(box);
 box.querySelectorAll('[data-dpi0921]').forEach(b=>b.onclick=()=>{dpi.value=b.dataset.dpi0921;dpi.dispatchEvent(new Event('input',{bubbles:true}));if(dn){dn.value=dpi.value}syncOptLabels0921()});
 box.querySelectorAll('[data-jpeg0921]').forEach(b=>b.onclick=()=>{q.value=(+b.dataset.jpeg0921/100).toFixed(2);q.dispatchEvent(new Event('input',{bubbles:true}));if(qn){qn.value=q.value}syncOptLabels0921()});
 $p('optimizationPreview0921').onclick=()=>run(previewOptimization0921,$p('optimizationPreview0921'));
 [dpi,q].forEach(x=>x?.addEventListener('input',syncOptLabels0921));syncOptLabels0921();
}

function style0921(){
 if($p('pageScopeStyle0921'))return;const st=document.createElement('style');st.id='pageScopeStyle0921';st.textContent='.pageScopeBar0921{display:flex;align-items:center;gap:6px;flex-wrap:wrap;padding:7px 8px;margin:5px 0;background:#f6f9fb;border:1px solid #d6e0e7;border-radius:8px;font-size:10px}.pageScopeBar0921 select,.pageScopeBar0921 button{height:30px}.pageScopeBar0921 small{color:#647482}.pageThumb.multiSelected0921{box-shadow:0 0 0 3px #1d7bb7 inset;background:#eaf5fc}.qualityLine0921{margin:8px 0}.qualityLine0921>b{display:inline-block;min-width:46px}.qualityLine0921>span{font-size:10px;color:#526675}.qualityChips0921{display:flex;gap:4px;flex-wrap:wrap;margin-top:5px}.qualityChips0921 button{padding:4px 7px;font-size:10px}.optimizationPreview0921{margin-top:7px;border:1px solid #d7e1e8;border-radius:8px;background:#fff;padding:7px}.optimizationPreview0921 img{display:block;max-width:100%;max-height:360px;margin:auto;background:#eee}';document.head.appendChild(st)
}
function install0921(){style0921();ensureScopeUi0921();decorateThumbs0921();ensureOptimizationUi0921();renderScope0921()}
const mo=new MutationObserver(()=>setTimeout(install0921,0));if(document.body)mo.observe(document.body,{childList:true,subtree:true});
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(install0921,600),{once:true});else setTimeout(install0921,600);
})();