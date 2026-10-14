// Shared Core windows: persistence, scroll axes, focus, hide/restore and Escape.
export async function checkStudioCoreWindows(browser,base){
 const page=await browser.newPage({viewport:{width:1280,height:800}});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 try{
  await page.goto(base+'APP-Applications/studios/',{waitUntil:'domcontentloaded',timeout:60000});
  const checks=await page.evaluate(async()=>{
   const core=await import('/APP-Applications/_shared/studio-v2/window-system.js');
   const ok=(test,message)=>{if(!test)throw Error('Studio Core Window: '+message)};
   const key='core-window-regression',panel=document.createElement('section');
   panel.id=key;panel.tabIndex=-1;panel.innerHTML='<h2>Fenêtre de test</h2><p>Contenu vérifiable</p>';
   document.body.append(panel);
   core.enhanceStudioWindow(panel,{key,title:'Fenêtre Core de test'});
   ok(core.getStudioWindowState(key)?.key===key,'window not registered');
   ok(panel.querySelector('[data-win-scroll-x]')&&panel.querySelector('[data-win-scroll-y]'),'scroll controls missing');
   panel.querySelector('[data-win-scroll-x]').click();
   ok(core.getStudioWindowState(key).scrollX===false&&panel.style.overflowX==='hidden','horizontal scroll toggle');
   panel.querySelector('[data-win-scroll-y]').click();
   ok(core.getStudioWindowState(key).scrollY===false&&panel.style.overflowY==='hidden','vertical scroll toggle');
   ok(core.hideStudioWindow(key)&&panel.hidden,'hide');
   ok(core.getStudioWindowState(key).restorable,'hidden window not restorable');
   ok(core.showStudioWindow(key)&&!panel.hidden,'show');
   ok(document.activeElement===panel,'focus on restore');
   document.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',bubbles:true,cancelable:true}));
   ok(panel.hidden,'Escape should hide top window');
   core.restoreAllStudioWindows();
   ok(!panel.hidden,'restore all');
   core.resetStudioWindows();
   ok(core.getStudioWindowState(key).scrollX===true&&core.getStudioWindowState(key).scrollY===true,'reset preferences');
   panel.remove();
   return ['registration','horizontal-scroll','vertical-scroll','hide','restorable','show','focus','escape','restore-all','reset'];
  });
  if(errors.length)throw Error('Studio Core Windows page errors: '+errors.join(' | '));
  return{component:'studio-core-windows',checks};
 }finally{await page.close()}
}
