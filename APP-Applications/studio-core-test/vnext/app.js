import {mountShareMenu} from '../../_shared/nlab-share-menu.js';
// VNext experimental shell: one command dispatcher, shared panels and local preferences.
// Functional bridge to the existing Studio Core services is intentionally not implemented yet.
const $=s=>document.querySelector(s),$$=s=>Array.from(document.querySelectorAll(s));
const key='nlab:core-vnext:ui:v1';
let state={panel:'files',work:true,sidebar:true,ribbon:true,locked:false,width:310,theme:'auto',files:[]};
try{const saved=JSON.parse(localStorage.getItem(key)||'{}');for(const k of ['panel','work','sidebar','ribbon','locked','width','theme'])if(Object.hasOwn(saved,k))state[k]=saved[k]}catch{}
const persist=()=>{try{const {files,...preferences}=state;localStorage.setItem(key,JSON.stringify(preferences))}catch{}};
const safe=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','"':'&quot;',"'":'&#39;'}[c]));
const dispatch=cmd=>{
 if(cmd==='import'){$('#fileInput').click();return}
 if(cmd==='save'||cmd==='save-as'){const data=JSON.stringify({files:state.files.map(x=>({name:x.name,size:x.size,type:x.type})),preferences:{panel:state.panel,width:state.width}},null,2);const a=document.createElement('a'),url=URL.createObjectURL(new Blob([data],{type:'application/json'}));a.href=url;a.download='core-vnext-demo.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),500);return}
 if(cmd==='toggle-work')state.work=!state.work;
 if(cmd==='collapse')state.sidebar=false;
 if(cmd==='lock')state.locked=!state.locked;
 if(cmd==='windows')openWindow();
 persist();render();
};
function panelContent(){
 const common='<details class="section" open><summary>Options du panneau</summary><p class="hint">Les panneaux utilisent les mêmes titres, boutons et sections repliables.</p></details>';
 const sections={
 files:'<button data-cmd="import">↥ Importer des fichiers</button><button data-cmd="save">▣ Enregistrer</button><button data-cmd="save-as">⇩ Enregistrer sous</button>',
 tools:'<p class="hint">Outils communs — emplacements des commandes contextuelles.</p>',
 history:'<details class="section" open><summary>Historique</summary><p class="hint">Aucune action de production enregistrée dans ce prototype.</p></details>',
 properties:'<div class="section"><strong>Propriétés</strong><p class="hint">Sélectionnez un fichier pour en afficher les caractéristiques.</p></div>',
 settings:'<details class="section" open><summary>Personnalisation de l’interface</summary><label class="row">Thème <select id="theme"><option value="auto">Automatique</option><option value="light">Clair</option><option value="dark">Sombre</option></select></label><p class="hint">Les options de visibilité sont les mêmes que dans « Affichage ».</p></details>'
 };
 $('#panelBody').innerHTML=(sections[state.panel]||sections.files)+common;
 const theme=$('#theme');if(theme){theme.value=state.theme;theme.addEventListener('change',()=>{state.theme=theme.value;persist();render()})}
}
function render(){
 document.body.classList.toggle('dark',state.theme==='dark'||state.theme==='auto'&&matchMedia('(prefers-color-scheme: dark)').matches);
 $('.workspace').classList.toggle('is-work-hidden',!state.work);
 $('.workspace').classList.toggle('is-side-hidden',!state.sidebar);
 $('.workspace').classList.toggle('is-ribbon-hidden',!state.ribbon);
 $('.layout').style.setProperty('--side-width',state.width+'px');
 $('#panelTitle').textContent=({files:'Fichiers',tools:'Outils',history:'Historique',properties:'Propriétés',settings:'Réglages'})[state.panel];
 $$('[data-panel]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.panel===state.panel)));
 $$('[data-visible]').forEach(b=>b.checked=state[b.dataset.visible]);
 $$('[data-cmd="toggle-work"]').forEach(b=>b.textContent=state.work?'▤ Masquer la planche':'▤ Afficher la planche');
 $('[data-cmd=lock]').textContent=state.locked?'🔒':'🔓';
 $('#displayBtn').setAttribute('aria-expanded',String(!$('#displayMenu').hidden));
 panelContent();
}
function openWindow(){
 let box=$('#vnextWindow');if(!box){box=document.createElement('section');box.id='vnextWindow';box.className='floating';box.innerHTML='<div class="panelHead"><strong>Fenêtres</strong><button id="minWindow">−</button><button id="closeWindow">×</button></div><div class="content">Panneaux : Fichiers, Outils, Historique, Propriétés, Réglages.</div>';document.body.append(box);$('#closeWindow').onclick=()=>box.hidden=true;$('#minWindow').onclick=()=>box.querySelector('.content').hidden=!box.querySelector('.content').hidden;}box.hidden=false;
}
document.addEventListener('click',e=>{let b=e.target.closest('[data-cmd]');if(b)dispatch(b.dataset.cmd);let p=e.target.closest('[data-panel]');if(p){state.panel=p.dataset.panel;state.sidebar=true;persist();render()}});
$('#displayBtn').onclick=()=>{$('#displayMenu').hidden=!$('#displayMenu').hidden;render()};
$$('[data-visible]').forEach(b=>b.addEventListener('change',()=>{state[b.dataset.visible]=b.checked;persist();render()}));
$('#fileInput').addEventListener('change',e=>{state.files=Array.from(e.target.files||[]);$('#filesList').textContent=state.files.length?state.files.map(f=>f.name).join(' · '):'Aucun fichier importé.';});
const grip=$('.resizer');grip.addEventListener('pointerdown',e=>{if(state.locked)return;e.preventDefault();grip.setPointerCapture(e.pointerId)});grip.addEventListener('pointermove',e=>{if(!grip.hasPointerCapture(e.pointerId))return;state.width=Math.max(210,Math.min(550,e.clientX-$('.rail').getBoundingClientRect().right));$('.layout').style.setProperty('--side-width',state.width+'px')});grip.addEventListener('pointerup',()=>persist());
grip.addEventListener('keydown',e=>{if(state.locked)return;if(e.key==='ArrowLeft'||e.key==='ArrowRight'){state.width=Math.max(210,Math.min(550,state.width+(e.key==='ArrowLeft'?-15:15)));persist();render();e.preventDefault()}});
render();

// Single share controller: reusable by other Studios once validated.
mountShareMenu({trigger:$('#shareBtn'),menu:$('#shareMenu'),dialog:$('#qrDialog'),notice:$('#uiNotice')});
const themeHeader=$('#themeHeader');
themeHeader.value=state.theme;
themeHeader.addEventListener('change',()=>{
 state.theme=themeHeader.value;persist();render();
});
const existingRender=render;
render=function(){
 existingRender();
 themeHeader.value=state.theme;
};
if(window.matchMedia){
 matchMedia('(prefers-color-scheme: dark)').addEventListener?.('change',()=>{if(state.theme==='auto')render()});
}
