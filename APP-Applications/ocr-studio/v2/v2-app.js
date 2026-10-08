import{mountStudioV2}from'../../_shared/studio-v2/frame.js';
import{resolveStudioVersions,applyVersionDocumentMeta}from'../../_shared/studio-v2/version-service.js';
import{availableOcrEngines,runOcr,ocrDiagnostics}from'../../_shared/studio-v2/ocr-service.js';
import{pushUndoRedo}from'../../_shared/studio-v2/undo-redo.js';
const manifest={
 id:'ocr-studio',sourcePath:'APP-Applications/ocr-studio/v2/index.html',name:'OCR Studio',subtitle:'OCR multi-engine · local-first',
 homeHref:'../../',studiosHref:'../studios/',
 capabilities:[
  {id:'ocr.image.text',status:'test'},
  {id:'ocr.language.auto',status:'test'},
  {id:'ocr.engine.registry',status:'test'},
  {id:'ocr.export.text',status:'stable'},
  {id:'ocr.history.undo-redo',status:'test',engine:'studio-core.undo-redo'}
 ],
 menus:[{id:'home',label:'Accueil',scope:'core'},{id:'tools',label:'OCR',scope:'studio'},{id:'history',label:'Historique',scope:'core'},{id:'help',label:'Aide',scope:'core'}],
 ribbon:[{id:'file',label:'Fichier',scope:'core',items:[
  {id:'ocr-open',action:'open',label:'Ouvrir',icon:'file',scope:'core',primary:true},
  {id:'ocr-run',action:'run',label:'Reconnaître',icon:'ocr',scope:'studio',capability:'ocr.image.text'},
  {id:'ocr-save',action:'save',label:'Exporter',icon:'save',scope:'core'}
 ]}]
};
const VERSION_INFO=await resolveStudioVersions({versionsHref:'./versions.json',coreVersionHref:'../_shared/studio-v2/version.json',channel:'test',sourcePath:manifest.sourcePath});
applyVersionDocumentMeta({studioName:manifest.name,studioVersion:VERSION_INFO.version,studioStatus:VERSION_INFO.status,coreVersion:VERSION_INFO.coreVersion,build:VERSION_INFO.build});
await mountStudioV2({manifest,versionInfo:VERSION_INFO});
const $=s=>document.querySelector(s);let source=null,sourceName='',txnMute=false,textTxnTimer=null,lastText='';
const status=m=>{$('#status').textContent=m;const x=$('#studioStatusText');if(x)x.textContent=m};
function snapshot(){return{source,sourceName,out:$('#out').value,meta:$('#meta').textContent,engine:$('#engine').value,lang:$('#lang').value}}
function publishOcrContext(sourceEvent='ocr-studio'){const active=source?{name:sourceName,src:source}:null;document.dispatchEvent(new CustomEvent('studio-v2:selection-change',{detail:{selection:active?[active]:[],active,scope:'document',kind:'ocr-result',meta:{sourceName,hasSource:!!source,textLength:$('#out').value.length,engine:$('#engine').value,language:$('#lang').value},source:sourceEvent}}))}
function restore(snap,sourceEvent='undo-redo'){txnMute=true;source=snap.source||null;sourceName=snap.sourceName||'';$('#preview').src=source||'';$('#out').value=snap.out||'';lastText=$('#out').value;$('#meta').textContent=snap.meta||'Aucun résultat.';if(snap.engine)$('#engine').value=snap.engine;if(snap.lang)$('#lang').value=snap.lang;status(source?'Image chargée : '+sourceName:'Prêt.');publishOcrContext(sourceEvent);txnMute=false}
function transact(label,before,after){pushUndoRedo({label,meta:{studio:'ocr-studio'},undo:()=>restore(before,'undo'),redo:()=>restore(after,'redo')})}
function use(src,name='image'){const before=snapshot();source=src;sourceName=name;$('#preview').src=src;$('#out').value='';lastText='';$('#meta').textContent='Aucun résultat.';status('Image chargée : '+name);publishOcrContext('source');if(!txnMute)transact('Charger '+name,before,snapshot())}
const engines=availableOcrEngines();$('#engine').innerHTML=engines.map(e=>'<option value="'+e.id+'" '+(e.status==='unavailable'?'disabled':'')+'>'+e.label+' · '+e.status+'</option>').join('');
$('#engineList').innerHTML=engines.map(e=>'<div class="engineRow"><span>'+e.label+'</span><span>'+e.status+'</span></div>').join('');
$('#diag').textContent=JSON.stringify(ocrDiagnostics(),null,2);
$('#file').onchange=e=>{const f=e.target.files?.[0];if(f)use(URL.createObjectURL(f),f.name)};
$('#drop').onclick=()=>$('#file').click();$('#drop').onkeydown=e=>{if(e.key==='Enter'||e.key===' ')$('#file').click()};
for(const ev of ['dragenter','dragover'])$('#drop').addEventListener(ev,e=>{e.preventDefault();e.currentTarget.classList.add('drag')});
for(const ev of ['dragleave','drop'])$('#drop').addEventListener(ev,e=>{e.preventDefault();e.currentTarget.classList.remove('drag')});
$('#drop').addEventListener('drop',e=>{const f=e.dataTransfer.files?.[0];if(f)use(URL.createObjectURL(f),f.name)});
$('#demo').onclick=()=>use('../../Library/demo/files/demo-input/Images/demo-document-illustration.png','demo-document-illustration.png');
$('#noisy').onclick=()=>use('../../Library/demo/Images/testNumeregles 2.jpg','testNumeregles 2.jpg');
async function normalizedOcrInput(){
 const image=$('#preview');if(image.decode)await image.decode().catch(()=>{});
 if(!image.naturalWidth||!image.naturalHeight)throw new Error('Image non décodée');
 const cv=document.createElement('canvas');cv.width=image.naturalWidth;cv.height=image.naturalHeight;cv.getContext('2d').drawImage(image,0,0);
 return cv.toDataURL('image/png')
}
async function run(){
 if(!source)return status('Charge une image.');
 try{
  status('OCR en cours…');
  const input=await normalizedOcrInput();
  const res=await runOcr(input,{engine:$('#engine').value,language:$('#lang').value,logger:m=>status((m.status||'OCR')+(m.progress!=null?' '+Math.round(m.progress*100)+' %':'') )});
  const before=snapshot();txnMute=true;$('#out').value=res.text;lastText=res.text;
  $('#meta').textContent='Moteur '+res.engine+' · pack '+res.effectivePack+' · langue détectée '+res.detectedLanguage+' · confiance langue '+Math.round((res.languageConfidence||0)*100)+' %'+(res.confidence!=null?' · OCR '+Math.round(res.confidence)+' %':'');
  status('OCR terminé.');txnMute=false;publishOcrContext('ocr');transact('Reconnaître le texte OCR',before,snapshot());
 }catch(e){status('Erreur OCR : '+(e?.message||e))}
}
$('#out').addEventListener('input',()=>{if(txnMute)return;clearTimeout(textTxnTimer);textTxnTimer=setTimeout(()=>{const afterText=$('#out').value,beforeText=lastText;if(afterText===beforeText)return;const after=snapshot(),before={...after,out:beforeText};lastText=afterText;transact('Modifier le texte OCR',before,after);publishOcrContext('text-edit')},250)});
$('#engine').addEventListener('change',()=>publishOcrContext('engine'));$('#lang').addEventListener('change',()=>publishOcrContext('language'));
$('#run').onclick=run;$('#save').onclick=()=>{const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([$('#out').value],{type:'text/plain;charset=utf-8'}));a.download=(sourceName||'nlab-ocr').replace(/\.[^.]+$/,'')+'.txt';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000)};$('#copy').onclick=()=>navigator.clipboard?.writeText($('#out').value).then(()=>status('Texte copié.')).catch(()=>status('Copie indisponible.'));
document.addEventListener('studio-v2:action',e=>{if(e.detail?.action==='open')$('#file').click();if(e.detail?.action==='run')run();if(e.detail?.action==='save')$('#save').click()});publishOcrContext('ready');
