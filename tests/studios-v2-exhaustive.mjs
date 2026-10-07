import{chromium}from'playwright';
import{readFile}from'node:fs/promises';
const base=process.env.NLAB_BASE_URL||'http://127.0.0.1:8773/';
const browser=await chromium.launch({headless:true});
const done=[];
async function dlBytes(page,button){const p=page.waitForEvent('download',{timeout:60000});await page.locator(button).click();const d=await p,path=await d.path();if(!path)throw new Error('download path unavailable');return{d,b:await readFile(path),path}}
async function studio(id,fn,{clipboard=false}={}){
 const ctx=await browser.newContext({viewport:{width:1360,height:900},acceptDownloads:true,permissions:clipboard?['clipboard-read','clipboard-write']:[]});
 const page=await ctx.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error'&&!/favicon|Failed to load resource/i.test(m.text()))errors.push(m.text())});
 await page.goto(base+'APP-Applications/'+id+'/v2/',{waitUntil:'domcontentloaded',timeout:60000});await page.waitForSelector('#nlabStudioV2Chrome',{timeout:30000});await fn(page);
 if(errors.length)throw new Error(id+': '+errors.join(' | '));done.push(id);await ctx.close();
}
try{
 await studio('image-studio',async p=>{
  for(const id of ['demoReal1','demoReal2']){await p.locator('#'+id).click();await p.waitForFunction(()=>!/Impossible|Aucune image/.test(document.querySelector('#imageMeta')?.textContent||'')&&/px/.test(document.querySelector('#imageMeta')?.textContent||''),null,{timeout:15000})}
  await p.locator('#demoSynthetic').click();await p.waitForFunction(()=>/px/.test(document.querySelector('#imageMeta')?.textContent||''),null,{timeout:15000});
  await p.locator('#left').click();await p.locator('#flipX').click();await p.locator('#flipY').click();
   await p.locator('#axis').evaluate(el=>{const d=el.closest('details');if(d)d.open=true});await p.locator('#axis').selectOption('X');await p.locator('#mm').fill('50');await p.locator('#measure').click();
  await p.locator('#cv').scrollIntoViewIfNeeded();const box=await p.locator('#cv').boundingBox();if(!box)throw new Error('Canvas image sans bbox');await p.mouse.click(box.x+Math.min(100,box.width*.2),box.y+Math.min(100,box.height*.2));await p.mouse.click(box.x+Math.min(300,box.width*.6),box.y+Math.min(100,box.height*.2));
  await p.waitForFunction(()=>document.querySelector('#kx')?.textContent!=='—'&&document.querySelector('#dx')?.textContent!=='—',null,{timeout:10000});
  if(await p.locator('#measureRows tr').count()<1)throw new Error('Calibration non enregistrée');await p.locator('#undoMeasure').click();if(await p.locator('#measureRows tr').count()!==0)throw new Error('Undo calibration inactif');
  await p.locator('#fmt').selectOption('image/jpeg');const out=await dlBytes(p,'#export');if(out.b.length<500)throw new Error('Export JPEG trop petit');
 });
 await studio('ocr-studio',async p=>{
  await p.locator('#lang').selectOption('fra');await p.locator('#noisy').click();await p.waitForFunction(()=>/Image chargée/.test(document.querySelector('#status')?.textContent||''),null,{timeout:15000});
  const svg='<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="300"><rect width="100%" height="100%" fill="white"/><text x="60" y="180" font-family="Arial" font-size="96" font-weight="700" fill="black">NLAB OCR TEST 1234</text></svg>';
  await p.locator('#file').setInputFiles({name:'ocr-ci.svg',mimeType:'image/svg+xml',buffer:Buffer.from(svg)});await p.waitForTimeout(300);await p.locator('#run').click();await p.waitForFunction(()=>/OCR terminé|Erreur OCR/.test(document.querySelector('#status')?.textContent||''),null,{timeout:120000});
  const st=await p.locator('#status').textContent(),txt=(await p.locator('#out').inputValue()).toUpperCase();if(/Erreur OCR/.test(st))throw new Error('OCR réel: '+st);if(!/NLAB/.test(txt)||!/1234/.test(txt))throw new Error('OCR réel incorrect: '+txt.slice(0,120));
 });
 await studio('code-studio',async p=>{
  await p.locator('#file').setInputFiles('Library/demo/source-drive/json/rdc-recettes-complexes-demo.json');await p.waitForFunction(()=>document.querySelector('#mode')?.textContent==='json',null,{timeout:15000});
  await p.locator('#formatJson').click();
  if((await p.locator('#editor').getAttribute('class')||'').length===0)throw new Error('Ace absent');
  await p.locator('#langs [data-lang="python"]').click();if((await p.locator('#mode').textContent())!=='python')throw new Error('Changement langage inactif');
  await p.locator('#find').click();await p.waitForFunction(()=>!!document.querySelector('.ace_search'),null,{timeout:5000});
  if(await p.locator('#stats .kpi').count()<4)throw new Error('Stats code absentes');
  await p.locator('.ace_text-input').press('End');await p.waitForTimeout(150);if(!/Ln \d+, Col \d+/.test(await p.locator('#cursor').textContent()))throw new Error('Position curseur absente');
 });
 await studio('json-studio',async p=>{
  await p.locator('#demo').selectOption('../../Library/demo/Data/dataset-validation-complet.json');await p.locator('#loadDemo').click();await p.waitForFunction(()=>/JSON valide/.test(document.querySelector('#validity')?.textContent||''),null,{timeout:15000});
  const pretty=(await p.locator('#editor').inputValue()).length;await p.locator('#min').click();const mini=(await p.locator('#editor').inputValue()).length;if(!(mini<pretty))throw new Error('Minification JSON sans effet');
  await p.locator('[data-view="stats"]').click();if(await p.locator('#stats .kpi').count()<4)throw new Error('Stats JSON absentes');
  await p.locator('[data-view="tree"]').click();if(await p.locator('#tree .treeNode').count()<1||await p.locator('#tree [data-tree-toggle]').count()<1)throw new Error('Arbre JSON éditable absent');
  const root=await p.evaluate(()=>Object.keys(JSON.parse(document.querySelector('#editor').value))[0]||'');if(root){await p.locator('[data-view="query"]').click();await p.locator('#path').fill(root);await p.locator('#query').click();if((await p.locator('#result').textContent()).trim()==='—')throw new Error('Query JSON sans résultat')}
  await p.locator('#format').click();
 },{clipboard:true});
 await studio('data-studio',async p=>{
  await p.locator('#demoJson').click();await p.waitForFunction(()=>!/0 \/ 0/.test(document.querySelector('#shown')?.textContent||''),null,{timeout:15000});
  if(await p.locator('#summary .kpi').count()<4)throw new Error('Résumé Data absent');if(await p.locator('#types .typeRow').count()<1)throw new Error('Typage Data absent');if(await p.locator('#body tr').count()<1)throw new Error('Table Data vide');
 });
 await studio('file-studio',async p=>{
  await p.locator('#demo').click();await p.waitForFunction(()=>/[1-9]\d* élément/.test(document.querySelector('#status')?.textContent||''),null,{timeout:15000});
  await p.locator('#prefix').fill('P_{COUNTER}_');await p.locator('#suffix').fill('_S_{YEAR}');await p.locator('#find').fill('demo');await p.locator('#repl').fill('TEST');await p.locator('#start').fill('7');
  const row=await p.locator('#body tr').first().textContent();if(!/P_007_/.test(row)||!/_S_\d{4}/.test(row))throw new Error('Règles File Studio non appliquées');
 });
 await studio('qr-barcode-studio',async p=>{
  for(const type of ['qrcode','datamatrix','code128','gs1-128','ean13','ean8']){await p.locator('#symTabs [data-type="'+type+'"]').click();await p.waitForTimeout(250);if(!await p.locator('#preview canvas,#preview svg').count())throw new Error('Preview absent '+type)}
  await p.locator('#symTabs [data-type="qrcode"]').click();await p.locator('#value').fill('NLAB-CI-QR');await p.locator('#gradient').check();await p.locator('#transparent').check();await p.locator('#size').fill('420');await p.locator('#margin').fill('12');await p.locator('#dots').selectOption({index:1});await p.locator('#ecc').selectOption('H');await p.waitForTimeout(400);
  await p.locator('#colorMode').selectOption('rgb');if(!/rgb\(/.test(await p.locator('#fgText').inputValue()))throw new Error('Conversion couleur QR inactive');
  const generated=await p.evaluate(async()=>{const s=await import('/APP-Applications/_shared/studio-v2/symbology-service.js');const options={size:420,margin:12,fg:'#0057b8',fg2:'#1f2933',bg:'#ffffff',ecc:'H',dots:'rounded',corners:'extra-rounded',cornerDots:'dot',gradient:true,transparent:true};const svg=await s.generateSymbologyBlob('qrcode','NLAB-CI-QR',options,'svg'),png=await s.generateSymbologyBlob('qrcode','NLAB-CI-QR',options,'png');const ab=await png.blob.arrayBuffer(),bytes=new Uint8Array(ab);let bin='';for(const b of bytes)bin+=String.fromCharCode(b);return{svgSize:svg.blob.size,pngSize:png.blob.size,pngBase64:btoa(bin)}});if(generated.svgSize<200)throw new Error('SVG QR vide');if(generated.pngSize<200)throw new Error('PNG QR vide');
  await p.locator('[data-workflow="read"]').click();await p.locator('#scan').fill('HID-CI-123');await p.locator('#scan').press('Enter');if(!/HID-CI-123/.test(await p.locator('#history').textContent()))throw new Error('Historique HID absent');
  await p.locator('#scanFile').setInputFiles({name:'nlab-ci-qr.png',mimeType:'image/png',buffer:Buffer.from(generated.pngBase64,'base64')});await p.waitForFunction(()=>/Détecté|Aucun code détecté/.test(document.querySelector('#scanStatus')?.textContent||''),null,{timeout:30000});if(!/Détecté/.test(await p.locator('#scanStatus').textContent()))throw new Error('Scan image QR échoué');
  await p.locator('#clearHistory').click();if(!/Aucun historique/.test(await p.locator('#history').textContent()))throw new Error('Effacement historique QR inactif');
 });
 await studio('markdown-studio',async p=>{
  await p.locator('#metaTitle').fill('Titre CI');await p.locator('#metaLang').fill('fr');await p.locator('#metaAuthor').fill('nLab CI');await p.locator('#syncMeta').click();await p.waitForTimeout(250);const metaSrc=await p.locator('#mdEditor').inputValue();if(!metaSrc.includes('Titre CI'))throw new Error('Sync meta Markdown inactif · yamlStatus='+(await p.locator('#yamlStatus').textContent())+' · status='+(await p.locator('#status').textContent())+' · source='+metaSrc.slice(0,220));
  await p.locator('#refreshToc').click();if(await p.locator('#toc button').count()<1)throw new Error('TOC Markdown vide');
  await p.locator('#addQuote').click();await p.locator('#addCode').click();await p.locator('#addTable2x3').click();
  await p.locator('#yamlEditor').fill('title: YAML CI\nlang: fr\nauthor: nLab');await p.locator('#applyYaml').click();if(!/YAML valide/.test(await p.locator('#yamlStatus').textContent()))throw new Error('YAML Markdown invalide');
  const y=await dlBytes(p,'#exportYaml');if(!/title: YAML CI/.test(y.b.toString('utf8')))throw new Error('Export YAML incorrect');
  const h=await dlBytes(p,'#exportHtml');if(!/<html/.test(h.b.toString('utf8')))throw new Error('Export HTML incorrect');
  await p.locator('#imageInput').setInputFiles('Library/demo/Images/demo-image-color.png');if(!(await p.locator('#mdEditor').inputValue()).includes('blob:'))throw new Error('Insertion image Markdown inactive');
  if(!/mots/.test(await p.locator('#stats').textContent()))throw new Error('Stats Markdown absentes');
 });
 await studio('dataset-generator-studio',async p=>{
  for(const preset of ['generic','people','finance','catalog']){await p.locator('#preset').selectOption(preset);await p.locator('#rows').fill('5');await p.locator('#generate').click();await p.waitForFunction(()=>/5 ligne/.test(document.querySelector('#count')?.textContent||''),null,{timeout:5000})}
  const seed0=await p.locator('#seed').inputValue();await p.locator('#randomize').click();if((await p.locator('#seed').inputValue())===seed0)throw new Error('Randomize seed inactif');
  for(const b of ['#exportJson','#exportCsv','#exportMd','#exportXlsx']){const out=await dlBytes(p,b);if(out.b.length<20)throw new Error('Export Dataset vide '+b)}
 });
 console.log(JSON.stringify({ok:true,exhaustive:done},null,2));
}finally{await browser.close()}
