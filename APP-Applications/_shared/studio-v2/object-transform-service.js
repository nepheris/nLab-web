const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
export function normalizeObjectRotation(value=0){
 let v=Number(value)||0;while(v>360)v-=360;while(v<-360)v+=360;return v
}
export function rotateObject(object,delta=0){if(!object)return null;object.rotation=normalizeObjectRotation((Number(object.rotation)||0)+Number(delta||0));return object}
export function setObjectRotation(object,value=0){if(!object)return null;object.rotation=normalizeObjectRotation(value);return object}
export function toggleObjectLock(object,force=null){if(!object)return null;object.locked=force==null?!object.locked:!!force;return object}
export function moveObjectPct(object,{dx=0,dy=0,maxX=98,maxY=98}={}){if(!object)return null;object.xPct=clamp((Number(object.xPct)||0)+Number(dx||0),0,maxX);object.yPct=clamp((Number(object.yPct)||0)+Number(dy||0),0,maxY);return object}
export function resizeObjectPct(object,{dw=0,dh=0,minW=3,maxW=95,minH=1,maxH=60}={}){if(!object)return null;object.wPct=clamp((Number(object.wPct)||20)+Number(dw||0),minW,maxW);if(object.hPct!=null||dh)object.hPct=clamp((Number(object.hPct)||5)+Number(dh||0),minH,maxH);return object}
