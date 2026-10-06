const REGISTRY=new Map();

const norm=s=>String(s??'').trim();
const contextSnapshot=()=>globalThis.NLABStudioContext?.get?.()||{selection:[],active:null,scope:'document',meta:{}};

export function registerCommand(def={}){
  const id=norm(def.id||def.action);
  const action=norm(def.action||def.id);
  if(!id||!action)throw new Error('Command id/action requis');
  const previous=REGISTRY.get(id)||{};
  const cmd={
    ...previous,
    ...def,
    id,
    action,
    label:norm(def.label||previous.label||action),
    shortLabel:norm(def.shortLabel||def.label||previous.shortLabel||previous.label||action),
    scope:norm(def.scope||previous.scope||'studio'),
    plugin:norm(def.plugin||previous.plugin||'studio-core'),
    studio:norm(def.studio||previous.studio||((typeof document!=='undefined'&&document.body?.dataset?.studio)||'studio')),
    status:norm(def.status||previous.status||'stable'),
    group:norm(def.group||previous.group||''),
    keywords:Array.isArray(def.keywords)?def.keywords:(previous.keywords||[]),
    shortcut:norm(def.shortcut||previous.shortcut||''),
    quickAction:def.quickAction!==false,
    priority:def.priority||previous.priority||'normal',
    enabled:def.enabled!==false
  };
  REGISTRY.set(id,cmd);
  return cmd;
}

export function unregisterCommand(id){return REGISTRY.delete(String(id))}
export function clearCommands(){REGISTRY.clear()}
export function getCommand(id){return REGISTRY.get(String(id))||null}
export function listCommands(){return [...REGISTRY.values()]}

export function commandForAction(action){
  const a=norm(action);
  return listCommands().find(x=>x.action===a)||null;
}

function requirementSatisfied(requirement,ctx){
  if(!requirement)return true;
  if(typeof requirement==='function')return requirement(ctx)!==false;
  if(typeof requirement==='string'){
    if(requirement==='selection')return Array.isArray(ctx.selection)&&ctx.selection.length>0;
    if(requirement==='single-selection')return Array.isArray(ctx.selection)&&ctx.selection.length===1;
    if(requirement==='multi-selection')return Array.isArray(ctx.selection)&&ctx.selection.length>1;
    if(requirement==='active')return !!ctx.active;
    return true;
  }
  if(Array.isArray(requirement))return requirement.every(x=>requirementSatisfied(x,ctx));
  if(typeof requirement==='object'){
    if(requirement.selectionMin!=null&&Number(ctx.selection?.length||0)<Number(requirement.selectionMin))return false;
    if(requirement.selectionMax!=null&&Number(ctx.selection?.length||0)>Number(requirement.selectionMax))return false;
    if(requirement.scope&&ctx.scope!==requirement.scope)return false;
    if(requirement.active===true&&!ctx.active)return false;
    if(requirement.active===false&&ctx.active)return false;
  }
  return true;
}

export function canExecuteCommand(commandOrId,ctx=contextSnapshot()){
  const cmd=typeof commandOrId==='string'?getCommand(commandOrId):commandOrId;
  if(!cmd||cmd.enabled===false)return false;
  return requirementSatisfied(cmd.when,ctx);
}

export function findCommands(query='',ctx=contextSnapshot(),{includeDisabled=true}={}){
  const q=norm(query).toLowerCase();
  return listCommands()
    .map(cmd=>({...cmd,available:canExecuteCommand(cmd,ctx)}))
    .filter(cmd=>includeDisabled||cmd.available)
    .filter(cmd=>!q||[
      cmd.id,cmd.action,cmd.label,cmd.shortLabel,cmd.scope,cmd.plugin,cmd.status,cmd.group,
      cmd.shortcut,...(cmd.keywords||[])
    ].join(' ').toLowerCase().includes(q))
    .sort((a,b)=>{
      const pa=a.priority==='primary'?0:a.priority==='secondary'?1:2;
      const pb=b.priority==='primary'?0:b.priority==='secondary'?1:2;
      return pa-pb||a.label.localeCompare(b.label,'fr');
    });
}

export async function executeCommand(commandOrId,{source='command-registry',context=contextSnapshot(),detail={}}={}){
  const cmd=typeof commandOrId==='string'?(getCommand(commandOrId)||commandForAction(commandOrId)):commandOrId;
  if(!cmd)throw new Error('Commande inconnue : '+String(commandOrId));
  if(!canExecuteCommand(cmd,context)){
    if(typeof document!=='undefined')document.dispatchEvent(new CustomEvent('studio-v2:command-blocked',{detail:{command:cmd,context,source}}));
    return{ok:false,reason:'disabled',command:cmd};
  }
  const payload={action:cmd.action,commandId:cmd.id,command:cmd,context,source,...detail};
  if(typeof document!=='undefined')document.dispatchEvent(new CustomEvent('studio-v2:before-command',{detail:payload}));
  let result;
  if(typeof cmd.handler==='function')result=await cmd.handler(payload);
  else if(typeof document!=='undefined')document.dispatchEvent(new CustomEvent('studio-v2:action',{detail:payload}));
  if(typeof document!=='undefined')document.dispatchEvent(new CustomEvent('studio-v2:command-executed',{detail:{...payload,result}}));
  return{ok:true,command:cmd,result};
}

export function registerManifestCommands(manifest={}){
  for(const group of manifest.ribbon||[])for(const item of group.items||[]){
    const id=item.capability||item.commandId||item.featureId||item.id||item.action;
    if(!id)continue;
    registerCommand({
      id,
      action:item.action||item.id||id,
      label:item.label||item.action||id,
      shortLabel:item.shortLabel||item.label||item.action||id,
      icon:item.icon||null,
      scope:item.scope||group.scope||'studio',
      plugin:item.plugin||manifest.id||'studio',
      studio:manifest.id||'studio',
      status:item.status||'stable',
      group:group.id||'',
      shortcut:item.shortcut||'',
      keywords:item.keywords||[],
      when:item.when||null,
      priority:item.primary?'primary':(item.priority||'normal'),
      quickAction:item.quickAction!==false,
      advancedStudio:item.advancedStudio||null,
      sourceRef:item.sourceRef||null,
      testRef:item.testRef||null
    });
  }
  for(const cmd of manifest.commands||[])registerCommand({...cmd,studio:cmd.studio||manifest.id||'studio'});
  return listCommands();
}

export const StudioCommands=Object.freeze({
  register:registerCommand,
  unregister:unregisterCommand,
  clear:clearCommands,
  get:getCommand,
  list:listCommands,
  find:findCommands,
  canExecute:canExecuteCommand,
  execute:executeCommand,
  registerManifest:registerManifestCommands
});
if(typeof window!=='undefined')window.NLABStudioCommands=StudioCommands;
