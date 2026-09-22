(()=>{"use strict";
if(window.__NLAB_DEBUG_0913__)return;
window.__NLAB_DEBUG_0913__=true;
const VERSION="Alpha 0.9.13 TEST / RC";
const DEBUG=[];
const MAX=180;
const now=()=>new Date().toISOString();
function scrub(v){
  let s=String(v??"");
  s=s.replace(/data:[^\s]+/gi,"data:[redacted]")
     .replace(/blob:[^\s]+/gi,"blob:[redacted]")
     .replace(/(access_token|id_token|refresh_token|client_secret|password|passwd|token)=([^&\s]+)/gi,"$1=[redacted]")
     .replace(/[A-Z]:\\[^\s]+/g,"[local-path]")
     .replace(/\/(Users|home)\/[^\s]+/g,"/[local-path]")
     .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi,"[email]");
  return s.length>900?s.slice(0,900)+"…":s;
}
function log(type,...args){
  DEBUG.push({t:now(),type,msg:scrub(args.map(x=>x instanceof Error?(x.stack||x.message):typeof x==="object"?(()=>{try{return JSON.stringify(x)}catch{return String(x)}})():x).join(" "))});
  if(DEBUG.length>MAX)DEBUG.splice(0,DEBUG.length-MAX);
}
window.__NLAB_DEBUG_LOG__=DEBUG;
log("boot",VERSION,location.pathname);

window.addEventListener("error",e=>log("window.error",e.message,e.filename?new URL(e.filename,location.href).pathname:"",e.lineno||""));
window.addEventListener("unhandledrejection",e=>log("promise.reject",e.reason instanceof Error?(e.reason.stack||e.reason.message):e.reason));

if(!window.__NLAB_FETCH_DEBUG_WRAPPED__){
  window.__NLAB_FETCH_DEBUG_WRAPPED__=true;
  const rawFetch=window.fetch.bind(window);
  window.fetch=async function(input,init){
    const raw=typeof input==="string"?input:(input&&input.url)||"";
    let url=raw;
    try{const u=new URL(raw,location.href);u.search="";u.hash="";url=u.href}catch{}
    const t0=performance.now();
    try{
      const r=await rawFetch(input,init);
      log(r.ok?"fetch.ok":"fetch.http",r.status,Math.round(performance.now()-t0)+"ms",url);
      return r;
    }catch(e){
      log("fetch.error",Math.round(performance.now()-t0)+"ms",url,e);
      throw e;
    }
  };
}

const oldErr=console.error.bind(console),oldWarn=console.warn.bind(console);
console.error=(...a)=>{log("console.error",...a);oldErr(...a)};
console.warn=(...a)=>{log("console.warn",...a);oldWarn(...a)};

function extStats(){
  try{
    if(typeof S==="undefined"||!Array.isArray(S.files))return {};
    const out={};
    for(const x of S.files){
      const n=String(x?.name||x?.file?.name||"");
      const m=n.match(/\.([a-z0-9]+)$/i),k=m?m[1].toLowerCase():"sans-ext";
      out[k]=(out[k]||0)+1;
    }
    return out;
  }catch{return {}}
}
function feature(name){try{return typeof window[name]!=="undefined"}catch{return false}}
function report(){
  let app={};
  try{
    if(typeof S!=="undefined"){
      app={
        tool:S.tool||null,
        files:Array.isArray(S.files)?S.files.length:0,
        extensions:extStats(),
        index:Number.isFinite(S.index)?S.index:null,
        page:Number.isFinite(S.page)?S.page:null,
        pages:Number.isFinite(S.pageCount)?S.pageCount:null,
        editorTool:S.editorTool||null,
        signedLocked:!!S.signedLock
      };
    }
  }catch(e){app={stateError:scrub(e.message)}}
  const ids=["status","documentStatus","compatBadge","sourceStatus","destinationStatus","googleDriveState"];
  const ui={};
  for(const id of ids){
    const el=document.getElementById(id);
    if(el){
      let v=(el.textContent||"").trim();
      if(id==="sourceStatus"||id==="destinationStatus")v=v.replace(/([A-Za-z0-9_. -]+\.(pdf|docx|png|jpe?g|webp|gif|bmp|zip))/gi,"[file]");
      ui[id]=scrub(v);
    }
  }
  const obj={
    schema:"nlab-debug/v1",
    generated:now(),
    version:VERSION,
    url:location.origin+location.pathname,
    userAgent:navigator.userAgent,
    language:navigator.language,
    online:navigator.onLine,
    secureContext:window.isSecureContext,
    viewport:{w:innerWidth,h:innerHeight,dpr:devicePixelRatio},
    features:{
      PDFLib:feature("PDFLib"),pdfjsLib:feature("pdfjsLib"),JSZip:feature("JSZip"),
      mammoth:feature("mammoth"),qrcode:feature("qrcode"),Tesseract:feature("Tesseract"),
      SignaturePad:feature("SignaturePad"),forge:feature("forge"),
      zgapdfsigner:feature("zgapdfsigner"),bwipjs:feature("bwipjs"),
      clipboard:!!navigator.clipboard,showDirectoryPicker:typeof showDirectoryPicker==="function"
    },
    google:{
      clientIdConfigured:!!window.NLAB_GOOGLE_DRIVE_CONFIG?.clientId,
      scope:window.NLAB_GOOGLE_DRIVE_CONFIG?.scope||null
    },
    app,ui,
    privacy:"Rapport sanitise : aucun contenu de document, signature, certificat, mot de passe, token OAuth ou chemin local complet.",
    log:DEBUG.slice(-120)
  };
  return "=== nLab PDF Studio DEBUG ===\n"+JSON.stringify(obj,null,2);
}
async function copyReport(){
  const txt=report();
  try{
    if(navigator.clipboard?.writeText)await navigator.clipboard.writeText(txt);
    else{
      const t=document.createElement("textarea");t.value=txt;t.style.position="fixed";t.style.opacity="0";document.body.appendChild(t);t.select();document.execCommand("copy");t.remove();
    }
    log("debug","report copied");
    if(typeof toast==="function")toast("Debug copié dans le presse-papiers");
    else alert("Debug copié dans le presse-papiers.");
  }catch(e){
    log("debug.error",e);
    prompt("Copiez le rapport debug :",txt);
  }
}
window.nLabDebugReport=report;
window.nLabCopyDebug=copyReport;

function mimeFor(name){
  const n=String(name).toLowerCase();
  if(n.endsWith(".pdf"))return"application/pdf";
  if(n.endsWith(".png"))return"image/png";
  if(n.endsWith(".jpg")||n.endsWith(".jpeg"))return"image/jpeg";
  if(n.endsWith(".webp"))return"image/webp";
  if(n.endsWith(".gif"))return"image/gif";
  if(n.endsWith(".bmp"))return"image/bmp";
  if(n.endsWith(".docx"))return"application/vnd.openxmlformats-officedocument.wordprocessingml.document";
  if(n.endsWith(".zip"))return"application/zip";
  return"application/octet-stream";
}
async function loadDemoDirect0913(){
  const manifestUrl="../../Library/demo/demo-manifest.json";
  log("demo.start",manifestUrl);
  if(typeof st==="function")st("Chargement de la démo v2…");
  const mr=await fetch(manifestUrl,{cache:"no-store"});
  if(!mr.ok)throw new Error("Manifest démo inaccessible : HTTP "+mr.status);
  const m=await mr.json();
  const urls=Array.isArray(m.files)?m.files:[];
  if(!urls.length){
    log("demo.fallback","direct file list unavailable; ZIP fallback");
    if(typeof window.nLabLoadDemoCorpusV2==="function")return window.nLabLoadDemoCorpusV2();
    throw new Error("Aucun fichier direct dans le manifest et chargeur ZIP indisponible.");
  }
  const items=[];
  let ok=0;
  for(const url of urls){
    try{
      const r=await fetch(url,{cache:"no-store"});
      if(!r.ok)throw new Error("HTTP "+r.status);
      const b=await r.blob();
      const clean=String(url).split("?")[0].split("#")[0];
      const name=decodeURIComponent(clean.split("/").pop());
      const rel=decodeURIComponent((clean.split("/files/")[1]||name).replace(/^demo-input\//,""));
      items.push({file:new File([b],name,{type:b.type||mimeFor(name),lastModified:Date.now()}),name,relativePath:rel});
      ok++;
    }catch(e){log("demo.file.error",url,e.message)}
  }
  if(!items.length){
    log("demo.fallback","direct downloads all failed; trying ZIP archive");
    try{
      if(typeof JSZip==="undefined")throw new Error("JSZip indisponible");
      const archiveUrl=new URL(String(m.archive||"../../Library/demo/nLab-DEMO-CORPUS-v2.zip"),location.href).href;
      const zr=await fetch(archiveUrl,{cache:"no-store"});
      if(!zr.ok)throw new Error("ZIP HTTP "+zr.status);
      const zip=await JSZip.loadAsync(await zr.arrayBuffer());
      const root=String(m.loadRoot||"demo-input/").replace(/^\\/+|\\/+$/g,"")+"/";
      const compat=/\\.(pdf|png|jpe?g|webp|gif|bmp|docx|zip)$/i;
      for(const entry of Object.values(zip.files)){
        if(entry.dir)continue;
        const p=String(entry.name||"").replace(/\\\\/g,"/").replace(/^\\/+/, "");
        if(!p.startsWith(root)||!compat.test(p))continue;
        const data=await entry.async("uint8array");
        const name=p.split("/").pop();
        items.push({file:new File([data],name,{type:mimeFor(name),lastModified:Date.now()}),name,relativePath:p.slice(root.length)});
      }
      log("demo.fallback.ok","ZIP loaded",items.length,"files");
    }catch(e){
      log("demo.fallback.error",e);
      throw new Error("Démo inaccessible : fichiers directs et ZIP ont échoué. Cliquez sur Debug pour copier le diagnostic.");
    }
  }
  if(typeof S==="undefined"||typeof afterFiles!=="function")throw new Error("Moteur PDF Studio non initialisé.");
  S.source=null;S.fallbackAll=[];S.files=items;
  if(typeof sourceInfo==="function")sourceInfo("nLab DEMO CORPUS v2","GitHub Pages · chargement direct");
  const output=document.getElementById("outputMode");
  if(output){output.value="download";output.dispatchEvent(new Event("change",{bubbles:true}))}
  S.dest=null;
  await afterFiles();
  const src=document.getElementById("sourceStatus");
  if(src)src.textContent="Démo v2 : "+items.length+" fichier(s) chargés directement sur "+(m.fileCount||"?")+" du corpus.";
  log("demo.ready","loaded",ok,"of",urls.length);
  if(typeof st==="function")st("Démo v2 prête.");
  if(typeof toast==="function")toast("Démo v2 chargée · "+items.length+" fichiers");
}
window.nLabLoadDemoDirect0913=loadDemoDirect0913;

function install(){
  document.title="nLab PDF Studio — Alpha 0.9.13 TEST";
  document.querySelectorAll(".buildBadge strong").forEach(x=>x.textContent="Alpha 0.9.13 TEST");
  document.querySelectorAll(".demoChip").forEach(x=>x.textContent=(x.textContent||"").replace(/Alpha 0\.9\.12/g,"Alpha 0.9.13 TEST"));
  const foot=document.querySelector("footer .footerInfo span");
  if(foot)foot.textContent=(foot.textContent||"").replace(/Alpha 0\.9\.12/g,"Alpha 0.9.13 TEST");
  const meta=document.querySelector(".headerMeta");
  if(meta&&!document.getElementById("nlabDebugCopy")){
    const b=document.createElement("button");b.id="nlabDebugCopy";b.type="button";b.innerHTML="🐞 <span>Debug</span>";b.title="Copier un rapport de debug sanitise dans le presse-papiers";b.style.cssText="padding:7px 10px;border:1px solid #d39a35;background:#fff8dd;color:#6f5200;border-radius:8px;font-weight:800";
    b.onclick=copyReport;meta.appendChild(b);
  }
  const demo=document.getElementById("loadDemoPreset");
  if(demo){
    demo.textContent="Charger la démo v2";
    demo.title="Charge directement les fichiers publics du corpus; le ZIP sert de secours.";
    demo.onclick=async e=>{
      e.preventDefault();
      const btn=e.currentTarget;btn.disabled=true;
      try{await loadDemoDirect0913()}
      catch(err){
        log("demo.error",err);
        if(typeof st==="function")st("Erreur démo : "+err.message+" · utilisez Debug");
        if(typeof toast==="function")toast("Échec démo · cliquez sur Debug");
      }finally{btn.disabled=false}
    };
  }
  const box=demo?.parentElement?.parentElement;
  if(box&&!document.getElementById("nlabDemoDebugCopy")){
    const db=document.createElement("button");db.id="nlabDemoDebugCopy";db.type="button";db.textContent="🐞 Copier le debug";
    db.title="Copie le diagnostic technique sanitizé : version, navigateur, erreurs et requêtes réseau, sans contenu du document.";
    db.style.cssText="display:flex;justify-content:center;width:100%;margin-top:6px;padding:7px;border:1px solid #d39a35;border-radius:7px;background:#fff8dd;color:#6f5200;font-size:12px;font-weight:800";
    db.onclick=copyReport;box.appendChild(db);
  }
  if(box&&!document.getElementById("nlabDemoGalleryLink")){
    const a=document.createElement("a");a.id="nlabDemoGalleryLink";a.href="../../Library/demo/";a.target="_blank";a.rel="noopener";a.textContent="🖼 Voir la galerie de démo";a.style.cssText="display:flex;justify-content:center;margin-top:6px;padding:7px;border:1px solid #b8c6d1;border-radius:7px;text-decoration:none;font-size:12px;font-weight:700;background:#fff";box.appendChild(a);
  }
  log("ui","debug installed");
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",()=>setTimeout(install,100),{once:true});else setTimeout(install,100);
})();