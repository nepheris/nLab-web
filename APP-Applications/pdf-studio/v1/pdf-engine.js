import{uid,setStatus,fileStem}from'../../_shared/studio-v1/core.js';
const {PDFDocument,degrees}=PDFLib;
async function blobToDataURL(blob){return new Promise((res,rej)=>{const r=new FileReader();r.onload=()=>res(r.result);r.onerror=()=>rej(r.error);r.readAsDataURL(blob)})}
async function rasterImageBytes(file){const url=URL.createObjectURL(file);try{return await new Promise((res,rej)=>{const im=new Image();im.onload=()=>{const c=document.createElement('canvas');c.width=im.naturalWidth;c.height=im.naturalHeight;c.getContext('2d').drawImage(im,0,0);c.toBlob(async b=>b?res(await b.arrayBuffer()):rej(new Error('Rasterisation image impossible')),'image/png')};im.onerror=()=>rej(new Error('Format image non décodable par le navigateur'));im.src=url})}finally{setTimeout(()=>URL.revokeObjectURL(url),1000)}}
async function imageFileToPdf(file){let data=await file.arrayBuffer(),doc=await PDFDocument.create(),img;if(/png/i.test(file.type)||/\.png$/i.test(file.name))img=await doc.embedPng(data);else if(/jpe?g/i.test(file.type)||/\.jpe?g$/i.test(file.name))img=await doc.embedJpg(data);else{data=await rasterImageBytes(file);img=await doc.embedPng(data)}const w=img.width,h=img.height,maxW=595,maxH=842,ratio=Math.min(maxW/w,maxH/h,1),pw=w*ratio,ph=h*ratio,p=doc.addPage([pw,ph]);p.drawImage(img,{x:0,y:0,width:pw,height:ph});return new Uint8Array(await doc.save())}
function safePdfText(s){return String(s??'').normalize('NFKC').replace(/[\u2018\u2019]/g,"'").replace(/[\u201C\u201D]/g,'"').replace(/[\u2013\u2014]/g,'-').replace(/\u2026/g,'...').replace(/[^\x09\x0A\x0D\x20-\x7E\xA0-\xFF]/g,'?')}
async function textToPdf(text){const doc=await PDFDocument.create(),font=await doc.embedFont(PDFLib.StandardFonts.Helvetica);let page=doc.addPage([595,842]),y=800;for(const para of safePdfText(text).split(/\n+/)){for(const line of wrap(para,88)){if(y<45){page=doc.addPage([595,842]);y=800}page.drawText(line,{x:42,y,size:10,font,color:PDFLib.rgb(.08,.12,.16)});y-=14}y-=5}return new Uint8Array(await doc.save())}
async function docxFileToPdf(file){if(!window.mammoth)throw new Error('Mammoth DOCX non chargé');const r=await mammoth.extractRawText({arrayBuffer:await file.arrayBuffer()});return textToPdf(r.value||'')}
async function odtFileToPdf(file){if(!window.JSZip)throw new Error('JSZip indisponible');const z=await JSZip.loadAsync(await file.arrayBuffer()),entry=z.file('content.xml');if(!entry)throw new Error('ODT invalide : content.xml absent');const xml=await entry.async('text'),doc=new DOMParser().parseFromString(xml,'application/xml'),nodes=[...doc.getElementsByTagNameNS('*','p'),...doc.getElementsByTagNameNS('*','h')],text=nodes.map(n=>n.textContent||'').join('\n');return textToPdf(text)}
async function txtFileToPdf(file){let text=await file.text();if(/\.html?$/i.test(file.name)){const d=new DOMParser().parseFromString(text,'text/html');text=d.body?.innerText||d.documentElement?.textContent||text}return textToPdf(text)}
async function spreadsheetFileToPdf(file){if(!window.XLSX)throw new Error('Moteur tableur non chargé');const wb=XLSX.read(await file.arrayBuffer(),{type:'array'}),parts=[];for(const name of wb.SheetNames.slice(0,8)){parts.push('=== '+name+' ===');parts.push(XLSX.utils.sheet_to_csv(wb.Sheets[name],{FS:' ; '}))}return textToPdf(parts.join('\n'))}
function wrap(s,n){const words=String(s||'').split(/\s+/),out=[],a=[];let len=0;for(const w of words){if(len+w.length+1>n&&a.length){out.push(a.join(' '));a.length=0;len=0}a.push(w);len+=w.length+1}if(a.length)out.push(a.join(' '));return out.length?out:['']}
export class PDFEngine extends EventTarget{
 constructor(){super();this.bytes=null;this.pdfDoc=null;this.pdfjs=null;this.pageRenderTask=null;this.pageRenderQueue=Promise.resolve();this.fileName='document.pdf';this.currentPage=1;this.selected=new Set();this.pageAnnotations=new Map();this.sourceFile=null;this.dirty=false}
 get pageCount(){return this.pdfDoc?.getPageCount?.()||0}
 clear(){this.bytes=null;this.pdfDoc=null;this.pdfjs=null;this.sourceFile=null;this.fileName='document.pdf';this.currentPage=1;this.selected.clear();this.pageAnnotations.clear();this.dirty=false;this.dispatchEvent(new Event('change'));return this}
 async loadFile(file){this.sourceFile=file;this.fileName=file.name||'document.pdf';let bytes;if(/\.pdf$/i.test(file.name)||file.type==='application/pdf')bytes=new Uint8Array(await file.arrayBuffer());else if(/^image\//.test(file.type)||/\.(png|jpe?g|webp|gif|bmp|svg)$/i.test(file.name))bytes=await imageFileToPdf(file);else if(/\.docx$/i.test(file.name))bytes=await docxFileToPdf(file);else if(/\.odt$/i.test(file.name))bytes=await odtFileToPdf(file);else if(/\.(xlsx|xls|ods)$/i.test(file.name))bytes=await spreadsheetFileToPdf(file);else if(/\.(txt|md|markdown|csv|tsv|json|ya?ml|xml|html?)$/i.test(file.name)||/^text\//.test(file.type)||/application\/(json|xml)/.test(file.type))bytes=await txtFileToPdf(file);else throw new Error('Aperçu PDF rapide indisponible pour : '+file.name+' — utiliser Conversion Studio pour ce format.');await this.setBytes(bytes,{resetAnnotations:true});setStatus(this.fileName+' · '+this.pageCount+' page(s)');return this}
 async setBytes(bytes,{resetAnnotations=false}={}){this.bytes=bytes instanceof Uint8Array?bytes:new Uint8Array(bytes);this.pdfDoc=await PDFDocument.load(this.bytes,{ignoreEncryption:true});this.pdfjs=await pdfjsLib.getDocument({data:this.bytes.slice()}).promise;this.currentPage=Math.min(Math.max(1,this.currentPage),this.pageCount||1);this.selected=new Set([...this.selected].filter(p=>p<=this.pageCount));if(resetAnnotations)this.pageAnnotations.clear();this.dirty=true;this.dispatchEvent(new Event('change'))}
 targetPages(scope='current'){if(!this.pageCount)return[];if(scope==='all')return Array.from({length:this.pageCount},(_,i)=>i+1);if(scope==='selected')return [...this.selected].filter(p=>p>=1&&p<=this.pageCount).sort((a,b)=>a-b);return[this.currentPage]}
 selectPage(page){this.currentPage=Math.max(1,Math.min(this.pageCount,page));this.dispatchEvent(new CustomEvent('page',{detail:{page:this.currentPage}}))}
 toggleSelected(page,v){if(v)this.selected.add(page);else this.selected.delete(page);this.dispatchEvent(new Event('selection'))}
 selectAll(){this.selected=new Set(Array.from({length:this.pageCount},(_,i)=>i+1));this.dispatchEvent(new Event('selection'))}
 selectNone(){this.selected.clear();this.dispatchEvent(new Event('selection'))}
 async renderPage(canvas,page=this.currentPage,zoom=1){
  if(!this.pdfjs)return null;
  const job=async()=>{
    const p=await this.pdfjs.getPage(page),vp=p.getViewport({scale:zoom});
    canvas.width=Math.ceil(vp.width);canvas.height=Math.ceil(vp.height);canvas.style.width=canvas.width+'px';canvas.style.height=canvas.height+'px';
    const task=p.render({canvasContext:canvas.getContext('2d'),viewport:vp});this.pageRenderTask=task;
    try{await task.promise}catch(e){if(e?.name==='RenderingCancelledException')return null;throw e}finally{if(this.pageRenderTask===task)this.pageRenderTask=null}
    return vp
  };
  const queued=this.pageRenderQueue.catch(()=>{}).then(job);
  this.pageRenderQueue=queued.then(()=>undefined,()=>undefined);
  return queued
}
 async renderThumb(canvas,page,zoom=.2){if(!this.pdfjs)return;const p=await this.pdfjs.getPage(page),vp=p.getViewport({scale:zoom});canvas.width=Math.ceil(vp.width);canvas.height=Math.ceil(vp.height);await p.render({canvasContext:canvas.getContext('2d'),viewport:vp}).promise;return vp}
 async rotate(pages,delta){if(!pages.length)return;for(const n of pages){const p=this.pdfDoc.getPage(n-1),a=p.getRotation()?.angle||0;p.setRotation(degrees((a+delta+360)%360))}await this.setBytes(new Uint8Array(await this.pdfDoc.save()));return pages}
 async addBlank(after=this.currentPage){const ref=this.pdfDoc.getPage(Math.max(0,after-1)),{width,height}=ref.getSize();this.pdfDoc.insertPage(after,[width,height]);this.shiftAnnotations(after+1,1);this.currentPage=after+1;await this.setBytes(new Uint8Array(await this.pdfDoc.save()));return this.currentPage}
 async movePage(from,to){from=Number(from);to=Number(to);if(from===to||from<1||to<1||from>this.pageCount||to>this.pageCount)return;const order=Array.from({length:this.pageCount},(_,i)=>i+1),[moved]=order.splice(from-1,1);order.splice(to-1,0,moved);const out=await PDFDocument.create(),newMap=new Map();for(let i=0;i<order.length;i++){const oldPage=order[i],[cp]=await out.copyPages(this.pdfDoc,[oldPage-1]);out.addPage(cp);if(this.pageAnnotations.has(oldPage))newMap.set(i+1,this.pageAnnotations.get(oldPage))}this.pageAnnotations=newMap;this.currentPage=to;this.selected=new Set([...this.selected].map(p=>order.indexOf(p)+1).filter(Boolean));await this.setBytes(new Uint8Array(await out.save()));return to}
 async duplicate(page=this.currentPage){const out=await PDFDocument.create();for(let i=0;i<this.pageCount;i++){const [cp]=await out.copyPages(this.pdfDoc,[i]);out.addPage(cp);if(i===page-1){const [dup]=await out.copyPages(this.pdfDoc,[i]);out.addPage(dup)}}this.shiftAnnotations(page+1,1);const originals=this.pageAnnotations.get(page)||[];if(originals.length)this.pageAnnotations.set(page+1,structuredClone(originals));this.currentPage=page+1;await this.setBytes(new Uint8Array(await out.save()))}
 async deletePages(pages){const set=new Set(pages);if(!set.size)return;if(set.size>=this.pageCount)throw new Error('Impossible de supprimer toutes les pages');const out=await PDFDocument.create(),map=new Map();let newIndex=0;for(let i=1;i<=this.pageCount;i++){if(set.has(i))continue;const [cp]=await out.copyPages(this.pdfDoc,[i-1]);out.addPage(cp);newIndex++;if(this.pageAnnotations.has(i))map.set(newIndex,this.pageAnnotations.get(i))}this.pageAnnotations=map;this.selected.clear();this.currentPage=Math.min(this.currentPage,out.getPageCount());await this.setBytes(new Uint8Array(await out.save()))}
 async extractPages(pages){if(!pages.length)throw new Error('Aucune page à extraire');const out=await PDFDocument.create(),copies=await out.copyPages(this.pdfDoc,pages.map(x=>x-1));copies.forEach(p=>out.addPage(p));return new Uint8Array(await out.save())}
 async mergeFiles(files){const out=await PDFDocument.create();for(const f of files){if(!/\.pdf$/i.test(f.name))continue;const d=await PDFDocument.load(await f.arrayBuffer(),{ignoreEncryption:true}),copies=await out.copyPages(d,d.getPageIndices());copies.forEach(p=>out.addPage(p))}if(!out.getPageCount())throw new Error('Aucun PDF à fusionner');this.fileName='fusion.pdf';this.pageAnnotations.clear();await this.setBytes(new Uint8Array(await out.save()),{resetAnnotations:true})}
 async insertPdfFile(file,{position='after-current'}={}){
  if(!this.pdfDoc||!this.pageCount)throw new Error('Aucun document courant');
  if(!(file instanceof Blob)||(!/\.pdf$/i.test(file.name||'')&&file.type!=='application/pdf'))throw new Error('Sélectionnez un fichier PDF');
  const incoming=await PDFDocument.load(await file.arrayBuffer(),{ignoreEncryption:true}),count=incoming.getPageCount();if(!count)throw new Error('PDF source vide');
  const out=await PDFDocument.create();
  let insertAt=this.pageCount;
  if(position==='start')insertAt=0;
  else if(position==='before-current')insertAt=Math.max(0,this.currentPage-1);
  else if(position==='after-current')insertAt=Math.min(this.pageCount,this.currentPage);
  else if(position==='end')insertAt=this.pageCount;
  const newMap=new Map();let newIndex=0;
  for(let i=0;i<=this.pageCount;i++){
   if(i===insertAt){
    const copies=await out.copyPages(incoming,incoming.getPageIndices());for(const p of copies){out.addPage(p);newIndex++}
   }
   if(i<this.pageCount){
    const [cp]=await out.copyPages(this.pdfDoc,[i]);out.addPage(cp);newIndex++;
    const oldPage=i+1;if(this.pageAnnotations.has(oldPage))newMap.set(newIndex,this.pageAnnotations.get(oldPage))
   }
  }
  this.pageAnnotations=newMap;this.selected.clear();this.currentPage=Math.max(1,insertAt+1);
  await this.setBytes(new Uint8Array(await out.save()));return{insertAt:insertAt+1,count}
 }
 async mergePdfBytes(entries,{fileName='fusion.pdf'}={}){
  const out=await PDFDocument.create(),sources=[];
  for(const entry of entries||[]){
   const name=entry?.name||'document.pdf',bytes=entry?.bytes instanceof Uint8Array?entry.bytes:new Uint8Array(entry?.bytes||[]);
   if(!bytes.length)continue;const d=await PDFDocument.load(bytes,{ignoreEncryption:true}),count=d.getPageCount();if(!count)continue;
   const copies=await out.copyPages(d,d.getPageIndices());copies.forEach(p=>out.addPage(p));sources.push({name,pages:count})
  }
  if(!out.getPageCount())throw new Error('Aucun PDF à fusionner');
  this.sourceFile=null;this.fileName=fileName;this.pageAnnotations.clear();this.currentPage=1;this.selected.clear();
  await this.setBytes(new Uint8Array(await out.save()),{resetAnnotations:true});return sources
 }
 async applyImageOverlay(blob,pages,{position='bottom-right',widthPct=24,xPct=70,yPct=6,opacity=1,margin=24}={}){
  if(!(blob instanceof Blob))throw new Error('Image de signature invalide');
  const targets=[...new Set((pages||[]).map(Number).filter(n=>n>=1&&n<=this.pageCount))];if(!targets.length)throw new Error('Aucune page cible');
  let bytes=await blob.arrayBuffer(),img;
  if(/png/i.test(blob.type))img=await this.pdfDoc.embedPng(bytes);
  else if(/jpe?g/i.test(blob.type))img=await this.pdfDoc.embedJpg(bytes);
  else{bytes=await rasterImageBytes(blob);img=await this.pdfDoc.embedPng(bytes)}
  for(const n of targets){
   const page=this.pdfDoc.getPage(n-1),size=page.getSize(),pct=Math.max(3,Math.min(80,Number(widthPct)||24))/100,w=Math.max(24,size.width*pct),ratio=img.height/img.width,h=w*ratio;
   let x=margin,y=margin;
   if(position==='bottom-center')x=(size.width-w)/2;
   else if(position==='bottom-right')x=size.width-w-margin;
   else if(position==='top-left')y=size.height-h-margin;
   else if(position==='top-center'){x=(size.width-w)/2;y=size.height-h-margin}
   else if(position==='top-right'){x=size.width-w-margin;y=size.height-h-margin}
   else if(position==='custom'){x=(size.width-w)*Math.max(0,Math.min(100,Number(xPct)||0))/100;y=(size.height-h)*Math.max(0,Math.min(100,Number(yPct)||0))/100}
   x=Math.max(0,Math.min(size.width-w,x));y=Math.max(0,Math.min(size.height-h,y));
   page.drawImage(img,{x,y,width:w,height:h,opacity:Math.max(.05,Math.min(1,Number(opacity)||1))})
  }
  await this.setBytes(new Uint8Array(await this.pdfDoc.save()));return targets
 }
 addAnnotation(page,ann){const arr=this.pageAnnotations.get(page)||[];ann={id:ann.id||uid('ann'),...ann};arr.push(ann);this.pageAnnotations.set(page,arr);this.dirty=true;this.dispatchEvent(new Event('annotations'));return ann}
 removeAnnotation(id){for(const [p,a] of this.pageAnnotations){const n=a.filter(x=>x.id!==id);if(n.length!==a.length){this.pageAnnotations.set(p,n);this.dispatchEvent(new Event('annotations'));return true}}return false}
 annotations(page=this.currentPage){return this.pageAnnotations.get(page)||[]}
 shiftAnnotations(from,delta){const entries=[...this.pageAnnotations.entries()].sort((a,b)=>delta>0?b[0]-a[0]:a[0]-b[0]);for(const [p,a] of entries)if(p>=from){this.pageAnnotations.delete(p);this.pageAnnotations.set(p+delta,a)}}
 async baseBytes(){return new Uint8Array(await this.pdfDoc.save())}
 async pageText(page){if(!this.pdfjs)return'';const p=await this.pdfjs.getPage(page),tc=await p.getTextContent();return tc.items.map(x=>x.str).join(' ')}
 async pageRaster(page,{scale=2,type='image/jpeg',quality=.85,gray=false}={}){const p=await this.pdfjs.getPage(page),vp=p.getViewport({scale}),c=document.createElement('canvas');c.width=Math.ceil(vp.width);c.height=Math.ceil(vp.height);const ctx=c.getContext('2d');await p.render({canvasContext:ctx,viewport:vp}).promise;if(gray){const im=ctx.getImageData(0,0,c.width,c.height);for(let i=0;i<im.data.length;i+=4){const y=.299*im.data[i]+.587*im.data[i+1]+.114*im.data[i+2];im.data[i]=im.data[i+1]=im.data[i+2]=y}ctx.putImageData(im,0,0)}const blob=await new Promise(r=>c.toBlob(r,type,quality));return{blob,width:c.width,height:c.height,dataUrl:await blobToDataURL(blob)}}
}
export{fileStem};