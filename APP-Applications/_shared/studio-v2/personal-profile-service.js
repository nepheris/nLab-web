const PROFILE_KEY='nlab-personal-profile-v1';
const SESSION_PROFILE_KEY='nlab-personal-profile-session-v1';
const SECURITY_MODE_KEY='nlab-personal-profile-security-mode';
const SESSION_KEY_KEY='nlab-personal-profile-session-crypto-key-v1';
const DB_NAME='nlab-personal-profile-assets';
const DB_VERSION=1;
const STORE='assets';
const SCHEMA='nlab-personal-profile/v1';
const MAX_FILES=100;
const MAX_ASSET_BYTES=10*1024*1024;
const MAX_TOTAL_BYTES=25*1024*1024;
const PORTABLE_KEYS=['nlab-studio-v2-settings','nlab-studio-v2-workflow-presets'];
const PORTABLE_PREFIXES=['nlab-studio-v2-ribbon-','nlab-studio-v2-menu-','nlab-studio-v2-window-','nlab-studio-v2-panel-'];

const clone=x=>JSON.parse(JSON.stringify(x));
const now=()=>new Date().toISOString();
const safeName=s=>String(s||'file').replace(/[^a-zA-Z0-9._-]+/g,'_').replace(/^\.+/,'').slice(0,140)||'file';
const uid=()=>globalThis.crypto?.randomUUID?.()||('asset-'+Date.now()+'-'+Math.random().toString(16).slice(2));
const bytesToB64=bytes=>btoa(String.fromCharCode(...bytes));
const b64ToBytes=s=>Uint8Array.from(atob(s),c=>c.charCodeAt(0));

export const PERSONAL_VARIABLES=Object.freeze([
 ['INITIALS','Initiales'],['CLIENT','Client'],['PROJECT','Projet'],['REFERENCE','Référence'],
 ['SITE','Site'],['SERVICE','Service'],['CATEGORY','Catégorie'],['TAG','Tag'],['TREATMENT','Traitement']
]);

export function getPersonalProfileSecurityMode(){
 return localStorage.getItem(SECURITY_MODE_KEY)==='session'?'session':'device';
}

export function createDefaultPersonalProfile(){
 return{
  schema:SCHEMA,
  profileVersion:'1.2.0',
  createdAt:now(),
  updatedAt:now(),
  identity:{displayName:'',initials:''},
  variables:{INITIALS:'',CLIENT:'',PROJECT:'',REFERENCE:'',SITE:'',SERVICE:'',CATEGORY:'',TAG:'',TREATMENT:'TRAITEMENT'},
  templates:{
   naming:[
    {id:'original',label:'Nom original',template:'{FILENAME}',prefix:'',suffix:''},
    {id:'date-name',label:'Date + nom',template:'{DATE:YYYY-MM-DD}_{FILENAME}',prefix:'',suffix:''},
    {id:'name-date',label:'Nom + date',template:'{FILENAME}_{DATE:YYYY-MM-DD}',prefix:'',suffix:''},
    {id:'ocr-name',label:'OCR + nom',template:'{FILENAME}',prefix:'OCR_',suffix:''},
    {id:'name-ocr',label:'Nom + OCR',template:'{FILENAME}',prefix:'',suffix:'_OCR'}
   ],
   classification:[
    {id:'root',label:'Racine',template:''},
    {id:'treatment',label:'Traitement',template:'{TREATMENT}'},
    {id:'year-month',label:'Année / mois',template:'{YEAR}/{MONTH}'},
    {id:'treatment-date',label:'Traitement / année / mois',template:'{TREATMENT}/{YEAR}/{MONTH}'},
    {id:'client-project',label:'Client / projet',template:'{CLIENT}/{PROJECT}'}
   ],
   stamps:[],
   output:[],
   workflows:[]
  },
  preferences:{studios:{}},
  recentLocations:{input:[],output:[]},
  assets:{
   signatures:[],
   initialsImages:[],
   defaultSignatureId:null,
   defaultInitialsImageId:null,
   signature:null,
   initialsImage:null,
   stamps:[]
  }
 };
}

