import{formatInfo}from'./format-registry.js';
export function detectFileCapabilities(file){
 const info=formatInfo(file),caps=new Set(['file.preview','file.history','file.collection']);
 if(info.family==='pdf'){['pdf.open','pdf.pages','pdf.annotate','pdf.optimize','pdf.ocr.optional','conversion.pdf-to-other'].forEach(x=>caps.add(x))}
 else if(info.family==='image'){['image.open','conversion.image-to-pdf','image.optimize','ocr.optional'].forEach(x=>caps.add(x))}
 else if(info.family==='text'){['text.native','conversion.to-pdf.quick','conversion.to-pdf.advanced'].forEach(x=>caps.add(x))}
 else if(info.family==='document'){['conversion.to-pdf.advanced'].forEach(x=>caps.add(x));if(info.quickPdf)caps.add('conversion.to-pdf.quick');if(info.extension==='docx'||info.extension==='odt')caps.add('text.native')}
 else if(info.family==='spreadsheet'){['conversion.spreadsheet','conversion.to-pdf.advanced','conversion.to-csv'].forEach(x=>caps.add(x))}
 else if(info.family==='presentation'){['conversion.presentation','conversion.to-pdf.advanced','conversion.to-images'].forEach(x=>caps.add(x))}
 else if(info.family==='archive'){['archive.open','file.collection'].forEach(x=>caps.add(x))}
 return{...info,capabilities:[...caps],needsPdfConversion:info.family!=='pdf'&&!!info.quickPdf,requiresAdvancedConversion:!!info.advanced,ocrRecommended:caps.has('ocr.optional')&&!caps.has('text.native')};
}
