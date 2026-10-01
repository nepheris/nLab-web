const esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
function inline(s){
 s=esc(s);
 s=s.replace(/`([^`]+)`/g,'<code>$1</code>');
 s=s.replace(/\*\*([^*]+)\*\*/g,'<strong>$1</strong>').replace(/__([^_]+)__/g,'<strong>$1</strong>');
 s=s.replace(/\*([^*]+)\*/g,'<em>$1</em>').replace(/_([^_]+)_/g,'<em>$1</em>');
 s=s.replace(/\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g,'<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
 return s
}
export function markdownToSafeHtml(markdown=''){
 const lines=String(markdown).replace(/\r\n?/g,'\n').split('\n'),out=[];let inCode=false,code=[],list=null;
 const closeList=()=>{if(list){out.push('</'+list+'>');list=null}};
 for(const raw of lines){
  if(/^\s*```/.test(raw)){if(inCode){out.push('<pre><code>'+esc(code.join('\n'))+'</code></pre>');code=[];inCode=false}else{closeList();inCode=true}continue}
  if(inCode){code.push(raw);continue}
  if(!raw.trim()){closeList();continue}
  let m;
  if((m=raw.match(/^(#{1,6})\s+(.+)$/))){closeList();const n=m[1].length;out.push('<h'+n+'>'+inline(m[2])+'</h'+n+'>');continue}
  if((m=raw.match(/^\s*[-*+]\s+(.+)$/))){if(list!=='ul'){closeList();list='ul';out.push('<ul>')}out.push('<li>'+inline(m[1])+'</li>');continue}
  if((m=raw.match(/^\s*\d+[.)]\s+(.+)$/))){if(list!=='ol'){closeList();list='ol';out.push('<ol>')}out.push('<li>'+inline(m[1])+'</li>');continue}
  if((m=raw.match(/^>\s?(.*)$/))){closeList();out.push('<blockquote>'+inline(m[1])+'</blockquote>');continue}
  if(/^(-{3,}|\*{3,}|_{3,})\s*$/.test(raw)){closeList();out.push('<hr>');continue}
  closeList();out.push('<p>'+inline(raw)+'</p>')
 }
 if(inCode)out.push('<pre><code>'+esc(code.join('\n'))+'</code></pre>');closeList();return out.join('\n')
}
export async function renderMarkdownFilePreview(file,host,{maxChars=500000}={}){
 if(!file||!host)throw new Error('Fichier ou zone d’aperçu absent');
 const raw=(await file.text()).slice(0,maxChars);
 host.innerHTML='<article class="markdownFilePreview"><header><strong>'+esc(file.name||'Markdown')+'</strong><small>Aperçu Markdown isolé</small></header><div class="markdownPreviewBody">'+markdownToSafeHtml(raw)+'</div><details><summary>Source brute</summary><pre>'+esc(raw)+'</pre></details></article>';
 return{raw,length:raw.length,truncated:(file.size||0)>maxChars}
}
export async function renderPlainTextPreview(file,host,{maxChars=500000}={}){
 const raw=(await file.text()).slice(0,maxChars);host.innerHTML='<div class="statusBox rawTextFallback"><b>'+esc(file.name||'Texte')+'</b><pre>'+esc(raw)+'</pre></div>';return{raw,length:raw.length}
}