function normalizeAssetRef(ref,fallbackLabel='Asset'){
 if(!ref||typeof ref!=='object'||!ref.assetId)return null;
 return{
  assetId:String(ref.assetId),
  name:String(ref.name||fallbackLabel),
  label:String(ref.label||ref.name||fallbackLabel),
  type:String(ref.type||''),
  size:Number(ref.size||0),
  variant:String(ref.variant||'custom'),
  createdAt:ref.createdAt||now()
 }
}
function uniqueAssetRefs(list=[]){
 const m=new Map();
 for(const raw of list){const ref=normalizeAssetRef(raw);if(ref)m.set(ref.assetId,ref)}
 return[...m.values()]
}
function normalizeAssetCollections(raw={},defaults={}){
 const legacySignature=normalizeAssetRef(raw?.signature,'Signature principale');
 const legacyInitials=normalizeAssetRef(raw?.initialsImage,'Paraphe principal');
 const signatures=uniqueAssetRefs([...(Array.isArray(raw?.signatures)?raw.signatures:[]),...(legacySignature?[legacySignature]:[])]);
 const initialsImages=uniqueAssetRefs([...(Array.isArray(raw?.initialsImages)?raw.initialsImages:[]),...(legacyInitials?[legacyInitials]:[])]);
 const wantedSignature=String(raw?.defaultSignatureId||legacySignature?.assetId||signatures[0]?.assetId||'');
 const wantedInitials=String(raw?.defaultInitialsImageId||legacyInitials?.assetId||initialsImages[0]?.assetId||'');
 const signature=signatures.find(x=>x.assetId===wantedSignature)||signatures[0]||null;
 const initialsImage=initialsImages.find(x=>x.assetId===wantedInitials)||initialsImages[0]||null;
 return{
  ...defaults,...raw,
  signatures,initialsImages,
  defaultSignatureId:signature?.assetId||null,
  defaultInitialsImageId:initialsImage?.assetId||null,
  signature,initialsImage,
  stamps:Array.isArray(raw?.stamps)?raw.stamps:[]
 }
}
function normalizeProfile(raw){
 const d=createDefaultPersonalProfile(),p=raw&&typeof raw==='object'?raw:{};
 return{
  ...d,...p,
  schema:SCHEMA,
  profileVersion:p.profileVersion||d.profileVersion,
  identity:{...d.identity,...(p.identity||{})},
  variables:{...d.variables,...(p.variables||{})},
  templates:{
   naming:Array.isArray(p.templates?.naming)?p.templates.naming:d.templates.naming,
   classification:Array.isArray(p.templates?.classification)?p.templates.classification:d.templates.classification,
   stamps:Array.isArray(p.templates?.stamps)?p.templates.stamps:[],
   output:Array.isArray(p.templates?.output)?p.templates.output:[],
   workflows:Array.isArray(p.templates?.workflows)?p.templates.workflows:[]
  },
  preferences:{...d.preferences,...(p.preferences||{}),studios:{...(d.preferences.studios||{}),...(p.preferences?.studios||{})}},
  recentLocations:{
   input:Array.isArray(p.recentLocations?.input)?p.recentLocations.input:[],
   output:Array.isArray(p.recentLocations?.output)?p.recentLocations.output:[]
  },
  assets:normalizeAssetCollections(p.assets,d.assets),
  updatedAt:p.updatedAt||now()
 };
}

