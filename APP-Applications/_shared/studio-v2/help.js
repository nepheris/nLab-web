const esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));

export function featureMeta(feature={},fallback={}){
  return {
    id:feature.featureId||feature.id||feature.action||fallback.id||'unknown',
    scope:feature.scope||fallback.scope||'studio',
    plugin:feature.plugin||fallback.plugin||'studio',
    status:feature.status||fallback.status||'stable',
    capability:feature.capability||fallback.capability||'',
    label:feature.label||fallback.label||feature.action||feature.id||'Fonction',
    summary:feature.help?.summary||feature.summary||fallback.summary||'',
    details:feature.help?.details||feature.details||fallback.details||''
  };
}

export function renderFeatureHelp(host,feature={},fallback={}){
  if(!host)return;
  const m=featureMeta(feature,fallback);
  const statusLabel=m.status==='development'?'DEV':String(m.status||'stable').toUpperCase();
  host.innerHTML=
    '<article class="featureHelp">'+
      '<h3>'+esc(m.label)+'</h3>'+
      (m.summary?'<p>'+esc(m.summary)+'</p>':'')+
      (m.details?'<div class="featureHelpDetails">'+esc(m.details)+'</div>':'')+
      '<div class="technicalMeta">'+
        '<div><b>ID</b><code>'+esc(m.id)+'</code></div>'+
        '<div><b>Scope</b><code>'+esc(String(m.scope).toUpperCase())+'</code></div>'+
        '<div><b>Plugin</b><code>'+esc(m.plugin)+'</code></div>'+
        '<div><b>Statut</b><code>'+esc(statusLabel)+'</code></div>'+
        (m.capability?'<div><b>Capability</b><code>'+esc(m.capability)+'</code></div>':'')+
      '</div>'+
    '</article>';
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
