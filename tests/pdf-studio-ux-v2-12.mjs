import{chromium}from'playwright';
import{mkdir,readFile}from'node:fs/promises';
const url=process.env.PDF_UX_URL||'http://127.0.0.1:8776/APP-Applications/pdf-studio/v2-ux/';
function pdfFixture(){
 const objects=[
  '<< /Type /Catalog /Pages 2 0 R >>',
  '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
  '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 5 0 R >> >> /Contents 4 0 R >>',
  null,
  '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>'
 ];
 const stream='BT /F1 18 Tf 54 735 Td (PDF Studio UX Test) Tj ET';
 objects[3]='<< /Length '+Buffer.byteLength(stream)+' >>\nstream\n'+stream+'\nendstream';
 let pdf='%PDF-1.4\n';const offsets=[0];
 for(let i=0;i<objects.length;i++){offsets.push(Buffer.byteLength(pdf));pdf+=(i+1)+' 0 obj\n'+objects[i]+'\nendobj\n'}
 const start=Buffer.byteLength(pdf);pdf+='xref\n0 6\n0000000000 65535 f \n';
 for(const off of offsets.slice(1))pdf+=String(off).padStart(10,'0')+' 00000 n \n';
 pdf+='trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n'+start+'\n%%EOF\n';
 return Buffer.from(pdf,'utf8')
}
function assert(ok,msg){if(!ok)throw Error(msg)}

