import {mountResponsiveSimulator} from './simulator.js';
const root=document.getElementById('responsive-test');
try{
 mountResponsiveSimulator(root,{src:'../../../studios/'});
 document.documentElement.dataset.responsiveStudioReady='1';
}catch(error){
 root.textContent='Initialisation impossible : '+(error?.message||String(error));
 console.error('Responsive Test Studio historical 0.3.0:',error);
}
