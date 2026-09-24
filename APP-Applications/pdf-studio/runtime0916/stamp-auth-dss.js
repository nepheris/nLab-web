(()=>{'use strict';
if(window.__NLAB_0916_STAMP_AUTH_DSS__)return;
window.__NLAB_0916_STAMP_AUTH_DSS__=true;

const VERSION0916='Alpha 0.9.16 TEST';
const $16=id=>document.getElementById(id);
const q16=(s,r=document)=>r.querySelector(s);
const qa16=(s,r=document)=>[...r.querySelectorAll(s)];
const esc16=s=>String(s??'').replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m]));
const STAMP_DRIVE_FILE_0916='nlab-pdf-studio-stamps-v4.json';
const DSS_URL_KEY_0916=(PROFILE.storagePrefix||'nlab-pdf')+'-dss-service-url-v1';
const GOOGLE_ID_KEY_0916=(PROFILE.storagePrefix||'nlab-pdf')+'-google-oauth-client-id';
let driveStampLoaded0916=false;
let lastStampField0916='stampBuilderTemplate0916';

function addStyle0916(){
  if($16('nlab0916Style'))return;
  const st=document.createElement('style');st.id='nlab0916Style';
  st.textContent=
  '.stampHub0916{border:1px solid #b9cedf;background:#f6fbff;border-radius:10px;padding:10px;margin:9px 0}'+
  '.stampHub0916 h4{margin:0 0 7px;font-size:12px;color:#174f78}.stampSteps0916{font-size:10px;line-height:1.5;background:#fff;border:1px solid #dbe5ec;border-radius:7px;padding:7px;margin-bottom:8px}'+
  '.stampDates0916{display:grid;grid-template-columns:repeat(5,minmax(112px,1fr));gap:6px;margin:7px 0}.stampDates0916 label,.stampBuilderGrid0916 label{font-size:10px;color:#586a77}.stampDates0916 input,.stampBuilderGrid0916 input,.stampBuilderGrid0916 select,.stampBuilderGrid0916 textarea{width:100%;padding:6px}'+
  '.stampVars0916{display:flex;gap:4px;flex-wrap:wrap;margin:7px 0}.stampVars0916 button{font:10px ui-monospace,monospace;padding:4px 6px}.stampBuilderGrid0916{display:grid;grid-template-columns:1fr 1fr;gap:6px}.stampBuilderGrid0916 .wide{grid-column:1/-1}'+
  '.stampPreview0916{white-space:pre-wrap;border:1px dashed #94aec1;background:#fff;border-radius:7px;padding:8px;min-height:44px;font-size:11px}.stampFilename0916{display:block;margin-top:5px;font:10px ui-monospace,monospace;word-break:break-all;color:#31536c}'+
  '.personalStamp0916,.dssBox0916,.sectionIntro0916{font-size:10px;line-height:1.5;border-radius:7px}.personalStamp0916{border:1px solid #c4d9e8;background:#f7fbfe;padding:8px;margin-top:8px}.dssBox0916{border:1px solid #cbd8df;background:#f8fafb;padding:9px;margin-top:9px}.sectionIntro0916{background:#f7f9fb;border:1px solid #e0e6eb;padding:6px 7px;margin-bottom:8px;color:#566875}'+
  '.authState0916{font-weight:800}.authState0916.ok{color:#266038}.authState0916.warn{color:#805b00}.stampJsonEditor0916{width:100%;min-height:150px;font:10px/1.4 ui-monospace,monospace;margin-top:7px}'+
  '.quickStampDates0916{display:flex;gap:4px;align-items:center;overflow-x:auto;max-width:100%}.quickStampDates0916 label{display:flex;align-items:center;gap:2px;font-size:9px;white-space:nowrap}.quickStampDates0916 input{width:112px;height:29px;font-size:10px;padding:2px 4px}'+
  '.stampExampleBtns0916{display:flex;gap:5px;flex-wrap:wrap;margin:6px 0}.stampExampleBtns0916 button{font-size:10px;padding:5px 7px}.dssStatus0916{white-space:pre-wrap;font:10px/1.45 ui-monospace,monospace;background:#fff;border:1px solid #dce4e9;border-radius:6px;padding:7px;margin-top:7px;max-height:190px;overflow:auto}'+
  '.layout.sidebarCompact .sectionIntro0916{display:none}.toolSection>summary[title]:after{content:"ⓘ";margin-left:auto;font-size:10px;color:#6b7f8d;font-weight:400}'+
  '@media(max-width:1050px){.stampDates0916{grid-template-columns:repeat(2,minmax(120px,1fr))}}@media(max-width:680px){.stampDates0916,.stampBuilderGrid0916{grid-template-columns:1fr}.stampBuilderGrid0916 .wide{grid-column:auto}}';
  document.head.appendChild(st);
}

