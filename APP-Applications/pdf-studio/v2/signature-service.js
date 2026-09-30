const DSS_URL_KEY='nlab-pdf-dss-service-url-v1';
const cleanBase=v=>String(v||'').trim().replace(/\/+$/,'');
const ensureUrl=v=>{const x=cleanBase(v);if(x&&!/^https:\/\//i.test(x)&&!/^http:\/\/localhost(?::\d+)?$/i.test(x))throw new Error('URL DSS invalide : HTTPS requis hors localhost');return x};

export class PdfSignatureService{
 constructor(){this.baseUrl=cleanBase(localStorage.getItem(DSS_URL_KEY)||'')}
 setBaseUrl(url){this.baseUrl=ensureUrl(url);if(this.baseUrl)localStorage.setItem(DSS_URL_KEY,this.baseUrl);else localStorage.removeItem(DSS_URL_KEY);return this.baseUrl}
 async request(path,options={}){if(!this.baseUrl)throw new Error('Configurez le service privé DSS/PAdES.');const r=await fetch(this.baseUrl+path,options);if(!r.ok)throw new Error('DSS HTTP '+r.status+' · '+(await r.text()).slice(0,500));return r}
 async health(){const r=await this.request('/api/v1/health');return r.json()}
 async validate(pdfBytes){
  const fd=new FormData();fd.append('document',new Blob([pdfBytes],{type:'application/pdf'}),'document.pdf');
  const r=await this.request('/api/v1/validate',{method:'POST',body:fd});const ct=r.headers.get('content-type')||'';return ct.includes('json')?r.json():r.text()
 }
 async sign({pdfBytes,certificateFile,password='',padesLevel='PAdES_BASELINE_B',certificationLevel='NOT_CERTIFIED',reason='',location='',contact='',signerName='',appearance='signature'}={}){
  if(!pdfBytes)throw new Error('Aucun PDF à signer');
  if(!(certificateFile instanceof File))throw new Error('Sélectionnez un certificat PKCS#12/P12/PFX');
  if(!/\.(p12|pfx)$/i.test(certificateFile.name))throw new Error('Le certificat doit être un fichier .p12 ou .pfx');
  const fd=new FormData();
  fd.append('document',new Blob([pdfBytes],{type:'application/pdf'}),'document.pdf');
  fd.append('certificate',certificateFile,certificateFile.name);
  fd.append('password',password);fd.append('padesLevel',padesLevel);fd.append('certificationLevel',certificationLevel);
  fd.append('reason',reason);fd.append('location',location);fd.append('contact',contact);fd.append('signerName',signerName);fd.append('appearance',appearance);
  const r=await this.request('/api/v1/pades/sign',{method:'POST',body:fd}),ct=r.headers.get('content-type')||'';
  if(!ct.includes('application/pdf'))throw new Error('Le service DSS n’a pas renvoyé de PDF signé');
  return new Uint8Array(await r.arrayBuffer())
 }
 async extend(pdfBytes,level='PAdES_BASELINE_LT'){
  const fd=new FormData();fd.append('document',new Blob([pdfBytes],{type:'application/pdf'}),'document.pdf');fd.append('level',level);
  const r=await this.request('/api/v1/pades/extend',{method:'POST',body:fd}),ct=r.headers.get('content-type')||'';
  if(!ct.includes('application/pdf'))throw new Error('Le service DSS n’a pas renvoyé de PDF étendu');
  return new Uint8Array(await r.arrayBuffer())
 }
}
