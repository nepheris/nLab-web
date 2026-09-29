function escRe(s=''){return String(s).replace(/[.*+?^$()|[\]\\]/g,'\\$&')}

export class DemoCorpus{
  constructor({indexUrl}={}){this.indexUrl=indexUrl;this.index=null;this.manifestCache=new Map()}
  async loadIndex(){
    if(this.index)return this.index;
    const r=await fetch(this.indexUrl,{cache:'no-store'});
    if(!r.ok)throw new Error('Corpus démo indisponible · HTTP '+r.status);
    this.index=await r.json();return this.index
  }
  async studioEntry(studioId){const idx=await this.loadIndex();return(idx.studios||[]).find(x=>x.id===studioId)||null}
  async loadManifest(studioId){
    if(this.manifestCache.has(studioId))return this.manifestCache.get(studioId);
    const entry=await this.studioEntry(studioId);if(!entry)throw new Error('Aucun pack démo pour '+studioId);
    const url=new URL(entry.manifest,this.indexUrl).href;
    const r=await fetch(url,{cache:'no-store'});if(!r.ok)throw new Error('Manifest démo inaccessible · HTTP '+r.status);
    const data=await r.json(),state={entry,url,data};this.manifestCache.set(studioId,state);return state
  }
  async list(studioId,{extensions=null,localOnly=true}={}){
    const {url,data}=await this.loadManifest(studioId);let files=[...(data.files||[])];
    if(localOnly)files=files.filter(f=>f.storage==='local'&&f.path);
    if(extensions?.length){const re=new RegExp('\\.('+extensions.map(x=>escRe(String(x).replace(/^\\./,''))).join('|')+')$','i');files=files.filter(f=>re.test(f.name||f.path||''))}
    return files.map(f=>({...f,url:new URL(f.path,url).href}))
  }
  async fetchFiles(studioId,opts={}){
    const entries=await this.list(studioId,opts),out=[];
    for(const e of entries){const r=await fetch(e.url,{cache:'no-store'});if(!r.ok)throw new Error('Fichier démo inaccessible : '+e.name+' · HTTP '+r.status);const blob=await r.blob();out.push(new File([blob],e.name,{type:blob.type||'application/octet-stream',lastModified:Date.now()}))}
    return out
  }
}

export async function loadDemoCorpusFiles({studioId,indexUrl,extensions=null}={}){const corpus=new DemoCorpus({indexUrl});return corpus.fetchFiles(studioId,{extensions,localOnly:true})}
