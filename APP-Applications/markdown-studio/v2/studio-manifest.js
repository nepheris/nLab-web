export default {
 homeHref:'../../',studiosHref:'../studios/',
 id:'markdown-studio',
 capabilities:[{id:'markdown.edit.source',status:'stable'},{id:'markdown.yaml.frontmatter',status:'stable'},{id:'markdown.history.undo-redo',status:'test',engine:'studio-core.undo-redo'}],
 sourcePath:'APP-Applications/markdown-studio/v2/index.html',name:'Markdown Studio',subtitle:'Éditeur texte structuré transversal',
 menus:[{id:'edit',label:'Édition'},{id:'split',label:'Édition + aperçu'},{id:'preview',label:'Lecture'},{id:'yaml',label:'YAML'},{id:'help',label:'Aide'}],
 ribbon:[
  {id:'file',label:'Fichier',items:[{id:'openMd',action:'openMd',label:'Ouvrir',icon:'file',primary:true},{id:'openDemoCorpus',action:'openDemoCorpus',label:'Corpus démo',icon:'folder'},{id:'saveMd',action:'saveMd',label:'MD',icon:'save'},{id:'exportHtml',action:'exportHtml',label:'HTML',icon:'download'},{id:'printPdf',action:'printPdf',label:'PDF navigateur',icon:'print'}]},
  {id:'text',label:'Texte',items:[{action:'bold',label:'Gras',icon:'bold'},{action:'italic',label:'Italique',icon:'italic'},{action:'h1',label:'Titre 1',icon:'text'},{action:'h2',label:'Titre 2',icon:'text'},{action:'h3',label:'Titre 3',icon:'text'}]},
  {id:'insert',label:'Insertion',items:[{id:'insertLink',action:'insertLink',label:'Lien',icon:'link'},{id:'insertImage',action:'insertImage',label:'Image',icon:'image'},{id:'insertTable',action:'insertTable',label:'Tableau',icon:'table'},{id:'insertList',action:'insertList',label:'Liste',icon:'listBulleted'}]},
  {id:'format',label:'Format',items:[{id:'insertColor',action:'insertColor',label:'Couleur',icon:'color_picker'},{id:'insertFont',action:'insertFont',label:'Police',icon:'text'},{id:'wysiwygDev',action:'wysiwygDev',label:'WYSIWYG',icon:'edit',status:'development'}]}
 ]
};