function stampSection0916(){
  const main=E.form?.querySelector('[name=stampDate]');
  return main?.closest('details.toolSection')||null;
}
function underlyingDate0916(k){
  if(k==='STAMP')return E.form?.querySelector('[name=stampDate]');
  if(k==='A')return $16('stampDateA0914')||E.form?.querySelector('[name=stampDateAProxy]')||E.form?.querySelector('[name=stampDate]');
  if(k==='B')return E.form?.querySelector('[name=stampDateB]');
  if(k==='C')return E.form?.querySelector('[name=stampDateC]');
  if(k==='D')return $16('stampDateD0915');
  return null;
}
function uiDate0916(k){return $16('stampHubDate'+k+'0916')}
function dateValue0916(k){return uiDate0916(k)?.value||underlyingDate0916(k)?.value||today()}
function allDates0916(){return{stamp:dateValue0916('STAMP'),a:dateValue0916('A'),b:dateValue0916('B'),c:dateValue0916('C'),d:dateValue0916('D')}}
function pushDate0916(k,v){
  const u=underlyingDate0916(k);if(u){u.value=v;u.dispatchEvent(new Event('input',{bubbles:true}));}
  const x=uiDate0916(k);if(x&&x.value!==v)x.value=v;
  try{updateStampPreview()}catch{}
  try{updatePath()}catch{}
  renderStampPreview0916();
}
function syncDates0916(){
  for(const k of ['STAMP','A','B','C','D']){
    const x=uiDate0916(k),u=underlyingDate0916(k);
    if(x&&u&&document.activeElement!==x)x.value=u.value||today();
  }
}
function resolve0916(tpl){
  try{
    for(const k of ['STAMP','A','B','C','D']){const u=underlyingDate0916(k),x=uiDate0916(k);if(u&&x)u.value=x.value||today();}
    return resolveStampTemplate(String(tpl||''),dateValue0916('STAMP'));
  }catch(e){return String(tpl||'')}
}
function filePreview0916(prefix,suffix){
  let name='';
  try{name=outName()}catch{name=(S.workingName||current()?.name||'document.pdf')}
  const p=prefix?safe(resolve0916(prefix)):'',s=suffix?safe(resolve0916(suffix)):'';
  if(p&&!name.startsWith(p))name=p+name;
  if(s&&!name.toUpperCase().includes(s.toUpperCase()))name=name.replace(/\.pdf$/i,'')+s+'.pdf';
  return name;
}
function selectedStampDef0916(){
  try{return typeof stampDefinition==='function'?stampDefinition():null}catch{return null}
}
function loadSelectedStampIntoBuilder0916(){
  const d=selectedStampDef0916();if(!d)return;
  const map={
    stampBuilderLabel0916:d.label||'',
    stampBuilderCategory0916:d.category||'Personnalisés',
    stampBuilderTemplate0916:d.template||'',
    stampBuilderPrefix0916:d.prefix||'',
    stampBuilderSuffix0916:d.suffix||''
  };
  for(const [id,v] of Object.entries(map)){const x=$16(id);if(x)x.value=v}
  const pe=$16('stampBuilderPrefixOn0916'),se=$16('stampBuilderSuffixOn0916');
  if(pe)pe.checked=d.prefixEnabled!==false&&!!(d.prefix||'');
  if(se)se.checked=d.suffixEnabled!==false&&!!(d.suffix||'');
  renderStampPreview0916();
}
function renderStampPreview0916(){
  const box=$16('stampResolvedPreview0916'),fn=$16('stampFilenamePreview0916');
  if(!box)return;
  const tpl=$16('stampBuilderTemplate0916')?.value||E.form?.querySelector('[name=stampText]')?.value||selectedStampDef0916()?.template||'';
  box.textContent=resolve0916(tpl)||'—';
  const p=$16('stampBuilderPrefixOn0916')?.checked?($16('stampBuilderPrefix0916')?.value||''):'';
  const s=$16('stampBuilderSuffixOn0916')?.checked?($16('stampBuilderSuffix0916')?.value||''):'';
  if(fn)fn.textContent=filePreview0916(p,s);
  try{const old=$16('stampFilenamePreview0915');if(old)old.textContent=filePreview0916(p,s)}catch{}
}
function insertVar0916(v){
  let el=document.activeElement;
  if(!el||!['stampBuilderTemplate0916','stampBuilderPrefix0916','stampBuilderSuffix0916'].includes(el.id))el=$16(lastStampField0916)||$16('stampBuilderTemplate0916');
  if(!el)return;
  const s=el.selectionStart??el.value.length,e=el.selectionEnd??el.value.length;
  el.setRangeText(v,s,e,'end');el.dispatchEvent(new Event('input',{bubbles:true}));el.focus();
}
function applyExample0916(kind){
  const defs={
    valid:{label:'VALIDÉ',template:'VALIDÉ - {INITIALS}\\nLe {STAMP_DATE_FMT}',prefix:'VALIDE_{STAMP_DATE:YYYYMMDD}_',suffix:''},
    period:{label:'VALABLE B → C',template:'VALABLE DU {DATE_B_FMT} AU {DATE_C_FMT}',prefix:'',suffix:'_VAL_{DATE_B:YYYYMMDD}-{DATE_C:YYYYMMDD}'},
    review:{label:'À RÉÉVALUER',template:'À RÉÉVALUER LE {DATE_D_FMT}',prefix:'',suffix:'_REV_{DATE_D:YYYYMMDD}'},
    full:{label:'VALIDATION + RÉÉVALUATION',template:'VALIDÉ - {INITIALS}\\nLe {STAMP_DATE_FMT}\\nValable du {DATE_B_FMT} au {DATE_C_FMT}\\nÀ réévaluer le {DATE_D_FMT}',prefix:'VALIDE_{STAMP_DATE:YYYYMMDD}_',suffix:'_REV_{DATE_D:YYYYMMDD}'}
  };
  const d=defs[kind]||defs.full;
  $16('stampBuilderLabel0916').value=d.label;$16('stampBuilderTemplate0916').value=d.template;$16('stampBuilderPrefix0916').value=d.prefix;$16('stampBuilderSuffix0916').value=d.suffix;
  $16('stampBuilderPrefixOn0916').checked=!!d.prefix;$16('stampBuilderSuffixOn0916').checked=!!d.suffix;renderStampPreview0916();
}
function saveBuilderStamp0916(){
  const label=($16('stampBuilderLabel0916')?.value||'Tampon personnalisé').trim();
  const template=($16('stampBuilderTemplate0916')?.value||'').trim();
  if(!template)return toast('Saisissez le texte/modèle du tampon.');
  const preset=E.form?.querySelector('[name=preset]'),selected=preset?.value||'',existing=S.stampLibrary.find(x=>x.id===selected);
  const id=(existing&&String(existing.id).startsWith('custom-'))?existing.id:'custom-'+Date.now();
  const item={
    ...(existing||{}),id,category:($16('stampBuilderCategory0916')?.value||'Personnalisés').trim()||'Personnalisés',
    label,template,
    prefix:$16('stampBuilderPrefix0916')?.value||'',
    suffix:$16('stampBuilderSuffix0916')?.value||'',
    prefixEnabled:!!$16('stampBuilderPrefixOn0916')?.checked,
    suffixEnabled:!!$16('stampBuilderSuffixOn0916')?.checked
  };
  const idx=S.stampLibrary.findIndex(x=>x.id===id);if(idx>=0)S.stampLibrary[idx]=item;else S.stampLibrary.push(item);
  try{persistCustomStamps()}catch{}
  const cat=E.form.querySelector('[name=stampCategory]');if(cat)cat.dataset.ready='';
  renderStampLibrary();if(cat){cat.value=item.category;renderStampLibrary()}
  const p=E.form.querySelector('[name=preset]');if(p)p.value=id;
  updateStampPreview();renderStampPreview0916();refreshJsonEditor0916();
  if(S.driveConnected)saveStampLibraryDrive0916().catch(e=>toast('Tampon enregistré localement ; synchro Drive impossible : '+e.message));
  toast(existing&&String(existing.id).startsWith('custom-')?'Tampon personnalisé mis à jour':'Tampon personnalisé ajouté');
}
function addStampTextVars0916(section){
  const ta=E.form?.querySelector('[name=stampText]');if(!ta||$16('stampTextVars0916'))return;
  const wrap=document.createElement('div');wrap.id='stampTextVars0916';wrap.className='stampVars0916';
  for(const v of ['{INITIALS}','{STAMP_DATE_FMT}','{DATE_A_FMT}','{DATE_B_FMT}','{DATE_C_FMT}','{DATE_D_FMT}','{FILENAME}']){
    const b=document.createElement('button');b.type='button';b.textContent=v;b.onclick=()=>{const s=ta.selectionStart??ta.value.length,e=ta.selectionEnd??ta.value.length;ta.setRangeText(v,s,e,'end');ta.dispatchEvent(new Event('input',{bubbles:true}));ta.focus()};wrap.appendChild(b);
  }
  ta.closest('.field')?.after(wrap);
}
function createStampHub0916(section){
  if(!section||$16('stampHub0916'))return;
  section.open=true;
  const body=section.querySelector('.sectionBody');if(!body)return;
  const main=E.form.querySelector('[name=stampDate]');
  for(const x of [main?.closest('.field'),E.form.querySelector('.stampDateGrid'),E.form.querySelector('.stampFormatGrid'),$16('stampFileRules0914'),$16('stampBuilder0912'),E.form.querySelector('.stampBuilder')])if(x)x.style.display='none';
  const hub=document.createElement('div');hub.id='stampHub0916';hub.className='stampHub0916';
  hub.innerHTML=
  '<h4>🧩 Générateur / formateur de tampon</h4>'+
  '<div class="stampSteps0916"><b>Comment créer un tampon :</b> 1) choisissez les dates ; 2) écrivez le modèle avec les variables ; 3) définissez éventuellement le préfixe/suffixe du fichier ; 4) vérifiez les deux aperçus ; 5) cliquez « Enregistrer ce tampon » puis placez-le dans le PDF. <br><b>Exemple :</b> <code>VALIDÉ - {INITIALS}\\nLe {STAMP_DATE_FMT}\\nValable du {DATE_B_FMT} au {DATE_C_FMT}\\nÀ réévaluer le {DATE_D_FMT}</code>.</div>'+
  '<div class="stampDates0916">'+
  '<label>Date du tampon<input id="stampHubDateSTAMP0916" type="date"></label>'+
  '<label>Date A<input id="stampHubDateA0916" type="date"></label>'+
  '<label>Date B<input id="stampHubDateB0916" type="date"></label>'+
  '<label>Date C<input id="stampHubDateC0916" type="date"></label>'+
  '<label>Date D<input id="stampHubDateD0916" type="date"></label></div>'+
  '<div class="stampVars0916" id="stampBuilderVars0916"></div>'+
  '<div class="stampExampleBtns0916"><button type="button" data-example0916="valid">Exemple VALIDÉ</button><button type="button" data-example0916="period">Exemple B → C</button><button type="button" data-example0916="review">Exemple Réévaluer D</button><button type="button" data-example0916="full">Exemple complet</button></div>'+
  '<div class="stampBuilderGrid0916">'+
  '<label>Libellé<input id="stampBuilderLabel0916" value="Tampon personnalisé"></label>'+
  '<label>Catégorie<input id="stampBuilderCategory0916" value="Personnalisés"></label>'+
  '<label class="wide">Texte / modèle<textarea id="stampBuilderTemplate0916" rows="4" placeholder="VALIDÉ - {INITIALS}\\nLe {STAMP_DATE_FMT}"></textarea></label>'+
  '<label><span><input id="stampBuilderPrefixOn0916" type="checkbox"> Préfixe du fichier</span><input id="stampBuilderPrefix0916" placeholder="VALIDE_{STAMP_DATE:YYYYMMDD}_"></label>'+
  '<label><span><input id="stampBuilderSuffixOn0916" type="checkbox"> Suffixe du fichier</span><input id="stampBuilderSuffix0916" placeholder="_REV_{DATE_D:YYYYMMDD}"></label>'+
  '</div>'+
  '<div class="row"><button id="stampBuilderSave0916" type="button" class="primary">Enregistrer ce tampon</button><button id="stampBuilderLoad0916" type="button">Charger le tampon sélectionné</button><button id="stampBuilderRegenerate0916" type="button">Régénérer le tampon placé</button></div>'+
  '<div class="stampPreview0916"><b>Aperçu du tampon</b><div id="stampResolvedPreview0916">—</div><span class="stampFilename0916"><b>Nom du fichier prévu :</b> <span id="stampFilenamePreview0916">—</span></span></div>'+
  '<div id="personalStamp0916" class="personalStamp0916"></div>';
  const preview=$16('stampPreview');if(preview)preview.after(hub);else body.prepend(hub);
  for(const k of ['STAMP','A','B','C','D']){const x=uiDate0916(k);if(x){x.value=underlyingDate0916(k)?.value||today();x.addEventListener('input',()=>pushDate0916(k,x.value||today()))}}
  const vars=$16('stampBuilderVars0916');
  for(const v of ['{INITIALS}','{STAMP_DATE_FMT}','{DATE_A_FMT}','{DATE_B_FMT}','{DATE_C_FMT}','{DATE_D_FMT}','{STAMP_DATE:YYYYMMDD}','{DATE_D:YYYYMMDD}','{FILENAME}']){
    const b=document.createElement('button');b.type='button';b.textContent=v;b.onclick=()=>insertVar0916(v);vars.appendChild(b);
  }
  for(const id of ['stampBuilderTemplate0916','stampBuilderPrefix0916','stampBuilderSuffix0916'])$16(id)?.addEventListener('focus',()=>lastStampField0916=id);
  for(const id of ['stampBuilderTemplate0916','stampBuilderPrefix0916','stampBuilderSuffix0916','stampBuilderPrefixOn0916','stampBuilderSuffixOn0916'])$16(id)?.addEventListener('input',renderStampPreview0916);
  qa16('[data-example0916]',hub).forEach(b=>b.onclick=()=>applyExample0916(b.dataset.example0916));
  $16('stampBuilderSave0916').onclick=saveBuilderStamp0916;
  $16('stampBuilderLoad0916').onclick=loadSelectedStampIntoBuilder0916;
  $16('stampBuilderRegenerate0916').onclick=()=>{if(S.selectedAnn?.type!=='stamp')return toast('Sélectionnez un tampon déjà placé.');regenerateSelectedStamp();renderStampPreview0916()};
  E.form.querySelector('[name=preset]')?.addEventListener('change',()=>{loadSelectedStampIntoBuilder0916();refreshJsonEditor0916()});
  addStampTextVars0916(section);
  renderPersonalStamp0916();
  loadSelectedStampIntoBuilder0916();
  renderStampPreview0916();
}

