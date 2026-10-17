import {openInputPicker} from '../_shared/studio-v2/input-picker.js';
import {mountViewerControls} from '../_shared/studio-v2/viewer-control.js';
import {mountColorPicker} from '../_shared/studio-v2/color-picker.js';
import {enhanceStudioWindow,showStudioWindow,hideStudioWindow,resetStudioWindows} from '../_shared/studio-v2/window-system.js';
import {pushUndoRedo,undo,redo,subscribeUndoRedo,getUndoRedoState,installUndoRedoBridge} from '../_shared/studio-v2/undo-redo.js';

const $=id=>document.getElementById(id);
const status=(message)=>{$('lab-status').textContent=message};
const check=id=>{$('lab-check-'+id).textContent='✓'};
const stage=$('lab-preview');
let currentColor='#316D9A';
let replaying=false;
let selectedFiles=[];
let colorApi;

function paint(hex){
 currentColor=hex;
 stage.style.background='color-mix(in srgb, '+hex+' 12%, white)';
 stage.style.borderColor=hex;
}
function setColor(hex,record=true){
 const previous=currentColor;
 if(hex===previous)return;
 paint(hex);
 if(record&&!replaying){
   pushUndoRedo({label:'Couleur '+hex,
     undo:()=>{replaying=true;try{colorApi.setValue(previous)}finally{replaying=false}},
     redo:()=>{replaying=true;try{colorApi.setValue(hex)}finally{replaying=false}}
   });
 }
 check('colors');status('Couleur : '+hex);
}
colorApi=mountColorPicker($('lab-colors'),{value:currentColor,onChange:detail=>setColor(detail.hex)});
paint(currentColor);

const viewer=mountViewerControls($('lab-viewer'),{value:100,min:25,max:300,step:25});
$('lab-viewer').addEventListener('studio-v2:viewer-command',e=>{
 const {action,zoom}=e.detail;
 const factor=action==='fit'?1:zoom/100;
 stage.style.transform='scale('+factor+')';
 check('viewer');
 status('Viewer : '+(action==='fit'?'ajusté':Math.round(factor*100)+' %'));
});
installUndoRedoBridge();
subscribeUndoRedo(s=>{
 $('lab-undo').disabled=!s.canUndo;$('lab-redo').disabled=!s.canRedo;
 $('lab-undo-depth').textContent='Historique : '+s.undoDepth+' / '+s.redoDepth;
 if(s.canUndo||s.canRedo)check('history');
 for(const key of ['undo','redo']){
  const btn=document.querySelector('[data-lab-mobile="'+key+'"]');
  if(btn)btn.disabled=key==='undo'?!s.canUndo:!s.canRedo;
 }
});
const history=getUndoRedoState();
$('lab-undo').disabled=!history.canUndo;$('lab-redo').disabled=!history.canRedo;
async function runHistory(action){try{await(action==='undo'?undo():redo());status(action==='undo'?'Dernière modification annulée':'Modification rétablie')}catch(err){status('Erreur historique : '+err.message)}}
$('lab-undo').addEventListener('click',()=>runHistory('undo'));
$('lab-redo').addEventListener('click',()=>runHistory('redo'));
$('lab-reset-color').addEventListener('click',()=>colorApi.setValue('#316D9A'));

function showFiles(files){
 selectedFiles=files;
 $('lab-file-count').textContent=files.length+' fichier'+(files.length===1?'':'s')+' sélectionné'+(files.length===1?'':'s');
 $('lab-files').textContent=files.length?files.map(f=>f.webkitRelativePath||f.__relativePath||f.name).slice(0,5).join(' · ')+(files.length>5?' …':''):'Aucun fichier choisi.';
 $('lab-preview-title').textContent=files.length?files[0].name:'Votre espace de test';
 $('lab-preview-subtitle').textContent=files.length?'Aucun fichier envoyé : contrôle local uniquement.':'Importez un fichier ou chargez l’exemple.';
 check('picker');status(files.length+' fichier(s) importé(s) localement');
}
async function pick(files=[]){
 try{
   const result=await openInputPicker({files,preserveSession:false,expandZip:false,multiple:true,folders:true,accept:''});
   if(Array.isArray(result))showFiles(result);
   else status('Sélection de fichiers annulée');
 }catch(error){status('Erreur Input Picker : '+(error?.message||String(error)))}
}
$('lab-picker').addEventListener('click',()=>pick());
$('lab-demo').addEventListener('click',()=>{
 const example=new File(['Studio Core Lab — document de démonstration local.'],'exemple-core.txt',{type:'text/plain'});
 pick([example]);
});

const panel=$('lab-floating-window');
enhanceStudioWindow(panel,{key:'core-lab-window',title:'Fenêtre de test Core',restorable:true});
function openWindow(){
 showStudioWindow('core-lab-window');
 check('windows');status('Fenêtre Core affichée');
}
$('lab-open-window').addEventListener('click',openWindow);
$('lab-window-button').addEventListener('click',openWindow);
$('lab-close-window').addEventListener('click',()=>{hideStudioWindow('core-lab-window');status('Fenêtre masquée, à restaurer avec le bouton')});
$('lab-reset-window').addEventListener('click',()=>{resetStudioWindows();status('Préférences de fenêtre réinitialisées')});

const extra=$('lab-extra'),more=$('lab-more');
function toggleOptions(force){
 const expanded=typeof force==='boolean'?force:extra.hidden;
 extra.hidden=!expanded;more.setAttribute('aria-expanded',String(expanded));
 if(expanded)extra.scrollIntoView({block:'nearest',behavior:'smooth'});
}
more.addEventListener('click',()=>toggleOptions());
for(const control of document.querySelectorAll('[data-lab-mobile]')){
 control.addEventListener('click',()=>{
   const action=control.dataset.labMobile;
   if(action==='files')pick();
   else if(action==='options')toggleOptions();
   else runHistory(action);
 });
}
const modeSelect=$('lab-layout');
const storageKey='nlab.core-lab.layout';
try{const saved=localStorage.getItem(storageKey);if(['auto','desktop','compact'].includes(saved))modeSelect.value=saved}catch{}
function applyMode(){
 document.body.dataset.layout=modeSelect.value;
 try{localStorage.setItem(storageKey,modeSelect.value)}catch{}
 status('Affichage : '+({auto:'automatique',desktop:'bureau',compact:'compact/mobile'}[modeSelect.value]));
}
modeSelect.addEventListener('change',applyMode);
applyMode();
const mq=window.matchMedia('(max-width:760px)');
function updateDevice(){
 $('lab-device').textContent=(mq.matches?'Format étroit':'Grand écran')+' · '+Math.round(innerWidth)+' px';
}
window.addEventListener('resize',updateDevice,{passive:true});
updateDevice();
status('Studio Core Lab prêt : import, couleurs, zoom, fenêtres et historique');
document.documentElement.dataset.coreLabReady='1';
