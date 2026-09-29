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
      {id:'openPdf',featureId:'core.input.file.open',action:'openPdf',label:'Fichier',icon:'📄',scope:'core',plugin:'studio-core',status:'stable',capability:'file.open',primary:true,help:{summary:'Ouvrir un fichier local dans le Studio.',details:'Capacité commune fournie par le Studio Core.'}},
      {id:'openFolder',featureId:'core.input.folder.open',action:'openFolder',label:'Dossier',icon:'📁',scope:'core',plugin:'studio-core',status:'stable',capability:'folder.open',help:{summary:'Choisir un dossier local comme source.',details:'Capacité commune du Studio Core ; le plugin filtre ensuite les formats utiles.'}},
      {id:'openDemo',featureId:'core.input.demo.open',action:'openDemo',label:'Corpus démo',icon:'🧪',scope:'core',plugin:'studio-core',status:'test',capability:'demo.open',help:{summary:'Ouvrir le corpus de démonstration nLab.',details:'Source transversale commune aux Studios.'}}
    ]},
    {id:'output',label:'Sortie',scope:'core',items:[
      {id:'savePdf',featureId:'core.output.save',action:'savePdf',label:'Enregistrer',icon:'💾',scope:'core',plugin:'studio-core',status:'stable',capability:'output.save',help:{summary:'Enregistrer le document courant.',details:'Le Core fournit l’action de sortie ; le plugin fournit le format métier.'}},
      {id:'classifyPdf',featureId:'core.output.classify',action:'classifyPdf',label:'Enregistrer / classer',icon:'🗂',scope:'core',plugin:'studio-core',status:'development',capability:'output.classify',help:{summary:'Enregistrer puis classer selon les règles de sortie.',details:'Service commun encore en migration vers le Core V2.'}}
    ]},
    {id:'pages',label:'Pages PDF',scope:'pdf',items:[
      {id:'rotateLeft',featureId:'pdf.pages.rotate.left',action:'rotateLeft',label:'−90°',icon:'↺',scope:'pdf',plugin:'pdf-studio',status:'stable',capability:'pdf.pages.rotate',help:{summary:'Tourner la portée PDF de 90° vers la gauche.',details:'Fonction métier du plugin PDF.'}},
      {id:'rotateRight',featureId:'pdf.pages.rotate.right',action:'rotateRight',label:'+90°',icon:'↻',scope:'pdf',plugin:'pdf-studio',status:'stable',capability:'pdf.pages.rotate',help:{summary:'Tourner la portée PDF de 90° vers la droite.',details:'Fonction métier du plugin PDF.'}},
      {id:'addPage',featureId:'pdf.pages.add',action:'addPage',label:'Ajouter',icon:'＋',scope:'pdf',plugin:'pdf-studio',status:'stable',capability:'pdf.pages.add',help:{summary:'Ajouter une page blanche après la page courante.',details:'Fonction métier du plugin PDF.'}},
      {id:'deletePage',featureId:'pdf.pages.delete',action:'deletePage',label:'Supprimer',icon:'🗑',scope:'pdf',plugin:'pdf-studio',status:'stable',capability:'pdf.pages.delete',help:{summary:'Supprimer les pages de la portée active.',details:'Fonction métier du plugin PDF.'}}
    ]},
    {id:'objects',label:'Objets PDF',scope:'pdf',items:[
      {featureId:'pdf.objects.text',action:'text',label:'Texte',icon:'T',scope:'pdf',plugin:'pdf-studio',status:'development',capability:'pdf.objects.text',help:{summary:'Ajouter un objet texte sur une page PDF.',details:'Fonction en cours de reconnexion dans l’architecture V2.'}},
      {featureId:'pdf.objects.stamp',action:'stamp',label:'Tampon',icon:'▣',scope:'pdf',plugin:'pdf-studio',status:'development',capability:'pdf.objects.stamp',help:{summary:'Ajouter et paramétrer un tampon PDF.',details:'Fonction existante en V1, migration V2 non encore validée.'}},
      {featureId:'pdf.objects.signature',action:'signature',label:'Signature',icon:'✍',scope:'pdf',plugin:'pdf-studio',status:'development',capability:'pdf.objects.signature',help:{summary:'Ajouter une signature visuelle.',details:'Migration V2 en cours ; signature numérique externe reste distincte.'}}
    ]},
    {id:'tools',label:'Outils',scope:'pdf',items:[
      {featureId:'pdf.tools.ocr',action:'ocr',label:'OCR',icon:'OCR',scope:'pdf',plugin:'pdf-studio',status:'development',capability:'ocr.quick',help:{summary:'Lancer un OCR simplifié depuis PDF Studio.',details:'Le moteur avancé appartient à OCR Studio et sera consommé comme capability.'}},
      {featureId:'pdf.tools.qr',action:'qr',label:'QR',icon:'▣',scope:'pdf',plugin:'pdf-studio',status:'development',capability:'qr.generate.quick',help:{summary:'Ajouter rapidement un QR dans le PDF.',details:'Le moteur avancé appartient au plugin QR/Barcode.'}},
      {featureId:'pdf.tools.translate',action:'translate',label:'Traduire',icon:'🌐',scope:'pdf',plugin:'pdf-studio',status:'development',capability:'translation.quick',help:{summary:'Créer une traduction simplifiée depuis PDF Studio.',details:'Le moteur avancé appartiendra à Translation Studio.'}}
    ]},
    {id:'history',label:'Suivi',scope:'core',items:[
      {featureId:'core.history.open',action:'history',label:'Historique',icon:'↶',scope:'core',plugin:'studio-core',status:'development',capability:'history.open',help:{summary:'Afficher l’historique de travail.',details:'Service transversal destiné à tous les Studios V2.'}}
    ]}
  ]
};