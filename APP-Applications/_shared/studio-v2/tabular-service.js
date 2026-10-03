export function rowsToObjects(rows){const a=rows||[],head=a[0]||[];return a.slice(1).map(r=>Object.fromEntries(head.map((h,i)=>[String(h||'col_'+(i+1)),r[i]??''])))}
export function objectsToRows(items){const list=Array.isArray(items)?items:(items?.records||[items]),keys=[...new Set(list.flatMap(r=>Object.keys(r||{})))];return[keys,...list.map(r=>keys.map(k=>r?.[k]??''))]}
export function parseCsv(text,{delimiter='',header=true,dynamicTyping=true}={}){if(globalThis.Papa){const r=Papa.parse(String(text??''),{header,skipEmptyLines:true,dynamicTyping,delimiter});if(r.errors?.length)console.warn(r.errors);return r.data}const lines=String(text??'').split(/\r?\n/).filter(Boolean),sep=delimiter||(/[;\t|]/.exec(lines[0]||'')?.[0]||','),rows=lines.map(l=>l.split(sep));return header?rowsToObjects(rows):rows}
export function toCsv(data,{delimiter=';',bom=true}={}){const rows=Array.isArray(data)&&Array.isArray(data[0])?data:objectsToRows(data),q=v=>'"'+String(v??'').replaceAll('"','""')+'"';return(bom?'\ufeff':'')+rows.map(r=>r.map(q).join(delimiter)).join('\r\n')}
export function filterRows(rows,{query='',column='',value=''}={}){const q=String(query||'').trim().toLowerCase(),v=String(value||'').trim().toLowerCase();return(rows||[]).filter(r=>{if(q&&!Object.values(r||{}).some(x=>String(x??'').toLowerCase().includes(q)))return false;if(v){const vals=column?[r?.[column]]:Object.values(r||{});if(!vals.some(x=>String(x??'').toLowerCase().includes(v)))return false}return true})}
export function sortRows(rows,column,direction='asc'){if(!column)return[...(rows||[])];const dir=direction==='desc'?-1:1;return[...(rows||[])].sort((a,b)=>{const av=a?.[column],bv=b?.[column],an=Number(av),bn=Number(bv);let x;if(av==null&&bv==null)x=0;else if(av==null)x=-1;else if(bv==null)x=1;else if(!Number.isNaN(an)&&!Number.isNaN(bn))x=an-bn;else x=String(av).localeCompare(String(bv),'fr',{numeric:true,sensitivity:'base'});return x*dir})}
export function workbookFromObjects(data,{sheetName='Data'}={}){if(!globalThis.XLSX)throw new Error('XLSX indisponible');const wb=XLSX.utils.book_new(),ws=XLSX.utils.json_to_sheet(data||[]);XLSX.utils.book_append_sheet(wb,ws,sheetName);return wb}
export function workbookFromRows(rows,{sheetName='Data'}={}){if(!globalThis.XLSX)throw new Error('XLSX indisponible');const wb=XLSX.utils.book_new(),ws=XLSX.utils.aoa_to_sheet(rows||[]);XLSX.utils.book_append_sheet(wb,ws,sheetName);return wb}
export function workbookToObjects(wb,sheetName=null){if(!globalThis.XLSX)throw new Error('XLSX indisponible');const name=sheetName||wb?.SheetNames?.[0];return name&&wb.Sheets?.[name]?XLSX.utils.sheet_to_json(wb.Sheets[name],{defval:''}):[]}
export function workbookToRows(wb,sheetName=null){if(!globalThis.XLSX)throw new Error('XLSX indisponible');const name=sheetName||wb?.SheetNames?.[0];return name&&wb.Sheets?.[name]?XLSX.utils.sheet_to_json(wb.Sheets[name],{header:1,defval:''}):[]}

