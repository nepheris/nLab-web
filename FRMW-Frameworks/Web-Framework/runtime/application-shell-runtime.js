(()=> {
  'use strict';
  const root=document.documentElement;
  const body=document.body;
  const CONFIG=window.NLabAppShellConfig||{};
  const LEGACY_STORE=CONFIG.storageKey||'nlab:application-shell:prefs:v1';
  const SHARED_STORE=CONFIG.sharedStorageKey||'nlab:application-shell:shared-prefs:v2';
  const LOCAL_STORE=CONFIG.localStorageKey||'nlab:application-shell:local-prefs:v2';
  const WINSTORE=CONFIG.windowStorageKey||LOCAL_STORE+':windows';
  const sharedDefaults={
    theme:'auto',dominant_color:'',view:'cards',
    header:{visible:true,shadow:true,compact:false,auto_hide:false,mode:'sticky'}
  };
  const localDefaults={folds:{}};
  const q=(s,r=document)=>r.querySelector(s),qa=(s,r=document)=>[...r.querySelectorAll(s)];
  const clone=v=>JSON.parse(JSON.stringify(v));
  const loadRaw=key=>{try{const raw=localStorage.getItem(key);return raw?JSON.parse(raw):null}catch(_){return null}};
  const save=(key,value)=>{try{localStorage.setItem(key,JSON.stringify(value))}catch(_){}};
  const legacy=loadRaw(LEGACY_STORE)||{};
  let sharedPrefs=Object.assign(clone(sharedDefaults),legacy,loadRaw(SHARED_STORE)||{});
  sharedPrefs.header=Object.assign(clone(sharedDefaults.header),legacy.header||{},sharedPrefs.header||{});
  let localPrefs=Object.assign(clone(localDefaults),loadRaw(LOCAL_STORE)||{});
  localPrefs.folds=Object.assign({},legacy.folds||{},localPrefs.folds||{});
  save(SHARED_STORE,sharedPrefs);save(LOCAL_STORE,localPrefs);
  let z=Number(CONFIG.baseZIndex||120);

  const effectiveTheme=()=>sharedPrefs.theme==='auto'
    ?(matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light')
    :sharedPrefs.theme;

  function apply(){
    root.dataset.theme=effectiveTheme();
    body.dataset.shellView=sharedPrefs.view||'cards';
    body.dataset.shellHeaderMode=sharedPrefs.header.mode||'sticky';
    body.classList.toggle('nlab-shell-header-hidden',sharedPrefs.header.visible===false);
    body.classList.toggle('nlab-shell-header-no-shadow',sharedPrefs.header.shadow===false);
    body.classList.toggle('nlab-shell-header-compact',!!sharedPrefs.header.compact);
    if(sharedPrefs.dominant_color)root.style.setProperty('--nlab-brand',sharedPrefs.dominant_color);
    qa('[data-shell-view]').forEach(el=>el.classList.toggle('active',el.dataset.shellView===sharedPrefs.view));
    qa('[data-shell-pref]').forEach(el=>{
      const key=el.dataset.shellPref;
      const value=readPref(key);
      if(el.type==='checkbox')el.checked=!!value; else if(value!=null)el.value=String(value);
    });
    qa('[data-shell-fold-id]').forEach(el=>{
      const id=el.dataset.shellFoldId;
      if(Object.hasOwn(localPrefs.folds,id))el.open=!!localPrefs.folds[id];
    });
  }

  function isLocalPref(path){return String(path||'').startsWith('folds.')}
  function readPref(path){
    const source=isLocalPref(path)?localPrefs:sharedPrefs;
    return String(path||'').split('.').reduce((v,k)=>v&&v[k],source);
  }
  function writePref(path,value){
    const local=isLocalPref(path),target=local?localPrefs:sharedPrefs;
    const parts=String(path||'').split('.');
    let node=target;
    while(parts.length>1){const k=parts.shift();node[k]=node[k]&&typeof node[k]==='object'?node[k]:{};node=node[k]}
    node[parts[0]]=value;
    save(local?LOCAL_STORE:SHARED_STORE,target);
    apply();
  }

  function bindPreferences(){
    qa('[data-shell-pref]').forEach(el=>{
      if(el.dataset.nlabReady)return;el.dataset.nlabReady='1';
      el.addEventListener('change',()=>{
        const key=el.dataset.shellPref;
        const value=el.type==='checkbox'?el.checked:el.value;
        writePref(key,value);
      });
    });
    qa('[data-shell-view]').forEach(el=>{
      if(el.dataset.nlabReady)return;el.dataset.nlabReady='1';
      el.addEventListener('click',()=>writePref('view',el.dataset.shellView));
    });
    qa('[data-shell-header-restore]').forEach(el=>el.addEventListener('click',()=>writePref('header.visible',true)));
    qa('[data-shell-pref-reset]').forEach(el=>el.addEventListener('click',()=>{
      sharedPrefs=clone(sharedDefaults);localPrefs=clone(localDefaults);
      save(SHARED_STORE,sharedPrefs);save(LOCAL_STORE,localPrefs);
      try{localStorage.removeItem(WINSTORE)}catch(_){}
      qa('[data-nlab-floating-window]').forEach(resetWindow);apply();
    }));
  }

  function bindFoldables(){
    qa('[data-shell-fold-id]').forEach(el=>{
      if(el.dataset.nlabFoldReady)return;el.dataset.nlabFoldReady='1';
      const id=el.dataset.shellFoldId;
      if(Object.hasOwn(localPrefs.folds,id))el.open=!!localPrefs.folds[id];
      el.addEventListener('toggle',()=>{localPrefs.folds[id]=el.open;save(LOCAL_STORE,localPrefs)});
    });
    qa('[data-shell-fold-action]').forEach(el=>el.addEventListener('click',()=>{
      const open=el.dataset.shellFoldAction==='expand';
      qa('[data-shell-fold-id]').forEach(d=>{d.open=open;localPrefs.folds[d.dataset.shellFoldId]=open});
      save(LOCAL_STORE,localPrefs);
    }));
  }

  const windowState=()=>loadRaw(WINSTORE)||{};
  function bringFront(w){w.style.zIndex=String(++z)}
  function saveWindow(w){
    const all=windowState(),r=w.getBoundingClientRect();
    all[w.dataset.nlabFloatingWindow||w.id]={
      left:r.left,top:r.top,width:r.width,height:r.height,locked:w.classList.contains('locked')
    };
    save(WINSTORE,all);
  }
  function restoreWindow(w){
    const st=windowState()[w.dataset.nlabFloatingWindow||w.id];if(!st)return;
    w.style.left=Math.max(8,Math.min(innerWidth-280,Number(st.left)||8))+'px';
    w.style.top=Math.max(8,Math.min(innerHeight-100,Number(st.top)||8))+'px';
    w.style.right='auto';w.style.bottom='auto';
    if(st.width)w.style.width=Math.min(innerWidth-16,Number(st.width))+'px';
    if(st.height)w.style.height=Math.min(innerHeight-16,Number(st.height))+'px';
    w.classList.toggle('locked',!!st.locked);
  }
  function resetWindow(w){
    ['left','top','right','bottom','width','height','zIndex'].forEach(k=>w.style[k]='');
    w.classList.remove('locked');saveWindow(w);
  }
  function initWindow(w){
    if(w.dataset.nlabReady)return;w.dataset.nlabReady='1';restoreWindow(w);
    const head=q('[data-window-handle]',w)||q('.nlab-window-head',w)||w.firstElementChild;
    const lock=q('[data-window-lock]',w),reset=q('[data-window-reset]',w),close=q('[data-window-close]',w);
    let drag=null;
    head?.addEventListener('pointerdown',e=>{
      if(e.target.closest('button,a,input,select,textarea')||w.classList.contains('locked')||matchMedia('(max-width:620px)').matches)return;
      bringFront(w);const r=w.getBoundingClientRect();drag={x:e.clientX-r.left,y:e.clientY-r.top};
      head.setPointerCapture?.(e.pointerId);
    });
    head?.addEventListener('pointermove',e=>{
      if(!drag)return;
      const x=Math.max(6,Math.min(innerWidth-w.offsetWidth-6,e.clientX-drag.x));
      const y=Math.max(6,Math.min(innerHeight-54,e.clientY-drag.y));
      Object.assign(w.style,{left:x+'px',top:y+'px',right:'auto',bottom:'auto'});
    });
    head?.addEventListener('pointerup',e=>{if(!drag)return;drag=null;try{head.releasePointerCapture?.(e.pointerId)}catch(_){}saveWindow(w)});
    lock?.addEventListener('click',()=>{w.classList.toggle('locked');saveWindow(w);w.dispatchEvent(new CustomEvent('nlab:window-lock',{detail:{locked:w.classList.contains('locked')}}))});
    reset?.addEventListener('click',()=>resetWindow(w));
    close?.addEventListener('click',()=>w.classList.remove('open'));
    w.addEventListener('pointerdown',()=>bringFront(w));
    if('ResizeObserver' in window)new ResizeObserver(()=>{clearTimeout(w._nlabResize);w._nlabResize=setTimeout(()=>saveWindow(w),250)}).observe(w);
  }

  function bindWindows(){
    qa('[data-nlab-floating-window]').forEach(initWindow);
    qa('[data-shell-window-open]').forEach(el=>el.addEventListener('click',()=>{
      const id=el.dataset.shellWindowOpen;
      const w=q('[data-nlab-floating-window="'+CSS.escape(id)+'"]')||document.getElementById(id);
      if(w){w.classList.add('open');bringFront(w)}
    }));
  }

  function bindAutoHide(){
    let last=scrollY;
    addEventListener('scroll',()=>{
      if(!sharedPrefs.header.auto_hide||sharedPrefs.header.mode==='static'||sharedPrefs.header.visible===false){
        body.classList.remove('nlab-shell-header-auto-hidden');last=scrollY;return;
      }
      const y=scrollY,down=y>last+5;
      body.classList.toggle('nlab-shell-header-auto-hidden',down&&y>80);last=y;
    },{passive:true});
  }

  function bindKeyboard(){
    addEventListener('keydown',e=>{if(e.key==='Escape')qa('[data-nlab-floating-window].open').forEach(w=>w.classList.remove('open'))});
  }

  function boot(){
    apply();bindPreferences();bindFoldables();bindWindows();bindAutoHide();bindKeyboard();
    matchMedia('(prefers-color-scheme: dark)').addEventListener?.('change',()=>{if(sharedPrefs.theme==='auto')apply()});
    addEventListener('storage',e=>{
      if(e.key===SHARED_STORE){
        const next=loadRaw(SHARED_STORE)||{};
        sharedPrefs=Object.assign(clone(sharedDefaults),next);
        sharedPrefs.header=Object.assign(clone(sharedDefaults.header),next.header||{});
        apply();
      }
    });
    document.dispatchEvent(new CustomEvent('nlab:application-shell-ready',{detail:{preferences:{...clone(sharedPrefs),folds:clone(localPrefs.folds)}}}));
  }

  window.NLabApplicationShell={
    boot,apply,
    get preferences(){return {...clone(sharedPrefs),folds:clone(localPrefs.folds)}},
    setPreference:writePref,
    resetWindow
  };
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();