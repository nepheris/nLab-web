// Shared fullscreen regression: the same Core controller powers Responsive and Studio V2.
import {chromium} from 'playwright';
import fs from 'node:fs/promises';
const base=process.env.NLAB_BASE_URL||'http://127.0.0.1:8770/';
const browser=await chromium.launch({headless:true,...(process.env.NLAB_BROWSER_CHANNEL?{channel:process.env.NLAB_BROWSER_CHANNEL}:{})});
const checks=[],errors=[];
const check=(value,label)=>{if(!value)throw Error(label);checks.push(label)};
async function scenario(name,path,{mobile=false,core=false}={}){
 const context=await browser.newContext({viewport:mobile?{width:393,height:852}:{width:1440,height:900}});
 const page=await context.newPage();const pageErrors=[];
 page.on('pageerror',e=>pageErrors.push(e.message));
 try{
  const res=await page.goto(new URL(path,base).href,{waitUntil:'domcontentloaded',timeout:45000});
  check(res?.ok(),name+': page loaded');
  if(core)await page.locator('[data-studio-action="core.fullscreen"]').waitFor({state:'attached',timeout:20000});
  else await page.locator('html[data-responsive-studio-ready="1"]').waitFor({timeout:15000});
  const button=page.locator(core?'[data-studio-action="core.fullscreen"]':'[data-rt-fullscreen]');
  const target=core?'html':'[data-rt-monitor]';
  check(await button.getAttribute('aria-pressed')==='false',name+': initial aria-pressed false');
  const source=await page.evaluate(async()=>{
   const r=await fetch(new URL('APP-Applications/_shared/studio-v2/fullscreen-service.js',document.baseURI));
   return r.ok;
  });
  check(source,name+': shared Core controller available');
  await button.click();
  check(await page.evaluate(sel=>document.fullscreenElement===document.querySelector(sel),target),name+': enters target fullscreen');
  check(await button.getAttribute('aria-pressed')==='true',name+': button is pressed in fullscreen');
  check((await button.textContent()).includes('Quitter plein écran'),name+': exit label visible');
  if(!core){
   check(await page.locator('[data-rt-url-toggle]').isVisible(),name+': fullscreen URL editor remains available');
   await page.locator('[data-rt-url-toggle]').click();
   check(await page.locator('[data-rt-url-fields]').isVisible(),name+': URL editable while fullscreen');
   await page.locator('[data-rt-url-toggle]').click();
  }
  await button.click();
  check(await page.evaluate(()=>document.fullscreenElement===null),name+': exits fullscreen through same button');
  check(await button.getAttribute('aria-pressed')==='false',name+': restored button state');
  await button.click();
  await page.keyboard.press('Escape');
  await page.waitForFunction(()=>document.fullscreenElement===null,{timeout:6000});
  check(await button.getAttribute('aria-pressed')==='false',name+': Escape restores UI state');
  if(core){
   const label=button.locator('.ribbonBtnLabel');
   check(await label.count()===1&&await button.locator('.scopeIcon').count()===1,name+': Core ribbon icon and label preserved');
   check(await page.evaluate(()=>window.NLABStudioCommands?.get('core.fullscreen')?.status==='stable'),name+': Core command registered');
   await page.evaluate(()=>window.NLABStudioCommands.execute('core.fullscreen',{source:'test'}));
   check(await page.evaluate(()=>document.fullscreenElement===document.documentElement),name+': Ctrl+K command enters fullscreen');
   await page.evaluate(()=>window.NLABStudioCommands.execute('core.fullscreen',{source:'test'}));
   check(await page.evaluate(()=>document.fullscreenElement===null),name+': Ctrl+K command exits fullscreen');
  }
  check(pageErrors.length===0,name+': no browser errors: '+pageErrors.join('; '));
 }catch(e){errors.push({name,error:String(e?.stack||e),pageErrors});}
 finally{await context.close()}
}
try{
 await scenario('Responsive CURRENT 0.4.3 desktop','APP-Applications/responsive-test-studio/');
 await scenario('Responsive CURRENT 0.4.3 mobile','APP-Applications/responsive-test-studio/',{mobile:true});
 await scenario('Document Studio V2','APP-Applications/document-studio/v2/?channel=current',{core:true});
 await scenario('Scan Studio V2','APP-Applications/scan-studio/v2/?channel=current',{core:true});
 await scenario('QR Barcode Studio V2','APP-Applications/qr-barcode-studio/v2/?channel=current',{core:true});
}finally{await browser.close()}
await fs.mkdir('artifacts/responsive-test-studio',{recursive:true});
await fs.writeFile('artifacts/responsive-test-studio/fullscreen-core.json',JSON.stringify({checks,errors},null,2));
console.log(JSON.stringify({checks,errors},null,2));
if(errors.length)process.exitCode=1;
