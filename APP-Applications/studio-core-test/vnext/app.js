import {createCoreAdapter} from './core-adapter.js';
import {mountStudioRibbonTabs} from '../../_shared/studio-v2/core.js';
import {openInputPicker} from '../../_shared/studio-v2/input-picker.js';
import {createHistorySidebar} from '../../_shared/studio-v2/history-sidebar.js';
import {registerCommand,executeCommand} from '../../_shared/studio-v2/command-registry.js';
import {mountCommandPalette} from '../../_shared/studio-v2/command-palette.js';
import {mountPropertyInspector} from '../../_shared/studio-v2/property-inspector.js';
import {mountViewerControls} from '../../_shared/studio-v2/viewer-control.js';
import {icon as sharedIcon} from '../../_shared/studio-v2/icon-registry.js';
import {loadStudioSettings,saveStudioSettings,applyStudioSettings,renderStudioSettingsPanel,syncStudioSettingsPanel} from '../../_shared/studio-v2/settings.js';
import {createFullscreenController} from '../../_shared/studio-v2/fullscreen-service.js';
import {enhanceStudioWindow,showStudioWindow,hideStudioWindow} from '../../_shared/studio-v2/window-system.js';
import {mountStudioSidebarControls} from '../../_shared/studio-v2/sidebar-controller.js';
import {mountStudioHoverHelp} from '../../_shared/studio-v2/help.js';
import {mountAdvancedOutputUI} from '../../_shared/studio-v2/advanced-output-ui.js';
import {mountStudioViewModes} from '../../_shared/studio-v2/view-modes.js';
import {mountDropZone} from '../../_shared/studio-v2/drop-zone.js';
import {createColorPicker} from '../../_shared/studio-v2/color-control.js';
import {createStudioDatePicker} from '../../_shared/studio-v2/date-control.js';
import {mountShareMenu,notifyUi} from '../../_shared/nlab-share-menu.js';
// VNext graphical shell: the existing Core services, one command registry and shared panels.
const $=s=>document.querySelector(s),$$=s=>Array.from(document.querySelectorAll(s));
const key='nlab:core-vnext:ui:v1';
let state={panel:'files',work:true,preview:true,files:[]};
try{const saved=JSON.parse(localStorage.getItem(key)||'{}');for(const k of ['panel','work','preview'])if(Object.hasOwn(saved,k))state[k]=saved[k]}catch{}
const persist=()=>{try{const {files,...preferences}=state;localStorage.setItem(key,JSON.stringify(preferences))}catch{}};
// One-time migration of TEST-only preferences into the existing Core settings store.
try{
 const legacy=JSON.parse(localStorage.getItem(key)||'{}');
 if(!localStorage.getItem('nlab-studio-v2-settings')){
  const migrated={};
  if(['auto','dark','light'].includes(legacy.theme))migrated.theme=legacy.theme==='auto'?'system':legacy.theme;
  if(Number.isFinite(Number(legacy.width)))migrated.sidebarWidth=Math.max(220,Number(legacy.width));
  if(typeof legacy.locked==='boolean')migrated.sidebarLocked=legacy.locked;
  if(legacy.sidebar===false)migrated.sidebarMode='hidden';
  if(Object.keys(migrated).length)saveStudioSettings(migrated);
 }
 if(typeof legacy.ribbon==='boolean'&&localStorage.getItem('nlab-studio-v2-ribbon-collapsed')===null){
  localStorage.setItem('nlab-studio-v2-ribbon-collapsed',legacy.ribbon?'0':'1');
 }
}catch{}
applyStudioSettings();
const currentPrefs=()=>loadStudioSettings();
const ribbonVisible=()=>{try{return localStorage.getItem('nlab-studio-v2-ribbon-collapsed')!=='1'}catch{return true}};
const setRibbonVisible=visible=>{try{localStorage.setItem('nlab-studio-v2-ribbon-collapsed',visible?'0':'1')}catch{}};
const themeChoice=()=>currentPrefs().theme==='system'?'auto':currentPrefs().theme;
const syncCoreAppearance=()=>{
 const dark=document.body.classList.contains('themeDark');
 document.body.classList.toggle('dark',dark);
 const input=$('#themeHeader');if(input)input.value=themeChoice();
};
let coreSettingsHost;
let studioToolsHost;
let adapter;
let sidebarController;
const inform=message=>notifyUi($('#uiNotice'),message);
const runAction=async cmd=>{
 if(cmd==='import'){
  try{
   const files=await openInputPicker({multiple:true,folders:true,url:true,expandZip:true,view:'icon',preserveSession:false});
   if(files?.length)adapter.addFiles(files);
  }catch(error){inform(error.message||'Import impossible')}
  return;
 }
 if(cmd==='save'){
  try{const result=await adapter.saveSelected();inform('Enregistré : '+result.name)}
  catch(error){inform(error.message||'Enregistrement impossible')}return;
 }
 if(cmd==='save-advanced'){openAdvancedSave();return}
 if(cmd==='save-as'){
  const selected=adapter.selectedFiles()[0];
  if(!selected){inform('Sélectionnez un fichier avant Enregistrer sous');return}
  $('#saveAsName').value=selected.name;
  $('#saveAsDialog').showModal();return;
 }
 if(cmd==='undo'){try{await adapter.undo()}catch(error){inform(error.message)}return}
 if(cmd==='redo'){try{await adapter.redo()}catch(error){inform(error.message)}return}
 if(cmd==='select-all'){adapter.collection.selectAll();return}
 if(cmd==='remove-files'){adapter.removeSelected();return}
 if(cmd==='clear-files'){adapter.clear();return}
 if(cmd==='toggle-work')state.work=!state.work;
 if(cmd==='toggle-preview')state.preview=!state.preview;
 if(cmd==='collapse'){sidebarController.close();return}
 if(cmd==='lock'){sidebarController.toggleLock();return}
 if(cmd==='commands'){document.dispatchEvent(new Event('studio-v2:open-command-palette'));return}
 if(cmd==='properties'){document.dispatchEvent(new Event('studio-v2:open-properties'));return}
 if(cmd==='show-properties'){openPanel('properties');return}
 if(cmd==='show-settings'){openPanel('settings');return}
 if(cmd==='show-profile'){openPanel('profile');return}
 if(cmd==='windows'){openWindow();return}
 if(cmd==='float-panel'){openFloatingPanel(state.panel);return}
 persist();render();
};
// All menu/ribbon/side-panel actions are registered once with the existing Core registry.
const coreActions={
 import:'Importer',save:'Enregistrer','save-as':'Enregistrer sous','save-advanced':'Enregistrer et classer',
 undo:'Annuler',redo:'Rétablir','select-all':'Tout sélectionner',
 'remove-files':'Retirer les fichiers','clear-files':'Vider la collection',
 'toggle-work':'Afficher ou masquer la planche','toggle-preview':'Afficher ou masquer l’aperçu','collapse':'Masquer le panneau',
 lock:'Verrouiller le panneau',windows:'Fenêtres',commands:'Palette de commandes',properties:'Propriétés du fichier',
 'show-properties':'Panneau Propriétés','show-settings':'Panneau Réglages Core',
 'show-profile':'Profil personnel nLab',
 'float-panel':'Détacher le panneau'
};

