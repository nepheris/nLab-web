export default {
 id:'qr-barcode-studio',name:'QR & Barcode Studio',subtitle:'QR · Data Matrix · Code128 · EAN · Scanner',
 menus:[{id:'generate',label:'Génération'},{id:'scan',label:'Scanner'},{id:'demos',label:'Démos'},{id:'history',label:'Historique'},{id:'help',label:'Aide'}],
 ribbon:[
  {id:'preview',label:'Aperçu',items:[{id:'refreshPreview',action:'refreshPreview',label:'Actualiser',icon:'↻',primary:true},{id:'downloadPng',action:'downloadPng',label:'PNG',icon:'PNG'},{id:'downloadSvg',action:'downloadSvg',label:'SVG',icon:'SVG'}]},
  {id:'data',label:'Données',items:[{id:'openDemo',action:'openDemo',label:'Corpus démo',icon:'🧪'}]}
 ]
};