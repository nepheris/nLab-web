import{today,fileStem,safeName}from'./core.js';
function pad(n){return String(n).padStart(2,'0')}
function isoWeek(d){const x=new Date(Date.UTC(d.getFullYear(),d.getMonth(),d.getDate()));x.setUTCDate(x.getUTCDate()+4-(x.getUTCDay()||7));const y=new Date(Date.UTC(x.getUTCFullYear(),0,1));return pad(Math.ceil((((x-y)/86400000)+1)/7))}
function extension(name=''){const m=String(name).match(/\.([^.]+)$/);return m?m[1].toLowerCase():''}
export class VariableEngine{
 constructor(){
  this.values={STAMP_DATE:today(),DATE_A:today(),DATE_B:today(),DATE_C:today(),DATE_D:today(),INITIALS:'',CLIENT:'',SITE:'',SERVICE:'',REFERENCE:'',PROJECT:'',CATEGORY:'',TAG:'',TREATMENT:'TRAITEMENT'};
  this.runtime={FOLDER:'',PATH:'',RELATIVE_PATH:'',SOURCE:'LOCAL',OUTPUT:'LOCAL',PAGE:'',PAGES:'',SELECTED_COUNT:'',FILESIZE:'',INDEX:'',OCR_LANG:'',GRAY:'',OUTPUT_FORMAT:'PDF',STAMP_ID:'',STAMP_LABEL:'',STAMP_PREFIX:'',STAMP_SUFFIX:''};
  this.operation={ocr:false,dpi:null,jpeg:null,gray:false,annot:false,fusion:false,stamp:false}
 }
 set(k,v){this.values[k]=v??'';return this}
 setMany(v={}){Object.assign(this.values,v);return this}
 setRuntime(v={}){Object.assign(this.runtime,v);return this}
 setOperation(p={}){Object.assign(this.operation,p);return this}
 dateParts(v){const d=new Date((v||today())+'T12:00:00');const frMonth=d.toLocaleDateString('fr-FR',{month:'long'}),enMonth=d.toLocaleDateString('en-US',{month:'long'}),frDay=d.toLocaleDateString('fr-FR',{weekday:'long'}),enDay=d.toLocaleDateString('en-US',{weekday:'long'});return{YYYY:d.getFullYear(),YY:String(d.getFullYear()).slice(-2),MM:pad(d.getMonth()+1),M:String(d.getMonth()+1),DD:pad(d.getDate()),D:String(d.getDate()),MONTH_NAME_FR:frMonth,MONTH_NAME_EN:enMonth,DAY_NAME_FR:frDay,DAY_NAME_EN:enDay}}
 formatDate(v,fmt='DD/MM/YYYY'){const p=this.dateParts(v);return String(fmt).replace(/MONTH_NAME_FR/g,p.MONTH_NAME_FR).replace(/MONTH_NAME_EN/g,p.MONTH_NAME_EN).replace(/DAY_NAME_FR/g,p.DAY_NAME_FR).replace(/DAY_NAME_EN/g,p.DAY_NAME_EN).replace(/YYYY/g,p.YYYY).replace(/YY/g,p.YY).replace(/MM/g,p.MM).replace(/DD/g,p.DD).replace(/\bM\b/g,p.M).replace(/\bD\b/g,p.D)}
 context(fileName='document.pdf',extra={}){
  const now=new Date(),stem=fileStem(fileName),ext=extension(fileName);
  const c={...this.values,...this.runtime,...extra,
   FILENAME:stem,FULLNAME:fileName,STEM:stem,EXT:ext,EXT_DOT:ext?'.'+ext:'',
   DATE:today(),TIME:pad(now.getHours())+':'+pad(now.getMinutes())+':'+pad(now.getSeconds()),
   DATETIME:today()+'_'+pad(now.getHours())+pad(now.getMinutes())+pad(now.getSeconds()),
   YEAR:String(now.getFullYear()),MONTH:pad(now.getMonth()+1),MONTH_NUM:String(now.getMonth()+1),MONTH_NAME_FR:now.toLocaleDateString('fr-FR',{month:'long'}),MONTH_NAME_EN:now.toLocaleDateString('en-US',{month:'long'}),DAY:pad(now.getDate()),DAY_NUM:String(now.getDate()),DAY_NAME_FR:now.toLocaleDateString('fr-FR',{weekday:'long'}),DAY_NAME_EN:now.toLocaleDateString('en-US',{weekday:'long'}),WEEK:isoWeek(now),
   OP:this.operationLabel(),DPI:this.operation.dpi??'',JPEG:this.operation.jpeg??''
  };
  return c
 }
 operationLabel(){const a=[];if(this.operation.ocr)a.push('OCR');if(this.operation.dpi)a.push('DPI'+this.operation.dpi);if(this.operation.jpeg)a.push('JPEG'+this.operation.jpeg);if(this.operation.gray)a.push('GRIS');if(this.operation.annot)a.push('ANNOT');if(this.operation.fusion)a.push('FUSION');if(this.operation.stamp)a.push('STAMP');return a.join('_')}
 resolve(tpl,fileName='document.pdf',extra={}){const c=this.context(fileName,extra);return String(tpl??'').replace(/\{([A-Z0-9_]+)(?::([^}]+))?\}/g,(m,k,fmt)=>{if(!(k in c))return m;const v=c[k];if(fmt&&(k==='DATE'||k==='STAMP_DATE'||/^DATE_[A-D]$/.test(k)))return this.formatDate(v,fmt);return String(v??'')})}
 buildName(fileName,{prefix='',template='{FILENAME}',suffix='',extension='.pdf',operationSuffix=true,extra={}}={}){const stem=this.resolve(template,fileName,extra),op=operationSuffix&&this.operationLabel()?'_'+this.operationLabel():'';return safeName(this.resolve(prefix,fileName,extra)+stem+this.resolve(suffix,fileName,extra)+op)+extension}
 export(){return{schema:'nlab-studio-config/v1',dates:Object.fromEntries(Object.entries(this.values).filter(([k])=>k==='STAMP_DATE'||/^DATE_[A-D]$/.test(k))),values:{...this.values},runtime:{...this.runtime},operation:{...this.operation}}}
 import(data){if(data?.values)Object.assign(this.values,data.values);if(data?.dates)Object.assign(this.values,data.dates);if(data?.runtime)Object.assign(this.runtime,data.runtime);if(data?.operation)Object.assign(this.operation,data.operation);return this}
}
