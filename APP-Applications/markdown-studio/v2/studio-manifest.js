export default {
 homeHref:'../../',studiosHref:'../studios/',
 id:'markdown-studio',name:'Markdown Studio',subtitle:'Éditeur texte structuré transversal',
 menus:[{id:'edit',label:'Édition'},{id:'split',label:'Édition + aperçu'},{id:'preview',label:'Lecture'},{id:'yaml',label:'YAML'},{id:'help',label:'Aide'}],
 ribbon:[
  {id:'file',label:'Fichier',items:[{id:'openMd',action:'openMd',label:'Ouvrir',icon:'command',primary:true},{id:'openDemoCorpus',action:'openDemoCorpus',label:'Corpus démo',icon:'command'},{id:'saveMd',action:'saveMd',label:'MD',icon:'command'},{id:'exportHtml',action:'exportHtml',label:'HTML',icon:'command'}]},
  {id:'text',label:'Texte',items:[{action:'bold',label:'Gras',icon:'command'},{action:'italic',label:'Italique',icon:'command'},{action:'h1',label:'Titre 1',icon:'command'},{action:'h2',label:'Titre 2',icon:'command'},{action:'h3',label:'Titre 3',icon:'command'}]},
  {id:'insert',label:'Insertion',items:[{id:'insertLink',action:'insertLink',label:'Lien',icon:'command'},{id:'insertImage',action:'insertImage',label:'Image',icon:'command'},{id:'insertTable',action:'insertTable',label:'Tableau',icon:'command'},{id:'insertList',action:'insertList',label:'Liste',icon:'command'}]},
  {id:'format',label:'Format',items:[{id:'insertColor',action:'insertColor',label:'Couleur',icon:'command'},{id:'insertFont',action:'insertFont',label:'Police',icon:'command'},{id:'wysiwygDev',action:'wysiwygDev',label:'WYSIWYG',icon:'command',status:'development'}]}
 ]
};