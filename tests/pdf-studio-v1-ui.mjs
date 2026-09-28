import{chromium}from'playwright';import fs from'node:fs';
const url=process.env.PDF_STUDIO_URL||'http://127.0.0.1:8765/APP-Applications/pdf-studio/v1/';
const fixture=process.env.PDF_STUDIO_FIXTURE||'/tmp/pdf-studio-v1.pdf';
const fixture2=process.env.PDF_STUDIO_FIXTURE2||'/tmp/pdf-studio-v1-b.pdf';
const imageFixture=process.env.PDF_STUDIO_IMAGE||'/tmp/pdf-studio-v1-signature.png';
const configFixture=process.env.PDF_STUDIO_CONFIG||'/tmp/pdf-studio-v1-config.json';
const docxFixture=process.env.PDF_STUDIO_DOCX||'/tmp/pdf-studio-v1.docx';
const odtFixture=process.env.PDF_STUDIO_ODT||'/tmp/pdf-studio-v1.odt';
const fail=m=>{throw new Error(m)},browser=await chromium.launch({headless:true}),page=await browser.newPage({viewport:{width:1500,height:1000},acceptDownloads:true});
const errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text())});
const vis=async s=>await page.locator(s).count()>0&&await page.locator(s).first().isVisible();
try{
 await page.goto(url,{waitUntil:'domcontentloaded',timeout:60000});await page.waitForSelector('#sectionConfig',{timeout:30000});await page.waitForFunction(()=>!!window.__NLAB_PDF_V1__,null,{timeout:30000});
 if(errors.length)fail('Erreurs au démarrage: '+errors.join(' | '));
 for(const [s,n]of[['.studioBrand img','logo nLab'],['#sectionConfig','Configuration 0'],['#connectGoogle','Connexion'],['#pageScope','Portée'],['#thumbZoom','Zoom vignettes'],['#sidebarResizer','Redimensionnement panneau'],['#sectionOcr>summary','Section OCR'],['#sectionOptimize>summary','Section optimisation'],['#sectionConversion>summary','Section conversion'],['#sectionTranslation>summary','Section Traduction'],['#sectionSignature>summary','Section Signature'],['#selectedFilesSummary','Fichiers sélectionnés'],['#ribbonContext','Ruban contextuel']])if(!(await page.locator(s).count()))fail(n+' absent');
 for(const id of ['sectionOcr','sectionOptimize','sectionConversion','sectionTranslation','sectionSignature'])await page.locator('#'+id).evaluate(e=>e.open=true);
 for(const [s,n]of[['#runOcr','OCR'],['#runOptimize','Optimisation'],['#convertPdfDocument','Conversion'],['#runTranslation','Traduction'],['#runDss','DSS']])if(!(await vis(s)))fail(n+' absent après ouverture de section');
 const src=await page.locator('.studioBrand img').getAttribute('src');if(!src?.includes('nlab-wordmark.svg'))fail('Mauvais logo: '+src);
 if(await page.locator('[data-date]').count()!==5)fail('Les 5 dates ne sont pas présentes');
 if(await page.locator('#sourcePreset').inputValue()!=='manual'||await page.locator('#destinationPreset').inputValue()!=='manual')fail('Entrée/sortie pas en choix manuel');
 await page.locator('#configInput').setInputFiles(configFixture);await page.waitForFunction(()=>document.querySelector('#operatorInitials').value==='CI');
 {const preview=(await page.locator('#namePreview').textContent()||'').trim(),debug=await page.evaluate(()=>({initials:document.querySelector('#operatorInitials')?.value,prefix:document.querySelector('#namePrefix')?.value,template:document.querySelector('#nameTemplate')?.value,suffix:document.querySelector('#nameSuffix')?.value,preview:document.querySelector('#namePreview')?.textContent,vars:window.__NLAB_PDF_V1__?.variables?.values}));if(!preview.startsWith('CI_'))fail('Import configuration JSON non appliqué: '+JSON.stringify(debug));}
 const cfgDl=page.waitForEvent('download');await page.locator('#exportConfig').click();const cfgDownload=await cfgDl;if(!cfgDownload.suggestedFilename().endsWith('.json'))fail('Export config JSON invalide');
 await page.locator('#rbNaming').click();if(!(await page.locator('#ribbonContext').isVisible()))fail('Ruban contextuel renommage non affiché');if(!/Renommage/.test(await page.locator('#ribbonContextTitle').innerText()))fail('Contexte ruban incorrect');await page.locator('#ribbonContextClose').click();await page.locator('#sectionNaming').evaluate(e=>e.open=true);
 await page.locator('#globalClient').fill('CLIENTCI');
 await page.locator('#outputStructure').selectOption('custom');await page.locator('#outputPathTemplate').fill('{CLIENT}/{YEAR}/{MONTH}');await page.locator('#outputPathTemplate').dispatchEvent('input');
 await page.waitForFunction(()=>/^CLIENTCI\/\d{4}\/\d{2}$/.test((document.querySelector('#outputPathPreview')?.textContent||'').trim())).catch(()=>fail('Template dossier/chemin non résolu'));
 await page.locator('#namingMode').selectOption('code');await page.locator('#namingMode').dispatchEvent('change');await page.locator('#nameCodeTemplate').fill('{CLIENT}_{FILENAME}');await page.locator('#nameCodeTemplate').dispatchEvent('input');await page.waitForFunction(()=>document.querySelector('#namePreview').textContent.startsWith('CLIENTCI_')).catch(()=>fail('Mode nommage code/variables KO'));
 await page.locator('#filesInput').setInputFiles(fixture);await page.waitForFunction(()=>document.querySelectorAll('#pageStrip .pageThumb').length===12,null,{timeout:30000});await page.waitForTimeout(400);
 if(!/^1 \/ 1$/.test((await page.locator('#selectedFilesCount').innerText()).trim()))fail('Module fichiers sélectionnés KO: '+await page.locator('#selectedFilesCount').innerText());
 if(!(await page.locator('#selectedFilesSummary').innerText()).includes('pdf-studio-v1.pdf'))fail('Résumé fichiers sélectionnés absent');
 const thumbs=page.locator('#pageStrip .pageThumb'),checks=page.locator('#pageStrip .pageCheck');if(await checks.count()!==12)fail('Cases vignettes: '+await checks.count()+'/12');
 const geo=await thumbs.evaluateAll(ts=>ts.map(t=>{const c=t.querySelector('.pageCheck'),tr=t.getBoundingClientRect(),cr=c.getBoundingClientRect();return{x:cr.left-tr.left,y:cr.top-tr.top,v:getComputedStyle(c).display!=='none'}}));for(const[g,i]of geo.map((g,i)=>[g,i]))if(!g.v||g.x<0||g.x>12||g.y<0||g.y>12)fail('Case page '+(i+1)+' mal placée '+JSON.stringify(g));
 await checks.nth(0).check();await checks.nth(2).check();await page.waitForTimeout(80);if(await page.locator('#pageScope').inputValue()!=='selected')fail('La sélection par case ne bascule pas sur Pages cochées');
 const sel=await page.evaluate(()=>[...window.__NLAB_PDF_V1__.engine.selected]);if(sel.join(',')!=='1,3')fail('Sélection moteur incorrecte '+sel);
 await page.locator('#selectAllPages').click();if(await page.locator('#pageStrip .pageCheck:checked').count()!==12)fail('Tout cocher KO');await page.locator('#selectNonePages').click();if(await page.locator('#pageStrip .pageCheck:checked').count()!==0)fail('Tout décocher KO');
 const w1=await thumbs.first().evaluate(e=>e.getBoundingClientRect().width);await page.locator('#thumbZoom').fill('1.6');await page.locator('#thumbZoom').dispatchEvent('input');await page.waitForTimeout(120);const w2=await thumbs.first().evaluate(e=>e.getBoundingClientRect().width);if(w2<=w1+20)fail('Zoom vignettes sans effet '+w1+' -> '+w2);
 const ov=await page.locator('#pageStrip').evaluate(e=>({s:e.scrollWidth,c:e.clientWidth}));if(ov.s<=ov.c)fail('Pas de barre horizontale vignettes '+JSON.stringify(ov));await page.locator('#thumbRight').click();await page.waitForTimeout(400);if(await page.locator('#pageStrip').evaluate(e=>e.scrollLeft)<=0)fail('Navigation horizontale KO');
 await page.waitForFunction(()=>document.querySelectorAll('#textLayer span').length>0,null,{timeout:10000}).catch(()=>fail('Couche texte natif non rendue'));
 await page.locator('#sectionAnnotations').evaluate(e=>e.open=true);
 const annLayer=page.locator('#annotationLayer');await annLayer.scrollIntoViewIfNeeded();let ab=await annLayer.boundingBox();if(!ab)fail('Couche annotations sans géométrie');
 const curAnnPage=await page.evaluate(()=>window.__NLAB_PDF_V1__.engine.currentPage);
 await page.locator('[data-tool="text"]').click();await page.locator('#annotationText').fill('Objet texte CI');await page.mouse.click(ab.x+ab.width*.25,ab.y+ab.height*.22);
 await page.waitForFunction(p=>window.__NLAB_PDF_V1__.engine.annotations(p).some(x=>x.type==='text'),curAnnPage);
 await page.locator('[data-tool="highlight"]').click();await page.mouse.click(ab.x+ab.width*.28,ab.y+ab.height*.30);
 await page.waitForFunction(p=>window.__NLAB_PDF_V1__.engine.annotations(p).some(x=>x.type==='highlight'),curAnnPage);
 await page.locator('[data-tool="pen"]').click();await page.mouse.move(ab.x+ab.width*.20,ab.y+ab.height*.40);await page.mouse.down();await page.mouse.move(ab.x+ab.width*.36,ab.y+ab.height*.48,{steps:8});await page.mouse.up();
 await page.waitForFunction(p=>window.__NLAB_PDF_V1__.engine.annotations(p).some(x=>x.type==='pen'),curAnnPage);
 await page.locator('#imageInput').setInputFiles(imageFixture);await page.waitForFunction(()=>String(window.__NLAB_PDF_V1__?.annotations?.imageData||'').startsWith('data:image/'),null,{timeout:5000}).catch(()=>fail('Image importée non prête'));ab=await annLayer.boundingBox();await page.mouse.click(ab.x+ab.width*.42,ab.y+ab.height*.20);
 await page.waitForFunction(p=>window.__NLAB_PDF_V1__.engine.annotations(p).some(x=>x.type==='image'),curAnnPage,{timeout:5000}).catch(()=>fail('Objet image non ajouté après clic'));
 await page.locator('#signatureInput').setInputFiles(imageFixture);await page.waitForSelector('#signaturePreview img');await page.locator('[data-tool="signature"]').click();ab=await annLayer.boundingBox();await page.mouse.click(ab.x+ab.width*.50,ab.y+ab.height*.32);
 await page.waitForFunction(p=>window.__NLAB_PDF_V1__.engine.annotations(p).some(x=>x.type==='signature'),curAnnPage);
 const sw1=await page.locator('#studioSidebar').evaluate(e=>e.getBoundingClientRect().width);await page.locator('#sidebarResizer').scrollIntoViewIfNeeded();await page.waitForTimeout(80);const grip=await page.locator('#sidebarResizer').boundingBox();if(!grip)fail('Grip sidebar sans géométrie');const hitBefore=await page.evaluate(({x,y})=>{const e=document.elementFromPoint(x,y);return{tag:e?.tagName,id:e?.id,cls:e?.className,css:getComputedStyle(document.documentElement).getPropertyValue('--studio-sidebar-width')}},{x:grip.x+6,y:grip.y+Math.min(100,Math.max(2,grip.height/2))});const gy=grip.y+Math.min(100,Math.max(2,grip.height/2));await page.mouse.move(grip.x+6,gy);await page.mouse.down();await page.mouse.move(grip.x+100,gy,{steps:5});await page.mouse.up();await page.waitForTimeout(120);const resizeDebug=await page.evaluate(()=>({width:document.querySelector('#studioSidebar').getBoundingClientRect().width,css:getComputedStyle(document.documentElement).getPropertyValue('--studio-sidebar-width'),stored:localStorage.getItem('nlab-studio-v1-sidebar-width'),main:document.querySelector('#studioMain').className})),sw2=resizeDebug.width;if(sw2<=sw1+40)fail('Resize sidebar KO '+sw1+' -> '+sw2+' grip='+JSON.stringify(grip)+' hit='+JSON.stringify(hitBefore)+' state='+JSON.stringify(resizeDebug));
 await page.locator('#pageScope').selectOption('all');await page.locator('#rbRotateRight').click();await page.waitForFunction(()=>window.__NLAB_PDF_V1__.engine.pdfDoc.getPage(0).getRotation().angle===90);const rotations=await page.evaluate(()=>[window.__NLAB_PDF_V1__.engine.pdfDoc.getPage(0).getRotation().angle,window.__NLAB_PDF_V1__.engine.pdfDoc.getPage(11).getRotation().angle]);if(rotations.some(x=>x!==90))fail('Rotation tout document KO '+rotations);await page.locator('#rbRotateLeft').click();await page.waitForFunction(()=>window.__NLAB_PDF_V1__.engine.pdfDoc.getPage(0).getRotation().angle===0);
 await page.locator('#pageScope').selectOption('current');await page.locator('#rbAddPage').click();await page.waitForFunction(()=>window.__NLAB_PDF_V1__.engine.pageCount===13);await page.locator('#rbDeletePages').click();await page.waitForFunction(()=>window.__NLAB_PDF_V1__.engine.pageCount===12);await page.locator('#sectionPages').evaluate(e=>e.open=true);await page.locator('#duplicatePage').click();await page.waitForFunction(()=>window.__NLAB_PDF_V1__.engine.pageCount===13);
 const extDl=page.waitForEvent('download');await page.locator('#extractPages').click();const exd=await extDl;if(!exd.suggestedFilename().endsWith('.pdf'))fail('Extraction page sans PDF');
 await page.locator('#rbDeletePages').click();await page.waitForFunction(()=>window.__NLAB_PDF_V1__.engine.pageCount===12);
 await page.locator('#selectNonePages').click();await page.locator('#pageStrip .pageCheck').nth(0).check();await page.locator('#pageStrip .pageCheck').nth(2).check();const stampSel=await page.evaluate(()=>[...window.__NLAB_PDF_V1__.engine.selected].sort((a,b)=>a-b));if(stampSel.join(',')!=='1,3')fail('Sélection avant tampon incorrecte '+stampSel);
await page.locator('#sectionStamps').evaluate(e=>e.open=true);await page.locator('#addStampScope').click();await page.waitForTimeout(120);const ac=await page.evaluate(()=>[window.__NLAB_PDF_V1__.engine.annotations(1).length,window.__NLAB_PDF_V1__.engine.annotations(3).length]);if(ac[0]<1||ac[1]<1)fail('Tampon multi-pages KO '+ac);
 if(!(await page.locator('#namePreview').innerText()).includes('_VALIDE'))fail('Tampon non lié au suffixe de nommage');

 // Advanced historical tools.
 await page.locator('#sectionCodes').evaluate(e=>e.open=true);
 const currentBeforeQr=await page.evaluate(()=>window.__NLAB_PDF_V1__.engine.currentPage),annBeforeQr=await page.evaluate(p=>window.__NLAB_PDF_V1__.engine.annotations(p).length,currentBeforeQr);
 await page.locator('#codeValue').fill('NLAB-V1-TEST');await page.locator('#addQr').click();
 await page.waitForFunction(({p,n})=>window.__NLAB_PDF_V1__.engine.annotations(p).length>n,{p:currentBeforeQr,n:annBeforeQr},{timeout:5000});
 const qrAnn=await page.evaluate(p=>window.__NLAB_PDF_V1__.engine.annotations(p).at(-1)?.dataUrl||'',currentBeforeQr);if(!qrAnn.startsWith('data:image/'))fail('QR non généré comme image');const beforeBarcode=await page.evaluate(p=>window.__NLAB_PDF_V1__.engine.annotations(p).length,currentBeforeQr);await page.locator('#codeValue').fill('123456789012');await page.locator('#addBarcode').click();await page.waitForFunction(({p,n})=>window.__NLAB_PDF_V1__.engine.annotations(p).length>n,{p:currentBeforeQr,n:beforeBarcode},{timeout:5000});

 await page.locator('#sectionPageOutput').evaluate(e=>e.open=true);await page.locator('#pageScope').selectOption('current');
 await page.locator('#globalReference').fill('REF-CI');await page.locator('#headerLeft').fill('{CLIENT}');await page.locator('#headerTemplate').fill('nLab · {FILENAME}');await page.locator('#footerTemplate').fill('Page {PAGE}/{PAGES}');await page.locator('#headerFooterQr').fill('{REFERENCE}');await page.locator('#headerFooterQrPos').selectOption('header-right');const baseLen=await page.evaluate(()=>window.__NLAB_PDF_V1__.engine.bytes.length);await page.locator('#applyHeaderFooter').click();
 await page.waitForFunction(n=>window.__NLAB_PDF_V1__.engine.bytes.length!==n,baseLen,{timeout:10000}).catch(()=>fail('En-tête/pied/QR sans modification PDF'));
 await page.locator('#sectionConversion').evaluate(e=>e.open=true);await page.locator('#documentExportFormat').selectOption('docx');const docxDl=page.waitForEvent('download');await page.locator('#convertPdfDocument').click();const docxd=await docxDl;if(!docxd.suggestedFilename().endsWith('.docx'))fail('PDF→DOCX invalide '+docxd.suggestedFilename());
 await page.locator('#documentExportFormat').selectOption('odt');const odtDl=page.waitForEvent('download');await page.locator('#convertPdfDocument').click();const odtd=await odtDl;if(!odtd.suggestedFilename().endsWith('.odt'))fail('PDF→ODT invalide '+odtd.suggestedFilename());
 const pngDl=page.waitForEvent('download');await page.locator('#pdfToPng').click();const pd=await pngDl;if(!pd.suggestedFilename().endsWith('.png'))fail('PDF→PNG invalide '+pd.suggestedFilename());const cropBefore=await page.evaluate(()=>window.__NLAB_PDF_V1__.engine.pdfDoc.getPage(window.__NLAB_PDF_V1__.engine.currentPage-1).getCropBox().width);await page.locator('#cropLeft').fill('1');await page.locator('#cropRight').fill('1');await page.locator('#cropPages').click();await page.waitForFunction(w=>window.__NLAB_PDF_V1__.engine.pdfDoc.getPage(window.__NLAB_PDF_V1__.engine.currentPage-1).getCropBox().width<w,cropBefore,{timeout:5000});

 await page.locator('#sectionForms').evaluate(e=>e.open=true);await page.locator('#newFormFieldName').fill('TestFieldV1');await page.locator('#addFormField').click();
 await page.waitForFunction(()=>window.__NLAB_PDF_V1__.advanced.inspectForms().some(x=>x.name==='TestFieldV1'),null,{timeout:5000});
 await page.locator('#formValues').fill('{"TestFieldV1":"OK"}');await page.locator('#fillForms').click();await page.locator('#flattenForms').click();
 await page.waitForFunction(()=>window.__NLAB_PDF_V1__.advanced.inspectForms().length===0,null,{timeout:5000});

 // OCR and optimization on the current page.
 await page.locator('#pageScope').selectOption('current');await page.locator('#ocrLang').selectOption('eng');await page.locator('#runOcr').click();
 await page.waitForFunction(()=>document.querySelector('#ocrResult').value.trim().length>8,null,{timeout:120000}).catch(()=>fail('OCR réel sans résultat'));
 const ocrText=(await page.locator('#ocrResult').inputValue()).trim();if(!/fixture|synthetic|nlab/i.test(ocrText))fail('OCR résultat inattendu: '+ocrText.slice(0,120));
 await page.locator('#optDpi').fill('150');await page.locator('#optJpeg').fill('82');await page.locator('#runOptimize').click();
 await page.waitForFunction(()=>window.__NLAB_PDF_V1__.variables.operation.jpeg===82,null,{timeout:30000});


 await page.locator('#sectionRedaction').evaluate(e=>e.open=true);await page.locator('#redactionTool').click();
 const layer=page.locator('#annotationLayer'),lb=await layer.boundingBox();if(!lb)fail('Couche annotation sans géométrie');await page.mouse.click(lb.x+lb.width*.35,lb.y+lb.height*.35);
 await page.waitForFunction(()=>window.__NLAB_PDF_V1__.engine.annotations(window.__NLAB_PDF_V1__.engine.currentPage).some(x=>x.type==='redaction'),null,{timeout:3000});
 await page.locator('#applyRedactions').click();await page.waitForFunction(()=>!window.__NLAB_PDF_V1__.engine.annotations(window.__NLAB_PDF_V1__.engine.currentPage).some(x=>x.type==='redaction'),null,{timeout:10000});

 // Translation endpoint contract + bilingual PDF composition.
 await page.route('https://translation.test/**',route=>route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({translation:'Translated by nLab CI'})}));
 await page.evaluate(()=>window.__NLAB_PDF_V1__.engine.selectPage(4));await page.locator('#pageScope').selectOption('current');await page.locator('#translationSource').selectOption('fr');await page.locator('#translationTarget').selectOption('en');await page.locator('#translationEndpoint').fill('https://translation.test/api');
 const trDl=page.waitForEvent('download',{timeout:12000}).catch(()=>null);await page.locator('#runTranslation').click();const td=await trDl;if(!td){const debug=await page.evaluate(()=>({translation:document.querySelector('#translationStatus')?.textContent,status:document.querySelector('#studioStatusText')?.textContent,outputProvider:document.querySelector('#outputProvider')?.value,outputActive:document.querySelector('#outputModeStatus')?.textContent}));fail('Traduction sans téléchargement: '+JSON.stringify(debug)+' errors='+errors.join(' | '))}if(!/_bilingue\.pdf$/i.test(td.suggestedFilename()))fail('Traduction sans PDF bilingue: '+td.suggestedFilename());


 await page.locator('#sectionCompareBatch').evaluate(e=>e.open=true);await page.locator('#compareInput').setInputFiles(fixture2);
 await page.waitForFunction(()=>document.querySelector('#compareStatus').textContent.includes('similarité moyenne'),null,{timeout:10000});const batchDl=page.waitForEvent('download');await page.locator('#batchCleanMetadata').click();const bd=await batchDl;if(!bd.suggestedFilename().endsWith('.zip'))fail('Batch métadonnées sans ZIP');

 await page.locator('#sectionSecurity').evaluate(e=>e.open=true);await page.locator('#inspectSignatureStructure').click();
 const secTxt=await page.locator('#securityStatus').innerText();if(!/signature/i.test(secTxt))fail('Inspection structure signature sans résultat');
 await page.locator('#cleanMetadata').click();

 // DSS connector contract: simulate a private signer returning a PDF.
 await page.route('https://dss.test/**',route=>route.fulfill({status:200,contentType:'application/pdf',body:fs.readFileSync(fixture)}));
 await page.locator('#dssEndpoint').fill('https://dss.test/sign');await page.locator('#dssToken').fill('ci-token');await page.locator('#runDss').click();
 await page.waitForFunction(()=>document.querySelector('#documentHistory').textContent.includes('Signature DSS'),null,{timeout:15000}).catch(()=>fail('Connecteur DSS sans résultat'));


 const download=page.waitForEvent('download');await page.locator('#savePdf').click();const d=await download;if(!d.suggestedFilename().endsWith('.pdf'))fail('Export PDF invalide '+d.suggestedFilename());const path=await d.path();if(!path||fs.statSync(path).size<500)fail('PDF exporté vide');const zipDl=page.waitForEvent('download');await page.locator('#exportZip').click();const zd=await zipDl;if(!zd.suggestedFilename().endsWith('.zip'))fail('Export ZIP invalide '+zd.suggestedFilename());const zp=await zd.path();if(!zp||fs.statSync(zp).size<800)fail('ZIP exporté vide');
 const historyBefore=await page.evaluate(()=>window.__NLAB_PDF_V1__.history.list().length);if(historyBefore<5)fail('Historique trop court avant reload: '+historyBefore);
 await page.reload({waitUntil:'domcontentloaded'});await page.waitForFunction(()=>!!window.__NLAB_PDF_V1__);const historyAfter=await page.evaluate(()=>window.__NLAB_PDF_V1__.history.list().length);if(historyAfter<historyBefore)fail('Historique non persistant '+historyBefore+' -> '+historyAfter);if(!(await page.locator('#documentHistory').innerText()).trim())fail('Historique persistant non rendu');
 await page.locator('#filesInput').setInputFiles([fixture,fixture2]);await page.waitForFunction(()=>window.__NLAB_PDF_V1__.workspace.items.length===2);await page.locator('#sectionPages').evaluate(e=>e.open=true);await page.locator('#mergeSelectedFiles').click();await page.waitForFunction(()=>window.__NLAB_PDF_V1__.engine.pageCount===15,{timeout:30000}).catch(async()=>{const n=await page.evaluate(()=>window.__NLAB_PDF_V1__.engine.pageCount);fail('Fusion PDF KO pageCount='+n)});
 const diag=await page.evaluate(()=>({version:window.__NLAB_PDF_V1__.version,pages:window.__NLAB_PDF_V1__.engine.pageCount,legacy:[...document.scripts].some(s=>/runtime09/.test(s.src))}));if(diag.version!=='1.0.0 TEST'||diag.legacy)fail('Diagnostic runtime incorrect '+JSON.stringify(diag));
 // Bidirectional office-source conversion: DOCX/ODT -> internal PDF -> downloadable PDF.
 await page.locator('#filesInput').setInputFiles(docxFixture);await page.waitForFunction(()=>/\.docx$/i.test(window.__NLAB_PDF_V1__.engine.fileName)&&window.__NLAB_PDF_V1__.engine.pageCount>0,null,{timeout:15000}).catch(()=>fail('DOCX → PDF interne KO'));const docxPdfDl=page.waitForEvent('download');await page.locator('#savePdf').click();const dpd=await docxPdfDl;if(!dpd.suggestedFilename().endsWith('.pdf'))fail('DOCX → PDF export KO');
 await page.locator('#filesInput').setInputFiles(odtFixture);await page.waitForFunction(()=>/\.odt$/i.test(window.__NLAB_PDF_V1__.engine.fileName)&&window.__NLAB_PDF_V1__.engine.pageCount>0,null,{timeout:15000}).catch(()=>fail('ODT → PDF interne KO'));const odtPdfDl=page.waitForEvent('download');await page.locator('#savePdf').click();const opd=await odtPdfDl;if(!opd.suggestedFilename().endsWith('.pdf'))fail('ODT → PDF export KO');
 if(errors.length)fail('Erreurs navigateur: '+errors.join(' | '));
 console.log(JSON.stringify({ok:true,geometry:geo.slice(0,2),thumbZoom:[w1,w2],sidebar:[sw1,sw2],rotations,annotations:ac,mergePages:diag.pages},null,2));
}finally{await browser.close()}