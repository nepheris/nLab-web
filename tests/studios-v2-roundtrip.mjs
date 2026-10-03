import{chromium}from'playwright';
import{readFile}from'node:fs/promises';
const base=process.env.NLAB_BASE_URL||'http://127.0.0.1:8772/';
const browser=await chromium.launch({headless:true});
const done=[];
async function readDownload(d){const p=await d.path();if(!p)throw new Error('Téléchargement sans fichier temporaire');return readFile(p)}
async function reveal(page,selector){await page.locator(selector).evaluate(e=>{for(let n=e;n;n=n.parentElement)if(n.tagName==='DETAILS')n.open=true})}
async function studio(id,fn){
 const page=await browser.newPage({viewport:{width:1360,height:900},acceptDownloads:true});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error'&&!/favicon|Failed to load resource/i.test(m.text()))errors.push(m.text())});
 await page.goto(base+'APP-Applications/'+id+'/v2/',{waitUntil:'domcontentloaded',timeout:60000});await page.waitForSelector('#nlabStudioV2Chrome',{timeout:30000});await fn(page);
 if(errors.length)throw new Error(id+': '+errors.join(' | '));done.push(id);await page.close();
}
try{
 await studio('image-studio',async p=>{
  await p.locator('#demoSynthetic').click();await p.waitForTimeout(1200);const imeta=await p.locator('#imageMeta').textContent(),imsg=await p.locator('#msg').textContent();if(!/\d+ × \d+ px/.test(imeta||''))throw new Error('Image demo non chargée · meta='+imeta+' · msg='+imsg);
  await p.locator('#w').fill('500');await p.locator('#resize').click();await p.waitForFunction(()=>document.querySelector('#cv')?.width===500,null,{timeout:10000});
  const before=await p.locator('#cv').evaluate(c=>[c.width,c.height]);await reveal(p,'#cropLeft');await p.locator('#cropLeft').fill('5');await p.locator('#cropRight').fill('5');await p.locator('#cropApply').click();await p.waitForFunction(w=>document.querySelector('#cv')?.width<w,before[0],{timeout:10000});
  await reveal(p,'#watermarkText');await p.locator('#watermarkText').fill('CI WATERMARK');await p.locator('#watermarkApply').click();await reveal(p,'#artifactGenerate');await p.locator('#artifactGenerate').click();await p.waitForFunction(()=>/SHA-256/.test(document.querySelector('#artifactIdentityStatus')?.textContent||''),null,{timeout:10000});
  const dm=p.waitForEvent('download');await p.locator('#artifactManifest').click();const raw=(await readDownload(await dm)).toString('utf8'),m=JSON.parse(raw);if(m.schema!=='nlab-artifact/v1'||!m.sha256)throw new Error('Manifest Image invalide');
 });
 await studio('json-studio',async p=>{
  await p.locator('#demo').selectOption({index:1});await p.locator('#loadDemo').click();await p.waitForFunction(()=>/JSON valide/.test(document.querySelector('#validity')?.textContent||''),null,{timeout:15000});
  await p.locator('#format').click();await p.locator('#sort').click();const dl=p.waitForEvent('download');await p.locator('#save').click();const raw=(await readDownload(await dl)).toString('utf8');JSON.parse(raw);if(raw.length<20)throw new Error('JSON export trop court');
 });
 await studio('data-studio',async p=>{
  await p.locator('#demoCsv').click();await p.waitForFunction(()=>!/0 \/ 0/.test(document.querySelector('#shown')?.textContent||''),null,{timeout:15000});
  await p.locator('#sortColumn').selectOption({index:1});await p.locator('#sortDirection').selectOption('desc');await p.locator('#filterColumn').selectOption({index:1});await p.locator('#filterValue').fill('a');
  const csvDl=p.waitForEvent('download');await p.locator('#exportCsv').click();const csv=(await readDownload(await csvDl)).toString('utf8');if(!csv.startsWith('\ufeff'))throw new Error('CSV Data sans BOM UTF-8');
  const dl=p.waitForEvent('download');await p.locator('#save').click();const data=JSON.parse((await readDownload(await dl)).toString('utf8'));if(!Array.isArray(data))throw new Error('Data export JSON invalide');
 });
 await studio('file-studio',async p=>{
  await p.locator('#files').setInputFiles(['Library/demo/files/demo-input/Code/demo-script.js','Library/demo/source-drive/json/rdc-recettes-complexes-demo.json']);await p.locator('#hashFiles').click();await p.waitForFunction(()=>/empreinte/.test(document.querySelector('#status')?.textContent||''),null,{timeout:15000});
  await p.locator('#prefix').fill('TEST_{COUNTER}_');const dl=p.waitForEvent('download');await p.locator('#export').click();const csv=(await readDownload(await dl)).toString('utf8');if(!/TEST_001_/i.test(csv)||!/sha256/i.test(csv))throw new Error('Manifest File Studio incohérent');
  const jdl=p.waitForEvent('download');await p.locator('#exportJson').click();const mf=JSON.parse((await readDownload(await jdl)).toString('utf8'));if(mf.schema!=='nlab-file-manifest/v1'||!mf.files.every(x=>x.sha256))throw new Error('Manifest JSON File Studio sans hash');
 });
 await studio('markdown-studio',async p=>{
  await p.locator('#insertTable').click();const expected=await p.locator('#mdEditor').inputValue();const dl=p.waitForEvent('download');await p.locator('#saveMd').click();const md=(await readDownload(await dl)).toString('utf8');if(!md.includes('| Colonne 1 |')||md.length<expected.length-20)throw new Error('Round-trip Markdown incomplet');
 });
 await studio('code-studio',async p=>{
  await p.locator('#demo').click();await p.waitForFunction(()=>/demo-script\.js/.test(document.querySelector('#tab')?.textContent||''),null,{timeout:15000});
  const dl=p.waitForEvent('download');await p.locator('#save').click();const code=(await readDownload(await dl)).toString('utf8');if(code.length<20||!/function|const|let|=>/.test(code))throw new Error('Code export incohérent');
 });
 await studio('dataset-generator-studio',async p=>{
  await p.locator('#rows').fill('25');await p.locator('#seed').fill('424242');await p.locator('#generate').click();await p.waitForFunction(()=>/25 ligne/.test(document.querySelector('#count')?.textContent||''),null,{timeout:10000});
  const first=await p.locator('#table').textContent();await p.locator('#generate').click();const second=await p.locator('#table').textContent();if(first!==second)throw new Error('Dataset non déterministe avec seed identique');
  const dl=p.waitForEvent('download');await p.locator('#exportJson').click();const payload=JSON.parse((await readDownload(await dl)).toString('utf8')),rows=payload.records;if(payload.schema!=='nlab-demo-dataset/v1'||payload.synthetic!==true||!Array.isArray(rows)||rows.length!==25)throw new Error('Dataset JSON incohérent ou incomplet');
 });
 await studio('qr-barcode-studio',async p=>{
  await p.locator('#symTabs [data-type="code128"]').click();await p.waitForFunction(()=>document.querySelector('#preview canvas'),null,{timeout:15000});const dl=p.waitForEvent('download');await p.locator('#downloadPng').click();const b=await readDownload(await dl);if(b.length<200)throw new Error('PNG code-barres anormalement petit');
 });

 await studio('document-studio',async p=>{
  await p.locator('#fileInput').setInputFiles('Library/demo/files/demo-input/Code/demo-markdown.md');await p.waitForFunction(()=>document.querySelector('#editor')?.value.length>20,null,{timeout:15000});
  const d=p.waitForEvent('download');await p.locator('#exportDocx').click();const docx=await d,path=await docx.path();if(!path)throw new Error('DOCX sans fichier');await p.locator('#fileInput').setInputFiles(path);await p.waitForFunction(()=>document.querySelector('#editor')?.value.length>20,null,{timeout:15000});
  const o=p.waitForEvent('download');await p.locator('#exportOdt').click();if(!/\.odt$/i.test((await o).suggestedFilename()))throw new Error('ODT export invalide');
 });
 await studio('spreadsheet-studio',async p=>{
  await p.locator('#fileInput').setInputFiles('Library/demo/Data/dataset-validation-complet.csv');await p.waitForFunction(()=>document.querySelector('#dims')?.textContent!=='0 × 0',null,{timeout:15000});
  const d=p.waitForEvent('download');await p.locator('#exportXlsx').click();const x=await d,path=await x.path();if(!path)throw new Error('XLSX sans fichier');await p.locator('#fileInput').setInputFiles(path);await p.waitForFunction(()=>document.querySelector('#dims')?.textContent!=='0 × 0',null,{timeout:15000});
  const j=p.waitForEvent('download');await p.locator('#exportJson').click();const rows=JSON.parse((await readDownload(await j)).toString('utf8'));if(!Array.isArray(rows)||!rows.length)throw new Error('Spreadsheet JSON vide');
 });
 console.log(JSON.stringify({ok:true,roundtrip:done},null,2));
}finally{await browser.close()}
