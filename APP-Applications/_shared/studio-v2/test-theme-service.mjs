// Node >=18: node --test APP-Applications/_shared/studio-v2/test-theme-service.mjs
// Read the ESM source through a data URL so a browser-first .js file needs no
// repository-wide package.json/module switch.
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const source=readFileSync(new URL('./theme-service.js',import.meta.url),'utf8');
const mod=await import('data:text/javascript;charset=utf-8,'+encodeURIComponent(source));
const root=()=>({
 classList:{classes:new Set(),toggle(k,on){on?this.classes.add(k):this.classes.delete(k)}},
 dataset:{},
 style:{values:new Map(),setProperty(k,v){this.values.set(k,v)}}
});
test('invalid accents use the canonical nLab color',()=>{
 assert.equal(mod.normalizedAccent('red'),mod.DEFAULT_ACCENT);
 assert.equal(mod.normalizedAccent('#ff0033'),'#FF0033');
});
test('light mode uses one palette with contrasting foreground',()=>{
 const el=root();const x=mod.applySharedTheme(el,{theme:'light',accentColor:'#123456'});
 assert.equal(x.effective,'light');
 assert.equal(el.style.values.get('--nlab-brand'),'#123456');
 assert.equal(el.style.values.get('--ux-accent'),'#123456');
 assert.equal(el.style.values.get('--nlab-brand-contrast'),'#FFFFFF');
 assert.equal(el.dataset.themeEffective,'light');
 assert.equal(el.style.colorScheme,'light');
});
test('dark mode derives a readable accent from the same choice',()=>{
 const el=root();const x=mod.applySharedTheme(el,{theme:'dark',accentColor:'#123456'});
 assert.equal(x.effective,'dark');
 assert.equal(el.classList.classes.has('themeDark'),true);
 assert.equal(el.style.values.get('--nlab-brand'),x.accent);
 assert.equal(el.style.values.get('--ux-accent'),x.accent);
 assert.notEqual(x.accent,'#123456');
});
test('automatic theme follows the operating system',()=>{
 const prior=globalThis.matchMedia;
 try{
  globalThis.matchMedia=()=>({matches:true});
  const el=root();assert.equal(mod.applySharedTheme(el,{theme:'system'}).effective,'dark');
  globalThis.matchMedia=()=>({matches:false});
  assert.equal(mod.applySharedTheme(el,{theme:'system'}).effective,'light');
 }finally{if(prior===undefined)delete globalThis.matchMedia;else globalThis.matchMedia=prior}
});
test('light foreground on pale accents has high contrast',()=>{
 const el=root();mod.applySharedTheme(el,{theme:'light',accentColor:'#EFEFEF'});
 assert.equal(el.style.values.get('--nlab-brand-contrast'),'#111827');
});
