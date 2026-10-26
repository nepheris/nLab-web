// Studio Core VNext — isolated responsive/header smoke checks.
// Run with: NLAB_BASE_URL=http://127.0.0.1:8770/ node tests/studio-core-vnext.mjs
import {chromium} from 'playwright';

const base=process.env.NLAB_BASE_URL||'http://127.0.0.1:8770/';
const browser=await chromium.launch({headless:true,...(process.env.NLAB_BROWSER_CHANNEL?{channel:process.env.NLAB_BROWSER_CHANNEL}:{})});
const scenarios=[
 {name:'desktop',viewport:{width:1366,height:850},mobile:false},
 {name:'tablet',viewport:{width:768,height:1024},mobile:false},
 {name:'android-narrow',viewport:{width:320,height:700},mobile:true},
 {name:'android-small',viewport:{width:360,height:780},mobile:true},
 {name:'android-wide',viewport:{width:412,height:915},mobile:true},
 {name:'android-landscape',viewport:{width:844,height:390},mobile:true},
];
const records=[];
async function runScenario({name,viewport,mobile}){
 const context=await browser.newContext({viewport,isMobile:mobile,hasTouch:mobile,acceptDownloads:true});
 const page=await context.newPage();
 const errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 const url=new URL('APP-Applications/studio-core-test/vnext/',base).href;
 try{
  const response=await page.goto(url,{waitUntil:'domcontentloaded',timeout:30000});
  if(!response?.ok())throw Error('HTML indisponible : '+response?.status());
  await page.locator('#shareBtn').waitFor({state:'visible'});
  await page.locator('[data-panel="settings"]').click();
  await page.locator('#themeHeader').selectOption('dark');
  if(!(await page.locator('body').evaluate(el=>el.classList.contains('dark'))))throw Error('Thème sombre non appliqué');
  if(await page.locator('#panelBody [data-theme-select]').inputValue()!=='dark')throw Error('Préférence thème non synchronisée');

  // Canonical collection, preview, history and properties use real Core services.
  await page.locator('#fileInput').setInputFiles({name:'vnext-test.txt',mimeType:'text/plain',buffer:Buffer.from('Fichier réel nLab TEST')});
  await page.locator('#filesList .collectionItem').first().waitFor({state:'visible'});
  if((await page.locator('#filesList .collectionItem').count())!==1)throw Error('Collection Core non alimentée');
  await page.getByText('Fichier réel nLab TEST',{exact:false}).first().waitFor({state:'visible'});
  await page.locator('[data-panel="history"]').click();
  await page.getByText('Import de fichiers',{exact:false}).first().waitFor({state:'visible'});
  await page.locator('[data-panel="properties"]').click();
  await page.getByText('vnext-test.txt',{exact:false}).first().waitFor({state:'visible'});
  // Real unmodified-file export through the shared OutputService.
  const downloadPromise=page.waitForEvent('download');
  await page.locator('.ribbon [data-cmd="save"]').click();
  const download=await downloadPromise;
  if(download.suggestedFilename()!=='vnext-test.txt')throw Error('Nom de sauvegarde inattendu');
  // Save As must preserve the real file content and offer a distinct name.
  await page.locator('.ribbon [data-cmd="save-as"]').click();
  await page.locator('#saveAsName').fill('vnext-copie.txt');
  const renamedDownloadPromise=page.waitForEvent('download');
  await page.locator('#confirmSaveAs').click();
  const renamedDownload=await renamedDownloadPromise;
  if(renamedDownload.suggestedFilename()!=='vnext-copie.txt')throw Error('Enregistrer sous ne respecte pas le nom');
  if(await page.locator('#saveAsDialog').evaluate(el=>el.open))throw Error('Dialogue Enregistrer sous non fermé');
  // Shared window manager: close/reopen, lock, dock and minimize.
  await page.locator('.ribbon [data-cmd="windows"]').click();
  const floating=page.locator('[data-vnext-floating="windows"]');
  await floating.waitFor({state:'visible'});
  for(const control of ['lock','dock','collapse','close'])
   if((await floating.locator('[data-win-'+control+']').count())!==1)throw Error('Contrôle de fenêtre manquant : '+control);
  await floating.locator('[data-win-lock]').click();
  if(!(await floating.evaluate(el=>el.classList.contains('studioWindowLocked'))))throw Error('Fenêtre non verrouillée');
  await floating.locator('[data-win-lock]').click();
  await floating.locator('[data-win-dock]').click();
  if(!(await floating.evaluate(el=>el.classList.contains('studioWindowDocked'))))throw Error('Fenêtre non ancrée');
  await floating.locator('[data-win-dock]').click();
  await floating.locator('[data-win-collapse]').click();
  if(!(await floating.evaluate(el=>el.classList.contains('studioWindowCollapsed'))))throw Error('Fenêtre non repliée');
  await floating.locator('[data-win-collapse]').click();
  await floating.locator('[data-win-close]').click();
  if(!(await floating.isHidden()))throw Error('Fenêtre non masquée');

  // One actual Core InputPicker (no VNext-specific modal/processing copy).
  await page.locator('.ribbon [data-cmd="import"]').click();
  await page.locator('#studioInputPicker').waitFor({state:'visible'});
  if(!(await page.locator('#studioInputPickFolder').isVisible()))throw Error('Sélection Dossier Core manquante');
  if(!(await page.locator('#studioInputUrl').isVisible()))throw Error('Import URL Core manquant');
  await page.locator('#studioInputFilesNative').setInputFiles({
   name:'shared-picker.txt',mimeType:'text/plain',buffer:Buffer.from('Test canonique')
  });
  await page.locator('#studioInputConfirm').click();
  await page.waitForFunction(()=>document.querySelectorAll('#filesList .collectionItem').length===2);

  // Both Undo and Redo must use the common Core undo-redo service.
  await page.locator('.ribbon [data-cmd="undo"]').click();
  await page.waitForFunction(()=>document.querySelectorAll('#filesList .collectionItem').length===1);
  await page.locator('.ribbon [data-cmd="redo"]').click();
  await page.waitForFunction(()=>document.querySelectorAll('#filesList .collectionItem').length===2);

  // The original history sidebar is moved, never cloned or reimplemented.
  await page.locator('[data-panel="history"]').click();
  await page.locator('#uxHistorySearch').fill('Import');
  if((await page.locator('.uxHistorySidebar').count())!==1)throw Error('Historique dupliqué');
  if((await page.locator('#uxHistoryList .uxHistoryEntry').count())<1)throw Error('Recherche historique Core inactive');
  await page.locator('[data-panel="files"]').click();
  await page.locator('[data-panel="history"]').click();
  if((await page.locator('.uxHistorySidebar').count())!==1)throw Error('Historique cloné après navigation');
  await page.locator('#shareBtn').click();
  if(await page.locator('#shareMenu').isHidden())throw Error('Menu Partager fermé');
  if(await page.locator('#shareMenu [data-share]').count()!==3)throw Error('Les trois choix manquent');

  await page.evaluate(()=>{window.__printed=false;window.print=()=>window.__printed=true});
  await page.locator('[data-share="pdf"]').click();
  if(!(await page.evaluate(()=>window.__printed)))throw Error('Action Imprimer/PDF non appelée');

  await page.locator('#shareBtn').click();
  await page.locator('#shareMenu [data-share="qr"]').click();
  if(!(await page.locator('#qrDialog').evaluate(el=>el.open)))throw Error('Fenêtre QR absente');
  await page.locator('#closeQr').click();
  if(await page.locator('#qrDialog').evaluate(el=>el.open))throw Error('QR non refermé');

  await page.locator('#displayBtn').click();
  const workCheckbox=page.locator('[data-visible="work"]');
  await workCheckbox.uncheck();
  if(!(await page.locator('.workspace').evaluate(el=>el.classList.contains('is-work-hidden'))))throw Error('Planche non masquée');
  await page.reload({waitUntil:'domcontentloaded'});
  if(!(await page.locator('.workspace').evaluate(el=>el.classList.contains('is-work-hidden'))))throw Error('Planche non mémorisée');
  await page.locator('[data-cmd="toggle-work"]').first().click();
  if(await page.locator('.workspace').evaluate(el=>el.classList.contains('is-work-hidden')))throw Error('Planche non réaffichée');
  if(!(await page.locator('body').evaluate(el=>el.classList.contains('dark'))))throw Error('Thème non mémorisé');

  const result=await page.evaluate(()=>({viewport:innerWidth,documentWidth:document.documentElement.scrollWidth,
   shareVisible:!!document.querySelector('#shareBtn')?.getClientRects().length,
   railVisible:!!document.querySelector('.rail')?.getClientRects().length}));
  if(result.documentWidth>result.viewport+2)throw Error('Débordement horizontal : '+JSON.stringify(result));
  if(!result.shareVisible||!result.railVisible)throw Error('Contrôles essentiels invisibles');
  if(errors.length)throw Error('Erreurs JavaScript : '+errors.join(' | '));
  records.push({name,status:'PASS',...result});
 }catch(error){records.push({name,status:'FAIL',error:String(error.message),errors});throw error}
 finally{await context.close()}
}
try{
 for(const s of scenarios)await runScenario(s);
 console.log(JSON.stringify({suite:'studio-core-vnext',records},null,2));
}catch(error){
 console.error(JSON.stringify({suite:'studio-core-vnext',records},null,2));
 process.exitCode=1;
}finally{await browser.close()}
