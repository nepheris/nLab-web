import{mountStudioV2}from'../../_shared/studio-v2/frame.js';
import{resolveStudioVersions,applyVersionDocumentMeta}from'../../_shared/studio-v2/version-service.js';
import{readWorkbook,workbookToObjects,workbookFromObjects,workbookFromObjectsWithProfile,workbookStructureProfile,workbookBlob,toCsv,parseCsv}from'../../_shared/studio-v2/tabular-service.js';
import{writeStructuredDocx}from'../../_shared/studio-v2/document-format-service.js';
import{generateDataset,inferSchema,applyFormatProfileToSchema,TYPE_OPTIONS,markdownTable,generateDocumentModel,documentToMarkdown,documentToHtml,syntheticDocumentFromStructure}from'../../_shared/studio-v2/synthetic-data-service.js';
import{analyzeRichStructure,summarizeStructure}from'../../_shared/studio-v2/structural-clone-service.js';
import{runOcr}from'../../_shared/studio-v2/ocr-service.js';
import{downloadBlob}from'../../_shared/studio-v2/download-service.js';
import studioManifest from'./studio-manifest.js';

const VERSION_INFO=await resolveStudioVersions({versionsHref:new URL('../versions.json',import.meta.url).href,coreVersionHref:new URL('../../_shared/studio-v2/version.json',import.meta.url).href,channel:'test',sourcePath:studioManifest.sourcePath});
applyVersionDocumentMeta({studioName:studioManifest.name,studioVersion:VERSION_INFO.version,studioStatus:VERSION_INFO.status,coreVersion:VERSION_INFO.coreVersion,build:VERSION_INFO.build});
await mountStudioV2({manifest:studioManifest,versionInfo:VERSION_INFO});

