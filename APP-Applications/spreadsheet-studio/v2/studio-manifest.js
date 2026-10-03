export default {
 homeHref:'../../',studiosHref:'../studios/',
 id:'spreadsheet-studio',name:'Spreadsheet Studio',subtitle:'XLSX · XLS · ODS · CSV · JSON',
 menus:[{id:'data',label:'Classeur'},{id:'export',label:'Export'},{id:'help',label:'Aide'}],
 ribbon:[
  {id:'file',label:'Fichier',items:[{id:'spreadsheet-studio-open',action:'openSheet',label:'Ouvrir',icon:'file',primary:true},{id:'spreadsheet-studio-csv',action:'exportCsv',label:'CSV',icon:'save'},{id:'spreadsheet-studio-json',action:'exportJson',label:'JSON',icon:'save'}]},
  {id:'office',label:'Tableur',items:[{id:'spreadsheet-studio-xlsx',action:'exportXlsx',label:'XLSX',icon:'convert'},{id:'spreadsheet-studio-ods',action:'exportOds',label:'ODS',icon:'convert'}]}
 ]
};