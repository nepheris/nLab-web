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
 ['dataset-generator-studio',['generate','exportJson','table']],
 ['document-studio',['fileInput','editor','exportDocx','exportOdt']],
 ['spreadsheet-studio',['fileInput','sheetSelect','exportXlsx','exportOds']]
];
const browser=await chromium.launch({headless:true});
const results=[];
try{
 for(const [id,controls] of studios){
  const page=await browser.newPage({viewport:{width:1360,height:900}});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error'&&!/favicon|Failed to load resource/i.test(m.text()))errors.push(m.text())});
  await page.goto(base+'APP-Applications/'+id+'/v2/',{waitUntil:'domcontentloaded',timeout:60000});
  await page.waitForSelector('#nlabStudioV2Chrome',{timeout:30000});
  for(const c of controls)await page.waitForSelector('#'+c,{timeout:15000}).catch(()=>{throw new Error(id+': contrôle #'+c+' absent')});
  if(errors.length)throw new Error(id+': erreurs navigateur: '+errors.join(' | '));
  const iconOk=await page.evaluate(()=>{const el=document.querySelector('.studioAppIcon');if(!el)return false;const s=getComputedStyle(el,'::after');return (s.maskImage&&s.maskImage!=='none')||(s.webkitMaskImage&&s.webkitMaskImage!=='none')});if(!iconOk)throw new Error(id+': icône Studio SVG/mask absente');
  results.push({studio:id,coreV2:true,controls,studioIcon:true});
  await page.close();
 }
 const hub=await browser.newPage({viewport:{width:1360,height:900}});await hub.goto(base+'APP-Applications/studios/',{waitUntil:'domcontentloaded',timeout:60000});await hub.waitForSelector('#developmentGrid .devCard',{timeout:15000});if(await hub.locator('.studioIcon').count()<10)throw new Error('Hub Studios: icônes insuffisantes');if(await hub.locator('#developmentGrid .devCard').count()<5)throw new Error('Hub Studios: backlog DÉVELOPPEMENT absent');await hub.close();
 const icons=await browser.newPage({viewport:{width:1360,height:900}});await icons.goto(base+'Library/demo/icons/',{waitUntil:'domcontentloaded',timeout:60000});await icons.waitForFunction(()=>document.querySelectorAll('#studios .card').length>=12&&document.querySelectorAll('#functions .card').length>=40,null,{timeout:20000});const lib=await icons.evaluate(()=>({studios:document.querySelectorAll('#studios .card').length,functions:document.querySelectorAll('#functions .card').length,currentColor:[...document.querySelectorAll('.preview svg')].every(x=>x.getAttribute('stroke')==='currentColor')}));if(!lib.currentColor)throw new Error('Galerie SVG: une icône n’utilise pas currentColor');await icons.close();
 console.log(JSON.stringify({ok:true,studios:results,iconLibrary:lib},null,2));
}finally{await browser.close()}
