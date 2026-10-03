export async function recognizeImage(file,{language='fra',logger=null}={}){
 if(!globalThis.Tesseract)throw new Error('Moteur OCR navigateur indisponible');
 const worker=await Tesseract.createWorker(language,1,{logger:logger||(()=>{})});
 try{const ret=await worker.recognize(file);return String(ret?.data?.text||'').trim()}finally{await worker.terminate()}
}
export function availableOcrEngines(){
 return[
  {id:'auto',label:'Automatique',status:'test',runtime:globalThis.Tesseract?'tesseract-js':null},
  {id:'tesseract-js',label:'Tesseract.js',status:globalThis.Tesseract?'available':'unavailable',local:true},
  {id:'ocr-studio',label:'OCR Studio',status:'handoff',studio:'ocr-studio'}
 ]
}
export async function runOcr(file,{engine='auto',language='fra',logger=null}={}){
 const selected=engine==='auto'?'tesseract-js':engine;
 if(selected==='tesseract-js')return recognizeImage(file,{language,logger});
 throw new Error('Moteur OCR non exécutable localement dans ce contexte : '+selected)
}
