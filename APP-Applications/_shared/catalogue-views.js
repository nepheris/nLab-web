/* Shared catalogue presentation for nLab Web / nLab Studios.
   Does not rewrite version registries, links, or Studio Core preferences. */
(()=>{'use strict';
const KEY='nlab:catalogue:view:v1';
const VALID=['cards','tiles','list','table'];
const ICON={cards:'▦',tiles:'▤',list:'☷',table:'▥'};
const LABEL={cards:'Cartes',tiles:'Vignettes',list:'Liste',table:'Tableau'};
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const read=()=>{try{const x=localStorage.getItem(KEY);return VALID.includes(x)?x:'tiles'}catch{return'tiles'}};
let view=read();
const targets=()=>['applicationGrid','studioGrid','derivedGrid','developmentGrid','nl-apps','nl-derived','nl-future'].map(id=>document.getElementById(id)).filter(Boolean);
function paint(){
 for(const el of targets()){
  for(const x of VALID)el.classList.remove('nlcatalog-'+x);
  if(view!=='cards')el.classList.add('nlcatalog-'+view);
 }
 document.querySelectorAll('[data-nlcatalog-view]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.nlcatalogView===view)));
}
function controls(container,title){
 if(!container||container.previousElementSibling?.classList.contains('nlcatalog-toolbar'))return;
 const bar=document.createElement('div');bar.className='nlcatalog-toolbar';
 const settings=document.createElement('details');settings.className='nlcatalog-settings';settings.innerHTML='<summary>⚙ Paramètres de la vue · taille et tri</summary><label>Taille des vignettes <input type="range" min="120" max="310" step="10" value="'+(localStorage.getItem('nlab:catalogue:tile-size')||'170')+'" aria-label="Taille des vignettes"></label><label>Tri <select aria-label="Tri"><option value="default">Par défaut</option><option value="az">A → Z</option><option value="za">Z → A</option></select></label>';bar.append(settings);
 settings.querySelector('input').addEventListener('input',e=>{container.style.setProperty('--catalog-tile-size',e.target.value+'px');localStorage.setItem('nlab:catalogue:tile-size',e.target.value)});
 container.style.setProperty('--catalog-tile-size',(localStorage.getItem('nlab:catalogue:tile-size')||'170')+'px');
 settings.querySelector('select').addEventListener('change',e=>{const mode=e.target.value;const children=[...container.children];if(mode==='default'){children.sort((a,b)=>(Number(a.dataset.originalOrder)||0)-(Number(b.dataset.originalOrder)||0))}else children.sort((a,b)=>{const x=a.querySelector('h2,h3')?.textContent||'',y=b.querySelector('h2,h3')?.textContent||'';return mode==='az'?x.localeCompare(y,'fr'):y.localeCompare(x,'fr')});container.replaceChildren(...children)});
 new MutationObserver(()=>[...container.children].forEach((x,i)=>{if(!x.dataset.originalOrder)x.dataset.originalOrder=String(i+1)})).observe(container,{childList:true});bar.setAttribute('role','group');bar.setAttribute('aria-label','Mode d’affichage : '+title);
 const caption=document.createElement('span');caption.className='nlcatalog-label';caption.textContent='Affichage · '+title;bar.append(caption);
 for(const val of VALID){const b=document.createElement('button');b.type='button';b.dataset.nlcatalogView=val;b.title='Vue '+LABEL[val];b.textContent=ICON[val]+' '+LABEL[val];b.onclick=()=>{view=val;try{localStorage.setItem(KEY,val)}catch{}paint()};bar.append(b)}
 container.before(bar);paint();
}
async function supplementary(){
 if(!document.getElementById('applicationGrid'))return;
 const main=document.querySelector('main');if(!main)return;
 let d;try{const r=await fetch('./APP-Applications/studios/catalog.json',{cache:'no-store'});if(!r.ok)return;d=await r.json()}catch{return}
 const root='./APP-Applications/studios/';
 function section(title,id,intro){const s=document.createElement('section');s.className='nlab-section nlcatalog-section';s.innerHTML='<div class="nlab-eyebrow">Catalogue</div><h2>'+esc(title)+'</h2><p class="nlab-muted">'+esc(intro)+'</p><div class="nlab-grid" id="'+id+'"></div>';main.append(s);return s.querySelector('.nlab-grid')}
 const studios=section('Studios spécialisés','nl-apps','Consulter les Studios et leurs historiques CURRENT / TEST.');
 studios.innerHTML=(d.studios||[]).map(s=>'<a class="nlab-card" href="'+esc(root)+'"><div class="nlab-status-line">STUDIO</div><h3>'+esc(s.name)+'</h3><p class="nlab-muted">'+esc(s.purpose||'Versions et développement dans le hub Studios.')+'</p><span class="nlab-open">Ouvrir le hub →</span></a>').join('');
 controls(studios,'Studios');
 const derived=section('Applications spécialisées et dérivées','nl-derived','Outils pratiques dérivés des Studios, dont PDF Sign.');
 derived.innerHTML=(d.derived_apps||[]).map(s=>{let url;try{url=new URL('./APP-Applications/studios/'+s.path,location.href).href}catch{url=root}return '<a class="nlab-card" href="'+esc(url)+'"><div class="nlab-status-line">APPLICATION</div><h3>'+esc(s.name)+'</h3><p class="nlab-muted">'+esc(s.purpose||'Application dérivée.')+'</p><span class="nlab-open">Ouvrir →</span></a>'}).join('')||'<p class="nlab-muted">Aucune application référencée.</p>';
 controls(derived,'Applications');
 const future=section('Développements à venir','nl-future','Projets en préparation, distincts des applications effectivement publiées.');
 const items=[...(d.future||[])];
 /* Guide Froid is now registered under derived_apps; no development placeholder. */
 future.innerHTML=items.map(s=>'<article class="nlab-card"><div class="nlab-status-line">EN DÉVELOPPEMENT</div><h3>'+esc(s.name)+'</h3><p class="nlab-muted">'+esc(s.purpose||'Projet en préparation.')+'</p></article>').join('');
 controls(future,'Développements');
 paint();
}
document.addEventListener('DOMContentLoaded',()=>{
 for(const [id,label] of [['applicationGrid','Applications'],['studioGrid','Studios'],['derivedGrid','Apps dérivées'],['developmentGrid','Développements']])controls(document.getElementById(id),label);
 supplementary();
});
})();
