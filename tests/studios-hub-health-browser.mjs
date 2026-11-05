import {chromium} from 'playwright';
import {mkdir} from 'node:fs/promises';

const base=process.env.NLAB_BASE_URL||'http://127.0.0.1:8779/';
const url=new URL('APP-Applications/studios/health.html',base).href;
const browser=await chromium.launch({headless:true});
const assertions=[];
function check(value,label){if(!value)throw new Error(label);assertions.push(label)}
try{
 for(const [name,width,height] of [['desktop',1440,900],['mobile',393,850]]){
  const page=await browser.newPage({viewport:{width,height}}),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  try{
   const response=await page.goto(url,{waitUntil:'domcontentloaded',timeout:30000});
   check(response?.ok(),name+': health dashboard HTTP');
   await page.waitForFunction(()=>document.querySelector('#healthMessage')?.textContent?.includes('résultat(s)'),null,{timeout:15000});
   const catalog=await (await page.request.get(new URL('APP-Applications/studios/catalog.json',base).href)).json();
   const expected=(catalog.studios?.length||0)+(catalog.derived_apps?.length||0)+1;
   check((await page.locator('#healthRows tr').count())===expected,name+': canonical Studio rows + standalone Core Lab');
   check((await page.locator('#healthNumbers .healthMetric').count())===4,name+': KPI dashboard');
   const values=await page.locator('#healthNumbers .healthMetric strong').allTextContents();
   check(Number(values[0])===expected-1,name+': Studios/apps count excludes Core Lab');
   check(Number(values[1])>=expected-1,name+': declared version count not present');
   check(await page.locator('.nlab-logo img[alt="nLab"]').count()===1,name+': original branding');
   check(await page.locator('a[href*="/studio-core-test/"]').count()>=1,name+': Core Lab navigation');
   await page.locator('#healthSearch').fill('image-studio');
   check((await page.locator('#healthRows tr').count())===1,name+': search one Studio');
   await page.locator('#healthSearch').fill('');
   await page.locator('#healthFilter').selectOption('issue');
   check((await page.locator('#healthRows').textContent()).includes('Aucun Studio'),name+': no missing registries');
   await page.locator('#healthFilter').selectOption('test');
   check((await page.locator('#healthRows').textContent()).includes('Core Test Lab'),name+': test filter includes Core Lab');
   await page.locator('#healthFilter').selectOption('current');
   check(!(await page.locator('#healthRows').textContent()).includes('Core Test Lab'),name+': Core Lab is never CURRENT');
   await page.locator('#healthFilter').selectOption('all');
   check(!errors.length,name+': no JavaScript exceptions '+errors.join('; '));
   await mkdir('artifacts/studios-health',{recursive:true});
   await page.screenshot({path:'artifacts/studios-health/hub-'+name+'.png',fullPage:true});
  }finally{await page.close()}
 }
 console.log(JSON.stringify({ok:true,assertions:assertions.length,checks:assertions},null,2));
}finally{await browser.close()}
