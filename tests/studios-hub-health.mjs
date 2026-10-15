// H06/H07/H08 — lightweight Hub acceptance, no account data or production writes.
export async function checkStudiosHubHealth(browser,base){
 const page=await browser.newPage({viewport:{width:1360,height:900}});
 const faults=[],checked=[];
 const hubUrl=new URL('APP-Applications/studios/',base).href,origin=new URL(base).origin;
 page.on('pageerror',e=>faults.push('JS '+e.message));
 page.on('response',r=>{
  if(r.status()>=400&&new URL(r.url()).origin===origin){
   const pathname=new URL(r.url()).pathname;
   if(!pathname.endsWith('/build.json'))faults.push('HTTP '+r.status()+' '+r.url());
  }
 });
 page.on('requestfailed',r=>{
  if(new URL(r.url()).origin===origin)faults.push('NETWORK '+r.url()+' '+(r.failure()?.errorText||'unknown'));
 });
 const verify=(condition,message)=>{if(!condition)throw Error('Hub Studios H06/H07/H08: '+message)};
 try{
  const response=await page.goto(hubUrl,{waitUntil:'domcontentloaded',timeout:60000});
  verify(response?.ok(),'Hub HTML failed to load');
  await page.locator('#studioGrid .card').first().waitFor({state:'visible',timeout:20000});
  await page.locator('#derivedGrid .card').first().waitFor({state:'visible',timeout:20000});
  await page.locator('#developmentGrid .devCard').first().waitFor({state:'visible',timeout:20000});
  const initial=await page.locator('#studioGrid .card').count();
  verify(initial>=10,'Studio catalogue incomplete: '+initial);
  const href=await page.locator('#studioGrid .card a.nlab-btn.primary').first().getAttribute('href');
  verify(!!href,'missing Studio opening link');
  for(const mode of ['cards','tiles','list','table']){
   const button=page.locator('.nlcatalog-toolbar [data-nlcatalog-view="'+mode+'"]').first();
   await button.waitFor({state:'visible',timeout:10000});
   await button.click();
   const snapshot=await page.evaluate(()=>({
    stored:localStorage.getItem('nlab:catalogue:view:v1'),
    all:['studioGrid','derivedGrid','developmentGrid'].map(id=>document.getElementById(id)?.className||''),
    active:[...document.querySelectorAll('.nlcatalog-toolbar [data-nlcatalog-view]')].filter(b=>b.getAttribute('aria-pressed')==='true').map(b=>b.dataset.nlcatalogView)
   }));
   verify(snapshot.stored===mode,'mode '+mode+' not persisted');
   verify(snapshot.all.every(css=>mode==='cards'?!/nlcatalog-/.test(css):css.includes('nlcatalog-'+mode)),mode+' not applied to all grids');
   verify(snapshot.active.length>=3&&snapshot.active.every(x=>x===mode),mode+' pressed state is not synchronized');
   verify(await page.locator('#studioGrid .card').count()===initial,'cards lost on '+mode);
   verify(await page.locator('#studioGrid .card a.nlab-btn.primary').first().getAttribute('href')===href,'Studio target changed on '+mode);
   checked.push('four-modes:'+mode);
  }
  await page.reload({waitUntil:'domcontentloaded',timeout:60000});
  await page.locator('#studioGrid .card').first().waitFor({state:'visible',timeout:20000});
  verify(await page.locator('#studioGrid').evaluate(el=>el.classList.contains('nlcatalog-table')),'table view not restored after reload');
  checked.push('view-persistence');
  const derived=page.locator('#derivedGrid .card a.nlab-btn.primary').first();
  const url=await derived.getAttribute('href');
  verify(!!url,'derived app missing opening link');
  const before=page.context().pages().length;
  await Promise.all([page.waitForNavigation({waitUntil:'domcontentloaded',timeout:60000}),derived.click()]);
  verify(page.url()===new URL(url,hubUrl).href,'derived app wrong URL');
  verify(page.context().pages().length===before,'derived link opened another tab');
  checked.push('derived-same-tab');
  await page.goBack({waitUntil:'domcontentloaded',timeout:60000});
  await page.locator('#studioGrid .card').first().waitFor({state:'visible',timeout:20000});
  verify(faults.length===0,'console/HTTP/network faults: '+faults.slice(0,12).join(' | '));
  checked.push('hub-js-http-network-health');
  return{component:'studios-hub-acceptance',checks:checked,studios:initial};
 }finally{await page.close()}
}
