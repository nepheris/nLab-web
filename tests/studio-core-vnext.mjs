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
  if(await page.locator('#panelBody [data-setting="theme"]').inputValue()!=='dark')throw Error('Thème non synchronisé avec le moteur Core');
  if((await page.evaluate(()=>JSON.parse(localStorage.getItem('nlab-studio-v2-settings')||'{}').theme))!=='dark')throw Error('Thème non mémorisé dans les préférences Core');
  await page.locator('#panelBody [data-setting="theme"]').selectOption('light');
  if(await page.locator('#themeHeader').inputValue()!=='light')throw Error('Header non synchronisé depuis les paramètres Core');
  await page.locator('#panelBody [data-setting="theme"]').selectOption('dark');
  // Sidebar size/lock and icon theme must share the same canonical preference store.
  const iconSetting=page.locator('#panelBody [data-setting="iconTheme"]');
  if(!(await iconSetting.isVisible()))throw Error('Sélecteur d’icônes Core indisponible');
  const appearance=page.locator('.coreSettingsSection').filter({has:page.locator('[data-setting-number="sidebarWidth"]')});
  if(!(await appearance.evaluate(el=>el.open)))await appearance.locator(':scope > summary').click();
  await page.locator('[data-setting-number="sidebarWidth"]').fill('420');
  await page.locator('[data-setting-number="sidebarWidth"]').dispatchEvent('change');
  if(await page.locator('.layout').evaluate(el=>getComputedStyle(el).getPropertyValue('--side-width').trim())!=='420px')throw Error('Largeur panneau non synchronisée');
  await page.locator('[data-setting="sidebarLocked"]').check();
  if(await page.locator('#sidebarLock').getAttribute('aria-pressed')!=='true')throw Error('Verrouillage du panneau non synchronisé');
  if((await page.locator('#sidebarLock svg').count())!==1)throw Error('Cadenas commun des fenêtres absent');
  // A locked sidebar must not be resized. The same preference powers settings and controls.
  await page.locator('#sidebarLock').click();
  if(await page.locator('[data-setting="sidebarLocked"]').isChecked())throw Error('Le cadenas n’est pas synchronisé aux réglages');
  await page.locator('[data-setting="sidebarLocked"]').uncheck();
  // The same collapsed sidebar can always be reopened via the persistent rail.
  await page.locator('#sidebarCollapse').click();
  if(!(await page.locator('.layout').evaluate(el=>el.classList.contains('is-side-hidden'))))throw Error('Panneau non replié');
  if(await page.locator('#sidebarToggle').getAttribute('aria-expanded')!=='false')throw Error('État du panneau non synchronisé');
  await page.locator('#sidebarToggle').click();
  if(await page.locator('.layout').evaluate(el=>el.classList.contains('is-side-hidden')))throw Error('Panneau non déplié');
  // Resize from the SAME persisted Core sidebarWidth setting (mouse + keyboard).
  if(!mobile&&viewport.width>=1000){
   const grip=page.locator('.side .resizer');
   const rect=await grip.boundingBox();
   const original=Number(await page.locator('.layout').evaluate(el=>parseInt(getComputedStyle(el).getPropertyValue('--side-width'),10)));
   await page.mouse.move(rect.x+rect.width/2,rect.y+36);
   await page.mouse.down();
   await page.mouse.move(rect.x+rect.width/2+35,rect.y+36,{steps:3});
   await page.mouse.up();
   const stretched=Number(await page.locator('.layout').evaluate(el=>parseInt(getComputedStyle(el).getPropertyValue('--side-width'),10)));
   if(stretched<original+20)throw Error('Glisser pour redimensionner le panneau inopérant');
   await grip.focus();await page.keyboard.press('ArrowLeft');
   const adjusted=Number(await page.locator('.layout').evaluate(el=>parseInt(getComputedStyle(el).getPropertyValue('--side-width'),10)));
   if(adjusted!==stretched-16)throw Error('Redimensionnement clavier du panneau inopérant');
   if(Number(await page.evaluate(()=>JSON.parse(localStorage.getItem('nlab-studio-v2-settings')).sidebarWidth))!==adjusted)
    throw Error('Largeur du volet non mémorisée par le Core');
  }

  if(await page.locator('[data-visible="sidebar"]').isChecked()!==true)throw Error('Menu Affichage non synchronisé');

  // Office-like tabs are alternate views of the SAME Core commands, not duplicated actions.
  for(const [tab,activeGroup,hiddenGroup] of [
   ['file','files','history'],['edit','history','files'],['display','windows','files']]){
   await page.locator('[data-ribbon-tab="'+tab+'"]').click();
   if(await page.locator('[data-ribbon-group="'+activeGroup+'"]').isHidden())throw Error('Groupe ruban manquant : '+tab);
   if(!(await page.locator('[data-ribbon-group="'+hiddenGroup+'"]').isHidden()))throw Error('Groupe ruban incorrect : '+tab);
  }
  // Keyboard navigation and context panels use the same shared ribbon engine.
  await page.locator('[data-ribbon-tab="file"]').click();
  await page.locator('[data-ribbon-tab="file"]').focus();
  await page.keyboard.press('ArrowRight');
  if(await page.locator('[data-ribbon-tab="edit"]').getAttribute('aria-selected')!=='true')throw Error('Navigation clavier du ruban inactive');
  await page.locator('[data-ribbon-tab="home"]').click();
  if((await page.locator('.ribbon [data-cmd="save"]').count())!==1)throw Error('Enregistrer dupliqué dans le ruban');
  if((await page.locator('.ribbon [data-cmd="undo"]').count())!==1)throw Error('Annuler dupliqué dans le ruban');
  if((await page.locator('.ribbonGroupLabel').count())<4)throw Error('Groupes de ruban absent');
  await page.locator('.ribbon [data-cmd="show-properties"]').click();
  if(await page.locator('#panelTitle').textContent()!=='Propriétés')throw Error('Ruban Propriétés non raccordé au panneau');
  await page.locator('.ribbon [data-cmd="show-settings"]').click();
  if(await page.locator('#panelTitle').textContent()!=='Réglages')throw Error('Ruban Réglages non raccordé au panneau Core');
  if((await page.locator('.coreSettingsSurface').count())!==1)throw Error('Réglages Core dupliqués');

  // Icons in navigation, header and ribbon must come from the shared icon registry.
  for(const selector of ['.rail [data-panel="files"] [data-core-icon] svg',
   '.ribbon [data-cmd="import"] [data-core-icon] svg','#shareBtn [data-core-icon] svg']){
   if((await page.locator(selector).count())!==1)throw Error('Icône nLab partagée manquante : '+selector);
  }
  if(name==='desktop'){
   const personal=page.locator('.coreSettingsSection').filter({has:page.locator('[data-profile-host]')});
   await personal.locator(':scope > summary').click();
   await page.locator('[data-profile-save]').waitFor({state:'visible',timeout:20000});
   if((await page.locator('[data-profile-security-mode]').count())!==1)throw Error('Profil personnel Core dupliqué ou absent');
  }


  // Canonical collection, preview, history and properties use real Core services.
  await page.locator('#fileInput').setInputFiles({name:'vnext-test.txt',mimeType:'text/plain',buffer:Buffer.from('Fichier réel nLab TEST')});
  await page.locator('#filesList .collectionItem').first().waitFor({state:'visible'});
  if((await page.locator('#filesList .collectionItem').count())!==1)throw Error('Collection Core non alimentée');
  await page.getByText('Fichier réel nLab TEST',{exact:false}).first().waitFor({state:'visible'});
  await page.locator('#coreViewerToolbar [data-viewer-plus]').click();
  if(await page.locator('#filePreview').evaluate(el=>el.style.getPropertyValue('--core-preview-scale'))!=='1.25')throw Error('Zoom Core ViewerControl non appliqué');
  await page.locator('#coreViewerToolbar [data-viewer-fit]').click();
  if(await page.locator('#filePreview').evaluate(el=>el.style.getPropertyValue('--core-preview-scale'))!=='1')throw Error('Ajustement ViewerControl non appliqué');

  await page.locator('.rail [data-panel="history"]').click();
  await page.getByText('Import de fichiers',{exact:false}).first().waitFor({state:'visible'});
  await page.locator('[data-panel="properties"]').click();
  await page.locator('#panelBody [data-cmd="properties"]').click();
  await page.locator('#studioPropertyInspector').waitFor({state:'visible'});
  if(await page.locator('#studioPropertyInspector [data-property-key="name"]').inputValue()!=='vnext-test.txt')throw Error('Propriétés Core non reliées au fichier actif');
  await page.locator('#studioPropertyInspector [data-win-close]').click();
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
  const sharedLockSvg=await page.locator('#sidebarLock svg').evaluate(el=>el.outerHTML);
  const windowLockSvg=await floating.locator('[data-win-lock] svg').evaluate(el=>el.outerHTML);
  if(sharedLockSvg!==windowLockSvg)throw Error('Icônes cadenas différentes entre fenêtre et volet');
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
  await page.locator('.rail [data-panel="history"]').click();
  await page.locator('#uxHistorySearch').fill('Import');
  if((await page.locator('.uxHistorySidebar').count())!==1)throw Error('Historique dupliqué');
  if((await page.locator('#uxHistoryList .uxHistoryEntry').count())<1)throw Error('Recherche historique Core inactive');
  await page.locator('.rail [data-panel="files"]').click();
  await page.locator('.rail [data-panel="history"]').click();
  if((await page.locator('.uxHistorySidebar').count())!==1)throw Error('Historique cloné après navigation');
  // The existing command palette must find VNext's registered Core commands.
  await page.locator('.ribbon [data-cmd="commands"]').click();
  await page.locator('#studioCommandPalette').waitFor({state:'visible'});
  await page.locator('#command-palette-search').fill('Importer');
  await page.locator('[data-command-id="core-vnext.import"]').waitFor({state:'visible'});
  await page.locator('#command-palette-close').click();
  if(!(await page.locator('#studioCommandPalette').isHidden()))throw Error('Palette canonique non refermée');

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
  if(await page.locator('#themeHeader').inputValue()!=='dark')throw Error('Header non mémorisé depuis moteur Core');

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
