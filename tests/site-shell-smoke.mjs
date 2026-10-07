import{chromium}from'playwright';
const base=process.env.NLAB_BASE_URL||'http://127.0.0.1:8775/';
const browser=await chromium.launch({headless:true});
try{
  const page=await browser.newPage({viewport:{width:1360,height:900}});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error'&&!/favicon|Failed to load resource/i.test(m.text()))errors.push(m.text())});
  await page.goto(base,{waitUntil:'domcontentloaded',timeout:60000});
  await page.waitForFunction(()=>document.querySelector('#studioCount')?.textContent!=='—',null,{timeout:15000});
  const root=await page.evaluate(()=>({
    shell:!!window.NLabApplicationShell,
    theme:document.documentElement.dataset.theme,
    count:Number(document.querySelector('#studioCount')?.textContent||0),
    headline:document.querySelector('#headlineProduct')?.textContent||'',
    hardcoded:/0\.9\.21/.test(document.body.textContent||''),
    themeControls:document.querySelectorAll('.nlab-header [data-shell-pref="theme"]').length
  }));
  if(!root.shell||!root.theme||root.count<5||!root.headline||root.hardcoded||root.themeControls!==1)throw new Error('Portail public invalide: '+JSON.stringify(root));
  await page.selectOption('[data-shell-pref="theme"]','dark');
  await page.waitForFunction(()=>document.documentElement.dataset.theme==='dark');
  await page.goto(base+'APP-Applications/studios/',{waitUntil:'domcontentloaded',timeout:60000});
  await page.waitForFunction(()=>document.querySelectorAll('#studioGrid .nlab-card').length>=5,null,{timeout:15000});
  const hub=await page.evaluate(()=>({
    shell:!!window.NLabApplicationShell,
    theme:document.documentElement.dataset.theme,
    cards:document.querySelectorAll('#studioGrid .nlab-card').length,
    buttons:document.querySelectorAll('#studioGrid .nlab-btn.primary').length,
    themeControls:document.querySelectorAll('.nlab-header [data-shell-pref="theme"]').length
  }));
  if(!hub.shell||hub.theme!=='dark'||hub.cards<5||hub.buttons<3||hub.themeControls!==1)throw new Error('Hub Studios invalide: '+JSON.stringify(hub));
  await page.click('[data-shell-view="list"]');
  await page.waitForFunction(()=>document.body.dataset.shellView==='list');
  await page.goto(base,{waitUntil:'domcontentloaded',timeout:60000});
  await page.waitForFunction(()=>document.body.dataset.shellView==='list');
  if(errors.length)throw new Error(errors.join(' | '));
  console.log(JSON.stringify({ok:true,root,hub},null,2));
}finally{await browser.close()}
