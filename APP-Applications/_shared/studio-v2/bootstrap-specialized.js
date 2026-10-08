import{mountStudioV2}from'./frame.js';
import{resolveStudioVersions}from'./version-service.js';
import{openInputPicker}from'./input-picker.js';
import{installContextSelectionBridge}from'./context-selection.js';
import{installUndoRedoBridge}from'./undo-redo.js';

export async function bootstrapSpecializedStudioV2(config=window.NLAB_SPECIALIZED_V2||{}){
  const manifest=config.manifest||{};
  if(!manifest.id)throw new Error('NLAB_SPECIALIZED_V2.manifest.id requis');
  installContextSelectionBridge();
  installUndoRedoBridge();
  const versionInfo=await resolveStudioVersions({
    versionsHref:config.versionsHref||'./versions.json',
    coreVersionHref:config.coreVersionHref||'../_shared/studio-v2/version.json',
    channel:config.channel||'test',
    buildHref:config.buildHref||manifest.buildHref||'build.json',
    sourcePath:config.sourcePath||manifest.sourcePath||'',
    repo:config.repo||manifest.repo||'nepheris/nLab-web',
    ref:config.ref||manifest.ref||'main'
  });
  await mountStudioV2({manifest,versionInfo});
  const actions=config.actions||{};
  document.addEventListener('studio-v2:action',async e=>{
    const action=e.detail?.action;
    if(action==='open'&&manifest.inputPicker){
      const files=await openInputPicker(manifest.inputPicker);if(!files?.length)return;
      document.dispatchEvent(new CustomEvent('studio-v2:input-picked',{detail:{files,studio:manifest.id,source:'core-input-picker'}}));return
    }
    const sel=actions[action];if(!sel)return;
    const target=document.querySelector(sel);if(!target)return;
    if(target instanceof HTMLInputElement&&target.type==='file')target.click();else target.click?.();
  });
  document.dispatchEvent(new CustomEvent('studio-v2:specialized-ready',{detail:{manifest,versionInfo}}));
  return{manifest,versionInfo};
}
if(window.NLAB_SPECIALIZED_V2)bootstrapSpecializedStudioV2().catch(err=>{console.error(err);const s=document.getElementById('studioStatusText');if(s)s.textContent='Erreur Core V2 : '+err.message});
