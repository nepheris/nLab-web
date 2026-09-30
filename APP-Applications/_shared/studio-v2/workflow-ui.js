import{listWorkflowPresets,saveWorkflowPreset,removeWorkflowPreset,runWorkflowPreset}from'./workflow-presets.js';
import{icon}from'./icon-registry.js';
import{enhanceStudioWindow}from'./window-system.js';
const esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
export function mountWorkflowUI(){
  if(document.querySelector('#studioWorkflowPanel'))return;
  const p=document.createElement('div');p.id='studioWorkflowPanel';p.className='studioWindow workflowWindow';p.hidden=true;
  p.innerHTML='<div class="workflowBox"><div class="workflowHead">'+icon('workflow')+'<strong>Workflows</strong><button id="workflow-close">×</button></div><div class="workflowCreate"><input id="workflow-name" placeholder="Nom du preset"><input id="workflow-steps" placeholder="Actions séparées par des virgules"><button id="workflow-save">Enregistrer</button></div><div id="workflow-list"></div></div>';
  document.body.append(p);enhanceStudioWindow(p,{key:'workflows',title:'Workflows'});
  const render=()=>{const host=p.querySelector('#workflow-list'),items=listWorkflowPresets();host.innerHTML=items.length?items.map(w=>'<div class="workflowItem"><div><strong>'+esc(w.name)+'</strong><small>'+esc((w.steps||[]).join(' → ')||'Aucune étape')+'</small></div><button data-workflow-run="'+esc(w.id)+'">Lancer</button><button data-workflow-delete="'+esc(w.id)+'">Supprimer</button></div>').join(''):'<div class="commandEmpty">Aucun preset enregistré.</div>'};
  const open=()=>{p.hidden=false;render()};const close=()=>p.hidden=true;
  p.querySelector('#workflow-close').onclick=close;
  p.querySelector('#workflow-save').onclick=()=>{const name=p.querySelector('#workflow-name').value.trim(),steps=p.querySelector('#workflow-steps').value.split(',').map(x=>x.trim()).filter(Boolean);if(!name)return;saveWorkflowPreset({name,steps});p.querySelector('#workflow-name').value='';p.querySelector('#workflow-steps').value='';render()};
  p.addEventListener('click',e=>{const r=e.target.closest('[data-workflow-run]'),d=e.target.closest('[data-workflow-delete]');if(r){runWorkflowPreset(r.dataset.workflowRun);close()}if(d){removeWorkflowPreset(d.dataset.workflowDelete);render()}});
  document.addEventListener('studio-v2:open-workflows',open);
  document.addEventListener('studio-v2:workflows-changed',render);
}
