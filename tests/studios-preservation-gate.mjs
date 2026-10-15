import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
const root=path.resolve('.');
const baseline=JSON.parse(fs.readFileSync('tests/fixtures/studios-preservation-baseline.json','utf8'));
assert.equal(baseline.schema,'nlab.studios.version-preservation-baseline/v1');
let protectedRoutes=0;
const failures=[];
for(const [id,expected] of Object.entries(baseline.studios)){
 const dir=path.join(root,'APP-Applications',id);
 const regPath=path.join(dir,'versions.json');
 if(!fs.existsSync(regPath)){failures.push(id+': missing version registry');continue}
 let actual;
 try{actual=JSON.parse(fs.readFileSync(regPath,'utf8'))}catch(e){failures.push(id+': invalid registry '+e.message);continue}
 if((actual.current||null)!==expected.current)failures.push(id+': CURRENT modified '+expected.current+' -> '+(actual.current||null));
 const current=new Map((actual.versions||[]).map(v=>[String(v.version),v]));
 for(const historic of expected.versions){
  const v=current.get(historic.version);
  if(!v){failures.push(id+' '+historic.version+': declared version removed');continue}
  if(String(v.href)!==historic.href)failures.push(id+' '+historic.version+': historical URL modified');
  const url=new URL(historic.href,'https://nlab.invalid/APP-Applications/'+id+'/');
  const pathname=decodeURIComponent(url.pathname);
  const candidate=path.resolve(root,'.'+pathname);
  // Demo Studio legitimately links to Library/demo outside APP-Applications.
  // Reject escapes outside the repository, while preserving registered cross-directory routes.
  if(!candidate.startsWith(root+path.sep)&&candidate!==root){failures.push(id+' '+historic.version+': route escapes repository');continue}
  const target=pathname.endsWith('/')?path.join(candidate,'index.html'):candidate;
  if(!fs.existsSync(target)||!fs.statSync(target).isFile())failures.push(id+' '+historic.version+': route target missing '+path.relative(root,target));
  protectedRoutes++;
 }
}
if(failures.length){console.error(JSON.stringify({ok:false,failures},null,2));process.exitCode=1}
else console.log(JSON.stringify({ok:true,studios:Object.keys(baseline.studios).length,protectedRoutes,currentPointers:Object.values(baseline.studios).filter(s=>s.current).length}));
