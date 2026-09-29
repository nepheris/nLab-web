const uid=()=>globalThis.crypto?.randomUUID?.()||('pipe-'+Date.now());
const handlers=new Map();
export function registerPipelineHandler(capability,handler){if(capability&&typeof handler==='function')handlers.set(capability,handler)}
export function listPipelineHandlers(){return [...handlers.keys()]}
export async function runPipeline({steps=[],context={},onProgress}={}){
  const run={id:uid(),startedAt:new Date().toISOString(),status:'running',steps:[],context:{...context}};
  let value=context.input??context;
  for(let i=0;i<steps.length;i++){
    const raw=typeof steps[i]==='string'?{capability:steps[i]}:steps[i],cap=raw.capability||raw.action,handler=handlers.get(cap);
    const item={index:i,capability:cap,status:'running',startedAt:new Date().toISOString()};run.steps.push(item);onProgress?.({...item,total:steps.length});
    if(!handler){item.status='unavailable';item.error='Capability non raccordée au PipelineService';continue}
    try{value=await handler({value,parameters:raw.parameters||{},context:run.context,run});item.status='done';item.finishedAt=new Date().toISOString()}
    catch(e){item.status='error';item.error=e?.message||String(e);run.status='error';run.finishedAt=new Date().toISOString();throw Object.assign(e,{pipelineRun:run})}
  }
  run.status='done';run.finishedAt=new Date().toISOString();run.output=value;document.dispatchEvent(new CustomEvent('studio-v2:pipeline-complete',{detail:run}));return run
}
