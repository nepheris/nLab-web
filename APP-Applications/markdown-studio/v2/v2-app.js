import{MarkdownEngine}from'../../_shared/studio-v2/markdown-engine.js';
import{mountStudioV2}from'../../_shared/studio-v2/frame.js';
import{resolveStudioVersions}from'../../_shared/studio-v2/version-service.js';
import studioManifest from'./studio-manifest.js';
import{DemoCorpus}from'../../_shared/studio-v2/demo-corpus.js';
import{icon}from'../../_shared/studio-v2/icon-registry.js';
import{downloadBlob}from'../../_shared/studio-v2/download-service.js';
import{pushUndoRedo}from'../../_shared/studio-v2/undo-redo.js';

const VERSION_INFO=await resolveStudioVersions({versionsHref:'../versions.json',coreVersionHref:'../../_shared/studio-v2/version.json',channel:'test'});
await mountStudioV2({manifest:studioManifest,versionInfo:VERSION_INFO});
const $=s=>document.querySelector(s), qsa=s=>[...document.querySelectorAll(s)];
const engine=new MarkdownEngine();
const editor=$('#mdEditor'),preview=$('#preview'),toc=$('#toc'),yamlEditor=$('#yamlEditor'),yamlBig=$('#yamlBig');
let fileName='nouveau.md',dirty=false,imageSeq=0,objectUrls=[],txnMute=false,textTxnTimer=null,lastTxnState=null;
const demoCorpus=new DemoCorpus({indexUrl:'../../Library/demo/manifests/index.json'});
$('#refreshToc').innerHTML=icon('refresh',{label:'Actualiser le sommaire'});
$('#refreshToc').setAttribute('aria-label','Actualiser le sommaire');
const demo=`---
title: Markdown Studio
lang: fr
author: nLab
tags:
  - studio
  - markdown
---

# Markdown Studio

Un éditeur **Markdown transversal** pour nLab.

## Édition structurée

Le sommaire à gauche est généré automatiquement depuis les titres.

### Tableaux

| Fonction | État |
|---|---|
| Markdown | actif |
| YAML front matter | actif |
| WYSIWYG avancé | développement |

### Images

Utilisez le bouton **Image** pour insérer une image locale.

> Le rendu HTML est nettoyé avant affichage.
`;

