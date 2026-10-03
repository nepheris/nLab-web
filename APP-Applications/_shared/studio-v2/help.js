const esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));

export function featureMeta(feature={},fallback={}){
  return {
    id:feature.featureId||feature.id||feature.action||fallback.id||'unknown',
    uiId:feature.uiId||fallback.uiId||('studio-'+String(feature.action||feature.id||fallback.id||'unknown').replace(/[^a-z0-9_-]+/gi,'-').toLowerCase()),
    scope:feature.scope||fallback.scope||'studio',
    plugin:feature.plugin||fallback.plugin||'studio',
    status:feature.status||fallback.status||'stable',
    capability:feature.capability||fallback.capability||'',
    label:feature.label||fallback.label||feature.action||feature.id||'Fonction',
    summary:feature.help?.summary||feature.summary||fallback.summary||'',
    details:feature.help?.details||feature.details||fallback.details||'',
    sourceRef:feature.sourceRef||fallback.sourceRef||'',
    testRef:feature.testRef||fallback.testRef||'',
    advancedStudio:feature.advancedStudio?.label||feature.advancedStudio?.id||fallback.advancedStudio||''
  };
}

export function renderFeatureHelp(host,feature={},fallback={}){
  if(!host)return;
  const m=featureMeta(feature,fallback);
  const statusLabel=m.status==='development'?'DEV':String(m.status||'stable').toUpperCase();
  host.innerHTML=
    '<article class="featureHelp">'+
      '<h3>'+esc(m.label)+'</h3>'+ '<button type="button" class="copyUiId" data-copy-ui-id="'+esc(m.uiId)+'">Copier l\'ID UI</button>'+
      (m.summary?'<p>'+esc(m.summary)+'</p>':'')+
      (m.details?'<div class="featureHelpDetails">'+esc(m.details)+'</div>':'')+
      '<div class="technicalMeta">'+
        '<div><b>UI ID</b><code>'+esc(m.uiId)+'</code></div>'+ '<div><b>Feature ID</b><code>'+esc(m.id)+'</code></div>'+
        '<div><b>Scope</b><code>'+esc(String(m.scope).toUpperCase())+'</code></div>'+
        '<div><b>Plugin</b><code>'+esc(m.plugin)+'</code></div>'+
        '<div><b>Statut</b><code>'+esc(statusLabel)+'</code></div>'+
        (m.capability?'<div><b>Capability</b><code>'+esc(m.capability)+'</code></div>':'')+
        (m.advancedStudio?'<div><b>Studio avancé</b><code>'+esc(m.advancedStudio)+'</code></div>':'')+
        (m.sourceRef?'<div><b>Source</b><code>'+esc(m.sourceRef)+'</code></div>':'')+
        (m.testRef?'<div><b>Test</b><code>'+esc(m.testRef)+'</code></div>':'')+
      '</div>'+
    '</article>';
  host.querySelector('[data-copy-ui-id]')?.addEventListener('click',async e=>{try{await navigator.clipboard.writeText(e.currentTarget.dataset.copyUiId);e.currentTarget.textContent='ID copié'}catch{}});
  return m;
}

export function findFeature(manifest,action){
  for(const group of manifest?.ribbon||[]){
    for(const item of group.items||[]){
      if(item.action===action||item.id===action||item.featureId===action)return item;
    }
  }
  return null;
}


export function listManifestFeatures(manifest){
 const out=[];for(const group of manifest?.ribbon||[])for(const item of group.items||[])out.push({...item,groupId:group.id,groupLabel:group.label||group.id});return out
}
export function searchManifestFeatures(manifest,query=''){
 const q=String(query||'').trim().toLowerCase(),all=listManifestFeatures(manifest);if(!q)return all;
 return all.filter(f=>[f.label,f.action,f.featureId,f.capability,f.help?.summary,f.help?.details,f.groupLabel].filter(Boolean).join(' ').toLowerCase().includes(q))
}
export function renderHelpCatalog(host,manifest,{activeAction=null,query=''}={}){
 if(!host)return[];const items=searchManifestFeatures(manifest,query),groups=new Map();for(const f of items){if(!groups.has(f.groupLabel))groups.set(f.groupLabel,[]);groups.get(f.groupLabel).push(f)}
 host.classList.add('helpCatalog');
 host.innerHTML=[...groups].map(([g,list])=>'<section class="helpCatalogGroup"><strong>'+esc(g)+'</strong>'+list.map(f=>{const m=featureMeta(f),active=f.action===activeAction;return'<details class="'+(active?'active':'')+'" data-help-action="'+esc(f.action||'')+'" '+(active?'open':'')+'><summary>'+esc(m.label)+' <small>'+esc(String(m.status||'').toUpperCase())+'</small></summary><div class="helpCatalogBody">'+(m.summary?'<p>'+esc(m.summary)+'</p>':'')+(m.details?'<p>'+esc(m.details)+'</p>':'')+'<div><code>'+esc(m.id)+'</code></div><button type="button" data-help-open="'+esc(f.action||'')+'">Ouvrir l’outil</button></div></details>'}).join('')+'</section>').join('')||'<div class="statusBox">Aucune fonction correspondante.</div>';
 return items
}


