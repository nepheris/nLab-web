export default {
 id:'scan-studio',sourcePath:'APP-Applications/scan-studio/v2/index.html',name:'Scan Studio',subtitle:'Capture documentaire · mobile + desktop',
 homeHref:'../../',studiosHref:'../studios/',
 capabilities:[
  {id:'scan.capture.camera',status:'test'},
  {id:'scan.capture.files',status:'test'},
  {id:'scan.pages.organize',status:'test'},
  {id:'scan.image.cleanup',status:'test'},
  {id:'scan.image.deskew',status:'test'},
  {id:'scan.ocr',status:'test',engine:'studio-core.ocr'},
  {id:'scan.export.pdf',status:'test'}
 ],
 menus:[{id:'capture',label:'Capture',scope:'studio'},{id:'pages',label:'Pages',scope:'studio'},{id:'ocr',label:'OCR',scope:'studio'},{id:'help',label:'Aide',scope:'core'}],
 ribbon:[
  {id:'input',label:'Acquisition',scope:'core',items:[
   {id:'scan-open',action:'open',label:'Images',icon:'file',scope:'core',primary:true},
   {id:'scan-camera',action:'camera',label:'Photo',icon:'image',scope:'studio',capability:'scan.capture.camera'}
  ]},
  {id:'process',label:'Document',scope:'studio',items:[
   {id:'scan-clean',action:'clean',label:'Nettoyer',icon:'command',scope:'studio',capability:'scan.image.cleanup'},
   {id:'scan-ocr',action:'ocr',label:'OCR',icon:'ocr',scope:'studio',capability:'scan.ocr'},
   {id:'scan-pdf',action:'pdf',label:'PDF',icon:'save',scope:'studio',capability:'scan.export.pdf'}
  ]}
 ]
};