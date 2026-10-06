const listeners=new Set();
let state=Object.freeze({selection:[],active:null,scope:'document',kind:null,meta:{},revision:0});

const cloneSelection=value=>Array.isArray(value)?[...value]:(value==null?[]:[value]);
const freezeState=next=>Object.freeze({...next,selection:Object.freeze(cloneSelection(next.selection)),meta:Object.freeze({...next.meta})});

function emit(previous,source='api'){
  const detail={context:state,previous,source};
  for(const fn of listeners){try{fn(state,previous,source)}catch(e){console.error(e)}}
  if(typeof document!=='undefined')document.dispatchEvent(new CustomEvent('studio-v2:context-changed',{detail}));
}

export function getStudioContext(){return state}

export function setStudioContext(patch={},source='api'){
  const previous=state;
  state=freezeState({
    ...state,
    ...patch,
    selection:patch.selection!==undefined?cloneSelection(patch.selection):state.selection,
    meta:patch.meta!==undefined?{...state.meta,...patch.meta}:state.meta,
    revision:state.revision+1
  });
  emit(previous,source);
  return state;
}

export function setSelection(selection,{active,scope,kind,meta}={},source='selection'){
  const list=cloneSelection(selection);
  return setStudioContext({
    selection:list,
    active:active!==undefined?active:(list.length===1?list[0]:state.active),
    scope:scope||state.scope,
    kind:kind!==undefined?kind:state.kind,
    meta:meta||{}
  },source);
}

export function clearSelection(source='selection-clear'){
  return setStudioContext({selection:[],active:null,kind:null},source);
}

export function subscribeStudioContext(fn){
  if(typeof fn!=='function')throw new TypeError('Listener requis');
  listeners.add(fn);return()=>listeners.delete(fn);
}

export function installContextSelectionBridge(){
  if(typeof document==='undefined'||document.documentElement?.dataset?.studioContextBridge==='1')return;
  if(document.documentElement)document.documentElement.dataset.studioContextBridge='1';
  document.addEventListener('studio-v2:selection-change',e=>{
    const d=e.detail||{};
    setSelection(d.selection??d.items??[],{active:d.active,scope:d.scope,kind:d.kind,meta:d.meta},d.source||'event');
  });
  document.addEventListener('studio-v2:context-change',e=>{
    const d=e.detail||{};setStudioContext(d.context||d,d.source||'event');
  });
  document.addEventListener('studio-v2:input-picked',e=>{
    const files=e.detail?.files||[];if(files.length)setSelection(files,{active:files[0],scope:'collection',kind:'file',meta:{source:e.detail?.source||'input-picker'}},'input-picked');
  });
}

export const StudioContext=Object.freeze({
  get:getStudioContext,
  set:setStudioContext,
  setSelection,
  clearSelection,
  subscribe:subscribeStudioContext,
  install:installContextSelectionBridge
});
if(typeof window!=='undefined')window.NLABStudioContext=StudioContext;
