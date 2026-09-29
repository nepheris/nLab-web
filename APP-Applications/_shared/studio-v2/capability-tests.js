import{listCapabilities}from'./capability-registry.js';
export function runCapabilitySelfTests({manifest,root=document}={}){
  const results=[];const caps=listCapabilities(),seen=new Set();
  for(const c of caps){
    const issues=[];
    if(!c.id)issues.push('missing capability id');
    if(!c.action)issues.push('missing action');
    if(!c.label)issues.push('missing label');
    if(seen.has(c.featureId))issues.push('duplicate featureId');seen.add(c.featureId);
    const actionEl=root.querySelector('[data-studio-action="'+CSS.escape(c.action)+'"]');
    if(!actionEl&&c.quickAction)issues.push('no visible action control');
    results.push({capability:c.id,featureId:c.featureId,status:issues.length?'PARTIAL':'PASS',issues});
  }
  const sections=[...(root.querySelectorAll('#sidebar-pane-tools details[id]')||[])].map(x=>x.id);
  return{timestamp:new Date().toISOString(),manifest:manifest?.id||'',capabilities:results,sections,summary:{total:results.length,pass:results.filter(x=>x.status==='PASS').length,partial:results.filter(x=>x.status!=='PASS').length}};
}