const coreActionHelp={
 import:'Ouvre le sélecteur partagé du Core pour importer des fichiers, dossiers, ZIP ou une URL.',
 save:'Enregistre le fichier sélectionné dans son format d’origine, sans conversion.',
 'save-as':'Enregistre une copie du fichier actif sous le nom de votre choix.',
 'save-advanced':'Enregistre avec un modèle de renommage, vos variables personnelles et des sous-dossiers créés dans la destination choisie.',
 undo:'Annule la dernière modification de la collection dans la pile d’historique commune.',
 redo:'Rétablit la dernière modification annulée.',
 'select-all':'Sélectionne tous les fichiers actuellement présents dans la collection.',
 'remove-files':'Retire les fichiers sélectionnés de la collection, sans effacer les fichiers sources.',
 'clear-files':'Vide la collection de travail sans supprimer les fichiers de votre ordinateur.',
 'toggle-work':'Affiche ou masque la planche de travail, sans perdre les fichiers ouverts.',
 'toggle-preview':'Affiche ou masque le volet de prévisualisation sans fermer le fichier actif. Le réglage est mémorisé.',
 collapse:'Replie le panneau latéral ; la flèche dans la barre reste disponible pour le rouvrir.',
 lock:'Empêche ou autorise le redimensionnement du panneau latéral.',
 windows:'Ouvre le gestionnaire de fenêtres pour les déplacer, ancrer et minimiser.',
 commands:'Recherche une commande du Studio et permet de l’exécuter au clavier (Ctrl+K).',
 properties:'Affiche les propriétés du fichier actif dans l’inspecteur partagé du Core.',
 'show-properties':'Affiche le panneau Propriétés dans le volet latéral.',
 'show-settings':'Affiche les paramètres partagés du Core : thème, icônes, ruban et fenêtres.',
 'show-profile':'Ouvre le profil personnel nLab : identité, tampons, signatures, logos, variables et import/export ZIP.',
 'float-panel':'Détache ce panneau dans une fenêtre ancrable et repositionnable.'
};
for(const [name,label] of Object.entries(coreActions)){
 registerCommand({id:'core-vnext.'+name,action:'core-vnext.'+name,
  studio:'studio-core-vnext',plugin:'studio-core',label,
  help:{summary:coreActionHelp[name]},summary:coreActionHelp[name],
  group:['import','save','save-as','save-advanced'].includes(name)?'Fichiers':'Interface',
  handler:()=>runAction(name)});
}
const dispatch=cmd=>executeCommand('core-vnext.'+cmd,{source:'core-vnext-ui'});
function openPanel(id){state.panel=id;saveStudioSettings({sidebarMode:'normal'});persist();render()}

