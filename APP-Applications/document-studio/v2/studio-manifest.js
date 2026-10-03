export default {
 homeHref:'../../',studiosHref:'../studios/',
 id:'document-studio',name:'Document Studio',subtitle:'DOCX · ODT · TXT · Markdown · HTML',
 menus:[{id:'edit',label:'Document'},{id:'preview',label:'Aperçu'},{id:'help',label:'Aide'}],
 ribbon:[
  {id:'file',label:'Fichier',items:[{id:'document-studio-open',action:'openDocument',label:'Ouvrir',icon:'file',primary:true},{id:'document-studio-txt',action:'exportTxt',label:'TXT',icon:'save'},{id:'document-studio-md',action:'exportMd',label:'Markdown',icon:'save'},{id:'document-studio-html',action:'exportHtml',label:'HTML',icon:'save'}]},
  {id:'office',label:'Office',items:[{id:'document-studio-docx',action:'exportDocx',label:'DOCX',icon:'convert'},{id:'document-studio-odt',action:'exportOdt',label:'ODT',icon:'convert'},{id:'document-studio-pdf',action:'printPdf',label:'PDF navigateur',icon:'convert'}]}
 ]
};