import {TemplateEngine,TEMPLATE_VARIABLES} from '../APP-Applications/_shared/studio-v2/template-engine.js';
function eq(actual,expected,label){if(actual!==expected)throw Error(label+': '+JSON.stringify(actual)+' expected '+JSON.stringify(expected))}
function ok(value,label){if(!value)throw Error(label)}
const engine=new TemplateEngine({DATE_A:'2026-02-03',DATE_B:'2025-12-31',STAMP_DATE:'2024-07-09'});
eq(engine.resolve('{DATE_A:DD-MM-YYYY}'),'03-02-2026','explicit date A');
eq(engine.resolve('{DATE_A:YYYYMMDD}'),'20260203','compact date A');
eq(engine.resolve('{DATE_B:YY/MM/DD}'),'25/12/31','slash separators');
eq(engine.resolve('{STAMP_DATE:YYYY_MM_DD}'),'2024_07_09','stamp custom separator');
eq(engine.resolve('{YEAR:YY}'),String(new Date().getFullYear()).slice(-2),'year short');
eq(engine.resolve('{DATE_A_FMT:YYYY-MM-DD}'),'2026-02-03','fmt variant');
ok(engine.resolve('{MONTH:MMMM}').length>=3,'month name');
ok(/^\d\d-\d\d-\d\d$/.test(engine.resolve('{TIME:HH-mm-ss}')),'clock custom mask');
eq(engine.resolve('{FOLDER}/{SUBFOLDER}/{PARENT}/{RELATIVE_FOLDER}','t.txt',{FOLDER:'Images',SUBFOLDER:'Octobre',PARENT:'Octobre',RELATIVE_FOLDER:'Images/Octobre'}),'Images/Octobre/Octobre/Images/Octobre','folder fields');
eq(engine.resolve('{UNKNOWN:YYYY}'),'{UNKNOWN:YYYY}','unknown variable stays literal');
ok(engine.resolve('{DATE_A:garbage}')==='{DATE_A:garbage}','invalid date mask stays literal');
ok('SUBFOLDER' in TEMPLATE_VARIABLES && 'RELATIVE_FOLDER' in TEMPLATE_VARIABLES,'shared folder registry');
console.log('Studio Core template engine: masks + folders + compatibility PASS');
