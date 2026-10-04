export const SYSTEM_STAMPS=[
 {id:'paid',label:'Payé',shape:'line',text:'PAYÉ'},
 {id:'paid-date',label:'Payé le…',shape:'multiline',text:'PAYÉ LE\n{STAMP_DATE:DD/MM/YYYY}'},
 {id:'archived',label:'Archivé',shape:'line',text:'ARCHIVÉ'},
 {id:'non-conforme',label:'Non Conforme',shape:'line',text:'NON CONFORME'},
 {id:'non-concerne',label:'Non Concerné',shape:'line',text:'NON CONCERNÉ'},
 {id:'work-docs',label:'Documents de travail',shape:'multiline',text:'DOCUMENTS\nDE TRAVAIL'}
];

const esc=s=>String(s??'').replace(/[&<>"]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[m]));
const cleanLines=(text,max=4)=>String(text??'').replace(/\r/g,'').split('\n').map(x=>x.trim()).filter(Boolean).slice(0,max);
const fontFor=(lines,base)=>Math.max(34,Math.min(base,Math.floor(720/Math.max(7,...lines.map(x=>x.length))*1.7)));

function rectSvg(lines,{width=820,height=220,multiline=false}={}){
 const fs=fontFor(lines,multiline?72:92),gap=fs*.98,start=height/2-gap*(lines.length-1)/2;
 const texts=lines.map((line,i)=>'<text x="'+(width/2)+'" y="'+(start+i*gap)+'" text-anchor="middle" dominant-baseline="middle" font-family="Arial,Helvetica,sans-serif" font-size="'+fs+'" font-weight="800" letter-spacing="2" fill="currentColor">'+esc(line)+'</text>').join('');
 return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 '+width+' '+height+'" role="img"><g fill="none" stroke="currentColor"><rect x="8" y="8" width="'+(width-16)+'" height="'+(height-16)+'" rx="18" stroke-width="10"/><rect x="22" y="22" width="'+(width-44)+'" height="'+(height-44)+'" rx="11" stroke-width="5"/></g><g>'+texts+'</g></svg>';
}
function circleSvg(lines){
 const use=lines.length?lines:['VOTRE TEXTE'],fs=fontFor(use,58),gap=fs*.98,start=210-gap*(use.length-1)/2;
 const texts=use.map((line,i)=>'<text x="210" y="'+(start+i*gap)+'" text-anchor="middle" dominant-baseline="middle" font-family="Arial,Helvetica,sans-serif" font-size="'+fs+'" font-weight="800" letter-spacing="1.5" fill="currentColor">'+esc(line)+'</text>').join('');
 return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 420 420" role="img"><g fill="none" stroke="currentColor"><circle cx="210" cy="210" r="194" stroke-width="10"/><circle cx="210" cy="210" r="170" stroke-width="5"/></g><g>'+texts+'</g></svg>';
}
export function createStampSvg({shape='line',text='VOTRE TEXTE'}={}){
 const lines=cleanLines(text,shape==='line'?1:4);
 if(shape==='circle')return circleSvg(lines);
 if(shape==='multiline')return rectSvg(lines.length?lines:['LIGNE 1','LIGNE 2'],{width:820,height:Math.max(300,160+(Math.max(2,lines.length)-1)*92),multiline:true});
 return rectSvg(lines.length?lines:['VOTRE TEXTE'],{width:820,height:220,multiline:false});
}
export async function stampSvgToPngDataUrl(svgText,color='#316D9A',scale=2){
 const ink=/^#[0-9A-F]{6}$/i.test(String(color||''))?color:'#316D9A';
 const painted=String(svgText||'').replace(/currentColor/g,ink);
 const doc=new DOMParser().parseFromString(painted,'image/svg+xml'),root=doc.documentElement,view=(root.getAttribute('viewBox')||'0 0 820 220').trim().split(/\s+/).map(Number);
 const w=Math.max(1,view[2]||820),h=Math.max(1,view[3]||220),blob=new Blob([painted],{type:'image/svg+xml'}),url=URL.createObjectURL(blob);
 try{
  const img=await new Promise((res,rej)=>{const i=new Image();i.onload=()=>res(i);i.onerror=()=>rej(new Error('SVG de tampon non décodable'));i.src=url});
  const canvas=document.createElement('canvas');canvas.width=Math.round(w*scale);canvas.height=Math.round(h*scale);
  canvas.getContext('2d').drawImage(img,0,0,canvas.width,canvas.height);
  return canvas.toDataURL('image/png');
 }finally{URL.revokeObjectURL(url)}
}
export function stampSvgFileName(text='tampon'){
 const s=String(text||'tampon').split('\n')[0].normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,48)||'tampon';
 return 'tampon-'+s+'.svg';
}
export function downloadStampSvg(svgText,fileName='tampon.svg'){
 const blob=new Blob([String(svgText||'')],{type:'image/svg+xml;charset=utf-8'}),a=document.createElement('a');
 a.href=URL.createObjectURL(blob);a.download=fileName;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(a.href),1000);
}
