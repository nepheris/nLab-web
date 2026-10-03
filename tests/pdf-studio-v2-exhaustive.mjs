import{chromium}from'playwright';
import{readFile}from'node:fs/promises';
const url=process.env.PDF_STUDIO_V2_URL||'http://127.0.0.1:8768/APP-Applications/pdf-studio/v2/';
const fixture=process.env.PDF_STUDIO_FIXTURE||'/tmp/pdf-studio-v1.pdf';
const fixture2=process.env.PDF_STUDIO_FIXTURE2||'/tmp/pdf-studio-v1-b.pdf';
const fail=m=>{throw new Error(m)};
async function reveal(p,s){await p.locator(s).evaluate(e=>{for(let n=e;n;n=n.parentElement)if(n.tagName==='DETAILS')n.open=true})}
async function load(p,path){await p.locator('#fileInput').setInputFiles([]);await p.locator('#fileInput').setInputFiles(path);await p.waitForFunction(()=>/\/\s*[1-9]\d*/.test(document.querySelector('#pageInfo')?.textContent||''),null,{timeout:30000})}
async function dl(p,button,timeout=60000){const q=p.waitForEvent('download',{timeout});await p.locator(button).click();const d=await q,path=await d.path();return{d,path,b:path?await readFile(path):null}}
async function action(p,name){await p.evaluate(a=>document.dispatchEvent(new CustomEvent('studio-v2:action',{detail:{action:a,source:'ci'}})),name)}
const browser=await chromium.launch({headless:true});
const ctx=await browser.newContext({viewport:{width:1500,height:1000},acceptDownloads:true,permissions:['clipboard-read','clipboard-write']});
await ctx.addInitScript(()=>{
 Object.defineProperty(window,'Translator',{configurable:true,value:{availability:async()=> 'available',create:async()=>({translate:async t=>'TRADUIT '+t})}});
});
const p=await ctx.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.message));p.on('console',m=>{if(m.type()==='error'&&!/favicon|Failed to load resource/i.test(m.text()))errors.push(m.text())});
try{
 await p.goto(url,{waitUntil:'domcontentloaded',timeout:60000});await p.waitForSelector('#fileInput',{state:'attached',timeout:30000});await load(p,fixture);

 // Pages : rotation, ajout, duplication, suppression, extraction, undo/redo.
 const basePages=Number((await p.locator('#pageInfo').textContent()).replace(/\D/g,''));
 await action(p,'rotateRight');await p.waitForTimeout(250);
 await action(p,'addPage');await p.waitForFunction(n=>Number((document.querySelector('#pageInfo')?.textContent||'').replace(/\D/g,''))===n+1,basePages,{timeout:10000});
 await action(p,'duplicatePage');await p.waitForFunction(n=>Number((document.querySelector('#pageInfo')?.textContent||'').replace(/\D/g,''))===n+2,basePages,{timeout:10000});
 await action(p,'undo');await p.waitForFunction(n=>Number((document.querySelector('#pageInfo')?.textContent||'').replace(/\D/g,''))===n+1,basePages,{timeout:10000});
 await action(p,'redo');await p.waitForFunction(n=>Number((document.querySelector('#pageInfo')?.textContent||'').replace(/\D/g,''))===n+2,basePages,{timeout:10000});
 {const q=p.waitForEvent('download');await action(p,'extractPages');const d=await q;if(!/extrait.*\.pdf$/i.test(d.suggestedFilename()))fail('Extraction page invalide')}
 await action(p,'deletePage');await p.waitForFunction(n=>Number((document.querySelector('#pageInfo')?.textContent||'').replace(/\D/g,''))===n+1,basePages,{timeout:10000});
 await load(p,fixture);

 // Crop.
 await reveal(p,'#applyCrop');await p.locator('#cropLeft').fill('5');await p.locator('#cropRight').fill('5');await p.locator('#cropScope').selectOption('current');await p.locator('#applyCrop').click();await p.waitForFunction(()=>/Recadrage appliqué/.test(document.querySelector('#studioStatusText')?.textContent||''),null,{timeout:15000});

 // Insertion PDF.
 await load(p,fixture);await reveal(p,'#assemblyInsertNow');await p.locator('[data-assembly-mode="insert"]').click();await p.locator('#assemblyInsertFile').setInputFiles(fixture2);await p.locator('#assemblyInsertPosition').selectOption('end');await p.locator('#assemblyInsertNow').click();await p.waitForFunction(n=>Number((document.querySelector('#pageInfo')?.textContent||'').replace(/\D/g,''))>n,basePages,{timeout:30000});
 await load(p,fixture);

 // OCR PDF réel sur une page (au minimum moteur + résultat de page).
 await p.evaluate(()=>{window.Tesseract={recognize:async()=>({data:{text:'PDF OCR CI'}})}});await reveal(p,'#runOcrQuick');await p.locator('#ocrScope').selectOption('current');await p.locator('#ocrDpiPreset').selectOption('150');await p.locator('#runOcrQuick').click();await p.waitForFunction(()=>!/^OCR en cours/.test(document.querySelector('#ocrResult')?.value||'')&&(document.querySelector('#ocrResult')?.value||'').length>5,null,{timeout:30000});
 if(!/Page 1/.test(await p.locator('#ocrResult').inputValue()))fail('OCR PDF sans marqueur page');

 // Optimisation.
 await reveal(p,'#runOptimizeQuick');await p.locator('#optScope').selectOption('current');await p.locator('#optGray').check();await p.locator('#runOptimizeQuick').click();await p.waitForFunction(()=>{try{return JSON.parse(localStorage.getItem('nlab-studio-v2-history')||'[]').some(x=>x.label==='Optimisation PDF')}catch{return false}},null,{timeout:60000});

 // Traduction avec Translator API mockée : vérifie moteur de mise en page sans service externe.
 await load(p,fixture);await reveal(p,'#runTranslateQuick');await p.locator('#translateScope').selectOption('current');await p.locator('#translateSource').selectOption('fr');await p.locator('#translateTarget').selectOption('en');await p.locator('#translateLayout').selectOption('side-by-side');await p.locator('#runTranslateQuick').click();await p.waitForFunction(()=>/PDF bilingue généré/.test(document.querySelector('#studioStatusText')?.textContent||''),null,{timeout:60000});
 await load(p,fixture);

 // Signature dessinée : dessin -> profil -> application visuelle.
 await reveal(p,'#signatureDrawCanvas');const sb=await p.locator('#signatureDrawCanvas').boundingBox();if(!sb)fail('Canvas signature absent');await p.mouse.move(sb.x+80,sb.y+80);await p.mouse.down();await p.mouse.move(sb.x+220,sb.y+45,{steps:8});await p.mouse.move(sb.x+340,sb.y+90,{steps:8});await p.mouse.up();await p.locator('#newSignatureLabel').fill('CI Signature');await p.locator('#saveDrawnSignature').click();await p.waitForFunction(()=>/signature|dessin|enregistr/i.test(document.querySelector('#studioStatusText')?.textContent||''),null,{timeout:10000});await p.waitForFunction(()=>document.querySelector('#signatureAssetSelect')?.options.length>0,null,{timeout:10000});await p.locator('#signaturePosition').selectOption('bottom-right');await p.locator('#applyVisualSignature').click();await p.waitForFunction(()=>/Signature visuelle appliquée/.test(document.querySelector('#studioStatusText')?.textContent||''),null,{timeout:30000});

 // QR objet + commit.
 await load(p,fixture);await reveal(p,'#applyQrQuick');await p.locator('#qrValue').fill('NLAB-PDF-CI-QR');await p.locator('#qrScope').selectOption('current');await p.locator('#qrPosition').selectOption('bottom-right');await p.locator('#applyQrQuick').click();await p.waitForFunction(()=>/Code qrcode placé|Erreur|impossible/i.test(document.querySelector('#studioStatusText')?.textContent||''),null,{timeout:20000});const qrStatus=await p.locator('#studioStatusText').textContent();if(!/Code qrcode placé/.test(qrStatus))fail('QR PDF : '+qrStatus);await p.waitForTimeout(300);if(await p.locator('.pdfObject.image').count()<1){const qd=await p.evaluate(()=>({tiles:document.querySelectorAll('#mainPageGrid .pageTile').length,canvases:document.querySelectorAll('#mainPageGrid canvas').length,layers:document.querySelectorAll('#mainPageGrid .pageObjectLayer').length,objects:document.querySelectorAll('#mainPageGrid .pdfObject').length,images:document.querySelectorAll('#mainPageGrid .pdfObject.image').length,currentPage:window.__NLAB_PDF_STUDIO__?.engine?.currentPage,annotations:window.__NLAB_PDF_STUDIO__?.getAnnotations?.().map(x=>({type:x.type,wPct:x.wPct,subtype:x.subtype}))||[],html:document.querySelector('#mainPageGrid')?.innerHTML.slice(0,500)||''}));fail('QR placé mais objet visuel absent · '+JSON.stringify(qd))}await reveal(p,'#commitObjects');await p.locator('#commitObjects').click();await p.waitForTimeout(1000);

 // Caviardage réel : placer une zone puis appliquer.
 await load(p,fixture);await reveal(p,'#markRedaction');await p.locator('#redactionScope').selectOption('current');await p.locator('#markRedaction').click();await p.waitForTimeout(250);await p.locator('#mainPageGrid .pageObjectLayer').first().evaluate(layer=>{const r=layer.closest('.pageTile').getBoundingClientRect();layer.dispatchEvent(new PointerEvent('pointerdown',{bubbles:true,pointerId:1,clientX:r.left+r.width*.35,clientY:r.top+r.height*.35}))});await p.waitForFunction(()=>document.querySelectorAll('.pdfObject.redaction').length>0,null,{timeout:10000});await p.locator('#applyRedactions').click();await p.waitForFunction(()=>/Caviardage appliqué/.test(document.querySelector('#studioStatusText')?.textContent||''),null,{timeout:60000});

 // Diagnostics et inspection sécurité.
 await reveal(p,'#inspectPdfSecurity');await p.locator('#inspectPdfSecurity').click();await p.waitForFunction(()=>/"signatures"/.test(document.querySelector('#pdfSecurityStatus')?.textContent||''),null,{timeout:10000});await reveal(p,'#copyDiagnostics');await p.locator('#copyDiagnostics').click();const diag=await p.evaluate(()=>navigator.clipboard.readText());if(!/"studio":\s*"pdf-studio"/.test(diag))fail('Diagnostic clipboard invalide');

 // Tampons : exemple complet, règles de nommage, copie, export/import JSON.
 await reveal(p,'[data-stamp-mode="editor"]');await p.locator('[data-stamp-mode="editor"]').click();await p.locator('[data-stamp-example="full"]').click();if(!await p.locator('#stampEditorPrefixEnabled').isChecked()||!await p.locator('#stampEditorSuffixEnabled').isChecked())fail('Exemple tampon complet sans règles de nommage');await p.locator('#saveStampPresetCopy').click();await p.waitForTimeout(300);
 const sx=await dl(p,'#exportStampJson');const stampPayload=JSON.parse(sx.b.toString('utf8'));if(stampPayload.schema!=='nlab-pdf-stamps/v2'||!Array.isArray(stampPayload.stamps))fail('Export tampons invalide');
 const imp={schema:'nlab-pdf-stamps/v2',stamps:[{id:'legacy-ci',label:'CI import',category:'Tests',template:'IMPORT CI',prefix:'CI_',prefixEnabled:true}]};await p.locator('#stampJsonInput').setInputFiles({name:'stamps-ci.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(imp))});await p.waitForFunction(()=>/1 tampon\(s\) importé/.test(document.querySelector('#studioStatusText')?.textContent||''),null,{timeout:10000});
 await p.locator('[data-stamp-mode="use"]').click();await p.locator('#stampPresetSelect').selectOption({label:'CI import'});await p.locator('#applyStampNamingRules').check();await p.locator('#stampPosition').selectOption('center');await p.locator('#applyStampScope').click();await p.waitForTimeout(300);if(!(await p.locator('#namingPrefix').inputValue()).startsWith('CI_'))fail('Règle nommage tampon non appliquée');

 // Migration legacy.
 await reveal(p,'#legacyConfigInput');const legacy={operator:{initials:'CI',displayName:'CI User'},output:{filenameTemplate:'{FILENAME}_{YYYY}',archivePattern:'{YYYY}/{MM}'},stamps:[{id:'ancien',name:'Ancien',text:'ANCIEN'}],auth:{google:{clientId:'legacy-ci.apps.googleusercontent.com'}}};await p.locator('#legacyConfigInput').setInputFiles({name:'legacy.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(legacy))});await p.waitForFunction(()=>/Migration :/.test(document.querySelector('#legacyConfigStatus')?.textContent||''),null,{timeout:10000});

 // ZIP et classement via routeur commun de sortie.
 await load(p,fixture);await reveal(p,'#saveZipSide');await p.locator('#outputProvider').selectOption('download');{const z=await dl(p,'#saveZipSide');if(!/\.zip$/i.test(z.d.suggestedFilename()))fail('Save ZIP invalide')}await p.locator('#outputStructure').selectOption('year-month');{const s=await dl(p,'#saveAndClassify');if(!/\.pdf$/i.test(s.d.suggestedFilename()))fail('Save classé invalide')}

 // AES-256 qpdf : lock puis unlock (CDN externe, mais fonction testée si réseau CI disponible).
 await reveal(p,'#protectCurrentPdf');await p.locator('#pdfOpenPassword').fill('ci-open-123');await p.locator('#pdfOwnerPassword').fill('ci-owner-456');const prot=await dl(p,'#protectCurrentPdf',120000);if(!/protege\.pdf$/i.test(prot.d.suggestedFilename()))fail('Protection AES sans PDF protégé');await p.locator('#unlockPdfInput').setInputFiles(prot.path);await p.locator('#unlockPdfPassword').fill('ci-open-123');const un=await dl(p,'#unlockPdfNow',120000);if(!/deverrouille\.pdf$/i.test(un.d.suggestedFilename()))fail('Déverrouillage AES invalide');

 // Signature crypto doit échouer proprement sans certificat, pas planter.
 await reveal(p,'[data-signature-mode="digital"]');await p.locator('[data-signature-mode="digital"]').click();await reveal(p,'#applyCryptographicSignature');await p.locator('#applyCryptographicSignature').click();await p.waitForTimeout(300);if(!/certificat/i.test(await p.locator('#signatureCryptoStatus').textContent()))fail('Signature crypto sans certificat non diagnostiquée');

 if(errors.length)fail('Erreurs navigateur exhaustive PDF V2: '+errors.join(' | '));
 console.log(JSON.stringify({ok:true,pages:true,crop:true,insert:true,ocr:true,optimize:true,translationMock:true,signatureVisual:true,qr:true,redaction:true,diagnostics:true,stamps:true,legacyMigration:true,zipClassify:true,aes:true,cryptoExternalGuard:true},null,2));
}finally{await ctx.close();await browser.close()}