function profileStorage(){
 return getPersonalProfileSecurityMode()==='session'?sessionStorage:localStorage;
}
export function loadPersonalProfile(){
 try{return normalizeProfile(JSON.parse(profileStorage().getItem(getPersonalProfileSecurityMode()==='session'?SESSION_PROFILE_KEY:PROFILE_KEY)||'null'))}
 catch{return createDefaultPersonalProfile()}
}
export function savePersonalProfile(profile,{emit=true}={}){
 const p=normalizeProfile(profile);p.updatedAt=now();if(!p.createdAt)p.createdAt=p.updatedAt;
 const mode=getPersonalProfileSecurityMode();
 (mode==='session'?sessionStorage:localStorage).setItem(mode==='session'?SESSION_PROFILE_KEY:PROFILE_KEY,JSON.stringify(p));
 if(mode==='session')localStorage.removeItem(PROFILE_KEY);
 if(emit)document.dispatchEvent(new CustomEvent('nlab:personal-profile-changed',{detail:{profile:clone(p),securityMode:mode}}));
 return p
}
export function updatePersonalProfile(mutator){
 const p=loadPersonalProfile(),next=typeof mutator==='function'?(mutator(clone(p))||p):{...p,...(mutator||{})};
 return savePersonalProfile(next)
}
export function resetPersonalProfile(){
 profileStorage().removeItem(getPersonalProfileSecurityMode()==='session'?SESSION_PROFILE_KEY:PROFILE_KEY);
 document.dispatchEvent(new Event('nlab:personal-profile-changed'));return createDefaultPersonalProfile()
}
export function listPersonalTemplates(type){const p=loadPersonalProfile();return Array.isArray(p.templates?.[type])?clone(p.templates[type]):[]}
export function savePersonalTemplate(type,item={}){
 if(!['naming','classification','stamps','output','workflows'].includes(type))throw new Error('Type de modèle personnel inconnu');
 const id=item.id||uid();return updatePersonalProfile(p=>{p.templates=p.templates||{};const list=Array.isArray(p.templates[type])?p.templates[type]:[];p.templates[type]=[{...item,id},...list.filter(x=>x.id!==id)];return p})
}
export function removePersonalTemplate(type,id){return updatePersonalProfile(p=>{if(Array.isArray(p.templates?.[type]))p.templates[type]=p.templates[type].filter(x=>x.id!==id);return p})}
export function rememberRecentLocation(kind,entry={}){
 if(!['input','output'].includes(kind))throw new Error('Type de dossier récent inconnu');
 return updatePersonalProfile(p=>{p.recentLocations=p.recentLocations||{input:[],output:[]};const key=String(entry.id||entry.path||entry.name||'').trim();const list=Array.isArray(p.recentLocations[kind])?p.recentLocations[kind]:[];p.recentLocations[kind]=[{...entry,id:key||uid(),updatedAt:now()},...list.filter(x=>String(x.id||x.path||x.name)!==key)].slice(0,20);return p})
}
export function setDefaultPersonalAsset(kind,assetId){
 const cfg=kind==='signature'?{list:'signatures',key:'defaultSignatureId',legacy:'signature'}:kind==='initials'?{list:'initialsImages',key:'defaultInitialsImageId',legacy:'initialsImage'}:null;
 if(!cfg)throw new Error('Type d’asset personnel inconnu');
 return updatePersonalProfile(p=>{const list=p.assets?.[cfg.list]||[];const ref=list.find(x=>x.assetId===assetId)||null;p.assets[cfg.key]=ref?.assetId||null;p.assets[cfg.legacy]=ref;return p})
}
export function removePersonalAssetRef(kind,assetId){
 const cfg=kind==='signature'?{list:'signatures',key:'defaultSignatureId',legacy:'signature'}:kind==='initials'?{list:'initialsImages',key:'defaultInitialsImageId',legacy:'initialsImage'}:null;
 if(!cfg)throw new Error('Type d’asset personnel inconnu');
 return updatePersonalProfile(p=>{p.assets[cfg.list]=(p.assets?.[cfg.list]||[]).filter(x=>x.assetId!==assetId);if(p.assets[cfg.key]===assetId)p.assets[cfg.key]=p.assets[cfg.list][0]?.assetId||null;p.assets[cfg.legacy]=p.assets[cfg.list].find(x=>x.assetId===p.assets[cfg.key])||p.assets[cfg.list][0]||null;return p})
}
export function profileTemplateValues(profile=loadPersonalProfile()){
 return{...(profile.variables||{}),INITIALS:profile.variables?.INITIALS||profile.identity?.initials||''}
}
export function capturePortableLocalSettings(){
 const out={};
 for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);if(!k)continue;if(PORTABLE_KEYS.includes(k)||PORTABLE_PREFIXES.some(p=>k.startsWith(p)))out[k]=localStorage.getItem(k)}
 return out
}
export function applyPortableLocalSettings(settings={}){
 for(const [k,v]of Object.entries(settings||{})){if(PORTABLE_KEYS.includes(k)||PORTABLE_PREFIXES.some(p=>k.startsWith(p)))localStorage.setItem(k,String(v))}
 document.dispatchEvent(new Event('nlab:portable-settings-imported'))
}

