(()=>{'use strict';
if(window.__NLAB_0918_VARIABLES__)return;
window.__NLAB_0918_VARIABLES__=true;
const $v=id=>document.getElementById(id);
const MONTHS_FULL=['janvier','février','mars','avril','mai','juin','juillet','août','septembre','octobre','novembre','décembre'];
const MONTHS_SHORT=['janv','févr','mars','avr','mai','juin','juil','août','sept','oct','nov','déc'];
const DEFAULT_FORMATS={
  NOW:'YYYY-MM-DD HH:mm:ss',DATE:'YYYY-MM-DD',TIME:'HH:mm:ss',DATETIME:'YYYY-MM-DD HH:mm:ss',TIMESTAMP:'YYYYMMDD_HHmmss',
  STAMP_DATE:'DD/MM/YYYY',STAMP_DATETIME:'DD/MM/YYYY HH:mm:ss',DATE_A:'DD/MM/YYYY',DATE_B:'DD/MM/YYYY',DATE_C:'DD/MM/YYYY',DATE_D:'DD/MM/YYYY'
};
function pad(n,l=2){return String(n).padStart(l,'0')}
function tzParts(d){const off=-d.getTimezoneOffset(),sign=off>=0?'+':'-',a=Math.abs(off),hh=pad(Math.floor(a/60)),mm=pad(a%60);return{Z:sign+hh+':'+mm,ZZ:sign+hh+mm}}
function dateObj(v,fallbackNow=false){
 if(v instanceof Date)return new Date(v.getTime());
 if(typeof v==='number')return new Date(v);
 if(typeof v==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(v)){const [y,m,d]=v.split('-').map(Number);return new Date(y,m-1,d,0,0,0,0)}
 if(v){const d=new Date(v);if(!Number.isNaN(d.getTime()))return d}
 return fallbackNow?new Date():null;
}
function formatDate(v,pattern){
 const d=dateObj(v,true),tz=tzParts(d),map={
  YYYY:String(d.getFullYear()),YY:pad(d.getFullYear()%100),MMMM:MONTHS_FULL[d.getMonth()],MMM:MONTHS_SHORT[d.getMonth()],MM:pad(d.getMonth()+1),M:String(d.getMonth()+1),
  DD:pad(d.getDate()),D:String(d.getDate()),HH:pad(d.getHours()),H:String(d.getHours()),mm:pad(d.getMinutes()),m:String(d.getMinutes()),ss:pad(d.getSeconds()),s:String(d.getSeconds()),SSS:pad(d.getMilliseconds(),3),
  Z:tz.Z,ZZ:tz.ZZ,X:String(Math.floor(d.getTime()/1000)),x:String(d.getTime())
 };
 return String(pattern||'YYYY-MM-DD').replace(/YYYY|MMMM|MMM|SSS|ZZ|YY|MM|DD|HH|mm|ss|Z|M|D|H|m|s|X|x/g,t=>map[t]);
}
function selectedDate(name,id){return (E.form&&E.form.querySelector('[name="'+name+'"]')?.value)||($v(id)?.value)||''}
function allDates(){
 const proc=E.date?.value||today(),stamp=selectedDate('stampDate','stampHubDateSTAMP0916')||proc;
 return{
  NOW:new Date(),DATE:dateObj(proc)||new Date(),TIME:new Date(),DATETIME:new Date(),TIMESTAMP:new Date(),
  STAMP_DATE:dateObj(stamp)||new Date(),STAMP_DATETIME:new Date(),
  DATE_A:dateObj(selectedDate('stampDateAProxy','stampHubDateA0916')||stamp)||new Date(),
  DATE_B:dateObj(selectedDate('stampDateB','stampHubDateB0916')||stamp)||new Date(),
  DATE_C:dateObj(selectedDate('stampDateC','stampHubDateC0916')||stamp)||new Date(),
  DATE_D:dateObj($v('stampDateD0915')?.value||$v('stampHubDateD0916')?.value||stamp)||new Date()
 };
}
function fileContext(){
 const cur=current()||{},n=split(S.workingName||cur.name||'document.pdf'),rel=typeof relativeSourceDir==='function'?relativeSourceDir():'',parts=String(rel||'').split('/').filter(Boolean);
 return{FILENAME:safe(n.stem),STEM:safe(n.stem),EXT:'pdf',PARENT:safe(parts.at(-1)||''),SOURCE_DIR:safe(String(rel||'').replace(/\//g,'-'))};
}
function valueContext(extra={}){
 const dates=allDates(),now=new Date(),iso=typeof isoWeekInfo==='function'?isoWeekInfo(E.date?.value?dateObj(E.date.value):now):{weekYear:now.getFullYear(),week:1};
 const c={
  ...fileContext(),...cf(),...operationContext(),
  YEAR:String((E.date?.value?dateObj(E.date.value):now).getFullYear()),MONTH:pad((E.date?.value?dateObj(E.date.value):now).getMonth()+1),MONTH_NAME:MONTHS_FULL[(E.date?.value?dateObj(E.date.value):now).getMonth()],
  DAY:pad((E.date?.value?dateObj(E.date.value):now).getDate()),HOUR:pad(now.getHours()),MINUTE:pad(now.getMinutes()),SECOND:pad(now.getSeconds()),
  WEEK_YEAR:String(iso.weekYear),WEEK:String(iso.week),WEEK_PAD:pad(iso.week),WEEK_LABEL:'S'+iso.week,
  UNIX:String(Math.floor(now.getTime()/1000)),UNIX_MS:String(now.getTime())
 };
 Object.assign(c,dates,extra||{});return c;
}
function defaultFormat(name){
 const ws=window.__NLAB_WORKSPACE_0918__?.get?.();return ws?.variables?.formats?.[name]||DEFAULT_FORMATS[name]||'';
}
function render(template,extra={}){
 const ctx=valueContext(extra);
 return String(template||'').replace(/\{([A-Z0-9_]+)(?::([^}]+))?\}/g,(m,key,fmt)=>{
  if(!(key in ctx))return m;
  const v=ctx[key];
  if(v instanceof Date)return formatDate(v,fmt||defaultFormat(key)||'YYYY-MM-DD');
  if(fmt&&/^(UNIX|UNIX_MS)$/.test(key))return String(v);
  return String(v??'');
 });
}
window.NLAB_VARIABLES_0918={render,formatDate,context:valueContext,defaults:DEFAULT_FORMATS,registry:[
 {group:'Date & heure',vars:['{NOW}','{NOW:YYYY-MM-DD HH:mm:ss}','{DATE}','{DATE:YYYYMMDD}','{TIME}','{DATETIME}','{TIMESTAMP}','{UNIX}','{UNIX_MS}']},
 {group:'Tampon',vars:['{STAMP_DATE}','{STAMP_DATE:DD/MM/YYYY}','{STAMP_DATETIME:YYYYMMDD_HHmmss}','{DATE_A}','{DATE_B}','{DATE_C}','{DATE_D}','{DATE_D:YYYYMMDD}']},
 {group:'Fichier',vars:['{FILENAME}','{STEM}','{EXT}','{PARENT}','{SOURCE_DIR}']},
 {group:'Utilisateur / métier',vars:['{INITIALS}','{CLIENT}','{SITE}','{SERVICE}','{REFERENCE}','{PRODUCT}','{STATUS}']},
 {group:'Traitement',vars:['{OP}','{DPI}','{JPEG}','{GRAYSCALE}','{YEAR}','{MONTH}','{MONTH_NAME}','{DAY}','{HOUR}','{MINUTE}','{SECOND}','{WEEK_YEAR}','{WEEK}','{WEEK_PAD}','{WEEK_LABEL}']}
 ]};

// Canonicalise stamp variables on the same engine.
resolveStampTemplate=function(tpl,stampDate){return render(tpl,stampDate?{STAMP_DATE:dateObj(stampDate)||new Date()}:{});};
if(typeof templateQuickText==='function')templateQuickText=function(tpl){return render(tpl);};

// Canonicalise the final filename: base template, technical suffixes, stamp rules, personal naming rules.
outName=function(name=S.workingName||current()?.name||'document.pdf'){
 const n=split(name),raw=(E.tpl?.value||'{FILENAME}.pdf'),ctx={FILENAME:safe(n.stem),STEM:safe(n.stem),EXT:'pdf'};
 let rendered=safe(render(raw,ctx));
 if(!/\.pdf$/i.test(rendered))rendered+='.pdf';
 const tech=typeof operationSuffix==='function'?operationSuffix():'';
 if(tech&&!rendered.toUpperCase().includes(tech.toUpperCase()))rendered=rendered.replace(/\.pdf$/i,'')+safe(tech)+'.pdf';
 const stamps=(S.annotations||[]).filter(a=>a.type==='stamp'&&(a.filePrefix||a.fileSuffix));
 const prefixes=[...new Set(stamps.map(a=>a.filePrefix).filter(Boolean))],suffixes=[...new Set(stamps.map(a=>a.fileSuffix).filter(Boolean))];
 for(const p0 of prefixes){const p=safe(render(p0));if(p&&!rendered.startsWith(p))rendered=p+rendered;}
 for(const s0 of suffixes){const sx=safe(render(s0));if(sx&&!rendered.toUpperCase().includes(sx.toUpperCase()))rendered=rendered.replace(/\.pdf$/i,'')+sx+'.pdf';}
 const rules=window.__NLAB_NAMING_API_0917__?.active?.()||[];
 for(const rule of rules){const a=safe(render(rule.template));if(!a)continue;if(rule.position==='prefix'){if(!rendered.startsWith(a))rendered=a+rendered;}else if(!rendered.toUpperCase().includes(a.toUpperCase()))rendered=rendered.replace(/\.pdf$/i,'')+a+'.pdf';}
 return rendered;
};

function helpHtml(){
 const reg=window.NLAB_VARIABLES_0918.registry;
 let h='<details id="unifiedVariables0918" class="variableHelp unifiedVariables0918"><summary>Variables communes nLab — formats date/heure</summary><div class="unifiedVariablesBody0918">';
 h+='<p><b>Une seule syntaxe partout :</b> <code>{VARIABLE}</code> ou <code>{VARIABLE:FORMAT}</code>. Elle fonctionne dans les tampons, préfixes, suffixes, noms de fichiers, en-têtes/pieds et textes rapides.</p>';
 h+='<p><b>Tokens date/heure :</b> <code>YYYY</code> année · <code>YY</code> année courte · <code>MMMM</code>/<code>MMM</code> mois texte · <code>MM</code>/<code>M</code> mois · <code>DD</code>/<code>D</code> jour · <code>HH</code>/<code>H</code> heure · <code>mm</code>/<code>m</code> minute · <code>ss</code>/<code>s</code> seconde · <code>SSS</code> millisecondes · <code>Z</code>/<code>ZZ</code> fuseau · <code>X</code> Unix secondes · <code>x</code> Unix millisecondes.</p>';
 h+='<p><b>Exemples :</b> <code>{NOW:YYYYMMDD_HHmmss}</code> · <code>{STAMP_DATE:DD/MM/YYYY}</code> · <code>{DATE_D:YYYY-MM-DD}</code> · <code>{NOW:YYYY-MM-DDTHH:mm:ssZ}</code>.</p>';
 for(const g of reg){h+='<h5>'+g.group+'</h5><div class="varChips0918">'+g.vars.map(v=>'<code>'+v+'</code>').join(' ')+'</div>';}
 h+='</div></details>';return h;
}
function installHelp(){
 const targets=[$v('modularNaming0917'),$v('stampHub0916')].filter(Boolean);
 for(const t of targets){if(!t.querySelector(':scope > .unifiedVariables0918')){const d=document.createElement('div');d.innerHTML=helpHtml();t.appendChild(d.firstElementChild);}}
 if(!$v('variablesStyle0918')){const st=document.createElement('style');st.id='variablesStyle0918';st.textContent='.unifiedVariablesBody0918{padding:8px;font-size:10px;line-height:1.55}.varChips0918{display:flex;gap:4px;flex-wrap:wrap;margin:4px 0 8px}.varChips0918 code{background:#fff;border:1px solid #d6e0e7;border-radius:5px;padding:3px 5px}';document.head.appendChild(st);}
}
const mo=new MutationObserver(()=>setTimeout(installHelp,0));if(document.body)mo.observe(document.body,{childList:true,subtree:true});
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(installHelp,450),{once:true});else setTimeout(installHelp,450);
})();