import{chromium}from'playwright';
const fs=await import('node:fs/promises');
const path=await import('node:path');
const base=process.env.NLAB_BASE_URL||'http://127.0.0.1:8777/';
const root=process.cwd();
const catalog=JSON.parse(await fs.readFile(path.join(root,'APP-Applications/studios/catalog.json'),'utf8'));
const ids=[...(catalog.studios||[]).map(x=>x.id),...(catalog.derived_apps||[]).map(x=>x.id)];
const browser=await chromium.launch({headless:true});
const results=[];
try{
  for(const id of ids){
    const regPath=path.join(root,'APP-Applications',id,'versions.json');
    let reg;try{reg=JSON.parse(await fs.readFile(regPath,'utf8'))}catch{continue}
    for(const v of reg.versions||[]){
      const page=await browser.newPage({viewport:{width:1280,height:800}});
      const href=String(v.href||'./');
      const target=new URL('APP-Applications/'+id+'/'+href,base).href;
      const errs=[];const onErr=e=>errs.push(e.message);page.on('pageerror',onErr);
      let response=null;
      try{
        response=await page.goto(target,{waitUntil:'domcontentloaded',timeout:60000});
        if(!response||response.status()>=400)throw new Error('HTTP '+(response?.status()??'none'));
        if(v.isolation==='compat-runtime'){
          // V2 resolves registry/version/build metadata asynchronously. Do not declare a false
          // historical identity failure after an arbitrary 250 ms sleep.
          const explicitHistory=new URL(target).searchParams.get('channel')==='historical';
          const legacyPdf=['pdf-studio','pdf-sign','merge-studio'].includes(id);
          if(explicitHistory&&!legacyPdf){
            await page.waitForSelector('#nlabStudioV2Chrome',{timeout:30000});
            await page.waitForFunction(expected=>
              document.documentElement.dataset.studioVersion===expected||
              document.body.dataset.studioVersion===expected,String(v.version),{timeout:15000});
          }
          const state=await page.evaluate(()=>({
            version:document.documentElement.dataset.studioVersion||document.body.dataset.studioVersion||'',
            status:document.querySelector('.studioPill.test')?.textContent?.trim()||'',
            title:document.title
          }));
          if(state.version && state.version!==String(v.version))throw new Error(id+' '+v.version+' identité runtime='+state.version);
          if(!state.version&&!legacyPdf)throw new Error(id+' '+v.version+' identité historique absente');
          if(explicitHistory&&!legacyPdf&&state.status!=='HISTORICAL')
            throw new Error(id+' '+v.version+' statut historique absent : '+JSON.stringify(state));
        }
        if(errs.length)throw new Error('JS '+errs.join(' | '));
        results.push({id,version:String(v.version),status:v.status,isolation:v.isolation||'',href,ok:true});
      }catch(e){
        results.push({id,version:String(v.version),status:v.status,isolation:v.isolation||'',href,ok:false,error:String(e?.message||e)});
      }finally{page.off('pageerror',onErr);await page.close()}
    }
  }
}finally{await browser.close()}
const failed=results.filter(x=>!x.ok);
console.log(JSON.stringify({ok:failed.length===0,total:results.length,failed,results},null,2));
if(failed.length)process.exit(1);
