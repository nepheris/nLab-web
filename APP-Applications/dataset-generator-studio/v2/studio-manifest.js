export default {
 homeHref:'../../',studiosHref:'../studios/',
 id:'dataset-generator-studio',
 sourcePath:'APP-Applications/dataset-generator-studio/v2/index.html',name:'Dataset Generator Studio',subtitle:'Fixtures synthétiques · datasets, documents et clones de structure',
 menus:[{id:'home',label:'Accueil'},{id:'generate',label:'Génération'},{id:'export',label:'Export'},{id:'help',label:'Aide'}],
 ribbon:[
  {id:'dataset',label:'Dataset',items:[{id:'generate',action:'generate',label:'Générer',icon:'command',primary:true},{id:'randomize',action:'randomize',label:'Nouveau seed',icon:'command'}]},
  {id:'export',label:'Export',items:[{id:'exportJson',action:'exportJson',label:'JSON',icon:'command'},{id:'exportCsv',action:'exportCsv',label:'CSV',icon:'command'},{id:'exportXlsx',action:'exportXlsx',label:'XLSX',icon:'command'},{id:'exportMd',action:'exportMd',label:'Markdown',icon:'command'},{id:'exportHtml',action:'exportHtml',label:'HTML',icon:'command'},{id:'exportDocx',action:'exportDocx',label:'DOCX',icon:'command'},{id:'exportPdf',action:'exportPdf',label:'PDF',icon:'command'}]},
  {id:'tools',label:'Outils',items:[{id:'advanced',action:'advanced',label:'Générateurs avancés',icon:'command',status:'development'}]}
 ]
};