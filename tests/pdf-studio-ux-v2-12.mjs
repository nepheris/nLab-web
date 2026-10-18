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
const browser=await chromium.launch({headless:true,channel:process.env.NLAB_BROWSER_CHANNEL||'chrome',args:['--no-sandbox']});
const cases=[{name:'desktop',width:1440,height:900},{name:'tablette',width:820,height:1024},{name:'mobile',width:393,height:852}];let failures=[];
await mkdir('artifacts/pdf-studio-ux',{recursive:true});
for(const testcase of cases){
 const context=await browser.newContext({viewport:{width:testcase.width,height:testcase.height},acceptDownloads:true,permissions:['clipboard-read','clipboard-write']});
 const page=await context.newPage();const errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 try{
  await page.goto(url,{waitUntil:'domcontentloaded',timeout:40000});
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
  assert(errors.length===0,'uncaught JS errors '+errors.join(' | '));
  console.log(JSON.stringify({profile:testcase.name,status:'PASS',files:true,pdfPages:1,saveAs:true,history:true}));
 }catch(e){failures.push({profile:testcase.name,error:String(e?.stack||e),pageErrors:errors});console.error(JSON.stringify(failures.at(-1)))}
 finally{await context.close()}
}
await browser.close();
if(failures.length)process.exitCode=1;
