const REG=new Map();
export function registerCapabilities(manifest={}){
  for(const group of manifest.ribbon||[])for(const item of group.items||[]){
    const id=item.capability||item.featureId||item.id||item.action;if(!id)continue;
    REG.set(id,{id,featureId:item.featureId||item.id||item.action||id,action:item.action||item.id||id,label:item.label||item.action||id,shortLabel:item.shortLabel||item.label||item.action||id,icon:item.icon||null,scope:item.scope||group.scope||'studio',plugin:item.plugin||manifest.id||'studio',studio:manifest.id||'studio',status:item.status||'stable',help:item.help||{},quickAction:item.quickAction!==false,advancedStudio:item.advancedStudio||null,sourceRef:item.sourceRef||null,testRef:item.testRef||null,group:group.id||''});
  }
  return listCapabilities();
}
export const listCapabilities=()=>[...REG.values()];
export const getCapability=id=>REG.get(id)||null;
export const capabilityForAction=action=>listCapabilities().find(x=>x.action===action)||null;
export function findCapabilities(query=''){const q=String(query).trim().toLowerCase();return listCapabilities().filter(x=>!q||[x.id,x.featureId,x.action,x.label,x.shortLabel,x.scope,x.plugin,x.status,x.group].join(' ').toLowerCase().includes(q))}
