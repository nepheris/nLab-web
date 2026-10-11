import{chromium}from'playwright';
const fs=await import('node:fs/promises');
const path=await import('node:path');
const base=process.env.NLAB_BASE_URL||'http://127.0.0.1:8777/';
const root=process.cwd();
const catalog=JSON.parse(await fs.readFile(path.join(root,'APP-Applications/studios/catalog.json'),'utf8'));
const ids=[...(catalog.studios||[]).map(x=>x.id),...(catalog.derived_apps||[]).map(x=>x.id)];
const preflightOnly=process.env.NLAB_PREFLIGHT_ONLY==='1';
const browser=preflightOnly?null:await chromium.launch({headless:true});
const results=[];
const missingRegistries=[];
const malformedRegistries=[];
const observedVersionKeys=new Set();
let registryEntryCount=0;
const expectedVersionCount=Number(process.env.NLAB_EXPECTED_STUDIO_VERSIONS||128);
const intentionallyUnversioned=new Set(['guide-froid']);
try{
  for(const id of ids){
    const regPath=path.join(root,'APP-Applications',id,'versions.json');
    let reg;try{reg=JSON.parse(await fs.readFile(regPath,'utf8'))}catch(e){
      if(!intentionallyUnversioned.has(id))missingRegistries.push({id,path:regPath,error:String(e?.message||e)});
      continue;
    }
    if(!Array.isArray(reg.versions)){
      malformedRegistries.push({id,error:'versions must be an array'});
      continue;
    }
    registryEntryCount+=reg.versions.length;
    for(const v of reg.versions){
      const versionKey=id+':'+String(v.version||'');
      if(!v.version||!v.href||!['current','test','historical'].includes(v.status)){
        malformedRegistries.push({id,version:v.version,error:'Missing version/href or invalid status'});
        continue;
      }
      if(observedVersionKeys.has(versionKey)){
        malformedRegistries.push({id,version:v.version,error:'Duplicate studio/version identity'});
        continue;
      }
      observedVersionKeys.add(versionKey);
      if(preflightOnly){results.push({id,version:String(v.version),status:v.status,isolation:v.isolation||'',href:v.href,ok:true,preflightOnly:true});continue;}
      const page=await browser.newPage({viewport:{width:1280,height:800}});
      const href=String(v.href||'./');
      const target=new URL('APP-Applications/'+id+'/'+href,base).href;
      const errs=[];const onErr=e=>errs.push(e.message);page.on('pageerror',onErr);
      let response=null;
      try{
        response=await page.goto(target,{waitUntil:'domcontentloaded',timeout:60000});
        if(!response||response.status()>=400)throw new Error('HTTP '+(response?.status()??'none'));
        if(v.isolation==='compat-runtime'){
          await page.waitForTimeout(250);
          const state=await page.evaluate(()=>({
            version:document.documentElement.dataset.studioVersion||document.body.dataset.studioVersion||'',
            title:document.title,
            text:(document.querySelector('#studioVersion')?.textContent||document.querySelector('[data-version]')?.textContent||'')
          }));
          if(state.version && state.version!==String(v.version))throw new Error(id+' '+v.version+' identité runtime='+state.version);
          if(!state.version&&!target.includes('/pdf-studio/')&&!target.includes('/pdf-sign/')&&!target.includes('/merge-studio/')){
            throw new Error(id+' '+v.version+' identité historique absente');
          }
        }
        if(errs.length)throw new Error('JS '+errs.join(' | '));
        results.push({id,version:String(v.version),status:v.status,isolation:v.isolation||'',href,ok:true});
      }catch(e){
        results.push({id,version:String(v.version),status:v.status,isolation:v.isolation||'',href,ok:false,error:String(e?.message||e)});
      }finally{page.off('pageerror',onErr);await page.close()}
    }
  }
}finally{if(browser)await browser.close()}
const failed=results.filter(x=>!x.ok);
if(registryEntryCount!==expectedVersionCount)failed.push({id:'registry-count',ok:false,error:`Expected ${expectedVersionCount} registered versions, got ${registryEntryCount}`});
for(const missing of missingRegistries)failed.push({...missing,ok:false,error:'Required versions.json missing: '+missing.path});
for(const malformed of malformedRegistries)failed.push({...malformed,ok:false});
console.log(JSON.stringify({ok:failed.length===0,total:results.length,registryEntryCount,mode:preflightOnly?'PREFLIGHT_STATIC':'BROWSER',failed,results},null,2));
if(failed.length)process.exit(1);
