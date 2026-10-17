/** Palette theme buttons use the existing shared nLab theme setting; no duplicated theme engine. */
export function mountThemeButtons(host=document){
 const controls=[...host.querySelectorAll('[data-rt-theme]')];
 const shell=window.NLabApplicationShell;
 if(!controls.length||!shell)return ()=>{};
 const KEY='nlab:application-shell:shared-prefs:v2';
 const valid=new Set(['auto','light','dark']);
 const sync=()=>{
  const selected=valid.has(shell.preferences.theme)?shell.preferences.theme:'auto';
  for(const button of controls)button.setAttribute('aria-pressed',String(button.dataset.rtTheme===selected));
 };
 const listeners=controls.map(button=>{
  const action=()=>{
   const next=button.dataset.rtTheme;
   if(!valid.has(next))return;
   shell.setPreference('theme',next);
   sync();
  };
  button.addEventListener('click',action);
  return ()=>button.removeEventListener('click',action);
 });
 const onStorage=event=>{if(event.key===KEY)sync()};
 window.addEventListener('storage',onStorage);
 // Delegation also handles the header select inserted later by nLab at DOMContentLoaded.
 // The shell handles the select change first, then this bubble listener refreshes pressed states.
 const onHeaderChange=event=>{if(event.target?.matches?.('[data-shell-pref="theme"]'))sync()};
 document.addEventListener('change',onHeaderChange);
 sync();
 return ()=>{
  for(const off of listeners)off();
  window.removeEventListener('storage',onStorage);
  document.removeEventListener('change',onHeaderChange);
 };
}
