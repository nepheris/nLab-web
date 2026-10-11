/* Guide Froid — investigation Mermaid, TEST only. Trusted defect catalog. */
document.addEventListener('DOMContentLoaded',async()=>{
 if(document.body.dataset.page!=='investigation')return;
 const id=new URLSearchParams(location.search).get('id');
 const d=DEFECTS.find(x=>x[0]===id);if(!d)return;
 const codes=d[3].split(',').filter(Boolean);
 const name=code=>(TESTS.find(x=>x[0]===code)||[code,'Contrôle'])[1];
 const safe=s=>String(s).replace(/["<>\r\n]/g,' ').slice(0,105);
 const lines=['flowchart TD','start(["Constat : '+safe(d[1])+'"])','context["Observer, photographier et noter les circonstances"]','start --> context'];
 let prev='context';
 codes.forEach((code,i)=>{
   const decision='D'+i,check='T'+i;
   lines.push(decision+'{"'+safe('Une anomalie est-elle visible au contrôle '+code+' ?')+'"}');
   lines.push(check+'["'+safe(code+' · '+name(code))+'"]');
   lines.push(prev+' --> '+check);
   lines.push(check+' --> '+decision);
   lines.push('click '+check+' "test.html?id='+encodeURIComponent(code)+'" "Fiche '+code+'" _blank');
   if(i<codes.length-1)lines.push(decision+' -->|Non ou indéterminé| T'+(i+1));
   else lines.push(decision+' -->|Non ou indéterminé| escalate');
   lines.push(decision+' -->|Oui| document');
   prev=decision;
 });
 if(!codes.length)lines.push('context --> document');
 lines.push('document["Consigner le constat, le test et les photos"]');
 lines.push('escalate["Aucune cause confirmée : consulter la notice et solliciter un technicien"]');
 lines.push('document --> action["'+safe(d[4])+'"]');
 lines.push('action --> stop(["Fin du parcours : bilan et orientation"])');
 lines.push('escalate --> stop');
 const source=lines.join('\n');
 const links=document.querySelector('#mermaid-links');
 links.innerHTML=codes.map(c=>'<a href="test.html?id='+encodeURIComponent(c)+'" target="_blank" rel="noopener noreferrer">'+c+' · '+name(c)+'</a>').join(' · ') || '<span>Aucun test simple adapté : voir la notice fabricant.</span>';
 document.querySelector('#mermaid-text').textContent=source;
 const target=document.querySelector('#mermaid-svg');
 const status=document.querySelector('#mermaid-status');
 const svgFallback=()=>{target.innerHTML='';let y=22;const NS='http://www.w3.org/2000/svg';const svg=document.createElementNS(NS,'svg');svg.setAttribute('viewBox','0 0 980 '+(codes.length*185+410));svg.setAttribute('role','img');svg.setAttribute('aria-label','Parcours de diagnostic cliquable');const add=(text,link,kind)=>{let node=link?document.createElementNS(NS,'a'):svg;if(link){node.setAttribute('href',link);node.setAttribute('target','_blank');node.setAttribute('rel','noopener noreferrer');svg.appendChild(node)}const rect=document.createElementNS(NS,'rect');rect.setAttribute('x','100');rect.setAttribute('y',String(y));rect.setAttribute('width','780');rect.setAttribute('height','65');rect.setAttribute('rx',kind==='decision'?'28':'12');rect.setAttribute('fill',link?'#dceefd':'#eef4fa');rect.setAttribute('stroke','#477b9f');node.appendChild(rect);const tx=document.createElementNS(NS,'text');tx.setAttribute('x','490');tx.setAttribute('y',String(y+37));tx.setAttribute('text-anchor','middle');tx.setAttribute('font-size','16');tx.setAttribute('fill','#173b5a');tx.textContent=String(text).slice(0,95);node.appendChild(tx);y+=91;};add('Constat : '+d[1]);add('Observer, photographier, noter le contexte');codes.forEach(c=>{add(c+' · '+name(c),'test.html?id='+encodeURIComponent(c));add('Anomalie visible ? Oui : documenter / Non : test suivant',null,'decision')});add('Consigner les résultats et les photos');add(d[4]);target.appendChild(svg)};
 try{const {default:mermaid}=await import('https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.esm.min.mjs');mermaid.initialize({startOnLoad:false,securityLevel:'loose',theme:document.documentElement.dataset.theme==='dark'?'dark':'default',flowchart:{htmlLabels:false}});let result=await mermaid.render('gf-invest-'+id.replace(/[^\w-]/g,''),source);target.innerHTML=result.svg;result.bindFunctions?.(target);status.textContent='Diagramme Mermaid interactif : cliquez sur les tests.'}catch(e){svgFallback();status.textContent='Diagramme de secours actif ; moteur Mermaid indisponible : '+String(e.message||e).slice(0,100)}
});
