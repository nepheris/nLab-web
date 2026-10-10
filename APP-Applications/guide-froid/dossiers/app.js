'use strict';
const $=id=>document.getElementById(id),E=new TextEncoder(),D=new TextDecoder();
const fields=['id','title','site','fabricant','modele','gamme','typeEquipement','familleFroid','forme','nombrePortes','ouverture','vitrage','familleUsage','utilisation','reference','numero','date','fluide','volume','provenance','notice'];
const labels=['Identifiant appareil','Désignation','Site','Fabricant','Modèle','Gamme','Type d’équipement','Famille de froid','Forme','Nombre de portes','Ouverture','Porte / couvercle','Usage prédéfini','Utilisation / activité personnalisée','Référence','Numéro de série','Date / fabrication','Fluide frigorifique','Capacité brute / nette','Provenance','Lien notice'];
const categories=[
 ['frigo-armoire','Réfrigérateur / armoire verticale','▯'],['frigo-vitrine','Réfrigérateur vitrine vitrée','▥'],['frigo-table','Table réfrigérée / comptoir','▱'],['congel-armoire','Congélateur vertical','▯'],['congel-coffre','Congélateur coffre horizontal','▱'],['congel-vitrine','Congélateur vitrine / vente','▥'],['congel-iles','Îlot de congélation','▱'],['chambre-positive','Chambre froide positive','▣'],['chambre-negative','Chambre froide négative','▣'],['chambre-mixte','Chambre froide multi-zones','▣'],['autre','Autre appareil frigorifique','◇']];