function openDb(){
 return new Promise((res,rej)=>{
  const r=indexedDB.open(DB_NAME,DB_VERSION);
  r.onupgradeneeded=()=>{const db=r.result;if(!db.objectStoreNames.contains(STORE)){const s=db.createObjectStore(STORE,{keyPath:'id'});s.createIndex('kind','kind',{unique:false})}};
  r.onsuccess=()=>res(r.result);r.onerror=()=>rej(r.error)
 })
}
function txDone(tx){return new Promise((res,rej)=>{tx.oncomplete=()=>res();tx.onerror=()=>rej(tx.error);tx.onabort=()=>rej(tx.error)})}
async function rawAsset(id){
 if(!id)return null;const db=await openDb(),tx=db.transaction(STORE,'readonly'),r=tx.objectStore(STORE).get(id),v=await new Promise((res,rej)=>{r.onsuccess=()=>res(r.result||null);r.onerror=()=>rej(r.error)});db.close();return v
}
async function rawAssets(){
 const db=await openDb(),tx=db.transaction(STORE,'readonly'),r=tx.objectStore(STORE).getAll(),v=await new Promise((res,rej)=>{r.onsuccess=()=>res(r.result||[]);r.onerror=()=>rej(r.error)});db.close();return v
}
async function clearAssets(){const db=await openDb(),tx=db.transaction(STORE,'readwrite');tx.objectStore(STORE).clear();await txDone(tx);db.close()}

async function sessionCryptoKey({create=false}={}){
 let raw=sessionStorage.getItem(SESSION_KEY_KEY);
 if(!raw&&create){const bytes=crypto.getRandomValues(new Uint8Array(32));raw=bytesToB64(bytes);sessionStorage.setItem(SESSION_KEY_KEY,raw)}
 if(!raw)return null;
 return crypto.subtle.importKey('raw',b64ToBytes(raw),{name:'AES-GCM'},false,['encrypt','decrypt'])
}
async function encryptBlobForSession(blob){
 const key=await sessionCryptoKey({create:true}),iv=crypto.getRandomValues(new Uint8Array(12)),plain=await blob.arrayBuffer(),cipher=await crypto.subtle.encrypt({name:'AES-GCM',iv},key,plain);
 return{encrypted:true,iv:[...iv],cipher,type:blob.type||'application/octet-stream'}
}
async function decryptRecord(record){
 if(!record?.encrypted)return record;
 const key=await sessionCryptoKey();
 if(!key)return null;
 try{
  const plain=await crypto.subtle.decrypt({name:'AES-GCM',iv:new Uint8Array(record.iv||[])},key,record.cipher);
  return{...record,blob:new Blob([plain],{type:record.type||'application/octet-stream'}),cipher:undefined,iv:undefined,encrypted:false}
 }catch{return null}
}
export async function putPersonalAsset(kind,file,{id=null,name=null,meta={}}={}){
 if(!(file instanceof Blob))throw new Error('Asset invalide');
 if(file.size>MAX_ASSET_BYTES)throw new Error('Fichier trop volumineux (10 Mo max)');
 const asset={id:id||uid(),kind:String(kind||'asset'),name:safeName(name||file.name||'asset'),type:file.type||'application/octet-stream',size:file.size,updatedAt:now(),meta:{...meta}};
 const stored=getPersonalProfileSecurityMode()==='session'?{...asset,...await encryptBlobForSession(file)}:{...asset,blob:file,encrypted:false};
 const db=await openDb(),tx=db.transaction(STORE,'readwrite');tx.objectStore(STORE).put(stored);await txDone(tx);db.close();return asset
}
export async function getPersonalAsset(id){
 const r=await rawAsset(id);return r?.encrypted?await decryptRecord(r):r
}
export async function listPersonalAssets(){
 const rows=await rawAssets(),out=[];for(const r of rows){const a=r?.encrypted?await decryptRecord(r):r;if(a)out.push(a)}return out
}
export async function deletePersonalAsset(id){
 if(!id)return;const db=await openDb(),tx=db.transaction(STORE,'readwrite');tx.objectStore(STORE).delete(id);await txDone(tx);db.close()
}

