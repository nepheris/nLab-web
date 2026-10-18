import {mountResponsiveSimulator} from '../_shared/responsive-test/simulator.js';
import {mountThemeButtons} from './versions/0.4.3/theme-buttons.js';
import {createApplicationModeController} from '../_shared/studio-v2/application-mode-service.js';

const root=document.getElementById('responsive-test');
const initialUrl=new URL(location.href).searchParams.get('url')||'../studios/';
try{
 const simulator=mountResponsiveSimulator(root,{src:initialUrl});
 mountThemeButtons(root);
 document.documentElement.dataset.responsiveStudioReady='1';
 window.NLabResponsiveTestStudio=simulator;
}catch(error){
 root.textContent='Initialisation impossible : '+(error?.message||String(error));
 console.error('Responsive Test Studio CURRENT 0.4.3:',error);
}

// Shared Studio Core PWA controller. Historical releases keep their native copies.
const installButton=document.querySelector('[data-studio-install]');
if(installButton){
 const controller=createApplicationModeController({
  button:installButton,
  hideUnavailable:true,
  onMessage:message=>console.info('Responsive Test Studio:',message)
 });
 window.NLabResponsiveApplicationMode=controller;
}
