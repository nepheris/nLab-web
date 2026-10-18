import {mountStudioV2} from '../../../_shared/studio-v2/frame.js';
import {resolveStudioVersions} from '../../../_shared/studio-v2/version-service.js';
import {createFullscreenController} from '../../../_shared/studio-v2/fullscreen-service.js';
import {createApplicationModeController} from '../../../_shared/studio-v2/application-mode-service.js';
import {pushUndoRedo,getUndoRedoState,subscribeUndoRedo} from '../../../_shared/studio-v2/undo-redo.js';

const $=selector=>document.querySelector(selector);
const INITIAL=Object.freeze({
 name:'Composant de démonstration nLab',
 description:'Élément synthétique pour éprouver les fonctions transversales du Studio Core.'
});
const STORAGE='nlab:studio-core-test:manual:v1';
const manifest={
 id:'studio-core-test',
 name:'Studio Core Test Lab',
 subtitle:'Laboratoire des fonctions transversales',
 studioIconHref:new URL('../../../../assets/branding/nlab-favicon.svg',import.meta.url).href,
 sourcePath:'APP-Applications/studio-core-test/index.html',
 versionsHref:'./versions.html',
 menus:[{id:'diagnostic',label:'Diagnostics',scope:'studio'},{id:'specimen',label:'Échantillon',scope:'studio'},{id:'validation',label:'Validation',scope:'studio'}],
 ribbon:[{id:'lab-diagnostics',label:'Test Lab',scope:'studio',items:[
  {id:'lab-run-action',action:'lab.run-checks',label:'Contrôles',icon:'check',scope:'studio',status:'stable'},
  {id:'lab-select-action',action:'lab.select',label:'Sélectionner',icon:'select',scope:'studio',status:'stable'},
  {id:'lab-reset-action',action:'lab.restore',label:'Réinitialiser',icon:'restore',scope:'studio',status:'stable'}
 ]}]
};

function setSample(sample){
 $('#labItemName').value=sample.name;
 $('#labItemDescription').value=sample.description;
 publishSelection('sample');
}
function readSample(){
 return{name:$('#labItemName').value,description:$('#labItemDescription').value};
}
function publishSelection(source='core-lab'){
 const sample=readSample();
 document.dispatchEvent(new CustomEvent('studio-v2:selection-change',{detail:{
  selection:[{name:sample.name}],active:{name:sample.name},scope:'object',kind:'core-test',
  meta:{description:sample.description,synthetic:true},source
 }}));
 $('#labSampleStatus').textContent='Objet sélectionné : '+sample.name;
}
function commitSample(after,label='Modifier l’échantillon'){
 const before=committed;
 if(after.name===before.name&&after.description===before.description){
  $('#labSampleStatus').textContent='Aucune modification à enregistrer.';
  return;
 }
 const next={...after};
 pushUndoRedo({
  label,meta:{studio:'studio-core-test',synthetic:true},
  undo:()=>{committed={...before};setSample(committed);$('#labSampleStatus').textContent='Modification annulée.'},
  redo:()=>{committed={...next};setSample(committed);$('#labSampleStatus').textContent='Modification rétablie.'}
 });
 committed=next;
 setSample(committed);
 $('#labSampleStatus').textContent='Transaction enregistrée dans l’historique du Core.';
}
function updateMetrics(){
 const app=$('[data-studio-action="core.app-mode"]');
 const state=app?.dataset.appMode||'unknown';
 const labels={standalone:'Application installée',installable:'Installation proposée',browser:'Mode navigateur', 'not-configured':'Manifeste absent',unknown:'Indisponible'};
 $('#labApplicationState').textContent=labels[state]||state;
 $('#labFullscreenState').textContent=document.fullscreenElement===document.documentElement?'Actif':'Inactif';
 $('#labViewport').textContent=window.innerWidth+' × '+window.innerHeight;
 $('#labProfile').textContent='Profil Core : '+(document.body.dataset.responsiveProfile||'non détecté');
 const h=getUndoRedoState();
 $('#labHistory').textContent=h.undoDepth+' action(s) · '+h.redoDepth+' à rétablir';
}
const TESTS=[
 ['chrome','Chrome commun',()=>Boolean($('#nlabStudioV2Chrome')&&$('.studioHeader')&&$('.studioRibbon'))],
 ['ribbon','Commandes du ruban',()=>Boolean($('[data-studio-action="core.fullscreen"]')&&$('[data-studio-action="core.app-mode"]'))],
 ['fullscreen','Service plein écran partagé',()=>typeof createFullscreenController==='function'&&typeof document.documentElement.requestFullscreen==='function'],
 ['pwa','Service PWA partagé',()=>typeof createApplicationModeController==='function'&&Boolean($('[data-studio-action="core.app-mode"]')?.dataset.appMode)],
 ['settings','Paramètres Core',()=>Boolean($('#studioCoreSettings')&&$('#studioCoreSettingsPanel'))],
 ['commands','Palette de commandes',()=>Boolean(window.NLABStudioCommands?.get?.('core.fullscreen')&&window.NLABStudioCommands?.get?.('core.app-mode'))],
 ['undo','Annuler / Rétablir Core',()=>typeof window.NLABStudioUndoRedo?.undo==='function'&&typeof window.NLABStudioUndoRedo?.redo==='function'],
 ['responsive','Lanceur Responsive',()=>Boolean($('[data-studio-action="core.responsive-test"]'))],
 ['version','Version Core issue du référentiel',()=>Boolean(document.body.dataset.studioCoreVersion)],
 ['storage','Stockage local navigateur',()=>{try{const k='nlab:core-lab:storage-probe';localStorage.setItem(k,'ok');const ok=localStorage.getItem(k)==='ok';localStorage.removeItem(k);return ok}catch{return false}}],
 ['manifest','Manifeste PWA accessible',async()=>{const link=$('link[rel="manifest"]');if(!link)return false;const response=await fetch(link.href,{cache:'no-store'});if(!response.ok)return false;const data=await response.json();return data.display==='standalone'&&data.start_url==='./'}]
];
async function runChecks(){
 const result=await Promise.all(TESTS.map(async([id,label,check])=>{
  try{return{id,label,pass:Boolean(await check())}}catch(e){return{id,label,pass:false,error:String(e.message||e)}}
 }));
 const list=$('#labCheckList');
 list.replaceChildren(...result.map(item=>{
  const li=document.createElement('li');li.className=item.pass?'pass':'fail';
  const mark=document.createElement('span');mark.textContent=item.pass?'✓':'!';
  const name=document.createElement('span');name.textContent=item.label;
  const state=document.createElement('small');state.textContent=item.pass?'PASS':(item.error||'À vérifier');
  li.append(mark,name,state);return li;
 }));
 const passed=result.filter(r=>r.pass).length;
 $('#labCheckSummary').textContent=passed+'/'+result.length+' contrôles techniques PASS. Les tests de navigation, installation et rendu visuel exigent une recette humaine.';
 document.documentElement.dataset.coreLabChecks=passed===result.length?'pass':'partial';
 updateMetrics();
 return result;
}
function initManualChecks(){
 let saved={};
 try{saved=JSON.parse(localStorage.getItem(STORAGE)||'{}')}catch{}
 const checks=[...document.querySelectorAll('[data-manual]')];
 for(const input of checks){
  input.checked=saved[input.dataset.manual]===true;
  input.addEventListener('change',()=>{
   saved[input.dataset.manual]=input.checked;
   try{localStorage.setItem(STORAGE,JSON.stringify(saved))}catch{}
   summary();
  });
 }
 function summary(){
  const passed=checks.filter(input=>input.checked).length;
  $('#labManualSummary').textContent=passed+'/'+checks.length+' contrôles déclarés validés sur cet appareil.';
 }
 summary();
}

