import{qs,qsa,clamp}from'./core.js';

export class StudioPreview{
  constructor({
    stage,
    content,
    zoomInput=null,
    zoomLabel=null,
    fitWidthButton=null,
    fitPageButton=null,
    min=.25,
    max=4,
    initial=1
  }={}){
    this.stage=typeof stage==='string'?qs(stage):stage;
    this.content=typeof content==='string'?qs(content):content;
    this.zoomInput=typeof zoomInput==='string'?qs(zoomInput):zoomInput;
    this.zoomLabel=typeof zoomLabel==='string'?qs(zoomLabel):zoomLabel;
    this.fitWidthButton=typeof fitWidthButton==='string'?qs(fitWidthButton):fitWidthButton;
    this.fitPageButton=typeof fitPageButton==='string'?qs(fitPageButton):fitPageButton;
    this.min=min;this.max=max;this.zoom=initial;
    this.bind();this.apply();
  }
  bind(){
    this.zoomInput?.addEventListener('input',e=>this.setZoom(Number(e.target.value)));
    this.fitWidthButton?.addEventListener('click',()=>this.fitWidth());
    this.fitPageButton?.addEventListener('click',()=>this.fitPage());
    window.addEventListener('resize',()=>{if(this.mode==='width')this.fitWidth(false);else if(this.mode==='page')this.fitPage(false)});
  }
  setZoom(v,{mode='manual'}={}){this.mode=mode;this.zoom=clamp(Number(v)||1,this.min,this.max);if(this.zoomInput)this.zoomInput.value=this.zoom;this.apply();return this.zoom}
  apply(){if(this.content)this.content.style.transform='scale('+this.zoom+')';if(this.content)this.content.style.transformOrigin='top center';if(this.zoomLabel)this.zoomLabel.textContent=Math.round(this.zoom*100)+' %'}
  naturalSize(){if(!this.content)return{width:0,height:0};const old=this.content.style.transform;this.content.style.transform='none';const r=this.content.getBoundingClientRect();this.content.style.transform=old;return{width:r.width,height:r.height}}
  fitWidth(mark=true){if(!this.stage||!this.content)return;const s=this.stage.getBoundingClientRect(),n=this.naturalSize();if(!n.width)return;if(mark)this.mode='width';this.setZoom((s.width-28)/n.width,{mode:this.mode||'width'})}
  fitPage(mark=true){if(!this.stage||!this.content)return;const s=this.stage.getBoundingClientRect(),n=this.naturalSize();if(!n.width||!n.height)return;if(mark)this.mode='page';this.setZoom(Math.min((s.width-28)/n.width,(s.height-28)/n.height),{mode:this.mode||'page'})}
  setContent(node){if(!this.content)return;this.content.replaceChildren();if(node)this.content.append(node);this.apply()}
  clear(){this.content?.replaceChildren()}
}
