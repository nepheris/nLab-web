import {createCoreAdapter} from './core-adapter.js';
import {openInputPicker} from '../../_shared/studio-v2/input-picker.js';
import {createHistorySidebar} from '../../_shared/studio-v2/history-sidebar.js';
import {createFullscreenController} from '../../_shared/studio-v2/fullscreen-service.js';
import {enhanceStudioWindow,showStudioWindow,hideStudioWindow} from '../../_shared/studio-v2/window-system.js';
import {mountShareMenu,notifyUi} from '../../_shared/nlab-share-menu.js';
// VNext experimental shell: one command dispatcher, shared panels and local preferences.
// Functional bridge to the existing Studio Core services is intentionally not implemented yet.
const $=s=>document.querySelector(s),$$=s=>Array.from(document.querySelectorAll(s));
const key='nlab:core-vnext:ui:v1';
let state={panel:'files',work:true,sidebar:true,ribbon:true,locked:false,width:310,theme:'auto',files:[]};
try{const saved=JSON.parse(localStorage.getItem(key)||'{}');for(const k of ['panel','work','sidebar','ribbon','locked','width','theme'])if(Object.hasOwn(saved,k))state[k]=saved[k]}catch{}
const persist=()=>{try{const {files,...preferences}=state;localStorage.setItem(key,JSON.stringify(preferences))}catch{}};
let adapter;
const inform=message=>notifyUi($('#uiNotice'),message);
const dispatch=async cmd=>{
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
 if(cmd==='collapse')state.sidebar=false;
 if(cmd==='lock')state.locked=!state.locked;
 if(cmd==='windows'){openWindow();return}
 if(cmd==='float-panel'){openFloatingPanel(state.panel);return}
 persist();render();
};
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
  content='<details class="section" open><summary>Personnalisation de l’interface</summary><label class="row">Thème <select data-theme-select aria-label="Thème"><option value="auto">Automatique</option><option value="light">Clair</option><option value="dark">Sombre</option></select></label><p class="hint">Le choix est synchronisé avec le thème du header.</p></details><details class="section"><summary>Ruban et panneaux</summary><p class="hint">Les options sont centralisées dans « Affichage ».</p><button type="button" data-cmd="toggle-work">Afficher / masquer la planche</button></details>';
 }
 return content+common;
}
let canonicalHistory;
function panelContent(){
 const host=$('#panelBody');
 if(state.panel==='history'&&canonicalHistory){
  if(!host.contains(canonicalHistory.element))host.replaceChildren(canonicalHistory.element);
  canonicalHistory.render();
 }else host.innerHTML=panelMarkup(state.panel);
 $$('[data-theme-select]').forEach(el=>el.value=state.theme);
}
function syncUndoButtons(){
 if(!adapter)return;
 const state=adapter.getUndoRedoState();
 $$('[data-cmd="undo"]').forEach(el=>{el.disabled=!state.canUndo;el.title=state.canUndo?'Annuler : '+state.undoLabel:'Rien à annuler'});
 $$('[data-cmd="redo"]').forEach(el=>{el.disabled=!state.canRedo;el.title=state.canRedo?'Rétablir : '+state.redoLabel:'Rien à rétablir'});
}
function render(){
 document.body.classList.toggle('dark',state.theme==='dark'||state.theme==='auto'&&matchMedia('(prefers-color-scheme: dark)').matches);
 $('.workspace').classList.toggle('is-work-hidden',!state.work);
 $('.workspace').classList.toggle('is-side-hidden',!state.sidebar);
 $('.workspace').classList.toggle('is-ribbon-hidden',!state.ribbon);
 $('.layout').style.setProperty('--side-width',state.width+'px');
 $('#panelTitle').textContent=({files:'Fichiers',tools:'Outils',history:'Historique',properties:'Propriétés',settings:'Réglages'})[state.panel];
 $$('[data-panel]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.panel===state.panel)));
 $$('[data-visible]').forEach(b=>b.checked=state[b.dataset.visible]);
 $$('[data-cmd="toggle-work"]').forEach(b=>b.textContent=state.work?'▤ Masquer la planche':'▤ Afficher la planche');
 $('[data-cmd=lock]').textContent=state.locked?'🔒':'🔓';
 $('#displayBtn').setAttribute('aria-expanded',String(!$('#displayMenu').hidden));
 const sharedTheme=$('#themeHeader');if(sharedTheme)sharedTheme.value=state.theme;
 panelContent();
 $$('[data-theme-select]').forEach(x=>x.value=state.theme);
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
 el.querySelectorAll('[data-theme-select]').forEach(x=>x.value=state.theme);
}
document.addEventListener('click',e=>{const b=e.target.closest('[data-cmd]');if(b)dispatch(b.dataset.cmd);const p=e.target.closest('[data-panel]');if(p){state.panel=p.dataset.panel;state.sidebar=true;persist();render()}});
document.addEventListener('change',e=>{if(e.target.matches('[data-theme-select]')){state.theme=e.target.value;persist();render()}});
$('#displayBtn').onclick=()=>{$('#displayMenu').hidden=!$('#displayMenu').hidden;render()};
$$('[data-visible]').forEach(b=>b.addEventListener('change',()=>{state[b.dataset.visible]=b.checked;persist();render()}));
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
const grip=$('.resizer');grip.addEventListener('pointerdown',e=>{if(state.locked)return;e.preventDefault();grip.setPointerCapture(e.pointerId)});grip.addEventListener('pointermove',e=>{if(!grip.hasPointerCapture(e.pointerId))return;state.width=Math.max(210,Math.min(550,e.clientX-$('.rail').getBoundingClientRect().right));$('.layout').style.setProperty('--side-width',state.width+'px')});grip.addEventListener('pointerup',()=>persist());
grip.addEventListener('keydown',e=>{if(state.locked)return;if(e.key==='ArrowLeft'||e.key==='ArrowRight'){state.width=Math.max(210,Math.min(550,state.width+(e.key==='ArrowLeft'?-15:15)));persist();render();e.preventDefault()}});
render();

// Single share controller: reusable by other Studios once validated.
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
themeHeader.value=state.theme;
themeHeader.addEventListener('change',()=>{
 state.theme=themeHeader.value;persist();render();
});

if(window.matchMedia){
 matchMedia('(prefers-color-scheme: dark)').addEventListener?.('change',()=>{if(state.theme==='auto')render()});
}