async function verifySignatureAndImagePlacement(page){
 const png=async color=>Buffer.from(await page.evaluate(rgb=>{
  const canvas=document.createElement('canvas');canvas.width=120;canvas.height=36;
  const ctx=canvas.getContext('2d');ctx.fillStyle=rgb;ctx.fillRect(0,0,120,36);
  return canvas.toDataURL('image/png').split(',')[1];
 },color),'base64');
 const imagePng=await png('#ed2733'),signaturePng=await png('#2352e5');
 const getObject=async type=>await page.evaluate(kind=>{
  const a=window.__NLAB_PDF_STUDIO__.engine.annotations(1).find(x=>x.type===kind);
  return a?{id:a.id,x:a.xPct,y:a.yPct,w:a.wPct}:null;
 },type);
 const canvas=page.locator('#mainPageGrid .pageTile[data-page="1"] canvas');
 await canvas.waitFor({state:'visible'});
 await canvas.scrollIntoViewIfNeeded();
 await page.waitForFunction(()=>{
  const c=document.querySelector('#mainPageGrid .pageTile[data-page="1"] canvas');
  return c?.dataset.rendered==='1'&&c.width>400&&c.height>c.width*1.2;
 },null,{timeout:25000});
 await page.waitForFunction(()=>{
  const t=document.querySelector('#mainPageGrid .pageTile[data-page="1"]'),c=t?.querySelector('canvas'),l=t?.querySelector('.pageObjectLayer');
  if(!l||!c||!c.width)return false;
  const cr=c.getBoundingClientRect(),lr=l.getBoundingClientRect();
  return cr.width>100&&cr.height>100&&Math.abs(cr.left-lr.left)<3&&Math.abs(cr.top-lr.top)<3
   &&Math.abs(cr.width-lr.width)<3&&Math.abs(cr.height-lr.height)<3;
 },null,{timeout:30000});
 async function placeAt(kind,x,y){
  await canvas.scrollIntoViewIfNeeded();
  const cr=await canvas.boundingBox();
  await page.mouse.click(cr.x+cr.width*x/100,cr.y+cr.height*y/100);
  try{await page.locator('#mainPageGrid .pdfObject.'+kind).waitFor({state:'visible',timeout:6000})}
  catch(error){
   const state=await page.evaluate(({kind,x,y})=>{
    const studio=window.__NLAB_PDF_STUDIO__,tile=document.querySelector('#mainPageGrid .pageTile[data-page="1"]');
    const canvas=tile?.querySelector('canvas'),layer=tile?.querySelector('.pageObjectLayer');
    const r=canvas?.getBoundingClientRect(),point=r?document.elementFromPoint(r.x+r.width*x/100,r.y+r.height*y/100):null;
    return{kind,tool:studio?.objectLayer?.tool,imageSources:Object.fromEntries(
     Object.entries(studio?.objectLayer?.imageSources||{}).map(([k,v])=>[k,!!v])),
     annotations:studio?.engine?.annotations(1).map(a=>({type:a.type,x:a.xPct,y:a.yPct})),
     layerRect:layer?.getBoundingClientRect().toJSON(),canvasRect:r?.toJSON(),
     pointTarget:point?.outerHTML?.slice(0,220),status:document.querySelector('#studioStatus')?.textContent}
   },{kind,x,y});
   throw Error('Unable to place '+kind+': '+JSON.stringify(state)+' : '+error.message);
  }
  const a=await getObject(kind);
  assert(!!a,'Objet '+kind+' non créé sur la page');
  assert(Math.abs(a.x-x)<1.3&&Math.abs(a.y-y)<1.3,'Placement '+kind+' calculé sur le mauvais conteneur');
  return a
 }
 async function dragAndResize(kind){
  const el=page.locator('#mainPageGrid .pdfObject.'+kind).first();
  let box=await el.boundingBox();assert(!!box,'Objet '+kind+' non visible');
  const a=await getObject(kind),stage=await canvas.boundingBox();
  const dx=stage.width*.115,dy=stage.height*.073;
  await page.mouse.move(box.x+box.width*.46,box.y+box.height*.48);
  await page.mouse.down();
  await page.mouse.move(box.x+box.width*.46+dx,box.y+box.height*.48+dy,{steps:9});
  await page.mouse.up();
  const b=await getObject(kind);
  assert(b.x>a.x+8&&b.y>a.y+5,'Glisser '+kind+' interrompu ou coordonnées erronées');
  const handle=el.locator('.pdfObjectResize');
  await handle.waitFor({state:'visible'});
  const rh=await handle.boundingBox();const oldW=b.w;
  await page.mouse.move(rh.x+rh.width/2,rh.y+rh.height/2);
  await page.mouse.down();
  await page.mouse.move(rh.x+rh.width/2+stage.width*.065,rh.y+rh.height/2,{steps:7});
  await page.mouse.up();
  const c=await getObject(kind);
  assert(c.w>oldW+4,'Redimensionnement '+kind+' interrompu');
  return c
 }
 await page.locator('#objectImageInput').setInputFiles({name:'insertion-test.png',mimeType:'image/png',buffer:imagePng});
 await page.waitForFunction(()=>window.__NLAB_PDF_STUDIO__.objectLayer.tool==='image',null,{timeout:20000});
 await placeAt('image',19,23);
 const image=await dragAndResize('image');
 await page.locator('#newSignatureKind').evaluate(el=>{el.value='signature';el.dispatchEvent(new Event('change',{bubbles:true}))});
 await page.locator('#newSignatureLabel').evaluate(el=>{el.value='Signature factice pour recette';el.dispatchEvent(new Event('input',{bubbles:true}))});
 await page.locator('#newSignatureFile').setInputFiles({name:'signature-factice.png',mimeType:'image/png',buffer:signaturePng});
 await page.waitForFunction(()=>document.querySelector('#signatureAssetSelect')?.value&&document.querySelector('#signatureAssetPreview img')?.complete,null,{timeout:25000});
 await page.locator('#placeVisualSignature').evaluate(button=>button.click());
 await page.waitForFunction(()=>window.__NLAB_PDF_STUDIO__.objectLayer.tool==='signature',null,{timeout:15000});
 await placeAt('signature',38,48);
 const signature=await dragAndResize('signature');
 const download=page.waitForEvent('download',{timeout:35000});
 await page.locator('#pdfUxSaveDirect').click();
 const item=await download,path=await item.path(),buffer=await readFile(path);
 assert(buffer.subarray(0,5).toString()==='%PDF-','PDF exporté invalide');
 const placed=await page.evaluate(async payload=>{
  const bytes=Uint8Array.from(atob(payload.base64),c=>c.charCodeAt(0));
  const doc=await pdfjsLib.getDocument({data:bytes}).promise;
  const page=await doc.getPage(1),viewport=page.getViewport({scale:1});
  const canvas=document.createElement('canvas');canvas.width=Math.round(viewport.width);canvas.height=Math.round(viewport.height);
  const context=canvas.getContext('2d');
  await page.render({canvasContext:context,viewport}).promise;
  const rgb=(obj)=>{
   const h=(obj.w/100*canvas.width)*.3;
   const x=Math.round((obj.x+obj.w/2)/100*canvas.width);
   const y=Math.round(obj.y/100*canvas.height+h/2);
   return [...context.getImageData(x,y,1,1).data].slice(0,3);
  };
  return{image:rgb(payload.image),signature:rgb(payload.signature)};
 },{base64:buffer.toString('base64'),image,signature});
 assert(placed.image[0]>175&&placed.image[2]<110,
  'Image insérée absente ou décalée dans le PDF exporté : '+JSON.stringify(placed.image));
 assert(placed.signature[2]>150&&placed.signature[0]<125,
  'Signature déplacée absente ou décalée dans le PDF exporté : '+JSON.stringify(placed.signature));
 return{image,signature,download:item.suggestedFilename()};
}

