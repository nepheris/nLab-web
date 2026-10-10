/* nLab hierarchical collapsible headings for documentation.
   Opt in on a container: data-nlab-fold-headings="h1,h2,h3".
   Groups siblings under their nearest preceding heading; native details ensure keyboard access. */
(()=>{'use strict';
function init(root){
 if(root.dataset.nlabFoldReady)return;root.dataset.nlabFoldReady='1';
 const selector=root.dataset.nlabFoldHeadings||'h1,h2,h3';
 const headings=[...root.querySelectorAll(selector)].filter(h=>h.closest('[data-nlab-fold-headings]')===root);
 // Process from bottom upward so nested sections are preserved.
 for(let i=headings.length-1;i>=0;i--){
  const h=headings[i],level=Number(h.tagName.substring(1));if(!h.parentElement||h.closest('details.nlab-heading-fold'))continue;
  const detail=document.createElement('details');detail.className='nlab-heading-fold';detail.open=true;detail.dataset.level=String(level);
  const summary=document.createElement('summary');summary.className='nlab-heading-summary';
  h.before(detail);detail.append(summary);summary.append(h);
  // Move all subsequent sibling nodes until a heading at the same or higher level,
  // including previously wrapped lower-level details.
  while(detail.nextSibling){
   const el=detail.nextSibling;
   if(el.nodeType===1){
    const heading=el.matches?.(selector)?el:el.matches?.('details.nlab-heading-fold')?el.querySelector(':scope > summary > h1,:scope > summary > h2,:scope > summary > h3'):null;
    if(heading && Number(heading.tagName.substring(1))<=level)break;
   }
   detail.append(el);
  }
 }
}
function boot(){document.querySelectorAll('[data-nlab-fold-headings]').forEach(init)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
window.NLabFoldHeadings={init,boot};
})();
