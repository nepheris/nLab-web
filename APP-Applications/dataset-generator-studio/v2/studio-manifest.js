export default {
 homeHref:'../../',studiosHref:'../studios/',
 id:'dataset-generator-studio',
 sourcePath:'APP-Applications/dataset-generator-studio/v2/index.html',name:'Dataset Generator Studio',subtitle:'Fixtures synthétiques · datasets, documents et clones de structure',
 capabilities:[
  {id:'dataset.generate.synthetic',status:'test'},
  {id:'dataset.clone.structure',status:'test'},
  {id:'dataset.clone.format-shape',status:'test'},
  {id:'dataset.clone.rich-document',status:'test'},
  {id:'dataset.clone.ocr',status:'test',engine:'studio-core.ocr'},
  {id:'dataset.export.multi-format',status:'test'}
 ],
 menus:[{id:'home',label:'Accueil'},{id:'generate',label:'Génération'},{id:'clone',label:'Clone'},{id:'export',label:'Export'},{id:'help',label:'Aide'}],
 ribbon:[
  {id:'dataset',label:'Dataset',items:[
   {id:'generate',featureId:'dataset.generate.synthetic',action:'generate',label:'Générer',icon:'command',primary:true,status:'test',capability:'dataset.generate.synthetic'},
   {id:'randomize',action:'randomize',label:'Nouveau seed',icon:'command',status:'test'}
  ]},
  {id:'clone',label:'Clone',items:[
   {id:'cloneRich',featureId:'dataset.clone.rich-document',action:'cloneRich',label:'Cloner structure',icon:'file',status:'test',capability:'dataset.clone.rich-document'},
   {id:'ocrStudio',featureId:'dataset.clone.ocr',action:'ocrStudio',label:'OCR Studio',icon:'ocr',status:'test',capability:'dataset.clone.ocr',advancedStudio:{id:'ocr-studio',label:'OCR Studio'}}
  ]},
  {id:'export',label:'Export',items:[{id:'exportJson',action:'exportJson',label:'JSON',icon:'command'},{id:'exportCsv',action:'exportCsv',label:'CSV',icon:'command'},{id:'exportXlsx',action:'exportXlsx',label:'XLSX',icon:'command'},{id:'exportMd',action:'exportMd',label:'Markdown',icon:'command'},{id:'exportHtml',action:'exportHtml',label:'HTML',icon:'command'},{id:'exportDocx',action:'exportDocx',label:'DOCX',icon:'command'},{id:'exportPdf',action:'exportPdf',label:'PDF',icon:'command'}]},
  {id:'tools',label:'Outils',items:[{id:'advanced',action:'advanced',label:'Générateurs avancés',icon:'command',status:'development'}]}
 ]
};