import{openResponsiveTestStudio}from'./responsive-test-launcher.js';
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
    {id:'core.properties',action:'core.properties',label:'Propriétés',shortLabel:'Propriétés',icon:'settings',scope:'core',plugin:'studio-core',status:'stable',group:'inspect',keywords:['inspecteur','sélection','objet'],priority:'secondary',when:'active'},
    {id:'core.fullscreen',action:'core.fullscreen',label:'Plein écran',shortLabel:'Plein écran',icon:'screen',scope:'core',plugin:'studio-core',status:'stable',group:'navigation',keywords:['plein écran','quitter','fullscreen','fenêtre'],priority:'secondary'},
    {id:'core.app-mode',action:'core.app-mode',label:'Installer l’application',shortLabel:'Application',icon:'screen',scope:'core',plugin:'studio-core',status:'stable',group:'navigation',keywords:['application','installer','pwa','standalone','fenêtre'],priority:'secondary'},
    {id:'core.responsive-test',action:'core.responsive-test',label:'Test responsive',shortLabel:'Responsive',icon:'screen',scope:'core',plugin:'studio-core',status:'stable',group:'navigation',keywords:['viewport','responsive','écran','desktop','mobile','tablette'],priority:'secondary',handler:()=>openResponsiveTestStudio()}
  ];
  for(const cmd of core){REG.set(cmd.id,cmd);registerCommand(cmd)}
}

export function registerCapabilities(manifest={}){
  registerCoreCommands();
  if(manifest.coreFeatures?.acquisition){
    const def={id:'core.acquire',action:'core.acquire',label:'Importer des fichiers',shortLabel:'Importer',icon:'inputAcquire',scope:'core',plugin:'studio-core',studio:manifest.id,status:'stable',group:'input',priority:'primary',keywords:['fichier','dossier','importer','sélection','glisser-déposer']};
    REG.set(def.id,def);registerCommand(def);
  }
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
