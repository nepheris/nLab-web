/* nLab Mermaid renderer facade. v1 — safe rendering for trusted site-authored diagrams.
   Usage: <pre data-nlab-mermaid>flowchart TD ...</pre>, module script. */
const SRC='https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.esm.min.mjs';
let loading=null;
const esc=s=>String(s??'');
export async function renderMermaid(root=document){
 const nodes=[...root.querySelectorAll('pre[data-nlab-mermaid]')];if(!nodes.length)return{count:0};
 loading??=import(SRC);const {default:mermaid}=await loading;
 mermaid.initialize({startOnLoad:false,securityLevel:'strict',theme:document.documentElement.dataset.theme==='dark'?'dark':'default'});
 let success=0;
 for(const node of nodes){const src=esc(node.textContent).trim();const host=node.previousElementSibling?.classList.contains('nlab-mermaid-render')?node.previousElementSibling:document.createElement('div');host.className='nlab-mermaid-render';if(!host.isConnected)node.before(host);try{const r=await mermaid.render('nlab-svg-'+Math.random().toString(36).slice(2),src);host.innerHTML=r.svg;node.hidden=true;success++}catch(e){host.textContent='Diagramme indisponible — code source affiché';node.hidden=false}}
 return{count:nodes.length,success};
}
export function observeMermaid(root=document){let running=false;const update=async()=>{if(running)return;running=true;try{await renderMermaid(root)}catch(e){console.warn('Mermaid not available',e)}finally{running=false}};update();new MutationObserver(update).observe(document.documentElement,{attributes:true,attributeFilter:['data-theme']});}
