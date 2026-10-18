// Optional compact Studio history UI: same canonical activity store and Undo/Redo stack.
import{loadHistory,toggleHistoryFavorite,renderFullHistory}from'./history.js';
import{undo,redo,getUndoRedoState}from'./undo-redo.js';
const storeKey='nlab:ux-history:';
const read=(k,d)=>{try{return localStorage.getItem(storeKey+k)??d}catch{return d}};
const write=(k,v)=>{try{localStorage.setItem(storeKey+k,v)}catch{}};
const label={all:'Toutes',file:'Fichiers',action:'Actions',setting:'Réglages',error:'Erreurs',navigation:'Navigation'};
function openFull(){const panel=document.querySelector('#history-full-view');if(!panel)return;panel.hidden=false;panel.style.zIndex='350';renderFullHistory()}
function dateGroup(stamp){const d=new Date(stamp),now=new Date(),today=new Date(now.getFullYear(),now.getMonth(),now.getDate()),date=new Date(d.getFullYear(),d.getMonth(),d.getDate()),diff=Math.round((today-date)/864e5);return diff===0?"Aujourd'hui":diff===1?'Hier':d.toLocaleDateString('fr-FR',{day:'numeric',month:'short',year:'numeric'})}
export function createHistorySidebar({studio='studio-core-test',limit=80}={}){
 const host=document.createElement('section');host.className='uxHistorySidebar';host.setAttribute('aria-label','Journal d’activité partagé');
 host.innerHTML='<div class="uxHistoryEyebrow">Journal d’activité partagé</div>'+
 '<div class="uxHistoryToolbar"><button id="uxUndo" type="button">↶ Annuler</button><button id="uxRedo" type="button">↷ Rétablir</button></div>'+
 '<p class="uxHistoryCounters" id="uxHistoryCounters"></p>'+
 '<details id="uxHistoryRecent" class="uxHistoryAccordion" open><summary>Actions récentes <output id="uxHistoryCount">0</output></summary><div class="uxHistoryInner">'+
 '<label class="uxHistorySearchLabel">Rechercher<input id="uxHistorySearch" type="search" placeholder="Action, fichier, date…"></label>'+
 '<div class="uxHistoryChips"><button type="button" data-ux-history-type="all">Toutes</button><button type="button" data-ux-history-type="file">Fichiers</button><button type="button" data-ux-history-type="action">Actions</button><button type="button" data-ux-history-type="setting">Réglages</button><button type="button" data-ux-history-type="error">Erreurs</button></div>'+
 '<label class="uxHistoryGroupLabel">Regrouper<select id="uxHistoryGrouping"><option value="date">Par date</option><option value="type">Par type</option><option value="studio">Par Studio</option><option value="none">À plat</option></select></label>'+
 '<div class="uxHistoryTimeline" id="uxHistoryList"></div><button class="uxHistoryFull" id="uxHistoryMore" type="button">Historique complet ↗</button></div></details>'+
 '<details class="uxHistoryAccordion" id="uxHistoryAdvanced"><summary>Gestion de l’historique</summary><div class="uxHistoryInner"><button class="uxHistoryFull" id="uxHistoryWindow" type="button">↗ Fenêtre complète</button><p>Recherche, favoris, filtres détaillés, regroupement, repli/dépliement et effacement confirmé dans la fenêtre Core.</p></div></details>'+
 '<p class="uxHistoryHint">L’historique d’activité reste distinct de la pile Annuler/Rétablir. Ce panneau peut être détaché et rattaché.</p>';
 const q=s=>host.querySelector(s),list=q('#uxHistoryList'),search=q('#uxHistorySearch'),group=q('#uxHistoryGrouping');let type=read('type','all');group.value=read('group','date');
 const render=()=>{
  if(!host.isConnected)return;
  const tx=getUndoRedoState(),history=loadHistory().filter(x=>x.studio===studio);
  q('#uxUndo').disabled=!tx.canUndo;q('#uxRedo').disabled=!tx.canRedo;
  q('#uxUndo').title=tx.canUndo?'Annuler : '+tx.undoLabel:'Aucune action à annuler';
  q('#uxRedo').title=tx.canRedo?'Rétablir : '+tx.redoLabel:'Aucune action à rétablir';
  q('#uxHistoryCounters').textContent=tx.undoDepth+' à annuler · '+tx.redoDepth+' à rétablir · '+history.length+' activités';
  host.querySelectorAll('[data-ux-history-type]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.uxHistoryType===type)));
  const filter=search.value.trim().toLocaleLowerCase('fr');
  const entries=history.filter(x=>(type==='all'||x.type===type)&&(!filter||[x.label,x.detail,x.target,x.type,new Date(x.timestamp).toLocaleDateString('fr-FR')].join(' ').toLocaleLowerCase('fr').includes(filter))).slice(0,limit);
  q('#uxHistoryCount').textContent=String(entries.length);list.replaceChildren();
  const groups=new Map();
  for(const item of entries){let key=group.value==='date'?dateGroup(item.timestamp):group.value==='type'?(label[item.type]||item.type):group.value==='studio'?item.studio:'Actions';if(!groups.has(key))groups.set(key,[]);groups.get(key).push(item)}
  for(const [name,items]of groups){
   const pack=document.createElement('details');pack.className='uxHistoryGroup';pack.open=read('group:'+name,'1')==='1';
   const heading=document.createElement('summary');heading.textContent=name+' · '+items.length;pack.append(heading);
   pack.addEventListener('toggle',()=>write('group:'+name,pack.open?'1':'0'));
   for(const item of items){
    const row=document.createElement('details');row.className='uxHistoryEntry';
    const summary=document.createElement('summary');summary.className='uxHistoryEntryHead';
    const strong=document.createElement('strong');strong.textContent=item.label;
    const time=document.createElement('time');time.dateTime=item.timestamp;time.textContent=new Date(item.timestamp).toLocaleString('fr-FR',{hour:'2-digit',minute:'2-digit'});
    summary.append(strong,time);row.append(summary);
    const extra=document.createElement('div');extra.className='uxHistoryEntryDetails';
    const sub=document.createElement('small');sub.textContent=(label[item.type]||item.type)+' · '+new Date(item.timestamp).toLocaleString('fr-FR');extra.append(sub);
    if(item.detail){const d=document.createElement('p');d.textContent=item.detail;extra.append(d)}
    if(item.target){const d=document.createElement('code');d.textContent=item.target;extra.append(d)}
    const pin=document.createElement('button');pin.type='button';pin.textContent='☆ Épingler';pin.addEventListener('click',()=>{toggleHistoryFavorite(item.id);pin.textContent='★ Favori mis à jour'});extra.append(pin);
    row.append(extra);pack.append(row);
   }
   list.append(pack);
  }
  if(!entries.length){const empty=document.createElement('p');empty.className='uxHistoryEmpty';empty.textContent=filter||type!=='all'?'Aucune action ne correspond aux filtres.':'Aucune activité enregistrée pour ce Studio.';list.append(empty)}
 };
 q('#uxUndo').addEventListener('click',()=>undo());q('#uxRedo').addEventListener('click',()=>redo());
 host.querySelectorAll('[data-ux-history-type]').forEach(button=>button.addEventListener('click',()=>{type=button.dataset.uxHistoryType;write('type',type);render()}));
 search.addEventListener('input',render);
 group.addEventListener('change',()=>{write('group',group.value);render()});
 q('#uxHistoryWindow').addEventListener('click',openFull);q('#uxHistoryMore').addEventListener('click',openFull);
 document.addEventListener('studio-v2:history-changed',render);document.addEventListener('studio-v2:undo-redo-changed',render);
 return{element:host,render,openFull};
}
