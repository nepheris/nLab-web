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
