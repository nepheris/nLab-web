const ext=name=>(String(name||'').toLowerCase().match(/\.([a-z0-9]+)$/)?.[1]||'');
export function detectFileCapabilities(file){
  const e=ext(file?.name),type=String(file?.type||'').toLowerCase(),caps=new Set(['file.preview','file.history']);
  if(e==='pdf'||type==='application/pdf'){['pdf.open','pdf.pages','pdf.annotate','pdf.optimize','pdf.ocr.optional','conversion.pdf-to-other'].forEach(x=>caps.add(x))}
  else if(['docx','odt','txt'].includes(e)||type.startsWith('text/')){['conversion.to-pdf.quick','conversion.to-pdf.advanced'].forEach(x=>caps.add(x));if(e==='docx')caps.add('text.native')}
  else if(['png','jpg','jpeg','webp','tif','tiff'].includes(e)||type.startsWith('image/')){['image.open','conversion.image-to-pdf','image.optimize','ocr.optional'].forEach(x=>caps.add(x))}
  else if(['xlsx','xls','csv'].includes(e)){['conversion.spreadsheet','conversion.to-pdf.advanced','conversion.to-csv'].forEach(x=>caps.add(x))}
  else if(['pptx','ppt'].includes(e)){['conversion.presentation','conversion.to-pdf.advanced','conversion.to-images'].forEach(x=>caps.add(x))}
  return{extension:e,capabilities:[...caps],needsPdfConversion:!caps.has('pdf.open')&&caps.has('conversion.to-pdf.quick'),ocrRecommended:caps.has('ocr.optional')&&!caps.has('text.native')};
}
