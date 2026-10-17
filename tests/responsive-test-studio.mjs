// Responsive Test Studio — real Chrome/Chromium CSS viewport acceptance.
// This intentionally does not claim Android OS, native permissions or UA emulation.
import {chromium} from 'playwright';
import fs from 'node:fs/promises';
const url=new URL('APP-Applications/responsive-test-studio/',process.env.NLAB_BASE_URL||'http://127.0.0.1:8770/').href;
const channel=process.env.NLAB_BROWSER_CHANNEL||undefined;
const browser=await chromium.launch({headless:true,...(channel?{channel}:{})});
const out='artifacts/responsive-test-studio';
await fs.mkdir(out,{recursive:true});
const checks=[],failures=[];
async function scenario(name,viewport,emulateTouch=false){
 const context=await browser.newContext({viewport,...(emulateTouch?{isMobile:true,hasTouch:true,deviceScaleFactor:3}: {})}),page=await context.newPage(),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 const pass=(label,ok)=>{if(!ok)throw Error(name+': '+label);checks.push(name+': '+label)};
 const frame=page.locator('[data-rt-frame]');
 const dimensions=()=>frame.evaluate(el=>({w:el.contentWindow.innerWidth,h:el.contentWindow.innerHeight}));
 const equals=async(w,h,label)=>{const d=await dimensions();pass(label,d.w===w&&d.h===h)};
 try{
  const res=await page.goto(url,{waitUntil:'domcontentloaded',timeout:60000});
  pass('page HTTP',res?.ok());
  await page.locator('html[data-responsive-studio-ready="1"]').waitFor({timeout:15000});
  await page.frameLocator('[data-rt-frame]').locator('body').waitFor({timeout:15000});
  pass('catalog Studio name',await page.locator('h1').textContent().then(x=>x.includes('Prévisualisez')));
  const panel=page.locator('[data-rt-panel]'),monitor=page.locator('[data-rt-monitor]');
  const compact=viewport.width<=760;
  pass('settings initial compact state',(await panel.getAttribute('data-collapsed'))===(compact?'true':'false'));
  if(compact)await page.locator('[data-rt-show-settings]').click();
  pass('floating controls expanded',(await panel.getAttribute('data-collapsed'))==='false');
  const rect=await panel.boundingBox(),area=await monitor.boundingBox();
  pass('floating panel over viewport',!!rect&&!!area&&rect.x>=area.x&&rect.y>=area.y&&rect.y<area.y+area.height);
  await page.locator('[data-rt-collapse]').click();
  pass('panel collapsible',(await panel.getAttribute('data-collapsed'))==='true');
  await page.locator('[data-rt-show-settings]').click();
  pass('panel can reopen',(await panel.getAttribute('data-collapsed'))==='false');
  await page.locator('[data-rt-device]').selectOption('tablet');
  await equals(768,1024,'tablet portrait');
  await page.locator('input[name="rt-orientation"][value="landscape"]').check();
  await equals(1024,768,'tablet landscape');
  await page.locator('[data-rt-device]').selectOption('phone');
  await equals(852,393,'phone landscape');
  await page.locator('input[name="rt-orientation"][value="portrait"]').check();
  await equals(393,852,'phone portrait');
  await page.locator('[data-rt-device]').selectOption('desktop');
  await page.locator('input[name="rt-orientation"][value="landscape"]').check();
  await equals(1440,900,'desktop landscape');
  await page.locator('[data-rt-width]').fill('420');
  await page.locator('[data-rt-height]').fill('880');
  await page.locator('[data-rt-height]').press('Tab');
  await equals(420,880,'custom 420x880');
  await page.locator('[data-rt-default]').click();
  pass('default saved',await page.locator('[data-rt-message]').textContent().then(x=>x.includes('enregistré')));
  await page.locator('[data-rt-scale]').selectOption('0.5');
  pass('scaled frame',await page.locator('[data-rt-frame-box]').evaluate(el=>getComputedStyle(el).transform.includes('0.5')));
  await page.screenshot({path:out+'/'+name+'.png',fullPage:true,animations:'disabled'});
  await page.reload({waitUntil:'domcontentloaded'});
  await page.locator('html[data-responsive-studio-ready="1"]').waitFor({timeout:15000});
  await equals(420,880,'default restored after reload');
  if((await panel.getAttribute('data-collapsed'))==='true')await page.locator('[data-rt-show-settings]').click();
  if(emulateTouch){
   const touch=await page.evaluate(()=>({points:navigator.maxTouchPoints,coarse:matchMedia('(pointer: coarse)').matches}));
   pass('touch emulation API exposure',touch.points>0); // pointer:coarse depends on headless host input devices
   await page.locator('[data-rt-device]').selectOption('phone');
   await page.locator('[data-rt-rotate]').tap();
   await equals(852,393,'tap rotation to phone landscape');
   await page.locator('[data-rt-rotate]').tap();
   await equals(393,852,'tap rotation to phone portrait');
   pass('emulation explicitly labelled',!!await page.locator('.rt-note').textContent().then(x=>x.includes('pas les API')));
  }
  await page.locator('[data-rt-url]').fill('javascript:alert(1)');
  await page.locator('[data-rt-load]').click();
  pass('javascript URL rejected',await page.locator('[data-rt-message]').textContent().then(x=>x.includes('HTTP(S)')));
  await page.locator('[data-rt-url]').fill('../image-studio/');
  await page.locator('[data-rt-load]').click();
  pass('local URL accepted',(await frame.getAttribute('src')).includes('/APP-Applications/image-studio/'));
  if(emulateTouch)await equals(393,852,'viewport preserved after changing URL');
  else await equals(420,880,'viewport preserved after changing URL');
  if(!compact){
    const head=page.locator('[data-rt-panel-head] strong'),before=await panel.boundingBox(),handle=await head.boundingBox();
    await page.mouse.move(handle.x+handle.width/2,handle.y+handle.height/2);
    await page.mouse.down();
    await page.mouse.move(handle.x+handle.width/2-45,handle.y+handle.height/2+22,{steps:5});
    await page.mouse.up();
    const after=await panel.boundingBox();
    pass('floating palette draggable',after.x<before.x-20);
  }
  const shellUrl=page.url();
  await page.locator('[data-rt-url]').fill('https://example.com/');
  await page.locator('[data-rt-load]').click();
  pass('external HTTP URL stays in iframe',(await frame.getAttribute('src'))==='https://example.com/'&&page.url()===shellUrl);
  const metrics=await page.evaluate(()=>({a:document.documentElement.scrollWidth,b:document.documentElement.clientWidth}));
  pass('no page horizontal overflow',metrics.a<=metrics.b+2);
  pass('no JS exception',!errors.length);
 }catch(error){failures.push({name,error:String(error?.stack||error),pageErrors:errors});await page.screenshot({path:out+'/'+name+'-failure.png',fullPage:true}).catch(()=>{})}
 finally{await context.close()}
}
try{await scenario('desktop',{width:1440,height:900});await scenario('mobile',{width:393,height:852});await scenario('touch-emulation',{width:393,height:852},true)}finally{await browser.close()}
await fs.writeFile(out+'/results.json',JSON.stringify({channel:channel||'chromium',checks,failures,not_android_emulation:true},null,2));
console.log(JSON.stringify({checks,failures},null,2));
if(failures.length)process.exitCode=1;
