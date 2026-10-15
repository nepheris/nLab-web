// Static runtime-contract tests: Node 22 built-ins only, no repository or browser mutation.
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';
const file=new URL('../APP-Applications/_shared/studio-v2/version-service.js',import.meta.url);
const source=(await readFile(file,'utf8'))
  .replace(/^import\{resolveBuildMetadata,applyBuildMetadata\}from'\.\/build-metadata-service\.js';\s*/,'')
  .replace(/^export /gm,'');
const registry={current:'2.7.0',test:'2.7.1',versions:[
 {version:'2.7.0',status:'current'}, {version:'2.7.1',status:'test'},
 {version:'2.6.0',status:'historical'}
]};
async function run(query,options={},missing=false){
 const requests=[],metadata=[];
 const context={
  URLSearchParams,
  location:{search:query},
  fetch:async(url)=>{requests.push(url);if(missing||url==='missing.json')return{ok:false,status:404};
   return{ok:true,json:async()=>url.includes('versions.json')?registry:{version:'3.4.0'}};},
  resolveBuildMetadata:async args=>({version:args.fallback.version,channel:args.fallback.channel}),
  applyBuildMetadata:obj=>metadata.push(obj)
 };
 const api=vm.runInNewContext(source+'\n;({resolveStudioVersions})',context,{filename:'version-service.js'});
 const res=await api.resolveStudioVersions(options);return {res,requests,metadata};
}
const normal=(await run('')).res;
assert.equal(normal.studioVersion,'2.7.1');
assert.equal(normal.studioStatus,'TEST');
assert.equal(normal.coreVersion,'3.4.0');
const current=(await run('?channel=current')).res;
assert.equal(current.studioVersion,'2.7.0');
assert.equal(current.studioStatus,'CURRENT');
const old=(await run('?version=2.6.0&channel=historical')).res;
assert.equal(old.studioVersion,'2.6.0');
assert.equal(old.studioStatus,'HISTORICAL');
assert.equal(old.requestedVersion,'2.6.0');
const missing=(await run('?version=999.1&channel=current')).res;
assert.equal(missing.studioVersion,'2.7.0','unknown historical version must not manufacture identity');
assert.equal(missing.studioStatus,'CURRENT');
const offline=await run('?version=2.6.0',{versionsHref:'missing.json'},true);
assert.equal(offline.res.studioVersion,'');
assert.equal(offline.res.studioStatus,'TEST');
assert.equal(offline.metadata.length,1);
console.log(JSON.stringify({ok:true,component:'studio-version-resolver',scenarios:['test','current','historical','unknown-version-fallback','offline-registry']}));
