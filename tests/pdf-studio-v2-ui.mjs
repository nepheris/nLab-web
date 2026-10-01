import{chromium}from'playwright';
const url=process.env.PDF_STUDIO_V2_URL||'http://127.0.0.1:8765/APP-Applications/pdf-studio/v2/';
const fixture=process.env.PDF_STUDIO_FIXTURE||'/tmp/pdf-studio-v1.pdf';
const fixture2=process.env.PDF_STUDIO_FIXTURE2||'/tmp/pdf-studio-v1-b.pdf';
const folderFixture=process.env.PDF_STUDIO_FOLDER||'/tmp/pdf-studio-v2-folder';
const fail=m=>{throw new Error(m)};
const browser=await chromium.launch({headless:true});
const page=await browser.newPage({viewport:{width:1500,height:1000},acceptDownloads:true});
await page.addInitScript(()=>{Object.defineProperty(window,'showDirectoryPicker',{value:undefined,configurable:true});});
const errors=[];page.on('pageerror',e=>errors.push('pageerror: '+e.message));page.on('console',m=>{if(m.type()==='error'&&!/favicon|Failed to load resource/i.test(m.text()))errors.push('console: '+m.text())});
try{
 await page.goto(url,{waitUntil:'domcontentloaded',timeout:60000});
 await page.waitForSelector('#sectionConfig',{timeout:30000});
 await page.waitForSelector('#fileInput',{state:'attached',timeout:30000});
 await page.waitForTimeout(1200);if(errors.length)fail('Démarrage PDF V2 en erreur: '+errors.join(' | '));
 for(const id of ['sectionInput','sectionOutput','sectionPages','sectionAssembly','sectionStamps','sectionAnnotations','sectionOcr','sectionOptimize','sectionTranslate','sectionSignature','sectionCodes','sectionPageOutput','sectionConversion','sectionForms','sectionRedaction','sectionCompare','sectionBatch','sectionSecurity','sectionDiagnostics'])if(!await page.locator('#'+id).count())fail('Section V2 absente: '+id);
 // Fichier local : le contrôle est volontairement caché, mais doit accepter un fichier et déclencher le moteur.
 const fileChooserPromise=page.waitForEvent('filechooser');await page.locator('#pickFile').click();const fileChooser=await fileChooserPromise;await fileChooser.setFiles(fixture);
 await page.waitForFunction(()=>/\/\s*12/.test(document.querySelector('#pageInfo')?.textContent||''),null,{timeout:30000});
 if(!/pdf-studio-v1\.pdf/i.test(await page.locator('#sourceStatus').textContent()))fail('Ouverture fichier local non reflétée dans l’état');
 // Dossier : simule le fallback input webkitdirectory en injectant plusieurs fichiers.
 const folderChooserPromise=page.waitForEvent('filechooser');await page.locator('#pickFolder').click();const folderChooser=await folderChooserPromise;await folderChooser.setFiles(folderFixture);
 await page.waitForFunction(()=>/fichier/i.test(document.querySelector('#sourceStatus')?.textContent||'')||document.querySelectorAll('#fileCollection [data-collection-id]').length>=1,null,{timeout:30000});
 // Source distante : même moteur, via une URL HTTP/CORS accessible.
 const remoteUrl=new URL('/Library/demo/files/demo-input/Security/demo-redaction-secrets.pdf',url).href;
 await page.locator('#remoteFileUrl').fill(remoteUrl);await page.locator('#openRemoteUrl').click();
 await page.waitForFunction(()=>/Fichier distant chargé/.test(document.querySelector('#studioStatusText')?.textContent||''),null,{timeout:30000});
 // Configuration Drive : test local sans déclencher OAuth réel.
 await page.locator('#googleClientId').fill('1234567890-test.apps.googleusercontent.com');await page.locator('#googleApiKey').fill('AIzaTESTKEY');await page.locator('#googleAppId').fill('1234567890');await page.locator('#saveGoogleConfig').click();
 const driveCfg=await page.evaluate(()=>JSON.parse(localStorage.getItem('nlab-pdf-studio-v2-google')||'{}'));if(!driveCfg.clientId||!driveCfg.apiKey)fail('Configuration Drive V2 non persistée');
 // Recharger le fixture local pour la suite des tests de modification.
 await page.locator('#fileInput').setInputFiles(fixture);await page.waitForFunction(()=>/\/\s*12/.test(document.querySelector('#pageInfo')?.textContent||''),null,{timeout:30000});
 const z0=Number(await page.locator('#zoomInput').inputValue());await page.locator('#fitPage').click();await page.waitForTimeout(300);const z1=Number(await page.locator('#zoomInput').inputValue());if(!z1||z1===z0)fail('Fit page sans effet');
 await page.locator('#sectionConversion').evaluate(e=>e.open=true);
 await page.locator('#quickConversion').selectOption('docx');{const dl=page.waitForEvent('download');await page.locator('#runQuickConversion').click();const d=await dl;if(!/\.docx$/i.test(d.suggestedFilename()))fail('PDF→DOCX V2 invalide: '+d.suggestedFilename())}
 await page.locator('#quickConversion').selectOption('odt');{const dl=page.waitForEvent('download');await page.locator('#runQuickConversion').click();const d=await dl;if(!/\.odt$/i.test(d.suggestedFilename()))fail('PDF→ODT V2 invalide: '+d.suggestedFilename())}
 await page.locator('#sectionPageOutput').evaluate(e=>e.open=true);await page.locator('#headerFooterQr').fill('NLAB-V2-CI');await page.locator('#headerFooterQrPos').selectOption('header-right');await page.locator('#applyHeaderFooter').click();await page.waitForFunction(()=>/En-tête \/ pied appliqué/.test(document.querySelector('#studioStatusText')?.textContent||''),null,{timeout:15000});
 if(!await page.locator('#signatureDrawCanvas').count())fail('Canvas signature dessinée absent');
 {const dl=page.waitForEvent('download');await page.locator('#exportHistoryJson').click();const d=await dl;if(!/\.json$/i.test(d.suggestedFilename()))fail('Export historique JSON V2 invalide')}
 await page.locator('#fileInput').setInputFiles([fixture,fixture2]);await page.waitForTimeout(800);await page.locator('#fileSelectAll').click();await page.locator('#sectionBatch').evaluate(e=>e.open=true);{const dl=page.waitForEvent('download',{timeout:30000});await page.locator('#batchCleanMetadata').click();const d=await dl;if(!/\.zip$/i.test(d.suggestedFilename()))fail('Batch métadonnées V2 sans ZIP')}
 if(errors.length)fail('Erreurs navigateur V2: '+errors.join(' | '));
 console.log(JSON.stringify({ok:true,remoteUrl:true,driveConfig:true,fitPage:[z0,z1],conversion:['docx','odt'],batch:true,historyExport:true,headerQr:true},null,2));
}finally{await browser.close()}
