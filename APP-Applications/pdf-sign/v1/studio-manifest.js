export default {
 id:'pdf-sign',
 name:'nLab PDF Sign',
 subtitle:'Mini-app dérivée de PDF Studio · signature et paraphe',
 homeHref:'../../../',
 logoHref:'../../../assets/branding/nlab-wordmark.svg',
 studioIconHref:'../../../assets/studios/pdf-sign.svg',
 studiosHref:'../../studios/',
 versionsHref:'../versions.html',
 sourcePath:'APP-Applications/pdf-sign/v1/index.html',
 menus:[
  {id:'home',label:'Signature',scope:'studio'},
  {id:'file',label:'Document',scope:'core'},
  {id:'help',label:'Aide',scope:'core'}
 ],
 ribbon:[
  {id:'input',label:'Document',scope:'core',items:[
   {id:'openPdf',featureId:'core.input.pdf.open',action:'openPdf',label:'Ouvrir PDF',icon:'file',scope:'core',plugin:'studio-core',status:'stable',capability:'file.open',primary:true}
  ]},
  {id:'sign',label:'Signer',scope:'studio',items:[
   {id:'applySignature',featureId:'pdf.sign.visual',action:'applySignature',label:'Signer',icon:'signature',scope:'studio',plugin:'pdf-sign',status:'test',capability:'pdf.signature.visual'},
   {id:'applyInitials',featureId:'pdf.sign.initials',action:'applyInitials',label:'Parapher',icon:'pen',scope:'studio',plugin:'pdf-sign',status:'test',capability:'pdf.signature.visual'}
  ]},
  {id:'output',label:'Sortie',scope:'core',items:[
   {id:'savePdf',featureId:'core.output.save',action:'savePdf',label:'Télécharger',icon:'save',scope:'core',plugin:'studio-core',status:'stable',capability:'output.save'}
  ]}
 ]
};
