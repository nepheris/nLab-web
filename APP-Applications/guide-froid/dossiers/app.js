'use strict';
const $=id=>document.getElementById(id),E=new TextEncoder(),D=new TextDecoder();
const fields=['id','title','site','fabricant','modele','gamme','typeEquipement','familleFroid','forme','nombrePortes','ouverture','vitrage','familleUsage','utilisation','reference','numero','date','fluide','volumeNet','volumeBrut','volume','provenance','notice'];
const labels=['Identifiant appareil','Désignation','Site','Fabricant','Modèle','Gamme','Type d’équipement','Famille de froid','Forme','Nombre de portes','Ouverture','Porte / couvercle','Usage prédéfini','Utilisation / activité personnalisée','Référence','Numéro de série','Date / fabrication','Fluide frigorifique','Capacité nette (L)','Capacité brute (L)','Ancienne capacité (donnée héritée)','Provenance','Lien notice'];
const categories=[
 ['frigo-armoire','Réfrigérateur / armoire verticale','▯'],['frigo-vitrine','Réfrigérateur vitrine vitrée','▥'],['frigo-table','Table réfrigérée / comptoir','▱'],['congel-armoire','Congélateur vertical','▯'],['congel-coffre','Congélateur coffre horizontal','▱'],['congel-vitrine','Congélateur vitrine / vente','▥'],['congel-iles','Îlot de congélation','▱'],['chambre-positive','Chambre froide positive','▣'],['chambre-negative','Chambre froide négative','▣'],['chambre-mixte','Chambre froide multi-zones','▣'],['autre','Autre appareil frigorifique','◇']];
const usages=['Fruits et légumes','Produits frais / produits laitiers','Fromages','Beurre et matières grasses','Viandes et produits protéiques','Poissons et produits de la mer','Produits surgelés','Produits préparés / repas','Réserve distribution','Stockage temporaire / transit','Boissons','Réfrigérateur des bénévoles','Congélateur des bénévoles','Conservation des dons','Autre / usage mixte'];
let device=null,docs=new Map(),pendingVisitDocs=[];
const demoSamples={
 'POS-ARM-001':{title:'Frigo produits laitiers · Démonstration',familleFroid:'frigo',forme:'verticale',typeEquipement:'frigo-armoire',nombrePortes:'2',ouverture:'battante',vitrage:'pleine',fonctionsUsage:['stockage','distribution'],denrees:['Produits laitiers (yaourts, fromages, desserts lactés)']},
 'NEG-COF-001':{title:'Congélateur surgelés · Démonstration',familleFroid:'congelateur',forme:'horizontale',typeEquipement:'congel-coffre',nombrePortes:'2',ouverture:'relevable',vitrage:'pleine',fonctionsUsage:['stockage'],denrees:['Produits surgelés']},
 'POS-CHF-001':{title:'Chambre froide légumes · Démonstration',familleFroid:'frigo',forme:'chambre',typeEquipement:'chambre-positive',nombrePortes:'2',ouverture:'battante',vitrage:'pleine',fonctionsUsage:['stockage'],denrees:['Fruits','Légumes']}
};
function openDemo(id){const preset=demoSamples[id];if(!preset)return;pendingExport=true;device={id,site:'DEMO',codeSite:'DEMO',schema:'nlab.guide-froid.appareil/1.0',visites:[],fabricant:'',modele:'',numero:'',demo:true,...structuredClone(preset)};docs=new Map();pendingVisitDocs=[];render();setStatus('Appareil fictif chargé : '+id+'. Tester, puis exporter un ZIP si besoin.')}

