(()=>{
'use strict';
if(window.__NLAB_0925_VISIBLE_CONTROLS__)return;
window.__NLAB_0925_VISIBLE_CONTROLS__=true;

const $25=id=>document.getElementById(id);
const q25=(s,r=document)=>r.querySelector(s);
const qa25=(s,r=document)=>Array.from(r.querySelectorAll(s));
const TODAY25=()=>{const d=new Date();return d.toISOString().slice(0,10)};
const DATE_MAP25=[
 {key:'STAMP_DATE',label:'Date du tampon',source:'stampHubDateSTAMP0916'},
 {key:'DATE_A',label:'Date A',source:'stampHubDateA0916'},
 {key:'DATE_B',label:'Date B',source:'stampHubDateB0916'},
 {key:'DATE_C',label:'Date C',source:'stampHubDateC0916'},
 {key:'DATE_D',label:'Date D',source:'stampHubDateD0916'}
];

function style0925(){
 if($25('style0925'))return;
 const st=document.createElement('style');st.id='style0925';st.textContent=`
 :root{--nlab-blue:#0057b8;--nlab-ink:#1f2933;--nlab-muted:#667582;--nlab-bg:#f4f6f8;--nlab-line:#d9e0e6;--nlab-soft:#eef5fb}
 body{background:var(--nlab-bg)!important;color:var(--nlab-ink)}
 header{border-bottom:3px solid var(--nlab-blue)!important;background:#fff!important}
 header .brandIcon{display:none!important}
 .nlabBrand0925{display:flex;align-items:center;gap:10px;text-decoration:none;color:inherit}
 .nlabBrand0925 img{width:92px;height:auto;display:block}
 .nlabNav0925{display:flex;align-items:center;gap:6px;flex-wrap:wrap;margin-right:8px}
 .nlabNav0925 a,.nlabNav0925 button{padding:6px 9px;border:1px solid #b9c6d1;border-radius:7px;background:#fff;text-decoration:none;color:#405160;font-size:11px;font-weight:800;cursor:pointer}
 .nlabNav0925 a.primary{background:var(--nlab-blue);border-color:var(--nlab-blue);color:#fff}
 .sidebarTopControls0925{position:sticky;top:0;z-index:70;display:flex;gap:5px;align-items:center;padding:6px 0 8px;background:#fff;border-bottom:1px solid var(--nlab-line)}
 .sidebarTopControls0925 button{padding:6px 8px;font-size:11px;font-weight:800}
 .sidebarGrip0925{position:absolute;top:0;right:-8px;width:16px;height:100%;cursor:col-resize;z-index:80}
 .sidebarGrip0925::after{content:"";position:absolute;left:7px;top:8px;bottom:8px;width:3px;border-radius:3px;background:#b3c1cd}
 .sidebarGrip0925:hover::after,.sidebarGrip0925.dragging::after{background:var(--nlab-blue);width:4px;left:6px}
 .layout.sidebarHidden0925{grid-template-columns:0 minmax(0,1fr)!important;gap:0!important}
 .layout.sidebarHidden0925>#sidebarPanel{display:none!important}
 .layout.sidebarCompact0925{grid-template-columns:72px minmax(0,1fr)!important}
 .layout.sidebarCompact0925 #sidebarPanel .sectionBody,.layout.sidebarCompact0925 #sidebarPanel .sidebarFileDockInfo,.layout.sidebarCompact0925 #sidebarPanel .toolSection>summary span{display:none!important}
 .layout.sidebarCompact0925 #sidebarPanel{padding:6px!important;overflow-x:hidden!important}
 .layout.sidebarCompact0925 #sidebarPanel .toolSection>summary{font-size:0!important;justify-content:center}
 .layout.sidebarCompact0925 #sidebarPanel .toolSection>summary::after{content:attr(data-short);font-size:10px;white-space:pre-line;text-align:center}
 .sidebarRestore0925{position:fixed;left:8px;top:50%;transform:translateY(-50%);z-index:200;padding:8px 7px;border:1px solid #8fb1ca;border-radius:0 8px 8px 0;background:#fff;color:#0f5689;font-weight:900;box-shadow:0 4px 16px #0002;display:none}
 .layout.sidebarHidden0925~.sidebarRestore0925,.sidebarRestore0925.visible{display:block}
 #sidebarPanel{position:sticky!important;top:8px!important;height:calc(100dvh - 16px)!important;max-height:calc(100dvh - 16px)!important;overflow:auto!important}
 .pageScopeBar0925{display:flex;align-items:center;gap:6px;flex-wrap:wrap;padding:8px 9px;margin:6px 0 8px;background:#f1f8fd;border:1px solid #90bddb;border-radius:9px;position:sticky;top:0;z-index:30}
 .pageScopeBar0925 b{color:#174f78}.pageScopeBar0925 select{width:auto!important;min-width:175px}.pageScopeBar0925 button{padding:6px 8px}.pageScopeBar0925 .scopeCount0925{font-size:10px;color:#536778;font-weight:800}
 #pageScopeBar0921{display:none!important}
 #pageStrip .pageThumb{position:relative!important}
 .pageCheck0925{position:absolute!important;left:5px!important;top:5px!important;z-index:40!important;width:20px!important;height:20px!important;accent-color:var(--nlab-blue);cursor:pointer;box-shadow:0 0 0 2px #fff;border-radius:3px}
 #pageStrip .pageThumb.pageChecked0925{outline:3px solid var(--nlab-blue)!important;outline-offset:1px!important;background:#e9f4ff!important}
 .configZero0925>summary{background:#eaf3fb!important;color:#174f78!important}
 .configZero0925 .sectionBody{display:grid;gap:8px}
 .configBlock0925{border:1px solid #d5e0e8;border-radius:8px;background:#fbfdff;padding:8px}
 .configBlock0925 h4{margin:0 0 7px;font-size:12px;color:#174f78}
 .datesGrid0925{display:grid;gap:6px}
 .dateRow0925{display:grid;grid-template-columns:105px 145px minmax(140px,1fr);gap:6px;align-items:center}
 .dateRow0925 code{font-size:10px;color:#174f78}
 .presetRow0925{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:6px;align-items:center}
 .presetRow0925 button{height:32px;padding:5px 10px;font-weight:800}
 .outputActivation0925{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:6px;align-items:center;margin-top:6px}
 .outputActivation0925 button{height:34px;font-weight:900;background:#eef5fb;border-color:#8fb7d4;color:#174f78}
 .sameSource0925{background:#eaf6ee!important;border-color:#8bc89d!important;color:#215d2e!important}
 .featureAudit0925{font-size:10px;line-height:1.55;color:#526675}
 @media(max-width:800px){.dateRow0925{grid-template-columns:1fr}.nlabNav0925{width:100%}.pageScopeBar0925{position:relative}}
 `;
 document.head.appendChild(st);
}

function brand0925(){
 const header=q25('header');if(!header)return;
 const h1=q25('h1',header);
 if(h1&&!$25('nlabBrand0925')){
   const wrap=h1.parentElement,brand=document.createElement('a');brand.id='nlabBrand0925';brand.className='nlabBrand0925';brand.href='../../';
   brand.innerHTML='<img src="../../assets/branding/nlab-wordmark.svg" alt="nLab"><span><b>PDF Studio</b><small style="display:block;color:#667582">nLab Web · APP07</small></span>';
   wrap?.replaceWith(brand);
 }
 const meta=q25('.headerMeta',header)||header;
 if(!$25('nlabNav0925')){
   const nav=document.createElement('div');nav.id='nlabNav0925';nav.className='nlabNav0925';
   nav.innerHTML='<a href="../../" class="primary">⌂ nLab Web</a><a href="../studios/">Studios</a><a href="./">PDF Studio</a>';
   meta.parentElement?.insertBefore(nav,meta);
 }
 const back=$25('backHome');if(back){back.textContent='← PDF Studio';back.title='Revenir à l’accueil PDF Studio'}
}

function getEntrySection0925(){
 return qa25('#sidebarPanel>.toolSection').find(d=>(q25('summary',d)?.textContent||'').includes('1. Entrée'))||null;
}
function ensureConfigZero0925(){
 const side=$25('sidebarPanel');if(!side)return;
 let sec=$25('configZero0925');
 if(!sec){
   sec=document.createElement('details');sec.id='configZero0925';sec.className='toolSection configZero0925';sec.open=true;
   sec.innerHTML='<summary data-short="0\nConfig">0. Configuration</summary><div class="sectionBody"><div class="configBlock0925" id="varsBlock0925"><h4>Variables nommées · rappel rapide</h4><div id="varsBody0925"></div></div><div class="configBlock0925"><h4>Dates globales des tampons</h4><div class="datesGrid0925" id="datesGrid0925"></div></div><div class="configBlock0925" id="jsonBlock0925"><h4>Préconfiguration JSON & espace personnel</h4><div id="jsonBody0925"></div></div><div class="configBlock0925"><h4>État des fonctions</h4><div id="audit0925" class="featureAudit0925"></div></div></div>';
   const entry=getEntrySection0925();side.insertBefore(sec,entry||side.firstChild);
 }
 const entry=getEntrySection0925(),varsBody=$25('varsBody0925'),jsonBody=$25('jsonBody0925');
 if(entry&&varsBody){
   const varBox=qa25('.variableHelp',entry).find(x=>(q25('summary',x)?.textContent||'').toLowerCase().includes('variables de nommage'));
   if(varBox&&varBox.parentElement!==varsBody)varsBody.appendChild(varBox);
 }
 if(jsonBody){
   const ws=$25('workspacePanel0918');
   const old=entry?qa25('.userConfigBox',entry).find(x=>x.id!=='workspacePanel0918'):null;
   const p=ws||old;
   if(p&&p.parentElement!==jsonBody)jsonBody.appendChild(p);
 }
 ensureDates0925();
 audit0925();
}
function ensureDates0925(){
 const grid=$25('datesGrid0925');if(!grid)return;
 if(!grid.children.length){
   for(const d of DATE_MAP25){
     const row=document.createElement('label');row.className='dateRow0925';row.innerHTML='<b>'+d.label+'</b><input type="date" data-k="'+d.key+'"><code>{'+d.key+'}</code>';
     const inp=q25('input',row);const src=$25(d.source);inp.value=src?.value||TODAY25();
     inp.oninput=()=>{const x=$25(d.source);if(x){x.value=inp.value||TODAY25();x.dispatchEvent(new Event('input',{bubbles:true}));x.dispatchEvent(new Event('change',{bubbles:true}))}try{updateStampPreview()}catch(e){}try{updatePath()}catch(e){}};
     grid.appendChild(row);
   }
 }
 for(const d of DATE_MAP25){const inp=q25('[data-k="'+d.key+'"]',grid),src=$25(d.source);if(inp&&src&&document.activeElement!==inp&&src.value&&inp.value!==src.value)inp.value=src.value}
 const canonical=$25('canonicalStampDates0919');if(canonical)canonical.style.display='none';
}

function cleanPresets0925(){
 const src=$25('sourcePreset'),dst=$25('destinationPreset');
 if(src){
   src.querySelector('option[value="demo"]')?.remove();
   if(!$25('sourceLoad0925')){
     const row=src.closest('.presetRow')||src.parentElement;row?.classList.add('presetRow0925');
     const b=document.createElement('button');b.id='sourceLoad0925';b.type='button';b.textContent='Charger';
     b.onclick=()=>{if(src.value==='default'){if($25('reuseSource')&&!$25('reuseSource').hidden)$25('reuseSource').click();else toast('Aucun dossier d’entrée par défaut mémorisé.')}else $25('pickSource')?.click()};
     row?.appendChild(b);
   }
   if(!S.lastSource||src.value==='demo')src.value='manual';
   const n=$25('sourceChoiceName'),p=$25('sourceChoicePath'),s=$25('sourceStatus');
   if(n&&(n.textContent||'').includes('demo-input-client'))n.textContent='Source : choix manuel';
   if(p&&(p.textContent||'').includes('demo-input-client'))p.textContent='Choisissez un dossier ou plusieurs fichiers.';
   if(s&&(s.textContent||'').toLowerCase().includes('démo'))s.textContent='Mode manuel prêt.';
   $25('loadDemoPreset')?.remove();q25('.demoFilesBox')?.remove();
 }
 if(dst){
   dst.querySelector('option[value="demo"]')?.remove();
   if(!$25('destinationLoad0925')){
     const row=document.createElement('div');row.className='presetRow0925';dst.parentElement?.insertBefore(row,dst);row.appendChild(dst);
     const b=document.createElement('button');b.id='destinationLoad0925';b.type='button';b.textContent='Charger';row.appendChild(b);
     b.onclick=()=>{if(dst.value==='default'){if($25('reuseDestination')&&!$25('reuseDestination').hidden)$25('reuseDestination').click();else toast('Aucun dossier de sortie par défaut mémorisé.')}else $25('pickDestination')?.click()};
   }
   if(!S.lastDest||dst.value==='demo')dst.value='manual';
   const n=$25('destinationChoiceName'),p=$25('destinationChoicePath'),s=$25('destinationStatus');
   if(n&&(n.textContent||'').includes('demo-output'))n.textContent='Sortie : choix manuel';
   if(p&&(p.textContent||'').includes('demo-output'))p.textContent='Choisissez un dossier de sortie ou activez « À côté du fichier source ».';
   if(s&&(s.textContent||'').toLowerCase().includes('démonstration'))s.textContent='Mode manuel prêt.';
 }
}

function outputMode0925(){
 const mode=$25('outputMode');if(!mode)return;
 if(!$25('outputActivation0925')){
   const wrap=document.createElement('div');wrap.id='outputActivation0925';wrap.className='outputActivation0925';
   const b=document.createElement('button');b.id='activateOutput0925';b.type='button';b.textContent='Activer ce mode';
   mode.parentElement?.insertBefore(wrap,mode);wrap.appendChild(mode);wrap.appendChild(b);
   b.onclick=()=>activateOutput0925(mode.value,true);
   mode.addEventListener('change',()=>syncOutputButton0925());
 }
 qa25('[data-output-mode-card]').forEach(card=>{
   card.onclick=()=>{mode.value=card.dataset.outputModeCard;syncOutputButton0925();activateOutput0925(mode.value,true)}
 });
 syncOutputButton0925();if(mode.value==='same-source')activateOutput0925('same-source',false);
}
function syncOutputButton0925(){
 const mode=$25('outputMode'),b=$25('activateOutput0925');if(!mode||!b)return;
 const labels={ 'same-source':'À côté du fichier source','mirror-tree':'Sous-dossier traitement','archive-date':'Classement par date','download':'Téléchargement navigateur'};
 b.textContent='Activer · '+(labels[mode.value]||mode.value);
 qa25('[data-output-mode-card]').forEach(x=>x.classList.toggle('active',x.dataset.outputModeCard===mode.value));
 b.classList.toggle('sameSource0925',mode.value==='same-source');
}
function activateOutput0925(value,notify){
 const mode=$25('outputMode');if(mode){mode.value=value;mode.dispatchEvent(new Event('change',{bubbles:true}))}
 if(value==='same-source'){
   if(S.source){S.dest=S.source;try{destInfo(S.source.name,S.source.name+'/ (même dossier que la source)')}catch(e){}}
   else {const cur=typeof current==='function'?current():null;if(cur?.parent){S.dest=cur.parent;try{destInfo(cur.parent.name||'Dossier source','Même dossier que le fichier source')}catch(e){}}}
   const st=$25('destinationStatus');if(st)st.textContent='Sortie automatique : même dossier que le fichier source.';
   const dst=$25('destinationPreset');if(dst)dst.value='manual';
 }
 try{updatePath()}catch(e){}
 if(notify)toast(value==='same-source'?'Mode activé : sortie à côté du fichier source.':'Mode de sortie activé.');
}

function selectedSet0925(){
 if(S.selectionScope0921?.selected)return S.selectionScope0921.selected;
 S.selectionScope0925=S.selectionScope0925||new Set();return S.selectionScope0925;
}
function scope0925(){
 return S.pageScope0921||S.pageScope0925||'current';
}
function setScope0925(v){
 S.pageScope0921=v;S.pageScope0925=v;try{window.NLAB_PAGE_SCOPE_0921?.setScope?.(v)}catch(e){}renderPageSelection0925();
}
function ensurePageScope0925(){
 const strip=$25('pageStrip');if(!strip)return;
 let bar=$25('pageScopeBar0925');
 if(!bar){
   bar=document.createElement('div');bar.id='pageScopeBar0925';bar.className='pageScopeBar0925';
   bar.innerHTML='<b>Appliquer à</b><select id="pageScopeSelect0925"><option value="current">Page en cours</option><option value="selected">Pages cochées</option><option value="all">Tout le document</option></select><button id="pageAll0925" type="button">Tout cocher</button><button id="pageNone0925" type="button">Tout décocher</button><span id="pageCount0925" class="scopeCount0925"></span>';
   strip.before(bar);
   $25('pageScopeSelect0925').onchange=e=>setScope0925(e.target.value);
   $25('pageAll0925').onclick=()=>{const set=selectedSet0925();set.clear();const n=S.pdfjs?.numPages||qa25('#pageStrip .pageThumb').length;for(let i=1;i<=n;i++)set.add(i);setScope0925('selected')};
   $25('pageNone0925').onclick=()=>{selectedSet0925().clear();setScope0925('selected')};
 }
 $25('pageScopeSelect0925').value=scope0925();
 ensurePageChecks0925();renderPageSelection0925();
}
function ensurePageChecks0925(){
 const set=selectedSet0925();
 qa25('#pageStrip .pageThumb').forEach((thumb,i)=>{
   const page=Number(thumb.dataset.page)||i+1;thumb.dataset.page=String(page);
   let cb=q25('.pageCheck0925',thumb);
   if(!cb){
     cb=document.createElement('input');cb.type='checkbox';cb.className='pageCheck0925';cb.title='Cocher la page '+page;cb.setAttribute('aria-label','Cocher la page '+page);
     cb.addEventListener('click',e=>e.stopPropagation());
     cb.addEventListener('change',e=>{e.stopPropagation();if(cb.checked)set.add(page);else set.delete(page);S.selectionScope0921&&(S.selectionScope0921.anchor=page);setScope0925('selected')});
     thumb.prepend(cb);
   }
   cb.checked=set.has(page);thumb.classList.toggle('pageChecked0925',set.has(page));
 });
}
function renderPageSelection0925(){
 const set=selectedSet0925(),n=S.pdfjs?.numPages||qa25('#pageStrip .pageThumb').length;
 const c=$25('pageCount0925');if(c)c.textContent=set.size+' / '+n+' page(s) cochée(s)';
 const s=$25('pageScopeSelect0925');if(s)s.value=scope0925();
 qa25('#pageStrip .pageThumb').forEach((t,i)=>{const p=Number(t.dataset.page)||i+1,cb=q25('.pageCheck0925',t);if(cb)cb.checked=set.has(p);t.classList.toggle('pageChecked0925',set.has(p))});
}

function sidebar0925(){
 const side=$25('sidebarPanel'),layout=$25('mainLayout');if(!side||!layout)return;
 if(!$25('sidebarTopControls0925')){
   const c=document.createElement('div');c.id='sidebarTopControls0925';c.className='sidebarTopControls0925';
   c.innerHTML='<button id="sidebarHide0925" type="button">◀ Masquer</button><button id="sidebarCompact0925" type="button">▥ Compact</button><button id="sidebarFull0925" type="button">▤ Normal</button><button id="sidebarWider0925" type="button">↔ + large</button>';
   side.prepend(c);
   $25('sidebarHide0925').onclick=()=>setSidebar0925('hidden');
   $25('sidebarCompact0925').onclick=()=>setSidebar0925('compact');
   $25('sidebarFull0925').onclick=()=>setSidebar0925('full');
   $25('sidebarWider0925').onclick=()=>{const w=Math.min(700,Number(localStorage.getItem('nlab-pdf-sidebar-w0925')||430)+80);setSidebarWidth0925(w)};
 }
 if(!$25('sidebarGrip0925')){
   const g=document.createElement('div');g.id='sidebarGrip0925';g.className='sidebarGrip0925';g.title='Glisser pour modifier la largeur du panneau';side.appendChild(g);
   g.onpointerdown=e=>{setSidebar0925('full');g.classList.add('dragging');const start=e.clientX,base=side.getBoundingClientRect().width;g.setPointerCapture?.(e.pointerId);g.onpointermove=ev=>setSidebarWidth0925(Math.max(280,Math.min(760,base+ev.clientX-start)),false);g.onpointerup=()=>{g.classList.remove('dragging');g.onpointermove=null;g.onpointerup=null;localStorage.setItem('nlab-pdf-sidebar-w0925',Math.round(side.getBoundingClientRect().width))}};
 }
 if(!$25('sidebarRestore0925')){
   const b=document.createElement('button');b.id='sidebarRestore0925';b.className='sidebarRestore0925';b.type='button';b.textContent='▶ Panneau';b.onclick=()=>setSidebar0925('full');document.body.appendChild(b);
 }
 const saved=Number(localStorage.getItem('nlab-pdf-sidebar-w0925')||0);if(saved)setSidebarWidth0925(saved,false);
}
function setSidebarWidth0925(w,persist=true){
 const layout=$25('mainLayout');if(!layout)return;layout.style.setProperty('--sidebar-width',Math.round(w)+'px');layout.style.gridTemplateColumns=Math.round(w)+'px minmax(0,1fr)';if(persist)localStorage.setItem('nlab-pdf-sidebar-w0925',Math.round(w));
}
function setSidebar0925(mode){
 const layout=$25('mainLayout'),restore=$25('sidebarRestore0925');if(!layout)return;
 layout.classList.toggle('sidebarHidden0925',mode==='hidden');layout.classList.toggle('sidebarCompact0925',mode==='compact');if(mode==='full'){layout.classList.remove('sidebarHidden0925','sidebarCompact0925');const w=Number(localStorage.getItem('nlab-pdf-sidebar-w0925')||430);setSidebarWidth0925(w,false)}
 if(restore)restore.classList.toggle('visible',mode==='hidden');
}

function audit0925(){
 const a=$25('audit0925');if(!a)return;
 const items=[
 ['Cases de sélection pages',!!$25('pageScopeBar0925')],
 ['Portée page/sélection/document',!!$25('pageScopeSelect0925')],
 ['Variables nommées',!!$25('varsBody0925')],
 ['Préconfiguration JSON',!!$25('jsonBody0925')],
 ['5 dates',!!$25('datesGrid0925')],
 ['Panneau redimensionnable',!!$25('sidebarGrip0925')],
 ['Traduction BRK104',!!window.NLAB_BRK104],
 ['Workspace Drive',!!window.__NLAB_DRIVE_0918__],
 ['Archives ZIP',!!window.NLAB_ARCHIVE_WORKSPACE]
 ];
 a.innerHTML=items.map(x=>(x[1]?'✅ ':'⚠️ ')+x[0]).join('<br>');
}

function install0925(){
 style0925();brand0925();sidebar0925();ensureConfigZero0925();cleanPresets0925();outputMode0925();ensurePageScope0925();audit0925();
}
let t0925=0;
const mo0925=new MutationObserver(()=>{clearTimeout(t0925);t0925=setTimeout(install0925,35)});
if(document.body)mo0925.observe(document.body,{childList:true,subtree:true});
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(install0925,900),{once:true});else setTimeout(install0925,900);
setInterval(()=>{try{ensurePageScope0925();ensureDates0925();audit0925()}catch(e){}},1200);
})();