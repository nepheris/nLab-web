import{applyStudioSettings,renderStudioSettingsPanel,loadStudioSettings}from'./settings.js';
import{recordHistory,mountHistoryUI}from'./history.js';
import{resolveStudioVersions,applyVersionDocumentMeta}from'./version-service.js';
import{openStudio as openResolvedStudio}from'./studio-link-resolver.js';

const esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const ID_BY_NAME={
 'Image Studio':'image-studio','OCR Studio':'ocr-studio','Code Studio':'code-studio',
 'JSON Studio':'json-studio','Data Studio':'data-studio','File Studio':'file-studio',
 'QR & Barcode Studio':'qr-barcode-studio','Markdown Studio':'markdown-studio',
 'Dataset Generator Studio':'dataset-generator-studio'
};
function inferId(){
 const explicit=document.body.dataset.studioId||document.body.dataset.studio;
 if(explicit&&explicit.includes('-'))return explicit;
 const name=document.body.dataset.studio||document.querySelector('.studioBrandText strong,.nlabTitleText strong,h1')?.textContent?.trim()||'';
 if(ID_BY_NAME[name])return ID_BY_NAME[name];
 const m=location.pathname.match(/\/APP-Applications\/([^/]+)\//);
 return m?.[1]||'studio';
}
function injectStyle(){
 if(document.getElementById('studioCoreV2BridgeStyle'))return;
 const s=document.createElement('style');s.id='studioCoreV2BridgeStyle';s.textContent=`
 body.studioCoreV2Bridge{font-size:calc(1rem * var(--studio-font-scale,1));font-family:var(--studio-font-family,Inter,Segoe UI,Arial,sans-serif)}
 .coreV2BridgeBadge{display:inline-flex;align-items:center;gap:5px;padding:5px 8px;border:1px solid #bdd4e5;border-radius:999px;background:#edf6fc;color:#185f91;font:800 10px/1 system-ui}
 .coreV2BridgeButton{padding:7px 9px!important;border:1px solid #b8c6d1!important;border-radius:7px!important;background:#fff!important;color:#40515f!important;font:700 11px/1 system-ui!important;cursor:pointer}
 .coreV2BridgePanel{position:fixed;z-index:250;right:18px;top:76px;width:min(720px,calc(100vw - 36px));max-height:calc(100vh - 110px);overflow:auto;background:#fff;border:1px solid #cbd7e0;border-radius:12px;box-shadow:0 24px 70px #18242f38;color:#1f2933}
 .coreV2BridgePanel[hidden]{display:none!important}.coreV2BridgePanelHead{position:sticky;top:0;z-index:2;display:flex;align-items:center;gap:10px;padding:11px 13px;background:#f7fafc;border-bottom:1px solid #dce4ea}.coreV2BridgePanelHead strong{font:800 14px/1.2 system-ui}.coreV2BridgePanelHead button{margin-left:auto}
 .coreV2BridgePanelBody{padding:12px}.coreV2BridgePanel .coreSettingsGrid{display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:10px}.coreV2BridgePanel section{border:1px solid #dde5eb;border-radius:9px;padding:10px}.coreV2BridgePanel h3,.coreV2BridgePanel h4{margin:0 0 8px;font:800 12px/1.2 system-ui}.coreV2BridgePanel .field,.coreV2BridgePanel .checkboxField{display:grid;gap:4px;margin:7px 0;font:600 11px/1.3 system-ui}.coreV2BridgePanel .checkboxField{grid-template-columns:auto 1fr;align-items:center}.coreV2BridgePanel select,.coreV2BridgePanel input,.coreV2BridgePanel button{font:inherit}.coreV2BridgePanel .studioOverrideList{display:grid;gap:4px}.coreV2BridgePanel .settingsHint{font:10px/1.4 system-ui;color:#667785}
 body[data-density="compact"] .panel,body[data-density="compact"] .toolPanel,body[data-density="compact"] .sideCard{padding:9px!important}
 body[data-density="comfortable"] .panel,body[data-density="comfortable"] .toolPanel,body[data-density="comfortable"] .sideCard{padding:18px!important}
 body.themeDark{--bg:#111820;--card:#18222c;--ink:#eef4f8;--muted:#9fb0bd;--line:#344452}
 body.themeDark .coreV2BridgePanel{background:#18222c;color:#eef4f8;border-color:#344452}body.themeDark .coreV2BridgePanelHead{background:#202c37;border-color:#344452}body.themeDark .coreV2BridgePanel section{border-color:#344452}body.themeDark .coreV2BridgePanel input,body.themeDark .coreV2BridgePanel select,body.themeDark .coreV2BridgePanel button{background:#111820;color:#eef4f8;border-color:#465765}
 `;document.head.append(s);
}
function toolbarHost(){
 return document.querySelector('.nlabHeaderRight,.studioHeaderRight,.hero .actions')||document.body;
}
function mountControls({studioId,versionInfo}){
 const host=toolbarHost();
 if(!document.getElementById('studioCoreV2BridgeControls')){
  const wrap=document.createElement('span');wrap.id='studioCoreV2BridgeControls';wrap.style.cssText='display:inline-flex;gap:6px;align-items:center';
  wrap.innerHTML='<span class="coreV2BridgeBadge" title="Studio raccordé au Core partagé">Core V2 '+esc(versionInfo.coreVersion||'')+'</span><button id="studioCoreV2BridgeSettings" class="coreV2BridgeButton" type="button">⚙ Core</button><button id="studioCoreV2BridgeHistory" class="coreV2BridgeButton" type="button">Historique</button>';
  host.append(wrap);
 }
 let panel=document.getElementById('studioCoreV2BridgePanel');
 if(!panel){panel=document.createElement('div');panel.id='studioCoreV2BridgePanel';panel.className='coreV2BridgePanel';panel.hidden=true;panel.innerHTML='<div class="coreV2BridgePanelHead"><strong>Paramètres Studio Core V2</strong><span class="coreV2BridgeBadge">'+esc(studioId)+'</span><button id="studioCoreV2BridgeClose" type="button">Fermer</button></div><div id="studioCoreV2BridgeSettingsBody" class="coreV2BridgePanelBody"></div>';document.body.append(panel)}
 const open=()=>{renderStudioSettingsPanel(document.getElementById('studioCoreV2BridgeSettingsBody'));panel.hidden=false};
 document.getElementById('studioCoreV2BridgeSettings')?.addEventListener('click',open);
 document.getElementById('studioCoreV2BridgeClose')?.addEventListener('click',()=>panel.hidden=true);
 document.getElementById('studioCoreV2BridgeHistory')?.addEventListener('click',()=>{mountHistoryUI();document.querySelector('[data-open-full-history]')?.click();const h=document.getElementById('history-full-view');if(h){h.hidden=false;h.style.zIndex='260'}});
}
function bindHistory(studioId){
 document.addEventListener('click',e=>{
  const el=e.target.closest('button,a');if(!el||el.closest('#studioCoreV2BridgePanel,#history-full-view'))return;
  const label=(el.textContent||el.title||el.id||'Action').trim().replace(/\s+/g,' ').slice(0,120);if(!label)return;
  recordHistory({studio:studioId,type:el.tagName==='A'?'navigation':'action',label,detail:el.title||'',action:el.id||el.dataset.studioAction||null,repeatable:false});
 },{capture:true});
 const file=document.querySelector('input[type=file]');
 file?.addEventListener('change',e=>{for(const f of [...(e.target.files||[])])recordHistory({studio:studioId,type:'file',label:'Ouverture '+f.name,target:f.name,detail:f.type||''})});
}
function bindSpecializedLinks(studioId){
 document.addEventListener('click',async e=>{
  const el=e.target.closest('[data-specialized-studio],[data-advanced-studio]');if(!el)return;
  e.preventDefault();const target=el.dataset.specializedStudio||el.dataset.advancedStudio;if(!target)return;
  try{await openResolvedStudio(target,{query:{from:studioId,return:studioId}})}catch(err){console.error(err)}
 });
}
export async function mountStudioCoreV2Bridge({studioId=inferId(),channel='test'}={}){
 if(document.documentElement.dataset.coreV2BridgeMounted==='1')return window.__NLAB_STUDIO_CORE_V2_BRIDGE__;
 document.documentElement.dataset.coreV2BridgeMounted='1';injectStyle();
 let versionInfo={studioVersion:'',studioStatus:String(channel).toUpperCase(),coreVersion:''};
 try{versionInfo=await resolveStudioVersions({versionsHref:'./versions.json',coreVersionHref:'../_shared/studio-v2/version.json',channel})}catch{}
 document.body.dataset.studio=studioId;document.body.dataset.studioCoreVersion=versionInfo.coreVersion||'';document.body.classList.add('studioCoreV2Bridge');
 applyStudioSettings(loadStudioSettings());
 applyVersionDocumentMeta({studioName:document.querySelector('h1,.studioBrandText strong,.nlabTitleText strong')?.textContent?.trim()||studioId,studioVersion:versionInfo.studioVersion,studioStatus:versionInfo.studioStatus,coreVersion:versionInfo.coreVersion});
 mountControls({studioId,versionInfo});bindHistory(studioId);bindSpecializedLinks(studioId);
 const api={studioId,versionInfo,settings:loadStudioSettings()};window.__NLAB_STUDIO_CORE_V2_BRIDGE__=api;
 document.dispatchEvent(new CustomEvent('studio-v2:legacy-bridge-mounted',{detail:api}));return api;
}
