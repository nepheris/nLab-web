const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));

export function fileToDataUrl(file){
 return new Promise((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve(r.result);r.onerror=()=>reject(r.error||new Error('Lecture image impossible'));r.readAsDataURL(file)})
}
export function loadImage(source){
 return new Promise((resolve,reject)=>{const im=new Image();im.onload=()=>resolve(im);im.onerror=()=>reject(new Error('Décodage image impossible'));im.src=typeof source==='string'?source:source?.src||source})
}
export function canvasToBlob(canvas,type='image/png',quality=.92){
 return new Promise((resolve,reject)=>canvas.toBlob(b=>b?resolve(b):reject(new Error('Export canvas impossible')),type,quality))
}
export function imageDimensions(source){return{width:Number(source?.naturalWidth||source?.videoWidth||source?.width||0),height:Number(source?.naturalHeight||source?.videoHeight||source?.height||0)}}

function applyAdjustments(ctx,w,h,{brightness=0,contrast=0,blackPoint=0,whitePoint=255}={}){
 const bp=clamp(Number(blackPoint)||0,0,254),wp=clamp(Number(whitePoint)||255,bp+1,255),br=clamp(Number(brightness)||0,-100,100)*2.55,ct=clamp(Number(contrast)||0,-100,100),factor=(259*(ct+255))/(255*(259-ct));
 if(!br&&!ct&&bp===0&&wp===255)return;
 const im=ctx.getImageData(0,0,w,h),d=im.data,span=wp-bp;
 for(let i=0;i<d.length;i+=4)for(let k=0;k<3;k++){let v=(d[i+k]-bp)*255/span;v=factor*(v-128)+128+br;d[i+k]=clamp(v,0,255)}
 ctx.putImageData(im,0,0)
}
function applyCleanup(ctx,w,h,mode='original',threshold=155){
 if(mode==='original')return;
 const im=ctx.getImageData(0,0,w,h),d=im.data;
 for(let i=0;i<d.length;i+=4){
  const g=.299*d[i]+.587*d[i+1]+.114*d[i+2];
  if(mode==='gray')d[i]=d[i+1]=d[i+2]=g;
  else if(mode==='document'){const v=clamp((g-128)*1.55+150,0,255);d[i]=d[i+1]=d[i+2]=v}
  else if(mode==='bw'||mode==='binary'){const v=g>clamp(Number(threshold)||155,0,255)?255:0;d[i]=d[i+1]=d[i+2]=v}
 }
 ctx.putImageData(im,0,0)
}

export function renderImageTransformed(canvas,source,{rotation=0,deskew=0,flipX=false,flipY=false,cleanup='original',threshold=155,brightness=0,contrast=0,blackPoint=0,whitePoint=255,background=null}={}){
 if(!canvas||!source)throw new Error('Canvas ou image absent');
 const {width:sw,height:sh}=imageDimensions(source);if(!sw||!sh)throw new Error('Dimensions image invalides');
 const total=(Number(rotation||0)+Number(deskew||0))*Math.PI/180,cos=Math.abs(Math.cos(total)),sin=Math.abs(Math.sin(total));
 const w=Math.max(1,Math.ceil(sw*cos+sh*sin)),h=Math.max(1,Math.ceil(sw*sin+sh*cos)),ctx=canvas.getContext('2d');
 canvas.width=w;canvas.height=h;ctx.setTransform(1,0,0,1,0,0);ctx.clearRect(0,0,w,h);
 if(background){ctx.fillStyle=background;ctx.fillRect(0,0,w,h)}
 ctx.save();ctx.translate(w/2,h/2);ctx.rotate(total);ctx.scale(flipX?-1:1,flipY?-1:1);ctx.drawImage(source,-sw/2,-sh/2);ctx.restore();
 applyCleanup(ctx,w,h,cleanup,threshold);applyAdjustments(ctx,w,h,{brightness,contrast,blackPoint,whitePoint});return canvas
}
export function transformedCanvas(source,options={}){
 const c=document.createElement('canvas');return renderImageTransformed(c,source,options)
}
export function resizeCanvas(source,width,height){
 const c=document.createElement('canvas'),w=Math.max(1,Math.round(Number(width)||1)),h=Math.max(1,Math.round(Number(height)||1));c.width=w;c.height=h;c.getContext('2d').drawImage(source,0,0,w,h);return c
}
export function cropCanvas(source,rect={}){
 const {width:sw,height:sh}=imageDimensions(source),x=clamp(Math.round(Number(rect.x)||0),0,sw),y=clamp(Math.round(Number(rect.y)||0),0,sh),w=clamp(Math.round(Number(rect.w)||sw),1,sw-x||1),h=clamp(Math.round(Number(rect.h)||sh),1,sh-y||1);
 const c=document.createElement('canvas');c.width=w;c.height=h;c.getContext('2d').drawImage(source,x,y,w,h,0,0,w,h);return c
}
export async function transformImageFile(file,options={}){
 const src=await fileToDataUrl(file),im=await loadImage(src);let c=transformedCanvas(im,options);
 if(options.crop)c=cropCanvas(c,options.crop);
 if(options.width||options.height){const ratio=c.width/c.height,w=Number(options.width)||Math.round(Number(options.height)*ratio),h=Number(options.height)||Math.round(Number(options.width)/ratio);c=resizeCanvas(c,w,h)}
 const type=options.type||file.type||'image/png',quality=options.quality??.92,blob=await canvasToBlob(c,type,quality),name=options.name||file.name||'image.png',out=new File([blob],name,{type:blob.type,lastModified:file.lastModified||Date.now()});
 const rel=file.webkitRelativePath||file.__relativePath;if(rel)try{Object.defineProperty(out,'__relativePath',{value:rel,configurable:true})}catch{}
 return out
}
