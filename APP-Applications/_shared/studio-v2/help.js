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
