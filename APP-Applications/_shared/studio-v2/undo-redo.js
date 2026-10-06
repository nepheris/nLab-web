const undoStack=[],redoStack=[],listeners=new Set();
let limit=200;

const notify=(reason,entry=null)=>{
  const snapshot=getUndoRedoState();
  for(const fn of listeners){try{fn(snapshot,reason,entry)}catch(e){console.error(e)}}
  if(typeof document!=='undefined')document.dispatchEvent(new CustomEvent('studio-v2:undo-redo-changed',{detail:{...snapshot,reason,entry}}));
};

function normalize(entry={}){
  if(!entry||typeof entry!=='object')throw new TypeError('Transaction requise');
  return{
    id:entry.id||globalThis.crypto?.randomUUID?.()||('tx-'+Date.now()+'-'+Math.random().toString(16).slice(2)),
    label:String(entry.label||'Action'),
    undo:typeof entry.undo==='function'?entry.undo:null,
    redo:typeof entry.redo==='function'?entry.redo:null,
    meta:entry.meta||{},
    timestamp:entry.timestamp||new Date().toISOString()
  };
}

export function configureUndoRedo({maxItems}={}){
  if(Number.isFinite(Number(maxItems)))limit=Math.max(1,Number(maxItems));
  while(undoStack.length>limit)undoStack.shift();
  return getUndoRedoState();
}

export function pushUndoRedo(entry){
  const tx=normalize(entry);undoStack.push(tx);while(undoStack.length>limit)undoStack.shift();redoStack.length=0;notify('push',tx);return tx;
}

export function getUndoRedoState(){
  return{
    canUndo:undoStack.length>0,
    canRedo:redoStack.length>0,
    undoDepth:undoStack.length,
    redoDepth:redoStack.length,
    undoLabel:undoStack.at(-1)?.label||'',
    redoLabel:redoStack.at(-1)?.label||''
  };
}

export async function undo(){
  const tx=undoStack.pop();if(!tx)return false;
  try{
    if(tx.undo)await tx.undo(tx);
    else if(typeof document!=='undefined')document.dispatchEvent(new CustomEvent('studio-v2:undo-request',{detail:{transaction:tx}}));
    redoStack.push(tx);notify('undo',tx);return true;
  }catch(e){undoStack.push(tx);notify('undo-error',tx);throw e}
}

export async function redo(){
  const tx=redoStack.pop();if(!tx)return false;
  try{
    if(tx.redo)await tx.redo(tx);
    else if(typeof document!=='undefined')document.dispatchEvent(new CustomEvent('studio-v2:redo-request',{detail:{transaction:tx}}));
    undoStack.push(tx);notify('redo',tx);return true;
  }catch(e){redoStack.push(tx);notify('redo-error',tx);throw e}
}

export function clearUndoRedo(){undoStack.length=0;redoStack.length=0;notify('clear');}
export function subscribeUndoRedo(fn){listeners.add(fn);return()=>listeners.delete(fn)}

export function installUndoRedoBridge(){
  if(typeof document==='undefined'||document.documentElement?.dataset?.studioUndoBridge==='1')return;
  if(document.documentElement)document.documentElement.dataset.studioUndoBridge='1';
  document.addEventListener('studio-v2:transaction',e=>pushUndoRedo(e.detail||{}));
  document.addEventListener('studio-v2:action',e=>{
    const a=e.detail?.action;
    if(a==='core.undo')undo();
    if(a==='core.redo')redo();
  });
  document.addEventListener('keydown',e=>{
    const target=e.target,editable=target?.isContentEditable||/^(INPUT|TEXTAREA|SELECT)$/.test(target?.tagName||'');
    if(editable)return;
    if((e.ctrlKey||e.metaKey)&&!e.shiftKey&&e.key.toLowerCase()==='z'){e.preventDefault();undo()}
    else if((e.ctrlKey||e.metaKey)&&((e.shiftKey&&e.key.toLowerCase()==='z')||e.key.toLowerCase()==='y')){e.preventDefault();redo()}
  });
}

export const StudioUndoRedo=Object.freeze({
  push:pushUndoRedo,undo,redo,clear:clearUndoRedo,get:getUndoRedoState,
  configure:configureUndoRedo,subscribe:subscribeUndoRedo,install:installUndoRedoBridge
});
if(typeof window!=='undefined')window.NLABStudioUndoRedo=StudioUndoRedo;