const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
let mode='table',data=[],schema=[],docModel=null,cloneSchema=[],cloneSourceName='',cloneStructure=null,cloneKind='table',cloneWorkbookProfile=null;
const status=m=>{$('#status').textContent=m;const s=$('#studioStatusText');if(s)s.textContent=m};
const esc=s=>String(s??'').replace(/[&<>"]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[m]));
const typeOptions=sel=>TYPE_OPTIONS.map(([v,l])=>'<option value="'+v+'"'+(v===sel?' selected':'')+'>'+esc(l)+'</option>').join('');
const presets={
 generic:[['test_id','synthetic_id'],['name','full_name'],['category','category'],['value','decimal'],['date','date'],['public_url','url']],
 people:[['person_id','synthetic_id'],['first_name','first_name'],['last_name','last_name'],['email','email'],['phone','phone'],['city','city']],
 finance:[['transaction_id','synthetic_id'],['date','date'],['amount','price'],['tax_rate','percentage'],['category','category'],['reference','uuid']],
 catalog:[['sku','sku'],['label','lorem'],['ean13','ean13'],['price','price'],['category','category'],['image_url','image_url']],
 logistics:[['package_id','synthetic_id'],['sku','sku'],['ean13','ean13'],['code128','code128'],['qr_payload','qr_payload'],['data_matrix','data_matrix']],
 recipe:[['recipe_id','synthetic_id'],['recipe_title','recipe_title'],['ingredient','ingredient'],['quantity','decimal'],['unit','unit'],['step','lorem'],['category','category']]
};
function setSchema(rows){schema=rows.map((x,i)=>({id:'c'+Date.now()+'-'+i,name:x.name||x[0],type:x.type||x[1]||'category',enabled:x.enabled!==false}));renderSchema()}
function renderSchema(){
 const host=$('#schemaRows');host.innerHTML='';
 schema.forEach((c,i)=>{
  const row=document.createElement('div');row.className='schemaRow';row.dataset.schemaIndex=i;
  row.innerHTML='<input class="colName" aria-label="Nom colonne" value="'+esc(c.name)+'"><select class="colType" aria-label="Type colonne">'+typeOptions(c.type)+'</select><button class="removeCol" type="button" title="Supprimer la colonne">×</button>';
  row.querySelector('.colName').oninput=e=>c.name=e.target.value;
  row.querySelector('.colType').onchange=e=>c.type=e.target.value;
  row.querySelector('.removeCol').onclick=()=>{schema.splice(i,1);renderSchema()};
  host.append(row)
 })
}
function applyPreset(){
 const p=$('#preset').value;setSchema((presets[p]||presets.generic).map(([name,type])=>({name,type})));status('Preset '+p+' chargé.')
}
function renderTable(){
 $('#docPreview').hidden=true;$('#table').hidden=false;$('#previewTitle').textContent='Aperçu tabulaire';$('#count').textContent=data.length+' ligne(s)';
 const keys=[...new Set(data.flatMap(o=>Object.keys(o||{})))];
 $('#table').innerHTML='<thead><tr>'+keys.map(k=>'<th>'+esc(k)+'</th>').join('')+'</tr></thead><tbody>'+data.slice(0,250).map(o=>'<tr>'+keys.map(k=>'<td>'+esc(o[k]??'')+'</td>').join('')+'</tr>').join('')+'</tbody>';
}
function renderDocument(){
 $('#table').hidden=true;$('#docPreview').hidden=false;$('#previewTitle').textContent='Aperçu document';$('#count').textContent=(docModel?.blocks?.length||0)+' bloc(s)';
 $('#docPreview').innerHTML=documentToHtml(docModel||{}).match(/<body>([\s\S]*)<\/body>/i)?.[1]||'';
}
function generateTable(){
 data=generateDataset(schema,Number($('#rows').value)||40,Number($('#seed').value)||1);renderTable();status(data.length+' lignes synthétiques générées.')
}
function generateDoc(){
 docModel=generateDocumentModel({title:$('#docTitle').value||'Document de démonstration',chapters:Number($('#docChapters').value)||3,sections:Number($('#docSections').value)||2,paragraphs:Number($('#docParagraphs').value)||2,seed:Number($('#seed').value)||1,includeTable:$('#docTables').checked,includeImages:$('#docImages').checked});renderDocument();status('Document synthétique généré : '+docModel.blocks.length+' blocs.')
}
function setMode(next){
 mode=next;$$('.modeBtn').forEach(b=>b.classList.toggle('active',b.dataset.mode===next));$$('.modePanel').forEach(p=>p.hidden=p.dataset.panel!==next);
 if(next==='document'){if(!docModel)generateDoc();else renderDocument()}else renderTable()
}
function generateCurrent(){
 if(mode==='document')return generateDoc();
 if(mode==='clone'){
  if(cloneKind==='document'&&cloneStructure){
   docModel=syntheticDocumentFromStructure(cloneStructure,{title:'Démonstration — '+(cloneSourceName||'document'),seed:Number($('#seed').value)||1,preserveShape:$('#clonePolicy').value==='shape'});
   renderDocument();status('Document de démonstration régénéré depuis la structure détectée.');return
  }
  data=generateDataset(cloneSchema,Number($('#cloneRows').value)||100,Number($('#seed').value)||1);renderTable();status('Clone synthétique généré : '+data.length+' lignes, '+cloneSchema.length+' colonnes.');return
 }
 generateTable()
}
function isDocumentMode(){return mode==='document'||(mode==='clone'&&cloneKind==='document')}
function nameStem(){return isDocumentMode()?'nlab-document-demo':'nlab-dataset-demo'}
function ensureTable(){if(isDocumentMode())throw new Error('Export tabulaire indisponible pour ce document.');if(!data.length)generateCurrent()}
async function exportJson(){if(isDocumentMode())return downloadBlob(new Blob([JSON.stringify(docModel,null,2)],{type:'application/json'}),nameStem()+'.json');ensureTable();downloadBlob(new Blob([JSON.stringify({schema:'nlab-demo-dataset/v1',synthetic:true,generatorVersion:'2.2.0',columns:(mode==='clone'?cloneSchema:schema),sourceFormatProfile:cloneWorkbookProfile||null,records:data},null,2)],{type:'application/json'}),nameStem()+'.json')}
async function exportCsv(){ensureTable();downloadBlob(new Blob([toCsv(data,{delimiter:';',bom:true})],{type:'text/csv;charset=utf-8'}),nameStem()+'.csv')}
async function exportXlsx(){ensureTable();const wb=cloneWorkbookProfile?workbookFromObjectsWithProfile(data,cloneWorkbookProfile,{sheetName:cloneWorkbookProfile.sheetName||'Synthetic'}):workbookFromObjects(data,{sheetName:'Synthetic'});downloadBlob(workbookBlob(wb,'xlsx'),nameStem()+'.xlsx')}
async function exportMd(){if(isDocumentMode())downloadBlob(new Blob([documentToMarkdown(docModel)],{type:'text/markdown;charset=utf-8'}),nameStem()+'.md');else{ensureTable();downloadBlob(new Blob(['# nLab Dataset Demo\n\n'+markdownTable(data)],{type:'text/markdown;charset=utf-8'}),nameStem()+'.md')}}
async function exportHtml(){if(!isDocumentMode())throw new Error('HTML riche disponible pour les documents.');downloadBlob(new Blob([documentToHtml(docModel)],{type:'text/html;charset=utf-8'}),nameStem()+'.html')}
async function exportDocx(){if(!isDocumentMode())throw new Error('DOCX disponible pour les documents.');downloadBlob(await writeStructuredDocx(docModel),nameStem()+'.docx')}
async function exportPdf(){
 if(!isDocumentMode())throw new Error('PDF disponible pour les documents.');
 const api=window.jspdf?.jsPDF;if(!api)throw new Error('jsPDF indisponible');
 const pdf=new api({unit:'mm',format:'a4'}),margin=16,maxW=178;let y=18;
 const nextPage=(need=10)=>{if(y+need>280){pdf.addPage();y=18}};
 for(const b of docModel.blocks||[]){
  if(/^h[123]$/.test(b.type)){const lvl=Number(b.type[1]),size={1:18,2:15,3:12}[lvl]||12;nextPage(size);pdf.setFont('helvetica','bold');pdf.setFontSize(size);const lines=pdf.splitTextToSize(b.text,maxW);pdf.text(lines,margin,y);y+=lines.length*(size*.42)+4}
  else if(b.type==='p'){pdf.setFont('helvetica','normal');pdf.setFontSize(10);const lines=pdf.splitTextToSize(b.text,maxW);for(const line of lines){nextPage(5);pdf.text(line,margin,y);y+=4.6}y+=2}
  else if(b.type==='table'){pdf.setFontSize(8);const rows=[b.columns,...b.rows];for(const row of rows){nextPage(6);pdf.text(row.map(String).join('  |  '),margin,y);y+=5}y+=2}
  else if(b.type==='image'){nextPage(16);pdf.setFontSize(9);pdf.text('[Illustration synthétique] '+b.alt,margin,y);y+=10}
 }
 pdf.save(nameStem()+'.pdf');status('PDF de démonstration téléchargé.')
}
async function parseClone(file){
 if(!file)throw new Error('Aucun fichier sélectionné.');
 const ext=(file.name.split('.').pop()||'').toLowerCase();cloneSourceName=file.name;
 if(ext==='csv'||file.type.includes('csv')||ext==='json'||file.type.includes('json')||['xlsx','xls'].includes(ext)){
  let records=[];cloneWorkbookProfile=null;
  if(ext==='csv'||file.type.includes('csv'))records=parseCsv(await file.text(),{header:true,dynamicTyping:true});
  else if(ext==='json'||file.type.includes('json')){const j=JSON.parse(await file.text());records=Array.isArray(j)?j:(j.records||j.data||[j])}
  else {const wb=await readWorkbook(file);records=workbookToObjects(wb);cloneWorkbookProfile=workbookStructureProfile(wb)}
  if(!records.length)throw new Error('Aucune ligne exploitable.');
  cloneKind='table';cloneStructure=null;cloneSchema=applyFormatProfileToSchema(inferSchema(records),cloneWorkbookProfile);$('#editInTableMode').disabled=false;
  const fmt=cloneWorkbookProfile?.columns?.filter(x=>x.numberFormat).map(x=>x.name+' ['+x.formatKind+': '+x.numberFormat+']').join(', ');
  $('#cloneSummary').textContent=file.name+' · '+cloneSchema.length+' colonne(s) détectée(s) : '+cloneSchema.map(c=>c.name+' → '+c.type).join(', ')+(fmt?' · formats : '+fmt:'');
  data=generateDataset(cloneSchema,Number($('#cloneRows').value)||100,Number($('#seed').value)||1);renderTable();status('Structure tabulaire détectée sans recopier les valeurs source. Jeu de démonstration généré.');return
 }
 cloneKind='document';cloneSchema=[];cloneWorkbookProfile=null;$('#editInTableMode').disabled=true;
 const useOcr=$('#cloneOcr').checked&&(file.type||'').startsWith('image/');
 cloneStructure=await analyzeRichStructure(file,{language:$('#cloneOcrLang').value,ocr:useOcr?(input,{language})=>runOcr(input,{engine:'auto',language,logger:m=>{if(m?.status)status('OCR · '+m.status+(m.progress!=null?' '+Math.round(m.progress*100)+' %':''))}}):null});
 const summary=summarizeStructure(cloneStructure);
 $('#cloneSummary').textContent=file.name+' · '+String(summary.format).toUpperCase()+' · '+summary.pages+' page(s) · '+summary.headings+' titre(s) · '+summary.paragraphs+' paragraphe(s) · '+summary.tables+' tableau(x) · '+summary.images+' image(s)'+(summary.ocrApplied?' · OCR appliqué':'');
 docModel=syntheticDocumentFromStructure(cloneStructure,{title:'Démonstration — '+file.name,seed:Number($('#seed').value)||1,preserveShape:$('#clonePolicy').value==='shape'});
 renderDocument();status('Structure documentaire détectée et document fictif indépendant généré.')
}
$$('.modeBtn').forEach(b=>b.onclick=()=>setMode(b.dataset.mode));
$('#preset').onchange=applyPreset;$('#applyPreset').onclick=applyPreset;$('#addColumn').onclick=()=>{schema.push({id:'c'+Date.now(),name:'colonne_'+(schema.length+1),type:'category',enabled:true});renderSchema()};
$('#editInTableMode').onclick=()=>{if(!cloneSchema.length)return;setSchema(cloneSchema);setMode('table');status('Types détectés chargés dans le configurateur de colonnes.')};
$('#clonePolicy').onchange=()=>{if(cloneKind==='document'&&cloneStructure)generateCurrent()};
$('#openOcrStudio').onclick=()=>{location.href='../../ocr-studio/v2/?from=dataset-generator'};
$('#cloneDrop').onclick=()=>$('#cloneFile').click();$('#cloneDrop').onkeydown=e=>{if(e.key==='Enter'||e.key===' ')$('#cloneFile').click()};$('#cloneFile').onchange=e=>parseClone(e.target.files?.[0]).catch(x=>status(x.message));
for(const ev of ['dragenter','dragover'])$('#cloneDrop').addEventListener(ev,e=>{e.preventDefault();e.currentTarget.classList.add('drag')});
for(const ev of ['dragleave','drop'])$('#cloneDrop').addEventListener(ev,e=>{e.preventDefault();e.currentTarget.classList.remove('drag')});
$('#cloneDrop').addEventListener('drop',e=>parseClone(e.dataTransfer.files?.[0]).catch(x=>status(x.message)));

const actions={generate:generateCurrent,randomize:()=>{$('#seed').value=Math.floor(Math.random()*2147483647);generateCurrent()},cloneRich:()=>setMode('clone'),ocrStudio:()=>{location.href='../../ocr-studio/v2/?from=dataset-generator'},exportJson,exportCsv,exportXlsx,exportMd,exportHtml,exportDocx,exportPdf,advanced:()=>status('Dataset Generator 2.2 : clone riche actif. Étape suivante : packs multi-fichiers, manifests et rendu de symbologies via QR & Barcode Studio.')};
document.addEventListener('studio-v2:action',e=>{const a=actions[e.detail?.action];if(a)Promise.resolve().then(a).catch(x=>status(x.message))});
setSchema(presets.generic.map(([name,type])=>({name,type})));generateTable();
