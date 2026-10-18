// PDF Studio 2.12.0 TEST — the validated Studio UX adopted by an actual PDF engine.
// This adapter relocates existing DOM nodes; it never recreates the PDF controls,
// their listeners, the document engine, or the real output and template services.
import '../v2/pdf-v2.js';
import {mountStudioWorkspace} from '../../_shared/studio-v2/workspace-layout.js';
import {createHistorySidebar} from '../../_shared/studio-v2/history-sidebar.js';
import {loadStudioSettings} from '../../_shared/studio-v2/settings.js';
const $=s=>document.querySelector(s);
const el=(tag,cls='',text='')=>{const n=document.createElement(tag);if(cls)n.className=cls;if(text)n.textContent=text;return n};
const button=(label,action,cls='')=>{const b=el('button',cls,label);b.type='button';b.addEventListener('click',action);return b};
const source=$('#studioMain'),oldSidebar=$('#studioSidebar'),viewer=source?.querySelector('.viewer'),collection=$('#fileCollection');
const pdf=window.__NLAB_PDF_STUDIO__;
if(!source||!oldSidebar||!viewer||!collection||!pdf?.fileBrowser||!pdf?.engine)throw Error('PDF Studio UX TEST : moteur V2 non initialisé.');
const browser=pdf.fileBrowser;
document.documentElement.dataset.pdfUxReady='mounting';
// Detach the original, fully wired DOM before the shared workspace creates its shell.
collection.remove();viewer.remove();oldSidebar.remove();
const tools=el('div','pdfUxTools');tools.append(oldSidebar);
const fileSide=el('div','pdfUxFileSide');
const fileHeading=el('div','uxHistoryEyebrow','Collection active');
const fileCounters=el('p','uxHistoryCounters','Aucun fichier');
const fileActions=el('div','pdfUxFileActions');
fileActions.append(
 button('↥ Ajouter des fichiers',()=>$('#pickFile').click(),'pdfUxPrimary'),
 button('▱ Dossier',()=>$('#pickFolder').click())
);
const fileList=el('div','pdfUxFileList');fileList.id='pdfUxFileList';fileList.setAttribute('role','list');
const sideSelect=el('div','pdfUxFileActions');
sideSelect.append(button('Tout',()=>browser.selectAll()),button('Aucun',()=>browser.clearSelection()),button('Inverser',()=>{
 const prior=new Set(browser.selected);browser.selected=new Set(browser.items.filter(x=>!prior.has(x.id)).map(x=>x.id));
 browser.dispatchEvent(new CustomEvent('selection',{detail:browser.selectedItems()}));browser.render()
}));
const fileDetails=el('details','uxHistoryAccordion');fileDetails.open=true;
const fileSummary=el('summary','','Fichiers de la collection');fileDetails.append(fileSummary,fileList);
fileSide.append(fileHeading,fileCounters,fileActions,fileDetails,sideSelect);
const history=createHistorySidebar({studio:'pdf-studio'});
const props=el('div','pdfUxProperties');
const propsText=el('div','uxCard','Aucun document actif.');
const openTools=(tab='tools')=>{ws.switchTab('tools');const b=$('[data-sidebar-tab="'+tab+'"]');b?.click()};
props.append(el('div','uxHistoryEyebrow','Document actif'),propsText,button('↗ Propriétés et aide PDF',()=>openTools('properties')));
const tasks=el('div','pdfUxShortcuts');
tasks.append(el('div','uxHistoryEyebrow','Tâches et workflows'),button('Ouvrir les tâches PDF',()=>openTools('tasks')),button('Catalogue des outils PDF',()=>openTools('tools')));
const search=el('div','pdfUxShortcuts');
const functionsSearch=el('input');functionsSearch.type='search';functionsSearch.placeholder='Rechercher dans les fonctions PDF…';functionsSearch.setAttribute('aria-label','Rechercher un outil PDF');
search.append(el('div','uxHistoryEyebrow','Recherche'),functionsSearch,button('Rechercher dans le Studio',()=>{openTools('search');const native=$('#functionSearchInput');if(native){native.value=functionsSearch.value;native.dispatchEvent(new Event('input',{bubbles:true}));native.focus()}}));
const settings=el('div','pdfUxShortcuts');
settings.append(el('div','uxHistoryEyebrow','Préférences'),button('⚙ Paramètres du Studio Core',()=>$('#studioCoreSettings')?.click()),button('↗ Fenêtres PDF',()=>openTools('tools')));
const themeSelect=el('select');themeSelect.id='pdfUxTheme';themeSelect.setAttribute('aria-label','Thème visuel');
for(const [value,label]of [['auto','Automatique'],['light','Clair'],['dark','Sombre']]){const opt=el('option','',label);opt.value=value;themeSelect.append(opt)}
const storedTheme=()=>{try{return localStorage.getItem('nlab:pdf-ux:theme')||'auto'}catch{return'auto'}};
themeSelect.value=storedTheme();
const applyTheme=()=>{const val=themeSelect.value,dark=val==='dark'||(val==='auto'&&matchMedia('(prefers-color-scheme: dark)').matches);source.dataset.uxTheme=dark?'dark':'light';try{localStorage.setItem('nlab:pdf-ux:theme',val)}catch{}};
themeSelect.addEventListener('change',applyTheme);settings.append(el('label','pdfUxLabel','Thème'),themeSelect);
const ws=mountStudioWorkspace({main:source,title:'Planche de travail PDF',subtitle:'Collection de fichiers · aperçu et édition réels',initial:'files',storageKey:'nlab:pdf-studio:ux-2.12',tabs:[
 {id:'tools',label:'Outils',icon:'✎',children:[tools]},
 {id:'files',label:'Fichiers',icon:'▣',children:[fileSide]},
 {id:'history',label:'Historique',icon:'◷',children:[history.element]},
 {id:'properties',label:'Propriétés',icon:'☷',children:[props]},
 {id:'tasks',label:'Tâches',icon:'☑',children:[tasks]},
 {id:'search',label:'Recherche',icon:'⌕',children:[search]},
 {id:'settings',label:'Réglages',icon:'⚙',children:[settings]}
]});
applyTheme();
const chromeMenu=$('.studioMenu'),coreRibbon=$('.studioRibbon'),chrome=$('#nlabStudioV2Chrome');
document.body.dataset.navPlacement='separate';
if(chromeMenu&&chrome&&coreRibbon){chromeMenu.classList.remove('studioMenuIntegrated');chrome.insertBefore(chromeMenu,coreRibbon)}
const workHeader=el('div','pdfUxSectionHeading','Collection de fichiers');
const workActions=el('div','pdfUxWorkActions');
workActions.append(button('↥ Fichier',()=>$('#pickFile').click()),button('▱ Dossier',()=>$('#pickFolder').click()),button('↶ Annuler',()=>$('#history-undo')?.click()),button('↷ Rétablir',()=>$('#history-redo')?.click()));
const save=button('▣ Enregistrer',()=>$('#savePdfSide').click(),'pdfUxPrimary');
const saveAs=button('⇩ Enregistrer sous',()=>openSaveDialog());
const classify=button('↳ Classer',()=>openSaveDialog());
ws.actions.append(workActions,save,saveAs,classify);
const workSurface=el('div','pdfUxWorkSurface');
const workFiles=el('section','pdfUxCollection');
const toolbar=el('div','pdfUxCollectionToolbar');
const view=el('select');view.id='pdfUxView';view.setAttribute('aria-label','Affichage de la collection');
for(const [value,label]of [['list','Liste'],['grid','Grille'],['thumbs','Vignettes']]){let opt=el('option','',label);opt.value=value;view.append(opt)}
const sort=el('select');sort.id='pdfUxSort';sort.setAttribute('aria-label','Trier la collection');
for(const [value,label]of [['name','Nom'],['type','Type'],['size','Taille'],['path','Dossier']]){let opt=el('option','',label);opt.value=value;sort.append(opt)}
const grouping=el('select');grouping.id='pdfUxGrouping';grouping.setAttribute('aria-label','Regrouper la collection');
for(const [value,label]of [['none','À plat'],['path','Dossier'],['type','Type'],['selected','Sélection']]){let opt=el('option','',label);opt.value=value;grouping.append(opt)}
const zoomLabel=el('output','','Auto');zoomLabel.id='pdfUxThumbValue';
const searchFiles=el('input');searchFiles.id='pdfUxFilter';searchFiles.type='search';searchFiles.placeholder='Filtrer les fichiers…';searchFiles.setAttribute('aria-label','Filtrer la collection');
toolbar.append(view,sort,grouping,button('−',()=>zoom(-24)),zoomLabel,button('+',()=>zoom(24)),button('↔ Auto',()=>{browser.setThumbnailSize('auto');syncControls()}),button('Tout',()=>browser.selectAll()),button('⇄',()=>sideSelect.lastElementChild.click()),searchFiles);
const detailsLine=el('p','pdfUxCount','Aucun fichier');
const drop=$('#inputDropZone'); // Native Core dropzone remains wired under Outils PDF.
const dropButton=button('↥ Déposer ici ou choisir un fichier / dossier',()=>$('#pickFile').click(),'pdfUxDrop');
workFiles.append(toolbar,collection,detailsLine,dropButton);
viewer.classList.add('pdfUxViewer');
workSurface.append(workFiles,viewer);
ws.work.append(workHeader,workSurface);
dropButton.addEventListener('dragover',e=>{e.preventDefault();dropButton.classList.add('dragging')});
dropButton.addEventListener('dragleave',()=>dropButton.classList.remove('dragging'));
dropButton.addEventListener('drop',e=>{
 e.preventDefault();dropButton.classList.remove('dragging');
 if(e.dataTransfer?.files?.length){
  const input=$('#fileInput');
  if(input){try{input.files=e.dataTransfer.files;input.dispatchEvent(new Event('change',{bubbles:true}))}catch{drop?.dispatchEvent(new DragEvent('drop',{bubbles:true,dataTransfer:e.dataTransfer}))}}
 }
});
// Use the same CollectionBrowser instance that PDF Studio owns: no parallel file model.
browser.setView('thumbs');browser.setThumbnailSize('auto');
if('ResizeObserver'in window){const resize=new ResizeObserver(()=>browser.updateThumbnailSizing());resize.observe(collection)}
function zoom(delta){
 const width=collection.clientWidth||240,auto=Number.parseInt(collection.style.getPropertyValue('--nlab-collection-card-width'),10)||Math.min(width,180);
 const current=browser.thumbnailSize==='auto'?auto:Number(browser.thumbnailSize)||auto;
 browser.setThumbnailSize(current+delta);syncControls()
}
const matches=x=>{const q=searchFiles.value.trim().toLocaleLowerCase('fr');return !q||[x.label,x.relativePath,x.extension,x.type].join(' ').toLocaleLowerCase('fr').includes(q)};
function applyFileFilter(){let count=0;collection.querySelectorAll('.collectionItem').forEach(card=>{const item=browser.items.find(x=>x.id===card.dataset.collectionId);const visible=!!item&&matches(item);card.hidden=!visible;if(visible)count++});return count}
function syncControls(){
 view.value=browser.view;sort.value=browser.sortMode;grouping.value=browser.groupBy;
 zoomLabel.textContent=browser.thumbnailSize==='auto'?'Auto':browser.thumbnailSize+' px';
 const a=browser.active();fileCounters.textContent=browser.items.length+' fichier(s) · '+browser.selected.size+' sélectionné(s)';
 detailsLine.textContent=browser.items.length+' fichier(s) · '+applyFileFilter()+' affiché(s) · actif : '+(a?.label||'aucun');
 propsText.textContent=a?('Fichier : '+a.label+' · '+(a.extension||'').toUpperCase()+' · '+a.size+' octets · '+(a.relativePath||'racine')):'Aucun document actif.';
}
function syncFileList(){
 fileList.replaceChildren();
 for(const item of browser.items){
  const row=el('div','pdfUxFileRow'+(browser.activeId===item.id?' active':''));row.setAttribute('role','listitem');
  const cb=el('input');cb.type='checkbox';cb.checked=browser.selected.has(item.id);cb.setAttribute('aria-label','Sélectionner '+item.label);
  cb.addEventListener('change',()=>browser.select(item.id,cb.checked));
  const b=button(item.label,()=>browser.activate(item.id));b.title=item.relativePath||item.label;
  const type=el('small','',item.extension?.toUpperCase()||'—');row.append(cb,b,type);fileList.append(row);
 }
 if(!browser.items.length)fileList.append(el('p','uxHistoryEmpty','Aucun fichier. Ajoutez un PDF, une image ou un document.'));
 syncControls()
}
view.addEventListener('change',()=>{browser.setView(view.value);$('#fileCollectionView').value=view.value;syncControls()});
sort.addEventListener('change',()=>{browser.setSort(sort.value,browser.sortDirection);$('#fileSort').value=sort.value;syncControls()});
grouping.addEventListener('change',()=>{browser.setGroupBy(grouping.value);$('#fileGroupBy').value=grouping.value;syncControls()});
searchFiles.addEventListener('input',syncControls);
browser.addEventListener('selection',syncFileList);
browser.addEventListener('activate',syncFileList);
browser.addEventListener('rotate',syncFileList);
browser.addEventListener('thumbnail-size',syncControls);
const nativeRender=browser.render.bind(browser);
browser.render=()=>{nativeRender();syncFileList()};
syncFileList();
history.render();
// A real Save As panel, with existing PDF Studio naming/format/classification controls.
const backdrop=el('div','pdfUxSaveBackdrop');backdrop.hidden=true;
const dialog=el('section','pdfUxSaveDialog');dialog.hidden=true;dialog.id='pdfUxSaveDialog';dialog.setAttribute('role','dialog');dialog.setAttribute('aria-modal','true');dialog.setAttribute('aria-label','Enregistrer sous · PDF Studio');
const heading=el('header');heading.append(el('div','','Enregistrer sous · PDF Studio 2.12 TEST'),button('✕ Fermer',closeSave));
const fields=el('div','pdfUxSaveFields');
const actions=el('footer','pdfUxSaveFooter');
actions.append(button('Annuler',closeSave),button('Enregistrer PDF',()=>$('#savePdfSide').click(),'pdfUxPrimary'),button('Enregistrer sous…',()=>$('#saveAs').click(),'pdfUxPrimary'),button('Enregistrer + classer',()=>$('#saveAndClassify').click()));
dialog.append(heading,el('p','pdfUxSaveNote','Les modèles, variables, formats, destinations et classements sont ceux du véritable moteur PDF Studio ; aucune sortie de démonstration.'),fields,actions);
document.body.append(backdrop,dialog);
const locations=new Map();
function openSaveDialog(){
 if(!dialog.hidden)return;
 for(const id of ['sectionOutput','sectionNaming']){
  const node=$('#'+id);
  if(node){locations.set(node,{parent:node.parentNode,next:node.nextSibling});node.open=true;fields.append(node)}
 }
 backdrop.hidden=false;dialog.hidden=false;dialog.scrollTop=0;
}
function closeSave(){
 if(dialog.hidden)return;
 for(const [node,{parent,next}]of locations){if(parent){if(next?.parentNode===parent)parent.insertBefore(node,next);else parent.append(node)}}
 locations.clear();dialog.hidden=true;backdrop.hidden=true;
}
backdrop.addEventListener('click',closeSave);
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!dialog.hidden)closeSave()});
// Existing menu actions still execute their original handlers.
document.addEventListener('studio-v2:menu',e=>{
 if(e.detail?.tab==='history')ws.switchTab('history');
 else if(e.detail?.tab==='file')ws.switchTab('files');
 else if(e.detail?.tab==='tools')ws.switchTab('tools');
});
window.NLabPdfUxPilot={workspace:ws,browser,history,openSaveDialog,version:'2.12.0'};
document.documentElement.dataset.pdfUxReady='1';
