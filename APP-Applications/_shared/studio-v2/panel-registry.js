const registry=new Map();

export function registerCorePanel(def={}){
  const key=String(def.key||'').trim();
  if(!key)throw new Error('Core panel key requis');
  const normalized={
    key,
    title:def.title||key,
    selector:def.selector||null,
    priority:def.priority||'normal',
    defaultMode:def.defaultMode||'free',
    restorable:def.restorable!==false,
    escapeCloses:def.escapeCloses!==false,
    capabilities:{
      move:def.capabilities?.move!==false,
      resize:def.capabilities?.resize!==false,
      collapse:def.capabilities?.collapse!==false,
      lock:def.capabilities?.lock!==false,
      dock:def.capabilities?.dock!==false,
      scrollX:def.capabilities?.scrollX!==false,
      scrollY:def.capabilities?.scrollY!==false,
      hide:def.capabilities?.hide!==false,
      ...(def.capabilities||{})
    }
  };
  registry.set(key,normalized);
  return normalized;
}

export function getCorePanel(key){return registry.get(String(key))||null}
export function listCorePanels(){return [...registry.values()]}
export function clearCorePanelRegistry(){registry.clear()}

export function resolveCorePanelElement(key,root=document){
  const def=getCorePanel(key);
  if(!def?.selector)return null;
  return root.querySelector(def.selector);
}
