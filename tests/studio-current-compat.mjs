import{chromium}from'playwright';

const base=process.env.NLAB_BASE_URL||'http://127.0.0.1:8776/';
const studios=[
 ['image-studio','2.7.0','2.7.1'],
 ['code-studio','2.4.0','2.4.1'],
 ['json-studio','2.2.0','2.2.1'],
 ['data-studio','2.4.0','2.4.1'],
 ['file-studio','2.4.0','2.4.1'],
 ['ocr-studio','2.3.0','2.3.1'],
 ['qr-barcode-studio','2.4.1','2.4.2'],
 ['scan-studio','0.4.0','0.4.1'],
 ['markdown-studio','2.3.0','2.3.1'],
 ['dataset-generator-studio','2.3.0','2.3.1'],
 ['document-studio','1.3.0','1.3.1'],
 ['spreadsheet-studio','1.3.0','1.3.1']
];

const browser=await chromium.launch({headless:true});
try{
 const page=await browser.newPage({viewport:{width:1280,height:800}});
 for(const [id,current,test] of studios){
   await page.goto(base+'APP-Applications/'+id+'/',{waitUntil:'domcontentloaded',timeout:60000});
   await page.waitForURL(new RegExp('/APP-Applications/'+id+'/v2/.*channel=current'),{timeout:10000});
   await page.waitForSelector('#nlabStudioV2Chrome',{timeout:30000});
   const cur=await page.evaluate(()=>({version:document.body.dataset.studioVersion,status:document.querySelector('.studioPill.test')?.textContent?.trim()||''}));
   if(cur.version!==current||cur.status!=='CURRENT')throw new Error(id+' CURRENT invalide '+JSON.stringify(cur)+' attendu '+current);
   await page.goto(base+'APP-Applications/'+id+'/v2/',{waitUntil:'domcontentloaded',timeout:60000});
   await page.waitForSelector('#nlabStudioV2Chrome',{timeout:30000});
   const tst=await page.evaluate(()=>({version:document.body.dataset.studioVersion,status:document.querySelector('.studioPill.test')?.textContent?.trim()||''}));
   if(tst.version!==test||tst.status!=='TEST')throw new Error(id+' TEST invalide '+JSON.stringify(tst)+' attendu '+test);
 }
 console.log(JSON.stringify({ok:true,studios:studios.map(([id,current,test])=>({id,current,test}))},null,2));
}finally{await browser.close()}
