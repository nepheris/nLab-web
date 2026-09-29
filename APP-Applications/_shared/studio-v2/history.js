import{qs}from'./core.js';
import{loadStudioSettings}from'./settings.js';
import{enhanceStudioWindow}from'./window-system.js';

const KEY='nlab-studio-v2-history';
const FAVORITES_KEY='nlab-studio-v2-history-favorites';
const FILTER_KEY='nlab-studio-v2-history-filter';
const MAX_ITEMS=500;

const read=(key,fallback)=>{try{const v=JSON.parse(localStorage.getItem(key)||'null');return v??fallback}catch{return fallback}};
const write=(key,value)=>localStorage.setItem(key,JSON.stringify(value));
const uid=()=>globalThis.crypto?.randomUUID?.()||('hist-'+Date.now()+'-'+Math.random().toString(16).slice(2));
const esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const dayKey=iso=>{
  const d=new Date(iso),now=new Date(),start=new Date(now.getFullYear(),now.getMonth(),now.getDate());
  const delta=Math.floor((start-new Date(d.getFullYear(),d.getMonth(),d.getDate()))/86400000);
  if(delta<=0)return"Aujourd'hui";if(delta===1)return'Hier';if(delta<7)return'7 derniers jours';return'Plus ancien';
};
export function loadHistory(){
  const v=read(KEY,[]),items=Array.isArray(v)?v:[],s=loadStudioSettings(),mode=s.historyRetention||'keep';
  if(!['30d','90d'].includes(mode))return items;
  const days=mode==='30d'?30:90,cut=Date.now()-days*86400000,fav=new Set(read(FAVORITES_KEY,[]));
  const kept=items.filter(x=>fav.has(x.id)||new Date(x.timestamp).getTime()>=cut);
  if(kept.length!==items.length)write(KEY,kept);
  return kept;
}
export function recordHistory(entry={}){
  const item={id:entry.id||uid(),timestamp:entry.timestamp||new Date().toISOString(),studio:entry.studio||document.body.dataset.studio||'studio',type:entry.type||'action',label:String(entry.label||'Action'),detail:String(entry.detail||''),target:String(entry.target||''),action:entry.action||null,repeatable:!!entry.repeatable};
  const out=[item,...loadHistory().filter(x=>x.id!==item.id)].slice(0,MAX_ITEMS);write(KEY,out);renderQuickHistory();return item;
}
export function clearHistory(){write(KEY,[]);write(FAVORITES_KEY,[]);renderQuickHistory();renderFullHistory()}
export function toggleHistoryFavorite(id){
  const fav=new Set(read(FAVORITES_KEY,[]));fav.has(id)?fav.delete(id):fav.add(id);write(FAVORITES_KEY,[...fav]);renderQuickHistory();renderFullHistory();
}
function getFilter(){const s=loadStudioSettings();return{search:'',groupBy:s.historyGroupBy||'date',type:'all',...read(FILTER_KEY,{})}}
function setFilter(next){const v={...getFilter(),...next};write(FILTER_KEY,v);return v}
function filteredItems(){
  const f=getFilter(),q=f.search.trim().toLowerCase();return loadHistory().filter(x=>(f.type==='all'||x.type===f.type)&&(!q||[x.label,x.detail,x.target,x.type,x.studio].join(' ').toLowerCase().includes(q)));
}
function groupItems(items,mode){
  const groups=new Map();for(const x of items){const k=mode==='studio'?(x.studio||'Studio'):mode==='type'?(x.type||'action'):dayKey(x.timestamp);if(!groups.has(k))groups.set(k,[]);groups.get(k).push(x)}return groups;
}
function card(item,favs,full=false){
  const body=(item.detail?'<small>'+esc(item.detail)+'</small>':'')+(item.target?'<code>'+esc(item.target)+'</code>':'')+(full?'<div class="historyItemActions"><button type="button" data-history-pin="'+esc(item.id)+'">'+(favs.has(item.id)?'★ Désépingler':'☆ Épingler')+'</button>'+(item.repeatable&&item.action?'<button type="button" data-history-repeat="'+esc(item.id)+'">↻ Refaire</button>':'')+'</div>':'');
  if(!full)return '<article class="historyItem'+(favs.has(item.id)?' pinned':'')+'" data-history-id="'+esc(item.id)+'"><div class="historyItemHead"><strong>'+esc(item.label)+'</strong><span>'+esc(new Date(item.timestamp).toLocaleString('fr-FR',{dateStyle:'short',timeStyle:'short'}))+'</span></div>'+body+'</article>';
  return '<details class="historyItem historyItemFold'+(favs.has(item.id)?' pinned':'')+'" data-history-id="'+esc(item.id)+'"><summary><span>'+esc(item.label)+'</span><time>'+esc(new Date(item.timestamp).toLocaleString('fr-FR',{dateStyle:'short',timeStyle:'short'}))+'</time></summary><div class="historyItemBody">'+body+'</div></details>';
}
export function renderQuickHistory(){
  const host=qs('#history-recent-list');if(!host)return;
  const s=loadStudioSettings(),limit=[5,10,15,20].includes(Number(s.historyLimit))?Number(s.historyLimit):10,favs=new Set(read(FAVORITES_KEY,[]));
  const items=loadHistory(),pinned=items.filter(x=>favs.has(x.id)),regular=items.filter(x=>!favs.has(x.id));
  const visible=[...pinned,...regular].slice(0,limit);
  host.innerHTML=visible.length?visible.map(x=>card(x,favs,false)).join(''):'<div class="historyEmpty">Aucune activité enregistrée.</div>';
  const count=qs('#history-recent-count');if(count)count.textContent=String(visible.length);
  const recent=qs('#recent-items-list');if(recent){
    const seen=new Set(),files=[];
    for(const x of items){if(x.type!=='file'||!x.target||seen.has(x.target))continue;seen.add(x.target);files.push(x);if(files.length>=limit)break}
    recent.innerHTML=files.length?files.map(x=>'<div class="recentItem" title="'+esc(x.target)+'"><strong>'+esc(x.target)+'</strong><small>'+esc(new Date(x.timestamp).toLocaleString('fr-FR',{dateStyle:'short',timeStyle:'short'}))+'</small></div>').join(''):'<div class="historyEmpty">Aucun fichier récent.</div>';
  }
}
export function renderFullHistory(){
  const host=qs('#history-full-list');if(!host)return;
  const f=getFilter(),items=filteredItems(),favs=new Set(read(FAVORITES_KEY,[])),groups=groupItems(items,f.groupBy);
  host.innerHTML=items.length?[...groups].map(([k,list])=>{
    const groupId='history-group-'+String(k).toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
    const state=localStorage.getItem('nlab-studio-v2-'+groupId);
    const open=state===null||state==='1'?' open':'';
    return '<details class="historyGroup" id="'+esc(groupId)+'"'+open+'><summary><span>'+esc(k)+'</span><small>'+list.length+'</small></summary><div class="historyGroupBody">'+list.map(x=>card(x,favs,true)).join('')+'</div></details>';
  }).join(''):'<div class="historyEmpty">Aucun élément pour ce filtre.</div>';
  host.querySelectorAll('.historyGroup[id]').forEach(g=>g.addEventListener('toggle',()=>localStorage.setItem('nlab-studio-v2-'+g.id,g.open?'1':'0')));
}
function openFullHistory(){const p=qs('#history-full-view');if(!p)return;p.hidden=false;renderFullHistory();p.style.zIndex='235'}
function mountPanel(){
  if(qs('#history-full-view'))return;
  const p=document.createElement('div');p.id='history-full-view';p.className='studioWindow historyFullView scope-core';p.dataset.scope='core';p.hidden=true;
  p.innerHTML='<div class="historyFullControls"><input id="history-search" type="search" placeholder="Rechercher dans l’historique"><select id="history-group-by"><option value="date">Grouper par date</option><option value="studio">Grouper par Studio</option><option value="type">Grouper par type</option></select><select id="history-filter-type"><option value="all">Tous les types</option><option value="file">Fichiers</option><option value="action">Actions</option><option value="setting">Paramètres</option><option value="navigation">Navigation</option></select><button id="history-expand-all" type="button">Tout déplier</button><button id="history-collapse-all" type="button">Tout plier</button><button id="history-clear" type="button">Effacer</button></div><div id="history-full-list"></div>';
  document.body.append(p);enhanceStudioWindow(p,{key:'history-full',title:'Historique complet'});
  const f=getFilter();qs('#history-search',p).value=f.search;qs('#history-group-by',p).value=f.groupBy;qs('#history-filter-type',p).value=f.type;
  qs('#history-search',p).addEventListener('input',e=>{setFilter({search:e.target.value});renderFullHistory()});
  qs('#history-group-by',p).addEventListener('change',e=>{setFilter({groupBy:e.target.value});renderFullHistory()});
  qs('#history-filter-type',p).addEventListener('change',e=>{setFilter({type:e.target.value});renderFullHistory()});
  qs('#history-expand-all',p).addEventListener('click',()=>{p.querySelectorAll('#history-full-list details').forEach(d=>d.open=true)});
  qs('#history-collapse-all',p).addEventListener('click',()=>{p.querySelectorAll('#history-full-list details').forEach(d=>d.open=false)});
  qs('#history-clear',p).addEventListener('click',()=>{if(confirm('Effacer tout l’historique local de ce navigateur ?'))clearHistory()});
  p.addEventListener('click',e=>{
    const pin=e.target.closest('[data-history-pin]');if(pin)return toggleHistoryFavorite(pin.dataset.historyPin);
    const rep=e.target.closest('[data-history-repeat]');if(rep){const item=loadHistory().find(x=>x.id===rep.dataset.historyRepeat);if(item?.action)document.dispatchEvent(new CustomEvent('studio-v2:repeat-action',{detail:item}))}
  });
}
export function mountHistoryUI(){
  mountPanel();
  document.addEventListener('click',e=>{if(e.target.closest('#history-view-all,[data-open-full-history]'))openFullHistory()});
  document.addEventListener('studio-v2:history-changed',()=>{renderQuickHistory();renderFullHistory()});
  renderQuickHistory();
}
export const StudioHistory=Object.freeze({load:loadHistory,record:recordHistory,clear:clearHistory,toggleFavorite:toggleHistoryFavorite,renderQuick:renderQuickHistory,renderFull:renderFullHistory,open:openFullHistory});
window.NLABStudioHistory=StudioHistory;
