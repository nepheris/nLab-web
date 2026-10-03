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
