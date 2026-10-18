// Studio Core Test Lab 0.4 — UX 0.5 visual reference, real Core services behind the shell.
import{mountStudioWorkspace}from'../_shared/studio-v2/workspace-layout.js';
import{createHistorySidebar}from'../_shared/studio-v2/history-sidebar.js';
import{TemplateEngine,templateVariableHelp}from'../_shared/studio-v2/template-engine.js';
import{OutputService}from'../_shared/studio-v2/output-service.js';
import{createColorPicker}from'../_shared/studio-v2/color-control.js';
import{recordHistory}from'../_shared/studio-v2/history.js';
import{thumbnailFor}from'../_shared/studio-v2/thumbnail-service.js';


const $=q=>document.querySelector(q);
const make=(tag,cls='',html='')=>{const el=document.createElement(tag);if(cls)el.className=cls;if(html)el.innerHTML=html;return el};
const safePart=s=>String(s||'').replace(/[<>:"|?*\x00-\x1f/\\]/g,'_').replace(/^\.+$/,'_').trim().slice(0,160);
const safeKey='nlab:core-lab:export-counter:v1';
const exts=['json','csv','txt'];
const MIME={json:'application/json',csv:'text/csv',txt:'text/plain'};
const csv=x=>'"'+String(x??'').replace(/"/g,'""')+'"';
const safeStore=(key,value)=>{try{localStorage.setItem(key,String(value))}catch{}};
const safeRead=(key,fallback)=>{try{return localStorage.getItem(key)??fallback}catch{return fallback}};

export function mountCoreLabUx({main,collection,appendFiles}){
 const legacyAside=main.querySelector(':scope>.labSidebar');
 const oldViewer=main.querySelector(':scope>.viewer');
 const panels=Array.from(oldViewer.children);
 const [feature,acquisition,sample,manual]=panels;
 legacyAside.classList.remove('studioSidebar');
 // Rehome real existing modules/controls rather than creating duplicate controls.
 const picker=$('#labPickerOpen'),filesNative=$('#labFilesNative'),drop=$('#labCollectionDrop');
 const coll=$('#labCollection'),ctrl=$('.labCollectionControls'),collectionInfo=$('#labCollectionInfo');
 const acquiredInfo=$('#labAcquiredInfo'),picked=$('#labPickedFiles');
 const pickedDetails=picked.closest('details');
 const profile=make('div','studioUxFileSidebar','<strong>Collection active</strong><p id="uxFilesCount">0 fichier</p><button class="uxMiniButton" id="uxSideImport" type="button">↥ Ajouter des fichiers</button>');
 const fileBar=make('div','uxFileBar','<div class="uxSidebarOverline">Collection active · <span id="uxSideFileCount">0 fichiers</span></div><div class="uxFileActions"><button id="uxSideAdd" type="button">↥ Ajouter</button><button id="uxSideFolder" type="button">▱ Dossier</button></div><button id="uxSideSamples" class="uxMiniButton" type="button">◫ Charger les 4 exemples</button>');
 const fileAccordion=make('details','uxHistoryAccordion uxFileAccordion','<summary>Fichiers · <span id="uxSideSelected">0 sélectionné(s)</span></summary><div id="uxSideFileList" class="uxSideFileList" role="list"></div>');
 fileAccordion.open=true;
 const sideSelection=make('div','uxFileSelection','<button id="uxFileAll" type="button">Tout</button><button id="uxFileNone" type="button">Aucun</button><button id="uxFileInvert" type="button">Inverser</button>');
 const sideHint=make('p','uxHistoryHint','La sélection active est partagée entre le volet, la planche de travail et les propriétés. Les fichiers restent dans leur ordre de collection.');
 profile.replaceChildren(fileBar,fileAccordion,sideSelection,sideHint);
 pickedDetails.hidden=true;profile.append(pickedDetails);
 const historyView=createHistorySidebar({studio:'studio-core-test'});
 const history=historyView.element;
 const prop=make('div','');
 prop.append(sample);
 prop.append(make('h3','labHeading','Couleur · service Core partagé'));
 const colorHost=make('div','uxColorContainer');prop.append(colorHost);
 const pickerColor=createColorPicker({label:'Couleur de démonstration',value:'#206FAE'});
 colorHost.append(pickerColor.element);
 const tasks=make('div','');tasks.append(manual);
 const search=make('div','','<label class="labField">Rechercher dans la collection<input type="search" id="uxCollectionSearch" placeholder="Nom, type ou dossier…"></label><p class="labHint">Le filtre s’applique à la collection affichée.</p><button type="button" class="uxMiniButton" id="uxSelectVisible">Sélectionner les fichiers visibles</button><p id="uxSearchCount" class="labHint"></p>');
 const settings=make('div','','<h3 class="labHeading">Préférences d’affichage</h3><label class="labField">Thème<select id="uxTheme"><option value="auto">Automatique</option><option value="light">Clair</option><option value="dark">Sombre</option></select></label><div class="uxCard"><strong>Trois profils responsive</strong><small>Desktop · Tablette · Mobile. L’interface s’adapte automatiquement à la largeur du navigateur.</small><div class="labToolbar"><button type="button" data-ux-device="desktop">🖥 Desktop</button><button type="button" data-ux-device="tablet">▣ Tablette</button><button type="button" data-ux-device="mobile">▯ Mobile</button></div></div>');
 settings.append(feature.querySelector('.labToolbar')||document.createElement('div'));
 const diagnostics=make('div','');diagnostics.append(legacyAside);
 const tools=make('div','');tools.append(feature,diagnostics);
 const ws=mountStudioWorkspace({main,initial:'files',title:'Planche de travail',subtitle:'Studio Core · Collection et prévisualisation',tabs:[
  {id:'tools',label:'Outils',icon:'✎',children:[tools]},
  {id:'files',label:'Fichiers',icon:'▣',children:[profile]},
  {id:'history',label:'Historique',icon:'◷',children:[history]},
  {id:'properties',label:'Propriétés',icon:'☷',children:[prop]},
  {id:'tasks',label:'Tâches',icon:'☑',children:[tasks]},
  {id:'search',label:'Recherche',icon:'⌕',children:[search]},
  {id:'settings',label:'Réglages',icon:'⚙',children:[settings]}
 ],storageKey:'nlab:core-lab:ux-v1'});
 // Core header stays native; avoid competing info/licence entries only on this opted-in Lab.
 const links=Array.from(document.querySelectorAll('.studioGlobalNav a'));
 const info=links.find(x=>x.getAttribute('href')?.endsWith('/Info/'));if(info)info.textContent='À propos';
 const duplicate=links.find(x=>x.getAttribute('href')?.includes('/Info/licenses.html'));if(duplicate)duplicate.hidden=true;
 // Use the actual shared Core ribbon, but order groups as in the UX reference.
 const coreRibbon=$('.studioRibbon'),toggle=$('#studioRibbonToggle');
 for(const key of ['core-acquisition','lab-file','core-history','lab-panels','core-command','lab-diagnostics']){const group=coreRibbon?.querySelector('[data-ribbon-group="'+key+'"]');if(group)coreRibbon.insertBefore(group,toggle)}
 // The accepted mockup has a dedicated menu line and a single compact ribbon row.
 // Keep every existing action binding: only rearrange the actual Core controls.
 document.body.dataset.navPlacement='separate';
 // The Core starts with the menu integrated in the header. Move the existing
 // DOM node (not a duplicate) into the canonical separate menu row.
 const menu=$('.studioMenu'),chromeRoot=$('#nlabStudioV2Chrome');
 if(menu&&chromeRoot&&coreRibbon){menu.classList.remove('studioMenuIntegrated');chromeRoot.insertBefore(menu,coreRibbon)}
 const createGroup=(id,caption)=>{const el=document.createElement('div');el.className='ribbonGroup scope-core';el.dataset.ribbonGroup=id;el.dataset.scope='core';const label=document.createElement('span');label.className='ribbonLabel';label.textContent=caption;el.append(label);return el};
 const proxy=(group,glyph,label,handler)=>{const b=document.createElement('button');b.type='button';b.className='labRibbonProxy';b.title=label;b.setAttribute('aria-label',label);const i=document.createElement('span');i.className='labRibbonGlyph';i.setAttribute('aria-hidden','true');i.textContent=glyph;const txt=document.createElement('span');txt.textContent=label;b.append(i,txt);b.addEventListener('click',handler);group.insertBefore(b,group.querySelector('.ribbonLabel'));return b};
 const selectionGroup=createGroup('lab-selection','Sélection');
 proxy(selectionGroup,'☑','Tout choisir',()=>collection.selectAll());
 proxy(selectionGroup,'□','Désélect.',()=>collection.clearSelection());
 proxy(selectionGroup,'⇄','Inverser',()=>$('#labInvertFiles').click());
 const anchorHistory=coreRibbon?.querySelector('[data-ribbon-group="core-history"]');
 coreRibbon?.insertBefore(selectionGroup,anchorHistory||toggle);
 const displayGroup=createGroup('lab-display','Affichage');
 for(const id of ['core-fullscreen','core-app-mode','core-responsive-test']){const button=coreRibbon?.querySelector('#'+id);if(button)displayGroup.insertBefore(button,displayGroup.querySelector('.ribbonLabel'))}
 proxy(displayGroup,'⚙','Réglages',()=>$('#studioCoreSettings')?.click());
 coreRibbon?.insertBefore(displayGroup,toggle);
 const ribbon=make('div','labToolbar uxWorkMainActions','');
 ribbon.append(picker);
 const upload=make('button','','▣ Dossier');upload.type='button';upload.title='Parcourir un dossier dans le sélecteur canonique';upload.addEventListener('click',()=>picker.click());ribbon.append(upload);
 const saveButton=make('button','','▣ Enregistrer');saveButton.id='uxSaveOpen';saveButton.type='button';ribbon.append(saveButton);
 const saveAsButton=make('button','','⇩ Enregistrer sous');saveAsButton.id='uxSaveAsOpen';saveAsButton.type='button';ribbon.append(saveAsButton);
 const viewBtn=make('button','','◉ Aperçu');viewBtn.type='button';viewBtn.id='uxTogglePreview';ribbon.append(viewBtn);
 ws.actions.append(ribbon);
 const heading=make('div','studioUxInfoRow','<div><strong>Collection de fichiers</strong><span> · Cliquer pour activer et cocher pour sélectionner</span></div><span id="uxCollectionCount">0 fichier</span>');
 ctrl.classList.add('uxCollectionToolbar');
 const groupLabel=document.createElement('label');groupLabel.textContent='Regrouper : ';
 const groupSelect=document.createElement('select');groupSelect.id='uxCollectionGrouping';
 for(const [value,label] of [['none','À plat'],['path','Dossier'],['type','Type'],['selected','Sélection']]){
  const opt=document.createElement('option');opt.value=value;opt.textContent=label;groupSelect.append(opt);
 }
 groupSelect.value=collection.groupBy;groupLabel.append(groupSelect);
 const centralFilter=document.createElement('input');centralFilter.id='uxCollectionFilter';centralFilter.type='search';centralFilter.placeholder='Nom, type, dossier…';centralFilter.setAttribute('aria-label','Filtrer la collection');
 const selectVisible=document.createElement('button');selectVisible.id='uxSelectVisibleMain';selectVisible.type='button';selectVisible.textContent='Choisir visibles';
 ctrl.append(groupLabel,centralFilter,selectVisible);
 groupSelect.addEventListener('change',()=>collection.setGroupBy(groupSelect.value));
 const collectionSide=make('div','studioUxCollectionSide');collectionSide.append(coll,collectionInfo);
 const preview=make('section','studioUxPreview','<header><strong>Aperçu de l’élément actif</strong><small id="uxPreviewType">Aucun fichier</small></header><div class="studioUxPreviewToolbar"><label>Afficher <select id="uxPreviewScope"><option value="active">Fichier actif</option><option value="selected">Sélection (en série)</option></select></label><button id="uxPreviewMinus" type="button">−</button><output id="uxPreviewZoom">100 %</output><button id="uxPreviewPlus" type="button">+</button><button id="uxPreviewFit" type="button">1:1</button><button id="uxPreviewLeft" type="button" title="Tourner à gauche">↶ 90°</button><button id="uxPreviewRight" type="button" title="Tourner à droite">↷ 90°</button></div><div class="studioUxPreviewCanvas" id="uxPreviewCanvas"><span class="labHint">Ajoutez ou sélectionnez un fichier.</span></div><footer>Aperçu uniquement : les fichiers sources ne sont pas modifiés.</footer>');
 const split=make('div','studioUxCollectionSplit');split.append(collectionSide,preview);
 ws.work.append(heading,ctrl,split,drop,acquiredInfo,filesNative);
 // Read-only import details in the file sidebar are always present for previous Lab APIs.
 $('#uxSideAdd').addEventListener('click',()=>picker.click());
 $('#uxSideFolder').addEventListener('click',()=>picker.click());
 $('#uxSideSamples').addEventListener('click',()=>{
   if(typeof appendFiles!=='function')return;
   const svg='<svg xmlns="http://www.w3.org/2000/svg" width="480" height="310"><rect width="480" height="310" fill="#e4f3ff"/><circle cx="350" cy="90" r="32" fill="#faca72"/><path d="M35 277 170 110 280 240 360 170 460 277" fill="#5ba084"/><text x="50" y="54" font-size="24" fill="#2574a9">Photo nLab</text></svg>';
   const files=[
    new File([svg],'Photo-echantillon.svg',{type:'image/svg+xml'}),
    new File(['Nom;Quantite\nExemple;3\nTest;7\n'],'Inventaire-tests.csv',{type:'text/csv'}),
    new File(['# Notes projet nLab\n- Import\n- Historique\n- Apercu'],'Notes-projet.md',{type:'text/markdown'}),
    new File(['Fichier de demonstration nLab'],'Document-demo.txt',{type:'text/plain'})
   ];
   const folders=['Images/Octobre/Photo-echantillon.svg','Inventaires/2026/Inventaire-tests.csv','Notes-projet.md','Documents/Document-demo.txt'];
   files.forEach((f,i)=>{f.__relativePath=folders[i]});
   appendFiles(files);
   $('#uxSideSamples').textContent='✓ Exemples chargés';
 });
 $('#uxSideImport')?.addEventListener('click',()=>picker.click());
 $('#uxFileAll').addEventListener('click',()=>collection.selectAll());
 $('#uxFileNone').addEventListener('click',()=>collection.clearSelection());
 $('#uxFileInvert').addEventListener('click',()=>$('#labInvertFiles').click());
 const renderSideFiles=()=>{
   const host=$('#uxSideFileList');host.replaceChildren();
   $('#uxSideFileCount').textContent=collection.items.length+' fichier(s)';
   $('#uxSideSelected').textContent=collection.selectedItems().length+' sélectionné(s)';
   for(const item of collection.items){
     const row=document.createElement('div');row.className='uxSideFileRow'+(collection.activeId===item.id?' active':'');
     const check=document.createElement('input');check.type='checkbox';check.checked=collection.selected.has(item.id);check.setAttribute('aria-label','Sélectionner '+item.label);
     check.addEventListener('change',()=>collection.select(item.id,check.checked));
     const button=document.createElement('button');button.type='button';button.className='uxSideFileName';button.textContent=item.label;button.title=item.relativePath||item.label;button.addEventListener('click',()=>collection.activate(item.id));
     const type=document.createElement('small');type.textContent=(item.extension||'fichier').toUpperCase();
     row.append(check,button,type);host.append(row);
   }
   if(!collection.items.length){const empty=document.createElement('p');empty.className='uxHistoryEmpty';empty.textContent='Aucun fichier importé.';host.append(empty)}
 };
 collection.addEventListener('selection',renderSideFiles);collection.addEventListener('activate',renderSideFiles);
 const previousSummary=collection.setItems.bind(collection);
 collection.setItems=(items)=>{const result=previousSummary(items);renderSideFiles();return result};
 $('#uxTogglePreview').addEventListener('click',()=>{preview.hidden=!preview.hidden;split.classList.toggle('uxPreviewHidden',preview.hidden)});
 const filter=$('#uxCollectionSearch');
 const filterCollection=()=>{const q=filter.value.trim().toLocaleLowerCase('fr');let n=0;coll.querySelectorAll('.collectionItem').forEach(el=>{const id=el.dataset.collectionId;const item=collection.items.find(x=>x.id===id);const ok=!q||[item?.label,item?.extension,item?.relativePath,item?.type].join(' ').toLocaleLowerCase('fr').includes(q);el.hidden=!ok;if(ok)n++});$('#uxSearchCount').textContent=n+' résultat(s)';};
 const observer=new MutationObserver(()=>{filterCollection();updateSummary()});
 observer.observe(coll,{childList:true,subtree:false});
 filter.addEventListener('input',()=>{centralFilter.value=filter.value;filterCollection()});
 centralFilter.addEventListener('input',()=>{filter.value=centralFilter.value;filterCollection()});
 selectVisible.addEventListener('click',()=>$('#uxSelectVisible').click());
 $('#uxSelectVisible').addEventListener('click',()=>{for(const el of coll.querySelectorAll('.collectionItem:not([hidden])'))collection.selected.add(el.dataset.collectionId);collection.render();collection.dispatchEvent(new CustomEvent('selection',{detail:collection.selectedItems()}))});
 let zoom=1;
 const previewUpdate=async()=>{
  const active=collection.active(),selected=collection.selectedItems(),items=$('#uxPreviewScope').value==='selected'?(selected.length?selected:active?[active]:[]):(active?[active]:[]);
  const target=$('#uxPreviewCanvas');target.replaceChildren();
  $('#uxPreviewType').textContent=active?.label||'Aucun fichier';
  if(!items.length){target.textContent='Aucun fichier actif.';return}
  for(const item of items.slice(0,30)){
   const box=make('div','uxPreviewItem'),img=document.createElement('img'),caption=make('span','');caption.textContent=item.label;box.append(img,caption);target.append(box);
   img.style.setProperty('--ux-rotation',(Number(item.meta?.rotation||0))+'deg');
   img.style.setProperty('--ux-preview-scale',String(zoom));
   try{const image=await thumbnailFor(item.data,{width:400,height:560});if(box.isConnected)img.src=image.url||''}catch{caption.textContent='Aperçu indisponible : '+item.label}
  }
 };
 const selectionUpdate=()=>{updateSummary();renderSideFiles();previewUpdate()};
 function updateSummary(){$('#uxCollectionCount').textContent=collection.items.length+' fichier(s) · '+collection.selectedItems().length+' sélectionné(s)';const count=$('#uxFilesCount');if(count)count.textContent=collection.items.length+' fichier(s)';}
 collection.addEventListener('selection',selectionUpdate);
 collection.addEventListener('activate',selectionUpdate);
 collection.addEventListener('rotate',selectionUpdate);
 $('#uxPreviewScope').addEventListener('change',previewUpdate);
 const zoomTo=x=>{zoom=Math.max(.25,Math.min(3,x));$('#uxPreviewZoom').textContent=Math.round(zoom*100)+' %';previewUpdate()};
 $('#uxPreviewPlus').addEventListener('click',()=>zoomTo(zoom+.25));$('#uxPreviewMinus').addEventListener('click',()=>zoomTo(zoom-.25));$('#uxPreviewFit').addEventListener('click',()=>zoomTo(1));
 $('#uxPreviewLeft').addEventListener('click',()=>{const a=collection.active();if(a)collection.rotate(a.id,-90)});
 $('#uxPreviewRight').addEventListener('click',()=>{const a=collection.active();if(a)collection.rotate(a.id,90)});
 // Both the compact sidebar and full history window share the existing Core activity store.
 historyView.render();

 // A theme choice is scoped to the workspace; Core settings remain authoritative elsewhere.
 $('#uxTheme').value=safeRead('nlab:core-lab:ux-theme','auto');
 const theme=()=>{const val=$('#uxTheme').value,night=val==='dark'||(val==='auto'&&matchMedia('(prefers-color-scheme: dark)').matches);main.dataset.uxTheme=night?'dark':'light';safeStore('nlab:core-lab:ux-theme',val)};
 $('#uxTheme').addEventListener('change',theme);theme();
 settings.querySelectorAll('[data-ux-device]').forEach(b=>b.addEventListener('click',()=>{const value=b.dataset.uxDevice;settings.querySelectorAll('[data-ux-device]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));if($('#labResponsiveLink'))window.open($('#labResponsiveLink').href,'_blank','noopener');$('#labSampleStatus').textContent='Test '+value+' ouvert dans Responsive Test Studio.'}));
 // Reuse existing canonical Core settings button. A duplicate panel is not created.
 const coreSettings=make('button','uxMiniButton','⚙ Réglages Core');coreSettings.addEventListener('click',()=>$('#studioCoreSettings')?.click());settings.prepend(coreSettings);
 // Core menu tabs map to content, not to parallel duplicate panels.
 document.addEventListener('studio-v2:menu',e=>{const target={home:'files',file:'files',edit:'properties',view:'settings',tools:'tools',diagnostic:'tools',acquisition:'files',specimen:'properties',validation:'tasks'}[e.detail?.tab];if(target)ws.switchTab(target)});
 const actions={
  'lab.ux-save':()=>showSave('save'),'lab.ux-save-as':()=>showSave('save-as'),
  'lab.ux-files':()=>ws.switchTab('files'),'lab.ux-history':()=>ws.switchTab('history'),
  'lab.ux-properties':()=>ws.switchTab('properties'),'lab.ux-settings':()=>ws.switchTab('settings'),
  'lab.ux-select-all':()=>collection.selectAll(),'lab.ux-invert':()=>$('#labInvertFiles').click()
 };
 document.addEventListener('studio-v2:action',e=>{actions[e.detail?.action]?.()});
 // Real shared template engine and OutputService, scoped to metadata not document conversion.
 const templates=new TemplateEngine({STUDIO:'studio-core-test'});
 const output=new OutputService();
 let counter=Number(safeRead(safeKey,'1'))||1,lastField=null,saveMode='save-as',directory=null,rememberedName='';
 const backdrop=make('div','uxSaveBackdrop');backdrop.hidden=true;
 const dialog=make('section','uxSaveDialog');dialog.id='uxSaveDialog';dialog.hidden=true;
 dialog.setAttribute('role','dialog');dialog.setAttribute('aria-modal','true');dialog.setAttribute('aria-label','Enregistrer sous');
 dialog.innerHTML='<header><div><strong id="uxSaveTitle">Enregistrer sous</strong><small>Contenu de démonstration · métadonnées uniquement</small></div><button type="button" id="uxSaveClose" aria-label="Fermer">×</button></header>'+
  '<details open><summary>01 · Destination</summary><div class="uxSaveFields"><label>Mode<select id="uxSaveDestination"><option value="download">Téléchargement classique</option><option value="save-as">Enregistrer sous…</option><option value="folder">Dans un dossier choisi</option></select></label><button id="uxSaveChooseFolder" type="button">Choisir un dossier…</button><small id="uxSaveFolderStatus">Aucun dossier autorisé · le téléchargement reste disponible.</small></div></details>'+
  '<details open><summary>02 · Contenu et format</summary><div class="uxSaveFields"><label>Contenu<select id="uxSaveContent"><option value="collection">Métadonnées de la collection</option><option value="selection">Métadonnées de la sélection</option><option value="session">Session de démonstration</option></select></label><label>Format<select id="uxSaveFormat"><option value="json">JSON (défaut)</option><option value="csv">CSV</option><option value="txt">TXT</option></select></label></div></details>'+
  '<details open><summary>03 · Modèle de nommage</summary><div class="uxSaveFields"><label>Modèle<select id="uxSavePreset"><option value="simple">Nom simple</option><option value="dated">Nom + date</option><option value="counter">Nom + compteur</option><option value="custom">Personnalisé</option></select></label><label>Nom de sortie<input id="uxSavePattern" value="{STUDIO}_{FILENAME}_{DATE:YYYYMMDD}_{COUNTER}"></label><strong>Variables PDF Studio · cliquer pour copier, + pour insérer et ? pour l’aide</strong><div class="uxTokenList" id="uxSaveTokens"></div><div class="uxTokenDetails" id="uxSaveTokenHelp" aria-live="polite">Cliquer sur ? pour voir la définition et la valeur actuelle.</div></div></details>'+
  '<details open><summary>04 · Classement dans les dossiers</summary><div class="uxSaveFields"><label>Classement<select id="uxSavePathPreset"><option value="root">Racine</option><option value="year-month">Année / Mois</option><option value="year-month-day">Année / Mois / Jour</option><option value="custom">Personnalisé</option></select></label><label>Modèle de chemin<input id="uxSavePath" value="{STUDIO}/{YEAR}/{MONTH}/{DAY}"></label><small>Les sous-dossiers sont créés uniquement si une autorisation de dossier est accordée dans le navigateur.</small></div></details>'+
  '<div class="uxSavePreview" id="uxSavePreview" aria-live="polite"></div><p id="uxSaveStatus" class="labHint" role="status"></p><footer class="uxSaveFooter"><button type="button" id="uxSaveCancel">Annuler</button><button class="uxSavePrimary" type="button" id="uxSaveConfirm">Enregistrer</button></footer>';
 main.append(backdrop,dialog);
 const ctx=()=>{const a=collection.active(),name=a?.label||'collection.txt',path=a?.relativePath||name;return{name,values:{STUDIO:'studio-core-test',FOLDER:path.includes('/')?path.split('/').slice(0,-1).join('/'):'',RELATIVE_PATH:path,INDEX:String(Math.max(1,collection.items.indexOf(a)+1)),SELECTED_COUNT:String(collection.selectedItems().length),COUNTER:String(counter).padStart(3,'0'),NUMBER:String(counter),FORMAT:$('#uxSaveFormat').value,NOM:name.replace(/\.[^.]+$/,'')}}};
 const resolved=()=>{const {name,values}=ctx();const format=$('#uxSaveFormat').value;
  const raw=templates.resolve($('#uxSavePattern').value||'{FILENAME}',name,values);
  const file=safePart(raw||'collection')+'.'+format;
  const parts=templates.resolve($('#uxSavePath').value||'',name,values).split(/[\\/]+/).map(safePart).filter(x=>x&&x!=='.'&&x!=='..');
  return{file,parts,format,path:[...parts,file].join('/')}};
 const previewName=()=>{const x=resolved();$('#uxSavePreview').textContent='Nom : '+x.file+'\nClassement : '+(x.parts.join('/')||'(racine)')+'\nChemin prévu : '+x.path+'\nDestination : '+($('#uxSaveDestination').value==='folder'&&directory?directory.name:'Téléchargements du navigateur');return x};
 function showSave(mode='save-as'){saveMode=mode;$('#uxSaveTitle').textContent=mode==='save'?'Enregistrer':'Enregistrer sous…';$('#uxSaveDestination').value=mode==='save'?'download':'save-as';dialog.hidden=false;backdrop.hidden=false;$('#uxSaveStatus').textContent='';previewName();$('#uxSavePattern').focus()}
 const closeSave=()=>{dialog.hidden=true;backdrop.hidden=true};
 $('#uxSaveOpen').addEventListener('click',()=>showSave('save'));$('#uxSaveAsOpen').addEventListener('click',()=>showSave('save-as'));
 $('#uxSaveClose').addEventListener('click',closeSave);$('#uxSaveCancel').addEventListener('click',closeSave);backdrop.addEventListener('click',closeSave);
 const presets={simple:'{FILENAME}',dated:'{FILENAME}_{DATE:YYYYMMDD}',counter:'{FILENAME}_{COUNTER}'};
 $('#uxSavePreset').addEventListener('change',()=>{const v=$('#uxSavePreset').value;if(presets[v])$('#uxSavePattern').value=presets[v];previewName()});
 const paths={root:'', 'year-month':'{YEAR}/{MONTH}','year-month-day':'{YEAR}/{MONTH}/{DAY}'};
 $('#uxSavePathPreset').addEventListener('change',()=>{const v=$('#uxSavePathPreset').value;if(v in paths)$('#uxSavePath').value=paths[v];previewName()});
 for(const id of ['uxSavePattern','uxSavePath']){$('#'+id).addEventListener('focus',e=>lastField=e.target);$('#'+id).addEventListener('input',()=>{if(id==='uxSavePattern')$('#uxSavePreset').value='custom';else $('#uxSavePathPreset').value='custom';previewName()})}
 for(const id of ['uxSaveFormat','uxSaveDestination','uxSaveContent'])$('#'+id).addEventListener('change',previewName);
 const variables=[{name:'STUDIO',description:'Identifiant du Studio'},{name:'COUNTER',description:'Numéro incrémental sur trois chiffres'},{name:'NUMBER',description:'Numéro incrémental sans zéros'},{name:'FORMAT',description:'Format d’export'},{name:'NOM',description:'Nom du document sans extension'},...templateVariableHelp()];
 for(const entry of variables){const wrap=make('span','uxToken'),copy=make('button','', '{'+entry.name+'}'),insert=make('button','','+'),help=make('button','uxTokenHelp','?');copy.type=insert.type=help.type='button';for(const b of [copy,insert,help])b.title=entry.description;
  copy.addEventListener('click',async()=>{const token='{'+entry.name+'}';try{await navigator.clipboard.writeText(token);$('#uxSaveStatus').textContent='Copié : '+token}catch{insertToken(token)}});
  function insertToken(token){const field=lastField&&dialog.contains(lastField)?lastField:$('#uxSavePattern');const a=field.selectionStart??field.value.length,b=field.selectionEnd??a;field.setRangeText(token,a,b,'end');field.focus();previewName()}
  insert.addEventListener('click',()=>insertToken('{'+entry.name+'}'));
  help.addEventListener('click',()=>{const c=ctx(),example=templates.resolve('{'+entry.name+'}',c.name,c.values);$('#uxSaveTokenHelp').textContent='{'+entry.name+'} — '+entry.description+' · Exemple : '+example});
  wrap.append(copy,insert,help);$('#uxSaveTokens').append(wrap);
 }
 for(const example of ['DATE:YYYY-MM-DD','DATE:YYYYMMDD_HHmmss']){const chip=make('span','uxToken'),b=make('button','', '{'+example+'}'),h=make('button','uxTokenHelp','?');b.title='Insérer une date formatée';b.addEventListener('click',()=>{const field=lastField&&dialog.contains(lastField)?lastField:$('#uxSavePattern');field.setRangeText('{'+example+'}',field.selectionStart,field.selectionEnd,'end');previewName()});h.addEventListener('click',()=>{$('#uxSaveTokenHelp').textContent='{'+example+'} — Date paramétrable : YYYY année, MM mois, DD jour, HH heure, mm minutes, ss secondes. Exemple : '+templates.resolve('{'+example+'}',ctx().name,ctx().values)});chip.append(b,h);$('#uxSaveTokens').append(chip)}
 $('#uxSaveChooseFolder').addEventListener('click',async()=>{try{directory=await output.chooseDirectory();$('#uxSaveFolderStatus').textContent='Dossier sélectionné : '+directory.name;$('#uxSaveDestination').value='folder'}catch(e){$('#uxSaveFolderStatus').textContent='Sélection impossible : '+(e.message||e)}previewName()});
 function payload(){const chosen=$('#uxSaveContent').value;const items=chosen==='selection'?collection.selectedItems():collection.items;
  const files=items.map(x=>({name:x.label,type:x.type||x.extension,size:x.size,relativePath:x.relativePath||'',rotationPreview:x.meta?.rotation||0}));
  return chosen==='session'?{kind:'core-test-session',version:'0.4.0',date:new Date().toISOString(),sample:{name:$('#labItemName').value,description:$('#labItemDescription').value},files}:files}
 function serialize(data,format){if(format==='json')return JSON.stringify(data,null,2);
  const rows=Array.isArray(data)?data:data.files||[];
  if(format==='csv'){const cols=['name','type','size','relativePath','rotationPreview'];return [cols.map(csv).join(';'),...rows.map(row=>cols.map(k=>csv(row[k])).join(';'))].join('\n')}
  return (Array.isArray(data)?data:data.files||[]).map(x=>x.name+' · '+x.type+' · '+x.size+' octets · '+x.rotationPreview+'° (aperçu)').join('\n')}
 $('#uxSaveConfirm').addEventListener('click',async()=>{const x=previewName(),data=serialize(payload(),x.format),blob=new Blob([data],{type:MIME[x.format]||'text/plain'}),dest=$('#uxSaveDestination').value;
  try{
   if(dest==='folder'){if(!directory)throw Error('Choisir d’abord un dossier cible.');await output.saveBlob(blob,x.file,{parts:x.parts})}
   else if(dest==='save-as'&&window.showSaveFilePicker){const handle=await showSaveFilePicker({suggestedName:x.file,types:[{description:x.format.toUpperCase(),accept:{[MIME[x.format]]:['.'+x.format]}}]});const stream=await handle.createWritable();await stream.write(blob);await stream.close();rememberedName=x.file}
   else{const downloader=new OutputService();await downloader.saveBlob(blob,x.file);rememberedName=x.file}
   counter++;safeStore(safeKey,counter);recordHistory({studio:'studio-core-test',type:'file',label:'Export des métadonnées '+x.format.toUpperCase(),target:x.path});
   $('#uxSaveStatus').textContent='Enregistrement demandé : '+x.file+' · '+(dest==='folder'?'dossier':'navigateur');previewName();
  }catch(e){$('#uxSaveStatus').textContent=e.name==='AbortError'?'Enregistrement annulé.':'Enregistrement impossible : '+(e.message||e)}
 });
 // Mount diagnostics continue to use the real Core services and their original element IDs.
 updateSummary();renderSideFiles();previewUpdate();
 return{workspace:ws,historyView,showSave,previewUpdate,updateSummary,filterCollection};
}
