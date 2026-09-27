(function(){
'use strict';
if(window.__NLAB_0924_FUNCTIONAL_UI__)return;
window.__NLAB_0924_FUNCTIONAL_UI__=true;

const $24=id=>document.getElementById(id);
const q24=(s,r=document)=>r.querySelector(s);
const qa24=(s,r=document)=>Array.from(r.querySelectorAll(s));
const release24=()=>window.NLAB_PDF_RELEASE||{version:'0.9.24',label:'Alpha 0.9.24 TEST',date:''};

function fmtReleaseDate0924(v){
 if(!v)return'—';
 const d=new Date(String(v).slice(0,10)+'T12:00:00');
 if(Number.isNaN(d.getTime()))return String(v);
 return new Intl.DateTimeFormat('fr-FR',{day:'2-digit',month:'2-digit',year:'numeric'}).format(d);
}
function applyReleaseMeta0924(){
 const r=release24(),label=r.label||('Alpha '+r.version+' TEST'),date=fmtReleaseDate0924(r.date);
 document.title='nLab PDF Studio — '+label;
 document.documentElement.dataset.nlabPdfVersion=r.version||'';
 qa24('.buildBadge strong').forEach(x=>x.textContent=label);
 qa24('#home .card em,.demoChip').forEach(x=>{x.textContent=(x.textContent||'').replace(/Alpha 0\.9\.\d+(?: TEST| RC2)?/g,label)});
 const foot=q24('footer .footerInfo span');
 if(foot)foot.textContent='nLab PDF Studio · APP07 · '+label+' · dernière MAJ : '+date+'.';
 let badge=$24('releaseBadge0924');
 const meta=q24('header .headerMeta')||q24('header');
 if(meta&&!badge){
  badge=document.createElement('span');badge.id='releaseBadge0924';badge.className='buildBadge releaseBadge0924';meta.prepend(badge);
 }
 if(badge)badge.innerHTML='<strong>'+label+'</strong><span>MAJ '+date+'</span>';
}

function addStyle0924(){
 if($24('style0924'))return;
 const st=document.createElement('style');st.id='style0924';st.textContent=
 '#sidebarCycle,#sidebarExpand,#sidebarModeHint{display:inline-flex!important}'+
 '.releaseBadge0924{min-width:126px}'+
 '.nlabMenu0924{display:flex;align-items:center;gap:4px;flex-wrap:wrap;margin:0 0 8px;padding:5px 7px;background:#fff;border:1px solid #d6e0e8;border-radius:9px;position:sticky;top:0;z-index:45;box-shadow:0 2px 10px #20304010}'+
 '.nlabMenu0924 details{position:relative}.nlabMenu0924 summary{list-style:none;cursor:pointer;padding:7px 10px;border:1px solid transparent;border-radius:6px;font-size:12px;font-weight:800;color:#405565}.nlabMenu0924 summary::-webkit-details-marker{display:none}.nlabMenu0924 details[open]>summary{background:#e8f2fb;border-color:#92bad8;color:#0f5689}'+
 '.nlabMenuPopup0924{position:absolute;top:38px;left:0;z-index:120;min-width:235px;background:#fff;border:1px solid #cbd6df;border-radius:9px;box-shadow:0 12px 30px #0003;padding:6px;display:grid;gap:3px}.nlabMenuPopup0924 button{width:100%;text-align:left;border:0;background:#fff;padding:8px;border-radius:6px}.nlabMenuPopup0924 button:hover{background:#eef5fb}.nlabMenuPopup0924 small{display:block;color:#71808c;padding:4px 7px;line-height:1.35}'+
 '.pageThumb{position:relative!important}.pageSelectCheck0924{position:absolute!important;left:4px!important;top:4px!important;z-index:8!important;width:18px!important;height:18px!important;accent-color:#0057b8;box-shadow:0 0 0 2px #fff;border-radius:3px}.pageThumb.multiSelected0921,.pageThumb.selected0924{outline:3px solid #0057b8!important;outline-offset:1px;background:#e9f4ff!important}.pageThumb .pageThumbFooter{margin-top:1px}'+
 '.pageScopeBar0924,#pageScopeBar0921{display:flex!important;align-items:center;gap:6px;flex-wrap:wrap;margin:6px 0 8px;padding:7px 8px;border:1px solid #9fc2db;border-radius:8px;background:#f3f9fd;font-size:11px}.pageScopeBar0924 select,#pageScopeBar0921 select{width:auto!important;min-width:165px}.pageScopeMaster0924{display:flex;align-items:center;gap:4px;font-weight:800}.pageScopeMaster0924 input{width:auto!important}'+
 '.configSection0924>summary{background:#edf6fc!important}.namingSection0924>summary{background:#f6f3ff!important}.translationSection0924>summary{background:#eef8f4!important}.driveActions0924{display:grid;grid-template-columns:1fr 1fr;gap:6px;margin:7px 0}.driveActions0924 button{width:100%}.nlabConnectionState0924{font-size:10px;padding:6px 7px;border-radius:6px;background:#f3f5f7;color:#566774;margin:6px 0}.nlabConnectionState0924.connected{background:#eaf6ee;color:#215d2e}'+
 '.sourceOutput0924{display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-top:6px}.namingQuick0924{display:flex;gap:4px;flex-wrap:wrap;margin-top:7px}.namingQuick0924 button{font:9px ui-monospace,monospace;padding:4px 6px}.zipOutput0924{margin-top:6px;width:100%}'+
 '#brk104Panel{margin:0!important;border:0!important;padding:0!important;box-shadow:none!important}#brk104Panel>h3{display:none!important}#brk104Panel .body{display:block!important}'+
 '@media(max-width:760px){.nlabMenu0924{position:relative}.nlabMenuPopup0924{position:fixed;left:12px;right:12px;top:auto;min-width:0}.driveActions0924,.sourceOutput0924{grid-template-columns:1fr}}';
 document.head.appendChild(st);
}

function closeMenus0924(except){
 qa24('.nlabMenu0924 details[open]').forEach(d=>{if(d!==except)d.removeAttribute('open')});
}
function clickId0924(id){
 const e=$24(id);if(e){e.click();return true}return false;
}
function openSidebarSection0924(id){
 const d=$24(id);if(!d)return false;
 try{applySidebar('full')}catch(e){}
 d.open=true;d.scrollIntoView({behavior:'smooth',block:'start'});return true;
}
function openPersonal0924(){
 if(openSidebarSection0924('configSection0924'))return;
 const p=$24('workspacePanel0918');if(p){p.open=true;p.scrollIntoView({behavior:'smooth',block:'start'})}
}
function connect0924(){
 if(S.driveConnected){openPersonal0924();return}
 const cid=typeof googleDriveClientId==='function'?googleDriveClientId():'';
 if(!cid){
  openPersonal0924();
  const x=$24('workspaceGoogleClient0918')||$24('sigGoogleClientRC2');
  if(x){x.focus();x.scrollIntoView({behavior:'smooth',block:'center'})}
  toast('Renseignez d’abord le Client ID OAuth Web Google.');
  return;
 }
 connectGoogleDrive();
}
function setTool0924(tool){
 try{setEditorTool(tool)}catch(e){toast(e.message||String(e))}
 if(tool==='stamp')setTimeout(()=>{const h=$24('canonicalStampDates0919')||$24('stampHub0916');if(h)h.scrollIntoView({behavior:'smooth',block:'center'})},120);
}
function toggleSaveBar0924(){
 const b=$24('saveOptionsBar');if(!b)return;
 b.hidden=!b.hidden;if(!b.hidden){const o=$24('openOutputOptions');if(o)o.hidden=false}
}
function ensureMenu0924(){
 if($24('nlabMenu0924')){updateConnectionUi0924();return}
 const ws=$24('workspace'),layout=$24('mainLayout');if(!ws||!layout)return;
 const nav=document.createElement('nav');nav.id='nlabMenu0924';nav.className='nlabMenu0924';nav.setAttribute('aria-label','Menu PDF Studio');
 nav.innerHTML=
 '<details><summary>Fichier</summary><div class="nlabMenuPopup0924"><button data-a="folder">Ouvrir un dossier…</button><button data-a="files">Ouvrir des fichiers…</button><button data-a="driveDocs">Ouvrir depuis Drive / Documents…</button><button data-a="save">Enregistrer</button><button data-a="saveAs">Enregistrer sous…</button><button data-a="zip">Exporter le résultat en ZIP</button></div></details>'+
 '<details><summary>Historique</summary><div class="nlabMenuPopup0924"><button data-a="history">Afficher l’historique complet</button><button data-a="undo">Annuler annotation</button><button data-a="redo">Rétablir annotation</button></div></details>'+
 '<details><summary>Objets</summary><div class="nlabMenuPopup0924"><button data-tool="select">Sélection</button><button data-tool="text">Texte</button><button data-tool="stamp">Tampon & 5 dates</button><button data-tool="highlight">Surligneur</button><button data-tool="pen">Stylo</button><button data-tool="image">Image</button><button data-tool="signatureOp">Signature</button><button data-a="applyObject">Appliquer l’objet sélectionné à la portée</button></div></details>'+
 '<details><summary>Outils</summary><div class="nlabMenuPopup0924"><button data-a="translate">Traduction bilingue</button><button data-a="scope">Portée des pages</button><button data-a="sideFull">Panneau gauche normal</button><button data-a="sideCompact">Panneau gauche compact</button><button data-a="sideHide">Masquer le panneau gauche</button><button data-a="sideShow">Afficher le panneau gauche</button><button data-a="expand">Tout déplier</button><button data-a="collapse">Tout plier</button><button data-a="saveBar">Afficher / masquer la barre de sortie</button><button data-a="output">Options détaillées de sortie</button></div></details>'+
 '<details><summary>Connexion</summary><div class="nlabMenuPopup0924"><small id="menuConnectionState0924">Local</small><button data-a="connect">Se connecter à Google Drive</button><button data-a="personal">Espace personnel & configuration</button><button data-a="importConfig">Importer JSON personnalisé</button><button data-a="exportConfig">Exporter JSON personnalisé</button><button data-a="driveAuto">Activer / désactiver copie Drive des exports</button></div></details>';
 ws.insertBefore(nav,layout);
 nav.querySelectorAll('details').forEach(d=>d.addEventListener('toggle',()=>{if(d.open)closeMenus0924(d)}));
 nav.querySelectorAll('[data-tool]').forEach(b=>b.onclick=()=>{setTool0924(b.dataset.tool);closeMenus0924()});
 nav.querySelectorAll('[data-a]').forEach(b=>b.onclick=()=>{const a=b.dataset.a;
  if(a==='folder')clickId0924('pickSource');
  else if(a==='files')clickId0924('pickFiles');
  else if(a==='driveDocs')run(loadDriveDocuments0924);
  else if(a==='save')clickId0924('saveQuick');
  else if(a==='saveAs')clickId0924('saveAsQuick');
  else if(a==='zip')run(exportZip0924);
  else if(a==='history')clickId0924('sidebarShowHistory')||clickId0924('historyToggle');
  else if(a==='undo')clickId0924('annotationUndo');
  else if(a==='redo')clickId0924('annotationRedo');
  else if(a==='applyObject')applySelectedObjectToScope0924();
  else if(a==='translate')openTranslation0924();
  else if(a==='scope'){const x=$24('pageScopeBar0921')||$24('pageScopeBar0924');if(x)x.scrollIntoView({behavior:'smooth',block:'center'})}
  else if(a==='sideFull'||a==='sideShow')applySidebar('full');
  else if(a==='sideCompact')applySidebar('compact');
  else if(a==='sideHide')applySidebar('hidden');
  else if(a==='expand')clickId0924('sidebarExpandAll');
  else if(a==='collapse')clickId0924('sidebarCollapseAll');
  else if(a==='saveBar')toggleSaveBar0924();
  else if(a==='output')openSidebarSection0924('outputSection');
  else if(a==='connect')connect0924();
  else if(a==='personal')openPersonal0924();
  else if(a==='importConfig')clickId0924('workspaceImport0918')||clickId0924('loadUserConfig');
  else if(a==='exportConfig')clickId0924('workspaceExport0918')||clickId0924('exportUserConfig');
  else if(a==='driveAuto'){const x=$24('workspaceAutoUpload0918');if(x){x.checked=!x.checked;x.dispatchEvent(new Event('change',{bubbles:true}));toast(x.checked?'Copie Drive des exports activée':'Copie Drive des exports désactivée')}else openPersonal0924()}
  closeMenus0924();
 });
 updateConnectionUi0924();
}

function ensureConfigSection0924(){
 const side=$24('sidebarPanel');if(!side)return;
 let sec=$24('configSection0924');
 if(!sec){
  sec=document.createElement('details');sec.id='configSection0924';sec.className='toolSection configSection0924';sec.open=true;
  sec.innerHTML='<summary data-short="0\nConfig">0. Configuration & espace personnel</summary><div class="sectionBody"><div id="configActions0924" class="driveActions0924"><button id="configConnect0924" type="button">🔐 Se connecter</button><button id="configDriveDocs0924" type="button">☁ Drive / Documents</button></div><div id="configState0924" class="nlabConnectionState0924">Mode local</div><div id="configBody0924"></div></div>';
  const first=side.querySelector('.toolSection');side.insertBefore(sec,first||side.firstChild);
  $24('configConnect0924').onclick=connect0924;
  $24('configDriveDocs0924').onclick=()=>run(loadDriveDocuments0924);
 }
 const body=$24('configBody0924');
 const ws=$24('workspacePanel0918');
 const old=q24('details.userConfigBox:not(#workspacePanel0918)',side);
 if(body&&ws&&ws.parentElement!==body)body.appendChild(ws);
 else if(body&&old&&old.parentElement!==body)body.appendChild(old);
 updateConnectionUi0924();
}
function updateConnectionUi0924(){
 const txt=S.driveConnected?(window.__NLAB_DRIVE_0918__?.state?.()?.user?.email||'Google Drive connecté'):'Mode local · Google Drive non connecté';
 for(const e of [$24('configState0924'),$24('menuConnectionState0924')])if(e){e.textContent=txt;e.classList.toggle('connected',!!S.driveConnected)}
 const b=$24('configConnect0924');if(b)b.textContent=S.driveConnected?'👤 Espace personnel':'🔐 Se connecter';
}

function removeDemoControls0924(){
 const b=$24('loadDemoPreset');if(b)b.remove();
 const sel=$24('sourcePreset');if(sel){const o=sel.querySelector('option[value="demo"]');if(o)o.remove();if(sel.value==='demo')sel.value=sel.querySelector('option[value="default"]')?'default':'manual'}
 const box=q24('.demoFilesBox');if(box)box.remove();
 const src=$24('sourceChoiceName'),path=$24('sourceChoicePath'),st=$24('sourceStatus');
 if(src&&(src.textContent||'').includes('demo-input-client'))src.textContent='Aucune source sélectionnée';
 if(path&&(path.textContent||'').includes('demo-input-client'))path.textContent='Choisissez un dossier, des fichiers, un ZIP ou Drive / Documents.';
 if(st&&(st.textContent||'').toLowerCase().includes('démonstration'))st.textContent='Choisissez une source à traiter.';
}

function ensureOutputEnhancements0924(){
 const mode=$24('outputMode');if(!mode)return;
 let box=$24('sourceOutput0924');
 if(!box){
  box=document.createElement('div');box.id='sourceOutput0924';box.className='sourceOutput0924';
  box.innerHTML='<button id="sameSource0924" type="button">Utiliser le dossier source comme sortie</button><button id="driveOutput0924" type="button">Copier aussi vers Drive / Exports</button>';
  mode.closest('.field')?.appendChild(box);
  $24('sameSource0924').onclick=()=>{mode.value='same-source';mode.dispatchEvent(new Event('change',{bubbles:true}));try{window.__NLAB_OUTPUT_ROUTING_0921__?.sync?.()}catch(e){}toast('Sortie = dossier du fichier source')};
  $24('driveOutput0924').onclick=()=>{const x=$24('workspaceAutoUpload0918');if(!x){openPersonal0924();return}if(!S.driveConnected){connect0924();return}x.checked=true;x.dispatchEvent(new Event('change',{bubbles:true}));toast('Les exports seront aussi copiés dans Drive / nLab / PDF Studio / Exports')};
 }
 const open=$24('openOutputOptions');if(open){open.hidden=false;open.textContent='Options détaillées de sortie'}
 const output=$24('outputSection');
 if(output&&!$24('exportResultZip0924')){
  const body=output.querySelector('.sectionBody'),z=document.createElement('button');z.id='exportResultZip0924';z.type='button';z.className='zipOutput0924';z.textContent='Exporter le résultat en ZIP';z.onclick=()=>run(exportZip0924);body?.appendChild(z);
 }
}

function ensureNamingSection0924(){
 const side=$24('sidebarPanel'),out=$24('outputSection');if(!side||!out)return;
 let sec=$24('namingSection0924');
 if(!sec){
  sec=document.createElement('details');sec.id='namingSection0924';sec.className='toolSection namingSection0924';sec.open=true;
  sec.innerHTML='<summary data-short="4\nNommage">4. Nommage · préfixes & suffixes</summary><div class="sectionBody"><div id="namingBody0924"></div><div class="namingQuick0924" id="namingQuick0924"></div></div>';
  out.insertAdjacentElement('afterend',sec);
 }
 const body=$24('namingBody0924');
 const nodes=[
  $24('appendOperationSuffix')?.closest('.field'),
  $24('processingDate')?.closest('.field'),
  $24('filenameTemplate')?.closest('.field'),
  $24('modularNaming0917')
 ].filter(Boolean);
 const vh=$24('filenameTemplate')?.closest('.field')?.nextElementSibling;
 if(vh?.classList?.contains('variableHelp'))nodes.push(vh);
 for(const n of nodes)if(n&&n.parentElement!==body)body.appendChild(n);
 const quick=$24('namingQuick0924');
 if(quick&&!quick.children.length){
  const vals=['{FILENAME}','{DATE:YYYYMMDD}','{INITIALS}','{OP}','{DPI}','{JPEG}','_OCR','_DPI{DPI}','_JPEG{JPEG}','_ANNOT','_FUSION','_GRIS'];
  for(const v of vals){const b=document.createElement('button');b.type='button';b.textContent=v;b.onclick=()=>{const input=$24('customNameTemplate0917')||$24('filenameTemplate');if(!input)return;const s=input.selectionStart??input.value.length,e=input.selectionEnd??input.value.length;input.setRangeText(v,s,e,'end');input.dispatchEvent(new Event('input',{bubbles:true}));input.focus()};quick.appendChild(b)}
 }
}

function applySelectedObjectToScope0924(){
 const a=S.selectedAnn;if(!a)return toast('Sélectionnez d’abord un objet, un tampon, une image ou une annotation.');
 const api=window.NLAB_PAGE_SCOPE_0921;if(!api)return toast('Portée multi-pages indisponible.');
 const targets=api.target?.()||[];if(!targets.length)return toast('Aucune page dans la portée.');
 const existingPage=a.page||S.page,created=[];
 for(const pg of targets){
  if(pg===existingPage)continue;
  const clone=typeof structuredClone==='function'?structuredClone(a):JSON.parse(JSON.stringify(a));
  clone.id=crypto.randomUUID?crypto.randomUUID():'ann-'+Date.now()+'-'+Math.random().toString(36).slice(2);
  clone.page=pg;clone._nlabMeta0920=Object.assign({},clone._nlabMeta0920||{},{id:clone.id,createdAt:new Date().toISOString()});
  S.annotations.push(clone);created.push(clone);
 }
 if(!created.length)return toast('L’objet est déjà sur la seule page de la portée.');
 try{renderAnns();updatePath();commitAnnotationHistory('Objet appliqué à '+targets.length+' page(s)')}catch(e){}
 try{recordDocumentAction('Objet multi-pages',targets.join(', '))}catch(e){}
 toast('Objet appliqué à '+targets.length+' page(s).');
}

function ensureScopeBar0924(){
 const strip=$24('pageStrip');if(!strip)return;
 let bar=$24('pageScopeBar0921');
 if(bar){bar.style.display='flex';bar.classList.add('pageScopeBar0924');if(!$24('pageApplyObject0924')){const b=document.createElement('button');b.id='pageApplyObject0924';b.type='button';b.textContent='Appliquer l’objet à la portée';b.onclick=applySelectedObjectToScope0924;bar.appendChild(b)}}
 else if(window.NLAB_PAGE_SCOPE_0921){
  bar=document.createElement('div');bar.id='pageScopeBar0924';bar.className='pageScopeBar0924';
  bar.innerHTML='<b>Appliquer à</b><select id="pageScopeSelect0924"><option value="current">Page courante</option><option value="selected">Pages cochées</option><option value="all">Tout le document</option></select><button id="pageAll0924" type="button">Tout cocher</button><button id="pageNone0924" type="button">Tout décocher</button><button id="pageApplyObject0924" type="button">Appliquer l’objet à la portée</button><span id="pageCount0924"></span>';
  strip.before(bar);
  const s=$24('pageScopeSelect0924');s.value=S.pageScope0921||'current';s.onchange=()=>{S.pageScope0921=s.value;window.NLAB_PAGE_SCOPE_0921.setScope(s.value);decoratePageChecks0924()};
  $24('pageAll0924').onclick=()=>{window.NLAB_PAGE_SCOPE_0921.selectAll();S.pageScope0921='selected';s.value='selected';decoratePageChecks0924()};
  $24('pageNone0924').onclick=()=>{window.NLAB_PAGE_SCOPE_0921.clear();decoratePageChecks0924()};$24('pageApplyObject0924').onclick=applySelectedObjectToScope0924;
 }
 if(bar&&!$24('pageScopeMaster0924')){
  const lab=document.createElement('label');lab.id='pageScopeMaster0924';lab.className='pageScopeMaster0924';lab.innerHTML='<input type="checkbox" id="pageMasterCheck0924"> Toutes les pages';
  bar.prepend(lab);
  const cb=$24('pageMasterCheck0924');cb.onchange=()=>{if(cb.checked)window.NLAB_PAGE_SCOPE_0921?.selectAll?.();else window.NLAB_PAGE_SCOPE_0921?.clear?.();if(window.NLAB_PAGE_SCOPE_0921){S.pageScope0921='selected';const s=$24('pageScope0921')||$24('pageScopeSelect0924');if(s)s.value='selected'}decoratePageChecks0924()};
 }
}

function decoratePageChecks0924(){
 const thumbs=qa24('#pageStrip .pageThumb'),selected=S.selectionScope0921?.selected||new Set(),total=thumbs.length;
 thumbs.forEach((t,i)=>{
  const p=i+1;let cb=t.querySelector('.pageSelectCheck0924');
  if(!cb){cb=document.createElement('input');cb.type='checkbox';cb.className='pageSelectCheck0924';cb.title='Sélectionner la page '+p+' pour les opérations multi-pages';cb.setAttribute('aria-label','Sélectionner la page '+p);cb.onclick=e=>e.stopPropagation();cb.onchange=e=>{e.stopPropagation();if(!S.selectionScope0921)return;if(cb.checked)S.selectionScope0921.selected.add(p);else S.selectionScope0921.selected.delete(p);S.selectionScope0921.anchor=p;S.pageScope0921='selected';const s=$24('pageScope0921')||$24('pageScopeSelect0924');if(s)s.value='selected';try{window.NLAB_PAGE_SCOPE_0921?.setScope?.('selected')}catch(e){}decoratePageChecks0924()};t.prepend(cb)}
  cb.checked=selected.has(p);t.classList.toggle('selected0924',selected.has(p));
 });
 const master=$24('pageMasterCheck0924');if(master){master.checked=total>0&&selected.size===total;master.indeterminate=selected.size>0&&selected.size<total}
 const count=$24('pageCount0924');if(count)count.textContent=selected.size+' / '+total+' page(s) cochée(s)';
}

let pageStripWrapped0924=false;
function wrapPageStrip0924(){
 if(pageStripWrapped0924||typeof renderPageStrip!=='function')return;
 pageStripWrapped0924=true;const base=renderPageStrip;
 renderPageStrip=function(){const r=base();setTimeout(()=>{ensureScopeBar0924();decoratePageChecks0924()},0);return r};
}

function ensureRibbon0924(){
 const r=$24('editorRibbon');if(!r)return;
 if(!$24('ribbonConnection0924')){const b=document.createElement('button');b.id='ribbonConnection0924';b.className='ribbonTab';b.type='button';b.textContent='🔐 Connexion';b.onclick=connect0924;r.appendChild(b)}
 if(!$24('ribbonTranslation0924')){const b=document.createElement('button');b.id='ribbonTranslation0924';b.className='ribbonTab';b.type='button';b.textContent='🌐 Traduction';b.onclick=openTranslation0924;r.appendChild(b)}
 if(S.tool==='pdf')r.hidden=false;
}
function openTranslation0924(){
 const sec=$24('translationSection0924');if(sec){try{applySidebar('full')}catch(e){}sec.open=true;sec.scrollIntoView({behavior:'smooth',block:'center'});return}
 const p=$24('brk104Panel');if(p){p.scrollIntoView({behavior:'smooth',block:'center'});return}
 toast('Module de traduction non chargé. Consultez les diagnostics de modules.');
}
function ensureTranslation0924(){
 const side=$24('sidebarPanel'),panel=$24('brk104Panel');if(!side||!panel)return;
 let sec=$24('translationSection0924');
 if(!sec){sec=document.createElement('details');sec.id='translationSection0924';sec.className='toolSection translationSection0924';sec.innerHTML='<summary data-short="🌐\nTrad.">🌐 Traduction PDF bilingue</summary><div class="sectionBody" id="translationBody0924"></div>';const actions=$24('sidebarHistorySection')||side.lastElementChild;side.insertBefore(sec,actions)}
 const body=$24('translationBody0924');if(panel.parentElement!==body)body.appendChild(panel);
}

async function exportZip0924(){
 if(!S.pdfBytes)throw new Error('Aucun document à exporter');
 if(!window.JSZip)throw new Error('JSZip indisponible');
 const bytes=typeof finalPdfBytes==='function'?await finalPdfBytes():S.pdfBytes;
 const name=typeof outName==='function'?outName():(current()?.name||'document.pdf');
 const zip=new JSZip();zip.file(name,new Blob([bytes],{type:'application/pdf'}));
 const blob=await zip.generateAsync({type:'blob',compression:'DEFLATE',compressionOptions:{level:6}});
 const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=name.replace(/\.pdf$/i,'')+'.zip';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1500);
 toast('ZIP exporté : '+a.download);
}

async function loadDriveDocuments0924(){
 if(!S.driveConnected){connect0924();return}
 const api=window.__NLAB_DRIVE_0918__;if(!api)throw new Error('Module Google Drive indisponible');
 await api.ensureStructure();const state=api.state();if(!state.documentsId)throw new Error('Dossier Drive / Documents indisponible');
 const p=new URLSearchParams({spaces:'drive',pageSize:'100',fields:'files(id,name,mimeType,modifiedTime,size)',q:"trashed = false and '"+state.documentsId+"' in parents"});
 const data=await driveApiFetch('https://www.googleapis.com/drive/v3/files?'+p),files=(data.files||[]).filter(x=>/\.(pdf|png|jpe?g|docx|zip)$/i.test(x.name||''));
 if(!files.length){toast('Aucun document compatible dans Drive / nLab / PDF Studio / Documents');return}
 const lines=files.slice(0,30).map((x,i)=>(i+1)+' — '+x.name).join('\n');
 const n=Number(prompt('Choisissez un fichier Drive / Documents :\n\n'+lines,'1'));if(!n||n<1||n>Math.min(files.length,30))return;
 const meta=files[n-1],r=await fetch('https://www.googleapis.com/drive/v3/files/'+encodeURIComponent(meta.id)+'?alt=media',{headers:{Authorization:'Bearer '+S.driveAccessToken}});
 if(!r.ok)throw new Error('Google Drive '+r.status);
 const blob=await r.blob(),file=new File([blob],meta.name,{type:blob.type||meta.mimeType||'application/octet-stream'});
 S.source=null;S.files=[{file:file,name:file.name,relativePath:'Google Drive/nLab/PDF Studio/Documents/'+file.name,driveFileId:meta.id}];
 sourceInfo('Google Drive / Documents','Mon Drive / nLab / PDF Studio / Documents');await afterFiles();
 toast('Fichier chargé depuis Google Drive');
}

function ensureArchiveMenu0924(){
 const b=$24('archiveExportZip0921');if(b)b.title='Exporter le workspace ZIP modifié';
}

function moduleDiagnostics0924(){
 const errors=window.__NLAB_PATCH_ERRORS__||[];
 let box=$24('moduleDiag0924');const cfg=$24('configBody0924');if(!cfg)return;
 if(!box){box=document.createElement('details');box.id='moduleDiag0924';box.className='variableHelp';box.innerHTML='<summary>Diagnostics modules</summary><div class="userConfigHelp" id="moduleDiagText0924"></div>';cfg.appendChild(box)}
 const ok=[
  ['Portée pages',!!window.NLAB_PAGE_SCOPE_0921],
  ['ZIP',!!window.NLAB_ARCHIVE_WORKSPACE],
  ['Drive',!!window.__NLAB_DRIVE_0918__],
  ['Workspace',!!window.__NLAB_WORKSPACE_0918__],
  ['Traduction BRK104',!!window.NLAB_BRK104],
  ['5 dates',!!$24('canonicalStampDates0919')]
 ];
 $24('moduleDiagText0924').innerHTML=ok.map(x=>(x[1]?'✅ ':'⚠️ ')+x[0]).join('<br>')+(errors.length?'<br><br><b>Erreurs isolées :</b><br>'+errors.map(e=>'• '+e.label+' : '+e.message).join('<br>'):'');
}

function install0924(){
 addStyle0924();applyReleaseMeta0924();removeDemoControls0924();wrapPageStrip0924();ensureScopeBar0924();decoratePageChecks0924();ensureConfigSection0924();ensureOutputEnhancements0924();ensureNamingSection0924();ensureMenu0924();ensureRibbon0924();ensureTranslation0924();ensureArchiveMenu0924();updateConnectionUi0924();moduleDiagnostics0924();
}
let timer0924=0;
const mo0924=new MutationObserver(()=>{clearTimeout(timer0924);timer0924=setTimeout(install0924,30)});
if(document.body)mo0924.observe(document.body,{childList:true,subtree:true});
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(install0924,900),{once:true});else setTimeout(install0924,900);
window.addEventListener('nlab:drive-state',updateConnectionUi0924);
})();