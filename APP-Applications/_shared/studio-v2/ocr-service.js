const ENGINES=[
 {id:'auto',label:'Automatique',kind:'browser',status:'test',languages:['fra','eng','fra+eng'],notes:'Utilise le meilleur moteur local disponible puis infère la langue du texte reconnu.'},
 {id:'tesseract-js',label:'Tesseract.js',kind:'browser',status:'available',languages:['fra','eng','fra+eng'],local:true},
 {id:'tesseract-native',label:'Tesseract natif',kind:'external',status:'adapter',languages:['fra','eng','fra+eng']},
 {id:'ocrmypdf',label:'OCRmyPDF',kind:'external',status:'adapter',languages:['fra','eng','fra+eng'],capabilities:['searchable-pdf','deskew','rotate']},
 {id:'rapidocr',label:'RapidOCR',kind:'external',status:'adapter',languages:['auto'],capabilities:['image-text']}
];

const FRENCH=[' le ',' la ',' les ',' des ',' une ',' un ',' et ',' de ',' du ',' pour ',' avec ',' est ',' dans ',' sur ',' que ',' qui '];
const ENGLISH=[' the ',' and ',' of ',' to ',' for ',' with ',' is ',' in ',' on ',' that ',' this ',' from '];
export function detectLanguageFromText(text=''){
 const t=' '+String(text||'').toLowerCase().replace(/\s+/g,' ')+' ';
 let fr=0,en=0;for(const w of FRENCH)fr+=t.split(w).length-1;for(const w of ENGLISH)en+=t.split(w).length-1;
 if(/[àâçéèêëîïôùûüÿœ]/i.test(t))fr+=2;
 if(fr===0&&en===0)return{language:'und',confidence:0,scores:{fra:fr,eng:en}};
 const language=fr>=en?'fra':'eng',confidence=Math.abs(fr-en)/Math.max(1,fr+en);
 return{language,confidence:Math.round(confidence*100)/100,scores:{fra:fr,eng:en}}
}
export function availableOcrEngines(){
 return ENGINES.map(e=>({...e,status:e.id==='tesseract-js'?(globalThis.Tesseract?'available':'unavailable'):e.id==='auto'?(globalThis.Tesseract?'available':'degraded'):e.status}))
}
export function resolveOcrEngine(id='auto'){
 const list=availableOcrEngines(),wanted=list.find(e=>e.id===id)||list[0];
 if(wanted.id==='auto')return list.find(e=>e.id==='tesseract-js'&&e.status==='available')||wanted;
 return wanted
}
export async function recognizeImage(file,{language='auto',engine='auto',logger=null}={}){
 const resolved=resolveOcrEngine(engine);
 if(resolved.id!=='tesseract-js')throw new Error('Moteur OCR non exécutable dans le navigateur : '+resolved.label);
 if(!globalThis.Tesseract)throw new Error('Tesseract.js indisponible');
 const pack=language==='auto'?'fra+eng':language;
 const worker=await Tesseract.createWorker(pack,1,{logger:logger||(()=>{})});
 try{
  const ret=await worker.recognize(file),text=String(ret?.data?.text||'').trim(),detected=detectLanguageFromText(text);
  return{text,engine:resolved.id,requestedLanguage:language,effectivePack:pack,detectedLanguage:detected.language,languageConfidence:detected.confidence,confidence:ret?.data?.confidence??null}
 }finally{await worker.terminate()}
}
export async function runOcr(file,options={}){
 return recognizeImage(file,options)
}
export function ocrDiagnostics(){
 return{engines:availableOcrEngines(),browser:{tesseract:Boolean(globalThis.Tesseract)},schema:'nlab.ocr-diagnostics/v1'}
}
