// Isolated Chromium checks for the shared Studio Core picker; no personal files.
export async function checkStudioCoreInputPicker(browser,base){
 const page=await browser.newPage({viewport:{width:1280,height:800}});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 try{
  await page.goto(base+'APP-Applications/studios/',{waitUntil:'domcontentloaded',timeout:60000});
  const checks=await page.evaluate(async()=>{
   const {filesFromDrop,openInputPicker}=await import(new URL('../_shared/studio-v2/input-picker.js',location.href).href);
   const ok=(condition,message)=>{if(!condition)throw Error('Studio Core Input Picker: '+message)};
   const a=new File(['a'],'a.txt',{type:'text/plain',lastModified:1});
   const b=new File(['b'],'b.txt',{type:'text/plain',lastModified:2});
   // Some DataTransfer implementations expose the directory API but return null.
   const fallback=await filesFromDrop({items:[{webkitGetAsEntry:()=>null,getAsFile:()=>a}],files:[a]});
   ok(fallback.length===1&&fallback[0].name==='a.txt','null directory entry dropped a file');
   const missingEntries=await filesFromDrop({items:[],files:[a,a]});
   ok(missingEntries.length===1,'DataTransfer fallback was not deduplicated');
   let readCount=0;
   const directory={isDirectory:true,name:'folder',createReader(){return{readEntries(cb){cb(readCount++?[]:[{isFile:true,file(done){done(b)}}])}}}};
   const folder=await filesFromDrop({items:[{webkitGetAsEntry:()=>directory}],files:[]});
   ok(folder.length===1&&folder[0].__relativePath==='folder/b.txt','directory traversal or relative path broken');
   const selected=openInputPicker({files:[a,b],preserveSession:false,accept:'.txt',expandZip:false});
   const root=document.querySelector('#studioInputPicker'),count=()=>root.querySelectorAll('[data-input-item]').length;
   ok(root&&!root.hidden&&count()===2,'initial collection unavailable');
   root.querySelector('[data-input-select-none]').click();
   ok(root.querySelector('#studioInputConfirm').disabled,'deselect all did not disable confirmation');
   root.querySelector('[data-input-select-all]').click();
   ok(!root.querySelector('#studioInputConfirm').disabled,'select all did not restore confirmation');
   root.querySelector('[data-input-remove="0"]').click();
   ok(count()===1,'single-file removal failed');
   root.querySelector('#studioInputClear').click();
   ok(count()===0&&root.querySelector('#studioInputConfirm').disabled,'clear did not empty collection');
   root.querySelector('#studioInputCancel').click();
   ok(await selected===null,'cancel must resolve with null');
   const next=openInputPicker({files:[b],preserveSession:false,accept:'.txt',expandZip:false});
   ok(count()===1,'picker unexpectedly persisted collection with preserveSession=false');
   root.querySelector('#studioInputConfirm').click();
   const result=await next;
   ok(result.length===1&&result[0].name==='b.txt','confirmation did not return selected file');
   const native=openInputPicker({files:[],preserveSession:false,accept:'.txt',expandZip:false});
   const input=root.querySelector('#studioInputFilesNative'),transfer=new DataTransfer();
   transfer.items.add(new File(['native'],'native.txt',{type:'text/plain'}));
   input.files=transfer.files;
   input.dispatchEvent(new Event('change',{bubbles:true}));
   const awaitCount=async target=>{for(let i=0;i<100&&count()<target;i++)await new Promise(done=>setTimeout(done,20));ok(count()===target,'expected '+target+' files after import, received '+count())};
   await awaitCount(1);
   ok(input.value==='','native file input was not reset after import');
   const drag=new DataTransfer();drag.items.add(new File(['drop'],'drop.txt',{type:'text/plain'}));
   root.querySelector('#studioInputDrop').dispatchEvent(new DragEvent('drop',{bubbles:true,cancelable:true,dataTransfer:drag}));
   await awaitCount(2);
   root.querySelector('#studioInputCancel').click();ok(await native===null,'cancel after native/drag import');
   return ['null-entry-fallback','fallback-dedupe','directory-path','collection','select-none','select-all','remove','clear','cancel','session-isolation','confirm','native-input','input-reset','drag-drop-ui'];
  });
  if(errors.length)throw Error('Studio Core picker page errors: '+errors.join(' | '));
  return{component:'studio-core-input-picker',checks};
 }finally{await page.close()}
}