const foodCategories=['Fruits','Légumes','Produits laitiers (yaourts, fromages, desserts lactés)','Viandes','Poissons','Plats cuisinés','Produits surgelés','Alimentation infantile','Boissons','Produits variés'];
const localNames=['Frigo protidique','Frigo produits laitiers','Frigo yaourts','Frigo fromage','Frigo fruits et légumes','Frigo bénévoles','Congélateur bénévoles','Congélateur produits surgelés'];
const hacNotice='En cas de température hors des plages prévues, de doute sur la conservation ou de rupture possible de la chaîne du froid : consulter et appliquer la procédure HACCP et les consignes d’hygiène en vigueur sur le site pour déterminer le devenir des produits. Le Guide Froid ne définit aucun seuil et ne remplace pas les procédures applicables.';
function renderUsage(){
 const root=$('usageEditor');if(!root)return;
 if(!Array.isArray(device.denrees)){device.denrees=device.familleUsage&&foodCategories.includes(device.familleUsage)?[device.familleUsage]:[]}
 const modes=Array.isArray(device.fonctionsUsage)?device.fonctionsUsage:(device.fonctionUsage?[device.fonctionUsage]:['stockage']);
 root.innerHTML='<h4>Fonction principale</h4><div class="gf-usage-options">'+[['stockage','Stockage'],['distribution','Distribution'],['ponctuel','Utilisation ponctuelle'],['benevoles','Utilisation bénévoles'],['autre','Autre usage']].map(x=>'<label><input type="checkbox" name="fonctionUsage" value="'+x[0]+'" '+(modes.includes(x[0])?'checked':'')+'> '+x[1]+'</label>').join('')+'</div><p><label>Précisions sur la fonction <input id="otherFunction" value="'+safe(device.autreFonction||'')+'" placeholder="Autre utilisation…"></label></p><h4>Denrées stockées ou distribuées (plusieurs choix possibles)</h4><div class="gf-usage-options">'+foodCategories.map(x=>'<label><input type="checkbox" data-food="'+safe(x)+'" '+(device.denrees.includes(x)?'checked':'')+'> '+safe(x)+'</label>').join('')+'</div><p><label>Autres denrées / précisions <input id="otherFood" value="'+safe(device.autresDenrees||'')+'" placeholder="Préciser si nécessaire"></label></p><p><label>Désignation locale suggérée <select id="localPreset"><option value="">Choisir ou conserver la saisie libre</option>'+localNames.map(x=>'<option>'+safe(x)+'</option>').join('')+'</select></label></p><p class="gf-hint">La désignation locale reste modifiable dans le champ « Désignation » ci-dessous. Aucun seuil de température n’est déduit des denrées cochées.</p>';
 root.querySelectorAll('[name="fonctionUsage"]').forEach(el=>el.onchange=()=>{device.fonctionsUsage=[...root.querySelectorAll('[name="fonctionUsage"]:checked')].map(x=>x.value)});$('otherFunction').oninput=e=>device.autreFonction=e.target.value;
 root.querySelectorAll('[data-food]').forEach(el=>el.onchange=()=>{device.denrees=[...root.querySelectorAll('[data-food]:checked')].map(x=>x.dataset.food)});
 $('otherFood').oninput=e=>device.autresDenrees=e.target.value;
 $('localPreset').onchange=e=>{if(!e.target.value)return;device.title=e.target.value;$('field-title').value=e.target.value};
}

