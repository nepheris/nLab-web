import{uid}from'./core.js';
export class ActionHistory extends EventTarget{
 constructor({storageKey='nlab-studio-v1-actions',limit=200}={}){super();this.storageKey=storageKey;this.limit=limit;this.items=this.load()}
 load(){try{return JSON.parse(localStorage.getItem(this.storageKey)||'[]')}catch{return[]}}
 save(){localStorage.setItem(this.storageKey,JSON.stringify(this.items.slice(0,this.limit)))}
 add(action,detail='',meta={}){const item={id:uid('hist'),at:new Date().toISOString(),action:String(action||''),detail:String(detail||''),meta};this.items.unshift(item);this.items=this.items.slice(0,this.limit);this.save();this.dispatchEvent(new CustomEvent('change',{detail:item}));return item}
 list(limit=this.limit){return this.items.slice(0,limit)}
 clear(){this.items=[];this.save();this.dispatchEvent(new Event('change'))}
 export(){return{schema:'nlab-studio-history/v1',exportedAt:new Date().toISOString(),items:this.items}}
}

export class SnapshotHistory extends EventTarget{
 constructor({engine,limit=30}={}){super();this.engine=engine;this.limit=limit;this.items=[];this.index=-1;this.restoring=false;this._timer=0}
 async capture(label='État'){if(this.restoring||!this.engine?.pdfDoc)return null;const bytes=await this.engine.baseBytes(),annotations=[...this.engine.pageAnnotations.entries()].map(([p,a])=>[p,structuredClone(a)]),selected=[...this.engine.selected],item={id:uid('snap'),at:new Date().toISOString(),label:String(label||'État'),bytes:new Uint8Array(bytes),annotations,currentPage:this.engine.currentPage,selected};const sig=this.signature(item);if(this.items[this.index]?.sig===sig)return this.items[this.index];item.sig=sig;if(this.index<this.items.length-1)this.items=this.items.slice(0,this.index+1);this.items.push(item);if(this.items.length>this.limit)this.items.shift();this.index=this.items.length-1;this.dispatchEvent(new Event('change'));return item}
 schedule(label='Modification',delay=120){clearTimeout(this._timer);this._timer=setTimeout(()=>this.capture(label),delay)}
 signature(x){const b=x.bytes||[],head=[...b.slice(0,24)].join(','),tail=[...b.slice(Math.max(0,b.length-24))].join(','),a=JSON.stringify(x.annotations);return b.length+':'+head+':'+tail+':'+a}
 canUndo(){return this.index>0}
 canRedo(){return this.index>=0&&this.index<this.items.length-1}
 async restore(index){if(index<0||index>=this.items.length)return false;const s=this.items[index];this.restoring=true;try{await this.engine.setBytes(new Uint8Array(s.bytes));this.engine.pageAnnotations=new Map(s.annotations.map(([p,a])=>[p,structuredClone(a)]));this.engine.currentPage=Math.min(Math.max(1,s.currentPage||1),this.engine.pageCount||1);this.engine.selected=new Set((s.selected||[]).filter(p=>p<=this.engine.pageCount));this.engine.dispatchEvent(new Event('annotations'));this.engine.dispatchEvent(new CustomEvent('page',{detail:{page:this.engine.currentPage}}));this.engine.dispatchEvent(new Event('selection'));this.index=index;this.dispatchEvent(new Event('change'));return true}finally{this.restoring=false}}
 async undo(){return this.canUndo()?this.restore(this.index-1):false}
 async redo(){return this.canRedo()?this.restore(this.index+1):false}
 list(){return this.items.map((x,i)=>({id:x.id,at:x.at,label:x.label,index:i,current:i===this.index,canRestore:i!==this.index})).reverse()}
 clear(){this.items=[];this.index=-1;this.dispatchEvent(new Event('change'))}
}
