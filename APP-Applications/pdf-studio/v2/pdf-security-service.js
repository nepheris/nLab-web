const MODULE_URL='https://cdn.jsdelivr.net/npm/pdfstudio@0.4.0/dist/index.js';
const WASM_URL='https://cdn.jsdelivr.net/npm/pdfstudio@0.4.0/dist/wasm/qpdf.wasm';

export class PdfSecurityService{
 constructor(){this.instance=null;this.loading=null}
 async toolkit(){
  if(this.instance)return this.instance;
  if(!this.loading)this.loading=(async()=>{const mod=await import(MODULE_URL);if(typeof mod.createPdfToolkit!=='function')throw new Error('Moteur qpdf WASM invalide');return mod.createPdfToolkit({wasmUrl:WASM_URL})})().then(x=>(this.instance=x,x)).finally(()=>{this.loading=null});
  return this.loading
 }
 async protect(pdfBytes,{userPassword='',ownerPassword='',print='full',modify='all',extract=true}={}){
  const pdf=await this.toolkit();if(!ownerPassword&&!userPassword)throw new Error('Saisissez au moins un mot de passe.');const restricted=print!=='full'||modify!=='all'||!extract;if(restricted&&(!ownerPassword||ownerPassword===userPassword))throw new Error('Pour appliquer des restrictions, utilisez un mot de passe propriétaire distinct du mot de passe d’ouverture.');
  return pdf.lock(pdfBytes,{userPassword,ownerPassword:ownerPassword||userPassword,keyLength:256,permissions:{print,modify,extract:!!extract,accessibility:true}})
 }
 async unlock(pdfInput,password=''){const pdf=await this.toolkit();return pdf.unlock(pdfInput,{password})}
 async info(pdfInput,password){const pdf=await this.toolkit();return pdf.getInfo(pdfInput,password!==undefined?{password}:{})}
 async available(){try{await this.toolkit();return true}catch{return false}}
}
