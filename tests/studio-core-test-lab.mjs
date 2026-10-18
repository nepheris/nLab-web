// Studio Core Test Lab — validation navigateur du vrai Core partagé.
import {chromium} from 'playwright';
const base=process.env.NLAB_BASE_URL||'http://127.0.0.1:8770/';
const browser=await chromium.launch({headless:true,...(process.env.NLAB_BROWSER_CHANNEL?{channel:process.env.NLAB_BROWSER_CHANNEL}:{})});
const reports=[];
function assert(value,label){if(!value)throw Error(label);}
async function scenario(name,viewport){
 const context=await browser.newContext({viewport});
 const page=await context.newPage();
 const errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 try{
  const response=await page.goto(new URL('APP-Applications/studio-core-test/',base).href,{waitUntil:'domcontentloaded',timeout:45000});
  assert(response?.ok(),name+': HTML unavailable');
  await page.locator('html[data-core-lab-ready="1"]').waitFor({timeout:35000});
  await page.locator('html[data-core-lab-checks="pass"]').waitFor({timeout:15000});
  assert((await page.locator('#labCheckList li.pass').count())===11,name+': 11 checks should pass');
  assert(await page.locator('.studioLogo img').count()===1,name+': Core nLab logo absent');
  assert(await page.locator('[data-studio-action="core.fullscreen"]').count()===1,name+': fullscreen missing');
  const app=page.locator('[data-studio-action="core.app-mode"]');
  assert(await app.count()===1,name+': PWA Core command missing');
  assert(['browser','installable','standalone'].includes(await app.getAttribute('data-app-mode')),name+': PWA state invalid');
  const resp=await page.locator('#labResponsiveLink').getAttribute('href');
  assert(resp.includes('responsive-test-studio/')&&resp.includes('url='),name+': responsive launcher URL invalid');
  await page.locator('#labItemName').fill('Échantillon modifié');
  await page.locator('#labCommit').click();
  assert((await page.locator('#labHistory').textContent()).includes('1 action'),name+': no transaction');
  // On mobile the Core uses a reduced ribbon; use its own dock to expose actions.
  if(viewport.width<=700)await page.locator('[data-mobile-action="ribbon"]').click();
  await page.locator('[data-studio-action="core.undo"]').click();
  assert(await page.locator('#labItemName').inputValue()==='Composant de démonstration nLab',name+': undo failed');
  await page.locator('[data-studio-action="core.redo"]').click();
  assert(await page.locator('#labItemName').inputValue()==='Échantillon modifié',name+': redo failed');
  await page.locator('#labOpenSettings').click();
  assert(await page.locator('#studioCoreSettingsPanel').isVisible(),name+': Core settings not opened');
  await page.locator('#studioCoreSettingsClose').click();
  if(viewport.width>1000){
   const button=page.locator('[data-studio-action="core.fullscreen"]');
   await button.click();
   assert(await page.evaluate(()=>document.fullscreenElement===document.documentElement),name+': fullscreen did not enter');
   await page.keyboard.press('Escape');
   await page.waitForFunction(()=>document.fullscreenElement===null,null,{timeout:6500});
  }else{
   assert((await page.locator('body').getAttribute('data-responsive-profile'))==='mobile',name+': Core responsive profile incorrect');
  }
  assert(errors.length===0,name+': page errors '+errors.join('; '));
  reports.push({name,status:'PASS',checks:11});
 }catch(error){
  reports.push({name,status:'FAIL',error:String(error?.stack||error),browserErrors:errors});
 }finally{await context.close();}
}
try{
 await scenario('desktop',{width:1440,height:900});
 await scenario('mobile',{width:393,height:852});
}finally{await browser.close()}
console.log(JSON.stringify(reports,null,2));
if(reports.some(r=>r.status!=='PASS'))process.exitCode=1;
