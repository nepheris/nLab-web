import{chromium}from'playwright';

const base=process.env.NLAB_BASE_URL||'http://127.0.0.1:8777/';
const studios=['image-studio','code-studio','json-studio','data-studio','file-studio','ocr-studio','qr-barcode-studio'];
const legacyControls={
 'image-studio':['#file','#cv'],
 'code-studio':['#editor'],
 'json-studio':['#editor'],
 'data-studio':['#file','#summary'],
 'file-studio':['#files','#body'],
 'ocr-studio':['#file','#out'],
 'qr-barcode-studio':['#value','#preview']
};

const browser=await chromium.launch({headless:true});
try{
 const checked=[];
 for(const id of studios){
   const regRes=await fetch(base+'APP-Applications/'+id+'/versions.json');
   if(!regRes.ok)throw new Error(id+' versions.json HTTP '+regRes.status);
   const reg=await regRes.json();
   const historical=(reg.versions||[]).filter(v=>String(v.status).toLowerCase()==='historical');
   for(const v of historical){
     const page=await browser.newPage({viewport:{width:1280,height:800}});
     const url=new URL(v.href,base+'APP-Applications/'+id+'/').href;
     const errors=[];
     const onErr=e=>errors.push(String(e?.message||e));
     page.on('pageerror',onErr);
     await page.goto(url,{waitUntil:'domcontentloaded',timeout:60000});
     if(/channel=historical/.test(url)){
       await page.waitForSelector('#nlabStudioV2Chrome',{timeout:30000});
       await page.waitForFunction(expected=>document.documentElement.dataset.studioVersion===expected||document.body.dataset.studioVersion===expected,String(v.version),{timeout:15000});
       const state=await page.evaluate(()=>({
         version:document.documentElement.dataset.studioVersion||document.body.dataset.studioVersion||'',
         status:document.querySelector('.studioPill.test')?.textContent?.trim()||''
       }));
       if(state.version!==String(v.version)||state.status!=='HISTORICAL')throw new Error(id+' '+v.version+' historical V2 invalide '+JSON.stringify(state));
     }else{
       await page.waitForFunction(expected=>document.body.dataset.historyVersion===expected,String(v.version),{timeout:10000});
       for(const selector of legacyControls[id]||[]){
         if(!(await page.locator(selector).count()))throw new Error(id+' '+v.version+' snapshot historique incomplet: '+selector);
       }
     }
     page.off('pageerror',onErr);
     if(errors.length){await page.close();throw new Error(id+' '+v.version+' pageerror: '+errors.join(' | '))}
     checked.push({studio:id,version:String(v.version),href:v.href});
     await page.close();
   }
 }
 console.log(JSON.stringify({ok:true,count:checked.length,checked},null,2));
}finally{await browser.close()}
