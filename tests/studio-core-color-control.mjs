import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';

// Test the existing canonical color-control module; no legacy color-picker duplication.
const source=await readFile(new URL('../APP-Applications/_shared/studio-v2/color-control.js',import.meta.url),'utf8');
const api=await import('data:text/javascript;base64,'+Buffer.from(source).toString('base64'));
assert.equal(api.normalizeHex('#abc'),'#AABBCC');
assert.equal(api.normalizeHex('123456'),'#123456');
assert.equal(api.normalizeHex('wrong'),null);
assert.deepEqual(api.hexToRgb('#FF0080'),{r:255,g:0,b:128});
assert.equal(api.rgbToHex(255,0,128),'#FF0080');
assert.deepEqual(api.rgbToHsl(255,0,0),{h:0,s:100,l:50});
assert.deepEqual(api.rgbToHsl(128,128,128),{h:0,s:0,l:50});
assert.deepEqual(api.hslToRgb(240,100,50),{r:0,g:0,b:255});
assert.deepEqual(api.hslToRgb(-120,100,50),{r:0,g:0,b:255});
assert.equal(api.parseColor('rgb(255, 0, 128)','rgb'),'#FF0080');
assert.equal(api.parseColor('hsl(240, 100%, 50%)','hsl'),'#0000FF');
assert.equal(api.parseColor('#not-hex','hex'),null);
assert.equal(api.formatColor('#ff0080','rgb'),'rgb(255, 0, 128)');
assert.equal(api.formatColor('#ff0000','hsl'),'hsl(0, 100%, 50%)');
for(const color of [{r:7,g:102,b:235},{r:191,g:81,b:53},{r:96,g:145,b:120}]){
 const roundtrip=api.hslToRgb(...Object.values(api.rgbToHsl(color.r,color.g,color.b)));
 assert.ok(['r','g','b'].every(key=>Math.abs(roundtrip[key]-color[key])<=3),'HSL conversion within integer precision');
}
console.log(JSON.stringify({ok:true,component:'canonical-studio-v2/color-control',checks:17}));
