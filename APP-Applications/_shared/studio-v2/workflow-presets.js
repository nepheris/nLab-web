const KEY='nlab-studio-v2-workflow-presets';
const read=()=>{try{const v=JSON.parse(localStorage.getItem(KEY)||'[]');return Array.isArray(v)?v:[]}catch{return[]}};
const write=v=>localStorage.setItem(KEY,JSON.stringify(v));
const uid=()=>globalThis.crypto?.randomUUID?.()||('wf-'+Date.now()+'-'+Math.random().toString(16).slice(2));
export const listWorkflowPresets=()=>read();
export function saveWorkflowPreset(input={}){const item={id:input.id||uid(),name:String(input.name||'Workflow'),description:String(input.description||''),studio:input.studio||document.body.dataset.studio||'studio',steps:Array.isArray(input.steps)?input.steps:[],createdAt:input.createdAt||new Date().toISOString(),updatedAt:new Date().toISOString()};const out=[item,...read().filter(x=>x.id!==item.id)];write(out);document.dispatchEvent(new CustomEvent('studio-v2:workflows-changed'));return item}
export function removeWorkflowPreset(id){write(read().filter(x=>x.id!==id));document.dispatchEvent(new CustomEvent('studio-v2:workflows-changed'))}
export function runWorkflowPreset(id){const wf=read().find(x=>x.id===id);if(!wf)return null;document.dispatchEvent(new CustomEvent('studio-v2:workflow-run',{detail:wf}));return wf}
