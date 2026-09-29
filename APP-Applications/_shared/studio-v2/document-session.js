export class DocumentSession extends EventTarget{
  constructor(input={}){super();this.id=input.id||globalThis.crypto?.randomUUID?.()||('doc-'+Date.now());this.file=input.file||null;this.fileName=input.fileName||input.file?.name||'';this.page=Number(input.page)||1;this.pageCount=Number(input.pageCount)||0;this.selectedPages=new Set(input.selectedPages||[]);this.activeObject=input.activeObject||null;this.dirty=!!input.dirty;this.meta={...(input.meta||{})}}
  patch(next={}){Object.assign(this,next);this.dispatchEvent(new CustomEvent('change',{detail:this.snapshot()}));return this}
  setPage(page){this.page=Math.max(1,Math.min(this.pageCount||1,Number(page)||1));this.dispatchEvent(new CustomEvent('page',{detail:{page:this.page}}));return this.page}
  select(page,on=true){on?this.selectedPages.add(page):this.selectedPages.delete(page);this.dispatchEvent(new CustomEvent('selection',{detail:[...this.selectedPages]}))}
  selectAll(){this.selectedPages=new Set(Array.from({length:this.pageCount},(_,i)=>i+1));this.dispatchEvent(new Event('selection'))}
  clearSelection(){this.selectedPages.clear();this.dispatchEvent(new Event('selection'))}
  snapshot(){return{id:this.id,fileName:this.fileName,page:this.page,pageCount:this.pageCount,selectedPages:[...this.selectedPages],activeObject:this.activeObject,dirty:this.dirty,meta:{...this.meta}}}
}
