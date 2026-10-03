export default {
 homeHref:'../../',studiosHref:'../studios/',
 id:'document-studio',name:'Document Studio',subtitle:'DOCX · ODT · TXT · Markdown · HTML',
 menus:[{id:'edit',label:'Document'},{id:'preview',label:'Aperçu'},{id:'help',label:'Aide'}],
 ribbon:[
  {id:'file',label:'Fichier',items:[{id:'openDocument',action:'openDocument',label:'Ouvrir',icon:'file',primary:true},{id:'exportTxt',action:'exportTxt',label:'TXT',icon:'save'},{id:'exportMd',action:'exportMd',label:'Markdown',icon:'save'},{id:'exportHtml',action:'exportHtml',label:'HTML',icon:'save'}]},
  {id:'office',label:'Office',items:[{id:'exportDocx',action:'exportDocx',label:'DOCX',icon:'convert'},{id:'exportOdt',action:'exportOdt',label:'ODT',icon:'convert'},{id:'printPdf',action:'printPdf',label:'PDF navigateur',icon:'convert'}]}
 ]
};