(()=>{'use strict';
if(window.__NLAB_0918_WORKSPACE__)return;
window.__NLAB_0918_WORKSPACE__=true;
const $w=id=>document.getElementById(id);
const WORKSPACE_KEY0918=(PROFILE.storagePrefix||'nlab-pdf')+'-workspace-v2';
const WORKSPACE_SCHEMA0918='nlab.pdfstudio.workspace/v2';
const WORKSPACE_FILE0918='nlab-pdf-studio-workspace.json';
function clone(v){return JSON.parse(JSON.stringify(v))}
function baseWorkspace(){return{
 schema:WORKSPACE_SCHEMA0918,version:2,updatedAt:new Date().toISOString(),
 identity:{initials:''},placeholders:{CLIENT:'',SITE:'',SERVICE:'',REFERENCE:''},
 variables:{formats:clone(window.NLAB_VARIABLES_0918?.defaults||{})},
 output:{mode:'archive-date',archiveGranularity:'month',preserveSourceTree:false,operationFolder:'TRAITEMENT',filenameTemplate:'{FILENAME}_traite_{DATE}.pdf',technicalSuffixes:{enabled:true,ocr:true,dpi:true,jpeg:true,gray:true,annot:true,fusion:true},naming:{presets:[],activeIds:[]},drive:{autoUploadExports:false}},
 stamps:{defaultId:'',favorites:[],library:[]},
 signatures:{defaultSignatureId:'',defaultParapheId:'',items:[]},
 favorites:{sources:[],outputs:[],extensions:['pdf']},
 editor:{text:{},stampStyle:{},highlight:{},image:{},optimization:{},ocr:{}},
 ui:{}
};}
function merge(a,b){if(!b||typeof b!=='object')return a;for(const [k,v] of Object.entries(b)){if(v&&typeof v==='object'&&!Array.isArray(v)){a[k]=merge(a[k]&&typeof a[k]==='object'&&!Array.isArray(a[k])?a[k]:{},v)}else a[k]=v}return a}
function normalize(v){return merge(baseWorkspace(),v&&typeof v==='object'?v:{})}
function fromLegacy(){
 const w=baseWorkspace();
 let cfg=null;try{cfg=typeof captureUserConfig==='function'?captureUserConfig():S.userConfig}catch(e){cfg=S.userConfig}
 cfg=cfg||{};const p=window.__NLAB_PERSONAL_PROFILE_0917__||{};
 w.identity.initials=cfg.operator?.initials||p.identity?.initials||'';
 w.placeholders=Object.assign(w.placeholders,cfg.placeholders||{});
 w.output=Object.assign(w.output,cfg.output||{});w.output.naming=clone(p.naming||w.output.naming);
 w.stamps.defaultId=cfg.stamp?.defaultId||p.defaults?.stampId||'';w.stamps.favorites=clone(p.favorites?.stamps||[]);w.stamps.library=clone(S.stampLibrary||[]);
 w.signatures.defaultSignatureId=p.defaults?.signatureId||'';w.signatures.defaultParapheId=p.defaults?.parapheId||'';w.signatures.items=clone(S.signatureLibrary||[]);
 w.favorites.sources=clone(p.favorites?.sources||[]);w.favorites.outputs=clone(p.favorites?.outputs||[]);w.favorites.extensions=clone(p.favorites?.extensions||['pdf']);
 w.editor={text:clone(cfg.text||{}),stampStyle:clone(cfg.stamp||{}),highlight:clone(cfg.highlight||{}),image:clone(cfg.image||{}),optimization:clone(cfg.optimization||{}),ocr:clone(cfg.ocr||{})};
 w.ui={sidebarMode:S.sidebarMode||'full'};return normalize(w);
}
function loadLocal(){try{const x=JSON.parse(localStorage.getItem(WORKSPACE_KEY0918)||'null');return x?normalize(x):fromLegacy()}catch(e){return fromLegacy()}}
let workspace=loadLocal();
function saveLocal(){workspace.updatedAt=new Date().toISOString();localStorage.setItem(WORKSPACE_KEY0918,JSON.stringify(workspace));return workspace}
function capture(){
 const legacy=fromLegacy();
 workspace=merge(workspace,legacy);
 workspace.schema=WORKSPACE_SCHEMA0918;workspace.version=2;workspace.updatedAt=new Date().toISOString();
 const vars=window.NLAB_VARIABLES_0918?.defaults||{};workspace.variables.formats=Object.assign({},vars,workspace.variables?.formats||{});
 saveLocal();window.__NLAB_WORKSPACE_0918__=api;return workspace;
}
function apply(w,{persist=true}={}){
 workspace=normalize(w);window.__NLAB_WORKSPACE_0918__=api;
 if(persist)saveLocal();
 const cfg={schema:'nlab-pdf-config/v1',name:'nLab Workspace',operator:{initials:workspace.identity.initials||''},placeholders:workspace.placeholders||{},output:Object.assign({},workspace.output),text:workspace.editor.text||{},stamp:Object.assign({},workspace.editor.stampStyle||{},{defaultId:workspace.stamps.defaultId||''}),highlight:workspace.editor.highlight||{},image:workspace.editor.image||{},optimization:workspace.editor.optimization||{},ocr:workspace.editor.ocr||{},stamps:workspace.stamps.library||[]};
 delete cfg.output.naming;delete cfg.output.drive;delete cfg.output.technicalSuffixes;
 try{applyUserConfig(cfg,{persist:false,notify:false})}catch(e){console.warn('workspace apply config',e)}
 if(Array.isArray(workspace.stamps.library)){S.stampLibrary=clone(workspace.stamps.library);try{renderStampLibrary()}catch(e){}}
 if(Array.isArray(workspace.signatures.items)){S.signatureLibrary=clone(workspace.signatures.items);try{renderSignatureLibrary()}catch(e){}}
 const p=window.__NLAB_PERSONAL_PROFILE_0917__;if(p){p.identity={initials:workspace.identity.initials||''};p.defaults=Object.assign({},p.defaults||{},{stampId:workspace.stamps.defaultId||'',signatureId:workspace.signatures.defaultSignatureId||'',parapheId:workspace.signatures.defaultParapheId||'',outputMode:workspace.output.mode||'',filenameTemplate:workspace.output.filenameTemplate||''});p.favorites={stamps:clone(workspace.stamps.favorites||[]),sources:clone(workspace.favorites.sources||[]),outputs:clone(workspace.favorites.outputs||[]),extensions:clone(workspace.favorites.extensions||['pdf'])};p.naming=clone(workspace.output.naming||{presets:[],activeIds:[]});try{window.__NLAB_PROFILE_API_0917__?.saveLocal()}catch(e){}}
 try{window.__NLAB_RENDER_NAMING_0917__?.()}catch(e){};try{updatePath()}catch(e){};renderPanel();return workspace;
}
function exportJson(){capture();const blob=new Blob([JSON.stringify(workspace,null,2)+'\n'],{type:'application/json'}),a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=WORKSPACE_FILE0918;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000)}
async function importFile(file){if(!file)return;const x=JSON.parse(await file.text());if(!x||typeof x!=='object')throw new Error('JSON invalide');apply(x);toast('Workspace JSON importé')}
function updateFormatsFromUi(){const box=$w('workspaceFormats0918');if(!box)return;box.querySelectorAll('[data-format0918]').forEach(i=>workspace.variables.formats[i.dataset.format0918]=i.value.trim());saveLocal();try{updatePath()}catch(e){}}
function panelHtml(){
 const f=workspace.variables.formats||{};
 return '<details id="workspacePanel0918" class="userConfigBox" open><summary>Espace personnel nLab — configuration JSON unique</summary><div class="userConfigBody">'+
 '<div class="workspaceStatus0918" id="workspaceStatus0918">Workspace local prêt.</div>'+
 '<p class="userConfigHelp">Un seul fichier <code>'+WORKSPACE_FILE0918+'</code> regroupe identité, formats de variables, tampons, favoris, préférences, règles de nommage et références de signatures. Les images de signature peuvent rester comme fichiers séparés dans le dossier Drive, référencés par ce JSON.</p>'+
 '<div class="row"><button id="workspaceConnect0918" type="button">Se connecter avec Google</button><button id="workspaceLoadDrive0918" type="button">Charger depuis Drive</button><button id="workspaceSaveDrive0918" type="button">Synchroniser vers Drive</button></div>'+
 '<div class="row"><button id="workspaceImport0918" type="button">Importer workspace JSON</button><button id="workspaceExport0918" type="button">Exporter workspace JSON</button><button id="workspaceCapture0918" type="button">Capturer les réglages actuels</button></div><input id="workspaceFile0918" type="file" accept=".json,application/json" hidden>'+
 '<details class="variableHelp"><summary>Formats par défaut date/heure</summary><div id="workspaceFormats0918" class="workspaceFormats0918">'+
 ['NOW','DATE','TIME','DATETIME','TIMESTAMP','STAMP_DATE','STAMP_DATETIME','DATE_A','DATE_B','DATE_C','DATE_D'].map(k=>'<label><span>'+k+'</span><input data-format0918="'+k+'" value="'+String(f[k]||'').replace(/"/g,'&quot;')+'"></label>').join('')+
 '<div class="userConfigHelp">Tokens : YYYY YY MMMM MMM MM M DD D HH H mm m ss s SSS Z ZZ X x. Exemple timestamp : <code>YYYYMMDD_HHmmss</code>.</div></div></details>'+
 '<label class="checkline"><input id="workspaceAutoUpload0918" type="checkbox" '+(workspace.output.drive?.autoUploadExports?'checked':'')+'> Copier automatiquement les PDF exportés dans Google Drive / nLab / PDF Studio / Exports</label>'+
 '</div></details>';
}
function renderPanel(msg){
 let p=$w('workspacePanel0918');if(!p){const old=$w('userConfigStatus')?.closest('details.userConfigBox');if(!old)return;const wrap=document.createElement('div');wrap.innerHTML=panelHtml();old.replaceWith(wrap.firstElementChild);p=$w('workspacePanel0918')}else{const open=p.open;p.outerHTML=panelHtml();p=$w('workspacePanel0918');p.open=open}
 const st=$w('workspaceStatus0918');if(st&&msg)st.textContent=msg;
 const f=$w('workspaceFile0918');$w('workspaceImport0918').onclick=()=>f.click();f.onchange=()=>importFile(f.files?.[0]).catch(e=>toast(e.message));
 $w('workspaceExport0918').onclick=exportJson;$w('workspaceCapture0918').onclick=()=>{capture();renderPanel('Réglages capturés dans le workspace local.');toast('Workspace actualisé')};
 $w('workspaceConnect0918').onclick=()=>connectGoogleDrive();
 $w('workspaceLoadDrive0918').onclick=()=>window.__NLAB_DRIVE_0918__?.loadWorkspace?.().catch(e=>toast(e.message));
 $w('workspaceSaveDrive0918').onclick=()=>window.__NLAB_DRIVE_0918__?.saveWorkspace?.().catch(e=>toast(e.message));
 $w('workspaceFormats0918')?.querySelectorAll('input').forEach(i=>i.onchange=updateFormatsFromUi);
 $w('workspaceAutoUpload0918').onchange=()=>{workspace.output.drive=workspace.output.drive||{};workspace.output.drive.autoUploadExports=$w('workspaceAutoUpload0918').checked;saveLocal()};
 if($w('personalStamp0916'))$w('personalStamp0916').style.display='none';if($w('personalWorkspace0917'))$w('personalWorkspace0917').style.display='none';
}
const api={get:()=>workspace,capture,apply,saveLocal,exportJson,importFile,render:renderPanel,fileName:WORKSPACE_FILE0918,schema:WORKSPACE_SCHEMA0918};
window.__NLAB_WORKSPACE_0918__=api;
function install(){renderPanel();}
const mo=new MutationObserver(()=>setTimeout(install,0));if(E.form)mo.observe(E.form,{childList:true,subtree:true});
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(install,500),{once:true});else setTimeout(install,500);
})();