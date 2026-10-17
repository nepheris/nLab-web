// Real iframe CSS viewport checks. Not Android OS / UA / touch hardware simulation.
import {chromium} from 'playwright';
import fs from 'node:fs/promises';
const base=process.env.NLAB_BASE_URL||'http://127.0.0.1:8770/';
const browser=await chromium.launch({headless:true,...(process.env.NLAB_BROWSER_CHANNEL?{channel:process.env.NLAB_BROWSER_CHANNEL}:{})});
await fs.mkdir('artifacts/core-lab',{recursive:true});
const checks=[],errors=[];
async function pass(label,condition){if(!condition)throw Error('responsive simulator: '+label);checks.push(label)}
for(const size of [{name:'desktop-host',width:1440,height:900},{name:'phone-host',width:393,height:852}]){
 const context=await browser.newContext({viewport:{width:size.width,height:size.height}});
 const page=await context.newPage();const pageErrors=[];page.on('pageerror',x=>pageErrors.push(x.message));
 try{
  const resp=await page.goto(new URL('APP-Applications/studio-core-lab/',base).href,{waitUntil:'domcontentloaded'});
  await pass(size.name+' HTTP OK',!!resp?.ok());
  await page.locator('html[data-responsive-simulator-ready="1"]').waitFor({timeout:20000});
  const iframe=page.frameLocator('[data-rs-frame]');
  await iframe.locator('html[data-core-lab-ready="1"]').waitFor({timeout:20000});
  await pass(size.name+' no nested simulator',await iframe.locator('#lab-responsive-area').isHidden());
  for(const [preset,w,h] of [['desktop',1440,900],['tablet',768,1024],['phone',393,852],['phoneSmall',360,800]]){
   await page.locator('[data-rs-preset="'+preset+'"]').click();
   const actual=await page.locator('[data-rs-frame]').evaluate(el=>({w:el.contentWindow.innerWidth,h:el.contentWindow.innerHeight}));
   await pass(size.name+' preset '+preset,actual.w===w&&actual.h===h);
  }
  await page.locator('[data-rs-rotate]').click();
  let actual=await page.locator('[data-rs-frame]').evaluate(el=>({w:el.contentWindow.innerWidth,h:el.contentWindow.innerHeight}));
  await pass(size.name+' portrait landscape rotation',actual.w===800&&actual.h===360);
  await page.locator('[data-rs-width]').fill('420');
  await page.locator('[data-rs-height]').fill('880');
  await page.locator('[data-rs-height]').press('Tab');
  actual=await page.locator('[data-rs-frame]').evaluate(el=>({w:el.contentWindow.innerWidth,h:el.contentWindow.innerHeight}));
  await pass(size.name+' custom 420x880',actual.w===420&&actual.h===880);
  await page.locator('[data-rs-zoom]').selectOption('0.5');
  const sc=await page.locator('[data-rs-device]').evaluate(el=>getComputedStyle(el).transform);
  await pass(size.name+' preview scale half',sc.includes('0.5'));
  await page.locator('[data-rs-grid]').check();
  await pass(size.name+' decorative grid',await page.locator('[data-rs-grid-overlay]').isVisible());
  await iframe.locator('#lab-demo').click();
  await iframe.locator('#studioInputPicker:not([hidden])').waitFor({timeout:10000});
  await iframe.locator('#studioInputConfirm').click();
  await iframe.locator('#lab-file-count').getByText('1 fichier sélectionné').waitFor({timeout:10000});
  await pass(size.name+' Core functions work inside frame',true);
  await page.screenshot({path:'artifacts/core-lab/responsive-'+size.name+'.png',fullPage:true,animations:'disabled'});
  const metrics=await page.evaluate(()=>({full:document.documentElement.scrollWidth,client:document.documentElement.clientWidth}));
  await pass(size.name+' no global horizontal overflow',metrics.full<=metrics.client+2);
  await pass(size.name+' no uncaught JS error',pageErrors.length===0);
 }catch(e){errors.push({host:size.name,message:String(e.stack||e)});await page.screenshot({path:'artifacts/core-lab/responsive-'+size.name+'-failure.png',fullPage:true}).catch(()=>{})}
 finally{await context.close()}
}
await browser.close();
await fs.writeFile('artifacts/core-lab/responsive-results.json',JSON.stringify({checks,errors,notes:'iframe CSS dimensions do not emulate Android hardware or UA'},null,2));
console.log(JSON.stringify({kind:'responsive-iframe-simulator',checks,errors},null,2));
if(errors.length)process.exitCode=1;
