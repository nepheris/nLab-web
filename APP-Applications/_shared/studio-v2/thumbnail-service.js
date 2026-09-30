import{formatInfo,fileTypeLabel}from'./format-registry.js';
const cache=new WeakMap();
function canvasData(lines,label='DOCUMENT',{width=150,height=190}={}){const c=document.createElement('canvas');c.width=width;c.height=height;const x=c.getContext('2d');x.fillStyle='#fff';x.fillRect(0,0,width,height);x.strokeStyle='#c9d3dc';x.strokeRect(.5,.5,width-1,height-1);x.fillStyle='#e9f2f8';x.fillRect(0,0,width,24);x.fillStyle='#315d7c';x.font='bold 10px Arial';x.fillText(label.slice(0,20),8,16);x.fillStyle='#4b5965';x.font='9px Arial';let y=40;for(const raw of lines.slice(0,14)){const s=String(raw||'').replace(/\s+/g,' ').slice(0,27);x.fillText(s,8,y);y+=10}return c.toDataURL('image/jpeg',.48)}
async function textOf(file,info){
 if(['txt','md','markdown','csv','tsv','json','yaml','yml','xml','html','htm'].includes(info.extension))return file.text();
 if(info.extension==='docx'&&window.mammoth){const r=await mammoth.extractRawText({arrayBuffer:await file.arrayBuffer()});return r.value||''}
 if(info.extension==='odt'&&window.JSZip){const z=await JSZip.loadAsync(await file.arrayBuffer()),e=z.file('content.xml');if(e){const xml=await e.async('text'),d=new DOMParser().parseFromString(xml,'application/xml');return d.documentElement?.textContent||''}}
 if(['xlsx','xls','ods'].includes(info.extension)&&window.XLSX){const wb=XLSX.read(await file.arrayBuffer(),{type:'array'}),ws=wb.Sheets[wb.SheetNames[0]];return XLSX.utils.sheet_to_csv(ws,{FS:' ; '})}
 return'';
}
async function imageThumb(file){
 const url=URL.createObjectURL(file);try{return await new Promise((res,rej)=>{const im=new Image();im.onload=()=>{const max=150,r=Math.min(max/im.naturalWidth,190/im.naturalHeight,1),c=document.createElement('canvas');c.width=Math.max(1,Math.round(im.naturalWidth*r));c.height=Math.max(1,Math.round(im.naturalHeight*r));c.getContext('2d').drawImage(im,0,0,c.width,c.height);res(c.toDataURL('image/jpeg',.5))};im.onerror=rej;im.src=url})}finally{setTimeout(()=>URL.revokeObjectURL(url),1000)}}
export async function lightweightThumbnail(file){
 if(!file)return null;if(cache.has(file))return cache.get(file);
 const p=(async()=>{const info=formatInfo(file);
  try{
   if(info.extension==='pdf'&&window.pdfjsLib){const pdf=await pdfjsLib.getDocument({data:new Uint8Array(await file.arrayBuffer())}).promise,p=await pdf.getPage(1),vp=p.getViewport({scale:.13}),c=document.createElement('canvas');c.width=Math.ceil(vp.width);c.height=Math.ceil(vp.height);await p.render({canvasContext:c.getContext('2d'),viewport:vp}).promise;return{url:c.toDataURL('image/jpeg',.48),pages:pdf.numPages}}
   if(info.family==='image'&&!['tif','tiff'].includes(info.extension))return{url:await imageThumb(file),pages:1};
   const txt=await textOf(file,info);if(txt)return{url:canvasData(txt.split(/\r?\n/),fileTypeLabel(file)),pages:null};
  }catch{}
  return{url:canvasData([file.name,Math.round((file.size||0)/1024)+' Ko'],fileTypeLabel(file)),pages:null};
 })();cache.set(file,p);return p
}
