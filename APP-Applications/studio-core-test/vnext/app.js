import {createCoreAdapter} from './core-adapter.js';
import {openInputPicker} from '../../_shared/studio-v2/input-picker.js';
import {createHistorySidebar} from '../../_shared/studio-v2/history-sidebar.js';
import {registerCommand,executeCommand} from '../../_shared/studio-v2/command-registry.js';
import {mountCommandPalette} from '../../_shared/studio-v2/command-palette.js';
import {loadStudioSettings,saveStudioSettings,applyStudioSettings,renderStudioSettingsPanel} from '../../_shared/studio-v2/settings.js';
import {createFullscreenController} from '../../_shared/studio-v2/fullscreen-service.js';
import {enhanceStudioWindow,showStudioWindow,hideStudioWindow} from '../../_shared/studio-v2/window-system.js';
import {mountShareMenu,notifyUi} from '../../_shared/nlab-share-menu.js';
// VNext experimental shell: one command dispatcher, shared panels and local preferences.
// Functional bridge to the existing Studio Core services is intentionally not implemented yet.
const $=s=>document.querySelector(s),$$=s=>Array.from(document.querySelectorAll(s));
const key='nlab:core-vnext:ui:v1';
let state={panel:'files',work:true,files:[]};
try{const saved=JSON.parse(localStorage.getItem(key)||'{}');for(const k of ['panel','work'])if(Object.hasOwn(saved,k))state[k]=saved[k]}catch{}
const persist=()=>{try{const {files,...preferences}=state;localStorage.setItem(key,JSON.stringify(preferences))}catch{}};
// One-time migration of TEST-only preferences into the existing Core settings store.
try{
 const legacy=JSON.parse(localStorage.getItem(key)||'{}');
 if(!localStorage.getItem('nlab-studio-v2-settings')){
  const migrated={};
  if(['auto','dark','light'].includes(legacy.theme))migrated.theme=legacy.theme==='auto'?'system':legacy.theme;
  if(Number.isFinite(Number(legacy.width)))migrated.sidebarWidth=Math.max(220,Math.min(720,Number(legacy.width)));
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
let adapter;
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
 if(cmd==='collapse')saveStudioSettings({sidebarMode:'hidden'});
 if(cmd==='lock')saveStudioSettings({sidebarLocked:!currentPrefs().sidebarLocked});
 if(cmd==='commands'){document.dispatchEvent(new Event('studio-v2:open-command-palette'));return}
 if(cmd==='windows'){openWindow();return}
 if(cmd==='float-panel'){openFloatingPanel(state.panel);return}
 persist();render();
};
// All menu/ribbon/side-panel actions are registered once with the existing Core registry.
const coreActions={
 import:'Importer',save:'Enregistrer','save-as':'Enregistrer sous',
 undo:'Annuler',redo:'Rétablir','select-all':'Tout sélectionner',
 'remove-files':'Retirer les fichiers','clear-files':'Vider la collection',
 'toggle-work':'Afficher ou masquer la planche','collapse':'Masquer le panneau',
 lock:'Verrouiller le panneau',windows:'Fenêtres',commands:'Palette de commandes',
 'float-panel':'Détacher le panneau'
};
for(const [name,label] of Object.entries(coreActions)){
 registerCommand({id:'core-vnext.'+name,action:'core-vnext.'+name,
  studio:'studio-core-vnext',plugin:'studio-core',label,
  group:['import','save','save-as'].includes(name)?'Fichiers':'Interface',
  handler:()=>runAction(name)});
}
const dispatch=cmd=>executeCommand('core-vnext.'+cmd,{source:'core-vnext-ui'});
const escapeHtml=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function panelMarkup(id){
 const common='<details class="section"><summary>Options du panneau</summary><p class="hint">Même structure et mêmes commandes dans tous les panneaux.</p></details>';
 let content='';
 if(id==='files'){
  content='<button data-cmd="import">↥ Importer</button><button data-cmd="save">▣ Enregistrer</button><button data-cmd="save-as">⇩ Enregistrer sous</button><button data-cmd="select-all">☑ Tout sélectionner</button><button data-cmd="remove-files">− Retirer la sélection</button><p class="hint">'+adapter.size+' fichier(s) dans la collection.</p>';
 }else if(id==='tools'){
  content='<p class="hint">Outils communs liés au fichier actif. Les commandes d’édition avancées ne sont pas encore migrées.</p><button data-cmd="import">↥ Importer</button><button data-cmd="float-panel">↗ Détacher ce panneau</button>';
 }else if(id==='history'){
  // Rendered by the existing Core history-sidebar service, not copied as markup.
  content='';
 }else if(id==='properties'){
  const item=adapter.active();
  content='<div class="section"><strong>Propriétés du fichier actif</strong>'+(item?'<dl><dt>Nom</dt><dd>'+escapeHtml(item.label)+'</dd><dt>Format</dt><dd>'+escapeHtml(item.extension||'—')+'</dd><dt>Taille</dt><dd>'+Number(item.size||0).toLocaleString('fr-FR')+' octets</dd><dt>Sélection</dt><dd>'+adapter.collection.selectedItems().length+' fichier(s)</dd></dl>':'<p class="hint">Sélectionnez un fichier dans la collection.</p>')+'</div>';
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
 }else host.innerHTML=panelMarkup(state.panel);
}
function syncUndoButtons(){
 if(!adapter)return;
 const state=adapter.getUndoRedoState();
 $$('[data-cmd="undo"]').forEach(el=>{el.disabled=!state.canUndo;el.title=state.canUndo?'Annuler : '+state.undoLabel:'Rien à annuler'});
 $$('[data-cmd="redo"]').forEach(el=>{el.disabled=!state.canRedo;el.title=state.canRedo?'Rétablir : '+state.redoLabel:'Rien à rétablir'});
}
function render(){
 syncCoreAppearance();
 const preferences=currentPrefs();
 $('.workspace').classList.toggle('is-work-hidden',!state.work);
 $('.workspace').classList.toggle('is-side-hidden',preferences.sidebarMode==='hidden');
 $('.workspace').classList.toggle('is-ribbon-hidden',!ribbonVisible());
 $('.layout').style.setProperty('--side-width',Math.max(220,Math.min(720,Number(preferences.sidebarWidth)||360))+'px');
 $('#panelTitle').textContent=({files:'Fichiers',tools:'Outils',history:'Historique',properties:'Propriétés',settings:'Réglages'})[state.panel];
 $$('[data-panel]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.panel===state.panel)));
 $('[data-visible]').forEach(b=>b.checked=b.dataset.visible==='work'?state.work:b.dataset.visible==='sidebar'?preferences.sidebarMode!=='hidden':ribbonVisible());
 $$('[data-cmd="toggle-work"]').forEach(b=>b.textContent=state.work?'▤ Masquer la planche':'▤ Afficher la planche');
 $('[data-cmd=lock]').textContent=preferences.sidebarLocked?'🔒':'🔓';
 $('#displayBtn').setAttribute('aria-expanded',String(!$('#displayMenu').hidden));
 panelContent();
 syncUndoButtons();
}
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
 createFloating('windows','Fenêtres','<p class="hint">Gestionnaire commun : déplacer, ancrer, verrouiller, réduire, agrandir et restaurer.</p><div class="panelButtonList"><button data-panel="files">Fichiers</button><button data-panel="history">Historique</button><button data-panel="properties">Propriétés</button><button data-panel="settings">Réglages</button></div>');
}
function openFloatingPanel(id){
 const names={files:'Fichiers',tools:'Outils',history:'Historique',properties:'Propriétés',settings:'Réglages'};
 const el=createFloating('panel-'+id,names[id]||id,panelMarkup(id));
 if(id==='settings'&&coreSettingsHost)el.querySelector('.content').replaceChildren(coreSettingsHost);
 if(id==='history'&&canonicalHistory){el.querySelector('.content').replaceChildren(canonicalHistory.element);canonicalHistory.render()}
}
document.addEventListener('click',e=>{const b=e.target.closest('[data-cmd]');if(b)dispatch(b.dataset.cmd);const p=e.target.closest('[data-panel]');if(p){state.panel=p.dataset.panel;saveStudioSettings({sidebarMode:'normal'});persist();render()}});
document.addEventListener('studio-v2:settings-changed',()=>{syncCoreAppearance();render()});
$('#displayBtn').onclick=()=>{$('#displayMenu').hidden=!$('#displayMenu').hidden;render()};
$('[data-visible]').forEach(b=>b.addEventListener('change',()=>{
 const visible=b.checked;
 if(b.dataset.visible==='work')state.work=visible;
 if(b.dataset.visible==='sidebar')saveStudioSettings({sidebarMode:visible?'normal':'hidden'});
 if(b.dataset.visible==='ribbon')setRibbonVisible(visible);
 persist();render();
}));
coreSettingsHost=document.createElement('div');
coreSettingsHost.className='coreSettingsSurface';
renderStudioSettingsPanel(coreSettingsHost);
adapter=createCoreAdapter({collectionHost:$('#filesList'),previewHost:$('#filePreview'),onUpdate:core=>{
 $('#collectionCount').textContent=core.size+' fichier(s)';
 if(adapter&&(state.panel==='files'||state.panel==='properties'||state.panel==='history'))panelContent();
}});
adapter.subscribeUndoRedo(()=>{syncUndoButtons();if(state.panel==='history')canonicalHistory?.render()});
canonicalHistory=createHistorySidebar({studio:'studio-core-vnext'});
$('#fileInput').addEventListener('change',e=>{adapter.addFiles(e.target.files);e.target.value=''});
$('#collectionView').value=adapter.collection.view;
$('#collectionSort').value=adapter.collection.sortMode;
$('#collectionView').addEventListener('change',e=>adapter.collection.setView(e.target.value));
$('#collectionSort').addEventListener('change',e=>adapter.collection.setSort(e.target.value));
const fileDrop=$('#fileDrop');
fileDrop.addEventListener('click',()=>$('#fileInput').click());
fileDrop.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();$('#fileInput').click()}});
fileDrop.addEventListener('dragover',e=>{e.preventDefault();fileDrop.classList.add('dragOver')});
fileDrop.addEventListener('dragleave',()=>fileDrop.classList.remove('dragOver'));
fileDrop.addEventListener('drop',e=>{e.preventDefault();fileDrop.classList.remove('dragOver');adapter.addFiles(e.dataTransfer?.files)});
$('#cancelSaveAs').addEventListener('click',()=>$('#saveAsDialog').close());
$('#saveAsForm').addEventListener('submit',async e=>{
 e.preventDefault();
 const name=$('#saveAsName').value.trim();
 if(!name)return;
 try{const result=await adapter.saveSelected({name});$('#saveAsDialog').close();inform('Copie enregistrée : '+result.name)}
 catch(error){inform(error.message||'Enregistrement impossible')}
});
const grip=$('.resizer');
let dragWidth=null;
grip.addEventListener('pointerdown',e=>{
 if(currentPrefs().sidebarLocked)return;
 e.preventDefault();grip.setPointerCapture(e.pointerId)
});
grip.addEventListener('pointermove',e=>{
 if(!grip.hasPointerCapture(e.pointerId))return;
 dragWidth=Math.max(220,Math.min(720,e.clientX-$('.rail').getBoundingClientRect().right));
 $('.layout').style.setProperty('--side-width',dragWidth+'px')
});
grip.addEventListener('pointerup',()=>{
 if(dragWidth!==null){saveStudioSettings({sidebarWidth:dragWidth});dragWidth=null}
});
grip.addEventListener('keydown',e=>{
 if(currentPrefs().sidebarLocked)return;
 if(e.key==='ArrowLeft'||e.key==='ArrowRight'){
  saveStudioSettings({sidebarWidth:Math.max(220,Math.min(720,(Number(currentPrefs().sidebarWidth)||360)+(e.key==='ArrowLeft'?-15:15)))});
  e.preventDefault();
 }
});
render();

// Single share controller: reusable by other Studios once validated.
mountCommandPalette();
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
