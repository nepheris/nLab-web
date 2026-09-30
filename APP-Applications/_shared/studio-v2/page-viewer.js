import{icon}from'./icon-registry.js';
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
export class StudioPageViewer{
  constructor({engine,mainHost,previewHost,onActivate,onSelection,onDelete,onAdd}={}){
    this.engine=engine;this.mainHost=mainHost;this.previewHost=previewHost;this.onActivate=onActivate||(()=>{});this.onSelection=onSelection||(()=>{});this.onDelete=onDelete||(()=>{});this.onAdd=onAdd||(()=>{});
    this.zoom=1;this.pagesPerRow=1;this.previewScale=.18;this.previewColumns=6;this.renderToken=0;
  }
  setZoom(v){this.zoom=clamp(Number(v)||1,.15,5);return this.zoom}
  setPagesPerRow(v){this.pagesPerRow=clamp(Math.round(Number(v)||1),1,12);return this.pagesPerRow}
  setPreviewColumns(v){this.previewColumns=clamp(Math.round(Number(v)||6),1,20);return this.previewColumns}
  setPreviewScale(v){this.previewScale=clamp(Number(v)||.18,.08,.6);return this.previewScale}
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
    const pending=[];
    for(let page=1;page<=this.engine.pageCount;page++){
      const wrap=document.createElement('button');wrap.type='button';wrap.className='pageTile'+(page===this.engine.currentPage?' active':'');wrap.dataset.page=page;
      const canvas=document.createElement('canvas'),label=document.createElement('span');canvas.dataset.renderPage=page;canvas.dataset.renderScale=scale;label.className='pageTileLabel';label.textContent='Page '+page;wrap.append(canvas,label);this.mainHost.append(wrap);
      wrap.onclick=()=>{this.engine.selectPage(page);this.onActivate(page);this.refreshActive()};pending.push(canvas);
    }
    const renderCanvas=async canvas=>{if(token!==this.renderToken||canvas.dataset.rendered)return;canvas.dataset.rendered='1';await this.engine.renderPage(canvas,Number(canvas.dataset.renderPage),Number(canvas.dataset.renderScale))};
    if('IntersectionObserver'in window){const io=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){renderCanvas(e.target);io.unobserve(e.target)}}),{root:this.mainHost.parentElement,rootMargin:'800px'});pending.forEach(c=>io.observe(c))}
    else for(const canvas of pending)await renderCanvas(canvas);
  }
  async renderPreview(){
    if(!this.previewHost)return;
    this.previewHost.innerHTML='';if(!this.engine.pageCount)return;
    this.previewHost.style.setProperty('--preview-columns',String(this.previewColumns));
    const pending=[];
    for(let page=1;page<=this.engine.pageCount;page++){
      const item=document.createElement('div');item.className='previewTile';item.dataset.page=page;
      const head=document.createElement('div');head.className='previewTileHead';
      const sel=document.createElement('label');sel.className='previewSelect';const cb=document.createElement('input');cb.type='checkbox';cb.checked=this.engine.selected.has(page);cb.dataset.previewSelect=page;const num=document.createElement('span');num.textContent=String(page);sel.append(cb,num);
      const del=document.createElement('button');del.type='button';del.className='previewDelete';del.title='Supprimer cette page';del.setAttribute('aria-label','Supprimer la page '+page);del.innerHTML=icon('delete');
      head.append(sel,del);
      const canvas=document.createElement('canvas');canvas.className='previewCanvas';canvas.draggable=true;canvas.dataset.page=page;
      item.append(head,canvas);this.previewHost.append(item);pending.push(canvas);
      cb.onchange=()=>{this.engine.toggleSelected(page,cb.checked);this.onSelection([...this.engine.selected])};
      del.onclick=e=>{e.stopPropagation();this.onDelete(page)};
      canvas.onclick=()=>{this.engine.selectPage(page);this.onActivate(page);this.refreshActive()};
    }
    const renderCanvas=async canvas=>{if(canvas.dataset.rendered)return;canvas.dataset.rendered='1';await this.engine.renderThumb(canvas,Number(canvas.dataset.page),this.previewScale)};
    if('IntersectionObserver'in window){const io=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){renderCanvas(e.target);io.unobserve(e.target)}}),{root:this.previewHost,rootMargin:'400px'});pending.forEach(c=>io.observe(c))}
    else for(const canvas of pending)await renderCanvas(canvas);
    const add=document.createElement('button');add.type='button';add.className='previewAddTile';add.title='Ajouter une page';add.setAttribute('aria-label','Ajouter une page');add.innerHTML=icon('add')+'<span>Ajouter</span>';add.onclick=()=>this.onAdd();this.previewHost.append(add);
    this.bindReorder();this.refreshActive();
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