async function findPrivateStampFile0916(){return (await listPrivateAppData()).find(f=>f.name===STAMP_DRIVE_FILE_0916)||null}
function stampPayload0916(){return{schema:'nlab-pdf-stamps/v4',updatedAt:new Date().toISOString(),dateFormats:typeof formatStore0914==='function'?formatStore0914():{},stamps:S.stampLibrary||[]}}
async function saveStampLibraryDrive0916(){
  requirePersonalWorkspace('enregistrer votre JSON de tampons');
  const payload=stampPayload0916(),existing=await findPrivateStampFile0916();
  if(existing){
    await driveApiFetch('https://www.googleapis.com/upload/drive/v3/files/'+encodeURIComponent(existing.id)+'?uploadType=media',{method:'PATCH',headers:{'Content-Type':'application/json; charset=UTF-8'},body:JSON.stringify(payload)});
  }else{
    const boundary='nlab_stamps_'+Date.now();
    await driveApiFetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart',{method:'POST',headers:{'Content-Type':'multipart/related; boundary='+boundary},body:driveMultipart({name:STAMP_DRIVE_FILE_0916,parents:['appDataFolder']},payload,boundary)});
  }
  updatePersonalStampStatus0916('JSON tampons synchronisé dans drive.appdata','ok');return payload;
}
async function loadStampLibraryDrive0916(){
  if(!S.driveConnected)return[];
  const f=await findPrivateStampFile0916();if(!f){updatePersonalStampStatus0916('Drive connecté · aucun JSON personnel de tampons pour le moment','ok');return[]}
  const data=await driveApiFetch('https://www.googleapis.com/drive/v3/files/'+encodeURIComponent(f.id)+'?alt=media');
  const parsed=typeof data==='string'?JSON.parse(data):data,items=Array.isArray(parsed)?parsed:parsed?.stamps;
  if(!Array.isArray(items))throw new Error('JSON Drive invalide : tableau stamps absent');
  if(typeof setStampLibrary==='function')setStampLibrary(items);else{S.stampLibrary=items;renderStampLibrary()}
  driveStampLoaded0916=true;refreshJsonEditor0916();loadSelectedStampIntoBuilder0916();updatePersonalStampStatus0916('JSON personnel chargé depuis Drive · '+items.length+' tampon(s)','ok');return items;
}
function refreshJsonEditor0916(){
  const ta=$16('stampJsonEditor0916');if(ta)ta.value=JSON.stringify(stampPayload0916(),null,2);
}
function applyJsonEditor0916(){
  const ta=$16('stampJsonEditor0916');if(!ta)return;
  let parsed;try{parsed=JSON.parse(ta.value)}catch(e){return toast('JSON invalide : '+e.message)}
  const items=Array.isArray(parsed)?parsed:parsed?.stamps;if(!Array.isArray(items))return toast('Le JSON doit contenir un tableau stamps.');
  if(typeof setStampLibrary==='function')setStampLibrary(items);else{S.stampLibrary=items;renderStampLibrary()}
  try{persistCustomStamps()}catch{}
  refreshJsonEditor0916();loadSelectedStampIntoBuilder0916();updateStampPreview();renderStampPreview0916();
  if(S.driveConnected)saveStampLibraryDrive0916().catch(e=>toast('JSON appliqué localement ; synchro Drive impossible : '+e.message));
  toast(items.length+' tampon(s) appliqué(s)');
}
function updatePersonalStampStatus0916(msg,kind){
  const el=$16('personalStampState0916');if(el){el.textContent=msg;el.className='authState0916 '+(kind||'warn')}
}
function renderPersonalStamp0916(){
  const box=$16('personalStamp0916');if(!box)return;
  const cid=googleDriveClientId();
  box.innerHTML=
  '<b>👤 Mon espace personnel · JSON de tampons</b>'+
  '<div id="personalStampState0916" class="authState0916 '+(S.driveConnected?'ok':'warn')+'">'+(S.driveConnected?'Google Drive privé connecté':'Non connecté')+'</div>'+
  '<div class="hint">La connexion Drive sert à conserver votre bibliothèque personnelle dans <code>drive.appdata</code>. Ce stockage est privé à l’application ; ce n’est pas une identité eIDAS.</div>'+
  '<label class="hint">Client ID OAuth Web Google<input id="stampGoogleClient0916" type="text" value="'+esc16(cid)+'" placeholder="xxxxxxxx.apps.googleusercontent.com"></label>'+
  '<div class="row"><button id="stampGoogleSave0916" type="button">Enregistrer OAuth</button><button id="stampGoogleConnect0916" type="button">'+(S.driveConnected?'Déconnecter':'Connecter Google Drive')+'</button></div>'+
  '<div class="row"><button id="stampDriveLoad0916" type="button">Charger mon JSON</button><button id="stampDriveSave0916" type="button">Enregistrer mon JSON</button><button id="stampJsonRefresh0916" type="button">Actualiser l’éditeur</button></div>'+
  '<textarea id="stampJsonEditor0916" class="stampJsonEditor0916" spellcheck="false"></textarea>'+
  '<div class="row"><button id="stampJsonApply0916" type="button" class="primary">Appliquer ce JSON</button><button id="stampJsonImport0916" type="button">Importer un fichier JSON</button><button id="stampJsonExport0916" type="button">Exporter JSON</button></div>';
  $16('stampGoogleSave0916').onclick=()=>{const v=($16('stampGoogleClient0916').value||'').trim();if(v&&!/^[A-Za-z0-9._-]+\.apps\.googleusercontent\.com$/.test(v))return toast('Client ID OAuth invalide.');try{if(v)localStorage.setItem(GOOGLE_ID_KEY_0916,v);else localStorage.removeItem(GOOGLE_ID_KEY_0916);setGoogleDriveUi();toast(v?'Configuration OAuth enregistrée':'Configuration OAuth effacée')}catch(e){toast(e.message)}};
  $16('stampGoogleConnect0916').onclick=()=>S.driveConnected?disconnectGoogleDrive():connectGoogleDrive();
  $16('stampDriveLoad0916').onclick=()=>loadStampLibraryDrive0916().catch(e=>toast(e.message));
  $16('stampDriveSave0916').onclick=()=>saveStampLibraryDrive0916().catch(e=>toast(e.message));
  $16('stampJsonRefresh0916').onclick=refreshJsonEditor0916;
  $16('stampJsonApply0916').onclick=applyJsonEditor0916;
  $16('stampJsonImport0916').onclick=()=>E.form?.querySelector('[name=stampJsonFile]')?.click();
  $16('stampJsonExport0916').onclick=()=>exportStampJson();
  refreshJsonEditor0916();
}

