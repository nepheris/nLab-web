export const DIMENSION_UNITS=['px','%','pt'];
export function pxToUnit(px,unit='px',{base=0,dpi=96}={}){
 const v=Number(px)||0;if(unit==='px')return v;if(unit==='%')return base?100*v/base:0;if(unit==='pt')return v*72/dpi;return v
}
export function unitToPx(value,unit='px',{base=0,dpi=96}={}){
 const v=Number(value)||0;if(unit==='px')return v;if(unit==='%')return base*v/100;if(unit==='pt')return v*dpi/72;return v
}
export function convertDimension(value,from='px',to='px',ctx={}){return pxToUnit(unitToPx(value,from,ctx),to,ctx)}
export function formatDimension(value,unit='px',{digits=unit==='px'?0:1}={}){const n=Number(value)||0;return (digits?Number(n.toFixed(digits)):Math.round(n))+' '+unit}
