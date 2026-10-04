import{chromium}from'playwright';
const base=process.env.NLAB_BASE_URL||'http://127.0.0.1:8770/';
const studios=[
 ['image-studio',['openPicker','demoSynthetic','export']],
 ['scan-studio',['drop','takePhoto','exportPdf']],
 ['ocr-studio',['drop','run','save']],
 ['code-studio',['codeAddFiles','editor','save']],
 ['json-studio',['file','editor','save']],
 ['data-studio',['dataAddFiles','demoCsv','save']],
 ['file-studio',['fileAddInputs','start','export']],
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
  await page.waitForSelector('#nlabStudioV2Chrome',{timeout:60000});
  for(const c of controls)await page.waitForSelector('#'+c,{timeout:15000}).catch(()=>{throw new Error(id+': contrôle #'+c+' absent')});
  if(errors.length)throw new Error(id+': erreurs navigateur: '+errors.join(' | '));
  const iconOk=await page.evaluate(()=>{const el=document.querySelector('.studioAppIcon');if(!el)return false;const s=getComputedStyle(el,'::after');return (s.maskImage&&s.maskImage!=='none')||(s.webkitMaskImage&&s.webkitMaskImage!=='none')});if(!iconOk)throw new Error(id+': icône Studio SVG/mask absente');
   const rb=page.locator('[data-studio-action]').first();if(await rb.count()){await rb.click();await page.locator('#studioContextHelpOpen').click();await page.waitForSelector('#studioContextHelpWindow:not([hidden])',{timeout:5000});if(!await page.locator('#studioContextHelpWindow .contextualHelp').count())throw new Error(id+': aide contextuelle flottante absente');if(!await page.locator('#studioContextHelpWindow .contextDevHelp').count())throw new Error(id+': bloc Développement de l’aide absent');const devText=await page.locator('#studioContextHelpWindow .contextDevHelp').textContent();if(!/identification/i.test(devText))throw new Error(id+': identification développeur absente');}
  results.push({studio:id,coreV2:true,controls,studioIcon:true});
  await page.close();
 }
 const derived=await browser.newPage({viewport:{width:390,height:844}});
  const derivedErrors=[];derived.on('pageerror',e=>derivedErrors.push(e.message));
  await derived.goto(base+'APP-Applications/pdf-sign/v1/',{waitUntil:'domcontentloaded',timeout:60000});
  await derived.waitForSelector('#nlabStudioV2Chrome',{timeout:60000});
  for(const id of ['dropTarget','assetKind','assetSelect','drawCanvas','applyAsset','downloadPdf'])await derived.waitForSelector('#'+id,{timeout:15000});
  const responsive=await derived.evaluate(()=>({width:document.documentElement.scrollWidth,viewport:innerWidth,core:document.documentElement.dataset.studioCoreVersion,version:document.documentElement.dataset.studioVersion}));
  if(responsive.width>responsive.viewport+2)throw new Error('PDF Sign: débordement horizontal mobile '+responsive.width+' > '+responsive.viewport);
  if(!responsive.core)throw new Error('PDF Sign: version Studio Core absente');
  if(!responsive.version)throw new Error('PDF Sign: version runtime absente');
  if(derivedErrors.length)throw new Error('PDF Sign: erreurs navigateur: '+derivedErrors.join(' | '));
  results.push({studio:'pdf-sign',derived:true,responsive:true,coreVersion:responsive.core,version:responsive.version});
  await derived.close();
  const mergeDerived=await browser.newPage({viewport:{width:390,height:844}});
  const mergeErrors=[];mergeDerived.on('pageerror',e=>mergeErrors.push(e.stack||e.message));
  await mergeDerived.goto(base+'APP-Applications/merge-studio/v1/',{waitUntil:'domcontentloaded',timeout:60000});
  await mergeDerived.waitForSelector('#nlabStudioV2Chrome',{timeout:60000});
  for(const id of ['addMergeFiles','mergeList','mergeOutputName','mergeNow','mergePreview'])await mergeDerived.waitForSelector('#'+id,{state:'attached',timeout:15000});
  const mergeResponsive=await mergeDerived.evaluate(()=>({width:document.documentElement.scrollWidth,viewport:innerWidth,core:document.documentElement.dataset.studioCoreVersion,version:document.documentElement.dataset.studioVersion}));
  if(mergeResponsive.width>mergeResponsive.viewport+2)throw new Error('Merge Studio: débordement horizontal mobile '+mergeResponsive.width+' > '+mergeResponsive.viewport);
  if(!mergeResponsive.core||!mergeResponsive.version)throw new Error('Merge Studio: métadonnées runtime absentes');
  if(mergeErrors.length)throw new Error('Merge Studio: erreurs navigateur: '+mergeErrors.join(' | '));
  results.push({studio:'merge-studio',derived:true,responsive:true,coreVersion:mergeResponsive.core,version:mergeResponsive.version});
  await mergeDerived.close();

 const hub=await browser.newPage({viewport:{width:1360,height:900}});await hub.goto(base+'APP-Applications/studios/',{waitUntil:'domcontentloaded',timeout:60000});await hub.waitForSelector('#developmentGrid .devCard',{timeout:15000});await hub.waitForSelector('#derivedGrid .card',{timeout:15000});if(await hub.locator('.studioIcon').count()<10)throw new Error('Hub Studios: icônes insuffisantes');if(await hub.locator('#developmentGrid .devCard').count()<5)throw new Error('Hub Studios: backlog DÉVELOPPEMENT absent');if(!await hub.locator('#derivedGrid').getByText('nLab PDF Sign').count())throw new Error('Hub Studios: PDF Sign dérivé absent');if(!await hub.locator('#derivedGrid').getByText('nLab Merge Studio').count())throw new Error('Hub Studios: Merge Studio dérivé absent');if(!await hub.getByText('Scan Studio',{exact:true}).count())throw new Error('Hub Studios: Scan Studio absent');if(!await hub.locator('#globalPolicy').count())throw new Error('Hub Studios: politique de version absente');await Promise.all([hub.waitForNavigation({waitUntil:'domcontentloaded'}),hub.locator('#globalPolicy').selectOption('test')]);const hp=await hub.evaluate(()=>localStorage.getItem('nlab-studio-hub-policy-v1'));if(hp!=='test')throw new Error('Hub Studios: politique TEST non persistée');await hub.close();
 const icons=await browser.newPage({viewport:{width:1360,height:900}});await icons.goto(base+'Library/demo/Images/nLab-Studio/Icon-Library/gallery/',{waitUntil:'domcontentloaded',timeout:60000});await icons.waitForFunction(()=>document.querySelectorAll('#families .card').length>=240,null,{timeout:60000});const lib=await icons.evaluate(()=>({cards:document.querySelectorAll('#families .card').length,families:document.querySelectorAll('#families .panel').length,currentColor:[...document.querySelectorAll('.preview svg')].every(x=>x.getAttribute('stroke')==='currentColor')}));if(lib.families<5)throw new Error('Galerie SVG: familles incomplètes');if(!lib.currentColor)throw new Error('Galerie SVG: une icône n’utilise pas currentColor');await icons.close();
 console.log(JSON.stringify({ok:true,studios:results,iconLibrary:lib},null,2));
}finally{await browser.close()}
