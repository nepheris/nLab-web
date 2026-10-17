import {chromium} from 'playwright';
import {resolve} from 'node:path';

const base=(process.env.NLAB_BASE_URL||'http://127.0.0.1:8778/').replace(/\/?$/,'/');
const browser=await chromium.launch({headless:true});
const issues=[];
const capture=page=>{
 page.on('pageerror',e=>issues.push('pageerror: '+e.message));
 page.on('console',m=>{if(m.type()==='error'&&!/favicon|Failed to load resource/i.test(m.text()))issues.push('console: '+m.text())});
};
function requireResult(ok,why){if(!ok)throw Error(why)}
try{
 const gallery=await browser.newPage({viewport:{width:1360,height:900}});
 capture(gallery);
 await gallery.goto(base+'Library/demo/?scan2d',{waitUntil:'domcontentloaded',timeout:60000});
 await gallery.waitForFunction(()=>document.querySelectorAll('#demoBrowserFiles .demo-file').length>=7,null,{timeout:25000});
 requireResult(await gallery.locator('header.nlab-header').count()===1,'Galerie: header nLab partagé absent');
 requireResult(await gallery.locator('#demoFolderNav [data-demo-folder]').count()>=8,'Galerie: dossier/catégories non chargés');
 const tests=gallery.locator('#demoBrowserFiles .demo-test');
 requireResult(await tests.count()===7,'Galerie: attend 7 liens de tests Scan2D, obtenu '+await tests.count());
 requireResult((await gallery.locator('#demoBrowserCount').textContent()||'').includes('7 résultat'),'Galerie: filtre Scan2D incomplet');

 const iconPage=await browser.newPage({viewport:{width:1360,height:900}});
 capture(iconPage);
 await iconPage.goto(base+'Library/demo/Images/nLab-Studio/Icon-Library/gallery/',{waitUntil:'domcontentloaded',timeout:60000});
 await iconPage.waitForSelector('header.nlab-header',{timeout:12000});
 requireResult(await iconPage.locator('header .nlab-logo').count()===1,'Icônes: header commun absent');
 await iconPage.close();

 await tests.first().click();
 const studio=await gallery.context().waitForEvent('page',{timeout:10000}).catch(()=>null);
 // A same-tab navigation is also accepted.
 const opened=studio||gallery;
 capture(studio||gallery);
 await opened.waitForSelector('#nlabStudioV2Chrome',{timeout:35000});
 await opened.waitForFunction(()=>document.querySelectorAll('#imageList .imageItem').length>=1,null,{timeout:40000});
 const sample=await opened.locator('#imageList .imageItem.active strong').first().textContent();
 requireResult((sample||'').startsWith('01_image_de_test_'),'Galerie → Image Studio: cas 01 absent: '+sample);
 await opened.waitForFunction(()=>document.querySelector('#imageMeta')?.textContent?.includes('1600 × 1200'),null,{timeout:20000});
 requireResult((await opened.locator('#importStatus').textContent()||'').includes('ajoutée'),'Image Studio: statut d’import manquant');

 // Second import via shared Core picker: check that the newly loaded image becomes active.
 await opened.locator('#openPicker').click();
 await opened.waitForSelector('#studioInputPicker:not([hidden])',{timeout:15000});
 await opened.locator('#studioInputFilesNative').setInputFiles(resolve('Library/demo/files/demo-input/Images/Scan2D/02_image_de_test_ERREUR_rotation_7deg.png'));
 const selected=await opened.locator('[data-input-selection-count]').textContent();
 requireResult(/1 sélectionné/.test(selected||''),'Core picker: sélection non transmise');
 await opened.locator('#studioInputConfirm').click();
 await opened.waitForFunction(()=>document.querySelectorAll('#imageList .imageItem').length>=2,null,{timeout:20000});
 await opened.waitForFunction(()=>document.querySelector('#imageList .imageItem.active strong')?.textContent?.startsWith('02_image_de_test_'),null,{timeout:20000});
 await opened.waitForFunction(()=>document.querySelector('#msg')?.textContent?.startsWith('02_image_de_test_'),null,{timeout:20000});
 const count=await opened.locator('#collectionStatus').textContent();
 requireResult((count||'').includes('2 image'),'Image Studio: nombre d’images incorrect: '+count);

 if(issues.length)throw Error('Erreurs JavaScript détectées : '+issues.join(' | '));
 console.log(JSON.stringify({ok:true,scope:'Demo gallery + icon gallery + Image Studio V2',samples:7,tested:['gallery-filter','demo-deeplink','core-picker-selection','canvas-active-image','common-header'],canvas:'1600 × 1200'},null,2));
}finally{await browser.close()}
