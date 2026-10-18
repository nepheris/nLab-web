import {chromium} from 'playwright';
const browser=await chromium.launch({headless:true,...(process.env.NLAB_BROWSER_CHANNEL?{channel:process.env.NLAB_BROWSER_CHANNEL}:{})});
const base=process.env.NLAB_BASE_URL||'http://127.0.0.1:8770/';
const checks=[];
const check=(value,msg)=>{if(!value)throw Error(msg);checks.push(msg)};
const page=await browser.newPage({viewport:{width:1280,height:900}});
try{
 const response=await page.goto(new URL('Library/demo/?folder=icons',base).href,{waitUntil:'domcontentloaded',timeout:45000});
 check(response?.ok(),'gallery loads');
 await page.locator('[data-demo-folder="icons"]').waitFor({timeout:20000});
 check(await page.locator('[data-demo-folder="icons"]').getAttribute('aria-current')==='true','icons treated as a normal folder');
 const count=await page.locator('#demoBrowserFiles .demo-file').count();
 check(count>=50,'icons folder shows both families of actual files: '+count);
 check(await page.locator('.demo-folder-link[href*="Icon-Library/gallery"]').count()===1,'icon browse button present in folder list');
 const images=page.locator('img[data-demo-preview]');
 check(await images.count()>=20,'real icon images shown as previews');
 await page.waitForFunction(()=>{const img=document.querySelector('img[data-demo-preview]');return img?.complete&&img?.naturalWidth>0},null,{timeout:15000});
 check(true,'real preview decodes');
 await page.locator('[data-demo-folder="all"]').click();
 const listed=await page.locator('#demoBrowserFiles .demo-file').count();
 const declared=Number((await page.locator('#demoBrowserCount').textContent()).split(' ')[0]);
 check(listed===declared,'all folders shown without 150-item truncation ('+listed+')');
 await page.locator('#demoBrowserSearch').fill('home.svg');
 const filtered=await page.locator('#demoBrowserFiles .demo-file').count();
 check(filtered>=1&&filtered<listed,'search matches actually displayed files');
 await page.locator('#demoBrowserSearch').fill('');
 await page.locator('#demoBrowserLocalOnly').check();
 const available=await page.locator('#demoBrowserFiles .demo-file').count();
 check(available<=listed,'available-only option remains functional');
 console.log(JSON.stringify({status:'PASS',checks},null,2));
}catch(e){console.error(JSON.stringify({status:'FAIL',checks,error:String(e.stack||e)},null,2));process.exitCode=1}
finally{await browser.close()}
