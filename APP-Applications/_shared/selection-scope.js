(()=>{'use strict';
if(window.NLAB_SELECTION_SCOPE)return;
function create(items=[]){
 const order=Array.from(items||[]);
 return{order,selected:new Set(),anchor:null};
}
function setItems(state,items=[]){
 state.order=Array.from(items||[]);const allowed=new Set(state.order);
 state.selected=new Set([...state.selected].filter(x=>allowed.has(x)));
 if(state.anchor!=null&&!allowed.has(state.anchor))state.anchor=null;return state;
}
function clear(state){state.selected.clear();state.anchor=null;return state}
function all(state){state.selected=new Set(state.order);state.anchor=state.order[0]??null;return state}
function invert(state){state.selected=new Set(state.order.filter(x=>!state.selected.has(x)));return state}
function click(state,id,e={}){
 if(!state.order.includes(id))return state;
 const multi=!!(e.ctrlKey||e.metaKey),range=!!e.shiftKey;
 if(range&&state.anchor!=null){
  const a=state.order.indexOf(state.anchor),b=state.order.indexOf(id);if(a>=0&&b>=0){if(!multi)state.selected.clear();const lo=Math.min(a,b),hi=Math.max(a,b);for(let i=lo;i<=hi;i++)state.selected.add(state.order[i]);}
 }else if(multi){state.selected.has(id)?state.selected.delete(id):state.selected.add(id);state.anchor=id}
 else{state.selected=new Set([id]);state.anchor=id}
 return state;
}
function resolve(state,scope,current,resolvers={}){
 if(scope==='all')return state.order.slice();
 if(scope==='selected')return state.order.filter(x=>state.selected.has(x));
 if(scope==='current')return current==null?[]:[current];
 if(typeof resolvers[scope]==='function')return Array.from(resolvers[scope](state,current)||[]);
 return current==null?[]:[current];
}
function summary(state){return{count:state.selected.size,total:state.order.length,selected:state.order.filter(x=>state.selected.has(x)),anchor:state.anchor}}
window.NLAB_SELECTION_SCOPE={create,setItems,clear,all,invert,click,resolve,summary,version:'1.0.0'};
})();