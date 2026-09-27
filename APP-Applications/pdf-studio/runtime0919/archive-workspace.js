(()=>{'use strict';
if(window.__NLAB_0919_ARCHIVE_WORKSPACE__)return;
window.__NLAB_0919_ARCHIVE_WORKSPACE__=true;
const $z=id=>document.getElementById(id);
const ZIP_LIMITS0919={maxDepth:3,maxEntries:500,maxBytes:250*1024*1024};
S.archiveWorkspaces0919=S.archiveWorkspaces0919||new Map();

function zipSafe0919(path){
 const parts=String(path||'').replace(/\\/g,'/').split('/'),out=[];
 for(const p of parts){if(!p||p==='.')continue;if(p==='..')throw new Error('Chemin ZIP dangereux');out.push(p)}
 const v=out.join('/');if(!v||v.startsWith('/')||/^[A-Za-z]:/.test(v))throw new Error('Chemin ZIP dangereux');return v;
}
function zipId0919(){return 'zip-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,8)}
async function expandZip0919(item,depth=0,budget={entries:0,bytes:0}){
 if(typeof JSZip==='undefined')throw new Error('JSZip non chargé');if(depth>ZIP_LIMITS0919.maxDepth)throw new Error('ZIP imbriqué trop profondément : '+item.name);
 let zip;try{zip=await JSZip.loadAsync(await item.file.arrayBuffer())}catch(e){throw new Error('ZIP illisible ou protégé par mot de passe : '+item.name)}
 const id=zipId0919(),parentId=item._archiveParentWorkspaceId||'',rootId=item._archiveRootId||id;
 const ws={id,rootId,parentId,parentEntryPath:item._archiveParentPath||'',sourceName:item.name,sourceFile:item.file,sourceHandle:item.handle||null,zip,children:new Set(),modified:new Set(),created:new Set(),deleted:new Set()};
 S.archiveWorkspaces0919.set(id,ws);if(parentId)S.archiveWorkspaces0919.get(parentId)?.children.add(id);
 const out=[];
 for(const ent of Object.values(zip.files)){
  if(ent.dir)continue;if(++budget.entries>ZIP_LIMITS0919.maxEntries)throw new Error('ZIP refusé : plus de 500 entrées');
  const p=zipSafe0919(ent.name),declared=Number(ent?._data?.uncompressedSize||0);if(declared&&budget.bytes+declared>ZIP_LIMITS0919.maxBytes)throw new Error('ZIP refusé : plus de 250 Mo décompressés');
  const blob=await ent.async('blob');budget.bytes+=blob.size;if(budget.bytes>ZIP_LIMITS0919.maxBytes)throw new Error('ZIP refusé : plus de 250 Mo décompressés');
  const name=p.split('/').pop(),file=new File([blob],name,{type:mimeFromName(name)}),rel=(item.relativePath||item.name)+'/'+p;
  if(/\.zip$/i.test(name)){
   out.push(...await expandZip0919({file,name,relativePath:rel,_archiveParentWorkspaceId:id,_archiveParentPath:p,_archiveRootId:rootId},depth+1,budget));
  }else{
   out.push({file,name,relativePath:rel,fromArchive:item.name,archiveWorkspaceId0919:id,archiveRootId0919:rootId,archivePath0919:p,archiveDepth:depth+1});
  }
 }
 return out;
}
expandZipItem=expandZip0919;

function rootWorkspace0919(ws){let x=ws;while(x?.parentId)x=S.archiveWorkspaces0919.get(x.parentId);return x}
async function buildWorkspaceBlob0919(ws){
 for(const childId of ws.children){const child=S.archiveWorkspaces0919.get(childId);if(!child)continue;const blob=await buildWorkspaceBlob0919(child);ws.zip.file(child.parentEntryPath,blob)}
 return ws.zip.generateAsync({type:'blob',compression:'DEFLATE',compressionOptions:{level:6}});
}
async function updateArchiveEntry0919(bytes,name,mime='application/pdf'){
 const cur=current();if(!cur?.archiveWorkspaceId0919)throw new Error('Le fichier courant ne provient pas d’une archive ZIP');
 const ws=S.archiveWorkspaces0919.get(cur.archiveWorkspaceId0919);if(!ws)throw new Error('Workspace ZIP introuvable');
 const old=cur.archivePath0919,parts=old.split('/'),oldName=parts.pop(),dir=parts.length?parts.join('/')+'/':'';
 const target=/\.pdf$/i.test(oldName)?(name&&/\.pdf$/i.test(name)?dir+name:old):(dir+(String(name||oldName).replace(/\.[^.]+$/,'')+'.pdf'));
 const safe=zipSafe0919(target),blob=new Blob([bytes],{type:mime});
 ws.zip.file(safe,blob);ws.modified.add(safe);if(safe!==old)ws.created.add(safe);
 cur.archivePath0919=safe;cur.name=safe.split('/').pop();cur.file=new File([blob],cur.name,{type:mime});cur.relativePath=(rootWorkspace0919(ws).sourceName||'archive.zip')+'/'+safe;
 queue();renderArchivePanel0919();toast('Archive virtuelle mise à jour : '+safe);return safe;
}
async function exportArchiveZip0919(){
 const cur=current(),ws=cur?.archiveWorkspaceId0919?S.archiveWorkspaces0919.get(cur.archiveWorkspaceId0919):[...S.archiveWorkspaces0919.values()].find(x=>!x.parentId);if(!ws)throw new Error('Aucune archive chargée');
 const root=rootWorkspace0919(ws),blob=await buildWorkspaceBlob0919(root),a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=split(root.sourceName||'archive.zip').stem+'_modifie.zip';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1800);toast('ZIP exporté : '+a.download);
}
async function ensureDir0919(root,parts){let d=root;for(const p of parts)d=await d.getDirectoryHandle(p,{create:true});return d}
async function extractArchiveFolder0919(){
 if(typeof showDirectoryPicker!=='function')throw new Error('Extraction directe vers dossier indisponible dans ce navigateur');
 const cur=current(),ws=cur?.archiveWorkspaceId0919?S.archiveWorkspaces0919.get(cur.archiveWorkspaceId0919):[...S.archiveWorkspaces0919.values()].find(x=>!x.parentId);if(!ws)throw new Error('Aucune archive chargée');
 const rootWs=rootWorkspace0919(ws),blob=await buildWorkspaceBlob0919(rootWs),zip=await JSZip.loadAsync(await blob.arrayBuffer()),dir=await showDirectoryPicker({id:'nlab-pdf-zip-extract',mode:'readwrite'});let count=0;
 for(const ent of Object.values(zip.files)){if(ent.dir)continue;const p=zipSafe0919(ent.name),parts=p.split('/'),name=parts.pop(),d=await ensureDir0919(dir,parts),h=await d.getFileHandle(name,{create:true}),w=await h.createWritable();await w.write(await ent.async('blob'));await w.close();count++}
 toast(count+' fichier(s) extraits dans '+dir.name);st('Archive extraite : '+count+' fichier(s).');
}
const saveClassic0919Base=saveClassic;
saveClassic=async function(){
 const cur=current();if(cur?.archiveWorkspaceId0919){const b=await finalPdfBytes(),name=/\.pdf$/i.test(cur.name)?cur.name:outName();await updateArchiveEntry0919(b,name);recordDocumentAction('Enregistrer dans ZIP',cur.archivePath0919);return b}
 return saveClassic0919Base();
};
const save0919Base=save;
save=async function(bytes,name=outName(),mime='application/pdf'){
 if(outputMode()==='same-source'&&current()?.archiveWorkspaceId0919){await updateArchiveEntry0919(bytes,name,mime);return}
 return save0919Base(bytes,name,mime);
};

function archiveStats0919(root){
 const all=[...S.archiveWorkspaces0919.values()].filter(w=>w.rootId===root.id),mod=all.reduce((n,w)=>n+w.modified.size,0),created=all.reduce((n,w)=>n+w.created.size,0);return{workspaces:all.length,modified:mod,created};
}
function renderArchivePanel0919(){
 const box=$z('archiveWorkspace0919');if(!box)return;const cur=current(),ws=cur?.archiveWorkspaceId0919?S.archiveWorkspaces0919.get(cur.archiveWorkspaceId0919):null,roots=[...S.archiveWorkspaces0919.values()].filter(x=>!x.parentId);
 if(!roots.length){box.hidden=true;return}box.hidden=false;const root=ws?rootWorkspace0919(ws):roots[0],stats=archiveStats0919(root);
 $z('archiveName0919').textContent=root.sourceName||'archive.zip';$z('archiveCurrent0919').textContent=cur?.archivePath0919?'Fichier dans archive : '+cur.archivePath0919:'Sélectionnez un fichier provenant de l’archive.';$z('archiveStats0919').textContent=stats.modified+' modifié(s) · '+stats.created+' ajouté(s) · '+stats.workspaces+' archive(s) incluant les ZIP imbriqués';
 $z('archiveUpdate0919').disabled=!cur?.archiveWorkspaceId0919||!S.pdfBytes;
}
function ensureArchiveUi0919(){
 if($z('archiveWorkspace0919')){renderArchivePanel0919();return}
 const note=document.querySelector('.zipSupportNote');if(!note)return;const box=document.createElement('div');box.id='archiveWorkspace0919';box.className='archiveWorkspace0919';box.hidden=true;
 box.innerHTML='<b>📦 Workspace archive ZIP</b><div><strong id="archiveName0919">archive.zip</strong><br><span id="archiveCurrent0919" class="hint"></span><br><span id="archiveStats0919" class="hint"></span></div><div class="row"><button id="archiveUpdate0919" type="button">Mettre à jour le fichier dans le ZIP</button><button id="archiveExportZip0919" type="button" class="primary">Exporter le ZIP modifié</button><button id="archiveExtract0919" type="button">Extraire vers un dossier</button></div><div class="hint">Tout reste local dans le navigateur. « Enregistrer » sur un PDF provenant du ZIP met à jour le workspace virtuel ; exportez ensuite le ZIP ou extrayez-le vers un dossier.</div>';
 note.after(box);$z('archiveUpdate0919').onclick=()=>run(async()=>updateArchiveEntry0919(await finalPdfBytes(),outName()),$z('archiveUpdate0919'));$z('archiveExportZip0919').onclick=()=>run(exportArchiveZip0919,$z('archiveExportZip0919'));$z('archiveExtract0919').onclick=()=>run(extractArchiveFolder0919,$z('archiveExtract0919'));renderArchivePanel0919();
}
const setCurrent0919Base=setCurrent;
setCurrent=function(i){const r=setCurrent0919Base(i);setTimeout(renderArchivePanel0919,0);return r};
function style0919(){if($z('archiveStyle0919'))return;const st=document.createElement('style');st.id='archiveStyle0919';st.textContent='.archiveWorkspace0919{margin-top:8px;padding:8px;border:1px solid #cabd85;background:#fffbea;border-radius:8px;font-size:10px;line-height:1.45}.archiveWorkspace0919>b{display:block;color:#6b5700;margin-bottom:5px}.archiveWorkspace0919 .row{margin-top:7px}';document.head.appendChild(st)}
function install0919(){style0919();ensureArchiveUi0919();renderArchivePanel0919()}
const mo=new MutationObserver(()=>setTimeout(install0919,0));if(document.body)mo.observe(document.body,{childList:true,subtree:true});
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(install0919,620),{once:true});else setTimeout(install0919,620);
})();