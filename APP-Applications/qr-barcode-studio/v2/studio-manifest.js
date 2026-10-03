export default {
 homeHref:'../../',studiosHref:'../studios/',
 id:'qr-barcode-studio',
 sourcePath:'APP-Applications/qr-barcode-studio/v2/index.html',name:'QR & Barcode Studio',subtitle:'QR · Data Matrix · Aztec · PDF417 · 1D · Scanner',
 capabilities:[
  {id:'symbology.generate',status:'test'},
  {id:'symbology.scan.image',status:'test'},
  {id:'symbology.scan.hid',status:'stable'},
  {id:'symbology.export.png',status:'stable'},
  {id:'symbology.export.svg',status:'partial'}
 ],
 menus:[{id:'generate',label:'Génération'},{id:'scan',label:'Scanner'},{id:'demos',label:'Démos'},{id:'history',label:'Historique'},{id:'help',label:'Aide'}],
 ribbon:[
  {id:'preview',label:'Aperçu',items:[{id:'refreshPreview',action:'refreshPreview',label:'Actualiser',icon:'command',primary:true},{id:'downloadPng',action:'downloadPng',label:'PNG',icon:'command'},{id:'downloadSvg',action:'downloadSvg',label:'SVG',icon:'command'}]},
  {id:'data',label:'Données',items:[{id:'openDemo',action:'openDemo',label:'Corpus démo',icon:'command'}]}
 ]
};