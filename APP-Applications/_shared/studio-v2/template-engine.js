const pad=n=>String(n).padStart(2,'0');
const stem=n=>String(n||'document').replace(/\.[^.]+$/,'');
const ext=n=>(String(n||'').match(/\.([^.]+)$/)?.[1]||'');
function isoWeek(d){const x=new Date(Date.UTC(d.getFullYear(),d.getMonth(),d.getDate()));x.setUTCDate(x.getUTCDate()+4-(x.getUTCDay()||7));const y=new Date(Date.UTC(x.getUTCFullYear(),0,1));return pad(Math.ceil((((x-y)/86400000)+1)/7))}
const today=()=>new Date().toISOString().slice(0,10);
export const TEMPLATE_VARIABLES=Object.freeze({
 FILENAME:'Nom sans extension',FULLNAME:'Nom complet',STEM:'Nom sans extension',EXT:'Extension',EXT_DOT:'Extension avec point',
 FOLDER:'Dossier parent',PATH:'Chemin logique',RELATIVE_PATH:'Chemin relatif',FILESIZE:'Taille en octets',INDEX:'Index du fichier',
 DATE:'Date courante',TIME:'Heure courante',DATETIME:'Date et heure',YEAR:'Année',MONTH:'Mois',DAY:'Jour',WEEK:'Semaine ISO',
 MONTH_NAME_FR:'Nom du mois FR',MONTH_NAME_EN:'Nom du mois EN',DAY_NAME_FR:'Jour FR',DAY_NAME_EN:'Jour EN',
 PAGE:'Page courante',PAGES:'Nombre de pages',SELECTED_COUNT:'Pages sélectionnées',INITIALS:'Initiales',CLIENT:'Client',PROJECT:'Projet',
 REFERENCE:'Référence',SITE:'Site',SERVICE:'Service',CATEGORY:'Catégorie',TAG:'Tag',TREATMENT:'Traitement',
 STAMP_DATE:'Date du tampon',DATE_A:'Date A',DATE_B:'Date B',DATE_C:'Date C',DATE_D:'Date D'
});
export class TemplateEngine{
 constructor(values={}){this.values={STAMP_DATE:today(),DATE_A:today(),DATE_B:today(),DATE_C:today(),DATE_D:today(),INITIALS:'',CLIENT:'',PROJECT:'',REFERENCE:'',SITE:'',SERVICE:'',CATEGORY:'',TAG:'',TREATMENT:'TRAITEMENT',...values}}
 dateParts(v){const d=new Date((v||today())+'T12:00:00');return{YYYY:d.getFullYear(),YY:String(d.getFullYear()).slice(-2),MM:pad(d.getMonth()+1),M:String(d.getMonth()+1),DD:pad(d.getDate()),D:String(d.getDate()),MONTH_NAME_FR:d.toLocaleDateString('fr-FR',{month:'long'}),MONTH_NAME_EN:d.toLocaleDateString('en-US',{month:'long'}),DAY_NAME_FR:d.toLocaleDateString('fr-FR',{weekday:'long'}),DAY_NAME_EN:d.toLocaleDateString('en-US',{weekday:'long'})}}
 formatDate(v,fmt='DD/MM/YYYY'){const p=this.dateParts(v);return String(fmt).replace(/MONTH_NAME_FR/g,p.MONTH_NAME_FR).replace(/MONTH_NAME_EN/g,p.MONTH_NAME_EN).replace(/DAY_NAME_FR/g,p.DAY_NAME_FR).replace(/DAY_NAME_EN/g,p.DAY_NAME_EN).replace(/YYYY/g,p.YYYY).replace(/YY/g,p.YY).replace(/MM/g,p.MM).replace(/DD/g,p.DD).replace(/\bM\b/g,p.M).replace(/\bD\b/g,p.D)}
 context(fileName='document.pdf',extra={}){const now=new Date(),e=ext(fileName);return{FILENAME:stem(fileName),FULLNAME:fileName,STEM:stem(fileName),EXT:e,EXT_DOT:e?'.'+e:'',FOLDER:'',PATH:fileName,RELATIVE_PATH:fileName,FILESIZE:'',INDEX:'',DATE:today(),TIME:pad(now.getHours())+':'+pad(now.getMinutes())+':'+pad(now.getSeconds()),DATETIME:today()+'_'+pad(now.getHours())+pad(now.getMinutes())+pad(now.getSeconds()),YEAR:String(now.getFullYear()),MONTH:pad(now.getMonth()+1),DAY:pad(now.getDate()),WEEK:isoWeek(now),MONTH_NAME_FR:now.toLocaleDateString('fr-FR',{month:'long'}),MONTH_NAME_EN:now.toLocaleDateString('en-US',{month:'long'}),DAY_NAME_FR:now.toLocaleDateString('fr-FR',{weekday:'long'}),DAY_NAME_EN:now.toLocaleDateString('en-US',{weekday:'long'}),PAGE:'1',PAGES:'1',SELECTED_COUNT:'0',...this.values,...extra}}
 resolve(tpl,fileName='document.pdf',extra={}){const c=this.context(fileName,extra);return String(tpl??'').replace(/\{([A-Z0-9_]+)(?::([^}]+))?\}/g,(m,k,fmt)=>{if(!(k in c))return m;const v=c[k];if(fmt&&(k==='DATE'||k==='STAMP_DATE'||/^DATE_[A-D]$/.test(k)))return this.formatDate(v,fmt);return String(v??'')})}
 buildName(fileName,{prefix='',template='{FILENAME}',suffix='',extension='.pdf',extra={}}={}){const safe=s=>String(s).replace(/[<>:"/\\|?*\x00-\x1F]/g,'_').trim();return safe(this.resolve(prefix,fileName,extra)+this.resolve(template,fileName,extra)+this.resolve(suffix,fileName,extra))+extension}
}
export const templateVariableHelp=()=>Object.entries(TEMPLATE_VARIABLES).map(([name,description])=>({name,description}));
