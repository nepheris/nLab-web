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
   {featureId:'pdf.crop',action:'crop',label:'Recadrer',icon:'crop',scope:'pdf',plugin:'pdf-studio',status:'test',capability:'pdf.crop',help:{summary:'Modifier la zone visible de la page PDF.',details:'Le recadrage agit sur la CropBox et peut s’appliquer à la page, à la sélection ou à tout le document. Il ne supprime pas de manière sécurisée le contenu masqué.'}},
   {id:'addPage',featureId:'pdf.pages.add',action:'addPage',label:'Ajouter',icon:'addPage',scope:'pdf',plugin:'pdf-studio',status:'stable',capability:'pdf.pages.add'},
   {featureId:'pdf.pages.duplicate',action:'duplicatePage',label:'Dupliquer',icon:'duplicate',scope:'pdf',plugin:'pdf-studio',status:'test',capability:'pdf.pages.duplicate'},
   {id:'deletePage',featureId:'pdf.pages.delete',action:'deletePage',label:'Supprimer',icon:'delete',scope:'pdf',plugin:'pdf-studio',status:'stable',capability:'pdf.pages.delete'},
   {featureId:'pdf.pages.extract',action:'extractPages',label:'Extraire',icon:'extract',scope:'pdf',plugin:'pdf-studio',status:'test',capability:'pdf.pages.extract',help:{summary:'Extraire les pages sélectionnées dans un nouveau PDF.',details:'Si aucune page n’est cochée, la page active est extraite. Le document source reste inchangé.'}},
   {featureId:'pdf.pages.assemble',action:'assemblePdf',label:'Assembler',icon:'merge',scope:'pdf',plugin:'pdf-studio',status:'test',capability:'pdf.pages.assemble',help:{summary:'Fusionner plusieurs PDF ou insérer un PDF dans le document courant.',details:'Utilise les PDF sélectionnés dans la collection ou un fichier PDF externe. L’ordre de fusion peut être ajusté avant assemblage.'}}
  ]},
  {id:'objects',label:'Annotations',scope:'pdf',items:[
   {featureId:'pdf.objects.text',action:'text',label:'Texte',icon:'text',scope:'pdf',plugin:'pdf-studio',status:'test',capability:'pdf.objects.text',help:{summary:'Placer du texte déplaçable sur une page.',details:'Le texte reste éditable comme objet jusqu’à son intégration au PDF.'}},
   {featureId:'pdf.objects.stamp',action:'stamp',label:'Tampon',icon:'stamp',scope:'pdf',plugin:'pdf-studio',status:'test',capability:'pdf.objects.stamp',help:{summary:'Créer et placer un tampon composite.',details:'Texte, variables, cinq dates et image/logo facultative ; modèles personnels stockés dans le profil.'}},
   {featureId:'pdf.objects.highlight',action:'highlight',label:'Surligner',icon:'highlight',scope:'pdf',plugin:'pdf-studio',status:'test',capability:'pdf.objects.highlight',help:{summary:'Marquer une zone avec un rectangle coloré semi-transparent.',details:'Le surlignage partage le moteur de rectangles avec le caviardage. Il peut être déplacé, redimensionné, verrouillé et supprimé avant intégration.'}},
   {featureId:'pdf.objects.pen',action:'pen',label:'Stylo',icon:'pen',scope:'pdf',plugin:'pdf-studio',status:'test',capability:'pdf.objects.pen',help:{summary:'Dessiner un tracé libre sur la page.',details:'Couleur, épaisseur et opacité utilisent les contrôles Core communs. Le tracé reste déplaçable et redimensionnable avant intégration.'}},
   {featureId:'pdf.objects.image',action:'image',label:'Image',icon:'image',scope:'pdf',plugin:'pdf-studio',status:'test',capability:'pdf.objects.image',help:{summary:'Insérer une image déplaçable/redimensionnable.',details:'Fichier local ou asset de la bibliothèque personnelle.'}},
   {featureId:'pdf.signature',action:'signature',label:'Signature',icon:'signature',scope:'pdf',plugin:'pdf-studio',status:'test',capability:'pdf.signature',help:{summary:'Ouvrir les trois modes de signature PDF.',details:'PDF Signature visuelle (image non cryptographique), PDF Signature digitale (PAdES) et PDF Signature certifiée (PAdES + règles DocMDP).'}}
  ]},
  {id:'engines',label:'Moteurs',scope:'pdf',items:[
   {featureId:'pdf.tools.ocr',action:'ocr',label:'OCR',icon:'ocr',scope:'pdf',plugin:'pdf-studio',status:'test',capability:'ocr.quick',advancedStudio:{id:'ocr-studio',label:'OCR Studio'},help:{summary:'Reconnaître le texte des pages rasterisées.',details:'Choisir langue, portée et résolution. Pour des réglages avancés, ouvrir OCR Studio ; sa version est résolue par les paramètres Studio Core.'}},
   {featureId:'pdf.tools.optimize',action:'optimize',label:'Optimiser',icon:'optimize',scope:'pdf',plugin:'pdf-studio',status:'test',capability:'pdf.optimize.quick',help:{summary:'Réduire ou normaliser le poids visuel des pages ciblées.',details:'Utilise le contrôle Core commun de résolution/DPI et de qualité JPEG. L’optimisation rasterise les pages ciblées ; la portée par défaut est la sélection.'}},
   {featureId:'pdf.tools.translate',action:'translate',label:'Traduire',icon:'translate',scope:'pdf',plugin:'pdf-studio',status:'test',capability:'translation.quick',help:{summary:'Créer rapidement un PDF bilingue.',details:'Le moteur rapide utilise le navigateur ou un endpoint de traduction configuré. Un Translation Studio spécialisé n’est pas encore publié.'}},
   {featureId:'pdf.tools.qr',action:'qr',label:'QR / Code',icon:'qr',scope:'pdf',plugin:'pdf-studio',status:'test',capability:'code.quick',advancedStudio:{id:'qr-barcode-studio',label:'QR & Barcode Studio'},help:{summary:'Créer rapidement QR et codes-barres dans le PDF.',details:'QR, Data Matrix, Code 128, GS1-128, EAN-13 et EAN-8. Pour les réglages avancés, ouvrir QR & Barcode Studio via le résolveur Core.'}},
   {featureId:'pdf.tools.convert',action:'convert',label:'Convertir',icon:'convert',scope:'pdf',plugin:'pdf-studio',status:'test',capability:'conversion.quick',advancedStudio:{id:'file-studio',label:'File Studio'},help:{summary:'Conversions rapides vers et depuis PDF.',details:'PDF vers TXT, DOCX, ODT, PNG/JPEG ; fichiers compatibles vers PDF. Les exports DOCX/ODT visent la fidélité texte/structure, pas une reproduction Office haute fidélité. File Studio prend le relais pour les workflows de fichiers spécialisés.'}}
  ]},
  {id:'document',label:'Document',scope:'pdf',items:[
   {featureId:'pdf.headerFooter',action:'headerFooter',label:'En-tête / pied',icon:'headerFooter',scope:'pdf',plugin:'pdf-studio',status:'test',capability:'pdf.header-footer',help:{summary:'Ajouter des textes variables en haut et en bas des pages.',details:'Zones gauche/centre/droite, taille et portée. Tous les champs acceptant des variables utilisent le registre commun du TemplateEngine.'}},
   {featureId:'pdf.forms',action:'forms',label:'Formulaires',icon:'forms',scope:'pdf',plugin:'pdf-studio',status:'test',capability:'pdf.forms',help:{summary:'Inspecter, créer, remplir ou aplatir les champs de formulaire PDF.',details:'La V2 prend en charge inspection, ajout de champ texte, remplissage par JSON et aplatissement. Les types de champs avancés restent à étendre.'}},
   {featureId:'pdf.redaction',action:'redaction',label:'Caviardage',icon:'redaction',scope:'pdf',plugin:'pdf-studio',status:'test',capability:'pdf.redaction',help:{summary:'Marquer puis appliquer un caviardage irréversible.',details:'L’application rasterise les pages concernées afin d’éviter de laisser le texte masqué récupérable.'}},
   {featureId:'pdf.compare',action:'compare',label:'Comparer',icon:'compare',scope:'pdf',plugin:'pdf-studio',status:'test',capability:'pdf.compare',help:{summary:'Comparer explicitement un PDF A et un PDF B.',details:'Mode texte disponible sur le document complet ou la page courante. La comparaison visuelle reste prévue pour une passe ultérieure.'}},
   {featureId:'pdf.batch',action:'batch',label:'Batch',icon:'batch',scope:'pdf',plugin:'pdf-studio',status:'test',capability:'pdf.batch',help:{summary:'Traitements en lot sur les PDF sélectionnés.',details:'Nettoyage de métadonnées en lot avec restitution ZIP actif. PipelineService reste disponible pour l’extension à d’autres traitements.'}},
   {featureId:'pdf.security',action:'security',label:'Sécurité',icon:'security',scope:'pdf',plugin:'pdf-studio',status:'test',capability:'pdf.security',help:{summary:'Protéger, déverrouiller et inspecter un PDF.',details:'Protection AES-256 locale via qpdf WebAssembly. Le mot de passe d’ouverture chiffre le document ; le mot de passe propriétaire gère les permissions. Protéger avant de signer cryptographiquement.'}},
   {featureId:'pdf.metadata',action:'metadata',label:'Métadonnées',icon:'metadata',scope:'pdf',plugin:'pdf-studio',status:'test',capability:'pdf.metadata',help:{summary:'Lire, modifier ou nettoyer les métadonnées PDF.',details:'Titre, auteur, sujet, mots-clés et nettoyage des métadonnées éditables par le moteur local.'}}
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