const browser=await chromium.launch({headless:true,channel:process.env.NLAB_BROWSER_CHANNEL||'chrome',args:['--no-sandbox']});
const cases=[{name:'desktop',width:1440,height:900},{name:'tablette',width:820,height:1024},{name:'mobile',width:393,height:852}];let failures=[];
await mkdir('artifacts/pdf-studio-ux',{recursive:true});
for(const testcase of cases){
 const context=await browser.newContext({viewport:{width:testcase.width,height:testcase.height},acceptDownloads:true,permissions:['clipboard-read','clipboard-write']});
 const page=await context.newPage();const errors=[];
 const cdp=await context.newCDPSession(page);
 await cdp.send('Runtime.enable');
 cdp.on('Runtime.exceptionThrown',({exceptionDetails:d})=>{
  errors.push('CDP '+(d.url||'<anonymous>')+':'+(d.lineNumber+1)+':'+(d.columnNumber+1)
   +' '+(d.text||'')+' '+(d.exception?.description||''));
 });
 page.on('pageerror',e=>errors.push('pageerror '+(e.stack||e.message)));
 page.on('console',msg=>{if(msg.type()==='error'&&!(msg.location()?.url||'').includes('/build.json'))errors.push('console '+msg.text()+' @ '+JSON.stringify(msg.location()))});
 try{
  await page.goto(url,{waitUntil:'domcontentloaded',timeout:40000});
  await page.waitForTimeout(1800);
  if(errors.length)throw Error('Initialisation PDF impossible : '+errors.join(' | '));
  await page.waitForFunction(()=>document.documentElement.dataset.pdfUxReady==='1',null,{timeout:70000});
  assert(await page.locator('#studioMain.studioUx').count()===1,'shared workspace missing');
  assert((await page.locator('.studioUxRail [data-ux-tab]').count())===7,'seven expected tabs missing');
  assert(await page.locator('#fileCollection.collectionThumbnailTools').count()===1,'not using canonical PDF CollectionBrowser with preview controls');
  assert(await page.locator('#pdfUxSaveDialog').count()===1,'native PDF Save As not connected');
  assert((await page.locator('#studioMain').getAttribute('data-layout-profile'))===(testcase.width<=700?'mobile':testcase.width<=1100?'tablet':'desktop'),'layout profile wrong');
  // The existing PDF V2 input handler still loads the file; this is not a metadata demo.
  await page.locator('#fileInput').setInputFiles({name:'pdf-ux-fixture.pdf',mimeType:'application/pdf',buffer:pdfFixture()});
  await page.waitForFunction(()=>window.__NLAB_PDF_STUDIO__?.engine?.pageCount>=1,null,{timeout:35000});
  await page.waitForFunction(()=>window.NLabPdfUxPilot?.browser?.items.length>=1,null,{timeout:35000});
  await page.waitForFunction(()=>window.NLABStudioHistory?.load?.().some(x=>x.studio==='pdf-studio'&&x.label==='Fichier chargé'),null,{timeout:35000});
  assert((await page.locator('#pdfUxFileList .pdfUxFileRow').count())>=1,'real file list not synchronized');
  await page.locator('#pdfUxView').selectOption('list');
  assert(await page.locator('#fileCollection').evaluate(x=>x.classList.contains('collection-list')),'list view broken');
  await page.locator('#pdfUxView').selectOption('thumbs');
  await page.locator('#pdfUxGrouping').selectOption('type');
  assert(await page.locator('#fileCollection .collectionGroup').count()>=1,'grouping broken');
  await page.locator('#pdfUxGrouping').selectOption('none');
  const auto=await page.locator('#pdfUxThumbValue').textContent();
  assert(auto==='Auto','auto thumbnail mode not active');
  await page.locator('#pdfUxCollectionToolbar button').count().catch(()=>0);
  await page.locator('#pdfUxFilter').fill('sans-resultat-idiot');
  assert((await page.locator('#fileCollection .collectionItem:not([hidden])').count())===0,'filter failed');
  await page.locator('#pdfUxFilter').fill('');
  if(testcase.width<=700)await page.locator('#studioUxMobileOpen').click();
  await page.locator('[data-ux-tab="history"]').click();
  assert(await page.locator('.uxHistorySidebar').count()===1,'shared history presenter missing');
  assert(await page.locator('#uxHistoryList .uxHistoryEntry').count()>=1,'PDF import not recorded in history');
  await page.locator('#uxHistorySearch').fill('zzzx-search-none');
  assert((await page.locator('#uxHistoryList .uxHistoryEntry').count())===0,'history search missing');
  await page.locator('#uxHistorySearch').fill('');
  if(testcase.width<=700)await page.locator('#studioUxCollapse').click();
  else await page.locator('[data-ux-tab="files"]').click();
  await page.screenshot({path:'artifacts/pdf-studio-ux/'+testcase.name+'-workspace.png',fullPage:true});
  if(testcase.width<=700)await page.locator('#studioUxMobileOpen').click();
  await page.locator('[data-ux-tab="history"]').click();
  await page.screenshot({path:'artifacts/pdf-studio-ux/'+testcase.name+'-history.png',fullPage:true});
  if(testcase.width<=700)await page.locator('#studioUxCollapse').click();
  await page.locator('#pdfUxSaveOpen').click();
  assert(await page.locator('#pdfUxSaveDialog').isVisible(),'Save As panel not open');
  assert(await page.locator('#sectionOutput').isVisible(),'native output section missing');
  assert(await page.locator('#sectionNaming').isVisible(),'native naming section missing');
  assert(await page.locator('#outputProvider').count()===1,'original output settings missing');
  assert(await page.locator('#namingTemplate').count()===1,'original naming model missing');
  await page.locator('#pdfUxSaveDialog button').filter({hasText:'Fermer'}).click();
  assert((await page.locator('#pdfUxSaveDialog').isVisible())===false,'Save As not closing');
  if(testcase.width>1000){
   const downloadPromise=page.waitForEvent('download',{timeout:25000});
   await page.locator('#pdfUxSaveDirect').click();
   const d=await downloadPromise;const p=await d.path();const bytes=p?await readFile(p):Buffer.alloc(0);
   assert(d.suggestedFilename().toLowerCase().endsWith('.pdf'),'PDF filename is not PDF');
   assert(bytes.slice(0,5).toString()==='%PDF-','download not an actual PDF');
  }
  if(testcase.width>1000){
   const positions=await verifySignatureAndImagePlacement(page);
   console.log(JSON.stringify({profile:testcase.name,signaturePlacement:'PASS',imagePlacement:'PASS',positions}));
  }
  assert(errors.length===0,'uncaught JS errors '+errors.join(' | '));
  console.log(JSON.stringify({profile:testcase.name,status:'PASS',files:true,pdfPages:1,saveAs:true,history:true}));
 }catch(e){failures.push({profile:testcase.name,error:String(e?.stack||e),pageErrors:errors});console.error(JSON.stringify(failures.at(-1)))}
 finally{await context.close()}
}
await browser.close();
if(failures.length)process.exitCode=1;
