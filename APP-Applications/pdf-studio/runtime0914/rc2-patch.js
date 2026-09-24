(()=>{'use strict';
if(window.__NLAB_0914_RC2__)return;window.__NLAB_0914_RC2__=true;
const RC2='Alpha 0.9.14 RC2';
const $r=id=>document.getElementById(id);
const qa=(s,r=document)=>[...r.querySelectorAll(s)];
const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':'&quot;',"'":'&#39;'}[m]));

// --- Tampons : appliquer réellement préfixe/suffixe au nom de fichier ---
const outNameRC1=outName;
function stampAffixRC2(){
  const stamps=(S.annotations||[]).filter(a=>a.type==='stamp'&&(a.filePrefix||a.fileSuffix));
  const p=[...new Set(stamps.map(a=>String(a.filePrefix||'')).filter(Boolean))].join('');
  const s=[...new Set(stamps.map(a=>String(a.fileSuffix||'')).filter(Boolean))].join('');
  return{prefix:safe(p),suffix:safe(s)};
}
outName=function(name=S.workingName||current()?.name||'document.pdf'){
  let rendered=outNameRC1(name);
  const a=stampAffixRC2();
  if(a.prefix&&!rendered.startsWith(a.prefix))rendered=a.prefix+rendered;
  if(a.suffix&&!rendered.toUpperCase().includes(a.suffix.toUpperCase()))rendered=rendered.replace(/\.pdf$/i,'')+a.suffix+'.pdf';
  return rendered;
};

// --- Texte riche : polices supplémentaires + "Normal" sur la sélection seulement ---
function selectedTextDomRC2(){
  const a=S.selectedAnn;
  if(!a||a.type!=='text')return null;
  return E.layer?.querySelector('[data-id="'+CSS.escape(String(a.id))+'"] .annTextContent')||null;
}
function installRichRC2(){
  const font=$r('richFont0914');
  if(font&&!font.dataset.rc2){
    font.dataset.rc2='1';
    for(const [v,t] of [['Georgia','Georgia'],['Verdana','Verdana'],['Trebuchet MS','Trebuchet MS']]){
      if(![...font.options].some(o=>o.value===v)){const o=document.createElement('option');o.value=v;o.textContent=t;font.appendChild(o)}
    }
  }
  const clear=$r('richClear0914');
  if(clear&&!clear.dataset.rc2){
    clear.dataset.rc2='1';
    clear.title='Retirer les styles de la sélection ; sinon de tout le bloc';
    clear.addEventListener('click',e=>{
      e.preventDefault();e.stopImmediatePropagation();
      const a=S.selectedAnn,el=selectedTextDomRC2();if(!a||!el)return;
      const scope=$r('richScope0914')?.value||'selection';
      const sel=window.getSelection();
      if(scope==='selection'&&sel?.rangeCount&&!sel.isCollapsed){
        const r=sel.getRangeAt(0),c=r.commonAncestorContainer;
        if(c===el||el.contains(c)){const txt=r.toString();r.deleteContents();r.insertNode(document.createTextNode(txt));el.normalize()}
        else return toast('Sélectionnez du texte dans le bloc actif');
      }else el.innerHTML=esc(el.innerText).replace(/\n/g,'<br>');
      a.richHtml=el.innerHTML;a.text=el.innerText.replace(/\u00a0/g,' ');
      const ta=E.form?.querySelector('[name=textContent]');if(ta)ta.value=a.text;
      commitAnnotationHistory(scope==='selection'?'Suppression formatage sélection':'Suppression formatage enrichi');
      toast(scope==='selection'?'Formatage retiré de la sélection':'Formatage du bloc supprimé');
    },true);
  }
}

// --- Surligneur : couleurs personnalisées mémorisées ---
const HKEY=(PROFILE.storagePrefix||'nlab-pdf')+'-highlight-quick-custom-0914';
const FIXED=['#FFEB3B','#66BB6A','#42A5F5','#EC407A','#FFA726','#EF5350'];
function hload(){try{const v=JSON.parse(localStorage.getItem(HKEY)||'[]');return Array.isArray(v)?v.filter(c=>/^#[0-9A-F]{6}$/i.test(c)).map(c=>c.toUpperCase()).slice(0,6):[]}catch{return[]}}
function hsave(v){try{localStorage.setItem(HKEY,JSON.stringify(v.slice(0,6)))}catch{}}
function chooseH(picker,c,box){picker.value=c;picker.dispatchEvent(new Event('input',{bubbles:true}));syncSelected();qa('[data-c]',box).forEach(x=>x.classList.toggle('active',String(x.dataset.c).toUpperCase()===c))}
function renderCustomH(box,picker){
  qa('.highlightCustomRC2',box).forEach(x=>x.remove());
  const plus=$r('highlightPlus0914');if(!plus)return;
  for(const c of hload()){
    const b=document.createElement('button');b.type='button';b.className='highlightPreset0914 highlightCustomRC2';b.dataset.c=c;b.style.background=c;b.title='Personnalisé '+c+' · Maj+clic pour supprimer';
    b.onclick=e=>{if(e.shiftKey){hsave(hload().filter(x=>x!==c));renderCustomH(box,picker)}else chooseH(picker,c,box)};
    plus.before(b);
  }
}
function installHighlightRC2(){
  const box=$r('highlightPresets0914'),picker=E.form?.querySelector('[name=highlightColor]'),plus=$r('highlightPlus0914');
  if(!box||!picker||!plus)return;
  renderCustomH(box,picker);
  if(!plus.dataset.rc2){
    plus.dataset.rc2='1';plus.title='Ajouter une couleur personnalisée';
    plus.onclick=()=>{const once=()=>{const c=String(picker.value||'').toUpperCase();let v=hload();if(/^#[0-9A-F]{6}$/.test(c)&&!FIXED.includes(c)&&!v.includes(c)){v=[...v,c].slice(-6);hsave(v)}renderCustomH(box,picker);chooseH(picker,c,box)};picker.addEventListener('change',once,{once:true});picker.click()};
    const help=document.createElement('div');help.className='nlab0914Help highlightCustomRC2';help.textContent='Le bouton + mémorise jusqu’à 6 couleurs personnelles. Maj+clic pour en retirer une.';box.appendChild(help);
  }
}

// --- Nommage sortie : compléter les variables expliquées ---
function insertTokenRC2(v){const i=$r('filenameTemplate');if(!i)return;i.setRangeText(v,i.selectionStart??i.value.length,i.selectionEnd??i.value.length,'end');i.dispatchEvent(new Event('input',{bubbles:true}));updatePath();i.focus()}
function installOutputRC2(){
  const guide=$r('outputGuide0914');if(!guide||guide.dataset.rc2)return;guide.dataset.rc2='1';
  const tok=guide.querySelector('.templateTokens0914');
  if(tok){for(const v of ['{YY}','{M}','{MMM}','{DD}','{D}','{W}'])if(![...tok.querySelectorAll('button')].some(b=>b.dataset.tpl===v)){const b=document.createElement('button');b.type='button';b.dataset.tpl=v;b.textContent=v;b.onclick=()=>insertTokenRC2(v);tok.appendChild(b)}}
  const h=document.createElement('div');h.className='nlab0914Help';h.innerHTML='<code>{MM}</code>=09 · <code>{M}</code>=9 · <code>{MMM}</code>=sept · <code>{MMMM}</code>=septembre · <code>{YYYY}</code>=2026 · <code>{YY}</code>=26 · <code>{DD}</code>=23 · <code>{WW}</code>=semaine ISO. Les affixes des tampons sont ajoutés au nom final.';guide.appendChild(h);
}

// --- Espace personnel : Client ID OAuth configurable localement ---
const GKEY=(PROFILE.storagePrefix||'nlab-pdf')+'-google-oauth-client-id';
const googleDriveClientIdRC1=googleDriveClientId;
googleDriveClientId=function(){const central=String(googleDriveClientIdRC1()||'').trim();if(central)return central;try{return String(localStorage.getItem(GKEY)||'').trim()}catch{return''}};
function saveClientRC2(v){v=String(v||'').trim();if(v&&!/^[A-Za-z0-9._-]+\.apps\.googleusercontent\.com$/.test(v))throw new Error('Client ID invalide : format attendu …apps.googleusercontent.com');try{if(v)localStorage.setItem(GKEY,v);else localStorage.removeItem(GKEY)}catch{}setGoogleDriveUi();return v}
function installSignatureRC2(){
  const gate=$r('signatureGate0914');if(!gate||gate.dataset.rc2)return;gate.dataset.rc2='1';
  const v=googleDriveClientId();
  gate.innerHTML='<b>🔐 Espace personnel Google</b><div>Signatures et paraphes : stockage privé dans <code>drive.appdata</code>. P12/PFX et mot de passe : mémoire locale uniquement.</div><label class="nlab0914Help">Client ID OAuth Web Google — ce n’est pas un secret<input id="sigGoogleClientRC2" type="text" value="'+esc(v)+'" placeholder="xxxxxxxx.apps.googleusercontent.com"></label><div class="row"><button id="sigGoogleSaveRC2" type="button">Enregistrer</button><button id="sigGoogleConnectRC2" type="button" '+(v?'':'disabled')+'>Connecter Google Drive</button></div><div class="nlab0914Help">Dans Google Cloud, ajouter <code>https://nepheris.github.io</code> aux origines JavaScript autorisées. Cette configuration reste dans ce navigateur.</div>';
  const input=$r('sigGoogleClientRC2'),connect=$r('sigGoogleConnectRC2');
  $r('sigGoogleSaveRC2').onclick=()=>{try{const x=saveClientRC2(input.value);connect.disabled=!x;toast(x?'Configuration OAuth enregistrée':'Configuration OAuth effacée')}catch(e){toast(e.message)}};
  connect.onclick=()=>{try{const x=saveClientRC2(input.value);if(!x)return toast('Renseignez un Client ID OAuth Web');connectGoogleDrive()}catch(e){toast(e.message)}};
}
try{setGoogleDriveUi()}catch{}

// --- Marquage RC2 + installation continue ---
function installRC2(){
  installRichRC2();installHighlightRC2();installOutputRC2();installSignatureRC2();
  document.querySelectorAll('.buildBadge strong').forEach(x=>x.textContent='Alpha 0.9.14 RC2');
  const foot=document.querySelector('footer .footerInfo span');if(foot)foot.textContent=(foot.textContent||'').replace(/Alpha 0\.9\.14(?: TEST| RC2)?/g,'Alpha 0.9.14 RC2');
}
const mo=new MutationObserver(()=>setTimeout(installRC2,0));
if(E.form)mo.observe(E.form,{childList:true,subtree:true});
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(installRC2,180),{once:true});else setTimeout(installRC2,180);
})();