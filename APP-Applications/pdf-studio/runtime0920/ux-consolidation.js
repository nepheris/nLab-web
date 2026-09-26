(()=>{'use strict';
if(window.__NLAB_0920_UX__)return;
window.__NLAB_0920_UX__=true;
const VERSION0920='Alpha 0.9.20 TEST';
const $20=id=>document.getElementById(id);
const esc20=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const localTime20=v=>{try{return new Date(v).toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit',second:'2-digit'})}catch{return'--:--:--'}};
const type20=a=>({text:'TXT',stamp:'TMP',highlight:a?.redaction?'RED':'HIL',ink:'INK',image:'IMG',qr:'QR',signature:'SIG',form:'FORM'}[a?.type]||'ANN');
function resetSeq20(){S.annotationSeq0920=0}
function ensureAnnotationMeta20(){
 S.annotationSeq0920=S.annotationSeq0920||0;
 for(const a of S.annotations||[]){
  if(!a._nlabMeta0920){
   S.annotationSeq0920++;
   a._nlabMeta0920={id:type20(a)+'-'+String(S.annotationSeq0920).padStart(3,'0'),type:type20(a),createdAt:new Date().toISOString()};
  }else{
   a._nlabMeta0920.type=type20(a);
   if(!a._nlabMeta0920.id)a._nlabMeta0920.id=type20(a)+'-'+String(++S.annotationSeq0920).padStart(3,'0');
   if(!a._nlabMeta0920.createdAt)a._nlabMeta0920.createdAt=new Date().toISOString();
  }
 }
}
function annotationObjectGroup20(){
 ensureAnnotationMeta20();
 const items=(S.annotations||[]).map((a,i)=>({a,i,m:a._nlabMeta0920||{}}));
 let h='<details class="historyGroup0914" open data-objects0920><summary>Objets / annotations présents <small style="float:right">'+items.length+'</small></summary>';
 if(!items.length)h+='<div class="historyRow0914"><span class="historyCode0914">ANN-000</span><span>Aucune annotation présente.</span><span></span></div>';
 for(const {a,m} of items){
  const label=a.stampLabel||a.label||a.text||a.type||'Annotation';
  h+='<div class="historyRow0914"><span><span class="historyCode0914">'+esc20(m.id||'ANN-???')+'</span> <span class="historyType0914">'+esc20(m.type||type20(a))+'</span></span><button type="button" data-ann0920="'+esc20(a.id)+'"><b>'+esc20(String(label).slice(0,70))+'</b><br><small>Page '+esc20(a.page||'?')+'</small></button><small title="'+esc20(m.createdAt||'')+'">'+esc20(localTime20(m.createdAt))+'</small></div>';
 }
 return h+'</details>';
}
function bindObjects20(box){
 box?.querySelectorAll('[data-ann0920]').forEach(b=>b.onclick=()=>{
  const a=(S.annotations||[]).find(x=>String(x.id)===String(b.dataset.ann0920));
  if(!a)return;
  if(a.page&&a.page!==S.page){S.page=a.page;render().then?.(()=>selectAnn(a));}else selectAnn(a);
 });
}
function augmentHistory20(){
 const html=annotationObjectGroup20();
 for(const box of [$20('historyList'),$20('sidebarHistoryList')]){
  if(!box)continue;
  box.querySelector('[data-objects0920]')?.remove();
  box.insertAdjacentHTML('beforeend',html);
  bindObjects20(box);
 }
}
function identity20(){
 ensureAnnotationMeta20();
 const bar=$20('editorContextBar'),a=S.selectedAnn;
 if(!bar)return;
 let chip=$20('annotationIdentity0920');
 if(!chip){chip=document.createElement('span');chip.id='annotationIdentity0920';chip.style.cssText='margin-left:auto;font:10px ui-monospace,monospace;background:#edf3f8;border:1px solid #ccd8e1;border-radius:5px;padding:3px 6px;color:#34506a';bar.appendChild(chip)}
 if(!a){chip.hidden=true;return}
 const m=a._nlabMeta0920||{};chip.hidden=false;chip.textContent=(m.id||type20(a))+' · '+(m.type||type20(a))+' · '+localTime20(m.createdAt);chip.title='Identifiant stable de cette annotation dans le document · créée '+(m.createdAt||'');
}
function installPenDelete20(){
 const p=$20('penWidth0914');if(!p||$20('penDelete0920'))return;
 const b=document.createElement('button');b.id='penDelete0920';b.type='button';b.textContent='🗑 Effacer le tracé';b.title='Supprimer le tracé libre actuellement sélectionné';b.onclick=()=>{if(S.selectedAnn?.type!=='ink')return toast('Sélectionnez d’abord un tracé libre.');deleteAnnotation(S.selectedAnn)};
 p.appendChild(b);
}
function installRichHint20(){
 const r=$20('richText0914');if(!r||$20('richHint0920'))return;
 const n=document.createElement('span');n.id='richHint0920';n.style.cssText='font-size:10px;color:#60717e';n.textContent='Sélectionnez un passage puis changez police, taille, gras, italique ou soulignement.';r.appendChild(n);
}
function installOauthHelp20(){
 const p=$20('workspacePanel0918');if(!p||$20('oauthHelp0920'))return;
 const body=p.querySelector('.userConfigBody');if(!body)return;
 const configured=!!googleDriveClientId(),origin=location.origin;
 const d=document.createElement('details');d.id='oauthHelp0920';d.open=!configured;d.style.cssText='margin:8px 0;border:1px solid '+(configured?'#9bc7a6':'#dfbd55')+';border-radius:8px;padding:8px;background:'+(configured?'#f3fbf5':'#fff9e8');
 d.innerHTML='<summary style="cursor:pointer;font-weight:800">🔐 Activation Google OAuth · '+(configured?'Client ID configuré':'configuration requise')+'</summary><div style="font-size:10px;line-height:1.5;margin-top:7px">Le moteur de connexion est installé, mais le site public doit utiliser un <b>Client ID OAuth Web réel</b>. Le Client ID est public ; aucun client secret ne doit être ajouté à cette application.<br><b>Origine JavaScript autorisée :</b> <code id="oauthOrigin0920">'+esc20(origin)+'</code>.<br><b>Scope actif :</b> <code>openid email profile drive.file</code>. Les P12/PFX et mots de passe restent hors Drive.</div><div style="display:flex;gap:5px;flex-wrap:wrap;margin-top:7px"><button id="copyOauthOrigin0920" type="button">Copier l’origine</button><button id="focusOauthClient0920" type="button">Renseigner le Client ID</button><a href="https://console.cloud.google.com/apis/credentials" target="_blank" rel="noopener" style="display:inline-flex;align-items:center;padding:6px 9px;border:1px solid #b9c4cc;border-radius:6px;text-decoration:none;background:#fff">Google Cloud · Identifiants ↗</a></div>';
 body.prepend(d);
 $20('copyOauthOrigin0920').onclick=async()=>{try{await navigator.clipboard.writeText(origin);toast('Origine OAuth copiée')}catch{prompt('Copiez cette origine OAuth :',origin)}};
 $20('focusOauthClient0920').onclick=()=>{const x=$20('workspaceGoogleClient0918')||$20('sigGoogleClientRC2');if(x){x.scrollIntoView({behavior:'smooth',block:'center'});x.focus()}else toast('Champ Client ID disponible après ouverture de l’espace personnel.')};
}
function version20(){
 document.title='nLab PDF Studio — '+VERSION0920;
 document.querySelectorAll('.buildBadge strong').forEach(x=>x.textContent=VERSION0920);
 document.querySelectorAll('.demoChip').forEach(x=>x.textContent=(x.textContent||'').replace(/Alpha 0\.9\.(?:1[2-9])(?: TEST| RC2)?/g,VERSION0920));
 const foot=document.querySelector('footer .footerInfo span');if(foot)foot.textContent=(foot.textContent||'').replace(/Alpha 0\.9\.(?:1[2-9])(?: TEST| RC2)?/g,VERSION0920);
}
function install20(){
 if(typeof S==='undefined'||typeof renderEditorOptions!=='function'||typeof renderHistoryMenu!=='function'){setTimeout(install20,160);return}
 version20();ensureAnnotationMeta20();augmentHistory20();identity20();installPenDelete20();installRichHint20();installOauthHelp20();
}
function wrap20(){
 if(window.__NLAB_0920_WRAPPED__)return;window.__NLAB_0920_WRAPPED__=true;
 const ch=commitAnnotationHistory;commitAnnotationHistory=function(label='Modification'){ensureAnnotationMeta20();const r=ch(label);augmentHistory20();identity20();return r};
 const rh=renderHistoryMenu;renderHistoryMenu=function(){const r=rh();augmentHistory20();return r};
 const ro=renderEditorOptions;renderEditorOptions=function(){const r=ro();setTimeout(()=>{identity20();installPenDelete20();installRichHint20();installOauthHelp20()},0);return r};
 const sa=selectAnn;selectAnn=function(a){ensureAnnotationMeta20();const r=sa(a);identity20();return r};
 const ra=resetAnnotationHistory;resetAnnotationHistory=function(){resetSeq20();const r=ra();ensureAnnotationMeta20();augmentHistory20();return r};
}
function boot20(){if(typeof S==='undefined'||typeof commitAnnotationHistory!=='function'){setTimeout(boot20,160);return}wrap20();install20();const mo=new MutationObserver(()=>setTimeout(install20,20));mo.observe(document.body,{childList:true,subtree:true});window.__NLAB_DEBUG_LOG__?.push({t:new Date().toISOString(),type:'feature',msg:'0.9.20 UX consolidation installed'})}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(boot20,850),{once:true});else setTimeout(boot20,850);
})();