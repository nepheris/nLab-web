(()=>{'use strict';
if(window.__NLAB_0921_ARCHIVE_WORKSPACE__)return;
window.__NLAB_0921_ARCHIVE_WORKSPACE__=true;
const $z=id=>document.getElementById(id),Archive0921=window.NLAB_ARCHIVE_WORKSPACE;
if(!Archive0921)throw new Error('Brique commune NLAB_ARCHIVE_WORKSPACE non chargée');
const ZIP_LIMITS0921={...Archive0921.DEFAULT_LIMITS,maxDepth:3};
S.archiveWorkspaces0921=S.archiveWorkspaces0921||new Map();

function zipId0921(){return 'zip-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,8)}
async function expandZip0921(item,depth=0,budget={entries:0,bytes:0}){
 if(depth>ZIP_LIMITS0921.maxDepth)throw new Error('ZIP imbriqué trop profondément : '+item.name);
 const core=await Archive0921.open(item.file,{limits:ZIP_LIMITS0921,budget});
 const id=zipId0921(),parentId=item._archiveParentWorkspaceId||'',rootId=item._archiveRootId||id;
 const ws={id,rootId,parentId,parentEntryPath:item._archiveParentPath||'',sourceName:item.name,sourceFile:item.file,sourceHandle:item.handle||null,core,children:new Set(),modified:new Set(),created:new Set()};
 S.archiveWorkspaces0921.set(id,ws);if(parentId)S.archiveWorkspaces0921.get(parentId)?.children.add(id);
 const out=[];
 for(const entry of core.entries.values()){
  const p=entry.path,blob=entry.blob,name=p.split('/').pop(),file=new File([blob],name,{type:mimeFromName(name)}),rel=(item.relativePath||item.name)+'/'+p;
  if(/\.zip$/i.test(name))out.push(...await expandZip0921({file,name,relativePath:rel,_archiveParentWorkspaceId:id,_archiveParentPath:p,_archiveRootId:rootId},depth+1,budget));
  else out.push({file,name,relativePath:rel,fromArchive:item.name,archiveWorkspaceId0921:id,archiveRootId0921:rootId,archivePath0921:p,archiveDepth:depth+1});
 }
 return out;
}
expandZipItem=expandZip0921;

function rootWorkspace0921(ws){let x=ws;while(x?.parentId)x=S.archiveWorkspaces0921.get(x.parentId);return x}
async function buildWorkspaceBlob0921(ws){
 for(const childId of ws.children){const child=S.archiveWorkspaces0921.get(childId);if(!child)continue;Archive0921.replace(ws.core,child.parentEntryPath,await buildWorkspaceBlob0921(child))}
 return Archive0921.build(ws.core);
}
async function updateArchiveEntry0921(bytes,name,mime='application/pdf'){
 const cur=current();if(!cur?.archiveWorkspaceId0921)throw new Error('Le fichier courant ne provient pas d’une archive ZIP');
 const ws=S.archiveWorkspaces0921.get(cur.archiveWorkspaceId0921);if(!ws)throw new Error('Workspace ZIP introuvable');
 const old=cur.archivePath0921,parts=old.split('/'),oldName=parts.pop(),dir=parts.length?parts.join('/')+'/':'';
 const target=/\.pdf$/i.test(oldName)?(name&&/\.pdf$/i.test(name)?dir+name:old):(dir+(String(name||oldName).replace(/\.[^.]+$/,'')+'.pdf'));
 const safe=Archive0921.sanitize(target),blob=new Blob([bytes],{type:mime});
 Archive0921.replace(ws.core,safe,blob);ws.modified.add(safe);if(safe!==old)ws.created.add(safe);
 cur.archivePath0921=safe;cur.name=safe.split('/').pop();cur.file=new File([blob],cur.name,{type:mime});cur.relativePath=(rootWorkspace0921(ws).sourceName||'archive.zip')+'/'+safe;
 queue();renderArchivePanel0921();toast('Archive virtuelle mise à jour : '+safe);return safe;
}
async function exportArchiveZip0921(){
 const cur=current(),ws=cur?.archiveWorkspaceId0921?S.archiveWorkspaces0921.get(cur.archiveWorkspaceId0921):[...S.archiveWorkspaces0921.values()].find(x=>!x.parentId);if(!ws)throw new Error('Aucune archive chargée');
 const root=rootWorkspace0921(ws),blob=await buildWorkspaceBlob0921(root),a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=split(root.sourceName||'archive.zip').stem+'_modifie.zip';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1800);toast('ZIP exporté : '+a.download);
}
async function extractArchiveFolder0921(){
 if(typeof showDirectoryPicker!=='function')throw new Error('Extraction directe vers dossier indisponible dans ce navigateur');
 const cur=current(),ws=cur?.archiveWorkspaceId0921?S.archiveWorkspaces0921.get(cur.archiveWorkspaceId0921):[...S.archiveWorkspaces0921.values()].find(x=>!x.parentId);if(!ws)throw new Error('Aucune archive chargée');
 const rootWs=rootWorkspace0921(ws),blob=await buildWorkspaceBlob0921(rootWs),rebuilt=new File([blob],rootWs.sourceName||'archive.zip',{type:'application/zip'}),flat=await Archive0921.open(rebuilt),dir=await showDirectoryPicker({id:'nlab-pdf-zip-extract',mode:'readwrite'}),count=await Archive0921.extract(flat,dir);
 toast(count+' fichier(s) extraits dans '+dir.name);st('Archive extraite : '+count+' fichier(s).');
}
const saveClassic0921Base=saveClassic;
saveClassic=async function(){
 const cur=current();if(cur?.archiveWorkspaceId0921){const b=await finalPdfBytes(),name=/\.pdf$/i.test(cur.name)?cur.name:outName();await updateArchiveEntry0921(b,name);recordDocumentAction('Enregistrer dans ZIP',cur.archivePath0921);return b}
 return saveClassic0921Base();
};
const save0921Base=save;
save=async function(bytes,name=outName(),mime='application/pdf'){
 if(outputMode()==='same-source'&&current()?.archiveWorkspaceId0921){await updateArchiveEntry0921(bytes,name,mime);return}
 return save0921Base(bytes,name,mime);
};

function archiveStats0921(root){
 const all=[...S.archiveWorkspaces0921.values()].filter(w=>w.rootId===root.id),mod=all.reduce((n,w)=>n+w.modified.size,0),created=all.reduce((n,w)=>n+w.created.size,0);return{workspaces:all.length,modified:mod,created};
}
function renderArchivePanel0921(){
 const box=$z('archiveWorkspace0921');if(!box)return;const cur=current(),ws=cur?.archiveWorkspaceId0921?S.archiveWorkspaces0921.get(cur.archiveWorkspaceId0921):null,roots=[...S.archiveWorkspaces0921.values()].filter(x=>!x.parentId);
 if(!roots.length){box.hidden=true;return}box.hidden=false;const root=ws?rootWorkspace0921(ws):roots[0],stats=archiveStats0921(root);
 $z('archiveName0921').textContent=root.sourceName||'archive.zip';$z('archiveCurrent0921').textContent=cur?.archivePath0921?'Fichier dans archive : '+cur.archivePath0921:'Sélectionnez un fichier provenant de l’archive.';$z('archiveStats0921').textContent=stats.modified+' modifié(s) · '+stats.created+' ajouté(s) · '+stats.workspaces+' archive(s) incluant les ZIP imbriqués';
 $z('archiveUpdate0921').disabled=!cur?.archiveWorkspaceId0921||!S.pdfBytes;
}
function ensureArchiveUi0921(){
 if($z('archiveWorkspace0921')){renderArchivePanel0921();return}
 const note=document.querySelector('.zipSupportNote');if(!note)return;const box=document.createElement('div');box.id='archiveWorkspace0921';box.className='archiveWorkspace0921';box.hidden=true;
 box.innerHTML='<b>📦 Workspace archive ZIP</b><div><strong id="archiveName0921">archive.zip</strong><br><span id="archiveCurrent0921" class="hint"></span><br><span id="archiveStats0921" class="hint"></span></div><div class="row"><button id="archiveUpdate0921" type="button">Mettre à jour le fichier dans le ZIP</button><button id="archiveExportZip0921" type="button" class="primary">Exporter le ZIP modifié</button><button id="archiveExtract0921" type="button">Extraire vers un dossier</button></div><div class="hint">Tout reste local dans le navigateur. « Enregistrer » sur un PDF provenant du ZIP met à jour le workspace virtuel ; exportez ensuite le ZIP ou extrayez-le vers un dossier.</div>';
 note.after(box);$z('archiveUpdate0921').onclick=()=>run(async()=>updateArchiveEntry0921(await finalPdfBytes(),outName()),$z('archiveUpdate0921'));$z('archiveExportZip0921').onclick=()=>run(exportArchiveZip0921,$z('archiveExportZip0921'));$z('archiveExtract0921').onclick=()=>run(extractArchiveFolder0921,$z('archiveExtract0921'));renderArchivePanel0921();
}
const setCurrent0921Base=setCurrent;
setCurrent=function(i){const r=setCurrent0921Base(i);setTimeout(renderArchivePanel0921,0);return r};
function style0921(){if($z('archiveStyle0921'))return;const st=document.createElement('style');st.id='archiveStyle0921';st.textContent='.archiveWorkspace0921{margin-top:8px;padding:8px;border:1px solid #cabd85;background:#fffbea;border-radius:8px;font-size:10px;line-height:1.45}.archiveWorkspace0921>b{display:block;color:#6b5700;margin-bottom:5px}.archiveWorkspace0921 .row{margin-top:7px}';document.head.appendChild(st)}
function install0921(){style0921();ensureArchiveUi0921();renderArchivePanel0921()}
const mo=new MutationObserver(()=>setTimeout(install0921,0));if(document.body)mo.observe(document.body,{childList:true,subtree:true});
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(install0921,620),{once:true});else setTimeout(install0921,620);
})();