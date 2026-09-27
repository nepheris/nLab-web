(()=>{'use strict';
if(window.__NLAB_0921_OUTPUT_ROUTING__)return;
window.__NLAB_0921_OUTPUT_ROUTING__=true;
const $o=id=>document.getElementById(id);
function sourceFolderLabel0921(){
 const x=current();if(x?.archiveWorkspaceId0921)return'archive ZIP virtuelle';
 if(x?.parent?.name)return x.parent.name;
 if(S.source?.name)return S.source.name;
 const rel=x?.relativePath||'';return rel.includes('/')?rel.split('/').slice(0,-1).join('/'):'dossier source';
}
function effectiveRoot0921(){
 const mode=outputMode();if(mode==='same-source')return sourceFolderLabel0921();if(mode==='download')return'Téléchargements';return S.dest?.name||'<choisir la racine de sortie>';
}
function syncRoutingUi0921(){
 const mode=outputMode(),rootField=$o('pickDestination')?.closest('.field'),same=mode==='same-source',download=mode==='download',needsRoot=!same&&!download;
 if(rootField){rootField.classList.toggle('routingInactive0921',!needsRoot);rootField.querySelectorAll('button,select').forEach(el=>el.disabled=!needsRoot)}
 const info=$o('routingModeInfo0921');if(info){
  if(same)info.innerHTML='<b>Sortie automatique :</b> même dossier que le fichier source'+(current()?.archiveWorkspaceId0921?' dans le workspace ZIP virtuel.':' — aucun dossier de sortie séparé à choisir.');
  else if(mode==='mirror-tree')info.innerHTML='<b>Sortie :</b> choisissez une racine, puis PDF Studio crée le sous-dossier de traitement et reproduit l’arborescence source.';
  else if(mode==='archive-date')info.innerHTML='<b>Sortie :</b> choisissez une racine, puis PDF Studio classe par année/mois ou semaine.';
  else info.innerHTML='<b>Repli technique :</b> téléchargement navigateur, sans racine de sortie.';
 }
 if($o('destinationChoiceName'))$o('destinationChoiceName').textContent=needsRoot?'Dossier de sortie : '+(S.dest?.name||'à choisir'):'Dossier effectif : '+effectiveRoot0921();
 if($o('destinationChoicePath'))$o('destinationChoicePath').textContent=needsRoot?(S.dest?'Racine : '+S.dest.name:'Choisissez la racine après le mode de sortie.'):(same?'Même emplacement que la source.':'Téléchargements du navigateur.');
 updatePath0921();
}
function updatePath0921(){
 if(!E.archive)return;const mode=outputMode(),name=outName();
 if(mode==='same-source')E.archive.textContent='Sortie prévue : '+sourceFolderLabel0921()+'/'+name;
 else if(mode==='download')E.archive.textContent='Sortie prévue : Téléchargements/'+name;
 else E.archive.textContent='Sortie prévue : '+(S.dest?.name||'<choisir la racine>')+'/'+archivePath(name);
 try{updateQRPreview()}catch(e){}
}
updatePath=updatePath0921;

function reorderOutputUi0921(){
 const section=$o('outputSection')?.querySelector('.sectionBody'),mode=$o('outputMode'),picker=$o('pickDestination');if(!section||!mode||!picker)return;
 const modeField=mode.closest('.field'),rootField=picker.closest('.field');if(modeField&&rootField&&modeField.compareDocumentPosition(rootField)&Node.DOCUMENT_POSITION_PRECEDING){}else if(modeField&&rootField)section.insertBefore(modeField,rootField);
 if(!$o('routingModeInfo0921')){const d=document.createElement('div');d.id='routingModeInfo0921';d.className='routingModeInfo0921';modeField?.appendChild(d)}
 if(!mode.dataset.routing0921){mode.dataset.routing0921='1';mode.addEventListener('change',syncRoutingUi0921)}
 const quick=$o('quickOutputMode');if(quick&&!quick.dataset.routing0921){quick.dataset.routing0921='1';quick.addEventListener('change',e=>{mode.value=e.target.value;mode.dispatchEvent(new Event('change',{bubbles:true}))})}
 syncRoutingUi0921();
}
const chooseDest0921Base=chooseDest;
chooseDest=async function(){if(['same-source','download'].includes(outputMode())){syncRoutingUi0921();return toast(outputMode()==='same-source'?'La sortie est le dossier source.':'Le mode Téléchargements ne nécessite pas de dossier de sortie.')}const r=await chooseDest0921Base();syncRoutingUi0921();return r};
const reuseDest0921Base=reuseDest;
reuseDest=async function(){if(['same-source','download'].includes(outputMode()))return syncRoutingUi0921();const r=await reuseDest0921Base();syncRoutingUi0921();return r};

function style0921(){if($o('routingStyle0921'))return;const st=document.createElement('style');st.id='routingStyle0921';st.textContent='.routingModeInfo0921{margin-top:7px;padding:7px;border-radius:7px;background:#eef6fc;border:1px solid #cbddea;font-size:10px;line-height:1.45}.routingInactive0921{opacity:.62}.routingInactive0921:after{content:"Non requis pour le mode de sortie sélectionné";display:block;margin-top:5px;font-size:10px;color:#657684}';document.head.appendChild(st)}
function install0921(){style0921();reorderOutputUi0921();syncRoutingUi0921()}
const mo=new MutationObserver(()=>setTimeout(install0921,0));if(document.body)mo.observe(document.body,{childList:true,subtree:true});
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(install0921,640),{once:true});else setTimeout(install0921,640);
})();