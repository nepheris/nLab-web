import{formatInfo,fileTypeLabel}from'./format-registry.js';
const cache=new WeakMap();
function optionKey(o={}){return JSON.stringify({width:o.width||150,height:o.height||190,quality:o.quality??.48,page:o.page||1,textLines:o.textLines||14})}
function canvasData(lines,label='DOCUMENT',{width=150,height=190,quality=.48,textLines=14}={}){const c=document.createElement('canvas');c.width=width;c.height=height;const x=c.getContext('2d');x.fillStyle='#fff';x.fillRect(0,0,width,height);x.strokeStyle='#c9d3dc';x.strokeRect(.5,.5,width-1,height-1);x.fillStyle='#e9f2f8';x.fillRect(0,0,width,24);x.fillStyle='#315d7c';x.font='bold 10px Arial';x.fillText(label.slice(0,20),8,16);x.fillStyle='#4b5965';x.font='9px Arial';let y=40;for(const raw of lines.slice(0,textLines)){const s=String(raw||'').replace(/\s+/g,' ').slice(0,27);x.fillText(s,8,y);y+=10}return c.toDataURL('image/jpeg',quality)}
async function textOf(file,info){
 if(['txt','md','markdown','csv','tsv','json','yaml','yml','xml','html','htm'].includes(info.extension))return file.text();
 if(info.extension==='docx'&&window.mammoth){const r=await mammoth.extractRawText({arrayBuffer:await file.arrayBuffer()});return r.value||''}
 if(info.extension==='odt'&&window.JSZip){const z=await JSZip.loadAsync(await file.arrayBuffer()),e=z.file('content.xml');if(e){const xml=await e.async('text'),d=new DOMParser().parseFromString(xml,'application/xml');return d.documentElement?.textContent||''}}
 if(['xlsx','xls','ods'].includes(info.extension)&&window.XLSX){const wb=XLSX.read(await file.arrayBuffer(),{type:'array'}),ws=wb.Sheets[wb.SheetNames[0]];return XLSX.utils.sheet_to_csv(ws,{FS:' ; '})}
 return'';
}
async function imageThumb(file,{width=150,height=190,quality=.5}={}){
 const url=URL.createObjectURL(file);try{return await new Promise((res,rej)=>{const im=new Image();im.onload=()=>{const r=Math.min(width/im.naturalWidth,height/im.naturalHeight,1),c=document.createElement('canvas');c.width=Math.max(1,Math.round(im.naturalWidth*r));c.height=Math.max(1,Math.round(im.naturalHeight*r));c.getContext('2d').drawImage(im,0,0,c.width,c.height);res(c.toDataURL('image/jpeg',quality))};im.onerror=rej;im.src=url})}finally{setTimeout(()=>URL.revokeObjectURL(url),1000)}}
export async function thumbnailFor(file,options={}){
 if(!file)return null;let entries=cache.get(file);if(!entries){entries=new Map();cache.set(file,entries)}const key=optionKey(options);if(entries.has(key))return entries.get(key);
 const p=(async()=>{const info=formatInfo(file),width=options.width||150,height=options.height||190,quality=options.quality??.48,pageNo=Math.max(1,Number(options.page)||1);
  try{
   if(info.extension==='pdf'&&window.pdfjsLib){const pdf=await pdfjsLib.getDocument({data:new Uint8Array(await file.arrayBuffer())}).promise,p=await pdf.getPage(Math.min(pageNo,pdf.numPages)),base=p.getViewport({scale:1}),scale=Math.min(width/base.width,height/base.height,1),vp=p.getViewport({scale}),c=document.createElement('canvas');c.width=Math.max(1,Math.ceil(vp.width));c.height=Math.max(1,Math.ceil(vp.height));await p.render({canvasContext:c.getContext('2d'),viewport:vp}).promise;return{url:c.toDataURL('image/jpeg',quality),pages:pdf.numPages,page:Math.min(pageNo,pdf.numPages),family:info.family,extension:info.extension}}
   if(info.family==='image'&&!['tif','tiff'].includes(info.extension))return{url:await imageThumb(file,{width,height,quality}),pages:1,page:1,family:info.family,extension:info.extension};
   const txt=await textOf(file,info);if(txt)return{url:canvasData(txt.split(/\r?\n/),fileTypeLabel(file),{width,height,quality,textLines:options.textLines||14}),pages:null,page:null,family:info.family,extension:info.extension};
  }catch{}
  return{url:canvasData([file.name,Math.round((file.size||0)/1024)+' Ko'],fileTypeLabel(file),{width,height,quality,textLines:options.textLines||14}),pages:null,page:null,family:info.family,extension:info.extension};
 })();entries.set(key,p);return p
}
export function lightweightThumbnail(file){return thumbnailFor(file,{width:150,height:190,quality:.48,page:1})}
