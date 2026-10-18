// Studio Core Test Lab — validation navigateur du vrai Core partagé.
import {chromium} from 'playwright';
import {mkdir} from 'node:fs/promises';
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
  assert((await page.locator('#labCheckList li.pass').count())===15,name+': 15 checks should pass');
  assert(await page.locator('.studioLogo img').count()===1,name+': Core nLab logo absent');
  assert(await page.locator('[data-studio-action="core.fullscreen"]').count()===1,name+': fullscreen missing');
  const app=page.locator('[data-studio-action="core.app-mode"]');
  assert(await app.count()===1,name+': PWA Core command missing');
  assert(['browser','installable','standalone'].includes(await app.getAttribute('data-app-mode')),name+': PWA state invalid');
  await page.locator('#labPickerOpen').click();
  await page.locator('#studioInputPicker').waitFor({state:'visible',timeout:12000});
  await page.locator('#studioInputFilesNative').setInputFiles({name:'core-test-fixture.txt',mimeType:'text/plain',buffer:Buffer.from('nLab TEST fixture')});
  await page.locator('#studioInputConfirm').click();
  await page.locator('#labPickedFiles li').first().waitFor({state:'attached',timeout:12000});
  assert((await page.locator('#labPickedFiles').textContent()).includes('core-test-fixture.txt'),name+': input-picker selection not returned');
  await page.locator('#labCollection .collectionItem').first().waitFor({timeout:12000});
  // UX 0.5 parity: files binder, contextual history, shared real event store.
  if(viewport.width<=700)await page.locator('#studioUxMobileOpen').click();
  await page.locator('[data-ux-tab="history"]').click();
  assert(await page.locator('.uxHistorySidebar').count()===1,name+': shared history sidebar absent');
  assert(await page.locator('#uxHistoryRecent').getAttribute('open')!==null,name+': history accordion not expanded');
  assert(await page.locator('#uxHistoryList .uxHistoryEntry').count()>=1,name+': imported-file activity missing');
  await page.locator('#uxHistoryGrouping').selectOption('type');
  await page.locator('[data-ux-history-type="file"]').click();
  assert((await page.locator('#uxHistoryList .uxHistoryEntry').count())>=1,name+': file history filter failed');
  await page.locator('#uxHistorySearch').fill('aucun-resultat-inexistant');
  assert((await page.locator('#uxHistoryList .uxHistoryEntry').count())===0,name+': history search not filtering');
  await page.locator('#uxHistorySearch').fill('');
  await page.locator('[data-ux-history-type="all"]').click();
  await page.locator('#uxHistoryScope').selectOption('all');
  await page.locator('#uxHistoryDetail').selectOption('detailed');
  assert(await page.locator('#uxHistoryList .uxHistoryEntry[open]').count()>=1,name+': detailed history view missing');
  await page.locator('#uxHistoryList .uxHistoryEntryDetails button').first().click();
  await page.locator('#uxHistoryFavoritesOnly').click();
  assert(await page.locator('#uxHistoryList .uxHistoryEntry').count()>=1,name+': canonical favorite history filter missing');
  await page.locator('#uxHistoryFavoritesOnly').click();
  await page.locator('[data-ux-tab="workspace"]').click();
  assert(await page.locator('#studioMain').getAttribute('data-work-tab-active')==='true',name+': work surface not selected');
  assert(await page.locator('.uxSurfacePanel [data-surface-action]').count()>=6,name+': workbench controls not bound');
  assert(await page.locator('#studioUxWorkBody').count()===1,name+': central work surface missing');
  if(viewport.width<=700)await page.locator('#studioUxMobileOpen').click();
  if(viewport.width<=700)await page.locator('#studioUxCollapse').click();
  else await page.locator('[data-ux-tab="files"]').click();
  assert((await page.locator('#uxSideFileList .uxSideFileRow').count())===1,name+': files binder out of sync');

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
  // The rotate controls are intentionally hidden on small thumbnail cards.
  // Enlarge cards before checking the contextual buttons.
  for(let i=0;i<7;i++)await page.locator('#labThumbPlus').click();
  const rotateDiagnostics=await page.locator('#labCollection .collectionItem').first().evaluate(card=>{const button=card.querySelector('[data-collection-rotate="90"]'),tools=button?.parentElement,thumb=card.querySelector('.collectionThumb');return{cardWidth:card.getBoundingClientRect().width,enabled:card.dataset.rotateEnabled,view:card.closest('.collectionBrowser')?.className,toolsDisplay:tools?getComputedStyle(tools).display:'none',buttonDisplay:button?getComputedStyle(button).display:'none',thumbWidth:thumb?.getBoundingClientRect().width,zoom:card.closest('.collectionBrowser')?.dataset.thumbnailSize}});
  assert(await page.locator('#labCollection .collectionThumbTools [data-collection-rotate="90"]').first().isVisible(),name+': rotate action should be visible on large thumbnails; '+JSON.stringify(rotateDiagnostics));
  await page.locator('#labCollection .collectionThumbTools [data-collection-rotate="90"]').first().click();
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
  assert(await page.locator('#studioMain.studioUx').count()===1,name+': workspace shell missing');
  assert(await page.locator('#studioUxRailToggle').count()===1,name+': collapsible rail toggle missing');
  if(viewport.width>700){
   await page.locator('#studioUxRailToggle').click();
   assert(await page.locator('#studioMain').evaluate(x=>x.classList.contains('uxSidebarClosed')),name+': rail did not collapse');
   await page.locator('#studioUxRailToggle').click();
   assert(!(await page.locator('#studioMain').evaluate(x=>x.classList.contains('uxSidebarClosed'))),name+': rail did not expand');
  }
  await page.locator('#uxPreviewCollapse').click();
  assert(await page.locator('#uxPreviewCanvas').isHidden(),name+': preview did not collapse');
  await page.locator('#uxPreviewRestore').click();
  assert(await page.locator('#uxPreviewCanvas').isVisible(),name+': preview did not restore');

  assert(await page.locator('#studioMain').getAttribute('data-layout-profile')===(viewport.width<=700?'mobile':viewport.width<=1100?'tablet':'desktop'),name+': adaptive workspace profile incorrect');
  assert(await page.locator('.studioUxRail [data-ux-tab]').count()===8,name+': Core workbench tab missing');
  await page.locator('#uxSaveAsOpen').click();
  assert(await page.locator('.uxTokenFamily').count()===6,name+': template categories missing');
  assert(await page.locator('#uxSaveProfileMount [data-template-profile="FIRST_NAME"]').count()===1,name+': personal profile 00 missing');
  await page.locator('#uxSaveProfileMount [data-template-profile="FIRST_NAME"]').fill('Essai');
  await page.locator('#uxSavePattern').fill('{FIRST_NAME}_{DATE_A:DD-MM-YYYY}');
  assert((await page.locator('#uxSavePreview').textContent()).includes('Essai_'),name+': local personal variable not resolved');
  await page.locator('#uxSaveDateMask').selectOption('DD-MM-YYYY');
  assert((await page.locator('.uxTokenFamily[data-family="date"] [data-template-token="DATE_A"]').textContent()).includes(':DD-MM-YYYY'),name+': formatted date token missing');
  await page.locator('.uxTokenFamily[data-family="date"] .uxToken[data-token-key="DATE_A"] button').nth(1).click();
  assert((await page.locator('#uxSavePattern').inputValue()).includes('{DATE_A:DD-MM-YYYY}'),name+': date insertion failed');
  await page.locator('.uxTokenFamily[data-family="folder"] summary').click();
  await page.locator('.uxToken[data-token-key="FOLDER"]').hover();
  assert((await page.locator('#uxSaveTokenHelp').textContent()).includes('Dossier parent'),name+': contextual hover variable help missing');
  await page.locator('#uxSaveContent').selectOption('selection');
  assert((await page.locator('#uxSaveContextHelp').textContent()).includes('cochés'),name+': selection context help missing');
  await page.locator('#uxSaveContent').selectOption('collection');

  assert(await page.locator('#uxSaveDialog').isVisible(),name+': save-as dialog missing');
  await page.locator('#uxSaveTokens .uxTokenHelp').first().click();
  assert((await page.locator('#uxSaveTokenHelp').textContent()).includes('STUDIO'),name+': contextual variable help missing');
  await page.locator('#uxSavePattern').fill('{STUDIO}_{DATE:YYYYMMDD}_{COUNTER}');
  await page.locator('#uxSavePath').fill('{YEAR}/{MONTH}/{DAY}');
  assert((await page.locator('#uxSavePreview').textContent()).includes('2026')||/\d{4}/.test(await page.locator('#uxSavePreview').textContent()),name+': naming preview missing year');
  await page.locator('#uxSaveFormat').selectOption('csv');
  await page.locator('#uxSaveDestination').selectOption('download');
  const downloadPromise=page.waitForEvent('download',{timeout:10000});
  await page.locator('#uxSaveConfirm').click();
  const downloaded=await downloadPromise;
  assert(downloaded.suggestedFilename().endsWith('.csv'),name+': metadata export must be CSV');
  await page.locator('#uxSaveClose').click();
  if(viewport.width<=700)await page.locator('#studioUxMobileOpen').click();
  await page.locator('[data-ux-tab="properties"]').click();
  await page.locator('#labItemName').fill('Échantillon modifié');
  await page.locator('#labCommit').click();
  assert(await page.evaluate(()=>window.NLABStudioUndoRedo?.get?.().undoDepth>=1),name+': no transaction');
  // On mobile the Core uses a reduced ribbon; use its own dock to expose actions.
  if(viewport.width<=700){await page.locator('#studioUxCollapse').click();await page.locator('[data-mobile-action="ribbon"]').click()};
  await page.locator('[data-studio-action="core.undo"]').click();
  assert(await page.locator('#labItemName').inputValue()==='Composant de démonstration nLab',name+': undo failed');
  await page.locator('[data-studio-action="core.redo"]').click();
  assert(await page.locator('#labItemName').inputValue()==='Échantillon modifié',name+': redo failed');
  if(viewport.width<=700)await page.locator('#studioUxMobileOpen').click();
  await page.locator('[data-ux-tab="settings"]').click();
  await page.locator('#labOpenSettings').click();
  assert(await page.locator('#studioCoreSettingsPanel').isVisible(),name+': Core settings not opened');
  await page.locator('#studioCoreSettingsClose').click();
  assert(await page.locator('#uxSettingsProfile [data-template-profile="FIRST_NAME"]').inputValue()==='Essai',name+': personal profile not synchronized');
  await page.locator('#uxDisplayMode').selectOption('tablet');
  assert(await page.locator('#studioMain').getAttribute('data-preview-profile')==='tablet',name+': tablet simulation missing');
  await page.locator('#uxDisplayMode').selectOption('mobile');
  assert(await page.locator('#studioMain').getAttribute('data-preview-profile')==='mobile',name+': mobile simulation missing');
  await page.locator('#uxDisplayMode').selectOption('auto');
  await page.locator('#uxTheme').selectOption('dark');
  assert((await page.locator('#studioMain').getAttribute('data-ux-theme'))==='dark',name+': dark theme missing');
  assert((await page.locator('body').getAttribute('data-studio-ux-theme'))==='dark',name+': dark theme not applied across header and dialogs');
  const darkContrast=await page.locator('.studioUxWorkHeader strong').first().evaluate(node=>{
    const parse=s=>Array.from((s.match(/[\d.]+/g)||[]).slice(0,3),Number);
    const lum=a=>{const c=a.map(x=>x/255).map(x=>x<=.04045?x/12.92:Math.pow((x+.055)/1.055,2.4));return .2126*c[0]+.7152*c[1]+.0722*c[2]};
    const fg=parse(getComputedStyle(node).color),bg=parse(getComputedStyle(node.closest('.studioUxWorkHeader')).backgroundColor);
    const x=lum(fg),y=lum(bg);return(Math.max(x,y)+.05)/(Math.min(x,y)+.05)
  });
  assert(darkContrast>=4.5,name+': insufficient dark-theme heading contrast '+darkContrast);
  await page.locator('#uxTheme').selectOption('light');
  assert((await page.locator('#studioMain').getAttribute('data-ux-theme'))==='light',name+': light theme missing');
  assert((await page.locator('body').getAttribute('data-studio-ux-theme'))==='light',name+': light theme not global');
  if(viewport.width>700){
   await page.locator('#studioUxDetach').click();
   assert(await page.locator('.studioUxFloat[data-ux-float="settings"]').isVisible(),name+': floating panel missing');
   await page.locator('.studioUxFloat[data-ux-float="settings"] [data-ux-float-close]').click();
   assert(await page.locator('.studioUxTabPanel[data-ux-panel="settings"] #uxTheme').count()===1,name+': panel reattachment failed');
  }
  if(viewport.width>1000){
   const button=page.locator('[data-studio-action="core.fullscreen"]');
   await button.click();
   assert(await page.evaluate(()=>document.fullscreenElement===document.documentElement),name+': fullscreen did not enter');
   await page.keyboard.press('Escape');
   await page.waitForFunction(()=>document.fullscreenElement===null,null,{timeout:6500});
  }else{
   const profile=await page.locator('body').getAttribute('data-responsive-profile');
   assert(viewport.width<=700?profile==='mobile':['tablet','desktop','compact'].includes(profile),name+': Core responsive profile incorrect: '+profile);
  }
  // Mockup UX 0.5: optional populated workspace, real grouping and central search.
  if(viewport.width<=700&&!(await page.locator('#studioUxSidebar').isVisible().catch(()=>false))){/* drawer already open from settings */}
  await page.locator('[data-ux-tab="files"]').click();
  await page.locator('#uxSideSamples').click();
  assert((await page.locator('#uxSideFileList .uxSideFileRow').count())===7,name+': optional demo pack not imported');
  await page.locator('#uxCollectionGrouping').selectOption('path');
  assert((await page.locator('#labCollection .collectionGroup').count())>=2,name+': folder grouping not active');
  if(viewport.width<=700)await page.locator('#studioUxCollapse').click();
  await page.locator('#uxCollectionFilter').fill('Inventaire');
  assert((await page.locator('#uxSearchCount').textContent()).includes('1 résultat'),name+': central collection filtering failed');
  await page.locator('#uxCollectionFilter').fill('');
  await page.locator('#labThumbAuto').click();
  await page.locator('#uxCollectionGrouping').selectOption('none');
  await mkdir('artifacts/core-lab-ux',{recursive:true});
  if(viewport.width<=700)await page.locator('#studioUxMobileOpen').click();
  await page.locator('[data-ux-tab="files"]').click();
  if(viewport.width<=700)await page.locator('#studioUxCollapse').click();
  await page.screenshot({path:'artifacts/core-lab-ux/'+name+'-workspace.png',fullPage:true});
  if(viewport.width<=700)await page.locator('#studioUxMobileOpen').click();
  await page.locator('[data-ux-tab="history"]').click();
  await page.screenshot({path:'artifacts/core-lab-ux/'+name+'-history.png',fullPage:true});
  await page.locator('[data-ux-tab="settings"]').click();
  await page.locator('#uxTheme').selectOption('dark');
  await page.locator('[data-ux-tab="history"]').click();
  await page.screenshot({path:'artifacts/core-lab-ux/'+name+'-dark-history.png',fullPage:true});
  await page.locator('[data-ux-tab="settings"]').click();
  await page.locator('#uxTheme').selectOption('light');
    assert(errors.length===0,name+': page errors '+errors.join('; '));
  reports.push({name,status:'PASS',checks:15,extra:'Workbench + history favorites/details + AA dark contrast'});
 }catch(error){
  reports.push({name,status:'FAIL',error:String(error?.stack||error),browserErrors:errors});
 }finally{await context.close();}
}
try{
 await scenario('desktop',{width:1440,height:900});
 await scenario('tablette',{width:820,height:1024});
 await scenario('mobile',{width:393,height:852});
}finally{await browser.close()}
console.log(JSON.stringify(reports,null,2));
if(reports.some(r=>r.status!=='PASS'))process.exitCode=1;
