import {mountResponsiveSimulator} from './versions/0.4.3/simulator.js';
import {mountThemeButtons} from './versions/0.4.3/theme-buttons.js';

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

// Installation Chrome/Edge optional: show the command only when the browser
// has confirmed that the web application can be installed.
let installEvent=null;
const installButton=document.querySelector('[data-studio-install]');
window.addEventListener('beforeinstallprompt',event=>{
 event.preventDefault();
 installEvent=event;
 if(installButton)installButton.hidden=false;
});
installButton?.addEventListener('click',async()=>{
 if(!installEvent)return;
 const prompt=installEvent;installEvent=null;installButton.hidden=true;
 try{await prompt.prompt();await prompt.userChoice}catch(error){console.warn('Installation web non disponible',error)}
});
window.addEventListener('appinstalled',()=>{installEvent=null;if(installButton)installButton.hidden=true});
