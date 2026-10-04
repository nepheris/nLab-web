const revokeLater=url=>setTimeout(()=>URL.revokeObjectURL(url),1200);
export function downloadBlob(blob,name='download.bin'){
 if(!(blob instanceof Blob))blob=new Blob([blob]);
 const a=document.createElement('a'),url=URL.createObjectURL(blob);a.href=url;a.download=name;a.style.display='none';document.body.appendChild(a);a.click();a.remove();revokeLater(url);return{name,size:blob.size,type:blob.type||'application/octet-stream'}
}
export function downloadText(text,name='document.txt',mime='text/plain;charset=utf-8'){return downloadBlob(new Blob([String(text??'')],{type:mime}),name)}
export function downloadJson(data,name='data.json',{pretty=true}={}){return downloadText(JSON.stringify(data,null,pretty?2:0),name,'application/json;charset=utf-8')}
export function downloadCsv(csv,name='data.csv',{bom=true}={}){return downloadText((bom?'\ufeff':'')+String(csv??''),name,'text/csv;charset=utf-8')}
export function blobFromText(text,mime='text/plain;charset=utf-8'){return new Blob([String(text??'')],{type:mime})}
