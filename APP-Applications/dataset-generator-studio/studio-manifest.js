export default {
 id:'dataset-generator-studio',name:'Dataset Generator Studio',subtitle:'Générateur de données synthétiques',
 menus:[{id:'home',label:'Accueil'},{id:'generate',label:'Génération'},{id:'export',label:'Export'},{id:'help',label:'Aide'}],
 ribbon:[
  {id:'dataset',label:'Dataset',items:[{id:'generate',action:'generate',label:'Générer',icon:'⚙',primary:true},{id:'randomize',action:'randomize',label:'Nouveau seed',icon:'↻'}]},
  {id:'export',label:'Export',items:[{id:'exportJson',action:'exportJson',label:'JSON',icon:'{ }'},{id:'exportCsv',action:'exportCsv',label:'CSV',icon:'▦'},{id:'exportXlsx',action:'exportXlsx',label:'XLSX',icon:'XLS'},{id:'exportMd',action:'exportMd',label:'Markdown',icon:'M↓'}]},
  {id:'tools',label:'Outils',items:[{id:'advanced',action:'advanced',label:'Générateurs avancés',icon:'✦',status:'development'}]}
 ]
};