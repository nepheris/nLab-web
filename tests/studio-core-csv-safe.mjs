import assert from 'node:assert/strict';
import{readFile}from'node:fs/promises';
const content=await readFile(new URL('../APP-Applications/_shared/studio-v2/csv-safe.js',import.meta.url),'utf8');
const{csvCell}=await import('data:text/javascript;base64,'+Buffer.from(content).toString('base64'));
const pairs=[
 ['photo.png','"photo.png"'],
 ['a"b','"a""b"'],
 [0,'"0"'],
 [null,'""'],
 ['=HYPERLINK("https://bad.invalid")','"\'=HYPERLINK(""https://bad.invalid"")"'],
 ['+SUM(A1:A3)',"\"'+SUM(A1:A3)\""],
 ['-1+2',"\"'-1+2\""],
 ['@SUM(A1)',"\"'@SUM(A1)\""],
 ['\t=SUM(A1)',"\"'\t=SUM(A1)\""],
 ['\r\n=1+1',"\"'\r\n=1+1\""],
 ['note =SUM(A1)','"note =SUM(A1)"']
];
for(const [input,expected]of pairs)assert.equal(csvCell(input),expected,'CSV cell '+String(input));
console.log(JSON.stringify({ok:true,checks:pairs.length}));
