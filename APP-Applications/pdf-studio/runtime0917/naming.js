(()=>{'use strict';
if(window.__NLAB_0917_NAMING__)return;
window.__NLAB_0917_NAMING__=true;
const $n=id=>document.getElementById(id);
const qan=(s,r=document)=>Array.from(r.querySelectorAll(s));
const escn=s=>String(s==null?'':s).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const SYSTEM_RULES0917=[
 {id:'sys-prefix-date',label:'Préfixe · date',position:'prefix',template:'{DATE:YYYYMMDD}_',system:true},
 {id:'sys-prefix-month',label:'Préfixe · année-mois',position:'prefix',template:'{YEAR}-{MONTH}_',system:true},
 {id:'sys-prefix-initials',label:'Préfixe · initiales',position:'prefix',template:'{INITIALS}_',system:true},
 {id:'sys-prefix-valid',label:'Préfixe · validé',position:'prefix',template:'VALIDE_{STAMP_DATE:YYYYMMDD}_',system:true},
 {id:'sys-suffix-date',label:'Suffixe · date',position:'suffix',template:'_{DATE:YYYYMMDD}',system:true},
 {id:'sys-suffix-month',label:'Suffixe · année-mois',position:'suffix',template:'_{YEAR}{MONTH}',system:true},
 {id:'sys-suffix-initials',label:'Suffixe · initiales',position:'suffix',template:'_{INITIALS}',system:true},
 {id:'sys-suffix-treated',label:'Suffixe · traité',position:'suffix',template:'_TRAITE',system:true},
 {id:'sys-suffix-review-d',label:'Suffixe · réévaluation D',position:'suffix',template:'_REV_{DATE_D:YYYYMMDD}',system:true}
];
function api0917(){return window.__NLAB_PROFILE_API_0917__}
function profile0917(){const a=api0917();return a?a.get():null}
function save0917(sync){
 const a=api0917();if(!a)return;
 a.saveLocal();a.render();
 if(sync&&S.driveConnected)a.saveDrive().catch(()=>{});
}
function allRules0917(){
 const p=profile0917(),u=p&&p.naming&&Array.isArray(p.naming.presets)?p.naming.presets:[];
 return SYSTEM_RULES0917.concat(u);
}
function ruleById0917(id){return allRules0917().find(x=>x.id===id)||null}
function activeRules0917(){
 const p=profile0917(),ids=p&&p.naming&&Array.isArray(p.naming.activeIds)?p.naming.activeIds:[];
 return ids.map(ruleById0917).filter(Boolean);
}
function resolveRule0917(tpl){
 let str=String(tpl||'');
 const processing=E.date&&E.date.value?E.date.value:today();
 str=str.replace(/\{DATE(?:\||:)([^}]+)\}/g,(_,pat)=>typeof fmtDate0912==='function'?fmtDate0912(processing,pat):processing);
 if(typeof resolveStampTemplate==='function')str=resolveStampTemplate(str,typeof stampDatesAll0914==='function'?stampDatesAll0914().stamp:processing);
 const base=typeof dateContext0914==='function'?dateContext0914(processing):dc(processing);
 const n=split(current()&&current().name?current().name:(S.workingName||'document.pdf'));
 const ctx=Object.assign({},base,{FILENAME:safe(n.stem),STEM:safe(n.stem),EXT:'pdf'},cf(),operationContext());
 return str.replace(/\{([A-Z0-9_]+)\}/g,(_,k)=>ctx[k]!==undefined?ctx[k]:'{'+k+'}');
}
const outNameBase0917=outName;
outName=function(name=S.workingName||((current()||{}).name)||'document.pdf'){
 let rendered=outNameBase0917(name);
 activeRules0917().forEach(rule=>{
  const aff=safe(resolveRule0917(rule.template));
  if(!aff)return;
  if(rule.position==='prefix'){
   if(!rendered.startsWith(aff))rendered=aff+rendered;
  }else if(!rendered.toUpperCase().includes(aff.toUpperCase())){
   rendered=rendered.replace(/\.pdf$/i,'')+aff+'.pdf';
  }
 });
 return rendered;
};
function setActive0917(id,on){
 const p=profile0917();if(!p)return;
 p.naming=p.naming||{presets:[],activeIds:[]};
 const s=new Set(p.naming.activeIds||[]);if(on)s.add(id);else s.delete(id);p.naming.activeIds=Array.from(s);
 save0917(true);render0917();try{updatePath()}catch(e){}
}
function addRule0917(){
 const p=profile0917();if(!p)return;
 const label=($n('customNameLabel0917').value||'Règle personnalisée').trim();
 const position=$n('customNamePosition0917').value||'suffix';
 const template=($n('customNameTemplate0917').value||'').trim();
 if(!template)return toast('Saisissez un modèle de préfixe ou suffixe.');
 p.naming=p.naming||{presets:[],activeIds:[]};
 const item={id:'user-name-'+Date.now(),label:label,position:position,template:template,system:false};
 p.naming.presets=(p.naming.presets||[]).concat([item]);
 p.naming.activeIds=(p.naming.activeIds||[]).concat([item.id]);
 save0917(true);render0917();window.dispatchEvent(new CustomEvent('nlab:naming-rules-changed'));try{updatePath()}catch(e){}
}
function deleteRule0917(id){
 const p=profile0917();if(!p)return;
 p.naming.presets=(p.naming.presets||[]).filter(x=>x.id!==id);
 p.naming.activeIds=(p.naming.activeIds||[]).filter(x=>x!==id);
 save0917(true);render0917();window.dispatchEvent(new CustomEvent('nlab:naming-rules-changed'));try{updatePath()}catch(e){}
}
function render0917(){
 const box=$n('namingRules0917');if(!box)return;
 const p=profile0917(),active=new Set(p&&p.naming?p.naming.activeIds||[]:[]);
 box.innerHTML=allRules0917().map(x=>{
  let h='<label class="namingRule0917"><input type="checkbox" data-rule0917="'+escn(x.id)+'" '+(active.has(x.id)?'checked':'')+'><span><b>'+escn(x.label)+'</b><code>'+escn(x.template)+'</code></span>';
  if(!x.system)h+='<button type="button" data-del-rule0917="'+escn(x.id)+'" title="Supprimer cette règle">×</button>';
  return h+'</label>';
 }).join('');
 qan('[data-rule0917]',box).forEach(x=>x.onchange=()=>setActive0917(x.dataset.rule0917,x.checked));
 qan('[data-del-rule0917]',box).forEach(x=>x.onclick=e=>{e.preventDefault();deleteRule0917(x.dataset.delRule0917)});
 const prev=$n('modularNamePreview0917');if(prev){try{prev.textContent=outName()}catch(e){prev.textContent='—'}}
}
function addVar0917(v){
 const i=$n('customNameTemplate0917');if(!i)return;
 const s=i.selectionStart==null?i.value.length:i.selectionStart,e=i.selectionEnd==null?i.value.length:i.selectionEnd;
 i.setRangeText(v,s,e,'end');i.focus();
}
function ensureUi0917(){
 if($n('modularNaming0917')){render0917();return}
 const tpl=$n('filenameTemplate');if(!tpl)return;
 const field=tpl.closest('.field')||tpl.parentElement,box=document.createElement('div');
 box.id='modularNaming0917';box.className='modularNaming0917';
 let h='<h4>Préfixes & suffixes modulaires</h4>';
 h+='<div class="hint">Cochez une ou plusieurs règles. Elles se combinent avec le nom calculé, les suffixes techniques et les règles portées par les tampons. Les règles personnelles sont synchronisées avec votre espace Google.</div>';
 h+='<div id="namingRules0917"></div>';
 h+='<div class="namingCreate0917"><input id="customNameLabel0917" placeholder="Nom de la règle"><select id="customNamePosition0917"><option value="prefix">Préfixe</option><option value="suffix" selected>Suffixe</option></select><input id="customNameTemplate0917" placeholder="_ARCHIVE_{YEAR}-{MONTH}"><button id="addNameRule0917" type="button">Ajouter</button></div>';
 h+='<div class="nameVars0917"></div><div class="richHint0914"><b>Nom prévu :</b> <code id="modularNamePreview0917">—</code></div>';
 box.innerHTML=h;field.after(box);
 const vars=['{DATE:YYYYMMDD}','{YEAR}','{MONTH}','{MONTH_NAME}','{INITIALS}','{STAMP_DATE_FMT}','{DATE_A_FMT}','{DATE_B_FMT}','{DATE_C_FMT}','{DATE_D:YYYYMMDD}','{FILENAME}'];
 const vb=box.querySelector('.nameVars0917');vars.forEach(v=>{const b=document.createElement('button');b.type='button';b.textContent=v;b.onclick=()=>addVar0917(v);vb.appendChild(b)});
 $n('addNameRule0917').onclick=addRule0917;
 ['input','change'].forEach(ev=>document.addEventListener(ev,e=>{if(e.target===E.tpl||e.target===E.date||e.target&&e.target.matches&&e.target.matches('[name=initials],[name=stampDate],[name=stampDateB],[name=stampDateC],#stampDateD0915'))render0917()}));
 render0917();
}
function style0917(){
 if($n('namingStyle0917'))return;
 const st=document.createElement('style');st.id='namingStyle0917';
 st.textContent='.modularNaming0917{border:1px solid #c7d9e5;background:#f7fbfe;border-radius:9px;padding:9px;margin:9px 0}.modularNaming0917 h4{margin:0 0 7px;color:#174f78;font-size:12px}.namingRule0917{display:grid;grid-template-columns:auto 1fr auto;gap:7px;align-items:center;border-bottom:1px solid #e4ebef;padding:6px 2px;font-size:10px}.namingRule0917 span{display:flex;flex-direction:column;gap:2px}.namingRule0917 code{font-size:9px;word-break:break-all}.namingCreate0917{display:grid;grid-template-columns:1fr 105px 1.5fr auto;gap:5px;margin-top:8px}.nameVars0917{display:flex;gap:4px;flex-wrap:wrap;margin-top:7px}.nameVars0917 button{font:9px ui-monospace,monospace;padding:4px 5px}@media(max-width:800px){.namingCreate0917{grid-template-columns:1fr}}';
 document.head.appendChild(st);
}
window.__NLAB_NAMING_API_0917__={all:allRules0917,byId:ruleById0917,resolve:resolveRule0917,render:render0917,active:activeRules0917};
window.__NLAB_RENDER_NAMING_0917__=render0917;
function install0917(){style0917();ensureUi0917()}
const mo=new MutationObserver(()=>setTimeout(install0917,0));if(document.body)mo.observe(document.body,{childList:true,subtree:true});
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(install0917,340),{once:true});else setTimeout(install0917,340);
})();