const escapeHtml=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function panelMarkup(id){
 const common='<details class="section"><summary>Options du panneau</summary><p class="hint">Même structure et mêmes commandes dans tous les panneaux.</p></details>';
 let content='';
 if(id==='files'){
  content='<button data-cmd="import">↥ Importer</button><button data-cmd="save">▣ Enregistrer</button><button data-cmd="save-as">⇩ Enregistrer sous</button><button data-cmd="save-advanced">▣ Enregistrer et classer</button><button data-cmd="select-all">☑ Tout sélectionner</button><button data-cmd="remove-files">− Retirer la sélection</button><p class="hint">'+adapter.size+' fichier(s) dans la collection.</p>';
 }else if(id==='tools'){
  content='<p class="hint">Outils communs liés au fichier actif. Les commandes d’édition avancées ne sont pas encore migrées.</p><button data-cmd="import">↥ Importer</button><button data-cmd="float-panel">↗ Détacher ce panneau</button>';
 }else if(id==='history'){
  // Rendered by the existing Core history-sidebar service, not copied as markup.
  content='';
 }else if(id==='properties'){
  // Inspectors live in Core's property-inspector.js, not in a VNext-specific form.
  content='<p class="hint">L’inspecteur commun affiche les propriétés de la sélection active.</p><button data-cmd="properties">☷ Ouvrir les propriétés</button>';
 }else if(id==='profile'){
  // Uses the single existing Core personal-profile-ui.js instance.
  content='';
 }else if(id==='settings'){
  // The existing Core settings UI is rehomed as a single DOM node in panelContent.
  content='';

 }
 return content+common;
}
let canonicalHistory;
function panelContent(){
 const host=$('#panelBody');
 if(state.panel==='history'&&canonicalHistory){
  if(!host.contains(canonicalHistory.element))host.replaceChildren(canonicalHistory.element);
  canonicalHistory.render();
 }else if(state.panel==='settings'&&coreSettingsHost){
  if(!host.contains(coreSettingsHost))host.replaceChildren(coreSettingsHost);
 }else if(state.panel==='tools'&&studioToolsHost){
  if(!host.contains(studioToolsHost))host.replaceChildren(studioToolsHost);
 }else if(state.panel==='profile'&&personalProfileHost){
  if(!host.contains(personalProfileHost))host.replaceChildren(personalProfileHost);
  loadPersonalProfilePanel();
 }else host.innerHTML=panelMarkup(state.panel);
}
function syncUndoButtons(){
 if(!adapter)return;
 const state=adapter.getUndoRedoState();
 $$('[data-cmd="undo"]').forEach(el=>{el.disabled=!state.canUndo;el.title=state.canUndo?'Annuler : '+state.undoLabel:'Rien à annuler'});
 $$('[data-cmd="redo"]').forEach(el=>{el.disabled=!state.canRedo;el.title=state.canRedo?'Rétablir : '+state.redoLabel:'Rien à rétablir'});
}
// Shared icon registry is the only source of pictograms across all Core Studios.
function hydrateCoreIcons(){
 document.querySelectorAll('[data-core-icon]').forEach(slot=>{
  const name=slot.dataset.coreIcon;
  if(slot.dataset.renderedIcon===name&&slot.dataset.renderedTheme===currentPrefs().iconTheme)return;
  slot.innerHTML=sharedIcon(name);
  slot.dataset.renderedIcon=name;
  slot.dataset.renderedTheme=currentPrefs().iconTheme;
 });
}
// Shared ribbon presentation: specialized Studios only contribute additional groups.
const ribbonController=mountStudioRibbonTabs({
 tabs:'.ribbonTabs',groups:'#coreRibbon',
 views:{
  home:['display','files','history','panels','windows'],
  file:['display','files'],
  edit:['display','history'],
  display:['display','panels','windows'],
  tools:['display','panels','windows']
 },initial:'home'
});
function render(){
 syncCoreAppearance();
 const preferences=currentPrefs();
 $('.workspace').classList.toggle('is-work-hidden',!state.work);
 $('.workspace').classList.toggle('is-preview-hidden',!state.preview);
 $('#togglePreview').setAttribute('aria-pressed',String(state.preview));
 $('#previewToggleLabel').textContent=state.preview?'Masquer l’aperçu':'Afficher l’aperçu';
 $$('[data-preview-label]').forEach(el=>{el.textContent=state.preview?'Masquer l’aperçu':'Afficher l’aperçu'});
 $('.workspace').classList.toggle('is-ribbon-hidden',!ribbonVisible());
 $('#panelTitle').textContent=({files:'Fichiers',tools:'Outils',history:'Historique',properties:'Propriétés',profile:'Profil personnel nLab',settings:'Réglages'})[state.panel];
 $$('[data-panel]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.panel===state.panel)));
 $$('[data-visible]').forEach(b=>b.checked=b.dataset.visible==='preview'?state.preview:b.dataset.visible==='work'?state.work:b.dataset.visible==='sidebar'?preferences.sidebarMode!=='hidden':ribbonVisible());
 $$('[data-work-label]').forEach(label=>{label.textContent=state.work?'Masquer la planche':'Afficher la planche'});
 $('#displayBtn').setAttribute('aria-expanded',String(!$('#displayMenu').hidden));
 panelContent();
 if(coreSettingsHost)syncStudioSettingsPanel(coreSettingsHost,preferences);
 hydrateCoreIcons();
 syncUndoButtons();
}
// One shared Core advanced-output surface; the engine and profile models live
// in existing studio-v2 modules. Reopen to refresh the active file preview.
let advancedOutputControls=null;
function openAdvancedSave(){
 const file=adapter.selectedFiles()[0];
 if(!file){inform('Sélectionnez un fichier avant l’enregistrement avancé.');return}
 const dialog=$('#advancedSaveDialog');
 if(!advancedOutputControls){
  advancedOutputControls=mountAdvancedOutputUI({
   host:$('#advancedSavePanel'),output:adapter.output,
   getFile:()=>adapter.selectedFiles()[0],
   onSave:async plan=>adapter.saveSelected({name:plan.name,parts:plan.parts})
  });
 }
 advancedOutputControls.refresh();
 dialog.showModal();
}
$('#closeAdvancedSave').addEventListener('click',()=>$('#advancedSaveDialog').close());

const floating=new Map();
function createFloating(key,title,html){
 let el=floating.get(key);
 if(!el){
  el=document.createElement('section');
  el.className='floating';
  el.dataset.vnextFloating=key;
  el.hidden=true;
  el.innerHTML='<div class="content"></div>';
  document.body.append(el);
  enhanceStudioWindow(el,{key:'vnext-'+key,title,restorable:true,escapeCloses:true});
  floating.set(key,el);
 }
 el.querySelector('.content').innerHTML=html;
 showStudioWindow('vnext-'+key);
 return el;
}
function openWindow(){
 createFloating('windows','Fenêtres','<p class="hint">Gestionnaire commun : déplacer, ancrer, verrouiller, réduire, agrandir et restaurer.</p><div class="panelButtonList"><button data-panel="files">Fichiers</button><button data-panel="history">Historique</button><button data-panel="properties">Propriétés</button><button data-panel="profile">Profil personnel</button><button data-panel="settings">Réglages</button></div>');
}
function openFloatingPanel(id){
 const names={files:'Fichiers',tools:'Outils',history:'Historique',properties:'Propriétés',profile:'Profil personnel nLab',settings:'Réglages'};
 const el=createFloating('panel-'+id,names[id]||id,panelMarkup(id));
 if(id==='settings'&&coreSettingsHost)el.querySelector('.content').replaceChildren(coreSettingsHost);
 if(id==='profile'&&personalProfileHost){el.querySelector('.content').replaceChildren(personalProfileHost);loadPersonalProfilePanel()}
 if(id==='history'&&canonicalHistory){el.querySelector('.content').replaceChildren(canonicalHistory.element);canonicalHistory.render()}
}
document.addEventListener('click',e=>{const b=e.target.closest('[data-cmd]');if(b)dispatch(b.dataset.cmd);const p=e.target.closest('[data-panel]');if(p)openPanel(p.dataset.panel)});
document.addEventListener('studio-v2:settings-changed',()=>{syncCoreAppearance();render()});
$('#displayBtn').onclick=()=>{$('#displayMenu').hidden=!$('#displayMenu').hidden;render()};
$$('[data-visible]').forEach(b=>b.addEventListener('change',()=>{
 const visible=b.checked;
 if(b.dataset.visible==='work')state.work=visible;
 if(b.dataset.visible==='preview')state.preview=visible;
 if(b.dataset.visible==='sidebar')saveStudioSettings({sidebarMode:visible?'normal':'hidden'});
 if(b.dataset.visible==='ribbon')setRibbonVisible(visible);
 persist();render();
}));
coreSettingsHost=document.createElement('div');
coreSettingsHost.className='coreSettingsSurface';
renderStudioSettingsPanel(coreSettingsHost);
// Common UI test surface: the tools are directly mounted from Core modules.
studioToolsHost=document.createElement('section');
studioToolsHost.className='coreToolsReference';
studioToolsHost.innerHTML='<h3>Contrôles nLab partagés</h3><p class="hint">Composants communs : couleur HEX/RGB/HSL, date et import de dossiers.</p><div data-tool-color></div><div data-tool-date></div><div data-tool-swatch class="coreToolsSwatch"></div><button type="button" data-cmd="import">Importer un fichier ou dossier</button>';
const swatch=studioToolsHost.querySelector('[data-tool-swatch]');
const color=createColorPicker({label:'Sélecteur de couleur Core',value:'#0057B8',onChange:(hex,meta)=>{
 swatch.style.backgroundColor=hex;swatch.textContent='Couleur : '+meta.display;
}});
studioToolsHost.querySelector('[data-tool-color]').append(color.element);
const date=createStudioDatePicker({label:'Sélecteur de date Core',value:new Date().toLocaleDateString('sv-SE'),format:'DD/MM/YYYY'});
studioToolsHost.querySelector('[data-tool-date]').append(date.element);

// Profile has its own left-rail panel, not an accordion inside shared Settings.
// One instance of the EXISTING Core profile module; no duplicated inputs or storage.
const personalProfileHost=document.createElement('section');
personalProfileHost.className='personalProfileSurface';
personalProfileHost.dataset.profileHost='true';
personalProfileHost.textContent='Chargement du profil personnel…';
let profileLoading=null;
function loadPersonalProfilePanel(){
 if(profileLoading)return profileLoading;
 profileLoading=import('../../_shared/studio-v2/personal-profile-ui.js')
  .then(({mountPersonalProfileUI})=>mountPersonalProfileUI(personalProfileHost))
  .catch(error=>{
   personalProfileHost.textContent='Profil indisponible : '+(error.message||error);
   profileLoading=null; // Allow retry when the user returns to the panel.
  });
 return profileLoading;
}

adapter=createCoreAdapter({collectionHost:$('#filesList'),previewHost:$('#filePreview'),onUpdate:core=>{
 $('#collectionCount').textContent=core.size+' fichier(s)';
 if(adapter&&(state.panel==='files'||state.panel==='properties'||state.panel==='history'))panelContent();
}});
adapter.subscribeUndoRedo(()=>{syncUndoButtons();if(state.panel==='history')canonicalHistory?.render()});
canonicalHistory=createHistorySidebar({studio:'studio-core-vnext'});
// Zoom/fit interface is the existing shared ViewerControl; VNext only applies its
// command to the currently displayed preview (image, text, markdown or PDF frame).
const viewerControls=mountViewerControls('#coreViewerToolbar',{value:100,min:25,max:400,step:25});
const viewerToolbar=$('#coreViewerToolbar');
viewerToolbar.addEventListener('studio-v2:viewer-command',e=>{
 const action=e.detail?.action;
 const ratio=action==='fit'||action==='actual'?1:Number(e.detail?.ratio)||1;
 $('#filePreview').style.setProperty('--core-preview-scale',String(ratio));
 $('#filePreview').dataset.viewerFit=String(action==='fit');
});
$('#fileInput').addEventListener('change',e=>{adapter.addFiles(e.target.files);e.target.value=''});
const viewModes=mountStudioViewModes({host:$('#collectionViewModes'),
 value:adapter.collection.view==='grid'?'icons':adapter.collection.view,
 onChange:view=>{
  const mode=view==='icons'?'grid':view;
  adapter.collection.setView(mode);$('#collectionView').value=mode;
 }});
$('#collectionView').value=adapter.collection.view;
$('#collectionSort').value=adapter.collection.sortMode;
$('#collectionView').addEventListener('change',e=>{adapter.collection.setView(e.target.value);viewModes.setValue(e.target.value==='grid'?'icons':e.target.value)});
$('#collectionSort').addEventListener('change',e=>adapter.collection.setSort(e.target.value));
const fileDrop=$('#fileDrop');
fileDrop.addEventListener('click',()=>$('#fileInput').click());
fileDrop.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();$('#fileInput').click()}});
mountDropZone(fileDrop,{
 onFiles:files=>adapter.addFiles(files),
 onStateChange:mode=>fileDrop.classList.toggle('dragOver',mode==='over')
});
$('#cancelSaveAs').addEventListener('click',()=>$('#saveAsDialog').close());
$('#saveAsForm').addEventListener('submit',async e=>{
 e.preventDefault();
 const name=$('#saveAsName').value.trim();
 if(!name)return;
 try{const result=await adapter.saveSelected({name});$('#saveAsDialog').close();inform('Copie enregistrée : '+result.name)}
 catch(error){inform(error.message||'Enregistrement impossible')}
});
// Only the shared Studio sidebar adapter owns collapse/restore/resize/lock.
sidebarController=mountStudioSidebarControls({
 layout:$('.layout'),side:$('.side'),rail:$('.rail'),
 collapseButton:$('#sidebarCollapse'),restoreButton:$('#sidebarToggle'),
 lockButton:$('#sidebarLock'),handle:$('.resizer')
});
render();