const usages=['Fruits et légumes','Produits frais / produits laitiers','Fromages','Beurre et matières grasses','Viandes et produits protéiques','Poissons et produits de la mer','Produits surgelés','Produits préparés / repas','Réserve distribution','Stockage temporaire / transit','Boissons','Réfrigérateur des bénévoles','Congélateur des bénévoles','Conservation des dons','Autre / usage mixte'];
let device=null,docs=new Map();
const visualStages=[
 {key:'familleFroid',label:'1 · Quel froid ?',items:[['frigo','Réfrigérateur','fridge'],['congelateur','Congélateur','freezer'],['chambre','Chambre froide','room'],['inconnu','Je ne sais pas','unknown']]},
 {key:'forme',label:'2 · Quelle forme ?',items:[['verticale','Armoire verticale','vertical'],['horizontale','Coffre horizontal','chest'],['vitrine','Vitrine','glass'],['comptoir','Table / comptoir','counter'],['chambre','Chambre froide','room']]},
 {key:'nombrePortes',label:'3 · Combien de portes ?',items:[['1','Une','single'],['2','Deux','double'],['3+','Trois ou plus','triple'],['sans-porte','Sans porte classique','open']]},
 {key:'ouverture',label:'4 · Comment s’ouvre-t-il ?',items:[['battante','Porte battante','hinge'],['coulissante','Porte / vitre coulissante','slide'],['relevable','Couvercle relevable','lid'],['aucune','Autre / non visible','unknown']]},
 {key:'vitrage',label:'5 · Porte ou couvercle',items:[['pleine','Plein','solid'],['vitree','Vitré','glass'],['mixte','Mixte','mix'],['inconnu','Non déterminé','unknown']]}
];
function shapeSvg(key){
 const horiz=['chest','counter','slide','lid','open'].includes(key),room=key==='room',glass=['glass','mix'].includes(key);
 const body=room?'<path d="M12 12h78v66H12zM52 12v66M60 20h23v51H60M21 23h25v43H21"/>':horiz?'<rect x="7" y="37" width="86" height="39" rx="4"/><path d="M8 43h84M49 43v31M13 76v6M88 76v6"/>':'<rect x="28" y="6" width="44" height="76" rx="4"/><path d="M28 37h44M37 18v12M37 48v23"/>';
 const extra=glass?'<path d="M36 12h29v21H36zM36 43h29v31H36z"/>':'';
 return '<svg viewBox="0 0 100 90" role="presentation" aria-hidden="true">'+body+extra+'</svg>';
}
function accepted(stage){
 const v=device;
 if(stage.key==='forme'){
  if(v.familleFroid==='chambre')return stage.items.filter(x=>x[0]==='chambre');
  if(v.familleFroid==='frigo')return stage.items.filter(x=>['verticale','vitrine','comptoir'].includes(x[0]));
  if(v.familleFroid==='congelateur')return stage.items.filter(x=>['verticale','horizontale','vitrine'].includes(x[0]));
 }
 if(stage.key==='ouverture'){
  const permitted=v.forme==='horizontale'?['coulissante','relevable','aucune']:v.forme==='chambre'?['battante','coulissante','aucune']:['battante','coulissante','aucune'];
  return stage.items.filter(x=>permitted.includes(x[0]));
 }
 if(stage.key==='nombrePortes'&&v.forme==='chambre')return stage.items.filter(x=>['1','2','3+'].includes(x[0]));
 return stage.items;
}
function syncType(){
 const f=device.familleFroid,shape=device.forme;
 const t=f==='chambre'?(device.vitrage==='inconnu'?'chambre-positive':'chambre-positive'):
 f==='congelateur'?(shape==='horizontale'?'congel-coffre':shape==='vitrine'?'congel-vitrine':'congel-armoire'):
 f==='frigo'?(shape==='comptoir'?'frigo-table':shape==='vitrine'?'frigo-vitrine':'frigo-armoire'):'';
 if(t){device.typeEquipement=t;const e=$('field-typeEquipement');if(e)e.value=t;}
}
function renderWizard(){
 const area=$('visualSelector');if(!area||!device)return;
 let visible=true;const parts=[];
 for(const stage of visualStages){
  if(!visible)break;
  const opts=accepted(stage),active=device[stage.key]||'';
  parts.push('<section class="gf-wizard-step"><h3>'+safe(stage.label)+'</h3><div class="gf-wizard-options">'+opts.map(o=>'<button type="button" class="gf-choice" data-stage="'+safe(stage.key)+'" data-value="'+safe(o[0])+'" aria-pressed="'+(active===o[0])+'">'+shapeSvg(o[2])+'<span>'+safe(o[1])+'</span></button>').join('')+'</div></section>');
  visible=!!active;
 }
 area.innerHTML=parts.join('')+'<p class="gf-visual-summary">Description : <strong>'+safe([device.familleFroid,device.forme,device.nombrePortes&&device.nombrePortes+' porte(s)',device.ouverture,device.vitrage].filter(Boolean).join(' · ')||'Choisissez le type d’appareil')+'</strong></p>';
 area.querySelectorAll('button[data-stage]').forEach(b=>b.onclick=()=>{
  const key=b.dataset.stage,index=visualStages.findIndex(x=>x.key===key);
  device[key]=b.dataset.value;
  for(const later of visualStages.slice(index+1))device[later.key]='';
  syncType();renderWizard();renderTypePreview();
 });
}