function setStatus(t){$('#status').textContent=t}
function setDirty(v=true){dirty=v;$('#dirtyState').textContent=v?'Modifié':'Enregistré';$('#dirtyState').classList.toggle('statusWarning',v)}
function markdownState(){return{fileName,source:editor.value,selectionStart:editor.selectionStart,selectionEnd:editor.selectionEnd,dirty}}
function publishMarkdownContext(source='markdown-studio'){document.dispatchEvent(new CustomEvent('studio-v2:selection-change',{detail:{selection:[{name:fileName}],active:{name:fileName},scope:'document',kind:'markdown',meta:{dirty,words:engine.wordCount(editor.value),chars:editor.value.length},source}}))}
function restoreMarkdown(st,source='undo-redo'){txnMute=true;fileName=st.fileName||fileName;$('#docName').textContent=fileName;editor.value=st.source||'';syncPreview();syncYamlFromSource(true);setDirty(st.dirty!==false);editor.setSelectionRange(Math.min(st.selectionStart||0,editor.value.length),Math.min(st.selectionEnd||0,editor.value.length));lastTxnState=markdownState();publishMarkdownContext(source);txnMute=false}
function transactMarkdown(label,before,after){pushUndoRedo({label,meta:{studio:'markdown-studio'},undo:()=>restoreMarkdown(before,'undo'),redo:()=>restoreMarkdown(after,'redo')})}
function queueMarkdownTxn(label='Modifier le document Markdown'){if(txnMute)return;clearTimeout(textTxnTimer);textTxnTimer=setTimeout(()=>{const after=markdownState(),before=lastTxnState;if(before&&before.source!==after.source)transactMarkdown(label,before,after);lastTxnState=after;publishMarkdownContext('edit')},250)}
function syncPreview(){
 const src=editor.value,{html,headings}=engine.renderWithAnchors(src);preview.innerHTML=html;
 toc.innerHTML=headings.length?headings.map(h=>'<button class="lvl'+h.level+'" data-id="'+h.id+'">'+escapeHtml(h.text)+'</button>').join(''):'<span class="hint">Aucun titre.</span>';
 const words=engine.wordCount(src),chars=engine.splitFrontMatter(src).body.length;$('#stats').textContent=words+' mots · '+chars+' caractères';
 syncYamlFromSource(false);
}
function escapeHtml(s){return String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]))}
function debounce(fn,ms=120){let t;return(...a)=>{clearTimeout(t);t=setTimeout(()=>fn(...a),ms)}}
const refresh=debounce(syncPreview,100);
function syncYamlFromSource(updateFields=true){
 const p=engine.splitFrontMatter(editor.value);yamlEditor.value=p.yamlText;yamlBig.value=p.yamlText;
 if(p.data?.__error){$('#yamlStatus').textContent='Erreur YAML : '+p.data.__error;$('#yamlStatus').classList.add('statusWarning');return}
 $('#yamlStatus').textContent='YAML valide';$('#yamlStatus').classList.remove('statusWarning');
 if(updateFields){$('#metaTitle').value=p.data?.title||'';$('#metaLang').value=p.data?.lang||'';$('#metaAuthor').value=p.data?.author||''}
}
function applyYaml(text){
 try{const before=markdownState();engine.parseYaml(text);const p=engine.splitFrontMatter(editor.value);txnMute=true;editor.value=engine.compose({yamlText:text,body:p.body});syncPreview();setDirty();txnMute=false;const after=markdownState();lastTxnState=after;transactMarkdown('Appliquer le YAML',before,after);publishMarkdownContext('yaml');setStatus('YAML appliqué')}
 catch(e){$('#yamlStatus').textContent='Erreur YAML : '+e.message;$('#yamlStatus').classList.add('statusWarning')}
}
function insert(before,after='',placeholder='texte'){
 const st=markdownState(),r=engine.insertAt(editor.value,editor.selectionStart,editor.selectionEnd,before,after,placeholder);txnMute=true;editor.value=r.text;editor.focus();editor.setSelectionRange(r.start,r.end);setDirty();syncPreview();txnMute=false;const afterState=markdownState();lastTxnState=afterState;transactMarkdown('Insérer du contenu Markdown',st,afterState);publishMarkdownContext('insert')
}
function prefixLine(prefix){
 const before=markdownState(),sel=editor.selectionStart,start=editor.value.lastIndexOf('\n',sel-1)+1;txnMute=true;editor.value=editor.value.slice(0,start)+prefix+editor.value.slice(start);editor.focus();editor.setSelectionRange(sel+prefix.length,sel+prefix.length);setDirty();syncPreview();txnMute=false;const after=markdownState();lastTxnState=after;transactMarkdown('Préfixer une ligne Markdown',before,after);publishMarkdownContext('prefix')
}
const download=(blob,name)=>downloadBlob(blob,name)
function saveMarkdown(){download(new Blob([editor.value],{type:'text/markdown;charset=utf-8'}),fileName);setDirty(false);setStatus('Markdown exporté')}
function printPdf(){
 const {html}=engine.renderWithAnchors(editor.value),p=engine.splitFrontMatter(editor.value),title=p.data?.title||fileName.replace(/\.md$/i,'');
 const w=window.open('','_blank','noopener,noreferrer,width=980,height=760');if(!w){setStatus('Fenêtre d’impression bloquée par le navigateur');return}
 w.document.write('<!doctype html><html lang="'+(p.data?.lang||'fr')+'"><head><meta charset="utf-8"><title>'+escapeHtml(title)+'</title><style>@page{margin:18mm}body{font:12pt/1.55 Arial,sans-serif;color:#111}img{max-width:100%}table{border-collapse:collapse;width:100%}th,td{border:1px solid #bbb;padding:5px}pre{white-space:pre-wrap;background:#f3f4f6;padding:10px}</style></head><body>'+html+'<script>window.onload=()=>setTimeout(()=>window.print(),150)<\/script></body></html>');w.document.close();setStatus('Aperçu impression ouvert · choisir « Enregistrer au format PDF »')
}
function exportHtml(){
 const {html}=engine.renderWithAnchors(editor.value),p=engine.splitFrontMatter(editor.value),title=p.data?.title||fileName.replace(/\.md$/i,'');
 const full='<!doctype html><html lang="'+(p.data?.lang||'fr')+'"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>'+escapeHtml(title)+'</title><style>body{font:16px/1.65 Arial,sans-serif;max-width:900px;margin:40px auto;padding:0 22px;color:#1f2933}img{max-width:100%}table{border-collapse:collapse;width:100%}th,td{border:1px solid #bbb;padding:6px}pre{overflow:auto;background:#222;color:#fff;padding:12px;border-radius:6px}</style></head><body>'+html+'</body></html>';
 download(new Blob([full],{type:'text/html;charset=utf-8'}),fileName.replace(/\.md$/i,'')+'.html');setStatus('HTML exporté')
}
function switchMode(mode){
 qsa('.studioMenu button').forEach(b=>b.classList.toggle('active',b.dataset.mode===mode));const g=$('#editorGrid');g.className='editorGrid mode-'+mode;
 if(mode==='yaml'){yamlBig.value=engine.splitFrontMatter(editor.value).yamlText}
 if(mode==='help'){g.className='editorGrid mode-preview';preview.innerHTML='<h1>Aide Markdown Studio</h1><p>Utilisez la barre de ruban pour insérer les syntaxes Markdown usuelles. Le panneau de gauche gère le sommaire et le front matter YAML.</p><h2>Fonctions avancées</h2><p><span class="devBadge">DÉVELOPPEMENT</span> Le mode WYSIWYG complet sera branché sur le moteur partagé après validation.</p>'}
}
editor.addEventListener('input',()=>{setDirty();refresh();queueMarkdownTxn()});
let scrollSync=false;
function syncScroll(from,to){if(scrollSync)return;scrollSync=true;const maxFrom=Math.max(1,from.scrollHeight-from.clientHeight),maxTo=Math.max(0,to.scrollHeight-to.clientHeight),ratio=from.scrollTop/maxFrom;to.scrollTop=ratio*maxTo;requestAnimationFrame(()=>scrollSync=false)}
editor.addEventListener('scroll',()=>syncScroll(editor,preview));preview.addEventListener('scroll',()=>syncScroll(preview,editor));
document.addEventListener('studio-v2:menu',e=>switchMode(e.detail?.tab||'split'));
document.addEventListener('studio-v2:action',e=>{const a=e.detail?.action;if(a==='bold')insert('**','**');else if(a==='italic')insert('*','*');else if(a==='h1')prefixLine('# ');else if(a==='h2')prefixLine('## ');else if(a==='h3')prefixLine('### ')});
qsa('[data-wrap]').forEach(b=>b.onclick=()=>{const [a,z]=b.dataset.wrap.split('|');insert(a,z)});
qsa('[data-prefix]').forEach(b=>b.onclick=()=>prefixLine(b.dataset.prefix));
$('#insertLink').onclick=()=>insert('[','](https://)','texte du lien');
$('#insertList').onclick=()=>prefixLine('- ');
$('#addQuote').onclick=()=>prefixLine('> ');
$('#addCode').onclick=()=>insert('\n\n~~~\n','\n~~~\n','code');
$('#insertTable').onclick=$('#addTable2x3').onclick=()=>insert('\n\n| Colonne 1 | Colonne 2 | Colonne 3 |\n|---|---|---|\n| A | B | C |\n| D | E | F |\n\n','','');
$('#insertColor').onclick=()=>{const c=prompt('Couleur CSS ou hexadécimale','#B42318');if(c)insert('<span style="color:'+c+'">','</span>','texte coloré')};
$('#insertFont').onclick=()=>{const f=prompt('Police CSS','Arial');if(f)insert('<span style="font-family:'+f+'">','</span>','texte')};
$('#wysiwygDev').onclick=()=>setStatus('WYSIWYG complet : DÉVELOPPEMENT');
$('#openMd').onclick=()=>$('#fileInput').click();
$('#openDemoCorpus').onclick=async()=>{try{const before=markdownState(),files=await demoCorpus.fetchFiles('markdown-studio',{extensions:['md','markdown']});if(!files.length)throw new Error('Aucun fichier Markdown local dans le corpus public');const f=files[0];txnMute=true;fileName=f.name;$('#docName').textContent=fileName;editor.value=await f.text();syncPreview();syncYamlFromSource(true);setDirty(false);txnMute=false;const after=markdownState();lastTxnState=after;transactMarkdown('Charger le corpus Markdown',before,after);publishMarkdownContext('load-demo');setStatus('Corpus démo nLab · '+files.length+' fichier(s) disponible(s) · '+f.name)}catch(e){setStatus('Corpus démo : '+e.message)}};
$('#fileInput').onchange=async e=>{const f=e.target.files?.[0];if(!f)return;const before=markdownState();txnMute=true;fileName=f.name;$('#docName').textContent=fileName;editor.value=await f.text();syncPreview();syncYamlFromSource(true);setDirty(false);txnMute=false;const after=markdownState();lastTxnState=after;transactMarkdown('Ouvrir '+f.name,before,after);publishMarkdownContext('load-file');setStatus('Fichier chargé')};
$('#saveMd').onclick=saveMarkdown;$('#exportHtml').onclick=exportHtml;$('#printPdf').onclick=printPdf;
$('#refreshToc').onclick=syncPreview;
toc.onclick=e=>{const b=e.target.closest('[data-id]');if(!b)return;preview.querySelector('#'+CSS.escape(b.dataset.id))?.scrollIntoView({behavior:'smooth',block:'start'});switchMode('preview')};
$('#applyYaml').onclick=()=>applyYaml(yamlEditor.value);yamlBig.addEventListener('change',()=>applyYaml(yamlBig.value));
$('#syncMeta').onclick=()=>{let data={};try{data=engine.parseYaml(engine.splitFrontMatter(editor.value).yamlText)||{}}catch(e){}data.title=$('#metaTitle').value.trim();data.lang=$('#metaLang').value.trim();data.author=$('#metaAuthor').value.trim();applyYaml(engine.dumpYaml(data))};
$('#exportYaml').onclick=()=>download(new Blob([yamlEditor.value],{type:'text/yaml;charset=utf-8'}),fileName.replace(/\.md$/i,'')+'.yaml');
$('#insertImage').onclick=()=>$('#imageInput').click();
$('#imageInput').onchange=e=>{const f=e.target.files?.[0];if(!f)return;const url=URL.createObjectURL(f);objectUrls.push(url);imageSeq++;insert('![',']('+url+')',f.name.replace(/\.[^.]+$/,''));setStatus('Image locale insérée · URL valable pendant cette session')};
window.addEventListener('beforeunload',()=>objectUrls.forEach(URL.revokeObjectURL));
txnMute=true;editor.value=demo;$('#docName').textContent=fileName;syncPreview();syncYamlFromSource(true);setDirty(false);switchMode('split');txnMute=false;lastTxnState=markdownState();publishMarkdownContext('ready');
window.__NLAB_MARKDOWN_STUDIO__={version:VERSION_INFO.studioVersion,engine,getSource:()=>editor.value,setSource:v=>{editor.value=String(v||'');syncPreview()}};