function elementLabel(el){
  if(!el)return'Contrôle';
  return el.getAttribute('aria-label')||el.getAttribute('title')||el.closest('label')?.childNodes?.[0]?.textContent?.trim()||el.textContent?.trim()?.replace(/\s+/g,' ')||el.id||el.tagName;
}
function sectionInfo(el){
  const section=el?.closest('details[id],section[id],[data-section],fieldset[id]');
  const nested=el?.closest('details details[id],fieldset fieldset[id]');
  const summary=section?.querySelector(':scope > summary');
  const legend=section?.querySelector(':scope > legend');
  return{
    id:section?.id||section?.dataset?.section||'',
    label:summary?.textContent?.trim()?.replace(/\s+/g,' ')||legend?.textContent?.trim()?.replace(/\s+/g,' ')||section?.getAttribute('aria-label')||'',
    subsectionId:nested&&nested!==section?(nested.id||nested.dataset?.section||''):'',
    subsectionLabel:nested&&nested!==section?(nested.querySelector(':scope > summary')?.textContent?.trim()?.replace(/\s+/g,' ')||nested.querySelector(':scope > legend')?.textContent?.trim()?.replace(/\s+/g,' ')||''):''
  };
}
export function contextualMeta(el,{manifest={},versionInfo={},feature=null}={}){
  const section=sectionInfo(el),action=el?.dataset?.studioAction||feature?.action||'',featureId=el?.dataset?.featureId||feature?.featureId||feature?.id||action||'',uiId=el?.dataset?.uiId||el?.id||'';
  return{
    studio:manifest.id||document.body.dataset.studio||'studio',
    studioName:manifest.name||document.body.dataset.studio||'Studio',
    studioVersion:versionInfo.version||document.body.dataset.studioVersion||'',
    coreVersion:versionInfo.coreVersion||document.body.dataset.studioCoreVersion||'',
    sectionId:section.id,
    sectionLabel:section.label,
    subsectionId:section.subsectionId,
    subsectionLabel:section.subsectionLabel,
    controlId:el?.id||'',
    uiId,featureId,action,
    scope:el?.dataset?.scope||feature?.scope||'studio',
    plugin:el?.dataset?.plugin||feature?.plugin||'',
    capability:el?.dataset?.capability||feature?.capability||'',
    status:el?.dataset?.featureStatus||feature?.status||'stable',
    controlLabel:feature?.label||elementLabel(el),
    element:el
  };
}
export function renderContextualHelp(host,el,{manifest={},versionInfo={},feature=null}={}){
  if(!host||!el)return null;
  const m=contextualMeta(el,{manifest,versionInfo,feature});
  const summary=feature?.help?.summary||feature?.summary||el?.dataset?.helpSummary||'';
  const details=feature?.help?.details||feature?.details||el?.dataset?.helpDetails||'';
  const sectionText=m.subsectionLabel||m.sectionLabel||'Section du Studio';
  const devRows=[
    ['Studio',m.studio],['Version Studio',m.studioVersion],['Studio Core',m.coreVersion],
    ['Section',m.sectionLabel],['Section ID',m.sectionId],['Sous-section',m.subsectionLabel],['Sous-section ID',m.subsectionId],
    ['Contrôle',m.controlLabel],['DOM ID',m.controlId],['UI ID',m.uiId],['Feature ID',m.featureId],['Action',m.action],
    ['Scope',String(m.scope||'').toUpperCase()],['Plugin',m.plugin],['Capability',m.capability],['Statut',String(m.status||'').toUpperCase()]
  ].filter(([,v])=>v);
  const ref=[m.studio,m.sectionId||'section',m.subsectionId||'',m.controlId||m.featureId||m.action||'control'].filter(Boolean).join(' > ');
  host.innerHTML='<article class="contextualHelp">'+
    '<div class="contextHelpPath"><span>'+esc(m.studioName)+'</span><span>›</span><span>'+esc(sectionText)+'</span></div>'+
    '<h3>'+esc(m.controlLabel)+'</h3>'+
    (summary?'<p class="contextHelpSummary">'+esc(summary)+'</p>':'<p class="contextHelpSummary">Aide contextuelle pour ce contrôle dans la section active.</p>')+
    (details?'<div class="featureHelpDetails">'+esc(details)+'</div>':'')+
    '<details class="contextDevHelp"><summary>Développement · identification</summary>'+
      '<div class="contextDevActions"><button type="button" data-copy-dev-ref>Copier la référence</button><code>'+esc(ref)+'</code></div>'+
      '<div class="technicalMeta contextTechnicalMeta">'+devRows.map(([k,v])=>'<div><b>'+esc(k)+'</b><code>'+esc(v)+'</code></div>').join('')+'</div>'+
    '</details></article>';
  host.querySelector('[data-copy-dev-ref]')?.addEventListener('click',async e=>{try{await navigator.clipboard.writeText(ref);e.currentTarget.textContent='Référence copiée'}catch{}});
  return m;
}
