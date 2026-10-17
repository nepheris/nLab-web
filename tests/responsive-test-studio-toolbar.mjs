// Acceptance tests for the separate 0.4.1 TEST toolbar; 0.4.0 CURRENT is validated independently.
import {chromium} from 'playwright';
import fs from 'node:fs/promises';
const base=process.env.NLAB_BASE_URL||'http://127.0.0.1:8770/';
const origin=new URL(base);
const url=new URL('APP-Applications/responsive-test-studio/test/',base).href;
const browser=await chromium.launch({headless:true,...(process.env.NLAB_BROWSER_CHANNEL?{channel:process.env.NLAB_BROWSER_CHANNEL}:{})});
const out='artifacts/responsive-test-studio';
await fs.mkdir(out,{recursive:true});
const checks=[],failures=[];
async function run(name,viewport,emulateTouch=false){
 const context=await browser.newContext({viewport,...(emulateTouch?{isMobile:true,hasTouch:true,deviceScaleFactor:3}:{})});
 const page=await context.newPage(),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 const pass=(label,ok)=>{if(!ok)throw Error(name+': '+label);checks.push(name+': '+label)};
 try{
  const res=await page.goto(url,{waitUntil:'domcontentloaded',timeout:40000});
  pass('TEST page served',res?.ok());
  await page.locator('html[data-responsive-studio-ready="1"]').waitFor({timeout:15000});
  const monitor=page.locator('[data-rt-monitor]');
  pass('version 0.4.1 correctly labelled',await page.locator('.brand').textContent().then(x=>x.includes('TEST 0.4.1')));
  pass('one viewport integrated toolbar',await monitor.locator('[data-rt-monitor-header]').count()===1 && await page.locator('[data-rt-address-bar]').count()===1 && await monitor.locator('[data-rt-address-bar]').count()===1);
  pass('one settings button',await monitor.locator('[data-rt-show-settings]').count()===1&&await monitor.locator('[data-rt-full-settings]').count()===1);
  pass('toolbar commands in viewport',await monitor.locator('[data-rt-reload],[data-rt-open],[data-rt-dual],[data-rt-fullscreen]').count()===4);
  pass('URL editor hidden initially',await page.locator('[data-rt-address-bar]').getAttribute('data-collapsed')==='true'&&await page.locator('[data-rt-url-fields]').isHidden());
  pass('current URL readable collapsed',await page.locator('[data-rt-url-summary]').textContent().then(x=>x.includes('/APP-Applications/studios/')));
  await page.locator('[data-rt-url-toggle]').click();
  pass('URL editor opened',await page.locator('[data-rt-url-fields]').isVisible()&&await page.locator('[data-rt-url-toggle]').getAttribute('aria-expanded')==='true');
  await page.locator('[data-rt-url]').fill('../../image-studio/');
  await page.locator('[data-rt-load]').click();
  pass('URL load stays in iframe',await page.locator('[data-rt-frame]').getAttribute('src').then(x=>x.includes('/APP-Applications/image-studio/')));
  pass('URL editor auto-closes on successful load',await page.locator('[data-rt-url-fields]').isHidden());
  const settings=page.locator('[data-rt-panel]');
  if(await settings.getAttribute('data-collapsed')==='true')await page.locator('[data-rt-show-settings]').click();
  pass('theme palette unchanged',await settings.locator('[data-rt-theme]').count()===3);
  await page.locator('[data-rt-family="tablet"]').click();
  pass('tablet presets preserved',await page.locator('[data-rt-resolution] option').count()===6);
  await page.locator('[data-rt-family="mobile"]').click();
  pass('mobile presets preserved',await page.locator('[data-rt-resolution] option').count()===9);
  await page.locator('[data-rt-dual]').click();
  pass('dual iframe preserved',await page.locator('[data-rt-stage-secondary]').isVisible());
  await page.locator('[data-rt-dual]').click();
  pass('single iframe restored',await page.locator('[data-rt-stage-secondary]').isHidden());
  await page.locator('[data-rt-fullscreen]').click();
  pass('fullscreen includes toolbar',await page.evaluate(()=>document.fullscreenElement===document.querySelector('[data-rt-monitor]')&&document.fullscreenElement.contains(document.querySelector('[data-rt-url-toggle]'))));
  pass('URL button visible in fullscreen',await page.locator('[data-rt-url-toggle]').isVisible());
  await page.locator('[data-rt-url-toggle]').click();
  pass('fullscreen URL editor available',await page.locator('[data-rt-url]').isVisible());
  await page.locator('[data-rt-url]').fill('../../code-studio/');
  await page.locator('[data-rt-load]').click();
  pass('switch URL without exiting fullscreen',await page.evaluate(()=>document.fullscreenElement===document.querySelector('[data-rt-monitor]')) && await page.locator('[data-rt-frame]').getAttribute('src').then(x=>x.includes('/APP-Applications/code-studio/')));
  await page.locator('[data-rt-reload]').click();
  pass('reload command remains available fullscreen',await page.locator('[data-rt-reload]').isVisible());
  await page.locator('[data-rt-fullscreen]').click();
  pass('fullscreen exited',await page.evaluate(()=>document.fullscreenElement===null));
  pass('no page exception',errors.length===0);
  const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>document.documentElement.clientWidth+2);
  pass('no page horizontal overflow',!overflow);
  await page.screenshot({path:out+'/'+name+'-toolbar-041.png',fullPage:true,animations:'disabled'});
 }catch(error){
  failures.push({name,error:String(error?.stack||error),pageErrors:errors});
  await page.screenshot({path:out+'/'+name+'-toolbar-041-fail.png',fullPage:true}).catch(()=>{});
 }finally{await context.close()}
}
try{
 await run('desktop-041',{width:1440,height:900});
 await run('mobile-041',{width:393,height:852});
 await run('touch-041',{width:393,height:852},true);
 const context=await browser.newContext({viewport:{width:1250,height:820}}),page=await context.newPage();
 try{
  const res=await page.goto(new URL('APP-Applications/responsive-test-studio/',base).href,{waitUntil:'domcontentloaded',timeout:30000});
  if(!res?.ok())throw Error('CURRENT route unavailable');
  await page.locator('html[data-responsive-studio-ready="1"]').waitFor({timeout:12000});
  if(!await page.locator('.brand').textContent().then(x=>x.includes('CURRENT 0.4.0')))throw Error('Wrong CURRENT label');
  if(!await page.locator('[data-rt-address-bar]').evaluate(x=>x.parentElement.matches('[data-rt-workspace]')))throw Error('CURRENT toolbar was moved');
  if(!await page.locator('link[href="./versions/0.4.0/simulator.css"]').count())throw Error('CURRENT CSS not pinned');
  if(!await page.locator('[data-rt-frame]').isVisible())throw Error('CURRENT viewport failed');
  checks.push('current-040: root remains approved version, separate CSS and original URL toolbar');
 }catch(error){failures.push({name:'current-040',error:String(error)})}
 finally{await context.close()}
}finally{await browser.close()}
console.log(JSON.stringify({checks,failures},null,2));
await fs.writeFile(out+'/results-041.json',JSON.stringify({checks,failures},null,2));
if(failures.length)process.exitCode=1;
