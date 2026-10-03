const FIRST=['Alice','Benoît','Chloé','David','Emma','Farid','Gabriel','Inès','Jules','Lina','Malo','Nora'];
const LAST=['Martin','Bernard','Thomas','Robert','Richard','Petit','Durand','Leroy','Moreau','Simon','Laurent','Lefèvre'];
const CITIES=['Paris','Lyon','Lille','Nantes','Bordeaux','Toulouse','Dijon','Reims','Tours','Rouen','Metz','Angers'];
const COMPANIES=['Acme Démo','Nova Test','Atelier Exemple','Orion Sandbox','Delta Fixture','Hexa Démo'];
const WORDS='lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua enim ad minim veniam quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat'.split(' ');

export function seededRng(seed=1){let x=(Number(seed)||1)>>>0;return()=>((x=(1664525*x+1013904223)>>>0)/4294967296)}
const pick=(r,a)=>a[Math.floor(r()*a.length)%a.length];
const pad=(n,l=2)=>String(n).padStart(l,'0');
function mod10(body){let sum=0,flip=true;for(let i=body.length-1;i>=0;i--){let n=Number(body[i]);sum+=flip?n*3:n;flip=!flip}return String((10-(sum%10))%10)}
export function fakeEan13(r,index=0){let body='3';for(let i=0;i<11;i++)body+=Math.floor(r()*10);return body+mod10(body)}
export function fakeEan8(r){let body='';for(let i=0;i<7;i++)body+=Math.floor(r()*10);return body+mod10(body)}
export function lorem(r,words=24){const out=[];for(let i=0;i<words;i++)out.push(pick(r,WORDS));return (out.join(' ').replace(/^./,x=>x.toUpperCase())+'.')}
export function uuid(r){const h=n=>Array.from({length:n},()=>Math.floor(r()*16).toString(16)).join('');return h(8)+'-'+h(4)+'-4'+h(3)+'-'+((8+Math.floor(r()*4)).toString(16))+h(3)+'-'+h(12)}
export const TYPE_OPTIONS=[
 ['synthetic_id','ID synthétique'],['first_name','Prénom fictif'],['last_name','Nom fictif'],['full_name','Nom complet fictif'],['recipe_title','Titre de recette fictive'],['ingredient','Ingrédient fictif'],['unit','Unité'],['email','E-mail fictif'],['phone','Téléphone fictif'],['company','Entreprise fictive'],['city','Ville'],['postal_code','Code postal'],['sku','SKU / référence article'],['ean13','EAN-13 valide'],['ean8','EAN-8 valide'],['code128','Payload Code 128'],['qr_payload','Payload QR'],['data_matrix','Payload Data Matrix'],['integer','Entier'],['decimal','Décimal'],['price','Prix'],['percentage','Pourcentage'],['date','Date'],['datetime','Date/heure'],['boolean','Booléen'],['url','URL de test'],['uuid','UUID'],['category','Catégorie'],['lorem','Lorem ipsum'],['markdown','Markdown court'],['image_url','URL image de démo']
];
export function inferType(name='',sample=[]){
 const n=String(name).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');
 if(/mail/.test(n))return'email';if(/phone|tel|mobile/.test(n))return'phone';if(/prenom|first/.test(n))return'first_name';if(/nom|name/.test(n)&&!/company|entreprise/.test(n))return'full_name';
 if(/ean.?13|gtin.?13/.test(n))return'ean13';if(/ean.?8|gtin.?8/.test(n))return'ean8';if(/sku|reference|ref_article|article/.test(n))return'sku';if(/qr/.test(n))return'qr_payload';if(/data.?matrix/.test(n))return'data_matrix';if(/code.?128|barcode|bar.?code/.test(n))return'code128';
 if(/ingredient|ingr[eé]dient/.test(n))return'ingredient';if(/unite|unit[eé]?|uom/.test(n))return'unit';if(/recette|recipe|titre_recette|recipe_title/.test(n))return'recipe_title';if(/date|jour|day/.test(n))return'date';if(/prix|price|montant|amount|cout|cost/.test(n))return'price';if(/pct|percent|pourcent|taux/.test(n))return'percentage';if(/ville|city/.test(n))return'city';if(/postal|zip/.test(n))return'postal_code';if(/entreprise|company|societe/.test(n))return'company';if(/url|link|lien/.test(n))return'url';if(/uuid|guid/.test(n))return'uuid';if(/^id$|_id$|ident/.test(n))return'synthetic_id';
 const vals=sample.filter(v=>v!==''&&v!=null).slice(0,20);if(vals.length){if(vals.every(v=>typeof v==='boolean'||/^(true|false|oui|non|0|1)$/i.test(String(v))))return'boolean';if(vals.every(v=>!Number.isNaN(Number(v))))return'decimal';if(vals.every(v=>/^\d{4}-\d{1,2}-\d{1,2}/.test(String(v))))return'date'}
 return'category'
}
export function inferSchema(records=[]){
 const rows=Array.isArray(records)?records:[];const keys=[...new Set(rows.flatMap(r=>Object.keys(r||{})))];
 return keys.map((name,i)=>({id:'c'+(i+1),name,type:inferType(name,rows.map(r=>r?.[name])),enabled:true}))
}
export function generateValue(type,r,index,opt={}){
 const i=index+1,first=pick(r,FIRST),last=pick(r,LAST);
 switch(type){
  case'first_name':return first;case'last_name':return last;case'full_name':return first+' '+last;
  case'email':return 'demo.'+pad(i,4)+'@example.test';
  case'phone':return '+33 6 00 '+pad(Math.floor(r()*100))+' '+pad(Math.floor(r()*100))+' '+pad(i%100);
  case'company':return pick(r,COMPANIES);case'city':return pick(r,CITIES);case'postal_code':return String(1000+Math.floor(r()*94000)).padStart(5,'0');case'recipe_title':return pick(r,['Gratin cosmique','Soupe pixelisée','Tarte des nuages','Risotto sandbox','Curry de démonstration','Salade prototype']);case'ingredient':return pick(r,['carotte','tomate','riz','lentilles','courgette','oignon','pomme de terre','pois chiche','herbes']);case'unit':return pick(r,['g','kg','ml','cl','L','pièce','c. à soupe','c. à café']);
  case'sku':return 'DEMO-'+String(100000+i);case'ean13':return fakeEan13(r,i);case'ean8':return fakeEan8(r);case'code128':return 'CODE128-DEMO-'+pad(i,5);
  case'qr_payload':return JSON.stringify({demo:true,id:'QR-'+pad(i,4),value:Math.floor(r()*10000)});
  case'data_matrix':return 'DM|DEMO|'+pad(i,5)+'|'+Math.floor(r()*100000);
  case'integer':return Math.floor(r()*10000);case'decimal':return Math.round(r()*100000)/100;case'price':return Math.round((2+r()*998)*100)/100;case'percentage':return Math.round(r()*10000)/100;
  case'date':{const d=new Date(Date.UTC(2025+Math.floor(r()*2),Math.floor(r()*12),1+Math.floor(r()*28)));return d.toISOString().slice(0,10)}
  case'datetime':{const d=new Date(Date.UTC(2025+Math.floor(r()*2),Math.floor(r()*12),1+Math.floor(r()*28),Math.floor(r()*24),Math.floor(r()*60)));return d.toISOString()}
  case'boolean':return r()>.5;case'url':return 'https://example.test/demo/'+pad(i,4);case'uuid':return uuid(r);case'lorem':return lorem(r,8+Math.floor(r()*12));
  case'markdown':return '### Élément '+i+'\n\n'+lorem(r,10);case'image_url':return 'https://picsum.photos/seed/nlab-'+i+'/640/360';
  case'synthetic_id':return 'NLAB-TEST-'+pad(i,5);case'category':default:return (opt.values?.length?pick(r,opt.values):pick(r,['Catégorie A','Catégorie B','Catégorie C','Catégorie D']))
 }
}
export function generateDataset(schema=[],count=40,seed=1){
 const r=seededRng(seed),active=schema.filter(c=>c.enabled!==false&&String(c.name||'').trim());
 return Array.from({length:Math.max(1,Math.min(100000,Number(count)||1))},(_,i)=>Object.fromEntries(active.map(c=>[c.name,generateValue(c.type||'category',r,i,c)])))
}
export function markdownTable(records=[]){
 if(!records.length)return'| Donnée |\n|---|\n| Aucune |';
 const keys=[...new Set(records.flatMap(Object.keys))],esc=v=>String(v??'').replace(/\|/g,'\\|').replace(/\r?\n/g,' ');
 return '| '+keys.map(esc).join(' | ')+' |\n| '+keys.map(()=> '---').join(' | ')+' |\n'+records.map(r=>'| '+keys.map(k=>esc(r[k])).join(' | ')+' |').join('\n')
}
export function generateDocumentModel({title='Document de démonstration',chapters=3,sections=2,paragraphs=2,seed=1,includeTable=true,includeImages=true}={}){
 const r=seededRng(seed),blocks=[{type:'h1',level:1,text:title},{type:'p',text:lorem(r,28)}];
 for(let c=1;c<=chapters;c++){
  blocks.push({type:'h1',level:1,text:'Chapitre '+c+' — '+pick(r,['Présentation','Analyse','Méthode','Résultats','Annexes'])});
  for(let s=1;s<=sections;s++){
   blocks.push({type:'h2',level:2,text:c+'.'+s+' '+pick(r,['Contexte','Données','Procédure','Observations','Synthèse'])});
   blocks.push({type:'h3',level:3,text:'Sous-section '+c+'.'+s+'.1'});
   for(let p=0;p<paragraphs;p++)blocks.push({type:'p',text:lorem(r,38+Math.floor(r()*28))});
   if(includeTable)blocks.push({type:'table',columns:['Référence','Libellé','Valeur'],rows:Array.from({length:4},(_,i)=>['DEMO-'+c+s+(i+1),'Élément '+(i+1),Math.round(r()*1000)/10])});
   if(includeImages)blocks.push({type:'image',alt:'Illustration synthétique '+c+'.'+s,seed:'doc-'+seed+'-'+c+'-'+s});
  }
 }
 return{schema:'nlab.synthetic-document/v1',synthetic:true,title,blocks}
}
export function documentToMarkdown(doc){
 return (doc.blocks||[]).map(b=>{if(/^h[123]$/.test(b.type))return'#'.repeat(b.level||Number(b.type[1]))+' '+b.text;if(b.type==='p')return b.text;if(b.type==='image')return'!['+b.alt+'](https://picsum.photos/seed/'+encodeURIComponent(b.seed)+'/960/540)';if(b.type==='table'){const rows=b.rows.map(r=>Object.fromEntries(b.columns.map((k,i)=>[k,r[i]])));return markdownTable(rows)}return''}).filter(Boolean).join('\n\n')
}
export function documentToHtml(doc){
 const e=s=>String(s??'').replace(/[&<>"]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[m]));
 const body=(doc.blocks||[]).map(b=>{if(/^h[123]$/.test(b.type))return'<'+b.type+'>'+e(b.text)+'</'+b.type+'>';if(b.type==='p')return'<p>'+e(b.text)+'</p>';if(b.type==='image')return'<figure><img alt="'+e(b.alt)+'" src="https://picsum.photos/seed/'+encodeURIComponent(b.seed)+'/960/540"><figcaption>'+e(b.alt)+'</figcaption></figure>';if(b.type==='table')return'<table><thead><tr>'+b.columns.map(x=>'<th>'+e(x)+'</th>').join('')+'</tr></thead><tbody>'+b.rows.map(r=>'<tr>'+r.map(x=>'<td>'+e(x)+'</td>').join('')+'</tr>').join('')+'</tbody></table>';return''}).join('');
 return'<!doctype html><html lang="fr"><head><meta charset="utf-8"><title>'+e(doc.title)+'</title><style>body{font-family:Arial,sans-serif;max-width:900px;margin:40px auto;line-height:1.55}img{max-width:100%}table{border-collapse:collapse;width:100%}td,th{border:1px solid #bbb;padding:6px}</style></head><body>'+body+'</body></html>'
}

export function syntheticDocumentFromStructure(structure,{title='Document de démonstration cloné',seed=1,preserveShape=true}={}){
 const r=seededRng(seed),blocks=[{type:'h1',level:1,text:title}];
 const src=structure?.blocks||[];
 const wordsFor=shape=>Math.max(5,Math.min(120,preserveShape?(shape?.words||18):18));
 for(const b of src){
  if(b.type==='page'){blocks.push({type:'h2',level:2,text:'Page '+(b.page||'')});continue}
  if(b.type==='heading'){
   const level=Math.max(1,Math.min(3,b.level||2));
   const label=level===1?'Chapitre':level===2?'Section':'Sous-section';
   blocks.push({type:'h'+level,level,text:label+' '+(1+Math.floor(r()*90))+' — '+lorem(r,Math.max(3,Math.min(8,Math.ceil(wordsFor(b.shape)/3)))).replace(/\.$/,'')});
   continue
  }
  if(b.type==='paragraph'){blocks.push({type:'p',text:lorem(r,wordsFor(b.shape))});continue}
  if(b.type==='table'){
   const n=Math.max(1,Math.min(12,b.columnCount||b.columns?.length||3)),rows=Math.max(1,Math.min(30,b.rowCount||4));
   const columns=Array.from({length:n},(_,i)=>b.columns?.[i]||('Colonne '+(i+1)));
   blocks.push({type:'table',columns,rows:Array.from({length:rows},(_,ri)=>columns.map((_,ci)=>ci===0?'DEMO-'+String(ri+1).padStart(3,'0'):ci===1?lorem(r,3).replace(/\.$/,''):Math.round(r()*10000)/100))});
   continue
  }
  if(b.type==='image')blocks.push({type:'image',alt:'Illustration synthétique',seed:'clone-'+seed+'-'+blocks.length});
 }
 if(blocks.length===1)blocks.push({type:'p',text:lorem(r,40)});
 return{schema:'nlab.synthetic-document/v1',synthetic:true,sourceStructure:{format:structure?.format||'',kind:structure?.kind||''},title,blocks}
}

export function applyFormatProfileToSchema(schema=[],profile=null){
 const byName=new Map((profile?.columns||[]).map(c=>[String(c.name),c]));
 return schema.map(col=>{
  const p=byName.get(String(col.name));if(!p)return col;
  let type=col.type;
  if(p.formatKind==='percentage')type='percentage';
  else if(/^currency_/.test(p.formatKind))type='price';
  else if(p.formatKind==='date')type='date';
  else if(p.formatKind==='decimal'&&['category','integer','decimal'].includes(type))type='decimal';
  else if(p.formatKind==='number'&&type==='category')type='integer';
  return{...col,type,formatProfile:{numberFormat:p.numberFormat||'',formatKind:p.formatKind||'general',cellType:p.cellType||'',width:p.width||null}}
 })
}
