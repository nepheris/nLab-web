export default {
  id:'pdf-studio',
  name:'PDF Studio',
  subtitle:'Éditeur PDF modulaire · Core V2 + plugin PDF',
  homeHref:'../../../',
  logoHref:'../../../assets/branding/nlab-wordmark.svg',
  studiosHref:'../../studios-v2/',
  versionsHref:'../versions.html',
  menus:[
    {id:'home',label:'Accueil',scope:'core'},
    {id:'file',label:'Fichier',scope:'core'},
    {id:'edit',label:'Édition',scope:'core'},
    {id:'tools',label:'Outils',scope:'core'},
    {id:'view',label:'Affichage',scope:'core'},
    {id:'help',label:'Aide',scope:'core'}
  ],
  ribbon:[
    {id:'input',label:'Entrée',scope:'core',items:[
      {id:'openPdf',action:'openPdf',label:'Fichier',icon:'📄',scope:'core',primary:true},
      {id:'openFolder',action:'openFolder',label:'Dossier',icon:'📁',scope:'core'},
      {id:'openDemo',action:'openDemo',label:'Corpus démo',icon:'🧪',scope:'core'}
    ]},
    {id:'output',label:'Sortie',scope:'core',items:[
      {id:'savePdf',action:'savePdf',label:'Enregistrer',icon:'💾',scope:'core'},
      {id:'classifyPdf',action:'classifyPdf',label:'Enregistrer / classer',icon:'🗂',scope:'core',status:'development'}
    ]},
    {id:'pages',label:'Pages PDF',scope:'studio',items:[
      {id:'rotateLeft',action:'rotateLeft',label:'−90°',icon:'↺',scope:'studio'},
      {id:'rotateRight',action:'rotateRight',label:'+90°',icon:'↻',scope:'studio'},
      {id:'addPage',action:'addPage',label:'Ajouter',icon:'＋',scope:'studio'},
      {id:'deletePage',action:'deletePage',label:'Supprimer',icon:'🗑',scope:'studio'}
    ]},
    {id:'objects',label:'Objets PDF',scope:'studio',items:[
      {action:'text',label:'Texte',icon:'T',scope:'studio',status:'development'},
      {action:'stamp',label:'Tampon',icon:'▣',scope:'studio',status:'development'},
      {action:'signature',label:'Signature',icon:'✍',scope:'studio',status:'development'}
    ]},
    {id:'tools',label:'Outils',scope:'studio',items:[
      {action:'ocr',label:'OCR',icon:'OCR',scope:'studio',status:'development'},
      {action:'qr',label:'QR',icon:'▣',scope:'studio',status:'development'},
      {action:'translate',label:'Traduire',icon:'🌐',scope:'studio',status:'development'}
    ]},
    {id:'history',label:'Suivi',scope:'core',items:[
      {action:'history',label:'Historique',icon:'↶',scope:'core',status:'development'}
    ]}
  ]
};