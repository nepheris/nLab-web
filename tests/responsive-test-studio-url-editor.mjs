// Responsive Test Studio 0.4.3 — CURRENT Modify URL editor acceptance.
import {chromium} from 'playwright';
const base=process.env.NLAB_BASE_URL||'http://127.0.0.1:8770/';
const browser=await chromium.launch({headless:true,...(process.env.NLAB_BROWSER_CHANNEL?{channel:process.env.NLAB_BROWSER_CHANNEL}:{})});
const errors=[],checks=[];
const assert=(condition,label)=>{if(!condition)throw Error(label);checks.push(label)};
try{
 for(const width of [1440,393]){
  const context=await browser.newContext({viewport:{width,height:900}});
  const page=await context.newPage();
  try{
   const response=await page.goto(new URL('APP-Applications/responsive-test-studio/',base).href,{waitUntil:'domcontentloaded'});
   assert(response?.ok(),'CURRENT 0.4.3 responds at '+width);
   await page.locator('html[data-responsive-studio-ready="1"]').waitFor({timeout:15000});
   assert((await page.locator('.brand').textContent()).includes('CURRENT 0.4.3'),'correct CURRENT version '+width);
   const toggle=page.locator('[data-rt-url-toggle]'),popover=page.locator('[data-rt-url-fields]'),urlInput=page.locator('[data-rt-url]');
   await toggle.click();
   assert(await popover.isVisible(),'URL field opens '+width);
   const rect=await popover.boundingBox(),entry=await urlInput.boundingBox();
   assert(!!rect && !!entry,'URL and input have dimensions '+width);
   if(width>760){
    assert(rect.width>=770&&rect.width<=790,'URL edit window enlarged near 780px');
    assert(entry.width>=570,'URL text entry sufficiently wide for long path');
   }else{
    assert(rect.width<=width-30,'URL edit window adapted to mobile width');
    assert(rect.x>=0&&rect.x+rect.width<=width+1,'mobile popup fits the viewport');
   }
   await urlInput.fill('../image-studio/');
   await page.locator('[data-rt-load]').click();
   assert((await page.locator('[data-rt-frame]').getAttribute('src')).includes('/APP-Applications/image-studio/'),'URL navigation still works '+width);
   await page.locator('[data-rt-fullscreen]').click();
   assert(await page.evaluate(()=>document.fullscreenElement===document.querySelector('[data-rt-monitor]')),'fullscreen works '+width);
   await toggle.click();
   const fullRect=await popover.boundingBox();
   assert(!!fullRect && (width<=760?fullRect.width<=width-30:fullRect.width>=770),'wide editor remains usable fullscreen '+width);
   await urlInput.fill('../code-studio/');
   await page.locator('[data-rt-load]').click();
   assert(await page.evaluate(()=>document.fullscreenElement===document.querySelector('[data-rt-monitor]')),'load URL without leaving fullscreen '+width);
   assert((await page.locator('[data-rt-frame]').getAttribute('src')).includes('/APP-Applications/code-studio/'),'fullscreen target updates '+width);
   await page.locator('[data-rt-fullscreen]').click();
  }catch(error){errors.push({width,message:String(error.stack||error)})}finally{await context.close()}
 }
 const ctx=await browser.newContext(),page=await ctx.newPage();
 try{
  await page.goto(new URL('APP-Applications/responsive-test-studio/',base).href,{waitUntil:'domcontentloaded'});
  await page.locator('html[data-responsive-studio-ready="1"]').waitFor({timeout:15000});
  assert((await page.locator('.brand').textContent()).includes('CURRENT 0.4.3'),'CURRENT 0.4.3 published');
  const css=await page.locator('link[href="./versions/0.4.3/simulator.css"]').count();
  assert(css===1,'CURRENT uses pinned historical CSS');
 }catch(error){errors.push({width:'CURRENT',message:String(error.stack||error)})}finally{await ctx.close()}
}finally{await browser.close()}
console.log(JSON.stringify({checks,errors},null,2));
if(errors.length)process.exitCode=1;
