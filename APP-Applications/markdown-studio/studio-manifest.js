export default {
 id:'markdown-studio',name:'Markdown Studio',subtitle:'Éditeur texte structuré transversal',
 menus:[{id:'edit',label:'Édition'},{id:'split',label:'Édition + aperçu'},{id:'preview',label:'Lecture'},{id:'yaml',label:'YAML'},{id:'help',label:'Aide'}],
 ribbon:[
  {id:'file',label:'Fichier',items:[{id:'openMd',action:'openMd',label:'Ouvrir',icon:'📄',primary:true},{id:'openDemoCorpus',action:'openDemoCorpus',label:'Corpus démo',icon:'🧪'},{id:'saveMd',action:'saveMd',label:'MD',icon:'💾'},{id:'exportHtml',action:'exportHtml',label:'HTML',icon:'🌐'}]},
  {id:'text',label:'Texte',items:[{action:'bold',label:'Gras',icon:'B'},{action:'italic',label:'Italique',icon:'I'},{action:'h1',label:'Titre 1',icon:'H1'},{action:'h2',label:'Titre 2',icon:'H2'},{action:'h3',label:'Titre 3',icon:'H3'}]},
  {id:'insert',label:'Insertion',items:[{id:'insertLink',action:'insertLink',label:'Lien',icon:'🔗'},{id:'insertImage',action:'insertImage',label:'Image',icon:'🖼'},{id:'insertTable',action:'insertTable',label:'Tableau',icon:'▦'},{id:'insertList',action:'insertList',label:'Liste',icon:'☷'}]},
  {id:'format',label:'Format',items:[{id:'insertColor',action:'insertColor',label:'Couleur',icon:'🎨'},{id:'insertFont',action:'insertFont',label:'Police',icon:'Aa'},{id:'wysiwygDev',action:'wysiwygDev',label:'WYSIWYG',icon:'✦',status:'development'}]}
 ]
};