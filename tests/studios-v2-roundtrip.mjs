import{chromium}from'playwright';
import{readFile}from'node:fs/promises';
const base=process.env.NLAB_BASE_URL||'http://127.0.0.1:8772/';
const browser=await chromium.launch({headless:true});
const done=[];
async function readDownload(d){const p=await d.path();if(!p)throw new Error('Téléchargement sans fichier temporaire');return readFile(p)}
async function studio(id,fn){
 const page=await browser.newPage({viewport:{width:1360,height:900},acceptDownloads:true});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error'&&!/favicon|Failed to load resource/i.test(m.text()))errors.push(m.text())});
 await page.goto(base+'APP-Applications/'+id+'/v2/',{waitUntil:'domcontentloaded',timeout:60000});await page.waitForSelector('#nlabStudioV2Chrome',{timeout:30000});await fn(page);
 if(errors.length)throw new Error(id+': '+errors.join(' | '));done.push(id);await page.close();
}
try{
 await studio('image-studio',async p=>{
  await p.locator('#demoSynthetic').click();await p.waitForFunction(()=>/\d+ × \d+ px/.test(document.querySelector('#imageMeta')?.textContent||''),null,{timeout:15000});
  await p.locator('#w').fill('500');await p.locator('#resize').click();await p.waitForFunction(()=>document.querySelector('#cv')?.width===500,null,{timeout:10000});
  const meta=await p.locator('#imageMeta').textContent();if(!/^500 × \d+ px$/.test(meta.trim()))throw new Error('Image resize incohérent: '+meta);
 });
 await studio('json-studio',async p=>{
  await p.locator('#demo').selectOption({index:1});await p.locator('#loadDemo').click();await p.waitForFunction(()=>/JSON valide/.test(document.querySelector('#validity')?.textContent||''),null,{timeout:15000});
  await p.locator('#format').click();await p.locator('#sort').click();const dl=p.waitForEvent('download');await p.locator('#save').click();const raw=(await readDownload(await dl)).toString('utf8');JSON.parse(raw);if(raw.length<20)throw new Error('JSON export trop court');
 });
 await studio('data-studio',async p=>{
  await p.locator('#demoCsv').click();await p.waitForFunction(()=>!/0 \/ 0/.test(document.querySelector('#shown')?.textContent||''),null,{timeout:15000});
  const dl=p.waitForEvent('download');await p.locator('#save').click();const data=JSON.parse((await readDownload(await dl)).toString('utf8'));if(!Array.isArray(data)||!data.length)throw new Error('Data export JSON vide');
 });
 await studio('file-studio',async p=>{
  await p.locator('#demo').click();await p.waitForFunction(()=>/[1-9]\d* élément/.test(document.querySelector('#status')?.textContent||''),null,{timeout:15000});
  await p.locator('#prefix').fill('TEST_{COUNTER}_');const dl=p.waitForEvent('download');await p.locator('#export').click();const csv=(await readDownload(await dl)).toString('utf8');if(!/TEST_1_/i.test(csv)||csv.split(/\r?\n/).length<2)throw new Error('Manifest File Studio incohérent');
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
  const dl=p.waitForEvent('download');await p.locator('#exportJson').click();const rows=JSON.parse((await readDownload(await dl)).toString('utf8'));if(!Array.isArray(rows)||rows.length!==25)throw new Error('Dataset JSON n’a pas 25 lignes');
 });
 await studio('qr-barcode-studio',async p=>{
  await p.locator('#symTabs [data-type="code128"]').click();await p.waitForFunction(()=>document.querySelector('#preview canvas'),null,{timeout:15000});const dl=p.waitForEvent('download');await p.locator('#downloadPng').click();const b=await readDownload(await dl);if(b.length<200)throw new Error('PNG code-barres anormalement petit');
 });
 console.log(JSON.stringify({ok:true,roundtrip:done},null,2));
}finally{await browser.close()}
