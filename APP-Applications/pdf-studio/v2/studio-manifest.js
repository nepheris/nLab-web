export default {
 id:'pdf-studio',
 name:'PDF Studio',
 subtitle:'Éditeur documentaire modulaire · Studio Core + plugin PDF',
 homeHref:'../../../',
 logoHref:'../../../assets/branding/nlab-wordmark.svg',
 studiosHref:'../../studios/',
 versionsHref:'../versions.html',
 menus:[
  {id:'home',label:'Accueil',scope:'core'},{id:'file',label:'Fichier',scope:'core'},{id:'edit',label:'Édition',scope:'pdf'},
  {id:'tools',label:'Outils PDF',scope:'pdf'},{id:'view',label:'Affichage',scope:'core'},{id:'history',label:'Historique',scope:'core'},{id:'help',label:'Aide',scope:'core'}
 ],
 ribbon:[
  {id:'input',label:'Entrée',scope:'core',items:[
   {id:'openPdf',featureId:'core.input.file.open',action:'openPdf',label:'Fichier',icon:'file',scope:'core',plugin:'studio-core',status:'stable',capability:'file.open',primary:true,help:{summary:'Ouvrir un ou plusieurs fichiers.',details:'Formats déclarés par le registre Core : PDF, images, textes et documents selon les moteurs disponibles.'}},
   {id:'openFolder',featureId:'core.input.folder.open',action:'openFolder',label:'Dossier',icon:'folder',scope:'core',plugin:'studio-core',status:'stable',capability:'folder.open',help:{summary:'Choisir un dossier local.',details:'Charge les fichiers compatibles, avec chemin relatif et sous-dossiers selon le réglage.'}},
   {id:'prevFile',featureId:'core.input.previous',action:'prevFile',label:'Préc.',icon:'previous',scope:'core',plugin:'studio-core',status:'stable',capability:'collection.previous'},
   {id:'nextFile',featureId:'core.input.next',action:'nextFile',label:'Suiv.',icon:'next',scope:'core',plugin:'studio-core',status:'stable',capability:'collection.next'}
  ]},
  {id:'output',label:'Sortie',scope:'core',items:[
   {id:'savePdf',featureId:'core.output.save',action:'savePdf',label:'Enregistrer',icon:'save',scope:'core',plugin:'studio-core',status:'stable',capability:'output.save'},
   {id:'saveZip',featureId:'core.output.zip',action:'saveZip',label:'ZIP',icon:'zip',scope:'core',plugin:'studio-core',status:'test',capability:'output.zip'},
   {id:'classifyPdf',featureId:'core.output.classify',action:'classifyPdf',label:'Classer',icon:'classify',scope:'core',plugin:'studio-core',status:'test',capability:'output.classify'}
  ]},
  {id:'pages',label:'Pages',scope:'pdf',items:[
   {id:'rotateLeft',featureId:'pdf.pages.rotate.left',action:'rotateLeft',label:'−90°',icon:'rotateLeft',scope:'pdf',plugin:'pdf-studio',status:'stable',capability:'pdf.pages.rotate'},
   {id:'rotateRight',featureId:'pdf.pages.rotate.right',action:'rotateRight',label:'+90°',icon:'rotateRight',scope:'pdf',plugin:'pdf-studio',status:'stable',capability:'pdf.pages.rotate'},
   {featureId:'pdf.pages.rotate.free',action:'rotateFree',label:'Rotation libre',icon:'rotateFree',scope:'pdf',plugin:'pdf-studio',status:'development',capability:'pdf.pages.rotate.free'},
   {id:'addPage',featureId:'pdf.pages.add',action:'addPage',label:'Ajouter',icon:'addPage',scope:'pdf',plugin:'pdf-studio',status:'stable',capability:'pdf.pages.add'},
   {featureId:'pdf.pages.duplicate',action:'duplicatePage',label:'Dupliquer',icon:'duplicate',scope:'pdf',plugin:'pdf-studio',status:'test',capability:'pdf.pages.duplicate'},
   {id:'deletePage',featureId:'pdf.pages.delete',action:'deletePage',label:'Supprimer',icon:'delete',scope:'pdf',plugin:'pdf-studio',status:'stable',capability:'pdf.pages.delete'},
   {featureId:'pdf.pages.extract',action:'extractPages',label:'Extraire',icon:'extract',scope:'pdf',plugin:'pdf-studio',status:'development',capability:'pdf.pages.extract'}
  ]},
  {id:'objects',label:'Annotations',scope:'pdf',items:[
   {featureId:'pdf.objects.text',action:'text',label:'Texte',icon:'text',scope:'pdf',plugin:'pdf-studio',status:'development',capability:'pdf.objects.text'},
   {featureId:'pdf.objects.stamp',action:'stamp',label:'Tampon',icon:'stamp',scope:'pdf',plugin:'pdf-studio',status:'development',capability:'pdf.objects.stamp'},
   {featureId:'pdf.objects.highlight',action:'highlight',label:'Surligner',icon:'highlight',scope:'pdf',plugin:'pdf-studio',status:'development',capability:'pdf.objects.highlight'},
   {featureId:'pdf.objects.pen',action:'pen',label:'Stylo',icon:'pen',scope:'pdf',plugin:'pdf-studio',status:'development',capability:'pdf.objects.pen'},
   {featureId:'pdf.objects.image',action:'image',label:'Image',icon:'image',scope:'pdf',plugin:'pdf-studio',status:'development',capability:'pdf.objects.image'},
   {featureId:'pdf.signature',action:'signature',label:'Signature',icon:'signature',scope:'pdf',plugin:'pdf-studio',status:'development',capability:'pdf.signature'}
  ]},
  {id:'engines',label:'Moteurs',scope:'pdf',items:[
   {featureId:'pdf.tools.ocr',action:'ocr',label:'OCR',icon:'ocr',scope:'pdf',plugin:'pdf-studio',status:'development',capability:'ocr.quick',advancedStudio:{id:'ocr-studio',label:'OCR Studio'}},
   {featureId:'pdf.tools.optimize',action:'optimize',label:'Optimiser',icon:'optimize',scope:'pdf',plugin:'pdf-studio',status:'development',capability:'pdf.optimize.quick'},
   {featureId:'pdf.tools.translate',action:'translate',label:'Traduire',icon:'translate',scope:'pdf',plugin:'pdf-studio',status:'development',capability:'translation.quick',advancedStudio:{id:'translation-studio',label:'Translation Studio'}},
   {featureId:'pdf.tools.qr',action:'qr',label:'QR / Code',icon:'qr',scope:'pdf',plugin:'pdf-studio',status:'development',capability:'code.quick',advancedStudio:{id:'code-studio',label:'Code Studio'}},
   {featureId:'pdf.tools.convert',action:'convert',label:'Convertir',icon:'convert',scope:'pdf',plugin:'pdf-studio',status:'development',capability:'conversion.quick',advancedStudio:{id:'conversion-studio',label:'Conversion Studio'}}
  ]},
  {id:'document',label:'Document',scope:'pdf',items:[
   {featureId:'pdf.headerFooter',action:'headerFooter',label:'En-tête / pied',icon:'headerFooter',scope:'pdf',plugin:'pdf-studio',status:'development',capability:'pdf.header-footer'},
   {featureId:'pdf.crop',action:'crop',label:'Recadrer',icon:'crop',scope:'pdf',plugin:'pdf-studio',status:'development',capability:'pdf.crop'},
   {featureId:'pdf.forms',action:'forms',label:'Formulaires',icon:'forms',scope:'pdf',plugin:'pdf-studio',status:'development',capability:'pdf.forms'},
   {featureId:'pdf.redaction',action:'redaction',label:'Caviardage',icon:'redaction',scope:'pdf',plugin:'pdf-studio',status:'development',capability:'pdf.redaction'},
   {featureId:'pdf.compare',action:'compare',label:'Comparer',icon:'compare',scope:'pdf',plugin:'pdf-studio',status:'development',capability:'pdf.compare'},
   {featureId:'pdf.batch',action:'batch',label:'Batch',icon:'batch',scope:'pdf',plugin:'pdf-studio',status:'development',capability:'pdf.batch'},
   {featureId:'pdf.security',action:'security',label:'Sécurité',icon:'security',scope:'pdf',plugin:'pdf-studio',status:'development',capability:'pdf.security'},
   {featureId:'pdf.metadata',action:'metadata',label:'Métadonnées',icon:'metadata',scope:'pdf',plugin:'pdf-studio',status:'development',capability:'pdf.metadata'}
  ]},
  {id:'history',label:'Suivi',scope:'core',items:[
   {featureId:'core.history.undo',action:'undo',label:'Annuler',icon:'undo',scope:'core',plugin:'studio-core',status:'stable',capability:'history.undo'},
   {featureId:'core.history.redo',action:'redo',label:'Rétablir',icon:'redo',scope:'core',plugin:'studio-core',status:'stable',capability:'history.redo'},
   {featureId:'core.history.open',action:'history',label:'Historique',icon:'history',scope:'core',plugin:'studio-core',status:'stable',capability:'history.open'},
   {featureId:'core.command.open',action:'commands',label:'Commandes',icon:'command',scope:'core',plugin:'studio-core',status:'stable',capability:'commands.open'},
   {featureId:'core.workflow.open',action:'workflows',label:'Workflows',icon:'workflow',scope:'core',plugin:'studio-core',status:'test',capability:'workflows.open'}
  ]}
 ]
};