let committed={...INITIAL};
try{
 const resolvedVersion=await resolveStudioVersions({
  versionsHref:new URL('../../versions.json',import.meta.url).href,
  coreVersionHref:new URL('../../../_shared/studio-v2/version.json',import.meta.url).href,
  channel:'test',sourcePath:manifest.sourcePath
 });
 const versionInfo={...resolvedVersion,studioVersion:'0.1.0',version:'0.1.0',studioStatus:'HISTORICAL',status:'HISTORICAL'};
 await mountStudioV2({manifest,versionInfo});
 $('#labCoreVersion').textContent='Core '+(versionInfo.coreVersion||'—');
 document.documentElement.dataset.coreLabReady='1';
 $('#labResponsiveLink').href=new URL('../../../responsive-test-studio/?url='+encodeURIComponent(location.href),location.href).href;
 $('#labRunChecks').addEventListener('click',runChecks);
 $('#labCommit').addEventListener('click',()=>commitSample(readSample()));
 $('#labSelect').addEventListener('click',()=>publishSelection('manual'));
 $('#labRestore').addEventListener('click',()=>commitSample({...INITIAL},'Restaurer le modèle'));
 $('#labOpenSettings').addEventListener('click',()=>$('#studioCoreSettings')?.click());
 $('#labAppGuide').addEventListener('click',()=>{
  const state=$('[data-studio-action="core.app-mode"]')?.dataset.appMode||'unknown';
  $('#labSampleStatus').textContent={
   standalone:'Application installée et ouverte dans sa propre fenêtre.',
   installable:'Le navigateur propose une installation. Utilisez le bouton « Installer l’application » du ruban.',
   browser:'PWA configurée ; aucune invite d’installation reçue. Consultez le menu de Chrome ou Edge.',
   'not-configured':'Manifeste PWA manquant : installation impossible sans migration.'
  }[state]||'Statut du navigateur non déterminé.';
 });
 document.addEventListener('studio-v2:action',event=>{
  const action=event.detail?.action;
  if(action==='lab.run-checks')runChecks();
  if(action==='lab.select')publishSelection('ribbon');
  if(action==='lab.restore')commitSample({...INITIAL},'Restaurer le modèle');
 });
 document.addEventListener('studio-v2:menu',event=>{
  const target={diagnostic:'#labRunChecks',specimen:'#labItemName',validation:'#labManual'}[event.detail?.tab];
  if(target)$(target)?.scrollIntoView({behavior:'smooth',block:'nearest'});
 });
 window.addEventListener('resize',updateMetrics);
 document.addEventListener('fullscreenchange',updateMetrics);
 document.addEventListener('studio-v2:app-mode-state',updateMetrics);
 subscribeUndoRedo(updateMetrics);
 initManualChecks();
 publishSelection('ready');
 updateMetrics();
 await runChecks();
 window.NLabCoreLab={runChecks,getSample:readSample,getHistory:getUndoRedoState,versionInfo};
}catch(error){
 document.documentElement.dataset.coreLabReady='error';
 $('#labCheckSummary').textContent='Initialisation du Core impossible : '+(error.message||error);
 console.error('Studio Core Test Lab',error);
}