const persistCustomStamps0916Base=persistCustomStamps;
persistCustomStamps=function(){
  persistCustomStamps0916Base();
  refreshJsonEditor0916();
  if(S.driveConnected)saveStampLibraryDrive0916().catch(()=>{});
};
const importStampJson0916Base=importStampJson;
importStampJson=async function(file){
  const r=await importStampJson0916Base(file);refreshJsonEditor0916();loadSelectedStampIntoBuilder0916();
  if(S.driveConnected)await saveStampLibraryDrive0916();return r;
};
const setGoogleDriveUi0916Base=setGoogleDriveUi;
setGoogleDriveUi=function(){
  setGoogleDriveUi0916Base();
  if($16('personalStamp0916'))renderPersonalStamp0916();
  if(S.driveConnected&&!driveStampLoaded0916){driveStampLoaded0916=true;loadStampLibraryDrive0916().catch(e=>updatePersonalStampStatus0916('Drive connecté · JSON tampons non chargé : '+e.message,'warn'))}
};

function enhanceQuickStampDates0916(){
  const bar=$16('editorOptionsBar');if(!bar||S.editorTool!=='stamp'||$16('quickStampDates0916'))return;
  const w=document.createElement('span');w.id='quickStampDates0916';w.className='quickStampDates0916';
  const defs=[['STAMP','Tampon'],['A','A'],['B','B'],['C','C'],['D','D']];
  for(const [k,label] of defs){
    const lab=document.createElement('label');lab.textContent=label;
    const inp=document.createElement('input');inp.type='date';inp.value=dateValue0916(k);inp.title='Date '+label;inp.oninput=()=>pushDate0916(k,inp.value||today());lab.appendChild(inp);w.appendChild(lab);
  }
  bar.appendChild(w);
}
const renderEditorOptions0916Base=renderEditorOptions;
renderEditorOptions=function(){renderEditorOptions0916Base();enhanceQuickStampDates0916()};

