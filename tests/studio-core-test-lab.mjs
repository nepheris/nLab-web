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
  assert((await page.locator('#labCheckList li.pass').count())===14,name+': 14 checks should pass');
  assert(await page.locator('.studioLogo img').count()===1,name+': Core nLab logo absent');
  assert(await page.locator('[data-studio-action="core.fullscreen"]').count()===1,name+': fullscreen missing');
  const app=page.locator('[data-studio-action="core.app-mode"]');
  assert(await app.count()===1,name+': PWA Core command missing');
  assert(['browser','installable','standalone'].includes(await app.getAttribute('data-app-mode')),name+': PWA state invalid');
  await page.locator('#labPickerOpen').click();
  await page.locator('#studioInputPicker').waitFor({state:'visible',timeout:12000});
  await page.locator('#studioInputFilesNative').setInputFiles({name:'core-test-fixture.txt',mimeType:'text/plain',buffer:Buffer.from('nLab TEST fixture')});
  await page.locator('#studioInputConfirm').click();
  await page.locator('#labPickedFiles li').first().waitFor({timeout:12000});
  assert((await page.locator('#labPickedFiles').textContent()).includes('core-test-fixture.txt'),name+': input-picker selection not returned');
  await page.locator('#labCollection .collectionItem').first().waitFor({timeout:12000});
  const initial=await page.locator('#labThumbSize').textContent();
  assert(initial==='Auto',name+': auto-fit should be default');
  await page.locator('#labThumbPlus').click();
  assert(/px/.test(await page.locator('#labThumbSize').textContent()),name+': thumbnail zoom + did not change size');
  const grown=await page.locator('#labThumbSize').textContent();
  await page.locator('#labThumbMinus').click();
  assert((await page.locator('#labThumbSize').textContent())!==grown,name+': thumbnail zoom - did not change size');
  await page.locator('#labThumbAuto').click();
  assert((await page.locator('#labThumbSize').textContent())==='Auto',name+': auto-fit reset missing');
  await page.locator('#labViewList').click();
  assert(await page.locator('#labCollection').evaluate(el=>el.classList.contains('collection-list')),name+': list view missing');
  await page.locator('#labViewThumbs').click();
  assert(await page.locator('#labCollection').evaluate(el=>el.classList.contains('collection-thumbs')),name+': thumbnail view missing');
  await page.locator('#labCollection .collectionThumbTools [data-collection-rotate="90"]').first().click({force:true});
  assert(await page.locator('#labCollection .collectionThumbMedia').first().evaluate(el=>el.style.getPropertyValue('--collection-item-rotation'))==='90deg',name+': thumbnail +90 rotation failed');
  assert(await page.evaluate(()=>window.NLABStudioUndoRedo?.get?.().undoDepth>=1),name+': thumbnail rotation missing undo transaction');
  await page.locator('#labFilesNative').setInputFiles([{name:'image-1.svg',mimeType:'image/svg+xml',buffer:Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" width="60" height="60"><rect width="60" height="60" fill="#00f"/></svg>')},{name:'image-2.svg',mimeType:'image/svg+xml',buffer:Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" width="60" height="60"><rect width="60" height="60" fill="#f00"/></svg>')}]);
  assert((await page.locator('#labCollection .collectionItem').count())===3,name+': multi-file collection expected three items');
  await page.locator('#labSelectAllFiles').click();
  assert((await page.locator('#labCollection input[data-collection-select]:checked').count())===3,name+': select all failed');
  await page.locator('#labInvertFiles').click();
  assert((await page.locator('#labCollection input[data-collection-select]:checked').count())===0,name+': invert selection failed');

  const resp=await page.locator('#labResponsiveLink').getAttribute('href');
  assert(resp.includes('responsive-test-studio/')&&resp.includes('url='),name+': responsive launcher URL invalid');
  await page.locator('#labItemName').fill('Échantillon modifié');
  await page.locator('#labCommit').click();
  assert(await page.evaluate(()=>window.NLABStudioUndoRedo?.get?.().undoDepth>=1),name+': no transaction');
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
  reports.push({name,status:'PASS',checks:14});
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
