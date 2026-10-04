import{canvasToBlob}from'./image-service.js';
const MAP={
 qrcode:{label:'QR',kind:'qr',bcid:'qrcode'},
 datamatrix:{label:'Data Matrix',kind:'bar',bcid:'datamatrix'},
 aztec:{label:'Aztec',kind:'bar',bcid:'azteccode'},
 pdf417:{label:'PDF417',kind:'bar',bcid:'pdf417'},
 code128:{label:'Code 128',kind:'bar',bcid:'code128'},
 'gs1-128':{label:'GS1-128',kind:'bar',bcid:'gs1-128'},
 code39:{label:'Code 39',kind:'bar',bcid:'code39'},
 ean13:{label:'EAN-13',kind:'bar',bcid:'ean13'},
 ean8:{label:'EAN-8',kind:'bar',bcid:'ean8'},
 upca:{label:'UPC-A',kind:'bar',bcid:'upca'},
 itf:{label:'ITF-14',kind:'bar',bcid:'interleaved2of5'},
 codabar:{label:'Codabar',kind:'bar',bcid:'rationalizedCodabar'}
};
export const SYMBOLOGIES=Object.entries(MAP).map(([id,x])=>({id,...x}));
export function symbologyInfo(id){return MAP[id]||MAP.qrcode}
export function defaultPayload(id){
 const v={qrcode:'https://example.test/nlab',datamatrix:'NLAB-DEMO-DATAMATRIX-001',aztec:'NLAB-DEMO-AZTEC-001',pdf417:'NLAB-DEMO-PDF417-001',code128:'NLAB-DEMO-CODE128-001','gs1-128':'(01)09501101530003(10)ABC123',code39:'NLAB39',ean13:'123456789012',ean8:'1234567',upca:'12345678901',itf:'1234567890123',codabar:'A123456A'};return v[id]||'NLAB-DEMO'
}
export function normalizePayload(id,value=''){
 let v=String(value||'').trim()||defaultPayload(id);
 if(id==='ean13')v=v.replace(/\D/g,'').slice(0,13);
 if(id==='ean8')v=v.replace(/\D/g,'').slice(0,8);
 if(id==='upca')v=v.replace(/\D/g,'').slice(0,12);
 if(id==='itf')v=v.replace(/\D/g,'').slice(0,14);
 return v
}
export function bwipOptions(id,value,common={}){
 const info=symbologyInfo(id),opts={bcid:info.bcid,text:normalizePayload(id,value),scale:4,backgroundcolor:(common.bg||'#ffffff').replace('#',''),barcolor:(common.fg||'#000000').replace('#',''),paddingwidth:(common.margin||0)/2,paddingheight:(common.margin||0)/2};
 if(['code128','gs1-128','code39','ean13','ean8','upca','itf','codabar'].includes(id)){opts.height=20;opts.includetext=true;opts.textxalign='center'}
 return opts
}
export function validatePayload(id,value){
 const v=normalizePayload(id,value);
 if(id==='ean13'&&![12,13].includes(v.length))return{ok:false,message:'EAN-13 attend 12 ou 13 chiffres.'};
 if(id==='ean8'&&![7,8].includes(v.length))return{ok:false,message:'EAN-8 attend 7 ou 8 chiffres.'};
 if(id==='upca'&&![11,12].includes(v.length))return{ok:false,message:'UPC-A attend 11 ou 12 chiffres.'};
 if(id==='itf'&&v.length<2)return{ok:false,message:'ITF attend une donnée numérique.'};
 return{ok:true,value:v}
}


function qrOptions(value,common={}){
 const size=Number(common.size)||360,margin=Number(common.margin)||0,fg=common.fg||'#000000',bg=common.bg||'#ffffff';
 const gradient=common.gradient?{type:common.gradientType||'linear',rotation:Number(common.gradientRotation??Math.PI/4),colorStops:[{offset:0,color:fg},{offset:1,color:common.fg2||fg}]}:undefined;
 return{
  width:size,height:size,type:common.renderType||'svg',data:String(value||' '),margin,
  qrOptions:{errorCorrectionLevel:common.ecc||'M'},
  dotsOptions:{type:common.dots||'square',color:fg,gradient},
  cornersSquareOptions:{type:common.corners||'square',color:common.cornerColor||fg},
  cornersDotOptions:{type:common.cornerDots||'square',color:common.cornerDotColor||common.fg2||fg},
  backgroundOptions:{color:common.transparent?'transparent':bg},
  image:common.logo||undefined,
  imageOptions:{hideBackgroundDots:common.hideBackgroundDots!==false,imageSize:Number(common.logoSize)||.24,margin:Number(common.logoMargin)||5,crossOrigin:'anonymous'}
 }
}
function ensureQr(){if(typeof globalThis.QRCodeStyling!=='function')throw new Error('Moteur QR indisponible')}
function ensureBwip(){if(!globalThis.bwipjs?.toCanvas)throw new Error('Moteur code-barres indisponible')}
export async function renderSymbology(host,id,value,options={}){
 if(!host)throw new Error('Zone de rendu absente');host.innerHTML='';
 const info=symbologyInfo(id),valid=validatePayload(id,value);if(!valid.ok)throw new Error(valid.message);
 if(info.kind==='qr'){
  ensureQr();const qr=new QRCodeStyling(qrOptions(valid.value,{...options,renderType:'svg'}));qr.append(host);return{kind:'qr',value:valid.value,instance:qr,host}
 }
 ensureBwip();const canvas=document.createElement('canvas');bwipjs.toCanvas(canvas,{...bwipOptions(id,valid.value,options),scale:Number(options.scale)||4});host.append(canvas);return{kind:'bar',value:valid.value,canvas,host}
}
export async function generateSymbologyBlob(id,value,options={},format='png'){
 const info=symbologyInfo(id),valid=validatePayload(id,value);if(!valid.ok)throw new Error(valid.message);
 const ext=String(format||'png').toLowerCase();
 if(info.kind==='qr'){
  ensureQr();const qr=new QRCodeStyling(qrOptions(valid.value,{...options,renderType:ext==='svg'?'svg':'canvas'}));const blob=await qr.getRawData(ext==='svg'?'svg':'png');if(!blob)throw new Error('Génération QR impossible');return{blob,value:valid.value,type:id,format:ext}
 }
 ensureBwip();
 if(ext==='svg'&&typeof bwipjs.toSVG==='function'){
  const svg=bwipjs.toSVG({...bwipOptions(id,valid.value,options),scale:Number(options.scale)||4});
  return{blob:new Blob([svg],{type:'image/svg+xml;charset=utf-8'}),value:valid.value,type:id,format:'svg'}
 }
 const canvas=document.createElement('canvas');bwipjs.toCanvas(canvas,{...bwipOptions(id,valid.value,options),scale:Number(options.scale)||4});
 return{blob:await canvasToBlob(canvas,'image/png'),value:valid.value,type:id,format:'png'}
}
export async function symbologyDataUrl(id,value,options={},format='png'){
 const {blob,...meta}=await generateSymbologyBlob(id,value,options,format);const url=await new Promise((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve(r.result);r.onerror=reject;r.readAsDataURL(blob)});return{url,blob,...meta}
}
