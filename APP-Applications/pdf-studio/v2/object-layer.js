const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const uid=()=>globalThis.crypto?.randomUUID?.()||('obj-'+Date.now()+'-'+Math.random().toString(16).slice(2));
function hexRgb(hex='#316D9A'){const h=String(hex).replace('#','').padEnd(6,'0');return{r:parseInt(h.slice(0,2),16)/255,g:parseInt(h.slice(2,4),16)/255,b:parseInt(h.slice(4,6),16)/255}}
function blobDataUrl(blob){return new Promise((res,rej)=>{const r=new FileReader();r.onload=()=>res(r.result);r.onerror=()=>rej(r.error);r.readAsDataURL(blob)})}
async function normalizedImageDataUrl(blob){
 if(!blob)return null;
 if(['image/png','image/jpeg'].includes(String(blob.type||'').toLowerCase()))return blobDataUrl(blob);
 const url=URL.createObjectURL(blob);try{
  const img=await new Promise((res,rej)=>{const x=new Image();x.onload=()=>res(x);x.onerror=()=>rej(new Error('Format image non décodable'));x.src=url});
  const canvas=document.createElement('canvas');canvas.width=img.naturalWidth||img.width;canvas.height=img.naturalHeight||img.height;const ctx=canvas.getContext('2d');ctx.drawImage(img,0,0);return canvas.toDataURL('image/png')
 }finally{URL.revokeObjectURL(url)}
}
function dataUrlBytes(dataUrl){const [head,b64]=String(dataUrl).split(','),bin=atob(b64||''),u=new Uint8Array(bin.length);for(let i=0;i<bin.length;i++)u[i]=bin.charCodeAt(i);return{bytes:u,type:/png/i.test(head)?'png':'jpg'}}
export class PdfObjectLayer extends EventTarget{
 constructor({engine,mainHost,templates}={}){super();this.engine=engine;this.mainHost=mainHost;this.templates=templates;this.tool='select';this.selectedId=null;this.style={color:'#316D9A',fontSize:12,opacity:1,penWidth:2,highlightColor:'#FFEB3B'};this.text='Texte';this.imageData=null;this.imageKind='image';this.stamp={template:'VALIDÉ\n{DISPLAY_NAME}\n{STAMP_DATE:DD/MM/YYYY}',imageData:null};this.penDraft=null}
 setTool(tool){this.tool=tool||'select';this.render();this.dispatchEvent(new CustomEvent('toolchange',{detail:{tool:this.tool}}))}
 setStyle(next={}){this.style={...this.style,...next};this.render()}
 setText(text){this.text=String(text||'Texte')}
 async setImageBlob(blob,kind='image'){this.imageData=blob?await normalizedImageDataUrl(blob):null;this.imageKind=kind;return this.imageData}
 setImageData(dataUrl,kind='image'){this.imageData=dataUrl||null;this.imageKind=kind}
 setStamp({template,imageData}={}){if(template!=null)this.stamp.template=String(template);if(imageData!==undefined)this.stamp.imageData=imageData}
 hasObjects(){return this.engine.pageAnnotations&&[...this.engine.pageAnnotations.values()].some(a=>a?.length)}
 pointPct(ev,wrap){const r=wrap.getBoundingClientRect();return{x:clamp((ev.clientX-r.left)/r.width*100,0,99),y:clamp((ev.clientY-r.top)/r.height*100,0,99)}}
 add(page,obj){return this.engine.addAnnotation(page,{id:uid(),rotation:0,opacity:this.style.opacity,locked:false,...obj})}
 addAt(page,x,y,type=this.tool){
  if(type==='text')return this.add(page,{type:'text',xPct:x,yPct:y,text:this.text,fontSize:this.style.fontSize,color:this.style.color,wPct:28});
  if(type==='highlight')return this.add(page,{type:'highlight',xPct:x,yPct:y,wPct:24,hPct:5,color:this.style.highlightColor,opacity:.35});
  if(type==='image'||type==='signature'){if(!this.imageData)throw new Error(type==='signature'?'Choisissez une signature ou un paraphe':'Choisissez une image');return this.add(page,{type,xPct:x,yPct:y,wPct:type==='signature'?24:22,dataUrl:this.imageData})}
  if(type==='stamp'){const text=this.templates?.resolve?.(this.stamp.template,this.engine.fileName,{PAGE:page,PAGES:this.engine.pageCount})||this.stamp.template;return this.add(page,{type:'stamp',xPct:x,yPct:y,wPct:30,text,fontSize:this.style.fontSize,color:'#A1453F',imageDataUrl:this.stamp.imageData||null})}
  if(type==='redaction')return this.add(page,{type:'redaction',xPct:x,yPct:y,wPct:25,hPct:7,color:'#000000',opacity:1});
  return null
 }
 selected(){for(const arr of this.engine.pageAnnotations.values())for(const a of arr)if(a.id===this.selectedId)return a;return null}
 updateSelected(patch={}){const a=this.selected();if(!a)return null;Object.assign(a,patch);this.engine.dispatchEvent(new Event('annotations'));this.render();return a}
 rotateSelected(delta){const a=this.selected();if(!a)return null;a.rotation=(Number(a.rotation)||0)+Number(delta||0);while(a.rotation>360)a.rotation-=360;while(a.rotation<-360)a.rotation+=360;this.engine.dispatchEvent(new Event('annotations'));this.render();return a}
 setSelectedRotation(value){const a=this.selected();if(!a)return null;a.rotation=Number(value)||0;this.engine.dispatchEvent(new Event('annotations'));this.render();return a}
 toggleLock(){const a=this.selected();if(!a)return null;a.locked=!a.locked;this.engine.dispatchEvent(new Event('annotations'));this.render();return a}
 deleteSelected(){if(!this.selectedId)return false;const ok=this.engine.removeAnnotation(this.selectedId);if(ok)this.selectedId=null;return ok}
 render(){
  if(!this.mainHost)return;
  for(const tile of this.mainHost.querySelectorAll('.pageTile')){
   const page=Number(tile.dataset.page),canvas=tile.querySelector('canvas');if(!canvas)continue;tile.classList.add('objectLayerHost');
   let layer=tile.querySelector('.pageObjectLayer');if(!layer){layer=document.createElement('div');layer.className='pageObjectLayer';tile.append(layer)}
   layer.dataset.page=page;layer.style.pointerEvents=this.tool==='select'?'auto':'auto';layer.innerHTML='';
   const anns=this.engine.annotations(page),all=[...anns];if(this.penDraft?.page===page)all.push({...this.penDraft,id:'__draft'});
   for(const a of all)this.renderObject(layer,tile,a,page);
   layer.onpointerdown=e=>this.surfaceDown(e,layer,tile,page);
   layer.onpointermove=e=>this.surfaceMove(e,layer,tile,page);
   layer.onpointerup=e=>this.surfaceUp(e,layer,tile,page);
  }
 }
 surfaceDown(e,layer,tile,page){
  if(e.target.closest('.pdfObject'))return;
  if(this.tool==='select'){this.selectedId=null;this.render();return}
  const p=this.pointPct(e,tile);
  if(this.tool==='pen'){this.penDraft={page,points:[p],type:'pen',color:this.style.color,width:this.style.penWidth,opacity:this.style.opacity};layer.setPointerCapture?.(e.pointerId);return}
  try{const obj=this.addAt(page,p.x,p.y,this.tool);if(obj){this.selectedId=obj.id;this.setTool('select')}}catch(err){this.dispatchEvent(new CustomEvent('error',{detail:{error:err}}))}
 }
 surfaceMove(e,layer,tile,page){if(this.tool==='pen'&&this.penDraft?.page===page){this.penDraft.points.push(this.pointPct(e,tile));this.render()}}
 surfaceUp(e,layer,tile,page){if(this.tool==='pen'&&this.penDraft?.page===page){if(this.penDraft.points.length>1){const obj=this.add(page,{type:'pen',points:this.penDraft.points,color:this.penDraft.color,width:this.penDraft.width,opacity:this.penDraft.opacity});this.selectedId=obj.id}this.penDraft=null;this.setTool('select')}}
 renderObject(layer,tile,a,page){
  const rect=tile.getBoundingClientRect();
  if(a.type==='pen'){
   const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.classList.add('pdfObject','penObject');svg.dataset.objectId=a.id;svg.setAttribute('viewBox','0 0 '+Math.max(1,rect.width)+' '+Math.max(1,rect.height));
   const pl=document.createElementNS(svg.namespaceURI,'polyline');pl.setAttribute('fill','none');pl.setAttribute('stroke',a.color||'#316D9A');pl.setAttribute('stroke-width',String(a.width||2));pl.setAttribute('points',(a.points||[]).map(p=>(p.x/100*rect.width)+','+(p.y/100*rect.height)).join(' '));pl.setAttribute('vector-effect','non-scaling-stroke');svg.append(pl);if(a.id===this.selectedId)svg.classList.add('selected');if(a.id!=='__draft')svg.onclick=e=>{e.stopPropagation();this.selectedId=a.id;this.render()};layer.append(svg);return
  }
  const el=document.createElement('div');el.className='pdfObject '+a.type+(a.id===this.selectedId?' selected':'')+(a.locked?' locked':'');el.dataset.objectId=a.id;el.style.left=(a.xPct||0)+'%';el.style.top=(a.yPct||0)+'%';el.style.opacity=String(a.opacity??1);el.style.transform='rotate('+(Number(a.rotation)||0)+'deg)';el.style.color=a.color||this.style.color;if(a.wPct)el.style.width=a.wPct+'%';
  if(a.type==='highlight'||a.type==='redaction'){el.style.height=Math.max(14,(a.hPct||5)/100*rect.height)+'px';el.style.background=a.type==='redaction'?'#000':(a.color||'#FFEB3B');if(a.type==='highlight')el.style.opacity=String(a.opacity??.35)}
  else if(a.type==='image'||a.type==='signature')el.innerHTML='<img src="'+a.dataUrl+'" alt="">';
  else if(a.type==='stamp'){let h='';if(a.imageDataUrl)h+='<img src="'+a.imageDataUrl+'" alt="">';h+='<span>'+String(a.text||'').replace(/[&<>]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[m])).replace(/\n/g,'<br>')+'</span>';el.innerHTML=h;el.style.fontSize=(a.fontSize||12)+'px'}
  else {el.textContent=a.text||'';el.style.fontSize=(a.fontSize||12)+'px'}
  el.onpointerdown=e=>{if(this.tool!=='select')return;e.stopPropagation();this.selectedId=a.id;this.dispatchEvent(new CustomEvent('select',{detail:{object:a,page}}));if(a.locked){this.render();return}const start=this.pointPct(e,tile),sx=a.xPct||0,sy=a.yPct||0;el.setPointerCapture?.(e.pointerId);const mv=ev=>{const p=this.pointPct(ev,tile);a.xPct=clamp(sx+p.x-start.x,0,97);a.yPct=clamp(sy+p.y-start.y,0,97);el.style.left=a.xPct+'%';el.style.top=a.yPct+'%'};const up=()=>{el.removeEventListener('pointermove',mv);el.removeEventListener('pointerup',up);this.engine.dispatchEvent(new Event('annotations'));this.render()};el.addEventListener('pointermove',mv);el.addEventListener('pointerup',up);this.render()};
  if(a.id===this.selectedId&&!a.locked){const h=document.createElement('span');h.className='pdfObjectResize';h.title='Redimensionner';h.onpointerdown=e=>{e.stopPropagation();const start=this.pointPct(e,tile),sw=a.wPct||20,sh=a.hPct||5;h.setPointerCapture?.(e.pointerId);const mv=ev=>{const p=this.pointPct(ev,tile);a.wPct=clamp(sw+p.x-start.x,3,95);if(a.type==='highlight'||a.type==='redaction')a.hPct=clamp(sh+p.y-start.y,1,60);this.render()};const up=()=>{h.removeEventListener('pointermove',mv);h.removeEventListener('pointerup',up);this.engine.dispatchEvent(new Event('annotations'))};h.addEventListener('pointermove',mv);h.addEventListener('pointerup',up)};el.append(h)}
  layer.append(el)
 }
 async exportBytes(){
  const doc=await PDFLib.PDFDocument.load(await this.engine.baseBytes(),{ignoreEncryption:true}),font=await doc.embedFont(PDFLib.StandardFonts.Helvetica);
  for(let p=1;p<=doc.getPageCount();p++){const page=doc.getPage(p-1),{width,height}=page.getSize();for(const a of this.engine.annotations(p)){const c=hexRgb(a.color),color=PDFLib.rgb(c.r,c.g,c.b),x=(a.xPct||0)/100*width,yTop=(a.yPct||0)/100*height;
   if(a.type==='text'||a.type==='stamp'){let textY=height-yTop-(a.fontSize||12);if(a.type==='stamp'&&a.imageDataUrl){const d=dataUrlBytes(a.imageDataUrl),img=d.type==='png'?await doc.embedPng(d.bytes):await doc.embedJpg(d.bytes),w=(a.wPct||30)/100*width,h=w*(img.height/img.width);page.drawImage(img,{x,y:height-yTop-h,width:w,height:h,opacity:a.opacity??1});textY=height-yTop-h-(a.fontSize||12)-4}for(const [i,line] of String(a.text||'').split(/\n/).entries())page.drawText(line,{x,y:textY-i*(a.fontSize||12)*1.25,size:a.fontSize||12,font,color,rotate:PDFLib.degrees(Number(a.rotation)||0),opacity:a.opacity??1})}
   else if(a.type==='highlight'||a.type==='redaction'){page.drawRectangle({x,y:height-yTop-(a.hPct||5)/100*height,width:(a.wPct||20)/100*width,height:(a.hPct||5)/100*height,color:a.type==='redaction'?PDFLib.rgb(0,0,0):color,opacity:a.opacity??(a.type==='highlight'?.35:1),rotate:PDFLib.degrees(Number(a.rotation)||0)})}
   else if(a.type==='image'||a.type==='signature'){const d=dataUrlBytes(a.dataUrl),img=d.type==='png'?await doc.embedPng(d.bytes):await doc.embedJpg(d.bytes),w=(a.wPct||20)/100*width,h=w*(img.height/img.width);page.drawImage(img,{x,y:height-yTop-h,width:w,height:h,rotate:PDFLib.degrees(Number(a.rotation)||0),opacity:a.opacity??1})}
   else if(a.type==='pen'&&a.points?.length>1){for(let i=1;i<a.points.length;i++){const A=a.points[i-1],B=a.points[i];page.drawLine({start:{x:A.x/100*width,y:height-A.y/100*height},end:{x:B.x/100*width,y:height-B.y/100*height},thickness:a.width||2,color,opacity:a.opacity??1})}}
  }}
  return new Uint8Array(await doc.save())
 }
 async commitToEngine(){if(!this.hasObjects())return false;const bytes=await this.exportBytes();this.engine.pageAnnotations.clear();this.selectedId=null;await this.engine.setBytes(bytes);this.engine.dispatchEvent(new Event('annotations'));return true}
}
