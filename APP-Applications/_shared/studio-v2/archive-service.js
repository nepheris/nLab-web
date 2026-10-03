export async function createZip(entries,{level=6,type='blob'}={}){
 if(!globalThis.JSZip)throw new Error('JSZip indisponible');const z=new JSZip();
 for(const e of entries||[]){if(!e?.name)continue;z.file(e.name,e.data)}
 return z.generateAsync({type,compression:'DEFLATE',compressionOptions:{level:Math.max(1,Math.min(9,Number(level)||6))}})
}
export async function openZip(file){if(!globalThis.JSZip)throw new Error('JSZip indisponible');return JSZip.loadAsync(file)}
export async function zipEntries(file,{includeDirectories=false}={}){
 const z=await openZip(file),out=[];z.forEach((path,e)=>{if(includeDirectories||!e.dir)out.push({path,dir:e.dir,entry:e})});return out
}
