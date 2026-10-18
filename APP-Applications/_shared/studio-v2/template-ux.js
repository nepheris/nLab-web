// Studio Core shared template profile and classified variable selector (opt-in TEST).
// Personal values remain only in the user's browser, never placed in GitHub or logs.
import {TEMPLATE_VARIABLES,templateVariableHelp} from './template-engine.js';
export const PROFILE_KEY='nlab:studio-v2:personal-template-profile:v1';
export const PROFILE_FIELDS=Object.freeze([
 {key:'FIRST_NAME',label:'Prénom',description:'Prénom de la personne qui utilise le Studio'},
 {key:'LAST_NAME',label:'Nom',description:'Nom de famille'},
 {key:'SITE',label:'Site',description:'Site, antenne ou implantation'},
 {key:'SERVICE',label:'Service',description:'Service ou équipe'},
 {key:'CLIENT',label:'Client',description:'Client ou organisme associé'},
 {key:'PROJECT',label:'Projet',description:'Projet courant'},
 {key:'REFERENCE',label:'Référence',description:'Référence libre'},
 {key:'CATEGORY',label:'Catégorie',description:'Catégorie métier par défaut'}
]);
export function readTemplateProfile(){
 try{const o=JSON.parse(localStorage.getItem(PROFILE_KEY)||'{}');return Object.fromEntries(PROFILE_FIELDS.map(f=>[f.key,String(o[f.key]??'').slice(0,160)]))}catch{return Object.fromEntries(PROFILE_FIELDS.map(f=>[f.key,'']))}
}
export function saveTemplateProfile(data){
 const o=Object.fromEntries(PROFILE_FIELDS.map(f=>[f.key,String(data[f.key]??'').trim().slice(0,160)]));
 try{localStorage.setItem(PROFILE_KEY,JSON.stringify(o))}catch{}
 document.dispatchEvent(new CustomEvent('studio-v2:template-profile-changed',{detail:{keys:Object.keys(o)}}));
 return o
}
export function templateProfileVariables(){
 const p=readTemplateProfile(),first=p.FIRST_NAME,last=p.LAST_NAME,joined=[first,last].filter(Boolean).join(' ');
 return {...p,FULL_NAME:joined,LAST_FIRST:[last,first].filter(Boolean).join(' '),DISPLAY_NAME:joined,INITIALS:((first.charAt(0)||'')+(last.charAt(0)||'')).toUpperCase()}
}
export function mountTemplateProfile({host,onChange}={}){
 if(!host)return;
 host.replaceChildren();
 const wrap=document.createElement('details');wrap.className='uxHistoryAccordion uxProfileSection';wrap.open=true;
 const summary=document.createElement('summary');summary.textContent='00 · Paramètres personnels (locaux)';wrap.append(summary);
 const intro=document.createElement('p');intro.className='uxProfileHint';intro.textContent='Renseignés une seule fois dans ce navigateur. Utilisés par {FIRST_NAME}, {LAST_NAME}, {FULL_NAME}, {SITE}, {SERVICE}, {CLIENT}, {PROJECT} et {REFERENCE}. Aucune transmission automatique.';
 const grid=document.createElement('div');grid.className='uxProfileGrid';const saved=readTemplateProfile();const inputs=new Map();
 for(const f of PROFILE_FIELDS){
  const label=document.createElement('label');label.textContent=f.label;label.title=f.description;
  const input=document.createElement('input');input.type='text';input.value=saved[f.key]||'';input.maxLength=160;input.autocomplete='off';input.placeholder=f.description;input.dataset.templateProfile=f.key;input.setAttribute('aria-label',f.label);
  label.append(input);grid.append(label);inputs.set(f.key,input);
 }
 let pending=false;
 const persist=()=>{if(pending)return;pending=true;queueMicrotask(()=>{pending=false;saveTemplateProfile(Object.fromEntries(Array.from(inputs,([k,v])=>[k,v.value])));onChange?.()})};
 grid.addEventListener('input',persist);
 document.addEventListener('studio-v2:template-profile-changed',()=>{const latest=readTemplateProfile();for(const [k,input] of inputs)if(document.activeElement!==input)input.value=latest[k]||''});
 const reset=document.createElement('button');reset.type='button';reset.textContent='Effacer les valeurs locales';reset.addEventListener('click',()=>{for(const input of inputs.values())input.value='';persist()});
 const status=document.createElement('small');status.className='uxProfileHint';status.textContent='Ces paramètres sont personnels au navigateur actuel.';
 const body=document.createElement('div');body.className='uxSaveFields';body.append(intro,grid,reset,status);wrap.append(body);host.append(wrap);
 return{inputs,element:wrap}
}
const CATEGORIES=[
 {id:'file',label:'01 · Fichier et format',description:'Nom, extension, poids, compteur et type',keys:['STUDIO','FILENAME','FULLNAME','STEM','EXT','EXT_DOT','FILESIZE','INDEX','COUNTER','NUMBER','NOM','FORMAT','MIME','FILE_FAMILY']},
 {id:'folder',label:'02 · Dossiers et chemins',description:'Dossier parent, sous-dossier et chemin relatif',keys:['FOLDER','PARENT','SUBFOLDER','SOURCE_DIR','RELATIVE_FOLDER','RELATIVE_PATH','PATH']},
 {id:'date',label:'03 · Dates, heures et périodes',description:'Ajouter : puis un masque, p. ex. {DATE:YYYY-MM-DD} ou {YEAR:YY}',keys:['DATE','NOW','TIME','DATETIME','TIMESTAMP','YEAR','MONTH','MONTH_NAME','DAY','HOUR','MINUTE','SECOND','WEEK','WEEK_YEAR','WEEK_PAD','WEEK_LABEL','MONTH_NAME_FR','MONTH_NAME_EN','DAY_NAME_FR','DAY_NAME_EN','STAMP_DATE','STAMP_DATETIME','STAMP_DATE_FMT','DATE_A','DATE_A_FMT','DATE_B','DATE_B_FMT','DATE_C','DATE_C_FMT','DATE_D','DATE_D_FMT']},
 {id:'identity',label:'04 · Identité et organisation',description:'Valeurs saisies dans Paramètres personnels (00)',keys:['FIRST_NAME','LAST_NAME','FULL_NAME','LAST_FIRST','DISPLAY_NAME','INITIALS','SITE','SERVICE','CLIENT','PROJECT','REFERENCE','CATEGORY']},
 {id:'document',label:'05 · Document et sélection',description:'Pages, sélection et métadonnées',keys:['PAGE','PAGES','SELECTED_COUNT','ARTIFACT_ID','SHA256']},
 {id:'action',label:'06 · Opérations et traitement',description:'Opération, produit, qualité et traitement',keys:['TAG','TREATMENT','PRODUCT','STATUS','OP','DPI','JPEG','GRAYSCALE']}
];
const DATE_PRESETS=[['','Valeur simple'],['YYYY-MM-DD','2026-10-18'],['DD-MM-YYYY','18-10-2026'],['DD_MM_YYYY','18_10_2026'],['YYYYMMDD','20261018'],['YY','Année courte (26)'],['MM','Mois sur 2 chiffres'],['MMMM','Nom du mois'],['DD','Jour sur 2 chiffres'],['HH-mm-ss','Heure 21-30-00'],['YYYYMMDD_HHmmss','20261018_213000'],['custom','Masque personnalisé…']];
export function createTemplateVariablePicker({host,engine,context,getTarget,refresh,helpHost,statusHost}={}){
 if(!host)return;
 host.replaceChildren();host.classList.add('uxTokenFamilies');
 let mask='';const keys=new Set(Object.keys(TEMPLATE_VARIABLES));
 for(const c of CATEGORIES)for(const k of c.keys)keys.add(k);
 const categories=CATEGORIES.map(x=>({...x,keys:[...new Set(x.keys)].filter(k=>keys.has(k))}));
 const dateKeys=new Set(categories.find(x=>x.id==='date').keys);
 const token=k=>'{'+k+(dateKeys.has(k)&&mask?':'+mask:'')+'}';
 const description=k=>TEMPLATE_VARIABLES[k]||({STUDIO:'Identifiant du Studio',COUNTER:'Compteur automatique',NUMBER:'Compteur sans zéros',NOM:'Nom de base',FORMAT:'Format de sortie',SUBFOLDER:'Dernier sous-dossier',RELATIVE_FOLDER:'Dossier relatif'}[k]||'Variable de contexte');
 function explain(k){
  const text=token(k),{name,values}=context(),example=engine.resolve(text,name,values);
  const message=text+' — '+description(k)+' · Exemple : '+(example||'(non renseignée)');
  if(helpHost)helpHost.textContent=message;
  return message
 }
 function insert(k){const field=getTarget();if(!field)return;const t=token(k),start=field.selectionStart??field.value.length,end=field.selectionEnd??start;field.setRangeText(t,start,end,'end');field.dispatchEvent(new Event('input',{bubbles:true}));field.focus();refresh?.()}
 for(const c of categories){
  const box=document.createElement('details');box.className='uxTokenFamily';box.dataset.family=c.id;box.open=c.id==='file'||c.id==='date';
  const title=document.createElement('summary');title.textContent=c.label;box.append(title);
  const note=document.createElement('p');note.className='uxFamilyHint';note.textContent=c.description;box.append(note);
  if(c.id==='date'){
   const options=document.createElement('div');options.className='uxDateFormatRow';
   const select=document.createElement('select');select.id='uxSaveDateMask';select.setAttribute('aria-label','Format de date');
   for(const [value,label]of DATE_PRESETS){const opt=document.createElement('option');opt.value=value;opt.textContent=label;select.append(opt)}
   const custom=document.createElement('input');custom.id='uxSaveDateCustom';custom.placeholder='Ex. YYYY_MM_DD';custom.setAttribute('aria-label','Masque personnalisé');custom.hidden=true;
   const apply=()=>{custom.hidden=select.value!=='custom';mask=select.value==='custom'?custom.value:select.value;if(mask&&!/^[A-Za-z0-9 _.,:/+-]{1,80}$/.test(mask)){mask='';if(statusHost)statusHost.textContent='Masque de date invalide.'}for(const chip of box.querySelectorAll('[data-template-token]'))chip.textContent=token(chip.dataset.templateToken);refresh?.()};
   select.addEventListener('change',apply);custom.addEventListener('input',apply);
   const expl=document.createElement('small');expl.className='uxFamilyHint';expl.textContent='YYYY année · MM mois · DD jour · HH heure · mm minute · ss seconde. Le signe « : » s’ajoute automatiquement.';
   options.append(select,custom,expl);box.append(options)
  }
  const chips=document.createElement('div');chips.className='uxTokenList';
  for(const k of c.keys){
   const wrap=document.createElement('span');wrap.className='uxToken';wrap.dataset.tokenKey=k;
   const main=document.createElement('button');main.type='button';main.dataset.templateToken=k;main.textContent=token(k);main.title=description(k)+' — '+token(k);main.setAttribute('aria-label','Copier '+k);
   const add=document.createElement('button');add.type='button';add.textContent='+';add.title='Insérer '+k+' dans le modèle';
   const help=document.createElement('button');help.type='button';help.className='uxTokenHelp';help.textContent='?';help.title='Aide pour '+k;
   const hint=document.createElement('span');hint.className='uxTokenTooltip';hint.setAttribute('role','tooltip');
   const show=()=>{hint.textContent=explain(k);main.title=hint.textContent;add.title='Insérer '+token(k)};
   wrap.addEventListener('mouseenter',show);wrap.addEventListener('focusin',show);
   main.addEventListener('click',async()=>{const val=token(k);try{await navigator.clipboard.writeText(val);if(statusHost)statusHost.textContent='Copié : '+val}catch{insert(k)}});
   add.addEventListener('click',()=>insert(k));
   help.addEventListener('click',show);
   wrap.append(main,add,help,hint);chips.append(wrap)
  }
  box.append(chips);host.append(box)
 }
 return{insert,explain,get mask(){return mask},groups:categories.map(x=>x.id)}
}
export const TEMPLATE_CONTENT_HELP=Object.freeze({
 collection:'Tous les fichiers de la collection : noms, tailles, types, dossiers relatifs et rotations d’aperçu. Pas les fichiers originaux.',
 selection:'Uniquement les fichiers cochés : métadonnées et rotations visuelles de la sélection. Rien si aucun fichier n’est sélectionné.',
 session:'État du laboratoire : échantillon de démonstration, date, fichiers de la session et paramètres de test. Aucun document métier modifié.'
});
export const TEMPLATE_FORMAT_HELP=Object.freeze({
 json:'JSON : structure complète lisible par des logiciels et scripts. Conserve les champs nommés.',
 csv:'CSV : lignes de fichiers séparées par point-virgule ; adapté aux tableurs français.',
 txt:'TXT : liste textuelle simple, pour lecture et partage.'
});
export function mountContextualSaveHelp({contentSelect,formatSelect,host,refresh}={}){
 const update=()=>{if(host)host.textContent=(TEMPLATE_CONTENT_HELP[contentSelect?.value]||'')+' '+(TEMPLATE_FORMAT_HELP[formatSelect?.value]||'');refresh?.()};
 contentSelect?.addEventListener('change',update);formatSelect?.addEventListener('change',update);
 for(const select of [contentSelect,formatSelect])for(const opt of select?.options||[]){opt.title=(select===contentSelect?TEMPLATE_CONTENT_HELP:TEMPLATE_FORMAT_HELP)[opt.value]||''}
 update();return{update}
}
