/* Single-click theme buttons backed by the existing shared nLab application shell. */
(()=>{
 'use strict';
 const controls=[...document.querySelectorAll('[data-rt-theme]')];
 if(!controls.length)return;
 const shell=window.NLabApplicationShell;
 if(!shell)return;
 const KEY='nlab:application-shell:shared-prefs:v2';
 const modes=new Set(['auto','light','dark']);
 const synchronize=()=>{
  const selected=modes.has(shell.preferences.theme)?shell.preferences.theme:'auto';
  controls.forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.rtTheme===selected)));
 };
 controls.forEach(button=>button.addEventListener('click',()=>{
  const selected=button.dataset.rtTheme;
  if(!modes.has(selected))return;
  shell.setPreference('theme',selected);
  synchronize();
 }));
 window.addEventListener('storage',event=>{if(event.key===KEY)synchronize()});
 synchronize();
})();
