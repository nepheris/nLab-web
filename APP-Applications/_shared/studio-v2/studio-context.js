const KEY='nlab-studio-v2-work-session';
const uid=()=>globalThis.crypto?.randomUUID?.()||('session-'+Date.now()+'-'+Math.random().toString(16).slice(2));
export function createStudioContext(input={}){
  const ctx={
    schema:'nlab-capability-context/v1',
    sessionId:input.sessionId||uid(),
    createdAt:input.createdAt||new Date().toISOString(),
    sourceApp:input.sourceApp||input.sourceStudio||document.body.dataset.app||document.body.dataset.studio||'nlab',
    sourceStudio:input.sourceStudio||document.body.dataset.studio||null,
    targetStudio:input.targetStudio||null,
    capability:input.capability||null,
    entityType:input.entityType||null,
    entityId:input.entityId||null,
    slot:input.slot||null,
    assetId:input.assetId||null,
    fileName:input.fileName||null,
    page:input.page||null,
    selectedPages:Array.isArray(input.selectedPages)?input.selectedPages:[],
    selectedObjects:Array.isArray(input.selectedObjects)?input.selectedObjects:[],
    parameters:input.parameters||{},
    returnTarget:input.returnTarget||location.href,
    returnAction:input.returnAction||'apply-and-return',
    historyId:input.historyId||null
  };
  sessionStorage.setItem(KEY,JSON.stringify(ctx));return ctx
}
export function loadStudioContext(){try{return JSON.parse(sessionStorage.getItem(KEY)||'null')}catch{return null}}
export function updateStudioContext(patch={}){const next={...(loadStudioContext()||{}),...patch};sessionStorage.setItem(KEY,JSON.stringify(next));return next}
export function clearStudioContext(){sessionStorage.removeItem(KEY)}
export function contextReference(ctx=loadStudioContext()){if(!ctx)return'';return[ctx.sourceApp,ctx.entityType,ctx.entityId,ctx.slot,ctx.capability].filter(Boolean).join(' > ')}
export function openAdvancedStudio({url,targetStudio,capability,context={}}={}){if(!url)throw new Error('URL du Studio avancé requise');const ctx=createStudioContext({...context,targetStudio,capability});const u=new URL(url,location.href);u.searchParams.set('nlabSession',ctx.sessionId);location.href=u.href}
