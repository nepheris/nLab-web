// Compatibility adapter: all opted-in workspace views consume the Core's single
// appearance preference. No second theme store may override Studio Core settings.
import{loadStudioSettings,saveStudioSettings}from'./settings.js';
export function createWorkspaceTheme({root,select}={}){
 if(!root)throw Error('Workspace root is required');
 const scheme=typeof window!=='undefined'?window.matchMedia?.('(prefers-color-scheme: dark)'):null;
 const values=new Set(['auto','light','dark']);
 const preference=()=>{const theme=loadStudioSettings().theme;return theme==='system'?'auto':(values.has(theme)?theme:'auto')};
 const apply=()=>{
  const value=preference();
  const effective=value==='auto'?(scheme?.matches?'dark':'light'):value;
  root.dataset.uxTheme=effective;
  root.dataset.uxThemePreference=value;
  document.body.dataset.studioUxTheme=effective;
  if(select)select.value=value;
  document.dispatchEvent(new CustomEvent('studio-v2:ux-theme-change',{detail:{preference:value,effective}}));
  return effective;
 };
 const set=next=>{if(!values.has(next))return apply();saveStudioSettings({theme:next==='auto'?'system':next});return apply()};
 const onScheme=()=>{if(preference()==='auto')apply()};
 const onSettings=event=>{if(event.detail?.changed?.theme!==undefined)apply()};
 const onSelect=()=>set(select.value);
 scheme?.addEventListener?.('change',onScheme);
 document.addEventListener('studio-v2:settings-changed',onSettings);
 select?.addEventListener('change',onSelect);
 apply();
 return{get preference(){return preference()},get effective(){return root.dataset.uxTheme},set,apply,destroy(){
  scheme?.removeEventListener?.('change',onScheme);
  document.removeEventListener('studio-v2:settings-changed',onSettings);
  select?.removeEventListener('change',onSelect);
  delete document.body.dataset.studioUxTheme;
 }};
}
