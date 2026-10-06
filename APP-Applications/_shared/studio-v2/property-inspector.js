import{enhanceStudioWindow,showStudioWindow,hideStudioWindow,bringStudioWindowToFront}from'./window-system.js';
import{getStudioContext,setStudioContext}from'./context-selection.js';

const schemas=new Map();
const esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));

export function registerPropertySchema(kind,fields=[]){
  schemas.set(String(kind||'default'),Array.isArray(fields)?fields:[]);
  return fields;
}
export function getPropertySchema(kind){return schemas.get(String(kind||'default'))||schemas.get('default')||[]}

function inferredFields(ctx){
  const active=ctx.active;
  if(active instanceof File)return[
    {key:'name',label:'Nom',type:'text',readOnly:true,value:()=>active.name},
    {key:'type',label:'Type',type:'text',readOnly:true,value:()=>active.type||'—'},
    {key:'size',label:'Taille',type:'text',readOnly:true,value:()=>Math.max(1,Math.round(active.size/1024))+' Ko'},
    {key:'modified',label:'Modifié',type:'text',readOnly:true,value:()=>new Date(active.lastModified).toLocaleString('fr-FR')}
  ];
  return Object.keys(ctx.meta||{}).map(key=>({key,label:key,type:typeof ctx.meta[key]==='boolean'?'checkbox':'text'}));
}

function ensure(){
  let panel=document.querySelector('#studioPropertyInspector');if(panel)return panel;
  panel=document.createElement('aside');panel.id='studioPropertyInspector';panel.className='studioWindow studioPropertyInspector scope-core';panel.dataset.scope='core';panel.hidden=true;
  panel.innerHTML='<div class="propertyInspectorBody"><div class="propertyInspectorSummary" id="propertyInspectorSummary"></div><div id="propertyInspectorFields" class="propertyInspectorFields"></div></div>';
  document.body.append(panel);enhanceStudioWindow(panel,{key:'property-inspector',title:'Propriétés',restorable:true});
  panel.addEventListener('change',e=>{
    const input=e.target.closest('[data-property-key]');if(!input)return;
    const ctx=getStudioContext(),key=input.dataset.propertyKey;
    const value=input.type==='checkbox'?input.checked:(input.type==='number'?Number(input.value):input.value);
    const field=getPropertySchema(ctx.kind).find(x=>x.key===key)||inferredFields(ctx).find(x=>x.key===key);
    if(field?.readOnly)return;
    if(typeof field?.set==='function')field.set(value,ctx);
    else setStudioContext({meta:{[key]:value}},'property-inspector');
    document.dispatchEvent(new CustomEvent('studio-v2:property-changed',{detail:{key,value,context:getStudioContext()}}));
  });
  return panel
}
function render(){
  const panel=ensure(),ctx=getStudioContext(),summary=panel.querySelector('#propertyInspectorSummary'),host=panel.querySelector('#propertyInspectorFields');
  const count=ctx.selection?.length||0;
  summary.innerHTML='<strong>'+esc(ctx.kind||'Sélection')+'</strong><span>'+count+' élément'+(count>1?'s':'')+'</span>';
  const fields=getPropertySchema(ctx.kind).length?getPropertySchema(ctx.kind):inferredFields(ctx);
  host.innerHTML=fields.map(f=>{
    const raw=typeof f.value==='function'?f.value(ctx):(ctx.meta?.[f.key]??ctx.active?.[f.key]??'');
    if(f.type==='checkbox')return'<label class="propertyField checkboxField"><input type="checkbox" data-property-key="'+esc(f.key)+'" '+(raw?'checked':'')+' '+(f.readOnly?'disabled':'')+'><span>'+esc(f.label||f.key)+'</span></label>';
    const type=f.type==='number'?'number':f.type==='color'?'color':'text';
    return'<label class="propertyField"><span>'+esc(f.label||f.key)+'</span><input type="'+type+'" data-property-key="'+esc(f.key)+'" value="'+esc(raw)+'" '+(f.readOnly?'readonly':'')+'></label>'
  }).join('')||'<div class="propertyEmpty">Aucune propriété disponible.</div>'
}
export function mountPropertyInspector(){
  const panel=ensure();render();
  document.addEventListener('studio-v2:context-changed',()=>{render();if(!panel.hidden)bringStudioWindowToFront(panel)});
  document.addEventListener('studio-v2:open-properties',()=>{render();showStudioWindow('property-inspector')});
  document.addEventListener('studio-v2:close-properties',()=>hideStudioWindow('property-inspector'));
  return panel;
}
export const PropertyInspector=Object.freeze({mount:mountPropertyInspector,registerSchema:registerPropertySchema,getSchema:getPropertySchema,render});
if(typeof window!=='undefined')window.NLABPropertyInspector=PropertyInspector;