export async function readWorkbook(file){if(!globalThis.XLSX)throw new Error('XLSX indisponible');return XLSX.read(await file.arrayBuffer(),{type:'array',cellDates:true})}
export function workbookFromCsv(text,{delimiter=''}={}){if(!globalThis.XLSX)throw new Error('XLSX indisponible');return XLSX.read(String(text??''),{type:'string',FS:delimiter||undefined})}
export function workbookFromJson(data,{sheetName='Data'}={}){return workbookFromObjects(Array.isArray(data)?data:(data?.records||[data]),{sheetName})}
export function workbookBlob(wb,bookType='xlsx'){if(!globalThis.XLSX)throw new Error('XLSX indisponible');const arr=XLSX.write(wb,{bookType,type:'array'});const mime=bookType==='ods'?'application/vnd.oasis.opendocument.spreadsheet':'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';return new Blob([arr],{type:mime})}

function formatKind(z=''){
 const s=String(z||'').toLowerCase();
 if(/%/.test(s))return'percentage';
 if(/[€]|eur|\[\$€/.test(s))return'currency_eur';
 if(/\$|usd/.test(s))return'currency_usd';
 if(/£|gbp/.test(s))return'currency_gbp';
 if(/[ymd]|dd|mm|yy/.test(s)&&/[dmy]/.test(s))return'date';
 if(/0\.0+/.test(s))return'decimal';
 if(/0/.test(s))return'number';
 return'general'
}
export function workbookStructureProfile(wb,sheetName=null){
 if(!globalThis.XLSX)throw new Error('XLSX indisponible');
 const name=sheetName||wb?.SheetNames?.[0],ws=name&&wb.Sheets?.[name];if(!ws)return{sheetName:name||'',columns:[]};
 const range=XLSX.utils.decode_range(ws['!ref']||'A1:A1'),columns=[];
 for(let col=range.s.c;col<=range.e.c;col++){
  const h=ws[XLSX.utils.encode_cell({r:range.s.r,c:col})],header=String(h?.v??('col_'+(col+1)));
  const formats={},types={};let sampleCount=0;
  for(let row=range.s.r+1;row<=Math.min(range.e.r,range.s.r+40);row++){
   const cell=ws[XLSX.utils.encode_cell({r:row,c:col})];if(!cell)continue;sampleCount++;
   if(cell.z)formats[cell.z]=(formats[cell.z]||0)+1;if(cell.t)types[cell.t]=(types[cell.t]||0)+1
  }
  const numberFormat=Object.entries(formats).sort((a,b)=>b[1]-a[1])[0]?.[0]||'';
  const cellType=Object.entries(types).sort((a,b)=>b[1]-a[1])[0]?.[0]||'';
  columns.push({name:header,index:col,numberFormat,formatKind:formatKind(numberFormat),cellType,width:ws['!cols']?.[col]?.wch||null,sampleCount});
 }
 return{sheetName:name,columns,freeze:ws['!freeze']||null,autoFilter:ws['!autofilter']?.ref||null};
}
export function workbookFromObjectsWithProfile(data,profile,{sheetName='Synthetic'}={}){
 if(!globalThis.XLSX)throw new Error('XLSX indisponible');
 const wb=workbookFromObjects(data,{sheetName}),ws=wb.Sheets[sheetName],range=XLSX.utils.decode_range(ws['!ref']||'A1:A1');
 const byName=new Map((profile?.columns||[]).map(c=>[String(c.name),c]));
 for(let col=range.s.c;col<=range.e.c;col++){
  const head=String(ws[XLSX.utils.encode_cell({r:0,c:col})]?.v??''),fmt=byName.get(head);if(!fmt)continue;
  for(let row=1;row<=range.e.r;row++){
   const addr=XLSX.utils.encode_cell({r:row,c:col}),cell=ws[addr];if(!cell)continue;
   if(fmt.numberFormat)cell.z=fmt.numberFormat;
   if(fmt.formatKind==='percentage'&&typeof cell.v==='number')cell.v=cell.v/100;
   if(fmt.formatKind==='date'&&typeof cell.v==='string'&&/^\d{4}-\d{2}-\d{2}/.test(cell.v)){cell.v=new Date(cell.v);cell.t='d'}
  }
 }
 if(profile?.columns?.length)ws['!cols']=profile.columns.map(c=>c.width?{wch:c.width}:undefined);
 if(profile?.autoFilter)ws['!autofilter']={ref:profile.autoFilter};
 return wb
}
