// Chromium smoke for the opt-in Studio Core color editor; does not touch product UIs.
export async function checkStudioCoreColors(browser,base){
 const page=await browser.newPage({viewport:{width:1180,height:800}});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 try{
  await page.goto(base+'APP-Applications/studios/',{waitUntil:'domcontentloaded',timeout:60000});
  const checks=await page.evaluate(async()=>{
   const {mountColorPicker}=await import(new URL('../_shared/studio-v2/color-picker.js',location.href).href);
   const ok=(test,message)=>{if(!test)throw Error('Studio Core Color Picker: '+message)};
   const root=document.createElement('div');document.body.append(root);
   let notifications=0;const api=mountColorPicker(root,{value:'#abc',onChange:()=>notifications++});
   ok(api.getValue()==='#AABBCC','normalize initial HEX');
   ok(mountColorPicker(root)===api,'idempotent mount');
   const field=key=>root.querySelector('[data-color-'+key+']');
   field('hex').value='#00ff00';field('hex').dispatchEvent(new Event('change',{bubbles:true}));
   ok(api.getValue()==='#00FF00'&&field('g').value==='255','HEX-to-RGB sync');
   field('r').value='255';field('g').value='0';field('b').value='0';
   field('r').dispatchEvent(new Event('change',{bubbles:true}));
   ok(api.getValue()==='#FF0000'&&field('h').value==='0','RGB-to-HSL sync');
   field('h').value='240';field('s').value='100';field('l').value='50';
   field('h').dispatchEvent(new Event('change',{bubbles:true}));
   ok(api.getValue()==='#0000FF','HSL-to-HEX sync');
   field('hex').value='invalid';field('hex').dispatchEvent(new Event('change',{bubbles:true}));
   ok(api.getValue()==='#0000FF'&&field('hex').value==='#0000FF','reject invalid HEX');
   field('native').value='#123456';field('native').dispatchEvent(new Event('input',{bubbles:true}));
   ok(api.getValue()==='#123456'&&notifications>=4,'native input / notifications');
   api.setValue('#fff');
   ok(api.getValue()==='#FFFFFF'&&field('hex').value==='#FFFFFF','programmatic setValue');
   root.remove();
   return ['initial','idempotency','hex-to-rgb','rgb-to-hsl','hsl-to-hex','invalid-hex','native-input','events','api'];
  });
  if(errors.length)throw Error('Core color picker browser errors: '+errors.join(' | '));
  return{component:'studio-core-color-picker',checks};
 }finally{await page.close()}
}
