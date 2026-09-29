export async function loadStudioVersions({registryUrl='./versions.json',root=document}={}){
  const r=await fetch(registryUrl,{cache:'no-store'});
  if(!r.ok) throw new Error('Registre versions inaccessible · HTTP '+r.status);
  const data=await r.json();
  const byVersion=new Map((data.versions||[]).map(v=>[String(v.version),v]));
  const current=data.current?byVersion.get(String(data.current)):null;
  const test=data.test?byVersion.get(String(data.test)):null;
  return {data,current,test};
}
export function renderVersionsPage({data,current,test,root=document}){
  const esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  const app=data.name||data.app||'Studio';
  const currentBox=current?'<section class="versionHero current"><div class="eyebrow">CURRENT</div><h2>'+esc(current.label||current.version)+'</h2><p>'+esc(current.notes||'Version active.')+'</p><a class="btn primary" href="'+esc(current.href||'./')+'">Ouvrir la CURRENT</a></section>':'<section class="versionHero empty"><div class="eyebrow">CURRENT</div><h2>Aucune version CURRENT</h2><p>Ce Studio est encore uniquement en test.</p></section>';
  const testBox=test?'<section class="versionHero test"><div class="eyebrow">TEST</div><h2>'+esc(test.label||test.version)+'</h2><p>'+esc(test.notes||'Version en test.')+'</p><a class="btn test" href="'+esc(test.href||'./')+'">Ouvrir la TEST</a></section>':'<section class="versionHero empty"><div class="eyebrow">TEST</div><h2>Aucune version TEST distincte</h2></section>';
  const rows=(data.versions||[]).map(v=>{
    const status=String(v.status||'historical').toUpperCase();
    return '<article class="versionRow"><div><span class="status '+status.toLowerCase()+'">'+esc(status)+'</span><strong>'+esc(v.label||v.version)+'</strong><small>'+esc(v.date||'')+'</small></div><p>'+esc(v.notes||'')+'</p><a class="btn" href="'+esc(v.href||'./')+'">Ouvrir</a></article>';
  }).join('');
  root.querySelector('[data-versions-title]')&&(root.querySelector('[data-versions-title]').textContent=app+' · Versions');
  root.querySelector('[data-versions-summary]').innerHTML=currentBox+testBox;
  root.querySelector('[data-versions-list]').innerHTML=rows||'<p>Aucune version enregistrée.</p>';
}
export async function bootVersionsPage(opts={}){
  const state=await loadStudioVersions(opts);
  renderVersionsPage({...state,root:opts.root||document});
  return state;
}
