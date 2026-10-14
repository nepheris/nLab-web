// Browser-only coverage for Core Undo/Redo keyboard bridge.
export async function checkStudioCoreUndoRedoBrowser(browser,base){
 const page=await browser.newPage();
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 try{
  await page.goto(base+'APP-Applications/studios/',{waitUntil:'domcontentloaded',timeout:60000});
  const checks=await page.evaluate(async()=>{
   const core=await import('/APP-Applications/_shared/studio-v2/undo-redo.js');
   const ok=(condition,message)=>{if(!condition)throw Error('Studio Core Undo/Redo: '+message)};
   core.clearUndoRedo();core.installUndoRedoBridge();
   let value=1;core.pushUndoRedo({label:'keyboard',undo(){value=0},redo(){value=1}});
   const key=(target,k,opts={})=>target.dispatchEvent(new KeyboardEvent('keydown',{key:k,ctrlKey:true,bubbles:true,cancelable:true,...opts}));
   key(document.body,'z');await Promise.resolve();
   ok(value===0&&core.getUndoRedoState().canRedo,'Ctrl+Z must undo');
   key(document.body,'y');await Promise.resolve();
   ok(value===1,'Ctrl+Y must redo');
   key(document.body,'z');await Promise.resolve();
   key(document.body,'Z',{shiftKey:true});await Promise.resolve();
   ok(value===1,'Ctrl+Shift+Z must redo');
   const input=document.createElement('input');document.body.append(input);
   key(input,'z');await Promise.resolve();
   ok(value===1,'Ctrl+Z inside an input must remain native');
   input.remove();core.clearUndoRedo();
   return ['ctrl-z','ctrl-y','ctrl-shift-z','editable-input-guard'];
  });
  if(errors.length)throw Error('Core Undo/Redo browser page errors: '+errors.join(' | '));
  return{component:'studio-core-undo-redo-keyboard',checks};
 }finally{await page.close()}
}