function decorateHelp0916(){
  const hints={
    '1. Entrée':'Charger des fichiers ou un dossier de travail. Les documents restent traités localement tant qu’une fonction privée ou distante n’est pas explicitement utilisée.',
    '2. Fichier sélectionné':'Afficher le fichier courant, naviguer dans la file et contrôler son état avant traitement.',
    '3. Sortie & classement':'Choisir le nom final, le dossier de destination, les suffixes et les règles de classement.',
    '4. Tampons':'Choisir, créer et modifier des tampons ; gérer Date du tampon + A/B/C/D ; utiliser les mêmes variables dans le texte et le nom du fichier ; synchroniser votre JSON personnel.',
    '5. Texte':'Ajouter du texte libre, distinct des modèles de tampons, puis modifier police, taille, style et alignement.',
    '6. Surligneur':'Surligner une zone ou du texte PDF natif avec palette, opacité et couleurs personnalisées.',
    '7. Stylo libre':'Dessiner à la souris ou au stylet avec couleur, épaisseur et opacité réglables.',
    '8. Insérer / traiter une image':'Importer une image, la positionner, la redimensionner, la faire pivoter et régler son rendu.',
    '9. QR / code-barres libre':'Créer et placer QR codes et codes-barres indépendamment du composeur d’en-tête/pied de page.',
    '10. Optimisation':'Réduire le poids du PDF en ajustant résolution, JPEG et niveaux de gris.',
    '11. OCR & scans':'Extraire du texte depuis des scans et préparer un flux OCR ; les fonctions avancées restent expérimentales.',
    '12. En-tête / pied de page / code':'Composer un bandeau avec texte, variables, QR ou code et l’appliquer aux pages.',
    '13. Formulaires PDF':'Créer et inspecter de vrais champs AcroForm interactifs.',
    '14. Signature':'Signature visuelle, paraphe, certificat P12/PFX, verrouillage de révision et passerelle de validation européenne DSS.',
    '15. Caviardage':'Préparer des zones puis appliquer un caviardage destructif afin de supprimer réellement le contenu sous-jacent.',
    '16. Comparer deux PDF':'Comparer deux documents sur la page courante ou sur l’ensemble des pages.',
    '17. Traitement batch':'Appliquer des opérations répétitives à plusieurs PDF et générer un résultat groupé.',
    '18. Sécurité':'Contrôler les fonctions de sécurité documentaire disponibles et leurs limites.',
    '19. Actions':'Exécuter et exporter les actions du document.',
    '20. Interface':'Régler l’affichage, le comportement des barres et le panneau latéral.',
    'Historique complet':'Consulter les actions structurelles et les modifications d’annotations.'
  };
  qa16('#sidebarPanel details.toolSection').forEach(d=>{
    const s=d.querySelector(':scope>summary');if(!s)return;const txt=(s.textContent||'').trim().replace(/\s+/g,' ');
    let key=Object.keys(hints).find(k=>txt.includes(k));if(!key)return;
    s.title=hints[key];
    const body=d.querySelector(':scope>.sectionBody');if(body&&!body.querySelector('.sectionIntro0916')){const p=document.createElement('div');p.className='sectionIntro0916';p.textContent=hints[key];body.prepend(p)}
  });
}

