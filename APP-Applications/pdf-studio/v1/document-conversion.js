import{downloadBlob,safeName}from'../../_shared/studio-v1/core.js';
function esc(s=''){return String(s).replace(/[&<>"]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[m]))}
function stem(name='document.pdf'){return safeName(name.replace(/\.[^.]+$/,''))}
async function pdfPagesText(engine,pages){const out=[];for(const p of pages)out.push({page:p,text:await engine.pageText(p)});return out}
function docxParagraph(text){return '<w:p><w:r><w:t xml:space="preserve">'+esc(text)+'</w:t></w:r></w:p>'}
async function makeDocx(rows){
 if(!window.JSZip)throw new Error('JSZip indisponible');
 const z=new JSZip();
 z.file('[Content_Types].xml','<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/></Types>');
 z.folder('_rels').file('.rels','<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>');
 const body=[];
 rows.forEach((r,i)=>{body.push(docxParagraph('Page '+r.page));for(const line of String(r.text||'').split(/\n+/))body.push(docxParagraph(line));if(i<rows.length-1)body.push('<w:p><w:r><w:br w:type="page"/></w:r></w:p>')});
 z.folder('word').file('document.xml','<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body>'+body.join('')+'<w:sectPr><w:pgSz w:w="11906" w:h="16838"/><w:pgMar w:top="1440" w:right="1440" w:bottom="1440" w:left="1440"/></w:sectPr></w:body></w:document>');
 return z.generateAsync({type:'blob',mimeType:'application/vnd.openxmlformats-officedocument.wordprocessingml.document',compression:'DEFLATE'})
}
async function makeOdt(rows){
 if(!window.JSZip)throw new Error('JSZip indisponible');
 const z=new JSZip();
 z.file('mimetype','application/vnd.oasis.opendocument.text',{compression:'STORE'});
 z.folder('META-INF').file('manifest.xml','<?xml version="1.0" encoding="UTF-8"?><manifest:manifest xmlns:manifest="urn:oasis:names:tc:opendocument:xmlns:manifest:1.0"><manifest:file-entry manifest:full-path="/" manifest:media-type="application/vnd.oasis.opendocument.text"/><manifest:file-entry manifest:full-path="content.xml" manifest:media-type="text/xml"/></manifest:manifest>');
 const body=[];rows.forEach((r,i)=>{body.push('<text:h text:outline-level="1">Page '+r.page+'</text:h>');for(const line of String(r.text||'').split(/\n+/))body.push('<text:p>'+esc(line)+'</text:p>');if(i<rows.length-1)body.push('<text:p text:style-name="PageBreak"/>')});
 z.file('content.xml','<?xml version="1.0" encoding="UTF-8"?><office:document-content xmlns:office="urn:oasis:names:tc:opendocument:xmlns:office:1.0" xmlns:text="urn:oasis:names:tc:opendocument:xmlns:text:1.0" office:version="1.3"><office:body><office:text>'+body.join('')+'</office:text></office:body></office:document-content>');
 return z.generateAsync({type:'blob',mimeType:'application/vnd.oasis.opendocument.text',compression:'DEFLATE'})
}
export class DocumentConversion{
 constructor({engine,workspace,variables}){this.engine=engine;this.workspace=workspace;this.variables=variables}
 async pdfTo(format,pages){
  if(!this.engine.pdfDoc)throw new Error('Aucun PDF');
  const list=pages?.length?pages:Array.from({length:this.engine.pageCount},(_,i)=>i+1),rows=await pdfPagesText(this.engine,list),base=stem(this.engine.fileName);
  if(format==='txt'){const blob=new Blob([rows.map(r=>'--- Page '+r.page+' ---\n'+r.text).join('\n\n')],{type:'text/plain;charset=utf-8'});downloadBlob(blob,base+'.txt');return{blob,name:base+'.txt',fidelity:'texte'}}
  if(format==='docx'){const blob=await makeDocx(rows);downloadBlob(blob,base+'.docx');return{blob,name:base+'.docx',fidelity:'texte-structure'}}
  if(format==='odt'){const blob=await makeOdt(rows);downloadBlob(blob,base+'.odt');return{blob,name:base+'.odt',fidelity:'texte-structure'}}
  throw new Error('Format de conversion inconnu : '+format)
 }
}
