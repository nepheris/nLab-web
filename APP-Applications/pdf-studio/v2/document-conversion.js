import{writeDocx,writeOdt}from'../../_shared/studio-v2/document-format-service.js';

const safeName=s=>String(s||'document').replace(/[\\/:*?"<>|]+/g,'_').replace(/\s+/g,' ').trim()||'document';
function stem(name='document.pdf'){return safeName(name.replace(/\.[^.]+$/,''))}
async function pdfPagesText(engine,pages){const out=[];for(const p of pages)out.push({page:p,text:await engine.pageText(p)});return out}
export class DocumentConversion{
 constructor({engine,workspace,variables}){this.engine=engine;this.workspace=workspace;this.variables=variables}
 async pdfTo(format,pages){
  if(!this.engine.pdfDoc)throw new Error('Aucun PDF');
  const list=pages?.length?pages:Array.from({length:this.engine.pageCount},(_,i)=>i+1),rows=await pdfPagesText(this.engine,list),base=stem(this.engine.fileName);
  if(format==='txt'){const blob=new Blob([rows.map(r=>'--- Page '+r.page+' ---\n'+r.text).join('\n\n')],{type:'text/plain;charset=utf-8'});return{blob,name:base+'.txt',fidelity:'texte'}}
  if(format==='docx'){const blob=await writeDocx(rows,{pageLabels:true});return{blob,name:base+'.docx',fidelity:'texte-structure'}}
  if(format==='odt'){const blob=await writeOdt(rows,{pageLabels:true});return{blob,name:base+'.odt',fidelity:'texte-structure'}}
  throw new Error('Format de conversion inconnu : '+format)
 }
}
