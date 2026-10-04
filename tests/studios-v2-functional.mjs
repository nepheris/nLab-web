import{chromium}from'playwright';
const base=process.env.NLAB_BASE_URL||'http://127.0.0.1:8770/';
const browser=await chromium.launch({headless:true});
const results=[];
async function chooseFile(page,button,path){const fp=page.waitForEvent('filechooser');await page.locator(button).click();const fc=await fp;await fc.setFiles(path)}
async function studio(id,fn,versionPath='v2/'){
 const page=await browser.newPage({viewport:{width:1360,height:900},acceptDownloads:true});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error'&&!/favicon|Failed to load resource/i.test(m.text()))errors.push(m.text())});
 await page.goto(base+'APP-Applications/'+id+'/'+versionPath,{waitUntil:'domcontentloaded',timeout:60000});
 await page.waitForSelector('#nlabStudioV2Chrome',{timeout:30000});
 await fn(page);
 if(errors.length)throw new Error(id+': erreurs navigateur: '+errors.join(' | '));
 results.push(id);await page.close();
}
try{
 await studio('image-studio',async p=>{
  await p.locator('#image-studio-open').click();await p.waitForSelector('#studioInputPicker:not([hidden])');await p.locator('#studioInputFilesNative').setInputFiles('Library/demo/Images/demo-image-color.png');await p.locator('#studioInputConfirm').click();
  await p.waitForFunction(()=>!/Aucune image/.test(document.querySelector('#imageMeta')?.textContent||''),null,{timeout:15000});
  await p.locator('#demoSynthetic').click();await p.waitForFunction(()=>document.querySelectorAll('#imageList .imageItem').length>=2,null,{timeout:20000});
  await p.locator('#right').click();await p.locator('#dimensionUnit').selectOption('px');await p.locator('#w').fill('500');await p.locator('#resize').click();await p.waitForTimeout(300);
  await p.locator('#cropMouseMode').click();const box=await p.locator('#cv').boundingBox();if(!box)throw new Error('Canvas Image Studio absent');await p.mouse.move(box.x+20,box.y+20);await p.mouse.down();await p.mouse.move(box.x+Math.max(80,box.width*.6),box.y+Math.max(80,box.height*.6));await p.mouse.up();await p.locator('#cropApplySelection').click();await p.waitForTimeout(200);
  await p.locator('#undoEdit').click();await p.locator('#resetAll').click();
  const dl=p.waitForEvent('download');await p.locator('#export').click();if(!/\.(png|jpg|jpeg|webp)$/i.test((await dl).suggestedFilename()))throw new Error('Image export invalide');
 });
 await studio('merge-studio',async p=>{
  await p.locator('#merge-studio-open').click();
  await p.waitForSelector('#studioInputPicker:not([hidden])');
  await p.locator('#studioInputFilesNative').setInputFiles(['Library/demo/Images/testNumregles.pdf','Library/demo/Images/testNumeregles 2..pdf','Library/demo/files/demo-input/Security/demo-redaction-secrets.pdf']);
  await p.locator('#studioInputConfirm').click();
  await p.waitForFunction(()=>document.querySelectorAll('#mergeList .mergeItem').length===3,null,{timeout:20000});
  await p.locator('#moveMergeDown').click();
  await p.locator('[data-remove-merge="2"]').click();
  await p.waitForFunction(()=>document.querySelectorAll('#mergeList .mergeItem').length===2,null,{timeout:10000});
  await p.locator('#mergeOutputName').fill('fusion-ci.pdf');
  const dl=p.waitForEvent('download');await p.locator('#mergeNow').click();
  const d=await dl;if(!/fusion-ci\.pdf$/i.test(d.suggestedFilename()))throw new Error('Merge Studio export invalide');
  await p.waitForFunction(()=>/Fusion créée/.test(document.querySelector('#mergeStatus')?.textContent||''),null,{timeout:20000});
 },'v1/');
 await studio('scan-studio',async p=>{
  await p.locator('#fileInput').setInputFiles(['Library/demo/files/demo-input/Images/demo-document-illustration.png','Library/demo/Images/demo-image-color.png']);
  await p.waitForFunction(()=>document.querySelectorAll('#pageList .pageItem').length===2,null,{timeout:15000});
  await p.locator('#rotateRight').click();await p.locator('#cleanupMode').selectOption('gray');await p.locator('#applyCleanup').click();
  const dl=p.waitForEvent('download');await p.locator('#downloadPage').click();if(!/\.png$/i.test((await dl).suggestedFilename()))throw new Error('Scan page PNG invalide');
 });
 await studio('ocr-studio',async p=>{
  await chooseFile(p,'#ocr-open','Library/demo/files/demo-input/Images/demo-document-illustration.png');await p.waitForFunction(()=>/Image chargée/.test(document.querySelector('#status')?.textContent||''),null,{timeout:15000});
  await p.locator('#demo').click();await p.waitForFunction(()=>/Image chargée/.test(document.querySelector('#status')?.textContent||''),null,{timeout:15000});
  await p.locator('#out').fill('OCR TEST');const dl=p.waitForEvent('download');await p.locator('#save').click();if(!/\.txt$/i.test((await dl).suggestedFilename()))throw new Error('OCR TXT export invalide');
 });
 await studio('code-studio',async p=>{
  await p.locator('#code-studio-open').click();
  await p.waitForSelector('#studioInputPicker:not([hidden])');
  await p.locator('#studioInputFilesNative').setInputFiles(['Library/demo/files/demo-input/Code/demo-script.js','Library/demo/source-drive/json/rdc-recettes-complexes-demo.json']);
  await p.locator('#studioInputConfirm').click();
  await p.waitForFunction(()=>document.querySelectorAll('#codeFiles [data-code-file]').length>=2,null,{timeout:15000});
  await p.locator('#codeFiles [data-code-file="0"]').click();
  await p.waitForFunction(()=>/demo-script\.js/i.test(document.querySelector('#tab')?.textContent||''),null,{timeout:15000});
  await p.locator('#demo').click();
  await p.waitForFunction(()=>/demo-script\.js/i.test(document.querySelector('#tab')?.textContent||''),null,{timeout:15000});
  await p.locator('#theme').selectOption('monokai');
  const dl=p.waitForEvent('download');await p.locator('#save').click();
  if(!/\.js$/i.test((await dl).suggestedFilename()))throw new Error('Code export invalide');
 });
 await studio('json-studio',async p=>{
  await chooseFile(p,'#json-studio-open','Library/demo/source-drive/json/rdc-recettes-complexes-demo.json');await p.waitForFunction(()=>/JSON valide/.test(document.querySelector('#validity')?.textContent||''),null,{timeout:15000});
  await p.locator('#demo').selectOption({index:1});await p.locator('#loadDemo').click();await p.waitForFunction(()=>/JSON valide/.test(document.querySelector('#validity')?.textContent||''),null,{timeout:15000});
  await p.locator('#format').click();await p.locator('#sort').click();const dl=p.waitForEvent('download');await p.locator('#save').click();if(!/\.json$/i.test((await dl).suggestedFilename()))throw new Error('JSON export invalide');
 });
 await studio('data-studio',async p=>{
  await p.locator('#data-studio-open').click();
  await p.waitForSelector('#studioInputPicker:not([hidden])');
  await p.locator('#studioInputFilesNative').setInputFiles(['Library/demo/Data/dataset-validation-complet.csv','Library/demo/Data/dataset-validation-complet.json']);
  await p.locator('#studioInputConfirm').click();
  await p.waitForFunction(()=>document.querySelectorAll('#datasetFileSelect option').length>=3,null,{timeout:15000});
  await p.locator('#datasetFileSelect').selectOption('0');
  await p.waitForFunction(()=>!/0 \/ 0/.test(document.querySelector('#shown')?.textContent||''),null,{timeout:15000});
  await p.locator('#demoCsv').click();
  await p.waitForFunction(()=>!/0 \/ 0/.test(document.querySelector('#shown')?.textContent||''),null,{timeout:15000});
  const dl=p.waitForEvent('download');await p.locator('#save').click();
  if(!/\.json$/i.test((await dl).suggestedFilename()))throw new Error('Data export invalide');
 });
 await studio('file-studio',async p=>{
  await p.locator('#file-studio-open').click();
  await p.waitForSelector('#studioInputPicker:not([hidden])');
  await p.locator('#studioInputFilesNative').setInputFiles(['Library/demo/files/demo-input/Code/demo-script.js','Library/demo/source-drive/json/rdc-recettes-complexes-demo.json']);
  await p.locator('#studioInputConfirm').click();
  await p.waitForFunction(()=>/2 élément/.test(document.querySelector('#status')?.textContent||''),null,{timeout:10000});
  await p.locator('[data-file-remove="0"]').click();
  await p.waitForFunction(()=>/1 élément/.test(document.querySelector('#status')?.textContent||''),null,{timeout:10000});
  await p.locator('#demo').click();
  await p.waitForFunction(()=>/[1-9]\d* élément/.test(document.querySelector('#status')?.textContent||''),null,{timeout:15000});
  await p.locator('#prefix').fill('TEST_{COUNTER}_');
  const dl=p.waitForEvent('download');await p.locator('#export').click();
  if(!/\.csv$/i.test((await dl).suggestedFilename()))throw new Error('File manifest export invalide');
 });
 await studio('qr-barcode-studio',async p=>{
  await p.waitForFunction(()=>document.querySelector('#preview')?.children.length>0,null,{timeout:15000});
  await p.locator('#symTabs [data-type="code128"]').click();await p.waitForFunction(()=>document.querySelector('#preview canvas'),null,{timeout:15000});
  const dl=p.waitForEvent('download');await p.locator('#downloadPng').click();if(!/\.png$/i.test((await dl).suggestedFilename()))throw new Error('QR/Barcode PNG export invalide');
 });
 await studio('markdown-studio',async p=>{
  await chooseFile(p,'#openMd','Library/demo/files/demo-input/Code/demo-markdown.md');await p.waitForFunction(()=>/demo-markdown\.md/i.test(document.querySelector('#docName')?.textContent||''),null,{timeout:15000});
  await p.waitForFunction(()=>document.querySelector('#mdEditor')?.value.length>20,null,{timeout:15000});
  await p.locator('#insertTable').click();if(!(await p.locator('#mdEditor').inputValue()).includes('| Colonne 1 |'))throw new Error('Insertion Markdown inactive');
  const dl=p.waitForEvent('download');await p.locator('#saveMd').click();if(!/\.md$/i.test((await dl).suggestedFilename()))throw new Error('Markdown export invalide');
 });
 await studio('dataset-generator-studio',async p=>{
  await p.locator('#rows').fill('25');await p.locator('#generate').click();await p.waitForFunction(()=>/25 ligne/.test(document.querySelector('#count')?.textContent||''),null,{timeout:10000});
  const dl=p.waitForEvent('download');await p.locator('#exportJson').click();if(!/\.json$/i.test((await dl).suggestedFilename()))throw new Error('Dataset export invalide');
 });

 await studio('document-studio',async p=>{
  await chooseFile(p,'#openDocument','Library/demo/files/demo-input/Code/demo-markdown.md');await p.waitForFunction(()=>document.querySelector('#editor')?.value.length>20,null,{timeout:15000});
  const d1=p.waitForEvent('download');await p.locator('#exportDocx').click();if(!/\.docx$/i.test((await d1).suggestedFilename()))throw new Error('Document DOCX export invalide');
  const d2=p.waitForEvent('download');await p.locator('#exportOdt').click();if(!/\.odt$/i.test((await d2).suggestedFilename()))throw new Error('Document ODT export invalide');
 });
 await studio('spreadsheet-studio',async p=>{
  await chooseFile(p,'#openSheet','Library/demo/Data/dataset-validation-complet.csv');await p.waitForFunction(()=>document.querySelector('#dims')?.textContent!=='0 × 0',null,{timeout:15000});
  const d=p.waitForEvent('download');await p.locator('#exportJson').click();if(!/\.json$/i.test((await d).suggestedFilename()))throw new Error('Spreadsheet JSON export invalide');
 });
 console.log(JSON.stringify({ok:true,studios:results},null,2));
}finally{await browser.close()}
