const enc=new TextEncoder();
function hex(buf){return [...new Uint8Array(buf)].map(b=>b.toString(16).padStart(2,'0')).join('')}
export function generateArtifactId(prefix='NLAB'){
 const d=new Date(),stamp=d.toISOString().replace(/[-:TZ.]/g,'').slice(0,14),rnd=crypto.getRandomValues(new Uint32Array(1))[0].toString(16).toUpperCase().padStart(8,'0');
 return String(prefix||'NLAB').replace(/[^A-Z0-9_-]/gi,'').toUpperCase()+'-'+stamp+'-'+rnd;
}
export async function sha256(input){
 let data;
 if(input instanceof Blob)data=await input.arrayBuffer();
 else if(input instanceof ArrayBuffer)data=input;
 else if(ArrayBuffer.isView(input))data=input.buffer.slice(input.byteOffset,input.byteOffset+input.byteLength);
 else data=enc.encode(String(input??''));
 return hex(await crypto.subtle.digest('SHA-256',data));
}
export async function buildArtifactManifest({blob,id=null,studio='unknown',studioVersion='test',source='',operations=[],meta={}}={}){
 if(!(blob instanceof Blob))throw new Error('Blob requis');
 return{schema:'nlab-artifact/v1',id:id||generateArtifactId(studio.replace(/-studio$/i,'')),sha256:await sha256(blob),size:blob.size,type:blob.type||'application/octet-stream',studio,studioVersion,source,createdAt:new Date().toISOString(),operations:[...operations],meta:{...meta}};
}
export async function verifyArtifactManifest(blob,manifest){
 if(!(blob instanceof Blob))throw new Error('Blob requis');
 const digest=await sha256(blob);
 return{ok:!!manifest&&manifest.schema==='nlab-artifact/v1'&&digest===manifest.sha256,sha256:digest,expected:manifest?.sha256||null,id:manifest?.id||null};
}
export function downloadManifest(manifest,name='artifact.manifest.json'){
 const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([JSON.stringify(manifest,null,2)],{type:'application/json'}));a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000)
}
