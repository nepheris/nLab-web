import {mountResponsiveSimulator} from '../../_shared/responsive-test/simulator.js';
import {mountThemeButtons} from '../theme-buttons.js';
const root=document.getElementById('responsive-test');
try{
 mountResponsiveSimulator(root,{src:'../../studios/'});
 mountThemeButtons(root);
 document.documentElement.dataset.responsiveStudioReady='1';
}catch(error){
 root.textContent='Initialisation impossible : '+(error?.message||String(error));
 console.error('Responsive Test Studio TEST 0.4.3:',error);
}
