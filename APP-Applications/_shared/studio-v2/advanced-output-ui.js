/** Shared advanced output controls: only orchestration of existing Core services. */
import {TemplateEngine} from './template-engine.js';
import {createTemplateVariablePicker} from './template-ux.js';
import {listPersonalTemplates,savePersonalTemplate,profileTemplateValues} from './personal-profile-service.js';

const get=(host,s)=>host.querySelector(s);
const extension=name=>String(name||'').match(/\.[^.]+$/)?.[0]||'';
const safePart=s=>String(s||'').trim().replace(/[<>:"|?*\u0000-\u001f]/g,'_').replace(/[. ]+$/g,'').slice(0,180);
const splitPath=s=>String(s||'').split(/[\\/]+/).map(safePart).filter(s=>s&&s!=='.'&&s!=='..');
const unresolved=s=>/\{[A-Z0-9_]+(?::[^}]*)?\}/.test(String(s));

export function mountAdvancedOutputUI({host,output,getFile,onSave}={}){
 if(!host||!output||typeof getFile!=='function'||typeof onSave!=='function')
  throw new TypeError('Advanced output requires host, OutputService, getFile, onSave');
 host.classList.add('coreAdvancedOutput');
 host.innerHTML=[
  '<p class="coreAdvancedHint">Renommage et classement basés sur les modèles et variables du profil personnel nLab. Le contenu du fichier reste inchangé. « Même dossier source » demande une autorisation explicite.</p>',
  '<label>Modèle de renommage<select data-save="naming"></select></label>',
  '<label>Préfixe<input data-save="prefix" placeholder="Ex. DOC_"></label>',
  '<label>Nom avec variables (extension conservée)<input data-save="name" value="{FILENAME}" spellcheck="false"></label>',
  '<label>Suffixe<input data-save="suffix" placeholder="Ex. _{DATE:YYYYMMDD}"></label>',
  '<label>Modèle de classement<select data-save="classification"></select></label>',
  '<label>Dossier / sous-dossiers, séparés par /<input data-save="path" placeholder="Ex. {YEAR}/{MONTH}/{CLIENT}" spellcheck="false"></label>',
  '<fieldset class="coreAdvancedDestination"><legend>Destination</legend>',
  '<div class="coreAdvancedActions"><button type="button" data-save-action="choose">Choisir un dossier…</button>',
  '<button type="button" data-save-action="recent">Dernier dossier</button>',
  '<button type="button" data-save-action="source">Même dossier que le fichier source…</button>',
  '<button type="button" data-save-action="download">Téléchargement simple</button></div>',
  '<p data-save-destination class="coreAdvancedHint" role="status"></p></fieldset>',
  '<details class="coreAdvancedDetails"><summary>Variables disponibles : insérer dans le nom ou les sous-dossiers</summary>',
  '<fieldset class="coreAdvancedTarget"><legend>Insérer dans</legend>',
  '<label><input type="radio" name="save-target" value="name" checked>Nom</label>',
  '<label><input type="radio" name="save-target" value="path">Sous-dossiers</label>',
  '<label><input type="radio" name="save-target" value="prefix">Préfixe</label>',
  '<label><input type="radio" name="save-target" value="suffix">Suffixe</label></fieldset>',
  '<p data-save-token-info class="coreAdvancedHint"></p><div data-save-picker></div></details>',
  '<details class="coreAdvancedDetails"><summary>Mémoriser ce modèle dans mon profil nLab</summary>',
  '<label>Nom du modèle<input data-save="template-label" maxlength="80" placeholder="Mon modèle personnalisé"></label>',
  '<div class="coreAdvancedActions"><button type="button" data-save-action="memorize-name">Mémoriser le renommage</button>',
  '<button type="button" data-save-action="memorize-folder">Mémoriser le classement</button></div>',
  '<p class="coreAdvancedHint">Modèles locaux exportables avec votre profil ZIP. Aucune publication sur GitHub.</p></details>',
  '<div class="coreAdvancedPreview"><strong>Aperçu du chemin de sortie</strong>',
  '<output data-save-preview aria-live="polite"></output><small data-save-hint></small></div>',
  '<p data-save-status role="status" aria-live="polite"></p>',
  '<div class="coreAdvancedActions coreAdvancedSubmit"><button type="button" data-save-action="save">Enregistrer avec ces options</button></div>'
 ].join('');
 const field=name=>get(host,'[data-save="'+name+'"]');
 const nameSelect=field('naming'),folderSelect=field('classification'),preview=get(host,'[data-save-preview]');
 const engine=new TemplateEngine();let target='name',busy=false,sourceDirectory=false;
 const status=(message,error=false)=>{const el=get(host,'[data-save-status]');el.textContent=message;el.dataset.error=String(error)};
 const populate=(type,select,selected)=>{
  const items=listPersonalTemplates(type);
  select.replaceChildren();
  for(const item of items)select.add(new Option(item.label||item.id,item.id));
  select.add(new Option('Personnalisé','custom'));
  select.value=selected&&items.some(x=>x.id===selected)?selected:type==='naming'?'original':'root';
  if(!select.value)select.value='custom';
 };
 const applyPreset=type=>{
  const item=listPersonalTemplates(type).find(x=>x.id===(type==='naming'?nameSelect:folderSelect).value);
  if(!item)return refresh();
  if(type==='naming'){
   field('prefix').value=item.prefix||'';
   field('name').value=item.template||'{FILENAME}';
   field('suffix').value=item.suffix||'';
  }else field('path').value=item.template||'';
  refresh();
 };
 const fileContext=()=>{
  const file=getFile();if(!file)throw new Error('Sélectionnez un fichier avant de l’enregistrer.');
  const path=String(file.webkitRelativePath||'');
  const dir=path.split('/').slice(0,-1).join('/');
  const profile=profileTemplateValues();
  const extra={FILESIZE:String(file.size),MIME:file.type||'',SOURCE_DIR:dir,RELATIVE_FOLDER:dir,
   FOLDER:dir.split('/').filter(Boolean).at(-1)||'',PARENT:dir.split('/').filter(Boolean).at(-1)||'',PATH:path||file.name};
  engine.setValues(profile);
  return{file,extra,values:{...profile,...extra}};
 };
 const plan=()=>{
  const {file,extra}=fileContext();
  const name=engine.buildName(file.name,{prefix:field('prefix').value,
   template:field('name').value,suffix:field('suffix').value,extension:extension(file.name),extra});
  if(!name.trim()||unresolved(name))throw new Error('Nom invalide ou variable inconnue.');
  const folder=engine.resolve(field('path').value,file.name,extra);
  if(unresolved(folder))throw new Error('Variable de sous-dossier inconnue.');
  const parts=splitPath(folder);
  return{file,name,parts,relativePath:[...parts,name].join('/')};
 };
 const refresh=()=>{
  try{
   const p=plan();
   preview.textContent=(output.handle?.name?output.handle.name+'/':'')+p.relativePath;
   get(host,'[data-save-hint]').textContent=output.handle
    ?'Les sous-dossiers seront créés lors de l’enregistrement.'
    :p.parts.length?'Choisissez un dossier : un téléchargement navigateur ne peut pas créer cette arborescence.'
    :'Téléchargement du fichier directement dans le dossier choisi par votre navigateur.';
  }catch(e){preview.textContent=e.message;get(host,'[data-save-hint]').textContent=''}
  get(host,'[data-save-destination]').textContent=output.handle
   ?(sourceDirectory?'Dossier source confirmé : ':'Dossier actif : ')+output.handle.name
   :'Téléchargement simple : aucun dossier ni sous-dossier créé.';
 };
 createTemplateVariablePicker({
  host:get(host,'[data-save-picker]'),engine,
  context:()=>{try{const x=fileContext();return{name:x.file.name,values:x.values}}catch{return{name:'document.pdf',values:profileTemplateValues()}}},
  getTarget:()=>field(target),refresh,helpHost:get(host,'[data-save-token-info]'),
  statusHost:get(host,'[data-save-status]')
 });
 const change=e=>{
  if(e.target===nameSelect)applyPreset('naming');
  if(e.target===folderSelect)applyPreset('classification');
  if(e.target.name==='save-target')target=e.target.value;
  refresh();
 };
 const input=e=>{if(e.target.matches('[data-save]'))refresh()};
 const click=async e=>{
  const button=e.target.closest('[data-save-action]');if(!button||busy)return;
  const action=button.dataset.saveAction;
  if(action==='memorize-name'||action==='memorize-folder'){
   const label=field('template-label').value.trim();
   if(!label)return status('Donnez un nom au modèle.',true);
   const type=action==='memorize-name'?'naming':'classification';
   const data=type==='naming'?{label,prefix:field('prefix').value,template:field('name').value,
    suffix:field('suffix').value}:{label,template:field('path').value};
   const updated=savePersonalTemplate(type,data);
   const select=type==='naming'?nameSelect:folderSelect;
   populate(type,select,updated.templates[type][0]?.id);
   status('Modèle enregistré dans le profil personnel nLab.');return;
  }
  try{
   if(action==='source'){
    await output.chooseSourceDirectory(fileContext().file);
    sourceDirectory=true;
    status('Dossier source vérifié. Un nom différent évite d’écraser l’original.');
    return refresh();
   }
   if(action==='choose'){await output.chooseDirectory();sourceDirectory=false;status('Dossier choisi.');return refresh()}
   if(action==='recent'){await output.loadLastDirectory();sourceDirectory=false;status('Dernier dossier réutilisé.');return refresh()}
   if(action==='download'){output.handle=null;sourceDirectory=false;status('Téléchargement simple sélectionné.');return refresh()}
   if(action==='save'){
    const p=plan();
    if(p.parts.length&&!output.handle)throw new Error('Choisissez un dossier pour créer les sous-dossiers.');
    if(sourceDirectory&&!p.parts.length&&p.name===p.file.name)throw new Error('Pour ne pas écraser le fichier source, choisissez un autre nom ou créez un sous-dossier.');
    busy=true;button.disabled=true;
    try{await onSave(p);status('Enregistré : '+p.relativePath);refresh()}
    finally{busy=false;button.disabled=false}
   }
  }catch(error){status(error.message||'Enregistrement indisponible.',true)}
 };
 const profileChanged=()=>{populate('naming',nameSelect,nameSelect.value);
  populate('classification',folderSelect,folderSelect.value);refresh()};
 host.addEventListener('click',click);host.addEventListener('input',input);host.addEventListener('change',change);
 document.addEventListener('nlab:personal-profile-changed',profileChanged);
 populate('naming',nameSelect);populate('classification',folderSelect);
 applyPreset('naming');applyPreset('classification');refresh();
 return{refresh,plan,destroy(){
  host.removeEventListener('click',click);host.removeEventListener('input',input);
  host.removeEventListener('change',change);
  document.removeEventListener('nlab:personal-profile-changed',profileChanged)
 }};
}
