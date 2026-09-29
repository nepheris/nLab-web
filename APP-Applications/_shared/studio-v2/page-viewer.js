const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
export class StudioPageViewer{
  constructor({engine,mainHost,previewHost,onActivate,onSelection}={}){
    this.engine=engine;this.mainHost=mainHost;this.previewHost=previewHost;this.onActivate=onActivate||(()=>{});this.onSelection=onSelection||(()=>{});
    this.zoom=1;this.pagesPerRow=1;this.previewScale=.18;this.previewColumns=6;this.renderToken=0;
  }
  setZoom(v){this.zoom=clamp(Number(v)||1,.15,5);return this.zoom}
  setPagesPerRow(v){this.pagesPerRow=clamp(Math.round(Number(v)||1),1,12);return this.pagesPerRow}
  setPreviewColumns(v){this.previewColumns=clamp(Math.round(Number(v)||6),1,20);return this.previewColumns}
  fitScale(host,columns=1,gap=12){
    const width=Math.max(180,host?.clientWidth||800),base=595;
    return clamp((width-gap*(columns+1))/(base*columns),.12,3);
  }
  async renderMain(){
    if(!this.mainHost)return;
    const token=++this.renderToken;this.mainHost.innerHTML='';
    if(!this.engine.pageCount)return;
    const cols=this.pagesPerRow,scale=this.pagesPerRow>1?this.fitScale(this.mainHost,cols):this.zoom;
    this.mainHost.style.setProperty('--viewer-columns',String(cols));
    for(let page=1;page<=this.engine.pageCount;page++){
      if(token!==this.renderToken)return;
      const wrap=document.createElement('button');wrap.type='button';wrap.className='pageTile'+(page===this.engine.currentPage?' active':'');wrap.dataset.page=page;
      const canvas=document.createElement('canvas'),label=document.createElement('span');label.className='pageTileLabel';label.textContent='Page '+page;wrap.append(canvas,label);this.mainHost.append(wrap);
      await this.engine.renderPage(canvas,page,scale);
      wrap.onclick=()=>{this.engine.selectPage(page);this.onActivate(page);this.refreshActive()};
    }
  }
  async renderPreview(){
    if(!this.previewHost)return;
    this.previewHost.innerHTML='';if(!this.engine.pageCount)return;
    this.previewHost.style.setProperty('--preview-columns',String(this.previewColumns));
    for(let page=1;page<=this.engine.pageCount;page++){
      const item=document.createElement('div');item.className='previewTile';item.dataset.page=page;
      const head=document.createElement('label');head.className='previewSelect';const cb=document.createElement('input');cb.type='checkbox';cb.checked=this.engine.selected.has(page);cb.dataset.previewSelect=page;head.append(cb,document.createTextNode(' '+page));
      const canvas=document.createElement('canvas');canvas.className='previewCanvas';canvas.draggable=true;canvas.dataset.page=page;
      item.append(head,canvas);this.previewHost.append(item);
      await this.engine.renderThumb(canvas,page,this.previewScale);
      cb.onchange=()=>{this.engine.toggleSelected(page,cb.checked);this.onSelection([...this.engine.selected])};
      canvas.onclick=()=>{this.engine.selectPage(page);this.onActivate(page);this.refreshActive()};
    }
    this.bindReorder();
    this.refreshActive();
  }
  bindReorder(){
    let from=null;
    this.previewHost.querySelectorAll('.previewCanvas').forEach(c=>{
      c.addEventListener('dragstart',()=>{from=Number(c.dataset.page);c.closest('.previewTile')?.classList.add('dragging')});
      c.addEventListener('dragend',()=>{c.closest('.previewTile')?.classList.remove('dragging');from=null});
      c.addEventListener('dragover',e=>e.preventDefault());
      c.addEventListener('drop',async e=>{e.preventDefault();const to=Number(c.dataset.page);if(from&&to&&from!==to){await this.engine.movePage(from,to);this.onActivate(to);await this.renderPreview();await this.renderMain()}});
    });
  }
  refreshActive(){
    this.mainHost?.querySelectorAll('[data-page]').forEach(x=>x.classList.toggle('active',Number(x.dataset.page)===this.engine.currentPage));
    this.previewHost?.querySelectorAll('.previewTile').forEach(x=>x.classList.toggle('active',Number(x.dataset.page)===this.engine.currentPage));
  }
}
