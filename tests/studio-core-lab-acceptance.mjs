// Visual Core Lab checks for Linux Chrome/Chromium and mobile touch emulation.
// NOTE: touch emulation is NOT a real Android Chrome certification.
import {chromium} from 'playwright';
import fs from 'node:fs/promises';
const base=process.env.NLAB_BASE_URL||'http://127.0.0.1:8770/';
const channel=process.env.NLAB_BROWSER_CHANNEL||undefined;
const browser=await chromium.launch({headless:true,...(channel?{channel}:{})});
const output='artifacts/core-lab';
await fs.mkdir(output,{recursive:true});
const checks=[],errors=[];
async function scenario(name,contextOptions){
 const context=await browser.newContext(contextOptions),page=await context.newPage();
 const failures=[];page.on('pageerror',e=>failures.push(e.message));
 try{
  const resp=await page.goto(new URL('APP-Applications/studio-core-lab/',base).href,{waitUntil:'networkidle',timeout:60000});
  if(!resp?.ok())throw Error('HTTP '+resp?.status());
  await page.locator('html[data-core-lab-ready="1"]').waitFor({timeout:20000});
  const assert=(condition,label)=>{if(!condition)throw Error(name+': '+label)};
  assert(await page.locator('#lab-picker').isVisible(),'picker button not visible');
  const initial=await page.locator('#lab-status').textContent();
  assert(initial.includes('prêt'),'Core UI not initialized: '+initial);
  const size=await page.evaluate(()=>({scroll:document.documentElement.scrollWidth,client:document.documentElement.clientWidth}));
  assert(size.scroll<=size.client+2,'horizontal overflow '+JSON.stringify(size));
  checks.push(name+':layout');
  await page.screenshot({path:output+'/'+name+'-initial.png',fullPage:true,animations:'disabled'});
  // The parent mobile dock intentionally hides while the simulator is open;
  // collapse the viewport test panel before exercising the normal Core mobile dock.
  if(name.startsWith('mobile')){
   await page.locator('#lab-simulator-panel summary').click();
   assert(await page.locator('#lab-simulator-panel').getAttribute('open')===null,'simulator did not collapse');
  }
  await page.locator('#lab-demo').click();
  await page.locator('#studioInputPicker:not([hidden])').waitFor({timeout:12000});
  assert(await page.locator('#studioInputPicker [data-input-item]').count()===1,'demo not imported into native picker');
  await page.locator('#studioInputConfirm').click();
  await page.locator('#lab-file-count').getByText('1 fichier sélectionné').waitFor({timeout:10000});
  checks.push(name+':input-picker');
  await page.locator('[data-color-hex]').fill('#C05621');
  await page.locator('[data-color-hex]').dispatchEvent('change');
  assert(await page.locator('#lab-preview').evaluate(e=>getComputedStyle(e).borderColor)==='rgb(192, 86, 33)','color not applied');
  await page.locator('#lab-undo').click();
  assert(await page.locator('[data-color-hex]').inputValue()==='#316D9A','undo did not restore color');
  await page.locator('#lab-redo').click();
  assert(await page.locator('[data-color-hex]').inputValue()==='#C05621','redo did not restore color');
  checks.push(name+':color-undo-redo');
  await page.locator('[data-viewer-plus]').click();
  assert((await page.locator('#lab-preview').getAttribute('style')).includes('scale(1.25)'),'viewer zoom not reflected');
  await page.locator('[data-viewer-fit]').click();
  assert((await page.locator('#lab-preview').getAttribute('style')).includes('scale(1)'),'viewer fit not reflected');
  checks.push(name+':viewer');
  await page.locator('#lab-window-button').click();
  await page.locator('#lab-floating-window:not([hidden])').waitFor({timeout:10000});
  await page.locator('#lab-close-window').click();
  await page.locator('#lab-window-button').click();
  assert(await page.locator('#lab-floating-window').isVisible(),'window restoration failed');
  checks.push(name+':window');
  if(name.startsWith('mobile')){
   await page.locator('#lab-layout').selectOption('compact');
   assert(await page.locator('.lab-bottom').isVisible(),'touch toolbar hidden');
   const touch=await page.locator('.lab-bottom button').first().evaluate(e=>{const r=e.getBoundingClientRect();return {w:r.width,h:r.height}});
   assert(touch.w>=44&&touch.h>=44,'touch target too small: '+JSON.stringify(touch));
   await page.locator('#lab-layout').selectOption('compact');
   assert(await page.locator('body').getAttribute('data-layout')==='compact','compact mode not selected');
   await page.reload({waitUntil:'networkidle'});
   await page.locator('html[data-core-lab-ready="1"]').waitFor();
   assert(await page.locator('#lab-layout').inputValue()==='compact','compact setting not persisted');
   checks.push(name+':touch-and-persistence');
  }else{
   await page.locator('#lab-layout').selectOption('desktop');
   assert(await page.locator('body').getAttribute('data-layout')==='desktop','desktop mode not selected');
   checks.push(name+':desktop-mode');
  }
  await page.screenshot({path:output+'/'+name+'.png',fullPage:true,animations:'disabled'});
  assert(!failures.length,'uncaught JS errors: '+failures.join('; '));
 }catch(e){errors.push({scenario:name,message:String(e.stack||e)});await page.screenshot({path:output+'/'+name+'-failure.png',fullPage:true}).catch(()=>{});}
 finally{await context.close()}
}
try{
 await scenario('desktop',{viewport:{width:1366,height:850},deviceScaleFactor:1});
 await scenario('mobile',{viewport:{width:393,height:852},deviceScaleFactor:2,isMobile:true,hasTouch:true});
 await scenario('mobile-small',{viewport:{width:360,height:800},deviceScaleFactor:2,isMobile:true,hasTouch:true});
 await scenario('mobile-landscape',{viewport:{width:844,height:390},deviceScaleFactor:2,isMobile:true,hasTouch:true});
}finally{await browser.close()}
await fs.writeFile(output+'/results.json',JSON.stringify({browser:channel||'chromium',checks,errors,mobile_is_emulation:true},null,2));
console.log(JSON.stringify({kind:'core-lab-visual-acceptance',browser:channel||'chromium',checks,errors},null,2));
if(errors.length)process.exitCode=1;
