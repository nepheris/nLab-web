import {mountResponsiveSimulator} from '../_shared/responsive-test/simulator.js';
import {mountThemeButtons} from './theme-buttons.js';
const root=document.getElementById('responsive-test');
try{
 const simulator=mountResponsiveSimulator(root,{src:'../studios/'});
 mountThemeButtons(root);
 for(const button of document.querySelectorAll('[data-example]')){
  button.addEventListener('click',()=>simulator.load(button.dataset.example));
 }
 document.documentElement.dataset.responsiveStudioReady='1';
}catch(error){
 root.textContent='Initialisation impossible : '+(error?.message||String(error));
 console.error('Responsive Test Studio:',error);
}