function dssUrl0916(){try{return String(localStorage.getItem(DSS_URL_KEY_0916)||'').trim().replace(/\/+$/,'')}catch{return''}}
function saveDssUrl0916(v){v=String(v||'').trim().replace(/\/+$/,'');if(v&&!/^https?:\/\//i.test(v))throw new Error('URL DSS invalide');if(v)localStorage.setItem(DSS_URL_KEY_0916,v);else localStorage.removeItem(DSS_URL_KEY_0916);return v}
async function dssFetch0916(path,options={}){
  const base=dssUrl0916();if(!base)throw new Error('Configurez d’abord l’URL du service nLab DSS.');
  const r=await fetch(base+path,options);if(!r.ok)throw new Error('DSS HTTP '+r.status+' · '+await r.text());
  return r;
}
function setDssStatus0916(x){const b=$16('dssStatus0916');if(b)b.textContent=typeof x==='string'?x:JSON.stringify(x,null,2)}
async function dssHealth0916(){
  setDssStatus0916('Test du service DSS…');const r=await dssFetch0916('/api/v1/health');const j=await r.json();setDssStatus0916(j);return j;
}
async function dssValidate0916(){
  if(!S.pdfBytes)throw new Error('Aucun PDF affiché');setDssStatus0916('Validation DSS…');
  const bytes=await finalPdfBytes(),fd=new FormData();fd.append('document',new Blob([bytes],{type:'application/pdf'}),S.workingName||'document.pdf');
  const r=await dssFetch0916('/api/v1/validate',{method:'POST',body:fd}),j=await r.json();setDssStatus0916(j);return j;
}
async function dssExtend0916(){
  if(!S.pdfBytes)throw new Error('Aucun PDF affiché');
  const level=$16('dssLevel0916')?.value||'PAdES_BASELINE_LT';setDssStatus0916('Extension '+level+'…');
  const bytes=await finalPdfBytes(),fd=new FormData();fd.append('document',new Blob([bytes],{type:'application/pdf'}),S.workingName||'document.pdf');fd.append('level',level);
  const r=await dssFetch0916('/api/v1/pades/extend',{method:'POST',body:fd}),ct=r.headers.get('content-type')||'';
  if(ct.includes('application/pdf')){const out=new Uint8Array(await r.arrayBuffer()),name=split(S.workingName||'document.pdf').stem+'_'+level.replace('PAdES_BASELINE_','')+'.pdf';await writeFinalDirect(out,name,null);setDssStatus0916('PDF étendu : '+name);return}
  const j=await r.json();setDssStatus0916(j);
}
function enhanceSignatureDss0916(){
  const box=q16('.digitalSignatureBox',E.form);if(!box||$16('dssBox0916'))return;
  const d=document.createElement('div');d.id='dssBox0916';d.className='dssBox0916';
  d.innerHTML=
  '<b>🇪🇺 Validation européenne · DSS 6.5</b>'+
  '<div class="hint">Le navigateur conserve la signature visuelle/P12-PFX. La validation PAdES, les Trusted Lists, OCSP/CRL, TSA et l’extension LT/LTA doivent passer par un service nLab privé basé sur DSS. La connexion Google sert seulement à votre espace personnel.</div>'+
  '<label>URL du service nLab DSS<input id="dssUrl0916" type="url" value="'+esc16(dssUrl0916())+'" placeholder="https://signature.example.net"></label>'+
  '<div class="row"><button id="dssSaveUrl0916" type="button">Enregistrer URL</button><button id="dssHealth0916" type="button">Tester DSS</button><button id="dssValidate0916" type="button">Valider le PDF</button></div>'+
  '<div class="row"><select id="dssLevel0916"><option value="PAdES_BASELINE_T">PAdES-T</option><option value="PAdES_BASELINE_LT" selected>PAdES-LT</option><option value="PAdES_BASELINE_LTA">PAdES-LTA</option></select><button id="dssExtend0916" type="button">Étendre la signature</button></div>'+
  '<div id="dssStatus0916" class="dssStatus0916">Service DSS non testé.</div>';
  box.appendChild(d);
  $16('dssSaveUrl0916').onclick=()=>{try{saveDssUrl0916($16('dssUrl0916').value);toast('URL DSS enregistrée localement')}catch(e){toast(e.message)}};
  $16('dssHealth0916').onclick=()=>dssHealth0916().catch(e=>setDssStatus0916(e.message));
  $16('dssValidate0916').onclick=()=>dssValidate0916().catch(e=>setDssStatus0916(e.message));
  $16('dssExtend0916').onclick=()=>dssExtend0916().catch(e=>setDssStatus0916(e.message));
}

function install0916(){
  addStyle0916();
  const sec=stampSection0916();if(sec)createStampHub0916(sec);
  syncDates0916();decorateHelp0916();enhanceSignatureDss0916();enhanceQuickStampDates0916();
  document.querySelectorAll('.buildBadge strong').forEach(x=>x.textContent=VERSION0916);
  const foot=document.querySelector('footer .footerInfo span');if(foot)foot.textContent=(foot.textContent||'').replace(/Alpha 0\.9\.(14|15)(?: TEST| RC2)?/g,VERSION0916);
}
const mo0916=new MutationObserver(()=>setTimeout(install0916,0));
if(E.form)mo0916.observe(E.form,{childList:true,subtree:true});
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(install0916,240),{once:true});else setTimeout(install0916,240);
})();