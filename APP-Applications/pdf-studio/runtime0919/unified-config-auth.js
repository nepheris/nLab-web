(()=>{'use strict';
if(window.__NLAB_0919_UNIFIED_CONFIG__)return;
window.__NLAB_0919_UNIFIED_CONFIG__=true;
const VERSION0919='Alpha 0.9.19 TEST';
const APP_CONFIG_URL0919='./config/app-config.v1.json';
const $19=id=>document.getElementById(id);
const LEGACY_DATE_ALIASES0919={STAMP_DATE_FMT:'STAMP_DATE',DATE_A_FMT:'DATE_A',DATE_B_FMT:'DATE_B',DATE_C_FMT:'DATE_C',DATE_D_FMT:'DATE_D'};
const DATE_DEFS0919=[
 {key:'STAMP_DATE',label:'Date du tampon',source:'stampHubDateSTAMP0916'},
 {key:'DATE_A',label:'Date A',source:'stampHubDateA0916'},
 {key:'DATE_B',label:'Date B',source:'stampHubDateB0916'},
 {key:'DATE_C',label:'Date C',source:'stampHubDateC0916'},
 {key:'DATE_D',label:'Date D',source:'stampHubDateD0916'}
];
let appConfig0919=null;
let saveTimer0919=null;
function clone0919(v){return JSON.parse(JSON.stringify(v))}
function mergeDefaults0919(defaults,current){
 if(Array.isArray(current))return clone0919(current);
 if(current&&typeof current==='object'){
  const out={};
  const d=defaults&&typeof defaults==='object'&&!Array.isArray(defaults)?defaults:{};
  for(const k of new Set([...Object.keys(d),...Object.keys(current)]))out[k]=mergeDefaults0919(d[k],current[k]);
  return out;
 }
 return current===undefined?clone0919(defaults):current;
}
function workspaceApi0919(){return window.__NLAB_WORKSPACE_0918__||null}
function workspace0919(){return workspaceApi0919()?.get?.()||null}
function formats0919(){
 const ws=workspace0919();
 return Object.assign({},appConfig0919?.variables?.formats||{},window.NLAB_VARIABLES_0918?.defaults||{},ws?.variables?.formats||{});
}
function formatDate0919(value,pattern){return window.NLAB_VARIABLES_0918?.formatDate?.(value,pattern)||String(value??'')}
function context0919(extra={}){
 const c=window.NLAB_VARIABLES_0918?.context?.(extra)||{};
 return Object.assign(c,extra||{});
}
function render0919(template,extra={}){
 const c=context0919(extra),fm=formats0919();
 return String(template||'').replace(/\{([A-Z0-9_]+)(?:(?::|\|)([^}]+))?\}/g,(m,key,pattern)=>{
  const canonical=LEGACY_DATE_ALIASES0919[key]||key;
  if(!(canonical in c))return m;
  const value=c[canonical];
  if(value instanceof Date)return formatDate0919(value,pattern||fm[canonical]||'YYYY-MM-DD');
  if(LEGACY_DATE_ALIASES0919[key])return formatDate0919(value,pattern||fm[canonical]||'YYYY-MM-DD');
  return String(value??'');
 });
}
window.NLAB_VARIABLES=Object.assign({},window.NLAB_VARIABLES_0918||{}, {render:render0919,formats:formats0919,legacyAliases:clone0919(LEGACY_DATE_ALIASES0919)});
if(window.NLAB_VARIABLES_0918)window.NLAB_VARIABLES_0918.render=render0919;

resolveStampTemplate=function(tpl,stampDate){
 const extra={};
 if(stampDate){const d=new Date(String(stampDate).length===10?stampDate+'T00:00:00':stampDate);if(!Number.isNaN(d.getTime()))extra.STAMP_DATE=d;}
 return render0919(tpl,extra);
};
templateQuickText=function(raw){return render0919(raw)};
footerTextValue=function(raw=null,pageNo=1,totalPages=1){
 const src=raw??E.form?.querySelector('[name=footerText]')?.value??'';
 return render0919(src,{PAGE:String(pageNo),PAGES:String(totalPages)});
};
outName=function(name=S.workingName||current()?.name||'document.pdf'){
 const n=split(name),raw=(E.tpl?.value||workspace0919()?.output?.filenameTemplate||'{FILENAME}.pdf'),ctx={FILENAME:safe(n.stem),STEM:safe(n.stem),EXT:'pdf'};
 let rendered=safe(render0919(raw,ctx));
 if(!/\.pdf$/i.test(rendered))rendered+='.pdf';
 const tech=typeof operationSuffix==='function'?operationSuffix():'';
 if(tech&&!rendered.toUpperCase().includes(tech.toUpperCase()))rendered=rendered.replace(/\.pdf$/i,'')+safe(tech)+'.pdf';
 const stamps=(S.annotations||[]).filter(a=>a.type==='stamp'&&(a.filePrefix||a.fileSuffix));
 const prefixes=[...new Set(stamps.map(a=>a.filePrefix).filter(Boolean))],suffixes=[...new Set(stamps.map(a=>a.fileSuffix).filter(Boolean))];
 for(const p0 of prefixes){const p=safe(render0919(p0));if(p&&!rendered.startsWith(p))rendered=p+rendered;}
 for(const s0 of suffixes){const sx=safe(render0919(s0));if(sx&&!rendered.toUpperCase().includes(sx.toUpperCase()))rendered=rendered.replace(/\.pdf$/i,'')+sx+'.pdf';}
 const rules=window.__NLAB_NAMING_API_0917__?.active?.()||[];
 for(const rule of rules){const a=safe(render0919(rule.template));if(!a)continue;if(rule.position==='prefix'){if(!rendered.startsWith(a))rendered=a+rendered;}else if(!rendered.toUpperCase().includes(a.toUpperCase()))rendered=rendered.replace(/\.pdf$/i,'')+a+'.pdf';}
 return rendered;
};

function personalStampItems0919(items){
 const globals=new Map((appConfig0919?.stamps?.library||[]).map(x=>[x.id,x]));
 return (items||[]).filter(x=>{const g=globals.get(x?.id);return !g||JSON.stringify(g)!==JSON.stringify(x)}).map(clone0919);
}
function syncWorkspaceStamps0919(){
 const api=workspaceApi0919();if(!api)return;
 const ws=api.get();ws.stamps=ws.stamps||{};ws.stamps.library=personalStampItems0919(S.stampLibrary||[]);api.saveLocal();
}
persistCustomStamps=function(){syncWorkspaceStamps0919()};
function scheduleCapture0919(){clearTimeout(saveTimer0919);saveTimer0919=setTimeout(()=>{try{workspaceApi0919()?.capture?.()}catch(e){}},250)}

function canonicalSetGoogleDriveUi0919(){
 const gate=$19('googleDriveGate'),state=$19('googleDriveState'),connect=$19('googleDriveConnect'),disconnect=$19('googleDriveDisconnect'),configured=!!googleDriveClientId();
 if(gate)gate.classList.toggle('connected',!!S.driveConnected);
 if(state)state.textContent=S.driveConnected?'Google Drive connecté · workspace personnel unique':configured?'Mode public · connexion Google disponible':'Mode public · Client ID OAuth Google à configurer';
 if(connect){connect.hidden=!!S.driveConnected;connect.disabled=!configured;connect.title=configured?'Ouvrir votre espace personnel Google Drive':'Client ID OAuth Web Google non configuré';}
 if(disconnect)disconnect.hidden=!S.driveConnected;
 try{updatePersonalFeatureGate()}catch(e){}
 try{workspaceApi0919()?.render?.()}catch(e){}
 updateRibbon0919();
}
setGoogleDriveUi=canonicalSetGoogleDriveUi0919;

// APP13 trust-service authentication is deliberately independent from Google Drive OAuth.
dssFetch0916=async function(path,options={}){
 const base=typeof dssUrl0916==='function'?dssUrl0916():'';
 if(!base)throw new Error('Configurez d’abord l’URL du service nLab DSS.');
 const r=await fetch(base+path,Object.assign({credentials:'include'},options));
 if(!r.ok)throw new Error('DSS HTTP '+r.status+' · '+await r.text());
 return r;
};

function mergeStampLibraries0919(globalItems,personalItems){
 const map=new Map();
 for(const item of [...(globalItems||[]),...(personalItems||[])]){if(item&&item.id&&item.label&&item.template)map.set(item.id,clone0919(item));}
 return [...map.values()];
}
function applyCanonicalStampLibrary0919(){
 const globalItems=appConfig0919?.stamps?.library||[],personalItems=workspace0919()?.stamps?.library||[];
 const merged=mergeStampLibraries0919(globalItems,personalItems);
 if(!merged.length)return;
 S.stampLibrary=merged;
 try{renderStampLibrary()}catch(e){}
 try{renderEditorOptions()}catch(e){}
}

function sourceDate0919(def){return $19(def.source)}
function installCanonicalDates0919(){
 const hub=$19('stampHub0916');if(!hub||$19('canonicalStampDates0919'))return;
 const legacy=hub.querySelector('.stampDates0916');if(legacy)legacy.style.display='none';
 const d=document.createElement('details');d.id='canonicalStampDates0919';d.className='canonicalStampDates0919';d.open=true;
 d.innerHTML='<summary>📅 Dates du tampon · 5 dates + formats</summary><div class="canonicalDatesHelp0919"><b>Même syntaxe partout :</b> <code>{VARIABLE}</code> ou <code>{VARIABLE:FORMAT}</code>. Formats : <code>YYYY</code> année · <code>MM</code> mois · <code>DD</code> jour · <code>HH</code> heure · <code>mm</code> minute · <code>ss</code> seconde · <code>SSS</code> millisecondes · <code>Z</code> fuseau · <code>X</code> timestamp Unix. Exemple : <code>{STAMP_DATE:YYYYMMDD_HHmmss}</code>.</div><div class="canonicalDatesGrid0919"></div>';
 const grid=d.querySelector('.canonicalDatesGrid0919'),fm=formats0919();
 for(const def of DATE_DEFS0919){
  const src=sourceDate0919(def),row=document.createElement('div');row.className='canonicalDateRow0919';
  row.innerHTML='<b>'+def.label+'</b><input type="date" data-date0919="'+def.key+'"><input type="text" data-format0919="'+def.key+'" aria-label="Format '+def.label+'"><code>{'+def.key+'}</code>';
  const dateInput=row.querySelector('[data-date0919]'),fmtInput=row.querySelector('[data-format0919]');
  dateInput.value=src?.value||today();fmtInput.value=fm[def.key]||'DD/MM/YYYY';
  dateInput.addEventListener('input',()=>{const x=sourceDate0919(def);if(x){x.value=dateInput.value||today();x.dispatchEvent(new Event('input',{bubbles:true}));}scheduleCapture0919();});
  fmtInput.addEventListener('change',()=>{const api=workspaceApi0919(),ws=api?.get?.();if(ws){ws.variables=ws.variables||{};ws.variables.formats=ws.variables.formats||{};ws.variables.formats[def.key]=fmtInput.value.trim()||'DD/MM/YYYY';api.saveLocal();}const x=sourceDate0919(def);if(x)x.dispatchEvent(new Event('input',{bubbles:true}));try{updateStampPreview()}catch(e){}try{updatePath()}catch(e){}});
  grid.appendChild(row);
 }
 const target=hub.querySelector('.stampSteps0916');if(target)target.after(d);else hub.prepend(d);
}
function syncCanonicalDates0919(){
 const panel=$19('canonicalStampDates0919');if(!panel)return;
 for(const def of DATE_DEFS0919){const x=panel.querySelector('[data-date0919="'+def.key+'"]'),src=sourceDate0919(def);if(x&&src&&document.activeElement!==x)x.value=src.value||today();}
}

function workspacePanel0919(){return $19('workspacePanel0918')}
function openPersonalSpace0919(){
 const p=workspacePanel0919();if(p){p.open=true;p.scrollIntoView({behavior:'smooth',block:'start'});return true}
 toast(S.driveConnected?'Espace personnel connecté. Ouvrez un outil PDF pour afficher sa configuration.':'Ouvrez un outil PDF pour afficher la configuration de l’espace personnel.');return false;
}
function updateRibbon0919(){
 const btn=$19('personalSpaceRibbon0919'),stateEl=$19('personalSpaceState0919');if(!btn)return;
 const driveState=window.__NLAB_DRIVE_0918__?.state?.(),email=driveState?.user?.email||'';
 btn.classList.toggle('connected',!!S.driveConnected);
 btn.textContent=S.driveConnected?'👤 Espace personnel':'🔐 Se connecter';
 btn.title=S.driveConnected?(email?'Connecté : '+email:'Espace personnel Google Drive connecté'):(googleDriveClientId()?'Sélectionner un compte Google':'Client ID OAuth Google à configurer');
 if(stateEl)stateEl.textContent=S.driveConnected?(email||'Connecté'):'Local';
}
function installRibbon0919(){
 const meta=document.querySelector('header .headerMeta')||document.querySelector('header');if(!meta||$19('personalSpaceRibbon0919'))return;
 const wrap=document.createElement('div');wrap.className='personalSpaceRibbonWrap0919';wrap.innerHTML='<button id="personalSpaceRibbon0919" type="button">🔐 Se connecter</button><span id="personalSpaceState0919">Local</span>';
 meta.appendChild(wrap);
 $19('personalSpaceRibbon0919').onclick=()=>{if(!S.driveConnected){if(!googleDriveClientId()){openPersonalSpace0919();toast('Client ID OAuth Google non configuré.');return}connectGoogleDrive();return}openPersonalSpace0919();};
 updateRibbon0919();
}
function enhanceWorkspacePanel0919(){
 const p=workspacePanel0919();if(!p||$19('workspaceCanonicalNote0919'))return;
 const body=p.querySelector('.userConfigBody');if(!body)return;
 const note=document.createElement('div');note.id='workspaceCanonicalNote0919';note.className='workspaceCanonicalNote0919';note.innerHTML='<b>Configuration personnelle unique :</b> <code>nlab-pdf-studio-workspace.json</code>. Tampons, formats, nommage, favoris, préférences et références de signatures sont synchronisés dans ce fichier visible dans <code>Mon Drive / nLab / PDF Studio</code>. Les anciens JSON <code>appDataFolder</code> sont uniquement conservés pour migration/retour arrière et ne sont plus la source active.';
 body.prepend(note);
 if(!$19('workspaceDisconnect0919')){const b=document.createElement('button');b.id='workspaceDisconnect0919';b.type='button';b.textContent='Déconnecter mon espace Google';b.onclick=()=>{disconnectGoogleDrive();updateRibbon0919()};body.appendChild(b);}
}
function addStyle0919(){
 if($19('nlab0919Style'))return;const st=document.createElement('style');st.id='nlab0919Style';st.textContent=
 '.personalSpaceRibbonWrap0919{display:flex;align-items:center;gap:6px;border-left:1px solid #d7dde3;padding-left:8px}.personalSpaceRibbonWrap0919 button{font-weight:800;background:#f4f8fb;border-color:#a9bfd0}.personalSpaceRibbonWrap0919 button.connected{background:#eaf6ee;border-color:#93c7a0;color:#215d2e}.personalSpaceRibbonWrap0919 span{font-size:10px;color:#65717d;max-width:170px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.canonicalStampDates0919{border:1px solid #9fc2db;background:#f7fbfe;border-radius:8px;margin:8px 0}.canonicalStampDates0919>summary{cursor:pointer;font-weight:800;padding:8px 9px}.canonicalDatesHelp0919{font-size:10px;line-height:1.55;padding:0 9px 8px;color:#465d6c}.canonicalDatesGrid0919{display:grid;gap:5px;padding:0 9px 9px}.canonicalDateRow0919{display:grid;grid-template-columns:105px 150px minmax(180px,1fr) 120px;gap:6px;align-items:center}.canonicalDateRow0919 b{font-size:10px}.canonicalDateRow0919 input{padding:6px;font-size:10px}.canonicalDateRow0919 code{font-size:10px;color:#174f78;white-space:nowrap}.workspaceCanonicalNote0919{border:1px solid #b9d8c3;background:#f3fbf5;border-radius:8px;padding:8px;margin-bottom:8px;font-size:10px;line-height:1.5}@media(max-width:760px){.canonicalDateRow0919{grid-template-columns:1fr}.personalSpaceRibbonWrap0919 span{display:none}}';document.head.appendChild(st);
}
async function loadAppConfig0919(){
 try{
  const r=await fetch(APP_CONFIG_URL0919,{cache:'no-store'});if(!r.ok)throw new Error('HTTP '+r.status);appConfig0919=await r.json();window.NLAB_PDF_APP_CONFIG=appConfig0919;
  window.NLAB_GOOGLE_DRIVE_CONFIG=window.NLAB_GOOGLE_DRIVE_CONFIG||{};
  if(appConfig0919?.auth?.google?.clientId)window.NLAB_GOOGLE_DRIVE_CONFIG.clientId=appConfig0919.auth.google.clientId;
  const api=workspaceApi0919();if(api){const merged=mergeDefaults0919(appConfig0919?.workspaceDefaults||{},api.get());api.apply(merged);const ws=api.get();ws.stamps=ws.stamps||{};ws.stamps.library=personalStampItems0919(ws.stamps.library||[]);api.saveLocal();applyCanonicalStampLibrary0919();}
 }catch(e){console.warn('Config globale 0.9.19 indisponible',e);}
 updateRibbon0919();syncCanonicalDates0919();
}
function install0919(){
 addStyle0919();installRibbon0919();installCanonicalDates0919();syncCanonicalDates0919();enhanceWorkspacePanel0919();
 document.querySelectorAll('.buildBadge strong').forEach(x=>x.textContent=VERSION0919);
 const foot=document.querySelector('footer .footerInfo span');if(foot)foot.textContent=(foot.textContent||'').replace(/Alpha 0\.9\.(12|13|14|15|16|17|18)(?: TEST| RC2)?/g,VERSION0919);
}
window.addEventListener('nlab:naming-rules-changed',scheduleCapture0919);
E.form?.addEventListener('change',scheduleCapture0919);
const mo=new MutationObserver(()=>setTimeout(install0919,0));if(document.body)mo.observe(document.body,{childList:true,subtree:true});
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>{setTimeout(install0919,620);setTimeout(loadAppConfig0919,700)},{once:true});else{setTimeout(install0919,620);setTimeout(loadAppConfig0919,700)}
})();