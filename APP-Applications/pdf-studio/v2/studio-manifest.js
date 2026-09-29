export default {
  id:'pdf-studio',
  name:'PDF Studio',
  subtitle:'Éditeur PDF modulaire · Studio Core + plugin PDF',
  homeHref:'../../../',
  logoHref:'../../../assets/branding/nlab-wordmark.svg',
  studiosHref:'../../studios-v2/',
  versionsHref:'../versions.html',
  menus:[
    {id:'home',label:'Accueil',scope:'core'},
    {id:'file',label:'Fichier',scope:'core'},
    {id:'edit',label:'Édition',scope:'pdf'},
    {id:'tools',label:'Outils',scope:'pdf'},
    {id:'view',label:'Affichage',scope:'core'},
    {id:'history',label:'Historique',scope:'core'},
    {id:'help',label:'Aide',scope:'core'}
  ],
  ribbon:[
    {id:'input',label:'Entrée',scope:'core',items:[
      {id:'openPdf',featureId:'core.input.file.open',action:'openPdf',label:'Fichier',shortLabel:'Fichier',icon:'file',scope:'core',plugin:'studio-core',status:'stable',capability:'file.open',primary:true,help:{summary:'Ouvrir un fichier local.',details:'PDF, image, TXT, DOCX et ODT selon les capacités disponibles.'}},
      {id:'openFolder',featureId:'core.input.folder.open',action:'openFolder',label:'Dossier',shortLabel:'Dossier',icon:'folder',scope:'core',plugin:'studio-core',status:'stable',capability:'folder.open',help:{summary:'Choisir un dossier local.',details:'Charge les fichiers compatibles et alimente la collection de travail.'}}
    ]},
    {id:'output',label:'Sortie',scope:'core',items:[
      {id:'savePdf',featureId:'core.output.save',action:'savePdf',label:'Enregistrer',icon:'save',scope:'core',plugin:'studio-core',status:'stable',capability:'output.save',help:{summary:'Enregistrer le document courant.',details:'Sortie PDF locale.'}},
      {id:'classifyPdf',featureId:'core.output.classify',action:'classifyPdf',label:'Classer',icon:'folder',scope:'core',plugin:'studio-core',status:'development',capability:'output.classify',help:{summary:'Enregistrer et classer.',details:'Migration OutputService V1 → Core en cours.'}}
    ]},
    {id:'pages',label:'Pages',scope:'pdf',items:[
      {id:'rotateLeft',featureId:'pdf.pages.rotate.left',action:'rotateLeft',label:'−90°',icon:'rotateLeft',scope:'pdf',plugin:'pdf-studio',status:'stable',capability:'pdf.pages.rotate'},
      {id:'rotateRight',featureId:'pdf.pages.rotate.right',action:'rotateRight',label:'+90°',icon:'rotateRight',scope:'pdf',plugin:'pdf-studio',status:'stable',capability:'pdf.pages.rotate'},
      {id:'addPage',featureId:'pdf.pages.add',action:'addPage',label:'Ajouter',icon:'add',scope:'pdf',plugin:'pdf-studio',status:'stable',capability:'pdf.pages.add'},
      {id:'deletePage',featureId:'pdf.pages.delete',action:'deletePage',label:'Supprimer',icon:'delete',scope:'pdf',plugin:'pdf-studio',status:'stable',capability:'pdf.pages.delete'}
    ]},
    {id:'objects',label:'Annotations',scope:'pdf',items:[
      {featureId:'pdf.objects.text',action:'text',label:'Texte',icon:'command',scope:'pdf',plugin:'pdf-studio',status:'development',capability:'pdf.objects.text'},
      {featureId:'pdf.objects.stamp',action:'stamp',label:'Tampon',icon:'command',scope:'pdf',plugin:'pdf-studio',status:'development',capability:'pdf.objects.stamp'},
      {featureId:'pdf.objects.highlight',action:'highlight',label:'Surligner',icon:'command',scope:'pdf',plugin:'pdf-studio',status:'development',capability:'pdf.objects.highlight'},
      {featureId:'pdf.objects.pen',action:'pen',label:'Stylo',icon:'command',scope:'pdf',plugin:'pdf-studio',status:'development',capability:'pdf.objects.pen'},
      {featureId:'pdf.objects.image',action:'image',label:'Image',icon:'preview',scope:'pdf',plugin:'pdf-studio',status:'development',capability:'pdf.objects.image'}
    ]},
    {id:'advanced',label:'Moteurs',scope:'pdf',items:[
      {featureId:'pdf.tools.ocr',action:'ocr',label:'OCR',icon:'ocr',scope:'pdf',plugin:'pdf-studio',status:'development',capability:'ocr.quick',advancedStudio:{id:'ocr-studio',label:'OCR Studio'}},
      {featureId:'pdf.tools.optimize',action:'optimize',label:'Optimiser',icon:'command',scope:'pdf',plugin:'pdf-studio',status:'development',capability:'pdf.optimize.quick'},
      {featureId:'pdf.tools.translate',action:'translate',label:'Traduire',icon:'translate',scope:'pdf',plugin:'pdf-studio',status:'development',capability:'translation.quick',advancedStudio:{id:'translation-studio',label:'Translation Studio'}},
      {featureId:'pdf.tools.qr',action:'qr',label:'QR / Code',icon:'qr',scope:'pdf',plugin:'pdf-studio',status:'development',capability:'code.quick',advancedStudio:{id:'code-studio',label:'Code Studio'}},
      {featureId:'pdf.tools.convert',action:'convert',label:'Convertir',icon:'command',scope:'pdf',plugin:'pdf-studio',status:'development',capability:'conversion.quick',advancedStudio:{id:'conversion-studio',label:'Conversion Studio'}}
    ]},
    {id:'document',label:'Document',scope:'pdf',items:[
      {featureId:'pdf.signature',action:'signature',label:'Signature',icon:'command',scope:'pdf',plugin:'pdf-studio',status:'development',capability:'pdf.signature'},
      {featureId:'pdf.headerFooter',action:'headerFooter',label:'En-tête / pied',icon:'command',scope:'pdf',plugin:'pdf-studio',status:'development',capability:'pdf.header-footer'},
      {featureId:'pdf.forms',action:'forms',label:'Formulaires',icon:'command',scope:'pdf',plugin:'pdf-studio',status:'development',capability:'pdf.forms'},
      {featureId:'pdf.redaction',action:'redaction',label:'Caviardage',icon:'command',scope:'pdf',plugin:'pdf-studio',status:'development',capability:'pdf.redaction'},
      {featureId:'pdf.compare',action:'compare',label:'Comparer',icon:'command',scope:'pdf',plugin:'pdf-studio',status:'development',capability:'pdf.compare'},
      {featureId:'pdf.security',action:'security',label:'Sécurité',icon:'command',scope:'pdf',plugin:'pdf-studio',status:'development',capability:'pdf.security'}
    ]},
    {id:'history',label:'Suivi',scope:'core',items:[
      {featureId:'core.history.open',action:'history',label:'Historique',icon:'history',scope:'core',plugin:'studio-core',status:'stable',capability:'history.open'},
      {featureId:'core.command.open',action:'commands',label:'Commandes',icon:'command',scope:'core',plugin:'studio-core',status:'stable',capability:'commands.open'},
      {featureId:'core.workflow.open',action:'workflows',label:'Workflows',icon:'workflow',scope:'core',plugin:'studio-core',status:'test',capability:'workflows.open'}
    ]}
  ]
};
