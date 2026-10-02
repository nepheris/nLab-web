import{chromium}from'playwright';
const url=process.env.PDF_STUDIO_V2_URL||'http://127.0.0.1:8766/APP-Applications/pdf-studio/v2/';
const fixture=process.env.PDF_STUDIO_FIXTURE||'/tmp/pdf-studio-v1.pdf';
const fixture2=process.env.PDF_STUDIO_FIXTURE2||'/tmp/pdf-studio-v1-b.pdf';
const zipFixture=process.env.PDF_STUDIO_ZIP||'/tmp/pdf-studio-v2-workspace.zip';
const fail=m=>{throw new Error(m)};
async function reveal(page,selector){await page.locator(selector).evaluate(e=>{for(let n=e;n;n=n.parentElement)if(n.tagName==='DETAILS')n.open=true})}
async function load(page,path){await page.locator('#fileInput').setInputFiles([]);await page.locator('#fileInput').setInputFiles(path);await page.waitForFunction(()=>/\/\s*[1-9]\d*/.test(document.querySelector('#pageInfo')?.textContent||''),null,{timeout:30000})}
const browser=await chromium.launch({headless:true});
const page=await browser.newPage({viewport:{width:1500,height:1000},acceptDownloads:true});
const errors=[];page.on('pageerror',e=>errors.push('pageerror: '+e.message));page.on('console',m=>{if(m.type()==='error'&&!/favicon|Failed to load resource/i.test(m.text()))errors.push('console: '+m.text())});
try{
 await page.goto(url,{waitUntil:'domcontentloaded',timeout:60000});await page.waitForSelector('#fileInput',{state:'attached',timeout:30000});await load(page,fixture);

 // Métadonnées : écrire, relire, nettoyer.
 await reveal(page,'#pdfMetaTitle');await page.locator('#pdfMetaTitle').fill('nLab CI metadata');await page.locator('#pdfMetaAuthor').fill('nLab');await page.locator('#pdfMetaSubject').fill('deep acceptance');await page.locator('#pdfMetaKeywords').fill('nlab, ci, pdf');
 await page.locator('#savePdfMetadata').click();await page.waitForFunction(()=>/Métadonnées PDF enregistrées/.test(document.querySelector('#studioStatusText')?.textContent||''),null,{timeout:15000});
 await page.locator('#pdfMetaTitle').fill('');await page.locator('#loadPdfMetadata').click();if((await page.locator('#pdfMetaTitle').inputValue())!=='nLab CI metadata')fail('Métadonnées non relues après enregistrement');
 await page.locator('#cleanPdfMetadata').click();await page.waitForFunction(()=>/Métadonnées PDF nettoyées/.test(document.querySelector('#studioStatusText')?.textContent||''),null,{timeout:15000});

 // Formulaires : créer, inspecter, remplir, aplatir.
 await reveal(page,'#formFieldName');await page.locator('#formFieldName').fill('ci_champ');await page.locator('#addFormTextField').click();await page.waitForFunction(()=>/Champ de formulaire ajouté/.test(document.querySelector('#studioStatusText')?.textContent||''),null,{timeout:15000});
 await page.locator('#inspectForms').click();await page.waitForFunction(()=>/ci_champ/.test(document.querySelector('#formsResult')?.textContent||''),null,{timeout:10000});
 await reveal(page,'#formFillJson');await page.locator('#formFillJson').fill('{"ci_champ":"Valeur CI"}');await page.locator('#fillFormsJson').click();await page.waitForFunction(()=>/Champs de formulaire remplis/.test(document.querySelector('#studioStatusText')?.textContent||''),null,{timeout:15000});
 await page.locator('#flattenForms').click();await page.waitForFunction(()=>/Formulaires aplatis/.test(document.querySelector('#studioStatusText')?.textContent||''),null,{timeout:15000});

 // Tampon : création d'un preset, application réelle et export du PDF muté.
 await reveal(page,'[data-stamp-mode="editor"]');await page.locator('[data-stamp-mode="editor"]').click();await page.locator('#stampEditorLabel').fill('CI VALIDÉ');await page.locator('#stampEditorCategory').fill('Tests');await page.locator('#stampEditorTemplate').fill('CI VALIDÉ {STAMP_DATE:YYYY-MM-DD}');await page.locator('#saveStampPreset').click();await page.waitForFunction(()=>/Tampon enregistré/.test(document.querySelector('#studioStatusText')?.textContent||''),null,{timeout:10000});
 await page.locator('[data-stamp-mode="use"]').click();await page.locator('#stampPosition').selectOption('center');await page.locator('#stampScope').selectOption('current');await page.locator('#applyStampScope').click();await page.waitForFunction(()=>/Tampon ajouté sur 1 page/.test(document.querySelector('#studioStatusText')?.textContent||''),null,{timeout:10000});
 await reveal(page,'#savePdfSide');{const dl=page.waitForEvent('download');await page.locator('#savePdfSide').click();const d=await dl;if(!/\.pdf$/i.test(d.suggestedFilename()))fail('Export PDF après tampon invalide')}

 // Comparaison textuelle de deux PDF.
 await reveal(page,'#comparePdfBInput');await page.locator('#comparePdfBInput').setInputFiles(fixture2);await page.locator('#runComparePdf').click();await page.waitForFunction(()=>!/Aucune comparaison/.test(document.querySelector('#compareResult')?.textContent||''),null,{timeout:20000});

 // Fusion réelle de deux PDF.
 await page.locator('#fileInput').setInputFiles([]);await page.locator('#fileInput').setInputFiles([fixture,fixture2]);await page.waitForTimeout(800);await page.locator('#fileSelectAll').click();await reveal(page,'#assemblyUseSelection');await page.locator('#assemblyUseSelection').click();await page.waitForFunction(()=>/2 PDF/.test(document.querySelector('#assemblySelectionCount')?.textContent||''),null,{timeout:10000});
 await page.locator('#assemblyOutputName').fill('ci-fusion.pdf');await page.locator('#assemblyMergeNow').click();await page.waitForFunction(()=>/Fusion créée/.test(document.querySelector('#studioStatusText')?.textContent||''),null,{timeout:30000});const mergedPages=Number((await page.locator('#pageInfo').textContent()).replace(/\D/g,''));if(!(mergedPages>12))fail('Fusion PDF sans augmentation du nombre de pages');

 // Workspace ZIP : ouverture, réinjection du PDF courant et réexport.
 await page.locator('#fileInput').setInputFiles([]);await page.locator('#fileInput').setInputFiles(zipFixture);await page.waitForFunction(()=>!document.querySelector('#archiveWorkspaceControls')?.hidden,null,{timeout:30000});
 await page.locator('#updateArchiveEntry').click();await page.waitForFunction(()=>/Entrée ZIP mise à jour/.test(document.querySelector('#studioStatusText')?.textContent||''),null,{timeout:15000});
 {const dl=page.waitForEvent('download');await page.locator('#exportArchiveWorkspace').click();const d=await dl;if(!/\.zip$/i.test(d.suggestedFilename()))fail('Réexport workspace ZIP invalide')}

 if(errors.length)fail('Erreurs navigateur deep PDF V2: '+errors.join(' | '));
 console.log(JSON.stringify({ok:true,metadata:true,forms:true,stamp:true,compare:true,mergePages:mergedPages,zipWorkspace:true},null,2));
}finally{await browser.close()}