const safe=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const setStatus=s=>$('status').textContent=s;
const u16=(b,i)=>b[i]|b[i+1]<<8,u32=(b,i)=>(b[i]|b[i+1]<<8|b[i+2]<<16|b[i+3]<<24)>>>0;
async function unzip(file){
 const b=new Uint8Array(await file.arrayBuffer());let end=b.length-22;while(end>=0&&u32(b,end)!==0x06054b50)end--;if(end<0)throw Error('ZIP non reconnu');
 const count=u16(b,end+10);if(count>1000)throw Error('Archive trop volumineuse');let p=u32(b,end+16),out=new Map(),total=0;
 for(let i=0;i<count;i++){if(u32(b,p)!==0x02014b50)throw Error('Annuaire ZIP invalide');
 const method=u16(b,p+10),csize=u32(b,p+20),size=u32(b,p+24),nl=u16(b,p+28),el=u16(b,p+30),cl=u16(b,p+32),at=u32(b,p+42),name=D.decode(b.subarray(p+46,p+46+nl));p+=46+nl+el+cl;
 if(name.endsWith('/'))continue;if(name.startsWith('/')||name.includes('\\')||name.split('/').includes('..')||size>80e6||(total+=size)>250e6)throw Error('Chemin ou taille ZIP non autorisé');
 if(u32(b,at)!==0x04034b50)throw Error('Entrée ZIP invalide');
 const start=at+30+u16(b,at+26)+u16(b,at+28);let value=b.slice(start,start+csize);
 if(method===8){if(!('DecompressionStream'in window))throw Error('Décompression ZIP indisponible dans ce navigateur');value=new Uint8Array(await new Response(new Blob([value]).stream().pipeThrough(new DecompressionStream('deflate-raw'))).arrayBuffer())}else if(method!==0)throw Error('Compression ZIP non prise en charge');
 if(value.length!==size)throw Error('Taille ZIP incohérente');out.set(name,value);
 }return out;
}
function crc32(data){let c=0xffffffff;for(const v of data){c^=v;for(let k=0;k<8;k++)c=c&1?0xedb88320^(c>>>1):c>>>1}return(c^0xffffffff)>>>0}
const w16=(a,n)=>a.push(n&255,n>>>8&255),w32=(a,n)=>{w16(a,n);w16(a,n>>>16)};
function zip(entries){const locals=[],central=[];let pos=0,n=0;for(const [path,raw]of entries){const b=typeof raw==='string'?E.encode(raw):raw,name=E.encode(path),crc=crc32(b),h=[];w32(h,0x04034b50);w16(h,20);w16(h,0x800);w16(h,0);w16(h,0);w16(h,0);w32(h,crc);w32(h,b.length);w32(h,b.length);w16(h,name.length);w16(h,0);locals.push(new Uint8Array(h),name,b);const c=[];w32(c,0x02014b50);w16(c,20);w16(c,20);w16(c,0x800);w16(c,0);w16(c,0);w16(c,0);w32(c,crc);w32(c,b.length);w32(c,b.length);w16(c,name.length);for(let i=0;i<4;i++)w16(c,0);w32(c,0);w32(c,pos);central.push(new Uint8Array(c),name);pos+=h.length+name.length+b.length;n++}const length=central.reduce((s,b)=>s+b.length,0),tail=[];w32(tail,0x06054b50);w16(tail,0);w16(tail,0);w16(tail,n);w16(tail,n);w32(tail,length);w32(tail,pos);w16(tail,0);return new Blob([...locals,...central,new Uint8Array(tail)],{type:'application/zip'})}
function download(blob,name){const a=document.createElement('a'),url=URL.createObjectURL(blob);a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),60000)}
function readForm(){for(const k of fields){if(visualStages.some(x=>x.key===k))continue;device[k]=$('field-'+k).value;}device.visites=Array.isArray(device.visites)?device.visites:[];return device}
function renderTypePreview(){
 const chosen=$('field-typeEquipement')?.value||'';
 const item=categories.find(c=>c[0]===chosen),name=item?.[1]||'Choisir un type pour afficher une silhouette générique';
 const horizontal=/coffre|table|iles/.test(chosen),room=/chambre/.test(chosen),glass=/vitrine/.test(chosen);
 const shape=room?'<rect x="8" y="13" width="76" height="65" rx="3"/><path d="M49 13v65M55 19h22v53H55M13 20h29v50H13"/><path d="M58 44h15"/>':horizontal?'<rect x="5" y="34" width="84" height="40" rx="5"/><path d="M7 42h80M10 75v5M83 75v5M45 42v29"/>':'<rect x="24" y="5" width="46" height="76" rx="5"/><path d="M24 27h46M32 11v12M32 35v37"/>' ;
 const details=glass?'<path d="M40 36h25v37H40M43 48h18M43 60h18"/>':'';
 $('typePreview').innerHTML='<svg viewBox="0 0 94 90" aria-hidden="true">'+shape+details+'</svg><div><strong>'+safe(name)+'</strong><span class="gf-hint">Illustration schématique générique, non contractuelle et indépendante du fabricant.</span></div>';
}
function render(){if(!device)return;$('workspace').hidden=false;$('deviceForm').innerHTML=fields.map((k,i)=>'<label>'+safe(labels[i])+(k==='typeEquipement'?'<select id="field-'+k+'"><option value="">Choisir un type</option>'+categories.map(c=>'<option value="'+safe(c[0])+'" '+(device[k]===c[0]?'selected':'')+'>'+safe(c[1])+'</option>').join('')+'</select>':k==='familleUsage'?'<select id="field-'+k+'"><option value="">Choisir une utilisation</option>'+usages.map(v=>'<option '+(device[k]===v?'selected':'')+'>'+safe(v)+'</option>').join('')+'</select>':'<input id="field-'+k+'" value="'+safe(device[k]||'')+'">')+'</label>').join('');$('visitSite').value=device.site||'';$('field-typeEquipement').addEventListener('change',renderTypePreview);renderTypePreview();renderWizard();renderHistory();renderDocs()}
function renderHistory(){const list=device.visites||[];$('history').innerHTML='<h3>Historique ('+list.length+')</h3>'+list.map((v,i)=>'<article><strong>'+safe(v.date)+' · '+safe(v.type)+' · '+safe(v.site)+'</strong><p>'+safe(v.observations)+'</p><p>Réalisé : '+safe(v.actions)+'</p><p>À prévoir : '+safe(v.aPrevoir)+'</p><button type="button" data-i="'+i+'">Consulter / PDF</button></article>').join('');$('history').querySelectorAll('[data-i]').forEach(b=>b.onclick=()=>report(Number(b.dataset.i)))}
function renderDocs(){$('docList').innerHTML='';for(const [name,b]of docs){const li=document.createElement('li');li.textContent=name+' ('+Math.ceil(b.length/1024)+' Ko) ';const remove=document.createElement('button');remove.type='button';remove.textContent='Retirer';remove.onclick=()=>{docs.delete(name);renderDocs()};li.append(remove);$('docList').append(li)}}
function standalone(d){const rows=fields.map((k,i)=>'<p><strong>'+safe(labels[i])+' :</strong> '+safe(d[k]||'Non renseigné')+'</p>').join('');const history=(d.visites||[]).map(v=>'<section><h3>'+safe(v.date)+' · '+safe(v.type)+'</h3><p>Site : '+safe(v.site)+'</p><p>Observations : '+safe(v.observations)+'</p><p>Réalisé : '+safe(v.actions)+'</p><p>À prévoir : '+safe(v.aPrevoir)+'</p></section>').join('');const links=[...docs.keys()].map(n=>'<li><a href="documents/'+encodeURIComponent(n)+'">'+safe(n)+'</a></li>').join('');return '<!doctype html><html lang="fr"><head><meta charset="utf-8"><title>'+safe(d.title||d.id)+'</title><style>body{font:16px/1.5 Arial;max-width:950px;padding:25px;margin:auto}section{border:1px solid #ccd;padding:15px;margin:12px 0;border-radius:8px}@media print{button{display:none}}</style></head><body><button onclick="print()">Imprimer / PDF</button><h1>'+safe(d.title||d.id)+'</h1><section><h2>Appareil</h2>'+rows+'</section><section><h2>Documents</h2><ul>'+links+'</ul></section><h2>Visites et diagnostics</h2>'+history+'</body></html>'}
function exportZip(){if(!device)return;const d=readForm(),id=(d.id||'APPAREIL').replace(/[^a-zA-Z0-9_-]/g,'_'),entries=new Map([['appareil.json',JSON.stringify(d,null,2)],['manifest.json',JSON.stringify({schema:'nlab.guide-froid.package/1.1',id,documents:[...docs.keys()],visites:d.visites.length},null,2)],['index.html',standalone(d)]]);for(const [name,data]of docs)entries.set('documents/'+name,data);download(zip(entries),id+'.zip');setStatus('ZIP exporté : '+id+'.zip. Les modifications ne sont conservées qu’après téléchargement.')}
function report(index,onlySheet=false){if(!device)return;const d=readForm(),v=d.visites[index];if(!onlySheet&&!v){setStatus('Enregistrer une visite avant de générer le rapport.');return}let body=onlySheet?'<h2>Fiche appareil</h2>'+fields.map((k,i)=>'<p><b>'+safe(labels[i])+' :</b> '+safe(d[k])+'</p>').join(''):'<h2>'+safe(v.type)+' — '+safe(v.date)+'</h2><p>Site : '+safe(v.site)+'</p><h3>Observations</h3><p>'+safe(v.observations)+'</p><h3>Opérations réalisées</h3><p>'+safe(v.actions)+'</p><h3>Actions à prévoir</h3><p>'+safe(v.aPrevoir)+'</p>';const html='<!doctype html><html lang="fr"><head><meta charset="utf-8"><title>Rapport Guide Froid</title><style>body{font:16px/1.5 Arial;margin:30px auto;max-width:850px}h1{border-bottom:2px solid #16709a}p{white-space:pre-wrap}@media print{button{display:none}}</style></head><body><button onclick="print()">Enregistrer PDF</button><h1>Guide Froid · '+safe(d.title||d.id)+'</h1><p>Fabricant : '+safe(d.fabricant)+' · Modèle : '+safe(d.modele)+'</p>'+body+'<p><small>Compte rendu descriptif ; une vérification non réalisée ne vaut pas validation technique ou sanitaire.</small></p></body></html>';const w=window.open('','_blank');if(!w){setStatus('Autoriser les fenêtres contextuelles pour imprimer.');return}w.document.open();w.document.write(html);w.document.close()}
$('importZip').onchange=async e=>{const file=e.target.files[0];if(!file)return;try{const map=await unzip(file),key=[...map.keys()].find(x=>/(^|\/)appareil\.json$/i.test(x));if(!key)throw Error('appareil.json introuvable');const prefix=key.slice(0,-'appareil.json'.length);device=JSON.parse(D.decode(map.get(key)));docs=new Map();for(const [name,b]of map)if(name.startsWith(prefix+'documents/')&&name!==prefix+'documents/')docs.set(name.slice((prefix+'documents/').length),b);render();setStatus('Appareil importé : '+(device.title||device.id)+'. '+docs.size+' document(s).')}catch(err){setStatus('Import impossible : '+err.message)}};
$('importJson').onchange=async e=>{try{device=JSON.parse(await e.target.files[0].text());docs=new Map();render();setStatus('JSON importé. Compléter les éventuels documents manquants.')}catch(err){setStatus('JSON invalide : '+err.message)}};
$('newDevice').onclick=()=>{device={id:'NOUVEL-APPAREIL',title:'Nouvel appareil',site:'',visites:[],schema:'nlab.guide-froid.appareil/1.0'};docs=new Map();render();setStatus('Nouvel appareil créé. Exporter le ZIP après modification.')};
$('documents').onchange=async e=>{if(!device)return;for(const f of e.target.files){if(f.name.includes('/')||f.name.includes('\\')||f.name==='.'||f.name==='..')continue;docs.set(f.name,new Uint8Array(await f.arrayBuffer()))}renderDocs();e.target.value=''};
$('saveVisit').onclick=()=>{if(!device)return;readForm();device.visites.push({id:'VIS-'+Date.now(),date:$('visitDate').value||new Date().toISOString().slice(0,10),site:$('visitSite').value,type:$('visitType').value,observations:$('observations').value,actions:$('actions').value,aPrevoir:$('todo').value});renderHistory();['observations','actions','todo'].forEach(k=>$(k).value='');setStatus('Visite ajoutée en mémoire : exporter le ZIP pour la conserver.')};
$('exportZip').onclick=exportZip;$('exportJson').onclick=()=>device&&download(new Blob([JSON.stringify(readForm(),null,2)],{type:'application/json'}),(device.id||'appareil')+'.json');$('printVisit').onclick=()=>report((device?.visites||[]).length-1);$('printSheet').onclick=()=>report(0,true);$('visitDate').value=new Date().toISOString().slice(0,10);

// Accueil orienté parcours : pré-sélection sans chargement automatique de données privées.
const intent=new URLSearchParams(location.search).get('mode');if(intent==='new')$('newDevice').focus();else if(intent==='import')$('importZip').focus();else if(intent==='visit')$('status').textContent='Pour saisir une visite, importer le ZIP de l’appareil ou créer sa fiche, puis renseigner la section 3.';