export async function initializePersonalProfileSecurity(){
 if(getPersonalProfileSecurityMode()!=='session')return{mode:'device',fresh:false};
 const hasProfile=!!sessionStorage.getItem(SESSION_PROFILE_KEY),hasKey=!!sessionStorage.getItem(SESSION_KEY_KEY);
 if(!hasProfile||!hasKey){
  sessionStorage.removeItem(SESSION_PROFILE_KEY);sessionStorage.removeItem(SESSION_KEY_KEY);await clearAssets();
  savePersonalProfile(createDefaultPersonalProfile(),{emit:false});
  return{mode:'session',fresh:true}
 }
 return{mode:'session',fresh:false}
}
export async function setPersonalProfileSecurityMode(mode){
 mode=mode==='session'?'session':'device';const currentMode=getPersonalProfileSecurityMode();if(mode===currentMode)return{mode};
 const profile=loadPersonalProfile(),assets=await listPersonalAssets();
 await clearAssets();
 if(mode==='session'){
  localStorage.setItem(SECURITY_MODE_KEY,'session');
  localStorage.removeItem(PROFILE_KEY);
  sessionStorage.setItem(SESSION_PROFILE_KEY,JSON.stringify(profile));
  await sessionCryptoKey({create:true});
 }else{
  localStorage.setItem(SECURITY_MODE_KEY,'device');
  localStorage.setItem(PROFILE_KEY,JSON.stringify(profile));
  sessionStorage.removeItem(SESSION_PROFILE_KEY);
  sessionStorage.removeItem(SESSION_KEY_KEY);
 }
 for(const a of assets)if(a?.blob)await putPersonalAsset(a.kind,a.blob,{id:a.id,name:a.name,meta:a.meta||{}});
 document.dispatchEvent(new CustomEvent('nlab:personal-security-mode-changed',{detail:{mode}}));
 document.dispatchEvent(new CustomEvent('nlab:personal-profile-changed',{detail:{profile:clone(profile),securityMode:mode}}));
 return{mode}
}
export async function clearPrivateSession(){
 if(getPersonalProfileSecurityMode()!=='session')return;
 sessionStorage.removeItem(SESSION_PROFILE_KEY);sessionStorage.removeItem(SESSION_KEY_KEY);await clearAssets();
 savePersonalProfile(createDefaultPersonalProfile(),{emit:false});
 document.dispatchEvent(new Event('nlab:personal-profile-changed'))
}

async function ensureJSZip(){
 if(window.JSZip)return window.JSZip;
 await new Promise((res,rej)=>{const s=document.createElement('script');s.src='https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js';s.onload=res;s.onerror=()=>rej(new Error('Impossible de charger le moteur ZIP'));document.head.append(s)});
 if(!window.JSZip)throw new Error('Moteur ZIP indisponible');return window.JSZip
}
async function sha256(blob){
 if(!globalThis.crypto?.subtle)return null;
 const b=blob instanceof Blob?await blob.arrayBuffer():new TextEncoder().encode(String(blob)).buffer;
 const h=await crypto.subtle.digest('SHA-256',b);return[...new Uint8Array(h)].map(x=>x.toString(16).padStart(2,'0')).join('')
}
function assetFolder(kind){if(kind==='signature'||kind==='initials')return'signatures';if(kind==='stamp')return'stamps';return'assets'}
function downloadBlob(blob,name){const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(a.href),1500)}

