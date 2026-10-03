const text=n=>String(n?.textContent||'').replace(/\s+/g,' ').trim();

export function coarseTextShape(value=''){
 const s=String(value??'');
 return {length:s.length,words:(s.trim().match(/\S+/g)||[]).length,digits:(s.match(/\d/g)||[]).length,upper:(s.match(/[A-ZÀ-ÖØ-Ý]/g)||[]).length,lines:s.split(/\r?\n/).length};
}
export function detectHeadingLevelFromStyle(styleName=''){
 const s=String(styleName||'').toLowerCase();
 const m=s.match(/(?:heading|titre|title)[^0-9]*([1-3])/);return m?Number(m[1]):null
}
function xmlDoc(xml){return new DOMParser().parseFromString(xml,'application/xml')}
function qAll(root,selectors){for(const s of selectors){const a=[...root.querySelectorAll(s)];if(a.length)return a}return[]}
export function structureFromDocxXml(xml){
 const d=xmlDoc(xml),blocks=[];
 for(const p of qAll(d,['w\\:body > w\\:p','body > p','p'])){
  const style=p.querySelector('w\\:pStyle,pStyle')?.getAttribute('w:val')||p.querySelector('pStyle')?.getAttribute('val')||'';
  const lvl=detectHeadingLevelFromStyle(style);
  const t=[...p.querySelectorAll('w\\:t,t')].map(text).join('').trim();
  if(!t)continue;blocks.push(lvl?{type:'heading',level:lvl,shape:coarseTextShape(t)}:{type:'paragraph',shape:coarseTextShape(t)})
 }
 for(const tbl of qAll(d,['w\\:tbl','tbl'])){
  const rows=[...tbl.querySelectorAll('w\\:tr,tr')].map(tr=>[...tr.querySelectorAll('w\\:tc,tc')].map(tc=>text(tc))).filter(r=>r.length);
  if(rows.length)blocks.push({type:'table',columns:rows[0].map((_,i)=>'Colonne '+(i+1)),columnCount:rows[0].length,rowCount:Math.max(1,rows.length-1)})
 }
 return{kind:'document',format:'docx',blocks}
}
export function structureFromOdtXml(xml){
 const d=xmlDoc(xml),blocks=[];
 for(const n of [...d.querySelectorAll('text\\:h,text\\:p,h,p')]){
  const tag=n.localName||n.tagName,heading=/^h$/i.test(tag),lvl=heading?Math.max(1,Math.min(3,Number(n.getAttribute('text:outline-level')||n.getAttribute('outline-level')||1))):null;
  const t=text(n);if(!t)continue;blocks.push(heading?{type:'heading',level:lvl,shape:coarseTextShape(t)}:{type:'paragraph',shape:coarseTextShape(t)})
 }
 for(const table of [...d.querySelectorAll('table\\:table,table')]){
  const rows=[...table.querySelectorAll('table\\:table-row,table-row')],first=rows[0];
  const count=first?[...first.querySelectorAll('table\\:table-cell,table-cell')].length:0;
  if(count)blocks.push({type:'table',columns:Array.from({length:count},(_,i)=>'Colonne '+(i+1)),columnCount:count,rowCount:Math.max(1,rows.length-1)})
 }
 return{kind:'document',format:'odt',blocks}
}
export async function readDocxStructure(file){
 if(!globalThis.JSZip)throw new Error('JSZip indisponible');const z=await JSZip.loadAsync(file),x=await z.file('word/document.xml')?.async('string');if(!x)throw new Error('DOCX sans document.xml');return structureFromDocxXml(x)
}
export async function readOdtStructure(file){
 if(!globalThis.JSZip)throw new Error('JSZip indisponible');const z=await JSZip.loadAsync(file),x=await z.file('content.xml')?.async('string');if(!x)throw new Error('ODT sans content.xml');return structureFromOdtXml(x)
}
function itemHeight(it){const t=it?.transform;return Math.abs(Number(t?.[3]||t?.[0]||0))}
export async function readPdfStructure(file){
 if(!globalThis.pdfjsLib)throw new Error('PDF.js indisponible');
 const pdf=await pdfjsLib.getDocument({data:await file.arrayBuffer()}).promise,blocks=[];
 for(let p=1;p<=pdf.numPages;p++){
  const page=await pdf.getPage(p),tc=await page.getTextContent(),items=(tc.items||[]).filter(i=>String(i.str||'').trim());
  const heights=items.map(itemHeight).filter(Boolean).sort((a,b)=>a-b),median=heights[Math.floor(heights.length/2)]||10;
  blocks.push({type:'page',page:p});
  for(const it of items){
   const s=String(it.str||'').trim();if(!s)continue;const h=itemHeight(it);
   const level=h>=median*1.7?1:h>=median*1.35?2:h>=median*1.15?3:null;
   blocks.push(level?{type:'heading',level,shape:coarseTextShape(s),page:p}:{type:'paragraph',shape:coarseTextShape(s),page:p})
  }
 }
 return{kind:'document',format:'pdf',pages:pdf.numPages,blocks}
}
export async function imageStructure(file,{ocr=null,language='fra'}={}){
 let recognized='';if(ocr)recognized=await ocr(file,{language});
 return{kind:'image',format:(file.type||'image').split('/')[1]||'image',blocks:[{type:'image',width:null,height:null},...(recognized?[{type:'paragraph',shape:coarseTextShape(recognized),ocr:true}]:[])],ocrApplied:Boolean(recognized)}
}
export async function analyzeRichStructure(file,{ocr=null,language='fra'}={}){
 const ext=(file.name.split('.').pop()||'').toLowerCase();
 if(ext==='docx')return readDocxStructure(file);
 if(ext==='odt')return readOdtStructure(file);
 if(ext==='pdf')return readPdfStructure(file);
 if((file.type||'').startsWith('image/')||['png','jpg','jpeg','webp','bmp','tif','tiff'].includes(ext))return imageStructure(file,{ocr,language});
 throw new Error('Format riche non pris en charge : '+ext.toUpperCase())
}
export function summarizeStructure(s){
 const b=s?.blocks||[],count=t=>b.filter(x=>x.type===t).length;
 return{format:s?.format||'',pages:s?.pages||count('page'),headings:count('heading'),paragraphs:count('paragraph'),tables:count('table'),images:count('image'),ocrApplied:Boolean(s?.ocrApplied)}
}
