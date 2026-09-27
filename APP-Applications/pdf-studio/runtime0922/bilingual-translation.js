(function(){
'use strict';
var BRK='BRK104-pdf-bilingual-translator';
function q(s){return document.querySelector(s)}
function mk(tag,cls){var e=document.createElement(tag);if(cls)e.className=cls;return e}
function status(t,k){var e=q('#brk104Status');if(!e)return;e.textContent=t;e.className='status '+(k==='err'?'err':k==='warn'?'warn':'ok')}
function prog(v){var e=q('#brk104Progress');if(e)e.style.width=Math.max(0,Math.min(100,v))+'%'}
function opts(auto){var a=[];if(auto)a.push('<option value="auto">Auto-détection</option>');a.push('<option value="fr">Français</option>','<option value="en">Anglais</option>','<option value="de">Allemand</option>','<option value="es">Espagnol</option>');return a.join('')}
function sourceFile(){var x=q('#brk104File');if(x&&x.files&&x.files[0])return x.files[0];var m=q('#fileInput');if(m&&m.files){for(var i=0;i<m.files.length;i++)if(/\.pdf$/i.test(m.files[i].name))return m.files[i]}return null}
function panel(){
 if(q('#brk104Panel'))return;
 var host=q('.right .panel-body')||q('aside.right .panel-body')||document.body;
 var s=mk('section','side-section');s.id='brk104Panel';
 s.innerHTML='<h3>🌐 Traduction bilingue <span style="margin-left:auto;font-size:10px;color:#667085">'+BRK+'</span></h3>'+
 '<div class="body"><div class="help">Original intact + traduction en vis-à-vis.</div>'+
 '<div class="row"><label>PDF source</label><input id="brk104File" type="file" accept="application/pdf,.pdf"></div>'+
 '<div class="row"><label>Source</label><select id="brk104Source">'+opts(true)+'</select></div>'+
 '<div class="row"><label>Traduction</label><select id="brk104Target">'+opts(false)+'</select></div>'+
 '<div class="row"><label>Mode</label><select id="brk104Layout"><option value="side_by_side">Côte à côte</option><option value="facing_pages">Double-page / livre</option></select></div>'+
 '<div id="brk104Side"><div class="row"><label>Répartition</label><select id="brk104Ratio"><option value="0.333333">1/3 source · 2/3 traduction</option><option value="0.5" selected>50 % · 50 %</option><option value="0.666667">2/3 source · 1/3 traduction</option></select></div>'+
 '<div class="row"><label>Original</label><select id="brk104Position"><option value="left">À gauche</option><option value="right">À droite</option></select></div></div>'+
 '<div id="brk104Facing" class="hidden"><div class="row"><label>Parité</label><select id="brk104Parity"><option value="source_on_even">Original page paire (gauche)</option><option value="source_on_odd">Original page impaire (droite)</option></select></div></div>'+
 '<div class="row"><label>Moteur</label><select id="brk104Provider"><option value="auto">Auto nLab / navigateur</option><option value="apps-script">nLab Apps Script</option><option value="browser">Navigateur</option><option value="endpoint">Endpoint HTTP</option></select></div>'+
 '<div class="row" id="brk104EndpointRow" style="display:none"><label>Endpoint</label><input id="brk104Endpoint" type="text" placeholder="https://…/translate"></div>'+
 '<label style="display:block;margin:7px 0"><input type="checkbox" id="brk104Protect" checked> Protéger nombres, unités et références</label>'+
 '<button class="btn primary" id="brk104Run">Générer le PDF bilingue</button><div class="progress" style="margin-top:8px"><i id="brk104Progress"></i></div><div id="brk104Status"></div></div>';
 host.insertBefore(s,host.firstChild);
 q('#brk104Target').value='fr';
 q('#brk104Source').value='auto';
 q('#brk104Layout').onchange=function(){var f=this.value==='facing_pages';q('#brk104Side').classList.toggle('hidden',f);q('#brk104Facing').classList.toggle('hidden',!f)};
 q('#brk104Provider').onchange=function(){q('#brk104EndpointRow').style.display=this.value==='endpoint'?'flex':'none'};
 q('#brk104Run').onclick=run;
}
function tab(){
 var r=q('.ribbon');if(!r||q('[data-tab="bilingual"]'))return;
 var b=mk('button','tab');b.setAttribute('data-tab','bilingual');b.textContent='🌐 Traduction';
 var sep=r.querySelector('.sep');r.insertBefore(b,sep||r.firstChild);
 b.onclick=function(){var ts=r.querySelectorAll('.tab');for(var i=0;i<ts.length;i++)ts[i].classList.remove('active');b.classList.add('active');panel();q('#brk104Panel').scrollIntoView({behavior:'smooth',block:'start'})};
}
async function extract(file){
 if(!window.pdfjsLib)throw new Error('PDF.js indisponible');
 var bytes=await file.arrayBuffer(),pdf=await pdfjsLib.getDocument({data:bytes.slice(0)}).promise,pages=[];
 for(var i=1;i<=pdf.numPages;i++){var p=await pdf.getPage(i),tc=await p.getTextContent(),t=tc.items.map(function(x){return x.str||''}).join(' ').replace(/\s+/g,' ').trim();pages.push(t);prog(i/pdf.numPages*18)}
 return {bytes:bytes,pages:pages};
}
function detect(t){
 var s=' '+String(t).toLowerCase()+' ',sets={fr:[' le ',' la ',' les ',' des ',' une ',' pour ',' avec ',' sécurité '],en:[' the ',' and ',' of ',' to ',' with ',' warning ',' safety '],de:[' der ',' die ',' das ',' und ',' mit ',' für ',' sicherheit '],es:[' el ',' la ',' los ',' las ',' de ',' con ',' para ',' seguridad ']},best='en',score=-1;
 Object.keys(sets).forEach(function(l){var n=0;sets[l].forEach(function(w){n+=s.split(w).length-1});if(n>score){score=n;best=l}});return best;
}
function protect(t){
 var a=[],out=String(t),rs=[/https?:\/\/\S+/g,/\b[A-Z]{1,6}\d[A-Z0-9._/-]*\b/g,/\b\d+(?:[.,]\d+)?\s?(?:Nm|N·m|kPa|MPa|PSI|psi|V|W|kW|A|Ah|mA|mm|cm|m|km|kg|g|mg|L|ml|°C|°F|rpm|tr\/min|mph|km\/h|%|Hz)\b/gi,/\bM\d+(?:[x×]\d+(?:[.,]\d+)?)?\b/g];
 rs.forEach(function(re){out=out.replace(re,function(m){var k='__NLABTOK'+a.length+'__';a.push(m);return k})});
 return {text:out,restore:function(x){return String(x).replace(/__NLABTOK(\d+)__/g,function(m,i){return a[+i]||m})}};
}
function chunks(t,max){max=max||3500;if(t.length<=max)return[t];var o=[],r=t;while(r.length){if(r.length<=max){o.push(r);break}var c=r.lastIndexOf('. ',max);if(c<max*.55)c=r.lastIndexOf(' ',max);if(c<1)c=max;o.push(r.slice(0,c+1).trim());r=r.slice(c+1).trim()}return o}
function appTranslate(texts,s,t){return new Promise(function(ok,no){if(!(window.google&&google.script&&google.script.run))return no(new Error('Launcher Apps Script indisponible'));google.script.run.withSuccessHandler(function(r){ok(r.translations||r)}).withFailureHandler(function(e){no(new Error(e&&e.message||String(e)))}).translateBilingualBatch({texts:texts,sourceLanguage:s,targetLanguage:t})})}
async function browserEngine(s,t){var T=globalThis.Translator||(globalThis.ai&&globalThis.ai.translator);if(!T)throw new Error('API Translator navigateur indisponible');if(T.create)return await T.create({sourceLanguage:s,targetLanguage:t});if(T.createTranslator)return await T.createTranslator({sourceLanguage:s,targetLanguage:t});throw new Error('API Translator incompatible')}
async function endpoint(texts,s,t,url){if(!url)throw new Error('Endpoint manquant');var r=await fetch(url,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({texts:texts,sourceLanguage:s,targetLanguage:t})});if(!r.ok)throw new Error('Endpoint HTTP '+r.status);var j=await r.json(),a=j.translations||j.results||j;if(!Array.isArray(a))throw new Error('Réponse endpoint invalide');return a.map(function(x){return typeof x==='string'?x:(x.text||x.translation||'')})}
async function translate(pages,s,t,provider,url,doProtect){
 if(s==='auto')s=detect(pages.slice(0,3).join(' '));if(s===t)throw new Error('Source et cible identiques');
 var mode=provider,out=[],n=pages.length;
 if(mode==='auto'){if(window.google&&google.script&&google.script.run)mode='apps-script';else if(globalThis.Translator||(globalThis.ai&&globalThis.ai.translator))mode='browser';else if(url)mode='endpoint';else throw new Error('Aucun moteur automatique disponible : utilise le launcher Apps Script, un navigateur compatible Translator API, ou un endpoint.')}
 if(mode==='apps-script'||mode==='endpoint'){
  for(var i=0;i<n;i+=10){var raw=pages.slice(i,i+10).map(function(x){return doProtect?protect(x):{text:x,restore:function(v){return v}}}),arr=mode==='apps-script'?await appTranslate(raw.map(function(x){return x.text}),s,t):await endpoint(raw.map(function(x){return x.text}),s,t,url);arr.forEach(function(x,k){out.push(raw[k].restore(x))});prog(20+Math.min(i+10,n)/n*42)}
 }else{
  var tr=await browserEngine(s,t);
  for(var j=0;j<n;j++){var p=doProtect?protect(pages[j]):{text:pages[j],restore:function(v){return v}},cs=chunks(p.text),aa=[];for(var z=0;z<cs.length;z++)aa.push(await tr.translate(cs[z]));out.push(p.restore(aa.join(' ')));prog(20+(j+1)/n*42)}
  try{if(tr.destroy)tr.destroy()}catch(e){}
 }
 return {pages:out,source:s};
}
function wrap(text,font,size,width){var ws=String(text).replace(/\s+/g,' ').trim().split(' '),ls=[],line='';ws.forEach(function(w){var x=line?line+' '+w:w;if(font.widthOfTextAtSize(x,size)<=width)line=x;else{if(line)ls.push(line);line=w}});if(line)ls.push(line);return ls}
function fit(text,font,w,h){for(var s=10.5;s>=4.2;s-=.3){var l=wrap(text,font,s,w),lh=s*1.22;if(l.length*lh<=h)return{size:s,lines:l,lh:lh}}var z=4.2,zh=z*1.18,zl=wrap(text,font,z,w),mx=Math.max(1,Math.floor(h/zh));return{size:z,lines:zl.slice(0,mx),lh:zh,overflow:zl.length>mx}}
async function side(bytes,trs,s,t,ratio,pos){
 var src=await PDFLib.PDFDocument.load(bytes),out=await PDFLib.PDFDocument.create(),font=await out.embedFont(PDFLib.StandardFonts.Helvetica),bold=await out.embedFont(PDFLib.StandardFonts.HelveticaBold),count=src.getPageCount();
 for(var i=0;i<count;i++){var sp=src.getPage(i),sz=sp.getSize(),sw=sz.width,sh=sz.height,W=sw*2,H=sh,gap=Math.max(10,sw*.025),m=Math.max(12,sw*.03),head=Math.max(22,sh*.045),use=W-2*m-gap,srcW=use*ratio,trW=use-srcW,emb=(await out.embedPdf(bytes,[i]))[0],pg=out.addPage([W,H]),sx,tx;if(pos==='left'){sx=m;tx=m+srcW+gap}else{tx=m;sx=m+trW+gap}var sc=Math.min((srcW-8)/sw,(H-head-m-8)/sh),dw=sw*sc,dh=sh*sc;pg.drawText(s.toUpperCase()+' / '+t.toUpperCase()+' · '+(i+1)+'/'+count,{x:m,y:H-head+6,size:8,font:bold,color:PDFLib.rgb(.18,.22,.28)});pg.drawPage(emb,{x:sx+(srcW-dw)/2,y:m+(H-head-m-dh)/2,width:dw,height:dh});var r={x:tx+8,y:m+8,w:trW-16,h:H-head-m-16},ff=fit(trs[i]||'',font,r.w,r.h),y=r.y+r.h-ff.size;ff.lines.forEach(function(line){pg.drawText(line,{x:r.x,y:y,size:ff.size,font:font,color:PDFLib.rgb(.05,.06,.08)});y-=ff.lh});prog(64+(i+1)/count*34)}
 return await out.save();
}
async function trPage(out,w,h,text,s,t,n,total){
 var p=out.addPage([w,h]),font=await out.embedFont(PDFLib.StandardFonts.Helvetica),bold=await out.embedFont(PDFLib.StandardFonts.HelveticaBold),m=Math.max(28,w*.06),head=Math.max(34,h*.06);p.drawText(s.toUpperCase()+' → '+t.toUpperCase()+' · page '+n+'/'+total,{x:m,y:h-head+8,size:10,font:bold,color:PDFLib.rgb(.15,.19,.25)});var ff=fit(text,font,w-2*m,h-head-m),y=h-head-ff.size;ff.lines.forEach(function(line){p.drawText(line,{x:m,y:y,size:ff.size,font:font,color:PDFLib.rgb(.04,.05,.07)});y-=ff.lh})}
async function facing(bytes,trs,s,t,parity){
 var src=await PDFLib.PDFDocument.load(bytes),out=await PDFLib.PDFDocument.create(),count=src.getPageCount(),first=src.getPage(0).getSize();if(parity==='source_on_even')out.addPage([first.width,first.height]);
 for(var i=0;i<count;i++){var sp=src.getPage(i),sz=sp.getSize(),cp=(await out.copyPages(src,[i]))[0];out.addPage(cp);await trPage(out,sz.width,sz.height,trs[i]||'',s,t,i+1,count);prog(64+(i+1)/count*34)}
 return await out.save();
}
function dl(bytes,name){var a=document.createElement('a'),b=new Blob([bytes],{type:'application/pdf'});a.href=URL.createObjectURL(b);a.download=name;a.click();setTimeout(function(){URL.revokeObjectURL(a.href)},1500)}
async function run(){
 try{prog(0);var f=sourceFile();if(!f)throw new Error('Choisis un PDF source.');status('Extraction du PDF…','warn');var d=await extract(f),s=q('#brk104Source').value,t=q('#brk104Target').value;status('Traduction automatique…','warn');var tr=await translate(d.pages,s,t,q('#brk104Provider').value,q('#brk104Endpoint').value.trim(),q('#brk104Protect').checked);status('Composition du PDF bilingue…','warn');var mode=q('#brk104Layout').value,bytes=mode==='side_by_side'?await side(d.bytes,tr.pages,tr.source,t,Number(q('#brk104Ratio').value),q('#brk104Position').value):await facing(d.bytes,tr.pages,tr.source,t,q('#brk104Parity').value),stem=f.name.replace(/\.pdf$/i,''),name=stem+'_Traduction_bilingue_'+tr.source.toUpperCase()+'-'+t.toUpperCase()+'.pdf';dl(bytes,name);prog(100);status('PDF bilingue généré : '+d.pages.length+' pages source.')}
 catch(e){console.error('[BRK104]',e);status(e&&e.message||String(e),'err')}
}
function boot(){panel();tab();window.NLAB_BRK104={brick:BRK,version:'0.1.0',run:run}}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();