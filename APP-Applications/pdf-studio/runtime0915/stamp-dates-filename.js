(()=>{'use strict';
if(window.__NLAB_0915_STAMP_DATES__)return;
window.__NLAB_0915_STAMP_DATES__=true;
const VERSION0915='Alpha 0.9.15 TEST';
const $15=id=>document.getElementById(id);
const esc15=s=>String(s??'').replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':'&quot;',"'":'&#39;'}[m]));

// --- Tampons : Date du tampon + Date A/B/C/D ---------------------------------
const formatStore0915Base=formatStore0914;
formatStore0914=function(){
  const d=formatStore0915Base();
  return{...d,D:d.D||'DD/MM/YYYY'};
};
const dates0915Base=stampDatesAll0914;
stampDatesAll0914=function(){
  const d=dates0915Base();
  return{...d,d:$15('stampDateD0915')?.value||today()};
};
stampDates0911=function(){
  const d=stampDatesAll0914();
  return{a:d.a,b:d.b,c:d.c,d:d.d,stamp:d.stamp};
};
stampContext=function(dateValue){
  const ds=stampDatesAll0914();
  if(dateValue)ds.stamp=dateValue;
  const n=split(current()?.name||'document.pdf');
  return{
    ...dc(ds.stamp),
    ...datePack(ds.a,'A'),
    ...datePack(ds.b,'B'),
    ...datePack(ds.c,'C'),
    ...datePack(ds.d,'D'),
    STAMP_DATE:dc(ds.stamp).DATE,
    STAMP_DATE_COMPACT:dc(ds.stamp).DATE_COMPACT,
    FILENAME:safe(n.stem),STEM:safe(n.stem),
    ...cf(),...operationContext()
  };
};
resolveStampTemplate=function(tpl,dateValue){
  const ds=stampDatesAll0914();
  if(dateValue)ds.stamp=dateValue;
  const fm=formatStore0914();
  let str=String(tpl||'');
  const map={STAMP:ds.stamp,A:ds.a,B:ds.b,C:ds.c,D:ds.d};
  str=str.replace(/\{(STAMP_DATE|DATE_[ABCD])(?:\||:)([^}]+)\}/g,(_,key,pat)=>{
    const k=key==='STAMP_DATE'?'STAMP':key.slice(-1);
    return fmtDate0912(map[k],pat);
  });
  const c=stampContext(ds.stamp),extra={
    STAMP_DATE_FMT:fmtDate0912(ds.stamp,fm.STAMP),
    DATE_A_FMT:fmtDate0912(ds.a,fm.A),
    DATE_B_FMT:fmtDate0912(ds.b,fm.B),
    DATE_C_FMT:fmtDate0912(ds.c,fm.C),
    DATE_D_FMT:fmtDate0912(ds.d,fm.D)
  };
  return str.replace(/\{([A-Z0-9_]+)\}/g,(_,k)=>extra[k]??c[k]??`{${k}}`);
};

function stampDefinition0915(){
  try{return typeof stampDefinition==='function'?stampDefinition():null}catch{return null}
}
function activeRenameTemplates0915(){
  const def=stampDefinition0915();
  const prefix=$15('stampSavePrefix0915')?.value||((def?.prefixEnabled===false)?'':(def?.prefix||''));
  const suffix=$15('stampSaveSuffix0915')?.value||((def?.suffixEnabled===false)?'':(def?.suffix||''));
  return{prefix,suffix};
}
function applyStampSaveRules0915(a){
  if(!a||a.type!=='stamp')return;
  const ds=stampDatesAll0914();
  a.stampDate=ds.stamp;
  a.stampDateA=ds.a;
  a.stampDateB=ds.b;
  a.stampDateC=ds.c;
  a.stampDateD=ds.d;
  a.dateFormats=formatStore0914();
  a.renameFile=$15('stampRenameFile0915')?.checked!==false;
  if(!a.renameFile){a.filePrefix='';a.fileSuffix='';return}
  const t=activeRenameTemplates0915();
  a.filePrefix=t.prefix?resolveStampTemplate(t.prefix,ds.stamp):'';
  a.fileSuffix=t.suffix?resolveStampTemplate(t.suffix,ds.stamp):'';
}
function previewName0915(){
  let name=outName();
  if($15('stampRenameFile0915')?.checked===false)return name;
  const t=activeRenameTemplates0915(),ds=stampDatesAll0914();
  const p=t.prefix?safe(resolveStampTemplate(t.prefix,ds.stamp)):'';
  const s=t.suffix?safe(resolveStampTemplate(t.suffix,ds.stamp)):'';
  if(p&&!name.startsWith(p))name=p+name;
  if(s&&!name.toUpperCase().includes(s.toUpperCase()))name=name.replace(/\.pdf$/i,'')+s+'.pdf';
  return name;
}
function renderName0915(){
  const b=$15('stampFilenamePreview0915');
  if(b)b.textContent=previewName0915();
}
function insertStampVar0915(token,targetId='stampSavePrefix0915'){
  const el=$15(targetId)||$15('stampSaveSuffix0915')||$15('stampBuildTemplate');
  if(!el)return;
  const s=el.selectionStart??el.value.length,e=el.selectionEnd??el.value.length;
  el.setRangeText(token,s,e,'end');
  el.dispatchEvent(new Event('input',{bubbles:true}));
  el.focus();
}
function enhanceStamp0915(){
  const main=E.form?.querySelector('[name=stampDate]');
  if(!main)return;
  const grid=E.form.querySelector('.stampDateGrid');
  if(grid&&!$15('stampDateD0915')){
    const lab=document.createElement('label');
    lab.innerHTML='Date D<input id="stampDateD0915" type="date" value="'+today()+'">';
    grid.appendChild(lab);
  }
  const help=$15('stampDatesHelp0914');
  if(help)help.innerHTML='<b>5 dates indépendantes :</b> date du tampon + Date A + Date B + Date C + Date D. Variables : <code>{STAMP_DATE}</code>, <code>{DATE_A}</code>, <code>{DATE_B}</code>, <code>{DATE_C}</code>, <code>{DATE_D}</code> et versions <code>_FMT</code>. Chaque date reste modifiable avant régénération du tampon.';
  const fmt=E.form.querySelector('.stampFormatGrid');
  if(fmt&&!$15('stampFormatD0915')){
    const lab=document.createElement('label');
    lab.innerHTML='Format Date D<input id="stampFormatD0915" value="'+esc15(formatStore0914().D)+'">';
    fmt.appendChild(lab);
    $15('stampFormatD0915').addEventListener('input',e=>{saveStampFmt0914('D',e.target.value);updateStampPreview();renderName0915()});
  }
  const oldVars=$15('stampFileRules0914')?.querySelector('.stampVars0914');
  if(oldVars&&![...oldVars.querySelectorAll('[data-v]')].some(b=>b.dataset.v==='{DATE_D_FMT}')){
    const b=document.createElement('button');b.type='button';b.dataset.v='{DATE_D_FMT}';b.textContent='{DATE_D_FMT}';oldVars.appendChild(b);
    b.onclick=()=>{const ta=$15('stampBuildTemplate');if(ta){ta.setRangeText(b.dataset.v,ta.selectionStart,ta.selectionEnd,'end');ta.focus()}};
  }
  const anchor=$15('stampFileRules0914')||$15('stampBuilder0912')||grid;
  if(anchor&&!$15('stampSaveRules0915')){
    const box=document.createElement('div');
    box.id='stampSaveRules0915';box.className='outputGuide0914';
    box.innerHTML=`<b>Nom du fichier lié à ce tampon</b>
      <label class="checkline"><input id="stampRenameFile0915" type="checkbox" checked> Appliquer le préfixe / suffixe lors de l’enregistrement</label>
      <div class="stampFileRules0914">
        <label>Préfixe fichier<input id="stampSavePrefix0915" placeholder="ex. VALIDE_{STAMP_DATE:YYYYMMDD}_"></label>
        <label>Suffixe fichier<input id="stampSaveSuffix0915" placeholder="ex. _A_REEVALUER_{DATE_D:YYYYMMDD}"></label>
      </div>
      <div class="stampVars0914">
        <button type="button" data-v="{INITIALS}">{INITIALS}</button>
        <button type="button" data-v="{STAMP_DATE_FMT}">{STAMP_DATE_FMT}</button>
        <button type="buttton" data-v="{DATE_A_FMT}">{DATE_A_FMT}</button>
        <button type="buttton" data-v="{DATE_B_FMT}">{DATE_B_FMT}</button>
        <button type="buttton" data-v="{DATE_C_FMT}">{DATE_C_FMT}</button>
        <button type="buttton" data-v="{DATE_D_FMT}">{DATE_D_FMT}</button>
        <button type="buttton" data-v="{FILENAME}">{FILENAME}</button>
      </div>
      <div class="row"><button id="stampApplyDates0915" type="button">Appliquer / régénérer le tampon sélectionné</button></div>
      <div class="richHint0914"><b>Cas d☙usage :</b> <code>VALIDÉ HE D{STAMP_DATE_FMT}</code> · <code>VALABLE DU {DATE_B_FMT} AU {DATE_C_FMT}</code> · <code>À RÉÉVALUER LE {DATE_D_FMT}</code>.<br><b>Nom final prévu :</b> <code id="stampFilenamePreview0915">—</code></div>`;
    anchor.after(box);
    box.querySelectorAll('[data-v]').forEach(b=>b.addEventListener('click',()=>insertStampVar0915(b.dataset.v,document.activeElement?.id==='stampSaveSuffix0915'?'stampSaveSuffix0915':'stampSavePrefix0915')));
    ['stampRenameFile0915','stampSavePrefix0915','stampSaveSuffix0915'].forEach(id=>$15(id)?.addEventListener('input',renderName0915));
    $15('stampApplyDates0915').onclick=()=>{if(S.selectedAnn?.type!=='stamp')return toast('Sélectionnez d’abord un tampon');regenerateSelectedStamp()};
  }
  for(const id of ['stampDateD0915','stampDateA0914'])$15(id)?.addEventListener('change',()=>{updateStampPreview();renderName0915()},{once:true});
  E.form.querySelector('[name=stampDateB]')?.addEventListener('change',renderName0915,{once:true});
  E.form.querySelector('[name=stampDateC]')?.addEventListener('change',renderName0915,{once:true});
  main.addEventListener('change',renderName0915,{once:true});
  renderName0915();
}

// A newly placed stamp captures the five dates and the optional filename rule.
const newStamp0915Base=newStampAnn;
newStampAnn=function(x=60,top=70){
  newStamp0915Base(x,top);
  const a=S.selectedAnn;
  if(a?.type==='stamp'){
    applyStampSaveRules0915(a);
    renderAnns();updatePath();renderName0915();
  }
};

// Regenerating a stamp updates all five dates and recomputes its filename affixes.
const regenStamp0915Base=regenerateSelectedStamp;
regenerateSelectedStamp=function(){
  regenStamp0915Base();
  const a=S.selectedAnn;
  if(a?.type==='stamp'){
    applyStampSaveRules0915(a);
    renderAnns();updatePath();renderName0915();
    commitAnnotationHistory(`Dates / nom fichier tampon ${a.stampLabel||''}`);
  }
};

// Keep the contextual form enhanced when the selected tool changes.
function install0915(){
  enhanceStamp0915();
  document.querySelectorAll('.buildBadge strong').forEach(x=>x.textContent=VERSION0915);
  const foot=document.querySelector('footer .footerInfo span');
  if(foot)foot.textContent=(foot.textContent||'').replace(/Alpha 0\.9\.14(?: TEST| RC2)?/g,VERSION0915);
}
const mo0915=new MutationObserver(()=>setTimeout(install0915,0));
if(E.form)mo0915.observe(E.form,{childList:true,subtree:true});
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(install0915,220),{once:true});else setTimeout(install0915,220);
})();
