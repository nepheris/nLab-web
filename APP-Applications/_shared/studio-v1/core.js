export const qs=(s,r=document)=>r.querySelector(s);
export const qsa=(s,r=document)=>[...r.querySelectorAll(s)];
export const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
export const uid=(p='id')=>p+'-'+(crypto.randomUUID?.()||Date.now()+'-'+Math.random().toString(36).slice(2));
export const sleep=ms=>new Promise(r=>setTimeout(r,ms));
export function formatBytes(n=0){if(!n)return'0 B';const u=['B','KB','MB','GB'],i=Math.min(u.length-1,Math.floor(Math.log(n)/Math.log(1024)));return(n/1024**i).toFixed(i?1:0)+' '+u[i]}
export function today(){return new Date().toISOString().slice(0,10)}
export function downloadBlob(blob,name){const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1800)}
export function fileStem(name='document.pdf'){return name.replace(/\.[^.]+$/,'')}
export function safeName(s='document'){return String(s).normalize('NFKD').replace(/[<>:"/\\|?*\x00-\x1F]/g,'_').replace(/\s+/g,' ').trim()||'document'}
export function toast(message,ms=2600){const el=qs('#studioToast');if(!el)return;el.textContent=message;el.classList.add('show');clearTimeout(el._t);el._t=setTimeout(()=>el.classList.remove('show'),ms)}
export function setStatus(message){const el=qs('#studioStatusText');if(el)el.textContent=message}
export function bindSidebar({main='#studioMain',sidebar='#studioSidebar',resizer='#sidebarResizer',hide='#sidebarHide',compact='#sidebarCompact',normal='#sidebarNormal',restore='#sidebarRestore'}={}){
 const m=qs(main),s=qs(sidebar),g=qs(resizer);if(!m||!s)return;
 const key='nlab-studio-v1-sidebar-width';const applyWidth=w=>{w=clamp(Number(w)||390,280,760);document.documentElement.style.setProperty('--studio-sidebar-width',w+'px');localStorage.setItem(key,String(w))};
 applyWidth(localStorage.getItem(key)||390);
 qs(hide)?.addEventListener('click',()=>{m.classList.add('sidebarHidden');m.classList.remove('sidebarCompact');qs(restore)?.removeAttribute('hidden')});
 qs(compact)?.addEventListener('click',()=>{m.classList.remove('sidebarHidden');m.classList.add('sidebarCompact');qs(restore)?.removeAttribute('hidden')});
 const full=()=>{m.classList.remove('sidebarHidden','sidebarCompact');qs(restore)?.setAttribute('hidden','')};qs(normal)?.addEventListener('click',full);qs(restore)?.addEventListener('click',full);
 if(g){
  let dragging=false;
  const start=(e,kind)=>{if(dragging)return;dragging=true;e.preventDefault();full();const x=e.clientX,w=s.getBoundingClientRect().width;g.classList.add('dragging');if(kind==='pointer')g.setPointerCapture?.(e.pointerId);
   const move=ev=>applyWidth(w+ev.clientX-x),up=()=>{dragging=false;g.classList.remove('dragging');window.removeEventListener(kind+'move',move);window.removeEventListener(kind+'up',up);if(kind==='pointer')window.removeEventListener('pointercancel',up)};
   window.addEventListener(kind+'move',move);window.addEventListener(kind+'up',up,{once:true});if(kind==='pointer')window.addEventListener('pointercancel',up,{once:true})
  };
  g.addEventListener('pointerdown',e=>{if(e.pointerType==='mouse')return;start(e,'pointer')});g.addEventListener('mousedown',e=>start(e,'mouse'))
 }
}
export function bindSectionControls({expand='#sidebarExpandAll',collapse='#sidebarCollapseAll',root='#studioSidebar'}={}){
 qs(expand)?.addEventListener('click',()=>qsa('details.sidebarSection',qs(root)).forEach(x=>x.open=true));
 qs(collapse)?.addEventListener('click',()=>qsa('details.sidebarSection',qs(root)).forEach(x=>x.open=false));
}
export function jsonDownload(data,name='config.json'){downloadBlob(new Blob([JSON.stringify(data,null,2)],{type:'application/json'}),name)}
export async function readJsonFile(file){return JSON.parse(await file.text())}
export function wireMenuTabs(){qsa('.studioMenu button[data-tab]').forEach(b=>b.addEventListener('click',()=>{qsa('.studioMenu button[data-tab]').forEach(x=>x.classList.toggle('active',x===b));document.dispatchEvent(new CustomEvent('studio:menu',{detail:{tab:b.dataset.tab}}))}))}
