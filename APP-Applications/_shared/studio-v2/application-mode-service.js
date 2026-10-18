/**
 * Studio Core — application web installable (PWA).
 * Une fenêtre installée (display-mode: standalone) n'est PAS un plein écran.
 * Aucune installation n'est simulée et aucun mode hors connexion n'est promis.
 */
export function createApplicationModeController({
  button, onChange=()=>{}, onMessage=()=>{}, doc=globalThis.document, win=globalThis.window,
  hideUnavailable=false
}={}){
  if(!button||!doc||!win)throw new TypeError('Application mode requires a button and document');
  let installPrompt=null,disposed=false;
  const media=typeof win.matchMedia==='function'?win.matchMedia('(display-mode: standalone)'):null;
  const isStandalone=()=>Boolean(media?.matches||win.navigator?.standalone===true);
  const hasManifest=()=>Boolean(doc.querySelector('link[rel="manifest"]'));
  const getState=()=>isStandalone()?'standalone':installPrompt?'installable':hasManifest()?'browser':'not-configured';
  const synchronize=()=>{
    if(disposed)return;
    const state=getState();
    const label=button.querySelector('.ribbonBtnLabel')||button;
    if(state==='standalone')label.textContent='Mode application actif';
    else label.textContent='Installer l’application';
    button.dataset.appMode=state;
    button.setAttribute('aria-pressed',String(state==='standalone'));
    button.title=state==='standalone'?'Fenêtre d’application déjà active':
      state==='installable'?'Installer cette application dans le navigateur':
      state==='not-configured'?'Manifeste PWA requis pour ce Studio':
      'Utiliser « Installer l’application » dans le menu du navigateur si proposé';
    if(hideUnavailable)button.hidden=state!=='installable';
    onChange({state,standalone:isStandalone(),installable:state==='installable',manifest:hasManifest()});
  };
  const requestInstall=async()=>{
    if(disposed)return false;
    if(isStandalone()){onMessage('Le Studio est déjà ouvert en mode application.');return false}
    if(!installPrompt){
      onMessage(hasManifest()
        ?'Le navigateur ne propose pas d’installation directe. Vérifiez son menu « Installer l’application » ; ce choix dépend du navigateur et de l’appareil.'
        :'Ce Studio ne possède pas encore de manifeste PWA. L’installation sera activée lors de sa migration.');
      synchronize();
      return false;
    }
    const event=installPrompt;
    installPrompt=null;
    try{
      await event.prompt();
      const choice=await event.userChoice;
      synchronize();
      onMessage(choice?.outcome==='accepted'?'Installation acceptée par le navigateur.':'Installation non effectuée.');
      return choice?.outcome==='accepted';
    }catch(error){
      synchronize();
      onMessage('Installation non disponible sur ce navigateur.');
      return false;
    }
  };
  const onBeforeInstall=event=>{event.preventDefault();installPrompt=event;synchronize()};
  const onAppInstalled=()=>{installPrompt=null;synchronize()};
  const onDisplayModeChange=()=>synchronize();
  win.addEventListener('beforeinstallprompt',onBeforeInstall);
  win.addEventListener('appinstalled',onAppInstalled);
  media?.addEventListener?.('change',onDisplayModeChange);
  button.addEventListener('click',requestInstall);
  synchronize();
  return Object.freeze({
    getState,isStandalone,hasManifest,requestInstall,synchronize,
    destroy(){
      if(disposed)return;
      disposed=true;
      win.removeEventListener('beforeinstallprompt',onBeforeInstall);
      win.removeEventListener('appinstalled',onAppInstalled);
      media?.removeEventListener?.('change',onDisplayModeChange);
      button.removeEventListener('click',requestInstall);
      installPrompt=null;
    }
  });
}
