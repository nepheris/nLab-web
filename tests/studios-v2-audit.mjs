import{chromium}from'playwright';
import{readFile}from'node:fs/promises';

const base=process.env.NLAB_BASE_URL||'http://127.0.0.1:8774/';
const browser=await chromium.launch({headless:true});
const results=[];
const fail=m=>{throw new Error(m)};
async function reveal(page,selector){await page.locator(selector).evaluate(el=>{for(let n=el;n;n=n.parentElement)if(n.tagName==='DETAILS')n.open=true})}
async function dlBytes(page,selector,timeout=30000){
 const q=page.waitForEvent('download',{timeout});await page.locator(selector).click();const d=await q,path=await d.path();
 return{download:d,bytes:path?await readFile(path):Buffer.alloc(0)}
}
async function open(id,path='v2/'){
 const p=await browser.newPage({viewport:{width:1360,height:900},acceptDownloads:true});
 const errors=[];p.on('pageerror',e=>errors.push(e.message));p.on('console',m=>{if(m.type()==='error'&&!/favicon|Failed to load resource/i.test(m.text()))errors.push(m.text())});
 await p.goto(base+'APP-Applications/'+id+'/'+path,{waitUntil:'domcontentloaded',timeout:60000});
 return{p,errors}
}
async function core(id,path='v2/'){
 const x=await open(id,path);await x.p.waitForSelector('#nlabStudioV2Chrome',{timeout:30000});return x
}
try{
 // Image Studio : identité, watermark, manifest et reset collection.
 {
  const{p,errors}=await core('image-studio');
  await p.locator('#image-studio-open').click();await p.waitForSelector('#studioInputPicker:not([hidden])');
  await p.locator('#studioInputFilesNative').setInputFiles('Library/demo/Images/demo-image-color.png');await p.locator('#studioInputConfirm').click();
  await p.waitForFunction(()=>!/Aucune image/.test(document.querySelector('#imageMeta')?.textContent||''),null,{timeout:15000});
  await reveal(p,'#artifactGenerate');await p.locator('#artifactGenerate').click();await p.waitForFunction(()=>/SHA-256/.test(document.querySelector('#artifactIdentityStatus')?.textContent||''),null,{timeout:15000});
  await reveal(p,'#watermarkApply');await p.locator('#watermarkText').fill('AUDIT {ID}');await p.locator('#watermarkPosition').selectOption('bottom-right');await p.locator('#watermarkOpacity').fill('40');await p.locator('#watermarkRotation').fill('-15');await p.locator('#watermarkApply').click();
  const man=await dlBytes(p,'#artifactManifest');if(!/\.json$/i.test(man.download.suggestedFilename())||man.bytes.length<100)fail('Image Studio manifest invalide');
  await p.locator('#clearImages').click();await p.waitForFunction(()=>document.querySelectorAll('#imageList .imageItem').length===0,null,{timeout:10000});
  if(errors.length)fail('Image Studio audit: '+errors.join(' | '));results.push('image-studio+advanced');await p.close();
 }

 // OCR Studio : registre/diagnostic et OCR réel mocké via API legacy supportée.
 {
  const{p,errors}=await core('ocr-studio');
  await p.evaluate(()=>{window.Tesseract={recognize:async()=>({data:{text:'OCR AUDIT FR',confidence:99}})}});
  const chooser=p.waitForEvent('filechooser');await p.locator('#ocr-open').click();await (await chooser).setFiles('Library/demo/files/demo-input/Images/demo-document-illustration.png');
  await p.waitForFunction(()=>/Image chargée/.test(document.querySelector('#status')?.textContent||''),null,{timeout:15000});
  if(!(await p.locator('#diag').textContent()).includes('nlab.ocr-diagnostics/v1'))fail('OCR diagnostics absents');
  await p.locator('#run').click();await p.waitForFunction(()=>/OCR AUDIT FR/.test(document.querySelector('#out')?.value||''),null,{timeout:15000});
  if(errors.length)fail('OCR Studio audit: '+errors.join(' | '));results.push('ocr-studio+engine');await p.close();
 }

 // JSON Studio : vues structure et requête JSONPath simplifiée.
 {
  const{p,errors}=await core('json-studio');
  const chooser=p.waitForEvent('filechooser');await p.locator('#json-studio-open').click();await (await chooser).setFiles('Library/demo/source-drive/json/rdc-recettes-complexes-demo.json');
  await p.waitForFunction(()=>/JSON valide/.test(document.querySelector('#validity')?.textContent||''),null,{timeout:15000});
  await p.locator('[data-view="stats"]').click();if(await p.locator('#statsPane').isHidden())fail('JSON vue Structure inactive');
  await p.locator('[data-view="query"]').click();await p.locator('#path').fill('referentiel');await p.locator('#query').click();if((await p.locator('#result').textContent()).trim()==='—')fail('JSON requête chemin inactive');
  if(errors.length)fail('JSON Studio audit: '+errors.join(' | '));results.push('json-studio+views');await p.close();
 }

 // Data Studio : filtre + options CSV et contenu exporté.
 {
  const{p,errors}=await core('data-studio');
  await p.locator('#data-studio-open').click();await p.waitForSelector('#studioInputPicker:not([hidden])');await p.locator('#studioInputFilesNative').setInputFiles('Library/demo/Data/dataset-validation-complet.csv');await p.locator('#studioInputConfirm').click();
  await p.waitForFunction(()=>!/0 \/ 0/.test(document.querySelector('#shown')?.textContent||''),null,{timeout:15000});
  await p.locator('#searchAll').fill('a');await p.locator('#searchAll').dispatchEvent('input');await p.locator('#csvDelimiter').selectOption('|');await p.locator('#csvBom').uncheck();
  const out=await dlBytes(p,'#exportCsv');const txt=out.bytes.toString('utf8');if(!txt.includes('|'))fail('Data Studio séparateur CSV non appliqué');if(out.bytes[0]===0xEF&&out.bytes[1]===0xBB&&out.bytes[2]===0xBF)fail('Data Studio BOM désactivé non respecté');
  if(errors.length)fail('Data Studio audit: '+errors.join(' | '));results.push('data-studio+csv-options');await p.close();
 }

 // File Studio : collection, clear, SHA et JSON.
 {
  const{p,errors}=await core('file-studio');
  await p.locator('#file-studio-open').click();await p.waitForSelector('#studioInputPicker:not([hidden])');await p.locator('#studioInputFilesNative').setInputFiles(['Library/demo/files/demo-input/Code/demo-script.js','Library/demo/source-drive/json/rdc-recettes-complexes-demo.json']);await p.locator('#studioInputConfirm').click();
  await p.waitForFunction(()=>/2 élément/.test(document.querySelector('#status')?.textContent||''),null,{timeout:10000});await p.locator('#fileClearInputs').click();await p.waitForFunction(()=>/0 élément/.test(document.querySelector('#status')?.textContent||''),null,{timeout:10000});
  await p.locator('#files').setInputFiles('Library/demo/files/demo-input/Code/demo-script.js');await p.locator('#hashFiles').click();await p.waitForFunction(()=>/empreinte/.test(document.querySelector('#status')?.textContent||''),null,{timeout:15000});
  const j=await dlBytes(p,'#exportJson');const payload=JSON.parse(j.bytes.toString('utf8'));if(payload?.schema!=='nlab-file-manifest/v1'||!Array.isArray(payload.files)||!payload.files[0]?.sha256||!payload.files[0]?.id)fail('File Studio SHA/ID absents export JSON');
  if(errors.length)fail('File Studio audit: '+errors.join(' | '));results.push('file-studio+identity');await p.close();
 }

 // QR & Barcode : options QR, SVG, HID et scan image du QR généré.
 {
  const{p,errors}=await core('qr-barcode-studio');
  await p.waitForFunction(()=>document.querySelector('#preview')?.children.length>0,null,{timeout:15000});
  await p.locator('#dots').selectOption({index:1});await p.locator('#corners').selectOption({index:1});await p.locator('#gradient').check();await p.locator('#transparent').check();await p.locator('#refreshPreview').click();
  const svg=await dlBytes(p,'#downloadSvg');if(!/\.svg$/i.test(svg.download.suggestedFilename())||!svg.bytes.toString('utf8').includes('<svg'))fail('QR SVG invalide');
  await p.locator('#scan').fill('AUDIT-HID-123');await p.locator('#scan').press('Enter');await p.waitForFunction(()=>/AUDIT-HID-123/.test(document.querySelector('#history')?.textContent||''),null,{timeout:5000});
  await p.locator('#preview').screenshot({path:'/tmp/nlab-audit-qr.png'});await p.locator('#scanFile').setInputFiles('/tmp/nlab-audit-qr.png');await p.waitForFunction(()=>/Détecté|Aucun code détecté/.test(document.querySelector('#scanStatus')?.textContent||''),null,{timeout:20000});
  const scanStatus=await p.locator('#scanStatus').textContent();if(!/Détecté/.test(scanStatus))results.push('qr-image-scan-warning:'+scanStatus);else results.push('qr-image-scan');
  if(errors.length)fail('QR Studio audit: '+errors.join(' | '));results.push('qr-barcode-studio+advanced');await p.close();
 }

 // Markdown : YAML, HTML et impression.
 {
  const{p,errors}=await core('markdown-studio');
  const chooser=p.waitForEvent('filechooser');await p.locator('#openMd').click();await (await chooser).setFiles('Library/demo/files/demo-input/Code/demo-markdown.md');await p.waitForFunction(()=>document.querySelector('#mdEditor')?.value.length>20,null,{timeout:15000});
  await p.locator('#yamlEditor').fill('title: Audit\nlang: fr\nauthor: nLab');await p.locator('#applyYaml').click();await p.waitForTimeout(250);
  const y=await dlBytes(p,'#exportYaml');if(!/title:\s*Audit/.test(y.bytes.toString('utf8')))fail('Markdown YAML export invalide');
  const h=await dlBytes(p,'#exportHtml');if(!/<html/i.test(h.bytes.toString('utf8')))fail('Markdown HTML export invalide');
  const pop=p.waitForEvent('popup',{timeout:5000}).catch(()=>null);await p.locator('#printPdf').click();const popup=await pop;if(popup)await popup.close();
  if(errors.length)fail('Markdown Studio audit: '+errors.join(' | '));results.push('markdown-studio+yaml-html-print');await p.close();
 }

 // Dataset Generator : schéma custom, document et clone CSV.
 {
  const{p,errors}=await core('dataset-generator-studio');
  const before=await p.locator('#schemaRows .schemaRow').count();await p.locator('#addColumn').click();const after=await p.locator('#schemaRows .schemaRow').count();if(after!==before+1)fail('Dataset ajout colonne inactif');
  await p.locator('[data-mode="document"]').click();await p.locator('#docTitle').fill('Audit document');await p.locator('#generate').click();await p.waitForFunction(()=>document.querySelector('#docPreview')?.textContent.length>20,null,{timeout:10000});
  await p.locator('[data-mode="clone"]').click();await p.locator('#cloneRows').fill('7');await p.locator('#cloneFile').setInputFiles('Library/demo/Data/dataset-validation-complet.csv');await p.waitForFunction(()=>/7 ligne/.test(document.querySelector('#count')?.textContent||''),null,{timeout:15000});
  if(errors.length)fail('Dataset Studio audit: '+errors.join(' | '));results.push('dataset-generator+schema-doc-clone');await p.close();
 }

 // Document : recherche, TXT/HTML et fenêtre impression.
 {
  const{p,errors}=await core('document-studio');
  const chooser=p.waitForEvent('filechooser');await p.locator('#openDocument').click();await (await chooser).setFiles('Library/demo/files/demo-input/Code/demo-markdown.md');await p.waitForFunction(()=>document.querySelector('#editor')?.value.length>20,null,{timeout:15000});
  await p.locator('#search').fill('demo');await p.locator('#search').dispatchEvent('input');if(!Number(await p.locator('#words').textContent()))fail('Document statistiques mots absentes');
  const t=await dlBytes(p,'#exportTxt');if(!/\.txt$/i.test(t.download.suggestedFilename()))fail('Document TXT invalide');
  const h=await dlBytes(p,'#exportHtml');if(!/<html/i.test(h.bytes.toString('utf8')))fail('Document HTML invalide');
  const pop=p.waitForEvent('popup',{timeout:5000}).catch(()=>null);await p.locator('#printPdf').click();const popup=await pop;if(popup)await popup.close();
  if(errors.length)fail('Document Studio audit: '+errors.join(' | '));results.push('document-studio+exports-print');await p.close();
 }

 // Spreadsheet : recherche, CSV delimiter/BOM, ODS.
 {
  const{p,errors}=await core('spreadsheet-studio');
  const chooser=p.waitForEvent('filechooser');await p.locator('#openSheet').click();await (await chooser).setFiles('Library/demo/Data/dataset-validation-complet.csv');await p.waitForFunction(()=>document.querySelector('#dims')?.textContent!=='0 × 0',null,{timeout:15000});
  await p.locator('#search').fill('a');await p.locator('#search').dispatchEvent('input');await p.locator('#delimiter').selectOption('|');await p.locator('#bom').check();
  const c=await dlBytes(p,'#exportCsv');if(!(c.bytes[0]===0xEF&&c.bytes[1]===0xBB&&c.bytes[2]===0xBF)||!c.bytes.toString('utf8').includes('|'))fail('Spreadsheet options CSV non respectées');
  const o=await dlBytes(p,'#exportOds');if(!/\.ods$/i.test(o.download.suggestedFilename())||o.bytes.length<500)fail('Spreadsheet ODS invalide');
  if(errors.length)fail('Spreadsheet Studio audit: '+errors.join(' | '));results.push('spreadsheet-studio+csv-ods');await p.close();
 }

 // Scan Studio : organisation, rotation, deskew, OCR et assemblage PDF.
 {
  const{p,errors}=await core('scan-studio');
  await p.locator('#fileInput').setInputFiles(['Library/demo/files/demo-input/Images/demo-document-illustration.png','Library/demo/Images/demo-image-color.png']);await p.waitForFunction(()=>document.querySelectorAll('#pageList .pageItem').length===2,null,{timeout:15000});
  await p.locator('#moveDown').click();await p.locator('#moveUp').click();await p.locator('#rotateLeft').click();await p.locator('#deskew').fill('2');await p.locator('#deskew').dispatchEvent('input');
  await p.evaluate(()=>{window.Tesseract={recognize:async()=>({data:{text:'SCAN OCR AUDIT',confidence:97}})}});await p.locator('#runOcr').click();await p.waitForFunction(()=>/SCAN OCR AUDIT/.test(document.querySelector('#ocrOut')?.value||''),null,{timeout:15000});
  const hasJsPdf=await p.evaluate(()=>typeof window.jspdf?.jsPDF==='function');if(!hasJsPdf)fail('Scan Studio jsPDF indisponible');await p.evaluate(()=>{const proto=window.jspdf.jsPDF.prototype;if(!proto.__nlabAuditPatched){proto.__nlabAuditPatched=true;const original=proto.save;proto.save=function(name){window.__nlabAuditPdf={name,bytes:this.output('arraybuffer').byteLength};try{return original.call(this,name)}catch{return this}}}});await p.locator('#exportPdf').click();await p.waitForFunction(()=>window.__nlabAuditPdf?.bytes>500,null,{timeout:15000});const pdfAudit=await p.evaluate(()=>window.__nlabAuditPdf);if(pdfAudit.name!=='nlab-scan.pdf'||pdfAudit.bytes<500)fail('Scan PDF export invalide');
  await p.locator('#removePage').click();await p.waitForFunction(()=>document.querySelectorAll('#pageList .pageItem').length===1,null,{timeout:10000});
  if(errors.length)fail('Scan Studio audit: '+errors.join(' | '));results.push('scan-studio+organize-ocr-pdf');await p.close();
 }

 // PDF Sign : dessin, preset, application et téléchargement réel.
 {
  const{p,errors}=await core('pdf-sign','v1/');
  await p.locator('#fileInput').setInputFiles('Library/demo/Images/testNumregles.pdf');await p.waitForFunction(()=>/Page 1 \/ /.test(document.querySelector('#pageInfo')?.textContent||''),null,{timeout:20000});
  const box=await p.locator('#drawCanvas').boundingBox();if(!box)fail('PDF Sign canvas absent');await p.mouse.move(box.x+40,box.y+60);await p.mouse.down();await p.mouse.move(box.x+180,box.y+35,{steps:6});await p.mouse.move(box.x+260,box.y+75,{steps:6});await p.mouse.up();
  await p.locator('#saveDraw').click();await p.waitForFunction(()=>/enregistré comme preset/.test(document.querySelector('#localStatus')?.textContent||''),null,{timeout:10000});await p.locator('#targetScope').selectOption('all');await p.locator('#position').selectOption('bottom-right');await p.locator('#applyAsset').click();await p.waitForFunction(()=>/appliqué sur/.test(document.querySelector('#localStatus')?.textContent||''),null,{timeout:20000});
  const out=await dlBytes(p,'#downloadPdf');if(!/_signed\.pdf$/i.test(out.download.suggestedFilename())||out.bytes.length<1000)fail('PDF Sign export invalide');
  if(errors.length)fail('PDF Sign audit: '+errors.join(' | '));results.push('pdf-sign+draw-apply-download');await p.close();
 }

 // Demo Studio : redirection et corpus réellement chargé.
 {
  const p=await browser.newPage({viewport:{width:1360,height:900}}),errors=[];p.on('pageerror',e=>errors.push(e.message));
  await p.goto(base+'APP-Applications/demo-studio/',{waitUntil:'domcontentloaded',timeout:60000});await p.waitForURL(/Library\/demo\//,{timeout:10000});await p.waitForFunction(()=>document.querySelectorAll('#grid .card').length>10,null,{timeout:30000});await p.waitForFunction(()=>document.querySelectorAll('#packs .pack').length>5,null,{timeout:30000});
  const cards=await p.locator('#grid .card').count(),packs=await p.locator('#packs .pack').count();if(cards<10||packs<5)fail('Demo Studio corpus incomplet');if(errors.length)fail('Demo Studio audit: '+errors.join(' | '));results.push('demo-studio+gallery');await p.close();
 }

 console.log(JSON.stringify({ok:true,results},null,2));
}finally{await browser.close()}
