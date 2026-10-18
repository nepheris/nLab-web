// Shared opt-in UX theme controller. It does not change the user's Studio
// preferences, existing CURRENT pages, or the native browser appearance.
export function createWorkspaceTheme({root,select,storageKey='nlab:workspace-theme:v1'}={}){
 if(!root)throw Error('Workspace root is required');
 const allowed=new Set(['auto','light','dark']),key=storageKey;
 const scheme=window.matchMedia?.('(prefers-color-scheme: dark)');
 const load=()=>{try{return localStorage.getItem(key)||'auto'}catch{return 'auto'}};
 let value=allowed.has(load())?load():'auto';
 const apply=()=>{
  const effective=value==='auto'?(scheme?.matches?'dark':'light'):value;
  root.dataset.uxTheme=effective;
  root.dataset.uxThemePreference=value;
  document.body.dataset.studioUxTheme=effective;
  if(select)select.value=value;
  document.dispatchEvent(new CustomEvent('studio-v2:ux-theme-change',{detail:{preference:value,effective}}));
  return effective
 };
 const set=next=>{if(!allowed.has(next))return apply();value=next;try{localStorage.setItem(key,value)}catch{}return apply()};
 const onScheme=()=>{if(value==='auto')apply()};
 scheme?.addEventListener?.('change',onScheme);
 if(select)select.addEventListener('change',()=>set(select.value));
 apply();
 return{get preference(){return value},get effective(){return root.dataset.uxTheme},set,apply,destroy(){scheme?.removeEventListener?.('change',onScheme);delete document.body.dataset.studioUxTheme}}
}