// Single share controller: reusable by other Studios once validated.
mountPropertyInspector();
mountCommandPalette();
// The reusable Core contextual-help controller describes current and future
// controls using registered commands or existing help metadata.
mountStudioHoverHelp({
 root:document.body,
 commandPrefix:'core-vnext.',
 descriptions:{
  shareBtn:'Regroupe le partage de lien, le QR code et l’impression en PDF.',
  displayBtn:'Ouvre les options communes pour afficher ou masquer la planche, le ruban et le volet.',
  sidebarToggle:'Replie ou déplie le volet latéral. La largeur choisie est mémorisée.',
  sidebarCollapse:'Replie le volet à partir de son en-tête ; la flèche de rappel reste visible.',
  sidebarLock:'Verrouille ou déverrouille la largeur du volet latéral.',
  themeHeader:'Sélectionne le thème clair, sombre ou automatique pour tous les composants Core.',
  fullscreenBtn:'Bascule le Studio en plein écran avec le même contrôleur que les autres Studios.',
  collectionView:'Présente la collection en liste, icônes, vignettes ou tableau, avec les icônes partagées nLab.',
  togglePreview:'Masque ou réaffiche le volet d’aperçu sans fermer le fichier sélectionné.',
  collectionSort:'Trie les fichiers par nom, type ou taille.',
  fileDrop:'Dépose des fichiers locaux pour les ajouter à la collection active.',
  'link':'Copie l’adresse de ce Studio ou utilise le partage natif du navigateur.',
  'qr':'Affiche un QR code contenant le lien vers la page active.',
  'pdf':'Ouvre la fenêtre d’impression pour créer un PDF de la page.',
  'auto':'Le thème suit automatiquement les préférences de votre système.',
  'work':'Masque ou réaffiche la planche de travail.',
  'sidebar':'Masque ou réaffiche le panneau latéral.',
  'ribbon':'Affiche ou masque les commandes du ruban.',
  sidebarWidth:'Règle la largeur du panneau sans limite fixe à 720 px. Vous pouvez aussi glisser son bord.',
  advancedSaveDialog:'Renommer le fichier avec des variables, puis choisir un dossier et une arborescence de sortie.',
  profile:'Ouvre votre profil nLab local, avec les tampons, signatures, variables et modèles exportables en ZIP.'
 }
});

mountShareMenu({trigger:$('#shareBtn'),menu:$('#shareMenu'),dialog:$('#qrDialog'),notice:$('#uiNotice')});
createFullscreenController({target:$('.app'),button:$('#fullscreenBtn'),onMessage:message=>inform(message)});
document.addEventListener('keydown',e=>{
 if(e.defaultPrevented||e.target.closest('input,textarea,select,[contenteditable]'))return;
 if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='o'){e.preventDefault();dispatch('import')}
 if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='s'){e.preventDefault();dispatch('save')}
 if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='z'){e.preventDefault();dispatch(e.shiftKey?'redo':'undo')}
 if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='y'){e.preventDefault();dispatch('redo')}
});
const themeHeader=$('#themeHeader');
themeHeader.value=themeChoice();
themeHeader.addEventListener('change',()=>{
 saveStudioSettings({theme:themeHeader.value==='auto'?'system':themeHeader.value});
});
if(window.matchMedia){
 matchMedia('(prefers-color-scheme: dark)').addEventListener?.('change',()=>{
  if(currentPrefs().theme==='system'){applyStudioSettings();render()}
 });
}
