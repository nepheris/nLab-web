import{MarkdownEngine}from'../_shared/studio-v1/markdown-engine.js';
import{loadStudioVersion}from'../_shared/studio-v1/version.js';
import{DemoCorpus}from'../_shared/studio-v1/demo-corpus.js';

const VERSION_INFO=await loadStudioVersion({registryUrl:'./versions.json',channel:'test',appName:'Markdown Studio',fallback:'TEST'});
document.title='nLab Markdown Studio '+VERSION_INFO.version+(VERSION_INFO.status==='TEST'?' TEST':'');
const $=s=>document.querySelector(s), qsa=s=>[...document.querySelectorAll(s)];
const engine=new MarkdownEngine();
const editor=$('#mdEditor'),preview=$('#preview'),toc=$('#toc'),yamlEditor=$('#yamlEditor'),yamlBig=$('#yamlBig');
let fileName='nouveau.md',dirty=false,imageSeq=0,objectUrls=[];
const demoCorpus=new DemoCorpus({indexUrl:'../../Library/demo/manifests/index.json'});
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
 try{engine.parseYaml(text);const p=engine.splitFrontMatter(editor.value);editor.value=engine.compose({yamlText:text,body:p.body});syncPreview();setDirty();setStatus('YAML appliqué')}
 catch(e){$('#yamlStatus').textContent='Erreur YAML : '+e.message;$('#yamlStatus').classList.add('statusWarning')}
}
function insert(before,after='',placeholder='texte'){
 const r=engine.insertAt(editor.value,editor.selectionStart,editor.selectionEnd,before,after,placeholder);editor.value=r.text;editor.focus();editor.setSelectionRange(r.start,r.end);setDirty();syncPreview()
}
function prefixLine(prefix){
 const s=editor.selectionStart,start=editor.value.lastIndexOf('\n',s-1)+1;editor.value=editor.value.slice(0,start)+prefix+editor.value.slice(start);editor.focus();editor.setSelectionRange(s+prefix.length,s+prefix.length);setDirty();syncPreview()
}
function download(blob,name){const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1200)}
function saveMarkdown(){download(new Blob([editor.value],{type:'text/markdown;charset=utf-8'}),fileName);setDirty(false);setStatus('Markdown exporté')}
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
editor.addEventListener('input',()=>{setDirty();refresh()});
qsa('.studioMenu button').forEach(b=>b.onclick=()=>switchMode(b.dataset.mode));
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
$('#openDemoCorpus').onclick=async()=>{try{const files=await demoCorpus.fetchFiles('markdown-studio',{extensions:['md','markdown']});if(!files.length)throw new Error('Aucun fichier Markdown local dans le corpus public');const f=files[0];fileName=f.name;$('#docName').textContent=fileName;editor.value=await f.text();syncPreview();syncYamlFromSource(true);setDirty(false);setStatus('Corpus démo nLab · '+files.length+' fichier(s) disponible(s) · '+f.name)}catch(e){setStatus('Corpus démo : '+e.message)}};
$('#fileInput').onchange=async e=>{const f=e.target.files?.[0];if(!f)return;fileName=f.name;$('#docName').textContent=fileName;editor.value=await f.text();syncPreview();syncYamlFromSource(true);setDirty(false);setStatus('Fichier chargé')};
$('#saveMd').onclick=saveMarkdown;$('#exportHtml').onclick=exportHtml;
$('#refreshToc').onclick=syncPreview;
toc.onclick=e=>{const b=e.target.closest('[data-id]');if(!b)return;preview.querySelector('#'+CSS.escape(b.dataset.id))?.scrollIntoView({behavior:'smooth',block:'start'});switchMode('preview')};
$('#applyYaml').onclick=()=>applyYaml(yamlEditor.value);yamlBig.addEventListener('change',()=>applyYaml(yamlBig.value));
$('#syncMeta').onclick=()=>{let data={};try{data=engine.parseYaml(engine.splitFrontMatter(editor.value).yamlText)||{}}catch(e){}data.title=$('#metaTitle').value.trim();data.lang=$('#metaLang').value.trim();data.author=$('#metaAuthor').value.trim();applyYaml(engine.dumpYaml(data))};
$('#exportYaml').onclick=()=>download(new Blob([yamlEditor.value],{type:'text/yaml;charset=utf-8'}),fileName.replace(/\.md$/i,'')+'.yaml');
$('#insertImage').onclick=()=>$('#imageInput').click();
$('#imageInput').onchange=e=>{const f=e.target.files?.[0];if(!f)return;const url=URL.createObjectURL(f);objectUrls.push(url);imageSeq++;insert('![',']('+url+')',f.name.replace(/\.[^.]+$/,''));setStatus('Image locale insérée · URL valable pendant cette session')};
window.addEventListener('beforeunload',()=>objectUrls.forEach(URL.revokeObjectURL));
editor.value=demo;$('#docName').textContent=fileName;syncPreview();syncYamlFromSource(true);setDirty(false);switchMode('split');
window.__NLAB_MARKDOWN_STUDIO__={version:VERSION_INFO.version,engine,getSource:()=>editor.value,setSource:v=>{editor.value=String(v||'');syncPreview()}};
