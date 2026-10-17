import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
const source=await readFile(new URL('../APP-Applications/_shared/studio-v2/color-picker.js',import.meta.url),'utf8');
const {normalizeHex,hexToRgb,rgbToHex,rgbToHsl,hslToRgb}=await import('data:text/javascript;base64,'+Buffer.from(source).toString('base64'));
assert.equal(normalizeHex('#abc'),'#AABBCC');
assert.equal(normalizeHex('abcdef'),'#ABCDEF');
assert.equal(normalizeHex('#invalid'),null);
assert.equal(normalizeHex('#1234'),null);
assert.deepEqual(hexToRgb('#abcdef'),{r:171,g:205,b:239});
assert.equal(hexToRgb('malformed'),null);
assert.equal(rgbToHex({r:255,g:0,b:128}),'#FF0080');
assert.equal(rgbToHex({r:-1,g:700,b:24}),'#00FF18');
assert.equal(rgbToHex({r:'',g:0,b:0}),null);
assert.deepEqual(rgbToHsl({r:255,g:0,b:0}),{h:0,s:100,l:50});
assert.deepEqual(rgbToHsl({r:128,g:128,b:128}),{h:0,s:0,l:50});
assert.deepEqual(hslToRgb({h:240,s:100,l:50}),{r:0,g:0,b:255});
assert.deepEqual(hslToRgb({h:-120,s:100,l:50}),{r:0,g:0,b:255});
assert.equal(hslToRgb({h:10,s:'',l:50}),null);
for(const rgb of [{r:7,g:102,b:235},{r:191,g:81,b:53},{r:96,g:145,b:120}]){
 const roundtrip=hslToRgb(rgbToHsl(rgb));
 assert.ok(['r','g','b'].every(key=>Math.abs(roundtrip[key]-rgb[key])<=3),'color roundtrip must stay within integer HSL precision');
}
console.log(JSON.stringify({ok:true,component:'studio-core-colors',checks:15}));
