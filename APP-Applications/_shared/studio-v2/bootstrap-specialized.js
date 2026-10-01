import{mountStudioV2}from'./frame.js';
import{resolveStudioVersions}from'./version-service.js';

export async function bootstrapSpecializedStudioV2(config=window.NLAB_SPECIALIZED_V2||{}){
  const manifest=config.manifest||{};
  if(!manifest.id)throw new Error('NLAB_SPECIALIZED_V2.manifest.id requis');
  const versionInfo=await resolveStudioVersions({
    versionsHref:config.versionsHref||'../versions.json',
    coreVersionHref:config.coreVersionHref||'../../_shared/studio-v2/version.json',
    channel:config.channel||'test'
  });
  await mountStudioV2({manifest,versionInfo});
  const actions=config.actions||{};
  document.addEventListener('studio-v2:action',e=>{
    const sel=actions[e.detail?.action];if(!sel)return;
    const target=document.querySelector(sel);if(!target)return;
    if(target instanceof HTMLInputElement&&target.type==='file')target.click();else target.click?.();
  });
  document.dispatchEvent(new CustomEvent('studio-v2:specialized-ready',{detail:{manifest,versionInfo}}));
  return{manifest,versionInfo};
}
if(window.NLAB_SPECIALIZED_V2)bootstrapSpecializedStudioV2().catch(err=>{console.error(err);const s=document.getElementById('studioStatusText');if(s)s.textContent='Erreur Core V2 : '+err.message});