const visualStages=[
 {key:'familleFroid',label:'1 · Quel froid ?',items:[['frigo','Froid positif (frigo)','fridge'],['congelateur','Froid négatif (congélateur)','freezer']]},
 {key:'forme',label:'2 · Quelle forme ?',items:[['verticale','Armoire verticale','vertical'],['horizontale','Coffre horizontal','chest'],['vitrine','Vitrine','glass'],['comptoir','Table / comptoir','counter'],['chambre','Chambre froide','room']]},
 {key:'nombrePortes',label:'3 · Combien de portes ?',items:[['1','Une','single'],['2','Deux','double'],['3','Trois portes ou plus','triple']]},
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
  if(v.familleFroid==='frigo')return stage.items.filter(x=>['verticale','vitrine','comptoir','chambre'].includes(x[0]));
  if(v.familleFroid==='congelateur')return stage.items.filter(x=>['verticale','horizontale','vitrine','chambre'].includes(x[0]));
 }
 if(stage.key==='ouverture'){
  const permitted=v.forme==='horizontale'?['coulissante','relevable','aucune']:v.forme==='chambre'?['battante','coulissante','aucune']:['battante','coulissante','aucune'];
  return stage.items.filter(x=>permitted.includes(x[0]));
 }
 
 return stage.items;
}
function syncType(){
 const f=device.familleFroid,shape=device.forme;
 const t=shape==='chambre'?(f==='congelateur'?'chambre-negative':'chambre-positive'):
 f==='congelateur'?(shape==='horizontale'?'congel-coffre':shape==='vitrine'?'congel-vitrine':'congel-armoire'):
 f==='frigo'?(shape==='comptoir'?'frigo-table':shape==='vitrine'?'frigo-vitrine':'frigo-armoire'):'';
 if(t){device.typeEquipement=t;const e=$('field-typeEquipement');if(e)e.value=t;}
}
function siteCode(site){return String(site||'SITE').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^A-Za-z]/g,'').toUpperCase().slice(0,4).padEnd(4,'X')}
function suggestId(){
 if(!device||device.id&&!device._generatedId&&device.id!=='NOUVEL-APPAREIL')return;
 const site=siteCode(document.getElementById('field-site')?.value||device.site);
 const cold=device.familleFroid==='congelateur'?'NEG':'POS';
 const form=({verticale:'ARM',horizontale:'COF',vitrine:'VIT',comptoir:'TAB',chambre:'CHF'})[device.forme]||'GEN';
 device.id=cold+'-'+form+'-001';device._generatedId=true;
 const e=document.getElementById('field-id');if(e)e.value=device.id;
}
function defaultDetails(){
 if(!device.forme)return;
 device.nombrePortes='1';
 device.ouverture=device.forme==='horizontale'?'relevable':'battante';
 device.vitrage=device.forme==='vitrine'?'vitree':'pleine';
}
function graphicFor(stageKey,value){
 if(stageKey==='familleFroid')return value==='frigo'?'<svg viewBox="0 0 102 94" aria-hidden="true"><rect x="28" y="6" width="46" height="79" rx="6"/><path d="M28 35h46M66 20v10M66 49v11"/><path d="M17 60q-9 -7 0 -14m-7 -5q-9 -7 0 -14"/><text x="50" y="66" text-anchor="middle" font-size="14" stroke="none" fill="currentColor">+°</text></svg>':'<svg viewBox="0 0 102 94" aria-hidden="true"><rect x="28" y="6" width="46" height="79" rx="6"/><path d="M28 35h46M66 20v10M66 49v11M51 43v32M35 59h32M40 48l22 22M62 48L40 70"/><text x="51" y="25" text-anchor="middle" font-size="14" stroke="none" fill="currentColor">−°</text></svg>';
 const doorCount=stageKey==='nombrePortes'?Number(value):Math.min(3,Number(device.nombrePortes)||1);
 const glass=stageKey==='vitrage'?value==='vitree':device.vitrage==='vitree';
 const horizontal=stageKey==='forme'?value==='horizontale':device.forme==='horizontale';
 const room=stageKey==='forme'?value==='chambre':device.forme==='chambre';
 const sliding=stageKey==='ouverture'?value==='coulissante':device.ouverture==='coulissante';
 let art='';
 if(room){
 art='<path d="M7 22L35 7H94V72L67 87H7Z M7 22H67V87 M67 22L94 7 M67 22V87"/><path d="M12 78h51"/>';
 }else if(horizontal){
 art='<rect x="7" y="35" width="88" height="45" rx="4"/><path d="M7 42h88M13 80v5M89 80v5"/>';
 }else art='<rect x="22" y="5" width="64" height="78" rx="4"/>';
 const left=room?18:horizontal?12:28,right=room?58:horizontal?90:80,top=room?28:horizontal?42:12,bottom=room?79:horizontal?73:76,span=(right-left)/doorCount;
 for(let i=0;i<doorCount;i++){const x=left+i*span;art+='<rect x="'+(x+1)+'" y="'+top+'" width="'+(span-2)+'" height="'+(bottom-top)+'" rx="1"/>';if(glass)art+='<rect x="'+(x+4)+'" y="'+(top+5)+'" width="'+(span-8)+'" height="'+(bottom-top-10)+'"/>';if(!horizontal)art+='<path d="M'+(sliding?x+span/2:x+span-5)+' '+(top+22)+'v13"/>';}
 if(stageKey==='ouverture'&&value==='relevable')art+='<path d="M8 35L20 19H93L95 35"/>';
 if(stageKey==='ouverture'&&value==='coulissante')art+='<path d="M32 32h35m-7-6 7 6-7 6"/>';
 return '<svg viewBox="0 0 102 94" aria-hidden="true">'+art+'</svg>';
}
function renderWizard(){
 const area=$('visualSelector');if(!area||!device)return;
 let visible=true;const parts=[];
 for(const stage of visualStages){
  if(!visible)break;
  const opts=accepted(stage),active=device[stage.key]||'';
  const quantity=stage.key==='nombrePortes'?' · portes ou couvercles':'';
  parts.push('<section class="gf-wizard-step"><h3>'+safe(stage.label+quantity)+'</h3><div class="gf-wizard-options">'+opts.map(o=>'<button type="button" class="gf-choice" data-stage="'+safe(stage.key)+'" data-value="'+safe(o[0])+'" aria-pressed="'+(active===o[0])+'">'+graphicFor(stage.key,o[0])+'<span>'+safe(o[1])+'</span></button>').join('')+'</div></section>');
  visible=!!active;
 }
 const desc=[device.familleFroid==='frigo'?'Froid positif':device.familleFroid==='congelateur'?'Froid négatif':'',device.forme,device.nombrePortes&&device.nombrePortes+' porte(s)/couvercle(s)',device.ouverture,device.vitrage].filter(Boolean);
 area.innerHTML=parts.join('')+'<p class="gf-visual-summary">Configuration : <strong>'+safe(desc.join(' · ')||'Sélectionnez froid positif ou négatif')+'</strong></p>';
 area.querySelectorAll('button[data-stage]').forEach(b=>b.onclick=()=>{
  const key=b.dataset.stage,old=device[key];device[key]=b.dataset.value;
  if(key==='familleFroid'&&old!==device[key]){device.forme='';device.nombrePortes='';device.ouverture='';device.vitrage='';}
  if(key==='forme'&&old!==device[key])defaultDetails();
  if(key==='ouverture'&&device.forme==='horizontale'&&device.ouverture==='battante')device.ouverture='relevable';
  if(key==='forme'||key==='familleFroid')suggestId();
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
function readForm(){if(device)markUnsaved();for(const k of fields){if(visualStages.some(x=>x.key===k)||k==='typeEquipement')continue;const el=$('field-'+k);if(el)device[k]=el.value;}device.codeSite=siteCode(device.site);device.visites=Array.isArray(device.visites)?device.visites:[];return device}
function renderTypePreview(){
 const chosen=device.typeEquipement||'';
 const item=categories.find(c=>c[0]===chosen),name=item?.[1]||'Choisir un type pour afficher une silhouette générique';
 const horizontal=/coffre|table|iles/.test(chosen),room=/chambre/.test(chosen),glass=/vitrine/.test(chosen);
 const shape=room?'<rect x="8" y="13" width="76" height="65" rx="3"/><path d="M49 13v65M55 19h22v53H55M13 20h29v50H13"/><path d="M58 44h15"/>':horizontal?'<rect x="5" y="34" width="84" height="40" rx="5"/><path d="M7 42h80M10 75v5M83 75v5M45 42v29"/>':'<rect x="24" y="5" width="46" height="76" rx="5"/><path d="M24 27h46M32 11v12M32 35v37"/>' ;
 const details=glass?'<path d="M40 36h25v37H40M43 48h18M43 60h18"/>':'';
 $('typePreview').innerHTML='<svg viewBox="0 0 94 90" aria-hidden="true">'+shape+details+'</svg><div><strong>'+safe(name)+'</strong><span class="gf-hint">Illustration schématique générique, non contractuelle et indépendante du fabricant.</span></div>';
}
function render(){if(!device)return;$('workspace').hidden=false;$('deviceForm').innerHTML=fields.filter(k=>!visualStages.some(x=>x.key===k)&&k!=='typeEquipement'&&k!=='familleUsage'&&k!=='utilisation').map(k=>'<label>'+safe(labels[fields.indexOf(k)])+(k==='typeEquipement'?'<select id="field-'+k+'"><option value="">Choisir un type</option>'+categories.map(c=>'<option value="'+safe(c[0])+'" '+(device[k]===c[0]?'selected':'')+'>'+safe(c[1])+'</option>').join('')+'</select>':k==='familleUsage'?'<select id="field-'+k+'"><option value="">Choisir une utilisation</option>'+usages.map(v=>'<option '+(device[k]===v?'selected':'')+'>'+safe(v)+'</option>').join('')+'</select>':'<input id="field-'+k+'" value="'+safe(device[k]||'')+'">')+'</label>').join('');$('visitSite').value=device.site||'';$('field-site')?.addEventListener('input',()=>{device.site=$('field-site').value;if($('visitSite'))$('visitSite').value=device.site;if(device._generatedId)suggestId()});renderTypePreview();renderWizard();renderUsage();renderHistory();renderDocs();renderPhotoSlots();renderNotices();$('visitFiles').onchange=e=>addVisitFiles([...e.target.files]);const drop=$('visitDrop');drop.ondragover=e=>{e.preventDefault()};drop.ondrop=e=>{e.preventDefault();addVisitFiles([...e.dataTransfer.files])};renderVisitFiles();for(const k of ['fabricant','modele','notice'])$('field-'+k)?.addEventListener('input',()=>{device[k]=$('field-'+k).value;renderNotices()})}
// GF2-A06 : projection non destructive des anciens et nouveaux contrats vers les champs de l'atelier.
function normalizeImportedDevice(source){
 if(!source||typeof source!=='object'||Array.isArray(source))throw Error('Fiche appareil invalide');
 const src=source.appareil&&typeof source.appareil==='object'?source.appareil:source;
 const config=src.configuration||{},site=src.site||'',uses=src.usages||{};
 const d={...src};
 if(typeof site==='object')d.site=site.code||site.libelleLocal||'';
 const mappings={title:src.designationLocale,manufacturer:src.fabricant,fabricant:src.brand,modele:src.model,numero:src.numeroSerie||src.serial,volumeBrut:src.capaciteBruteLitres,volumeNet:src.capaciteNetteLitres,familleFroid:config.froid,forme:config.forme,nombrePortes:config.nombreAcces,ouverture:config.ouverture,vitrage:config.vitrage,typeEquipement:config.typeEquipement};
 for(const [key,value]of Object.entries(mappings))if((d[key]===undefined||d[key]==='')&&value!==undefined)d[key]=value;
 if(d.fonctionsUsage===undefined&&Array.isArray(uses.fonctions))d.fonctionsUsage=uses.fonctions;
 if(d.denrees===undefined&&Array.isArray(uses.denrees))d.denrees=uses.denrees;
 if(d.utilisation===undefined&&uses.precision!==undefined)d.utilisation=uses.precision;
 if(!d.notice&&Array.isArray(src.notices)&&src.notices.length)d.notice=src.notices.find(x=>typeof x==='string')||src.notices.find(x=>x?.url)?.url||'';
 if(!Array.isArray(d.visites))d.visites=Array.isArray(source.visites)?source.visites:[];
 // Source intégrale : conserver sans effacer ni réécrire les champs inconnus lors du round-trip.
 if(source.appareil)d.extensionsLegacy={...(d.extensionsLegacy||{}),importRoot:source};
 return d;
}
function renderNotices(){const root=$('deviceNotices');if(!root||!device)return;const url=String(device.notice||'').trim();let safeUrl='';try{const parsed=new URL(url);if(['https:','http:'].includes(parsed.protocol))safeUrl=parsed.href}catch(_){}root.innerHTML='<p><strong>Fabricant :</strong> '+safe(device.fabricant||'Non renseigné')+' · <strong>Modèle :</strong> '+safe(device.modele||'Non renseigné')+'</p>'+(safeUrl?'<p><a target="_blank" rel="noopener noreferrer" href="'+safe(safeUrl)+'">Ouvrir la notice associée ↗</a></p>':'<p>Aucune notice associée pour le moment. Ajouter son URL dans la fiche appareil.</p>')+'<p><a href="../notices/" target="_blank" rel="noopener noreferrer">Annuaire des notices et fabricants ↗</a></p>'}
function renderHistory(){const list=device.visites||[];$('history').innerHTML='<h3>Historique ('+list.length+')</h3>'+list.map((v,i)=>'<article><strong>'+safe(v.date)+' · '+safe(v.type)+' · '+safe(v.site)+'</strong><p>'+safe(v.observations)+'</p><p>Réalisé : '+safe(v.actions)+'</p><p>À prévoir : '+safe(v.aPrevoir)+'</p><button type="button" data-i="'+i+'">Consulter / PDF</button></article>').join('');$('history').querySelectorAll('[data-i]').forEach(b=>b.onclick=()=>report(Number(b.dataset.i)))}
function photoIcon(which){return which==='plate'?'<rect x="17" y="19" width="66" height="52" rx="5"/><path d="M28 33h44M28 44h31M28 55h38"/>':which==='inside'?'<path d="M22 9h46v74H22zM32 30h31M32 53h31M74 14l12 10v54l-12-7z"/>':'<rect x="25" y="7" width="48" height="76" rx="5"/><path d="M26 35h46M65 21v12M65 49v13"/>'}
function renderPhotoSlots(){
 const slots=[['outside','Vue extérieure'],['inside','Vue intérieure'],['plate','Plaque signalétique']];
 $('photoSlots').innerHTML=slots.map(([key,label])=>'<div class="gf-photo-slot"><strong>'+label+'</strong><div id="preview-'+key+'"><svg viewBox="0 0 100 90" aria-hidden="true">'+photoIcon(key)+'</svg></div><input type="file" data-photo="'+key+'" accept="image/*"></div>').join('');
 for(const [key]of slots){
  const path=device.photos?.[key];if(path&&docs.has(path)){const url=URL.createObjectURL(new Blob([docs.get(path)]));const img=document.createElement('img');img.src=url;img.alt='Aperçu '+key;img.onload=()=>URL.revokeObjectURL(url);$('preview-'+key).replaceChildren(img);}
 }
 $('photoSlots').querySelectorAll('[data-photo]').forEach(input=>input.onchange=async e=>{const file=e.target.files[0];if(!file)return;if(!file.type.startsWith('image/')){setStatus('Ce champ attend une image.');return;}const name='photos/'+input.dataset.photo+'-'+file.name.replace(/[^a-zA-Z0-9._-]/g,'_');docs.set(name,new Uint8Array(await file.arrayBuffer()));device.photos=device.photos||{};device.photos[input.dataset.photo]=name;renderPhotoSlots();renderDocs()});
}
function addVisitFiles(files){for(const file of files){pendingVisitDocs=pendingVisitDocs.filter(x=>x.name!==file.name);pendingVisitDocs.push(file)}renderVisitFiles()}
function renderVisitFiles(){$('visitDocList').innerHTML=pendingVisitDocs.map((f,i)=>'<li>'+safe(f.name)+' <button type="button" data-remove-visit="'+i+'">Retirer</button></li>').join('');$('visitDocList').querySelectorAll('[data-remove-visit]').forEach(el=>el.onclick=()=>{pendingVisitDocs.splice(Number(el.dataset.removeVisit),1);renderVisitFiles()})}
function renderDocs(){const root=$('docList');root.innerHTML='';for(const [name,bytes]of docs){const li=document.createElement('li');const ext=name.toLowerCase();if(/\.(png|jpg|jpeg|webp|gif)$/.test(ext)){const url=URL.createObjectURL(new Blob([bytes]));const img=document.createElement('img');img.className='gf-doc-thumb';img.alt='Aperçu '+name;img.src=url;img.onload=()=>URL.revokeObjectURL(url);li.append(img);}else{const symbol=document.createElement('span');symbol.textContent=/\.pdf$/.test(ext)?'📄 ':/\.docx?$/.test(ext)?'📝 ':'📎 ';li.append(symbol);}const label=document.createElement('span');label.textContent=name+' ('+Math.ceil(bytes.length/1024)+' Ko) ';li.append(label);const view=document.createElement('button');view.type='button';view.className='gf-doc-action';view.textContent='Voir';view.onclick=()=>{const type=/\.pdf$/.test(ext)?'application/pdf':/\.(png|jpg|jpeg|webp|gif)$/.test(ext)?'image/'+(ext.endsWith('.jpg')||ext.endsWith('.jpeg')?'jpeg':ext.split('.').pop()):'application/octet-stream';const url=URL.createObjectURL(new Blob([bytes],{type}));window.open(url,'_blank','noopener');setTimeout(()=>URL.revokeObjectURL(url),60000)};li.append(view);const remove=document.createElement('button');remove.type='button';remove.textContent='Retirer';remove.onclick=()=>{docs.delete(name);if(device.photos)for(const k of Object.keys(device.photos))if(device.photos[k]===name)delete device.photos[k];renderDocs();renderPhotoSlots()};li.append(remove);root.append(li)}}
async function appendDeviceFiles(files){if(!device){setStatus('Créer ou importer un appareil avant d’ajouter des fichiers.');return}for(const f of files){const n=(f.webkitRelativePath||f.name).split('/').map(x=>x.replace(/[^a-zA-Z0-9._-]/g,'_')).join('/');if(!n||n.includes('..'))continue;docs.set(n,new Uint8Array(await f.arrayBuffer()))}renderDocs();markUnsaved();setStatus(files.length+' fichier(s) ajouté(s) au dossier actif ; exporter le ZIP pour les conserver.')}
async function ingestNLabInput(p){if(!p||p.schema!=='nlab.input-result/v1')return;const a=(p.files||[]).filter(x=>x.file).map(x=>({name:x.file.name,webkitRelativePath:x.relative_path||'',arrayBuffer:()=>x.file.arrayBuffer()}));if(a.length)await appendDeviceFiles(a)}
document.addEventListener('nlab:input',e=>{if(e.detail&&e.detail.target==='guide-froid-device-documents')ingestNLabInput(e.detail).catch(err=>setStatus('Import impossible : '+err.message))});
function standalone(d){const rows=fields.map((k,i)=>'<p><strong>'+safe(labels[i])+' :</strong> '+safe(d[k]||'Non renseigné')+'</p>').join('');const history=(d.visites||[]).map(v=>'<section><h3>'+safe(v.date)+' · '+safe(v.type)+'</h3><p>Site : '+safe(v.site)+'</p><p>Observations : '+safe(v.observations)+'</p><p>Réalisé : '+safe(v.actions)+'</p><p>À prévoir : '+safe(v.aPrevoir)+'</p></section>').join('');const links=[...docs.keys()].map(n=>'<li><a href="documents/'+encodeURIComponent(n)+'">'+safe(n)+'</a></li>').join('');return '<!doctype html><html lang="fr"><head><meta charset="utf-8"><title>'+safe(d.title||d.id)+'</title><style>body{font:16px/1.5 Arial;max-width:950px;padding:25px;margin:auto}section{border:1px solid #ccd;padding:15px;margin:12px 0;border-radius:8px}@media print{button{display:none}}</style></head><body><button onclick="print()">Imprimer / PDF</button><h1>'+safe(d.title||d.id)+'</h1><section><h2>Appareil</h2>'+rows+'</section><section><h2>Documents</h2><ul>'+links+'</ul></section><h2>Visites et diagnostics</h2>'+history+'</body></html>'}
function exportZip(){if(!device)return;if(!device.familleFroid||!device.forme){setStatus('Choisir froid positif ou négatif puis la forme avant export.');return;}const d=readForm(),id=(d.id||'APPAREIL').replace(/[^a-zA-Z0-9_-]/g,'_'),entries=new Map([['appareil.json',JSON.stringify(d,null,2)],['manifest.json',JSON.stringify({schema:'nlab.guide-froid.package/1.1',id,documents:[...docs.keys()],visites:d.visites.length},null,2)],['index.html',standalone(d)]]);for(const [name,data]of docs)entries.set('documents/'+name,data);download(zip(entries),id+'.zip');pendingExport=false;setStatus('ZIP exporté : '+id+'.zip. Les modifications ne sont conservées qu’après téléchargement.')}
function report(index,onlySheet=false){if(!device)return;const d=readForm(),v=d.visites[index];if(!onlySheet&&!v){setStatus('Enregistrer une visite avant de générer le rapport.');return}let body=onlySheet?'<h2>Fiche appareil</h2>'+fields.map((k,i)=>'<p><b>'+safe(labels[i])+' :</b> '+safe(d[k])+'</p>').join(''):'<h2>'+safe(v.type)+' — '+safe(v.date)+'</h2><p>Site : '+safe(v.site)+'</p><h3>Observations</h3><p>'+safe(v.observations)+'</p><h3>Opérations réalisées</h3><p>'+safe(v.actions)+'</p><h3>Actions à prévoir</h3><p>'+safe(v.aPrevoir)+'</p>';const html='<!doctype html><html lang="fr"><head><meta charset="utf-8"><title>Rapport Guide Froid</title><style>body{font:16px/1.5 Arial;margin:30px auto;max-width:850px}h1{border-bottom:2px solid #16709a}p{white-space:pre-wrap}@media print{button{display:none}}</style></head><body><button onclick="print()">Enregistrer PDF</button><h1>Guide Froid · '+safe(d.title||d.id)+'</h1><p>Fabricant : '+safe(d.fabricant)+' · Modèle : '+safe(d.modele)+'</p>'+'<p>Fonction : '+safe((d.fonctionsUsage||[d.fonctionUsage].filter(Boolean)).join(', ')||'Non précisée')+' ; denrées : '+safe((d.denrees||[]).join(', ')||'Non précisées')+'</p>'+body+'<p><strong>Prévention sanitaire :</strong> '+safe(hacNotice)+'</p><p><small>Compte rendu descriptif ; une vérification non réalisée ne vaut pas validation technique ou sanitaire.</small></p></body></html>';const w=window.open('','_blank');if(!w){setStatus('Autoriser les fenêtres contextuelles pour imprimer.');return}w.document.open();w.document.write(html);w.document.close()}
$('importZip').onchange=async e=>{const file=e.target.files[0];if(!file)return;try{const map=await unzip(file),key=[...map.keys()].find(x=>/(^|\/)appareil\.json$/i.test(x));if(!key)throw Error('appareil.json introuvable');const prefix=key.slice(0,-'appareil.json'.length);device=normalizeImportedDevice(JSON.parse(D.decode(map.get(key))));pendingExport=false;docs=new Map();for(const [name,b]of map)if(name.startsWith(prefix+'documents/')&&name!==prefix+'documents/')docs.set(name.slice((prefix+'documents/').length),b);render();setStatus('Appareil importé : '+(device.title||device.id)+'. '+docs.size+' document(s).')}catch(err){setStatus('Import impossible : '+err.message)}};
$('importJson').onchange=async e=>{try{device=normalizeImportedDevice(JSON.parse(await e.target.files[0].text()));pendingExport=false;docs=new Map();render();setStatus('JSON importé. Compléter les éventuels documents manquants.')}catch(err){setStatus('JSON invalide : '+err.message)}};
$('demoDevice').onchange=e=>{if(e.target.value)openDemo(e.target.value)};
$('launchDiagnostic').onclick=()=>{if(!device)return;const d=readForm();const snapshot={schema:'nlab.guide-froid.handoff/1',time:Date.now(),appareil:{id:d.id,site:d.site,title:d.title,typeEquipement:d.typeEquipement,familleFroid:d.familleFroid,forme:d.forme,fabricant:d.fabricant,modele:d.modele,numero:d.numero,notice:d.notice,fonctionsUsage:d.fonctionsUsage||[],denrees:d.denrees||[]}};sessionStorage.setItem('nlab:guide-froid:handoff-v1',JSON.stringify(snapshot));location.href='../?mode=diagnostic&source=appareil'};
$('newDevice').onclick=()=>{pendingExport=true;device={id:'NOUVEL-APPAREIL',title:'Nouvel appareil',site:'',visites:[],schema:'nlab.guide-froid.appareil/1.0'};docs=new Map();render();setStatus('Nouvel appareil créé. Exporter le ZIP après modification.')};
$('documents').onchange=async e=>{await appendDeviceFiles([...e.target.files]);e.target.value=''};$('deviceFolder').onchange=async e=>{await appendDeviceFiles([...e.target.files]);e.target.value=''};const deviceDrop=$('deviceDrop');deviceDrop.ondragover=e=>e.preventDefault();deviceDrop.ondrop=async e=>{e.preventDefault();await appendDeviceFiles([...e.dataTransfer.files])};
$('saveVisit').onclick=async()=>{if(!device)return;readForm();const vid='VIS-'+Date.now(),pieces=[];for(const file of pendingVisitDocs){const key='visites/'+vid+'/'+file.name.replace(/[^a-zA-Z0-9._-]/g,'_');pieces.push(key);docs.set(key,new Uint8Array(await file.arrayBuffer()))}device.visites.push({id:vid,pieces,date:$('visitDate').value||new Date().toISOString().slice(0,10),site:$('visitSite').value,type:$('visitType').value,observations:$('observations').value,actions:$('actions').value,aPrevoir:$('todo').value});pendingVisitDocs=[];markUnsaved();renderVisitFiles();renderHistory();['observations','actions','todo'].forEach(k=>$(k).value='');setStatus('Visite ajoutée en mémoire : exporter le ZIP pour la conserver.')};
$('exportZip').onclick=exportZip;$('exportJson').onclick=()=>device&&download(new Blob([JSON.stringify(readForm(),null,2)],{type:'application/json'}),(device.id||'appareil')+'.json');$('printVisit').onclick=()=>report((device?.visites||[]).length-1);$('printSheet').onclick=()=>report(0,true);$('visitDate').value=new Date().toISOString().slice(0,10);


// B08 : prévenir la perte des pièces non exportées lors d'un changement de rubrique.
// Ne pas prétendre que les documents binaires sont persistés dans sessionStorage.
let pendingExport=false;
function markUnsaved(){pendingExport=true}
window.addEventListener('beforeunload',e=>{if(!pendingExport)return;e.preventDefault();e.returnValue=''});
document.querySelectorAll('a[href]').forEach(a=>a.addEventListener('click',e=>{if(!pendingExport||e.defaultPrevented||e.ctrlKey||e.metaKey||e.shiftKey||e.altKey||a.target==='_blank')return;if(!confirm('Des modifications de cet appareil ne sont pas encore enregistrées dans un ZIP. Quitter cette page sans les exporter ?'))e.preventDefault()}));

// B05 — Universal Input : acquisition canonique (fichiers, dossiers et glisser-déposer).
const universalHost=$('universalDeviceInput');
if(universalHost&&window.NLabUniversalInput?.create){
 window.NLabUniversalInput.create({host:universalHost,target:'guide-froid-device-documents',multiple:true,folder:true,dragdrop:true,camera:false,codeScan:false,hid:false});
 const legacy=$('deviceDrop');if(legacy)legacy.hidden=true;
}else if(universalHost){universalHost.textContent='Sélecteur commun indisponible ; utiliser les contrôles de repli ci-dessous.'}

// Accueil orienté parcours : pré-sélection sans chargement automatique de données privées.
const intent=new URLSearchParams(location.search).get('mode');if(intent==='new')$('newDevice').focus();else if(intent==='import')$('importZip').focus();else if(intent==='demo'){const id=new URLSearchParams(location.search).get('id');if(id&&demoSamples[id]){openDemo(id);$('demoDevice').value=id;}else $('demoDevice').focus();}else if(intent==='visit')$('status').textContent='Pour saisir une visite, importer le ZIP de l’appareil ou créer sa fiche, puis renseigner la section 3.';
