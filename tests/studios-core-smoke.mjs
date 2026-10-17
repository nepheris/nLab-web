// Dedicated no-production-write Chromium acceptance for the shared Studio Core.
// Root of nLab-web must be served at NLAB_BASE_URL.
import { chromium } from 'playwright';
import { checkStudioCoreInputPicker } from './studio-core-input-picker.mjs';
import { checkStudioCoreViewer } from './studio-core-viewer.mjs';
import { checkStudioCoreWindows } from './studio-core-windows.mjs';
import { checkStudioCoreUndoRedoBrowser } from './studio-core-undo-redo-browser.mjs';
import { checkStudioCoreColors } from './studio-core-colors-browser.mjs';
const base=process.env.NLAB_BASE_URL||'http://127.0.0.1:8770/';
const browser=await chromium.launch({headless:true});
const checks=[];
const failures=[];
try{
 for(const test of [checkStudioCoreInputPicker,checkStudioCoreViewer,checkStudioCoreWindows,checkStudioCoreUndoRedoBrowser,checkStudioCoreColors]){
  try{
   const result=await test(browser,base);
   checks.push({name:result.component,checks:result.checks.length,status:'PASS'});
   console.log(JSON.stringify({test:result.component,status:'PASS',checks:result.checks}));
  }catch(error){
   failures.push({name:test.name,error:String(error?.stack||error)});
   console.error(JSON.stringify({test:test.name,status:'FAIL',error:String(error?.stack||error)}));
  }
 }
}finally{await browser.close()}
console.log(JSON.stringify({kind:'studio-core-chromium',passed:checks.length,failed:failures.length,checks,failures},null,2));
if(failures.length)process.exitCode=1;
