export default {
 homeHref:'../../',studiosHref:'../studios/',
 id:'spreadsheet-studio',name:'Spreadsheet Studio',subtitle:'XLSX · XLS · ODS · CSV · JSON',
 menus:[{id:'data',label:'Classeur'},{id:'export',label:'Export'},{id:'help',label:'Aide'}],
 ribbon:[
  {id:'file',label:'Fichier',items:[{id:'openSheet',action:'openSheet',label:'Ouvrir',icon:'file',primary:true},{id:'exportCsv',action:'exportCsv',label:'CSV',icon:'save'},{id:'exportJson',action:'exportJson',label:'JSON',icon:'save'}]},
  {id:'office',label:'Tableur',items:[{id:'exportXlsx',action:'exportXlsx',label:'XLSX',icon:'convert'},{id:'exportOds',action:'exportOds',label:'ODS',icon:'convert'}]}
 ]
};