export async function exportPersonalProfileZip({download=true,fileName=null}={}){
 const JSZip=await ensureJSZip(),zip=new JSZip(),profile=loadPersonalProfile(),assets=await listPersonalAssets(),manifestAssets=[];
 profile.preferences={...(profile.preferences||{}),portableLocalSettings:capturePortableLocalSettings()};
 for(const a of assets){
  const path='assets/'+assetFolder(a.kind)+'/'+safeName(a.id+'-'+a.name);
  manifestAssets.push({id:a.id,kind:a.kind,name:a.name,type:a.type,size:a.size,path,sha256:await sha256(a.blob),meta:a.meta||{}});
  zip.file(path,a.blob,{binary:true})
 }
 const exportedAt=now(),manifest={schema:SCHEMA,profileVersion:profile.profileVersion||'1.2.0',exportedAt,assetCount:manifestAssets.length,assets:manifestAssets};
 zip.file('manifest.json',JSON.stringify(manifest,null,2));
 zip.file('profile.json',JSON.stringify({...profile,updatedAt:exportedAt},null,2));
 const blob=await zip.generateAsync({type:'blob',compression:'DEFLATE',compressionOptions:{level:6}});
 const name=fileName||('nlab-profile-'+(profile.identity?.initials||'personal')+'-'+exportedAt.slice(0,10)+'.zip');
 if(download)downloadBlob(blob,name);
 return{blob,name,manifest}
}

