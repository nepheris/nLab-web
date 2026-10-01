import{chromium}from'playwright';
const base=process.env.NLAB_BASE_URL||'http://127.0.0.1:8770/';
const studios=[
 ['image-studio',['file','demoSynthetic','export']],
 ['ocr-studio',['file','run','save']],
 ['code-studio',['file','editor','save']],
 ['json-studio',['file','editor','save']],
 ['data-studio',['file','demoCsv','save']],
 ['file-studio',['files','start','export']],
 ['qr-barcode-studio',['refreshPreview','downloadPng','scan']],
 ['markdown-studio',['openMd','saveMd','mdEditor']],
 ['dataset-generator-studio',['generate','exportJson','table']]
];
const browser=await chromium.launch({headless:true});
const results=[];
try{
 for(const [id,controls] of studios){
  const page=await browser.newPage({viewport:{width:1360,height:900});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error'&&!/favicon/i.test(m.text()))errors.push(m.text())});
  await page.goto(base+'APP-Applications/'+id+'/v2/',{waitUntil:'domcontentloaded',timeout:60000});
  await page.waitForSelector('#nlabStudioV2Chrome',{timeout:30000});
  for(const c of controls)await page.waitForSelector('#'+c,{timeout:15000}).catch(()=>{throw new Error(id+': contrôle #'+c+' absent')});
  if(errors.length)throw new Error(id+': erreurs navigateur: '+errors.join(' | '));
  results.push({studio:id,coreV2:true,controls});
  await page.close();
 }
 console.log(JSON.stringify({ok:true,studios:results},null,2));
}finally{await browser.close()}
