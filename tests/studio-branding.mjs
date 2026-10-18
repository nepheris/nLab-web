// nLab: logo/home navigation contract across Studio Core V2 and active standalone Studios.
import {chromium} from 'playwright';
import fs from 'node:fs/promises';
const base=process.env.NLAB_BASE_URL||'http://127.0.0.1:8770/';
const browser=await chromium.launch({headless:true,...(process.env.NLAB_BROWSER_CHANNEL?{channel:process.env.NLAB_BROWSER_CHANNEL}:{})});
const checks=[],failures=[];
const check=(ok,label)=>{if(!ok)throw Error(label);checks.push(label)};
async function smoke(label,relative,selector,{mobile=false}={}){
 const ctx=await browser.newContext({viewport:mobile?{width:390,height:844}:{width:1320,height:820}});
 const page=await ctx.newPage();
 try{
  const response=await page.goto(new URL(relative,base).href,{waitUntil:'domcontentloaded',timeout:45000});
  check(response?.ok(),label+': page responds');
  const anchor=page.locator(selector);
  await anchor.waitFor({state:'visible',timeout:25000});
  const img=anchor.locator('img[alt="nLab"]');
  check(await img.count()===1,label+': official logo inside a link');
  const values=await anchor.evaluate(el=>({href:el.href,src:el.querySelector('img')?.src,visibility:getComputedStyle(el).display}));
  const home=new URL(base);
  check(new URL(values.href).pathname===home.pathname,label+': logo links to nLab homepage');
  check(values.src.includes('/assets/branding/nlab-wordmark.svg'),label+': uses shared nLab SVG');
  check((await img.evaluate(x=>x.naturalWidth))>0,label+': logo asset loads');
  if(label.includes('Responsive CURRENT')){
   check((await page.locator('.brand').textContent()).includes('CURRENT 0.4.3'),label+': release label');
   check(await page.locator('link[rel="manifest"]').count()===1,label+': desktop web app manifest');
  }
  if(label.includes('Core V2')){
   check(await page.locator('[data-studio-action="core.responsive-test"]').count()===1,label+': shared responsive command');
  }
  if(label==='Core V2 · Document'){
   const button=page.locator('[data-studio-action="core.responsive-test"]');
   await button.click();
   await page.waitForURL('**/responsive-test-studio/?url=*',{timeout:15000});
   check(new URL(page.url()).searchParams.get('url')?.includes('/document-studio/v2/'),label+': transmits origin URL to shared tester');
   await page.locator('html[data-responsive-studio-ready="1"]').waitFor({timeout:15000});
   check((await page.locator('[data-rt-frame]').getAttribute('src'))?.includes('/document-studio/v2/'),label+': iframe opens original Studio');
  }
 }catch(error){failures.push({label,message:String(error?.stack||error)})}
 finally{await ctx.close()}
}
try{
 const root='APP-Applications/responsive-test-studio/';
 const registry=JSON.parse(await fs.readFile(root+'versions.json','utf8'));
 check(registry.current==='0.4.3'&&registry.test===null,'registry promotes approved 0.4.3');
 const manifest=JSON.parse(await fs.readFile(root+'manifest.webmanifest','utf8'));
 check(manifest.display==='standalone'&&manifest.start_url==='./'&&manifest.scope==='./','desktop standalone manifest valid');
 const catalog=JSON.parse(await fs.readFile('APP-Applications/studios/catalog.json','utf8'));
 check(catalog.studios.length===15,'catalogue includes all 15 Studios');
 const frame=await fs.readFile('APP-Applications/_shared/studio-v2/frame.js','utf8');
 check(frame.includes("new URL('../../../',import.meta.url).href")&&frame.includes('NLAB_WORDMARK')&&frame.includes('aria-label="Retour à l’accueil nLab"'),'Core V2 owns canonical logo and homepage URL');
 const missing=[];
 for(const entry of catalog.studios){
  if(entry.id==='responsive-test-studio')continue;
  if(entry.id==='pdf-studio'){
   const landing=await fs.readFile('APP-Applications/pdf-studio/index.html','utf8');
   check(landing.includes('nlab-wordmark.svg')&&landing.includes('href="../../"'),'PDF Studio landing uses official linked wordmark');
   continue;
  }
  if(entry.id==='demo-studio'){
   const demo=await fs.readFile('Library/demo/index.html','utf8');
   check(demo.includes('nlab-wordmark.svg')&&demo.includes('href="../../"'),'Demo Studio destination includes official linked wordmark');
   continue;
  }
  const main='APP-Applications/'+entry.id+'/v2/index.html';
  const html=await fs.readFile(main,'utf8');
  if(!html.includes('studio-v2/')&&!html.includes('v2/v2-app.js'))missing.push(entry.id);
 }
 check(missing.length===0,'all active non-legacy Studio entrypoints connect to shared V2 Core: '+missing.join(','));
 const responsive=await fs.readFile(root+'index.html','utf8');
 const versions=await fs.readFile(root+'versions.html','utf8');
 check(responsive.includes('nlab-home-link')&&versions.includes('nlab-home-link'),'responsive CURRENT and versions have official homepage link');
 await smoke('Responsive CURRENT desktop','APP-Applications/responsive-test-studio/','a.nlab-home-link');
 await smoke('Responsive CURRENT mobile','APP-Applications/responsive-test-studio/','a.nlab-home-link',{mobile:true});
 await smoke('Responsive versions','APP-Applications/responsive-test-studio/versions.html','a.nlab-home-link');
 await smoke('Core V2 · Document','APP-Applications/document-studio/v2/?channel=current','a.studioLogo');
 await smoke('Core V2 · Scan','APP-Applications/scan-studio/v2/?channel=current','a.studioLogo');
 await smoke('Core V2 · Merge','APP-Applications/merge-studio/v1/','a.studioLogo');
 await smoke('PDF landing','APP-Applications/pdf-studio/','a.nlab-logo');
 await smoke('Demo destination','Library/demo/','a.nlab-logo');
}finally{await browser.close()}
console.log(JSON.stringify({checks,failures},null,2));
if(failures.length)process.exitCode=1;