function validAssetRef(ref,ids){return !ref||typeof ref!=='object'||!ref.assetId||ids.has(ref.assetId)}
function validateProfileAssets(profile,ids){
 for(const x of profile.assets?.signatures||[])if(!validAssetRef(x,ids))throw new Error('Référence de signature absente de l’archive');
 for(const x of profile.assets?.initialsImages||[])if(!validAssetRef(x,ids))throw new Error('Référence de paraphe absente de l’archive');
 if(!validAssetRef(profile.assets?.signature,ids))throw new Error('Signature par défaut absente de l’archive');
 if(!validAssetRef(profile.assets?.initialsImage,ids))throw new Error('Paraphe par défaut absent de l’archive');
 for(const x of profile.assets?.stamps||[])if(!validAssetRef(x,ids))throw new Error('Référence de tampon absente de l’archive')
}
export async function inspectPersonalProfileZip(file){
 if(!(file instanceof Blob))throw new Error('ZIP invalide');
 if(file.size>MAX_TOTAL_BYTES)throw new Error('Archive trop volumineuse (25 Mo max)');
 const JSZip=await ensureJSZip(),zip=await JSZip.loadAsync(file),names=Object.keys(zip.files);
 if(names.length>MAX_FILES)throw new Error('Archive contenant trop de fichiers');
 const manifestEntry=zip.file('manifest.json'),profileEntry=zip.file('profile.json');
 if(!manifestEntry||!profileEntry)throw new Error('Archive nLab invalide : manifest.json ou profile.json absent');
 const manifest=JSON.parse(await manifestEntry.async('text')),profile=normalizeProfile(JSON.parse(await profileEntry.async('text')));
 if(manifest.schema!==SCHEMA||profile.schema!==SCHEMA)throw new Error('Schéma de profil nLab non pris en charge');
 const assets=Array.isArray(manifest.assets)?manifest.assets:[];
 if(assets.length>MAX_FILES-2)throw new Error('Trop d’assets dans le profil');
 let total=0;
 for(const a of assets){
  if(!a.path?.startsWith('assets/')||a.path.includes('..')||a.path.startsWith('/'))throw new Error('Chemin asset invalide');
  if(['signature','initials'].includes(a.kind)&&!['image/png','image/jpeg','image/webp'].includes(String(a.type||'').toLowerCase()))throw new Error('Format de signature/paraphe non autorisé : '+a.name);
  const e=zip.file(a.path);if(!e)throw new Error('Asset manquant : '+a.name);
  const n=Number(e?._data?.uncompressedSize||a.size||0);if(n>MAX_ASSET_BYTES)throw new Error('Asset trop volumineux : '+a.name);total+=n
 }
 if(total>MAX_TOTAL_BYTES)throw new Error('Contenu décompressé trop volumineux');
 validateProfileAssets(profile,new Set(assets.map(x=>x.id)));
 return{zip,manifest,profile,summary:{
  displayName:profile.identity?.displayName||'',initials:profile.identity?.initials||profile.variables?.INITIALS||'',
  variables:Object.values(profile.variables||{}).filter(Boolean).length,
  namingTemplates:profile.templates?.naming?.length||0,classificationTemplates:profile.templates?.classification?.length||0,
  stampTemplates:profile.templates?.stamps?.length||0,signatures:profile.assets?.signatures?.length||0,
  initialsImages:profile.assets?.initialsImages?.length||0,assets:assets.length
 }}
}
export async function importPersonalProfileZip(file,{mode='replace'}={}){
 const inspected=await inspectPersonalProfileZip(file),{zip,manifest}=inspected;
 const prepared=[];
 for(const a of manifest.assets||[]){
  const e=zip.file(a.path),raw=await e.async('blob'),blob=new Blob([raw],{type:a.type||raw.type||'application/octet-stream'});
  if(blob.size>MAX_ASSET_BYTES)throw new Error('Asset trop volumineux : '+a.name);
  if(a.sha256){const digest=await sha256(blob);if(digest&&digest!==a.sha256)throw new Error('Contrôle d’intégrité échoué : '+a.name)}
  prepared.push({a,blob})
 }
 if(mode==='replace')await clearAssets();
 const importedIds=new Set();
 for(const {a,blob}of prepared){await putPersonalAsset(a.kind,blob,{id:a.id,name:a.name,meta:a.meta||{}});importedIds.add(a.id)}
 let profile=inspected.profile;
 if(mode==='merge'){
  const current=loadPersonalProfile();
  const mergeById=(a,b)=>{const m=new Map();for(const x of[...(a||[]),...(b||[])])m.set(x.id||x.assetId||JSON.stringify(x),x);return[...m.values()]};
  const mergedAssets={
   ...current.assets,...profile.assets,
   signatures:mergeById(current.assets?.signatures,profile.assets?.signatures),
   initialsImages:mergeById(current.assets?.initialsImages,profile.assets?.initialsImages),
   stamps:mergeById(current.assets?.stamps,profile.assets?.stamps),
   defaultSignatureId:profile.assets?.defaultSignatureId||current.assets?.defaultSignatureId||null,
   defaultInitialsImageId:profile.assets?.defaultInitialsImageId||current.assets?.defaultInitialsImageId||null
  };
  profile=normalizeProfile({...current,...profile,identity:{...current.identity,...profile.identity},variables:{...current.variables,...profile.variables},preferences:{...current.preferences,...profile.preferences,studios:{...current.preferences?.studios,...profile.preferences?.studios}},assets:mergedAssets,templates:{naming:mergeById(current.templates?.naming,profile.templates?.naming),classification:mergeById(current.templates?.classification,profile.templates?.classification),stamps:mergeById(current.templates?.stamps,profile.templates?.stamps),output:mergeById(current.templates?.output,profile.templates?.output),workflows:mergeById(current.templates?.workflows,profile.templates?.workflows)}})
 }
 profile=savePersonalProfile(profile);
 applyPortableLocalSettings(profile.preferences?.portableLocalSettings||{});
 document.dispatchEvent(new CustomEvent('nlab:personal-profile-imported',{detail:{profile:clone(profile),mode,importedAssets:importedIds.size}}));
 return{profile,manifest,importedAssets:importedIds.size}
}
