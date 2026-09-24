(()=>{'use strict';
if(window.__NLAB_0917_STAMP_HELP__)return;
window.__NLAB_0917_STAMP_HELP__=true;
const $s=id=>document.getElementById(id);
const escs=s=>String(s==null?'':s).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
function namingApi0917(){return window.__NLAB_NAMING_API_0917__}
function rules0917(){const a=namingApi0917();return a?a.all():[]}
function selectedDef0917(){
 try{return typeof selectedStampDef0916==='function'?selectedStampDef0916():(typeof stampDefinition==='function'?stampDefinition():null)}catch(e){return null}
}
function fillSelectors0917(){
 const pre=$s('stampNamingPrefix0917'),suf=$s('stampNamingSuffix0917');if(!pre||!suf)return;
 const all=rules0917(),pref=all.filter(x=>x.position==='prefix'),suffs=all.filter(x=>x.position==='suffix');
 function opts(a){return '<option value="">— aucun —</option>'+a.map(x=>'<option value="'+escs(x.id)+'">'+escs(x.label)+' · '+escs(x.template)+'</option>').join('')}
 const pv=pre.value,sv=suf.value;pre.innerHTML=opts(pref);suf.innerHTML=opts(suffs);
 const d=selectedDef0917();
 const findByTpl=(a,t)=>a.find(x=>x.template===(t||''))?.id||'';
 const pWant=d&&d.prefixPresetId?d.prefixPresetId:(d?findByTpl(pref,d.prefix):'');
 const sWant=d&&d.suffixPresetId?d.suffixPresetId:(d?findByTpl(suffs,d.suffix):'');
 pre.value=Array.from(pre.options).some(o=>o.value===pv)?pv:(Array.from(pre.options).some(o=>o.value===pWant)?pWant:'');
 suf.value=Array.from(suf.options).some(o=>o.value===sv)?sv:(Array.from(suf.options).some(o=>o.value===sWant)?sWant:'');
}
function attachRulesToSelected0917(){
 const id=E.form&&E.form.querySelector('[name=preset]')?E.form.querySelector('[name=preset]').value:'';
 const d=(S.stampLibrary||[]).find(x=>x.id===id);if(!d)return;
 const a=namingApi0917(),pid=$s('stampNamingPrefix0917')?$s('stampNamingPrefix0917').value:'',sid=$s('stampNamingSuffix0917')?$s('stampNamingSuffix0917').value:'';
 const p=a&&pid?a.byId(pid):null,s=a&&sid?a.byId(sid):null;
 if(p){d.prefix=p.template;d.prefixEnabled=true;d.prefixPresetId=p.id}else{d.prefixPresetId=''}
 if(s){d.suffix=s.template;d.suffixEnabled=true;d.suffixPresetId=s.id}else{d.suffixPresetId=''}
 try{persistCustomStamps()}catch(e){}
 try{refreshJsonEditor0916()}catch(e){}
 if(S.driveConnected&&typeof saveStampLibraryDrive0916==='function')saveStampLibraryDrive0916().catch(()=>{});
}
function advancedHelp0917(){
 const hub=$s('stampHub0916');if(!hub||$s('advancedStampHelp0917'))return;
 const d=document.createElement('details');d.id='advancedStampHelp0917';d.className='variableHelp advancedStampHelp0917';
 let h='<summary>Aide avancée Tampons — variables, cinq dates et exemples</summary><div class="advancedHelpBody0917">';
 h+='<p><b>Les cinq dates sont indépendantes :</b> Date du tampon + Date A + Date B + Date C + Date D. Vous pouvez décider de leur sens métier : validation, début de validité, fin de validité, retrait, réévaluation, etc.</p>';
 h+='<div class="variableGrid">';
 [
  ['{STAMP_DATE_FMT}','Date principale du tampon avec son format configuré.'],
  ['{DATE_A_FMT}','Date A personnalisable.'],
  ['{DATE_B_FMT}','Date B, par exemple début de validité.'],
  ['{DATE_C_FMT}','Date C, par exemple fin de validité.'],
  ['{DATE_D_FMT}','Date D, par exemple retrait ou réévaluation.'],
  ['{DATE_D:YYYYMMDD}','Date D formatée pour un nom de fichier.'],
  ['{INITIALS}','Initiales préchargées depuis votre profil personnel.'],
  ['{FILENAME}','Nom du fichier source sans extension.']
 ].forEach(x=>{h+='<div class="variableRow"><code>'+escs(x[0])+'</code><span>'+escs(x[1])+'</span></div>'});
 h+='</div><p><b>Exemples prêts à adapter :</b></p>';
 h+='<pre>VALIDÉ - {INITIALS}\nLe {STAMP_DATE_FMT}\n\nVALABLE DU {DATE_B_FMT} AU {DATE_C_FMT}\n\nÀ RETIRER / RÉÉVALUER LE {DATE_D_FMT}</pre>';
 h+='<p>Le texte du tampon et son préfixe/suffixe de fichier utilisent la même logique de variables. Un préfixe/suffixe lié au tampon est appliqué uniquement si ce tampon est placé dans le PDF.</p>';
 h+='</div>';d.innerHTML=h;hub.appendChild(d);
}
function namingLink0917(){
 const hub=$s('stampHub0916');if(!hub||$s('stampNamingLink0917'))return;
 const box=document.createElement('div');box.id='stampNamingLink0917';box.className='stampNamingLink0917';
 box.innerHTML='<b>Associer le nom du fichier à ce tampon</b><div class="row"><label>Préfixe prédéfini / personnel<select id="stampNamingPrefix0917"></select></label><label>Suffixe prédéfini / personnel<select id="stampNamingSuffix0917"></select></label></div><div class="hint">Les règles sont enregistrées avec le modèle du tampon. Quand ce tampon est placé, elles sont reprises par Enregistrer, Enregistrer sous… et Enregistrer + classer.</div>';
 const grid=$s('stampBuilderTemplate0916')&&$s('stampBuilderTemplate0916').closest('.stampBuilderGrid0916');
 if(grid)grid.after(box);else hub.appendChild(box);
 fillSelectors0917();
 const save=$s('stampBuilderSave0916');
 if(save&&!save.dataset.naming0917){save.dataset.naming0917='1';save.addEventListener('click',()=>setTimeout(attachRulesToSelected0917,0))}
 const load=$s('stampBuilderLoad0916');
 if(load&&!load.dataset.naming0917){load.dataset.naming0917='1';load.addEventListener('click',()=>setTimeout(fillSelectors0917,0))}
 const preset=E.form&&E.form.querySelector('[name=preset]');
 if(preset&&!preset.dataset.naming0917){preset.dataset.naming0917='1';preset.addEventListener('change',()=>setTimeout(fillSelectors0917,0))}
 window.addEventListener('nlab:naming-rules-changed',fillSelectors0917);
}
function strengthenDates0917(){
 const hub=$s('stampHub0916');if(!hub||$s('fiveDatesBanner0917'))return;
 const d=document.createElement('div');d.id='fiveDatesBanner0917';d.className='fiveDatesBanner0917';
 d.innerHTML='<b>5 dates disponibles :</b> Date du tampon · A · B · C · D. Les cinq champs ci-dessous sont indépendants et modifiables avant de créer ou régénérer le tampon.';
 const dates=hub.querySelector('.stampDates0916');if(dates)dates.before(d);else hub.prepend(d);
}
function style0917(){
 if($s('stampHelpStyle0917'))return;
 const st=document.createElement('style');st.id='stampHelpStyle0917';
 st.textContent='.stampNamingLink0917{border:1px solid #b9d8c3;background:#f3fbf5;border-radius:8px;padding:8px;margin:8px 0}.stampNamingLink0917>b{color:#23633b}.advancedStampHelp0917{margin-top:9px}.advancedHelpBody0917{padding:8px;font-size:10px;line-height:1.5}.advancedHelpBody0917 pre{white-space:pre-wrap;background:#fff;border:1px solid #dce5eb;border-radius:6px;padding:7px}.fiveDatesBanner0917{background:#eef8f1;border:1px solid #b9d8c3;color:#315b3f;border-radius:7px;padding:7px;margin:7px 0;font-size:10px}';
 document.head.appendChild(st);
}
function install0917(){style0917();strengthenDates0917();namingLink0917();advancedHelp0917();fillSelectors0917()}
const mo=new MutationObserver(()=>setTimeout(install0917,0));if(E.form)mo.observe(E.form,{childList:true,subtree:true});
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(install0917,380),{once:true});else setTimeout(install0917,380);
})();