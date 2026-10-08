import{chromium}from'playwright';
import{mkdir,writeFile}from'node:fs/promises';
const base=process.env.NLAB_BASE_URL||'http://127.0.0.1:8781/';
const browser=await chromium.launch({headless:true});
try{
  const page=await browser.newPage({viewport:{width:1360,height:900}});
  const errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.goto(base+'APP-Applications/pdf-studio/app-0.9.10.html',{waitUntil:'domcontentloaded',timeout:60000});
  await page.waitForTimeout(2500);
  const html='<!doctype html>\n'+await page.content();
  await mkdir('tmp',{recursive:true});
  await writeFile('tmp/pdf-studio-0.9.10.snapshot.html',html,'utf8');
  await writeFile('tmp/pdf-studio-0.9.10.snapshot.json',JSON.stringify({url:page.url(),title:await page.title(),errors},null,2),'utf8');
  console.log(JSON.stringify({bytes:Buffer.byteLength(html),errors,title:await page.title()},null,2));
}finally{await browser.close()}
