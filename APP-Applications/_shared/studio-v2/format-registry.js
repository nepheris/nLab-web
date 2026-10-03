const defs=[
 {family:'pdf',ext:['pdf'],mime:['application/pdf'],preview:'pdf',quickPdf:true},
 {family:'image',ext:['jpg','jpeg','png','webp','bmp','gif','svg','tif','tiff'],mime:['image/'],preview:'image',quickPdf:true},
 {family:'text',ext:['txt','md','markdown','csv','tsv','json','yaml','yml','xml','html','htm'],mime:['text/','application/json','application/xml'],preview:'text',quickPdf:true},
 {family:'document',ext:['docx','odt'],mime:['application/vnd.openxmlformats-officedocument.wordprocessingml.document','application/vnd.oasis.opendocument.text'],preview:'document',quickPdf:true},
 {family:'document',ext:['doc','rtf'],mime:['application/msword','application/rtf'],preview:'document',quickPdf:false,advanced:true},
 {family:'spreadsheet',ext:['xlsx','xls','ods'],mime:['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet','application/vnd.ms-excel','application/vnd.oasis.opendocument.spreadsheet'],preview:'spreadsheet',quickPdf:false,advanced:true},
 {family:'presentation',ext:['pptx','ppt','odp'],mime:['application/vnd.openxmlformats-officedocument.presentationml.presentation','application/vnd.ms-powerpoint','application/vnd.oasis.opendocument.presentation'],preview:'presentation',quickPdf:false,advanced:true},
 {family:'archive',ext:['zip'],mime:['application/zip'],preview:'archive',quickPdf:false}
];
export const FORMAT_DEFINITIONS=Object.freeze(defs.map(x=>Object.freeze({...x,ext:Object.freeze(x.ext)})));
export const extensionOf=name=>(String(name||'').toLowerCase().match(/\.([a-z0-9]+)$/)?.[1]||'');
export function formatInfo(fileOrName,mime=''){
 const name=typeof fileOrName==='string'?fileOrName:fileOrName?.name||'',type=String(typeof fileOrName==='string'?mime:fileOrName?.type||mime).toLowerCase(),e=extensionOf(name);
 const d=defs.find(x=>x.ext.includes(e)||x.mime.some(m=>m.endsWith('/')?type.startsWith(m):type===m));
 return d?{...d,extension:e,name,type}:{family:'unknown',ext:[],mime:[],preview:'unknown',quickPdf:false,advanced:false,extension:e,name,type};
}
export function acceptedExtensions(){return [...new Set(defs.flatMap(x=>x.ext))]}
export function acceptAttribute(){return acceptedExtensions().map(x=>'.'+x).join(',')}
export function isSupportedFile(file){return formatInfo(file).family!=='unknown'}
export function fileTypeLabel(file){const f=formatInfo(file);return (f.extension||f.family||'fichier').toUpperCase()}

export function definitionsForFamily(families){const set=new Set(Array.isArray(families)?families:[families]);return defs.filter(x=>set.has(x.family))}
export function acceptForFamilies(families){return[...new Set(definitionsForFamily(families).flatMap(x=>x.ext))].map(x=>'.'+x).join(',')}
export function iconPathFor(fileOrName,mime=''){const f=formatInfo(fileOrName,mime),id=f.extension||('generic-'+(f.family==='text'?'document':f.family));return '../../assets/icons/filetype/'+id+'.svg'}
export function studioForFormat(fileOrName,mime=''){const f=formatInfo(fileOrName,mime);return({pdf:'pdf-studio',image:'image-studio',text:'document-studio',document:'document-studio',spreadsheet:'spreadsheet-studio',presentation:'presentation-studio',archive:'archive-studio'})[f.family]||'file-studio'}
