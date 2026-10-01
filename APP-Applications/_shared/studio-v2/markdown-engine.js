export class MarkdownEngine{
  constructor({marked=window.marked,DOMPurify=window.DOMPurify,yaml=window.jsyaml}={}){
    this.marked=marked; this.DOMPurify=DOMPurify; this.yaml=yaml;
  }
  splitFrontMatter(source=''){
    const s=String(source||'');
    if(!s.startsWith('---\n')&&!s.startsWith('---\r\n')) return {yamlText:'',body:s,data:{}};
    const m=s.match(/^---\s*\r?\n([\s\S]*?)\r?\n---\s*\r?\n?/);
    if(!m)return {yamlText:'',body:s,data:{}};
    const yamlText=m[1];
    let data={}; try{data=this.yaml?.load(yamlText)||{}}catch(e){data={__error:String(e.message||e)}}
    return {yamlText,body:s.slice(m[0].length),data};
  }
  compose({yamlText='',body=''}={}){
    const y=String(yamlText||'').trim();
    return y?'---\n'+y+'\n---\n\n'+String(body||'').replace(/^\s+/,''):String(body||'');
  }
  parseYaml(text=''){return this.yaml?.load(String(text||''))||{}}
  dumpYaml(data={}){return this.yaml?.dump(data,{noRefs:true,lineWidth:100,sortKeys:false})||''}
  render(source=''){
    const {body}=this.splitFrontMatter(source);
    const raw=this.marked?.parse?this.marked.parse(body,{gfm:true,breaks:false}):body;
    return this.DOMPurify?.sanitize?this.DOMPurify.sanitize(raw,{USE_PROFILES:{html:true}}):raw;
  }
  slug(s=''){return String(s).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9\s-]/g,'').trim().replace(/\s+/g,'-').replace(/-+/g,'-')||'section'}
  headings(source=''){
    const {body}=this.splitFrontMatter(source), out=[], used=new Map();
    for(const line of body.split(/\r?\n/)){
      const m=line.match(/^(#{1,6})\s+(.+?)\s*#*$/); if(!m)continue;
      const level=m[1].length,text=m[2].replace(/\[([^\]]+)\]\([^\)]+\)/g,'$1').replace(/[*_~]/g,'').replace(/\x60/g,'').trim();
      let id=this.slug(text),n=used.get(id)||0; used.set(id,n+1); if(n)id+='-'+(n+1);
      out.push({level,text,id});
    }
    return out;
  }
  renderWithAnchors(source=''){
    const heads=this.headings(source); let i=0;
    let html=this.render(source);
    html=html.replace(/<h([1-6])([^>]*)>([\s\S]*?)<\/h\1>/g,(all,l,attrs,inner)=>{
      const h=heads[i++]; return h?'<h'+l+attrs+' id="'+h.id+'">'+inner+'</h'+l+'>':all;
    });
    return {html,headings:heads};
  }
  wordCount(source=''){
    const {body}=this.splitFrontMatter(source),plain=body.replace(/[\x60*_>#\[\]()!|~-]/g,' ');
    return (plain.match(/\S+/g)||[]).length;
  }
  insertAt(text,start,end,before='',after='',placeholder='texte'){
    const src=String(text||''),sel=src.slice(start,end)||placeholder;
    return {text:src.slice(0,start)+before+sel+after+src.slice(end),start:start+before.length,end:start+before.length+sel.length};
  }
}
