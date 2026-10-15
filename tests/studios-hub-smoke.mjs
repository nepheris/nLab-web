import{chromium}from'playwright';
import{checkStudiosHubHealth}from'./studios-hub-health.mjs';
const base=process.env.NLAB_BASE_URL||'http://127.0.0.1:8770/';
const browser=await chromium.launch({headless:true});
const out=[];
try{
 out.push(await checkStudiosHubHealth(browser,base));
 const hubUrl=new URL('APP-Applications/studios/',base).href;
 const page=await browser.newPage({viewport:{width:1360,height:900}});
 try{
  await page.goto(hubUrl,{waitUntil:'domcontentloaded',timeout:60000});
  await page.locator('#studioGrid .card a').filter({hasText:/^CURRENT /}).first().waitFor({state:'visible',timeout:20000});
  const startingPages=page.context().pages().length;
  for(const text of ['CURRENT','TEST','Versions']){
   const locator=text==='Versions'
    ?page.locator('#studioGrid .card a').filter({hasText:/^Versions$/}).first()
    :page.locator('#studioGrid .card a').filter({hasText:new RegExp('^'+text+' ')}).first();
   await locator.waitFor({state:'visible',timeout:20000});
   const destination=await locator.getAttribute('href');
   if(!destination)throw Error('Hub route '+text+' has no href');
   await Promise.all([page.waitForNavigation({waitUntil:'domcontentloaded',timeout:60000}),locator.click()]);
   if(page.url()!==new URL(destination,hubUrl).href)throw Error('Hub route '+text+' wrong URL '+page.url());
   if(page.context().pages().length!==startingPages)throw Error('Hub route '+text+' opened another tab');
   out.push({route:text,ok:true});
   await page.goBack({waitUntil:'domcontentloaded',timeout:60000});
   await page.locator('#studioGrid .card a').filter({hasText:/^CURRENT /}).first().waitFor({state:'visible',timeout:20000});
  }
 }finally{await page.close()}
 console.log(JSON.stringify({ok:true,checks:out},null,2));
}finally{await browser.close()}
