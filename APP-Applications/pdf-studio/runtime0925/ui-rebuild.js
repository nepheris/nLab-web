(()=>{'use strict';
if(window.__NLAB_0925_UI__)return;
window.__NLAB_0925_UI__=true;
const $25=id=>document.getElementById(id);
const qa25=(s,r=document)=>Array.from(r.querySelectorAll(s));
const DATE25=[
 {key:'STAMP_DATE',label:'Date du tampon',source:'stampHubDateSTAMP0916'},
 {key:'DATE_A',label:'Date A',source:'stampHubDateA0916'},
 {key:'DATE_B',label:'Date B',source:'stampHubDateB0916'},
 {key:'DATE_C',label:'Date C',source:'stampHubDateC0916'},
 {key:'DATE_D',label:'Date D',source:'stampHubDateD0916'}
];
const today25=()=>typeof today==='function'?today():new Date().toISOString().slice(0,10);

function addStyle25(){
 if($25('style0925'))return;
 const s=document.createElement('style');s.id='style0925';s.textContent=
 ':root{--nlab-bg:#F7F8FA;--nlab-surface:#FFFFFF;--nlab-surface-hover:#F1F3F5;--nlab-ink:#17202A;--nlab-muted:#667085;--nlab-line:#D8DEE6;--nlab-brand:#0057B8;--nlab-brand-soft:#EAF2F8;--nlab-accent:#247B78;--nlab-success:#2E7D5B;--nlab-warning:#B8682C;--nlab-danger:#A1453F;--nlab-radius-sm:6px;--nlab-radius-md:10px;--nlab-radius-lg:18px;--nlab-shadow-soft:0 8px 28px rgba(16,24,40,.07)}'+
 'body{background:var(--nlab-bg)!important;color:var(--nlab-ink)!important}header{border-bottom:1px solid var(--nlab-line)!important;background:var(--nlab-surface)!important}.brandIcon{border-color:var(--nlab-line)!important;background:var(--nlab-brand-soft)!important;color:var(--nlab-brand)!important}.toolSection{border-color:var(--nlab-line)!important;border-radius:var(--nlab-radius-md)!important}.toolSection>summary{background:#F8FAFC!important}.toolSection[open]>summary{color:#174F78!important}button.primary,.pickerButton.active{background:var(--nlab-brand)!important;color:#fff!important;border-color:var(--nlab-brand)!important}'+
 '.siteNav0925{display:flex;align-items:center;gap:6px;flex-wrap:wrap;margin-right:8px}.siteNav0925 a,.siteNav0925 button{display:inline-flex;align-items:center;gap:5px;height:34px;padding:6px 9px;border:1px solid #B9C6D1;border-radius:8px;background:#fff;color:#405160;text-decoration:none;font:700 11px Arial,sans-serif}.siteNav0925 a:hover,.siteNav0925 button:hover{background:var(--nlab-brand-soft);border-color:#82ACCD;color:#174F78}.siteNav0925 img{width:55px;height:auto}'+
 '#sidebarCycle,#sidebarExpand,#sidebarModeHint{display:inline-flex!important}.sidebarResizer{display:block!important;width:14px!important;right:-7px!important;cursor:col-resize!important;z-index:80!important}.sidebarResizer:after{width:3px!important;left:5px!important;background:#9FB3C4!important}.sidebarResizer:hover:after,.sidebarResizer.dragging:after{width:5px!important;background:var(--nlab-brand)!important}.layout.sidebarHidden{grid-template-columns:0 minmax(0,1fr)!important;gap:0!important}.layout.sidebarHidden>.sidebarPanel{display:none!important}.documentZone{width:100%;min-width:0}'+
 '.sidebarDirectControls0925{display:grid;grid-template-columns:1fr 1fr 1fr;gap:4px;margin:0 0 8px}.sidebarDirectControls0925 button{font-size:10px;padding:6px}.configSection0925>summary{background:#EEF6FC!important}.configBlock0925{border:1px solid #DCE8E4;border-radius:8px;padding:8px;margin:7px 0;background:#FBFDFC}.configBlock0925 h4{margin:0 0 7px;color:#174F78}.quickDates0925{display:grid;gap:5px}.quickDateRow0925{display:grid;grid-template-columns:110px minmax(130px,1fr) 105px;gap:6px;align-items:center;font-size:10px}.quickDateRow0925 input{width:100%;padding:6px}.quickDateRow0925 code{font-size:9px;color:#174F78}.diag0925{font-size:10px;line-height:1.55}'+
 '.presetRow0925{display:grid!important;grid-template-columns:minmax(0,1fr) auto!important;gap:6px}.presetRow0925 button{min-width:78px}.demoFilesBox,.demoPreset{display:none!important}.manualHint0925{font-size:10px;color:#687786;margin-top:4px}'+
 '.outputActivate0925{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:6px;align-items:end}.outputState0925{margin-top:6px;padding:6px 8px;border-radius:7px;background:#F3F6F8;border:1px solid #D8E0E7;font-size:10px}.outputState0925.active{background:#EAF6EE;border-color:#A9D1B2;color:#215D2E}.outputModeCard.chosen0925{outline:3px solid #7CAED3!important;outline-offset:1px}'+
 '.pageScopeBar0925{display:flex;align-items:center;gap:6px;flex-wrap:wrap;margin:6px 0 8px;padding:8px;border:1px solid #9FC2DB;border-radius:9px;background:#F3F9FD;font-size:11px}.pageScopeBar0925 select{width:auto!important;min-width:165px}.pageScopeBar0925 .scopeCount0925{font-weight:800;color:#174F78}.pageThumb{position:relative!important}.pageCheck0925{position:absolute!important;top:5px!important;left:5px!important;z-index:20!important;width:19px!important;height:19px!important;accent-color:var(--nlab-brand);background:#fff;box-shadow:0 0 0 2px #fff;border-radius:3px}.pageThumb.selected0925{outline:3px solid var(--nlab-brand)!important;outline-offset:1px;background:#EAF2F8!important}'+
 '.namingSection0925>summary{background:#F5F2FF!important}.translationSection0925>summary{background:#EEF8F4!important}.rootBrand0925{font-weight:900;color:var(--nlab-brand)}'+
 '@media(max-width:850px){.siteNav0925{width:100%;order:10}.quickDateRow0925{grid-template-columns:1fr}.sidebarDirectControls0925{grid-template-columns:1fr 1fr}.outputActivate0925{grid-template-columns:1fr}}';
 document.head.appendChild(s);
}

function releaseMeta25(){
 const r=window.NLAB_PDF_RELEASE||{version:'0.9.25',label:'Alpha 0.9.25 TEST',date:'2026-09-27'};
 const label=r.label||('Alpha '+r.version+' TEST');
 const d=String(r.date||'').split('-'),fd=d.length===3?d[2]+'/'+d[1]+'/'+d[0]:String(r.date||'—');
 document.title='nLab PDF Studio — '+label;
 qa25('.buildBadge strong').forEach(x=>x.textContent=label);
 qa25('.demoChip').forEach(x=>x.textContent='APP07 · '+label+' · MAJ '+fd+' · Paris');
 const em=document.querySelector('#home .card[data-tool="pdf"] em');if(em)em.textContent=label+' · interface fonctionnelle multi-pages';
 const foot=document.querySelector('footer .footerInfo span');if(foot)foot.textContent='nLab PDF Studio · APP07 · '+label+' · dernière MAJ : '+fd+'.';
}

function ensureEntry25(){
 const b=document.querySelector('#home .card[data-tool="pdf"]');if(!b)return;
 if(b.dataset.nlab25Entry==='1')return;b.dataset.nlab25Entry='1';
 b.onclick=e=>{e.preventDefault();openTool('pdf');setTimeout(install25,0)};
}

function ensureSiteNav25(){
 if($25('siteNav0925'))return;
 const top=$25('workspace')?.querySelector('.topbar');if(!top)return;
 const nav=document.createElement('div');nav.id='siteNav0925';nav.className='siteNav0925';
 nav.innerHTML='<a href="../../" title="Racine publique nLab Web"><img src="../../assets/branding/nlab-wordmark.svg" alt="nLab"><span>nLab Web</span></a><a href="../studios/" title="Tous les nLab Studios">Studios</a><a href="./" title="Page produit PDF Studio">PDF Studio</a><button id="sidebarHide0925" type="button" title="Replier complètement le panneau gauche">⇤ Panneau</button><button id="sidebarShow0925" type="button" title="Déplier le panneau gauche">⇥ Panneau</button>';
 const h=top.querySelector('h2');top.insertBefore(nav,h||top.firstChild);
 $25('sidebarHide0925').onclick=()=>{try{applySidebar('hidden')}catch(e){}};
 $25('sidebarShow0925').onclick=()=>{try{applySidebar('full')}catch(e){}};
 const bh=$25('backHome');if(bh){bh.textContent='← Accueil PDF Studio';bh.title='Revenir à l’accueil du module PDF Studio'}
}

function sectionBySummary25(prefix){
 return qa25('#sidebarPanel>.toolSection').find(d=>(d.querySelector(':scope>summary')?.textContent||'').trim().startsWith(prefix))||null;
}
function ensureSidebarControls25(){
 const side=$25('sidebarPanel');if(!side)return;
 let c=$25('sidebarDirectControls0925');
 if(!c){c=document.createElement('div');c.id='sidebarDirectControls0925';c.className='sidebarDirectControls0925';c.innerHTML='<button id="sideNormal0925" type="button">↔ Normal</button><button id="sideCompact0925" type="button">▥ Compact</button><button id="sideHidden0925" type="button">⇤ Masquer</button><button id="sideNarrow0925" type="button">− Largeur</button><button id="sideWide0925" type="button">＋ Largeur</button><button id="sideReset0925" type="button">100 %</button>';side.prepend(c);
  $25('sideNormal0925').onclick=()=>applySidebar('full');
  $25('sideCompact0925').onclick=()=>applySidebar('compact');
  $25('sideHidden0925').onclick=()=>applySidebar('hidden');
  $25('sideNarrow0925').onclick=()=>applySidebar('full',Math.max(290,(uiPrefs().sidebarWidth||430)-60));
  $25('sideWide0925').onclick=()=>applySidebar('full',Math.min(650,(uiPrefs().sidebarWidth||430)+60));
  $25('sideReset0925').onclick=()=>applySidebar('full',430);
 }
}

function ensureConfig25(){
 const side=$25('sidebarPanel');if(!side)return;
 let sec=$25('configSection0925');
 if(!sec){sec=document.createElement('details');sec.id='configSection0925';sec.className='toolSection configSection0925';sec.open=true;sec.innerHTML='<summary data-short="0\\nConfig">0. Configuration, variables & espace personnel</summary><div class="sectionBody"><div id="configContent0925"></div></div>';const entry=sectionBySummary25('1.');side.insertBefore(sec,entry||side.firstChild)}
 const body=$25('configContent0925');if(!body)return;
 const entry=sectionBySummary25('1.');
 if(entry){
  const variable=entry.querySelector('.variableHelp');if(variable&&variable.parentElement!==body){const sum=variable.querySelector('summary');if(sum)sum.textContent='Variables nommées — rappel rapide';body.appendChild(variable)}
  const uc=entry.querySelector('.userConfigBox');if(uc&&uc.parentElement!==body)body.appendChild(uc);
 }
 const ws=$25('workspacePanel0918');if(ws&&ws.parentElement!==body)body.appendChild(ws);
 if(!$25('quickDates0925')){
  const d=document.createElement('div');d.id='quickDates0925';d.className='configBlock0925';d.innerHTML='<h4>📅 Dates des tampons · 5 dates visibles</h4><div class="manualHint0925">Ces valeurs alimentent les mêmes variables que les tampons : <code>{STAMP_DATE}</code>, <code>{DATE_A}</code> à <code>{DATE_D}</code>.</div><div class="quickDates0925"></div>';
  body.appendChild(d);const grid=d.querySelector('.quickDates0925');
  DATE25.forEach(def=>{const row=document.createElement('label');row.className='quickDateRow0925';row.innerHTML='<b>'+def.label+'</b><input type="date" id="quick_'+def.key+'_0925"><code>{'+def.key+'}</code>';grid.appendChild(row);const inp=row.querySelector('input');inp.value=$25(def.source)?.value||today25();inp.oninput=()=>{S.quickDates0925=S.quickDates0925||{};S.quickDates0925[def.key]=inp.value||today25();const src=$25(def.source);if(src){src.value=inp.value||today25();src.dispatchEvent(new Event('input',{bubbles:true}))}}});
 }
 if(!$25('diag0925')){const d=document.createElement('div');d.id='diag0925';d.className='configBlock0925 diag0925';body.appendChild(d)}
 syncDates25();updateDiag25();
}
function syncDates25(){
 DATE25.forEach(def=>{const q=$25('quick_'+def.key+'_0925'),src=$25(def.source);if(!q)return;const remembered=S.quickDates0925?.[def.key];if(src&&remembered&&src.value!==remembered){src.value=remembered;src.dispatchEvent(new Event('input',{bubbles:true}))}if(src&&document.activeElement!==q)q.value=src.value||remembered||today25()});
}
function updateDiag25(){
 const d=$25('diag0925');if(!d)return;
 const checks=[
  ['Sélection multi-pages',!!window.NLAB_PAGE_SCOPE_0921],
  ['5 dates',$25('quickDates0925')!=null],
  ['Workspace personnel',!!window.__NLAB_WORKSPACE_0918__],
  ['Google Drive',!!window.__NLAB_DRIVE_0918__],
  ['Traduction BRK104',!!window.NLAB_BRK104],
  ['Archives ZIP',!!window.NLAB_ARCHIVE_WORKSPACE]
 ];
 d.innerHTML='<b>Fonctions chargées</b><br>'+checks.map(x=>(x[1]?'✅ ':'⚠️ ')+x[0]).join('<br>');
}

function replacePresetButton25(oldId,newId,label,handler){
 const old=$25(oldId);if(old)old.remove();
 let b=$25(newId);if(b)return b;
 const sel=newId.includes('Destination')?$25('destinationPreset'):$25('sourcePreset');if(!sel)return null;
 const row=sel.parentElement;row.classList.add('presetRow0925');b=document.createElement('button');b.id=newId;b.type='button';b.textContent=label;row.appendChild(b);b.onclick=handler;return b;
}
async function loadSourcePreset25(){
 const s=$25('sourcePreset')?.value||'manual';
 if(s==='default'){if(S.lastSource)return run(reuseSource);toast('Aucun dossier d’entrée par défaut mémorisé.');return}
 return $25('pickSource')?.click();
}
async function loadDestinationPreset25(){
 const s=$25('destinationPreset')?.value||'manual';
 if(s==='default'){if(S.lastDest)return run(reuseDest);toast('Aucun dossier de sortie par défaut mémorisé.');return}
 return $25('pickDestination')?.click();
}
function ensurePresets25(){
 const s=$25('sourcePreset'),d=$25('destinationPreset');
 if(s){qa25('option[value="demo"]',s).forEach(x=>x.remove());if(!['manual','default'].includes(s.value))s.value='manual';if(!s.dataset.nlab25){s.value='manual';s.dataset.nlab25='1'};replacePresetButton25('loadDemoPreset','loadSourcePreset0925','Charger',loadSourcePreset25)}
 if(d){qa25('option[value="demo"]',d).forEach(x=>x.remove());if(!['manual','default'].includes(d.value))d.value='manual';if(!d.dataset.nlab25){d.value='manual';d.dataset.nlab25='1'};replacePresetButton25('loadDestinationPreset','loadDestinationPreset0925','Charger',loadDestinationPreset25)}
 document.querySelector('.demoFilesBox')?.remove();
 const sn=$25('sourceChoiceName'),sp=$25('sourceChoicePath'),ss=$25('sourceStatus');
 if(sn&&/demo-input-client|démo/i.test(sn.textContent||''))sn.textContent='Entrée active : choix manuel';
 if(sp&&/demo-input-client|démo/i.test(sp.textContent||''))sp.textContent='Adresse : à sélectionner';
 if(ss&&/démo/i.test(ss.textContent||''))ss.textContent='Choix manuel : sélectionnez un dossier ou plusieurs fichiers.';
 const dn=$25('destinationChoiceName'),dp=$25('destinationChoicePath'),ds=$25('destinationStatus');
 if(dn&&/demo-output|démo/i.test(dn.textContent||''))dn.textContent='Sortie active : choix manuel';
 if(dp&&/demo-output|démo/i.test(dp.textContent||''))dp.textContent='Adresse : à sélectionner';
 if(ds&&/démo/i.test(ds.textContent||''))ds.textContent='Choix manuel : sélectionnez la racine de sortie.';
}

function outputLabel25(mode){
 return mode==='same-source'?'À côté du fichier source':mode==='mirror-tree'?'Sous-dossier traitement + arborescence':mode==='archive-date'?'Classement par année / mois ou semaine':'Téléchargement navigateur';
}
function previewOutput25(){
 const m=$25('outputMode');if(!m)return;qa25('[data-output-mode-card]').forEach(x=>x.classList.toggle('chosen0925',x.dataset.outputModeCard===m.value));
 const st=$25('outputState0925');if(st){st.classList.remove('active');st.textContent='Mode choisi : '+outputLabel25(m.value)+' · cliquez « Activer ce mode ».'}
 try{updatePath()}catch(e){}
}
async function activateOutput25(){
 const m=$25('outputMode')?.value||'same-source';
 if(m==='same-source'){
  const x=typeof current==='function'?current():null,dir=S.source||x?.parent||null;if(dir)S.dest=dir;
  if(dir)destInfo(dir.name||'dossier source',(dir.name||'dossier source')+'/ (entrée = sortie)');
  else{if(E.dstName)E.dstName.textContent='Sortie active : même dossier que le fichier source';if(E.dstPath)E.dstPath.textContent='Adresse : résolue au moment de l’enregistrement';}
 }else if(!S.dest&&typeof chooseDest==='function'){
  await chooseDest();
 }
 S.activeOutputMode0925=m;const st=$25('outputState0925');if(st){st.classList.add('active');st.textContent='Mode actif : '+outputLabel25(m)}
 try{updatePath()}catch(e){}
}
function ensureOutput25(){
 const m=$25('outputMode');if(!m)return;
 if(!$25('outputActivator0925')){
  const field=m.closest('.field')||m.parentElement,wrap=document.createElement('div');wrap.id='outputActivator0925';wrap.className='outputActivate0925';m.parentNode.insertBefore(wrap,m);wrap.appendChild(m);const b=document.createElement('button');b.id='activateOutputMode0925';b.type='button';b.textContent='Activer ce mode';wrap.appendChild(b);b.onclick=()=>run(activateOutput25);const st=document.createElement('div');st.id='outputState0925';st.className='outputState0925';wrap.after(st);
  m.addEventListener('change',previewOutput25);
  qa25('[data-output-mode-card]').forEach(card=>card.addEventListener('click',()=>setTimeout(previewOutput25,0)));
 }
 previewOutput25();
}

function ensureNaming25(){
 const side=$25('sidebarPanel'),out=sectionBySummary25('3.');if(!side)return;
 let sec=$25('namingSection0925');if(!sec){sec=document.createElement('details');sec.id='namingSection0925';sec.className='toolSection namingSection0925';sec.open=false;sec.innerHTML='<summary data-short="4\\nNommage">4. Nommage · préfixes & suffixes</summary><div class="sectionBody" id="namingBody0925"></div>';if(out)out.insertAdjacentElement('afterend',sec);else side.appendChild(sec)}
 const b=$25('namingBody0925');if(!b)return;
 [$25('appendOperationSuffix')?.closest('.field'),$25('processingDate')?.closest('.field'),$25('filenameTemplate')?.closest('.field'),$25('modularNaming0917')].filter(Boolean).forEach(n=>{if(n.parentElement!==b)b.appendChild(n)});
}
function ensureTranslation25(){
 const side=$25('sidebarPanel'),p=$25('brk104Panel');if(!side||!p)return;
 let sec=$25('translationSection0925');if(!sec){sec=document.createElement('details');sec.id='translationSection0925';sec.className='toolSection translationSection0925';sec.innerHTML='<summary data-short="🌐\\nTrad.">🌐 Traduction PDF bilingue</summary><div class="sectionBody" id="translationBody0925"></div>';side.appendChild(sec)}
 const b=$25('translationBody0925');if(p.parentElement!==b)b.appendChild(p);
}

function ensureScope25(){
 const strip=$25('pageStrip');if(!strip)return;
 let bar=$25('pageScopeBar0925');if(!bar){bar=document.createElement('div');bar.id='pageScopeBar0925';bar.className='pageScopeBar0925';bar.innerHTML='<b>Champ d’application</b><select id="pageScope0925"><option value="current">Page / image en cours</option><option value="selected">Pages cochées</option><option value="all">Tout le document</option></select><button id="scopeAll0925" type="button">Tout cocher</button><button id="scopeNone0925" type="button">Tout décocher</button><button id="scopeApplyObject0925" type="button">Appliquer l’objet à la portée</button><span id="scopeCount0925" class="scopeCount0925">0 page cochée</span>';strip.before(bar);
  $25('pageScope0925').onchange=e=>{S.pageScope0921=e.target.value;try{window.NLAB_PAGE_SCOPE_0921?.setScope?.(e.target.value)}catch(x){}decorateThumbs25()};
  $25('scopeAll0925').onclick=()=>{if(window.NLAB_PAGE_SCOPE_0921?.selectAll)window.NLAB_PAGE_SCOPE_0921.selectAll();else{const set=scopeSet25();qa25('#pageStrip .pageThumb').forEach((_,i)=>set.add(i+1))}S.pageScope0921='selected';$25('pageScope0925').value='selected';decorateThumbs25()};
  $25('scopeNone0925').onclick=()=>{if(window.NLAB_PAGE_SCOPE_0921?.clear)window.NLAB_PAGE_SCOPE_0921.clear();else scopeSet25().clear();decorateThumbs25()};
  $25('scopeApplyObject0925').onclick=applyObject25;
 }
 $25('pageScope0925').value=S.pageScope0921||'current';decorateThumbs25();
}
function scopeSet25(){S.selectionScope0921=S.selectionScope0921||{selected:new Set(),order:[],anchor:null};S.selectionScope0921.selected=S.selectionScope0921.selected||new Set();return S.selectionScope0921.selected}
function decorateThumbs25(){
 const thumbs=qa25('#pageStrip .pageThumb'),set=scopeSet25();
 thumbs.forEach((t,i)=>{const pg=Number(t.dataset.page)||i+1;let c=t.querySelector('.pageCheck0925');if(!c){c=document.createElement('input');c.type='checkbox';c.className='pageCheck0925';c.title='Cocher la page '+pg;c.setAttribute('aria-label','Cocher la page '+pg);c.onclick=e=>e.stopPropagation();c.onchange=e=>{e.stopPropagation();if(c.checked)set.add(pg);else set.delete(pg);S.selectionScope0921.anchor=pg;S.pageScope0921='selected';const sel=$25('pageScope0925');if(sel)sel.value='selected';try{window.NLAB_PAGE_SCOPE_0921?.setScope?.('selected')}catch(x){}decorateThumbs25()};t.prepend(c)}c.checked=set.has(pg);t.classList.toggle('selected0925',set.has(pg))});
 const n=$25('scopeCount0925');if(n)n.textContent=set.size+' / '+thumbs.length+' page(s) cochée(s)';
}
function applyObject25(){
 const a=S.selectedAnn;if(!a)return toast('Sélectionnez d’abord un objet ou un tampon.');
 const targets=window.NLAB_PAGE_SCOPE_0921?.target?.()||[];if(!targets.length)return toast('Aucune page dans le champ d’application.');
 const origin=a.page||S.page,created=[];
 targets.forEach(pg=>{if(pg===origin)return;const c=typeof structuredClone==='function'?structuredClone(a):JSON.parse(JSON.stringify(a));c.id=crypto.randomUUID?crypto.randomUUID():'ann-'+Date.now()+'-'+Math.random().toString(36).slice(2);c.page=pg;S.annotations.push(c);created.push(c)});
 if(created.length){try{commitAnnotationHistory('Objet appliqué à la portée');renderAnns()}catch(e){}toast('Objet appliqué à '+targets.length+' page(s).')}else toast('L’objet est déjà sur la portée choisie.');
}

let stripObserver25=null;
function watchPages25(){
 const strip=$25('pageStrip');if(!strip||stripObserver25)return;let timer=0;stripObserver25=new MutationObserver(()=>{clearTimeout(timer);timer=setTimeout(decorateThumbs25,20)});stripObserver25.observe(strip,{childList:true,subtree:true});strip.addEventListener('click',()=>setTimeout(decorateThumbs25,0),true);
}

function install25(){
 addStyle25();releaseMeta25();ensureEntry25();ensureSiteNav25();ensureSidebarControls25();ensureConfig25();ensurePresets25();ensureOutput25();ensureNaming25();ensureTranslation25();ensureScope25();watchPages25();syncDates25();updateDiag25();
}
let t25=0;
const mo25=new MutationObserver(()=>{clearTimeout(t25);t25=setTimeout(install25,40)});
if(document.body)mo25.observe(document.body,{childList:true,subtree:true});
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>{setTimeout(install25,500);setTimeout(releaseMeta25,1100)},{once:true});else{setTimeout(install25,500);setTimeout(releaseMeta25,1100)}
})();