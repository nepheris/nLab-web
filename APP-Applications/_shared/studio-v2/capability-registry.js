import{
  registerCommand,registerManifestCommands,listCommands,getCommand,commandForAction,findCommands
}from'./command-registry.js';

const REG=new Map();
let coreRegistered=false;

function registerCoreCommands(){
  if(coreRegistered)return;
  coreRegistered=true;
  const core=[
    {id:'core.undo',action:'core.undo',label:'Annuler',shortLabel:'Annuler',icon:'undo',scope:'core',plugin:'studio-core',status:'stable',group:'history',shortcut:'Ctrl+Z',keywords:['retour','historique'],priority:'primary',when:()=>globalThis.NLABStudioUndoRedo?.get?.().canUndo===true},
    {id:'core.redo',action:'core.redo',label:'Rétablir',shortLabel:'Rétablir',icon:'redo',scope:'core',plugin:'studio-core',status:'stable',group:'history',shortcut:'Ctrl+Y / Ctrl+Maj+Z',keywords:['refaire','historique'],priority:'primary',when:()=>globalThis.NLABStudioUndoRedo?.get?.().canRedo===true},
    {id:'core.commands',action:'core.commands',label:'Palette de commandes',shortLabel:'Commandes',icon:'command',scope:'core',plugin:'studio-core',status:'stable',group:'navigation',shortcut:'Ctrl+K',keywords:['rechercher','palette','actions'],priority:'secondary'},
    {id:'core.properties',action:'core.properties',label:'Propriétés',shortLabel:'Propriétés',icon:'settings',scope:'core',plugin:'studio-core',status:'stable',group:'inspect',keywords:['inspecteur','sélection','objet'],priority:'secondary',when:'active'}
  ];
  for(const cmd of core){REG.set(cmd.id,cmd);registerCommand(cmd)}
}

export function registerCapabilities(manifest={}){
  registerCoreCommands();
  for(const group of manifest.ribbon||[])for(const item of group.items||[]){
    const id=item.capability||item.commandId||item.featureId||item.id||item.action;if(!id)continue;
    const def={
      id,
      featureId:item.featureId||item.id||item.action||id,
      action:item.action||item.id||id,
      label:item.label||item.action||id,
      shortLabel:item.shortLabel||item.label||item.action||id,
      icon:item.icon||null,
      scope:item.scope||group.scope||'studio',
      plugin:item.plugin||manifest.id||'studio',
      studio:manifest.id||'studio',
      status:item.status||'stable',
      help:item.help||{},
      quickAction:item.quickAction!==false,
      advancedStudio:item.advancedStudio||null,
      sourceRef:item.sourceRef||null,
      testRef:item.testRef||null,
      group:group.id||'',
      shortcut:item.shortcut||'',
      keywords:item.keywords||[],
      when:item.when||null,
      priority:item.primary?'primary':(item.priority||'normal')
    };
    REG.set(id,def);registerCommand(def);
  }
  for(const cmd of manifest.commands||[]){
    const def={...cmd,studio:cmd.studio||manifest.id||'studio'};
    const registered=registerCommand(def);REG.set(registered.id,registered);
  }
  registerManifestCommands({...manifest,ribbon:[]});
  return listCapabilities();
}

export const listCapabilities=()=>listCommands();
export const getCapability=id=>getCommand(id)||REG.get(String(id))||null;
export const capabilityForAction=action=>commandForAction(action)||[...REG.values()].find(x=>x.action===action)||null;
export function findCapabilities(query=''){return findCommands(query)}
