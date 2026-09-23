(()=>{'use strict';
const iconMap={
 image:'<svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="8.5" cy="9" r="1.5"/><path d="m4 17 5-5 4 4 3-3 5 5"/></svg>',
 qr:'<svg viewBox="0 0 24 24"><path d="M3 3h6v6H3zM15 3h6v6h-6zM3 15h6v6H3z"/><path d="M14 14h3v3h-3zM19 14h2v7h-2zM14 19h3v2h-3z"/></svg>',
 json:'<svg viewBox="0 0 24 24"><path d="M8 4H6a2 2 0 0 0-2 2v4a2 2 0 0 1-2 2 2 2 0 0 1 2 2v4a2 2 0 0 0 2 2h2M16 4h2a2 2 0 0 1 2 2v4a2 2 0 0 0 2 2 2 2 0 0 0-2 2v4a2 2 0 0 1-2 2h-2"/></svg>',
 code:'<svg viewBox="0 0 24 24"><path d="m8 9-4 3 4 3M16 9l4 3-4 3M14 5l-4 14"/></svg>',
 data:'<svg viewBox="0 0 24 24"><ellipse cx="12" cy="5" rx="8" ry="3"/><path d="M4 5v6c0 1.7 3.6 3 8 3s8-1.3 8-3V5M4 11v6c0 1.7 3.6 3 8 3s8-1.3 8-3v-6"/></svg>',
 file:'<svg viewBox="0 0 24 24"><path d="M3 7h7l2 2h9v10H3z"/><path d="M3 7V5h6l2 2"/></svg>',
 ocr:'<svg viewBox="0 0 24 24"><path d="M5 4h14v16H5zM8 8h8M8 12h8M8 16h5"/><path d="M3 7V3h4M17 3h4v4M3 17v4h4M21 17v4h-4"/></svg>',
 pdf:'<svg viewBox="0 0 24 24"><path d="M6 3h9l4 4v14H6zM15 3v5h5"/><path d="M8 13h8M8 17h6"/></svg>'
};
const btn=(id,label,svg,cls='')=>'<button class="ribbonBtn '+cls+'" data-shell-action="'+id+'" title="'+label+'">'+svg+'<span>'+label+'</span></button>';
function build(){
 const b=document.body,title=b.dataset.studio||document.title.replace(/^nLab\s*/,'').replace(/ —.*/,''),kind=b.dataset.icon||'file',status=b.dataset.status||'Alpha POC';
 const old=b.querySelector(':scope > header'); if(old) old.remove();
 const header=document.createElement('div');header.className='nlabShellHeader';
 header.innerHTML='<a class="shellLink" href="../studios/" title="Retour aux Studios">← Studios</a><div class="nlabMark">nL</div><div class="nlabTitle">'+(iconMap[kind]||'')+'<div class="nlabTitleText"><strong>'+title+'</strong><small>nLab Studios · application web local-first</small></div></div><div class="nlabHeaderRight"><span class="shellPill local">● local-first</span><span class="shellPill">'+status+'</span><a class="shellLink optional" href="../../Library/demo/">Corpus démo</a><a class="shellLink optional" href="../../">nLab Web</a></div>';
 b.prepend(header);
 const menu=document.createElement('div');menu.className='nlabMenuBar';menu.innerHTML='<button class="menuTab">Fichier</button><button class="menuTab active">Accueil</button><button class="menuTab">Outils</button><button class="menuTab">Affichage</button><button class="menuTab">Aide</button>';header.after(menu);
 const ribbon=document.createElement('div');ribbon.className='nlabRibbon';
 const open='<svg viewBox="0 0 24 24"><path d="M3 7h7l2 2h9v10H3z"/><path d="M12 13h6M15 10l3 3-3 3"/></svg>';
 const demo='<svg viewBox="0 0 24 24"><path d="M9 3v5l-4 8a3 3 0 0 0 3 5h8a3 3 0 0 0 3-5l-4-8V3"/><path d="M8 13h8"/></svg>';
 const save='<svg viewBox="0 0 24 24"><path d="M5 3h12l2 2v16H5z"/><path d="M8 3v6h8V3M8 16h8"/></svg>';
 const corpus='<svg viewBox="0 0 24 24"><path d="M4 4h16v16H4zM8 8h8M8 12h8M8 16h5"/></svg>';
 const help='<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M9.8 9a2.3 2.3 0 1 1 3.1 2.2c-.8.3-.9.9-.9 1.8M12 17h.01"/></svg>';
 ribbon.innerHTML='<div class="ribbonGroup">'+btn('open','Ouvrir',open,'primaryRibbon')+btn('demo','Démo',demo)+btn('save','Exporter',save)+'<span class="ribbonLabel">Fichier</span></div><div class="ribbonGroup"><a class="ribbonBtn" href="../../Library/demo/">'+corpus+'<span>Corpus</span></a><a class="ribbonBtn" href="../studios/">'+(iconMap.file||'')+'<span>Studios</span></a><span class="ribbonLabel">nLab</span></div><div class="ribbonGroup">'+btn('help','Aide',help)+'<span class="ribbonLabel">Support</span></div>';
 menu.after(ribbon);
 const bar=document.createElement('div');bar.className='nlabStatusBar';bar.innerHTML='<span><span class="statusDot"></span>Prêt</span><span>Traitement navigateur</span><span class="grow">'+title+'</span>';b.append(bar);
 ribbon.addEventListener('click',e=>{const el=e.target.closest('[data-shell-action]');if(!el)return;const a=el.dataset.shellAction;if(a==='open'){const input=b.querySelector('input[type=file]');input?.click()}else if(a==='demo'){const candidates=[...b.querySelectorAll('button')].filter(x=>/demo/i.test(x.id+' '+x.textContent));candidates[0]?.click()}else if(a==='save'){const candidates=[...b.querySelectorAll('button')].filter(x=>/save|export|download/i.test(x.id+' '+x.textContent));candidates[0]?.click()}else if(a==='help'){alert(title+'\n\nInterface nLab Studio : utilisez le ruban pour ouvrir un fichier, charger une démo, exporter et accéder au corpus de test. Les traitements publics restent local-first autant que possible.')}});
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',build);else build();
})();