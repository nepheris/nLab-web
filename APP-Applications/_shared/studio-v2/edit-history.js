const cloneDefault=value=>{
 if(typeof structuredClone==='function')try{return structuredClone(value)}catch{}
 if(value==null||typeof value!=='object')return value;
 return JSON.parse(JSON.stringify(value))
};
export function createEditHistory({limit=80,clone=cloneDefault}={}){
 const past=[],future=[];
 const copy=v=>clone(v);
 return{
  checkpoint(state,label='Modification'){
   past.push({state:copy(state),label,timestamp:Date.now()});
   if(past.length>limit)past.splice(0,past.length-limit);
   future.length=0;return past.length
  },
  undo(current){
   if(!past.length)return null;
   const entry=past.pop();future.push({state:copy(current),label:entry.label,timestamp:Date.now()});
   return{state:copy(entry.state),label:entry.label}
  },
  redo(current){
   if(!future.length)return null;
   const entry=future.pop();past.push({state:copy(current),label:entry.label,timestamp:Date.now()});
   return{state:copy(entry.state),label:entry.label}
  },
  clear(){past.length=0;future.length=0},
  canUndo(){return past.length>0},
  canRedo(){return future.length>0},
  sizes(){return{undo:past.length,redo:future.length}}
 }
}
export function snapshotCollection(items=[]){
 return items.map(x=>({...x}))
}
