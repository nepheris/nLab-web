(()=>{"use strict";
const base=new URL("./",document.currentScript?.src||location.href);
(async()=>{
  try{
    const chunks=[];
    for(let i=1;i<=6;i++){
      const n=String(i).padStart(2,"0");
      const u=new URL("app0914.part"+n+".txt",base);
      const r=await fetch(u,{cache:"no-store"});
      if(!r.ok)throw new Error("Runtime 0.9.14 part"+n+" : HTTP "+r.status);
      chunks.push(await r.text());
    }
    const code=chunks.join("");
    (0,eval)(code);
    if(window.__NLAB_DEBUG_LOG__)window.__NLAB_DEBUG_LOG__.push({t:new Date().toISOString(),type:"runtime",msg:"0.9.14 runtime loaded · "+code.length+" chars"});
  }catch(e){
    console.error("nLab PDF Studio 0.9.14 runtime",e);
    if(window.__NLAB_DEBUG_LOG__)window.__NLAB_DEBUG_LOG__.push({t:new Date().toISOString(),type:"runtime.error",msg:String(e?.stack||e)});
    try{if(typeof st==="function")st("Erreur runtime 0.9.14 : "+(e.message||e)+" · utilisez Debug");}catch{}
  }
})();
})();