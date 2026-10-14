// Chromium component regression for the shared viewer toolbar.
export async function checkStudioCoreViewer(browser,base){
 const page=await browser.newPage({viewport:{width:1100,height:750}});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 try{
  await page.goto(base+'APP-Applications/studios/',{waitUntil:'domcontentloaded',timeout:60000});
  const checks=await page.evaluate(async()=>{
   const {mountViewerControls}=await import(new URL('../_shared/studio-v2/viewer-control.js',location.href).href);
   const ok=(test,message)=>{if(!test)throw Error('Studio Core Viewer: '+message)};
   const host=document.createElement('div');host.dataset.viewerId='core-regression';document.body.append(host);
   const events=[];document.addEventListener('studio-v2:viewer-command-global',e=>{if(e.detail.viewerId==='core-regression')events.push(e.detail.action)});
   const viewer=mountViewerControls(host,{min:25,max:400,step:25,value:100,presets:[25,50,100,200]});
   ok(viewer&&viewer.getState().zoom===100,'initial zoom');
   ok(mountViewerControls(host)===viewer,'second mount should reuse existing instance');
   host.querySelector('[data-viewer-plus]').click();
   ok(viewer.getState().zoom===125,'plus control');
   host.querySelector('[data-viewer-minus]').click();
   ok(viewer.getState().zoom===100,'minus control');
   viewer.setZoom(0);
   ok(viewer.getState().zoom===25,'zero must clamp to minimum 25, not default 100');
   viewer.setZoom(1000);
   ok(viewer.getState().zoom===400,'upper clamp');
   viewer.setZoom('invalid');
   ok(viewer.getState().zoom===400,'invalid value should not reset zoom');
   host.querySelector('[data-viewer-fit]').click();
   ok(viewer.getState().fit,'fit mode');
   host.querySelector('[data-viewer-actual]').click();
   ok(viewer.getState().zoom===100&&!viewer.getState().fit,'actual size');
   const preset=host.querySelector('[data-viewer-preset]');
   preset.value='200';preset.dispatchEvent(new Event('change',{bubbles:true}));
   ok(viewer.getState().zoom===200,'preset selection');
   viewer.sync({zoom:75,fit:true});
   ok(viewer.getState().zoom===75&&viewer.getState().fit,'state sync');
   ok(events.includes('zoom')&&events.includes('fit')&&events.includes('actual'),'missing global event');
   host.remove();
   return ['initial','mount-idempotency','zoom-buttons','min-max-clamp','invalid-input','fit','actual','presets','sync','events'];
  });
  if(errors.length)throw Error('Core Viewer page errors: '+errors.join(' | '));
  return{component:'studio-core-viewer',checks};
 }finally{await page.close()}
}
