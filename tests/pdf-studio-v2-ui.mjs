import{chromium}from'playwright';
const url=process.env.PDF_STUDIO_V2_URL||'http://127.0.0.1:8765/APP-Applications/pdf-studio/v2/';
const fixture=process.env.PDF_STUDIO_FIXTURE||'/tmp/pdf-studio-v1.pdf';
const fixture2=process.env.PDF_STUDIO_FIXTURE2||'/tmp/pdf-studio-v1-b.pdf';
const fail=m=>{throw new Error(m)};
const browser=await chromium.launch({headless:true});
const page=await browser.newPage({viewport:{width:1500,height:1000},acceptDownloads:true});
const errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error'&&!/favicon/i.test(m.text()))errors.push(m.text())});
try{
 await page.goto(url,{waitUntil:'domcontentloaded',timeout:60000});
 await page.waitForSelector('#sectionConfig',{timeout:30000});
 await page.waitForSelector('#fileInput',{timeout:30000});
 for(const id of ['sectionInput','sectionOutput','sectionPages','sectionAssembly','sectionStamps','sectionAnnotations','sectionOcr','sectionOptimize','sectionTranslate','sectionSignature','sectionCodes','sectionPageOutput','sectionConversion','sectionForms','sectionRedaction','sectionCompare','sectionBatch','sectionSecurity','sectionDiagnostics'])if(!await page.locator('#'+id).count())fail('Section V2 absente: '+id);
 await page.locator('#fileInput').setInputFiles(fixture);
 await page.waitForFunction(()=>/\/\s*12/.test(document.querySelector('#pageInfo')?.textContent||''),null,{timeout:30000});
 const z0=Number(await page.locator('#zoomInput').inputValue());await page.locator('#fitPage').click();await page.waitForTimeout(300);const z1=Number(await page.locator('#zoomInput').inputValue());if(!z1||z1===z0)fail('Fit page sans effet');
 await page.locator('#sectionConversion').evaluate(e=>e.open=true);
 await page.locator('#quickConversion').selectOption('docx');{const dl=page.waitForEvent('download');await page.locator('#runQuickConversion').click();const d=await dl;if(!/\.docx$/i.test(d.suggestedFilename()))fail('PDF→DOCX V2 invalide: '+d.suggestedFilename())}
 await page.locator('#quickConversion').selectOption('odt');{const dl=page.waitForEvent('download');await page.locator('#runQuickConversion').click();const d=await dl;if(!/\.odt$/i.test(d.suggestedFilename()))fail('PDF→ODT V2 invalide: '+d.suggestedFilename())}
 await page.locator('#sectionPageOutput').evaluate(e=>e.open=true);await page.locator('#headerFooterQr').fill('NLAB-V2-CI');await page.locator('#headerFooterQrPos').selectOption('header-right');await page.locator('#applyHeaderFooter').click();await page.waitForFunction(()=>/En-tête \/ pied appliqué/.test(document.querySelector('#studioStatusText')?.textContent||''),null,{timeout:15000});
 if(!await page.locator('#signatureDrawCanvas').count())fail('Canvas signature dessinée absent');
 {const dl=page.waitForEvent('download');await page.locator('#exportHistoryJson').click();const d=await dl;if(!/\.json$/i.test(d.suggestedFilename()))fail('Export historique JSON V2 invalide')}
 await page.locator('#fileInput').setInputFiles([fixture,fixture2]);await page.waitForTimeout(800);await page.locator('#fileSelectAll').click();await page.locator('#sectionBatch').evaluate(e=>e.open=true);{const dl=page.waitForEvent('download',{timeout:30000});await page.locator('#batchCleanMetadata').click();const d=await dl;if(!/\.zip$/i.test(d.suggestedFilename()))fail('Batch métadonnées V2 sans ZIP')}
 if(errors.length)fail('Erreurs navigateur V2: '+errors.join(' | '));
 console.log(JSON.stringify({ok:true,fitPage:[z0,z1],conversion:['docx','odt'],batch:true,historyExport:true,headerQr:true},null,2));
}finally{await browser.close()}
