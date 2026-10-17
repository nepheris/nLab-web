#!/usr/bin/env python3
"""Static Guide Froid TEST contract / publication smoke checks; no network."""
from __future__ import annotations
import json,re,sys
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
BASE=ROOT/'APP-Applications/guide-froid'
APP=BASE/'diagnostic-v5'
failures=[]
def check(ok,message):
    if not ok: failures.append(message)
def read(path):
    if not path.is_file():
        failures.append('missing: '+str(path.relative_to(ROOT)))
        return ''
    return path.read_text(encoding='utf-8')
versions=json.loads(read(BASE/'versions.json') or '{}')
check(versions.get('current')=='0.6.1','CURRENT pointer changed unexpectedly')
check(versions.get('test')=='1.1.0','TEST pointer must be 1.1.0')
by={str(x.get('version')):x for x in versions.get('versions',[])}
for version in ['0.6.1','1.0.0','1.1.0']:
    check(version in by,'missing version '+version)
for version, item in by.items():
    target=(BASE / item.get('href','').removeprefix('./')).resolve()
    check(target.is_relative_to(BASE.resolve()) and target.is_file(),'broken version target '+version)
for path in ['test-integrated.html','attachments-test.js','guide-test-nav.js','guide-test-shared.css',
             'diagnostic-v5/index.html','diagnostic-v5/recherche.html','diagnostic-v5/investigation.html',
             'diagnostic-v5/mermaid-investigation.js','diagnostic-v5/bibliotheque.html','diagnostic-v5/test.html',
             'diagnostic-v5/uml.html','diagnostic-v5/uml-catalog.js','integrated-investigation.js','diagnostic-v5/data.js','diagnostic-v5/style.css']:
    read(BASE/path)
diag=read(APP/'mermaid-investigation.js')
check('flowchart TD' in diag and 'click ' in diag,'Mermaid or click link support missing')
check('test.html?id=' in diag,'Mermaid must link to test sheets')
data=read(APP/'data.js')
tests=set(re.findall(r'\["((?:TC|FN)-\d\d)","',data))
check(len(tests)>=16,'test catalogue is unexpectedly incomplete')
checks=set(re.findall(r'\b(?:TC|FN)-\d\d\b',data))
check(not (checks-tests), 'defects reference unknown tests: '+str(sorted(checks-tests)))
for page in ['test-integrated.html','versions.html','diagnostic-v5/recherche.html','diagnostic-v5/uml.html',
             'diagnostic-v5/investigation.html','diagnostic-v5/test.html','diagnostic-v5/bibliotheque.html']:
    s=read(BASE/page)
    check('guide-test-nav.js' in s, 'missing shared navigation in '+page)
check('drive.google.com/file/d/' not in data,'test sheets still embed Google Drive')
uml=read(APP/'uml.html')
check('<iframe' not in uml, 'UML catalog must render natively without iframe')
integrated=read(BASE/'test-integrated.html')
check('id="gfInvestigationPanel"' in integrated and 'integrated-investigation.js' in integrated,
      'one-page investigation panel missing')
check('data-investigation-id' in integrated, 'defect table must open investigations in-page')
check('gfSideMenuContent' in integrated, 'collapsible common sidebar missing')
check('flowchart TD' in read(BASE/'integrated-investigation.js'), 'Mermaid renderer missing in integrated page')
check('uml-catalog.js' in uml, 'UML catalog script missing')
check('mermaid.render(' in read(APP/'uml-catalog.js'), 'UML diagrams are not rendered')
manifest=json.loads(read(BASE/'assets/tests/manifest.json') or '{}')
image_records=manifest.get('images',{})
check(len(image_records)==12,'expected 12 approved illustration records')
for key,entry in image_records.items():
    check(key in tests,'illustration refers to unknown test '+key)
    if entry.get('status')=='published':
        check((BASE/'assets/tests'/entry['path']).is_file(), 'published image absent '+key)
# Syntax validation when Node.js is available in the publishing environment.
import shutil, subprocess
node=shutil.which('node')
if node:
    for js in ['attachments-test.js','guide-test-nav.js',
               'diagnostic-v5/data.js','diagnostic-v5/mermaid-investigation.js',
               'diagnostic-v5/uml-catalog.js','integrated-investigation.js']:
        result=subprocess.run([node,'--check',str(BASE/js)],capture_output=True,text=True,check=False)
        check(result.returncode==0,'JavaScript syntax invalid: '+js+' '+result.stderr[:260])

# Runtime catalogue checks: 17 investigations and valid test references.
if node:
    js_check = r"""
const fs=require('fs'),vm=require('vm');
const base=process.argv[1],ctx={document:{addEventListener(){}}};
vm.createContext(ctx);
vm.runInContext(fs.readFileSync(base+'/diagnostic-v5/data.js','utf8')+
  '\nthis.__catalogue={DEFECTS,TESTS};',ctx);
const {DEFECTS,TESTS}=ctx.__catalogue;
const ids=new Set(TESTS.map(t=>t[0]));
if(DEFECTS.length!==17)throw Error('Expected 17 investigation diagrams, found '+DEFECTS.length);
if(ids.size!==TESTS.length)throw Error('Duplicate test IDs');
for(const d of DEFECTS){
 if(!d[0]||!d[1]||!d[4])throw Error('Incomplete defect: '+d[0]);
 for(const id of d[3].split(',').filter(Boolean))
  if(!ids.has(id))throw Error('Unknown test '+id+' in '+d[0]);
}
console.log('17 investigations / '+TESTS.length+' tests: OK');
"""
    runtime=subprocess.run([node,'-e',js_check,str(BASE)],capture_output=True,text=True,check=False)
    check(runtime.returncode==0,'Catalogue runtime: '+runtime.stderr[:450])

# Single canonical stylesheet contract across the complete Guide Froid TEST suite.
css_pages=[
    'test-integrated.html','versions.html',
    'diagnostic-v5/index.html','diagnostic-v5/recherche.html',
    'diagnostic-v5/investigation.html','diagnostic-v5/uml.html',
    'diagnostic-v5/test.html','diagnostic-v5/bibliotheque.html',
    'dossiers/index.html','notices/index.html','notices/polar/index.html',
    'docs/index.html','appareils/index.html',
    'appareils/nangis-polar.html','appareils/nangis-stock-1.html',
    'appareils/nangis-stock-2.html','appareils/provins-c.html'
]
for page in css_pages:
    markup=read(BASE/page)
    sheets=re.findall(r"""<link\b[^>]*\brel\s*=\s*["']stylesheet["'][^>]*>""",markup,re.I)
    check(len(sheets)==1 and 'guide-froid-unified.css' in sheets[0],
          'page must load exactly one canonical CSS: '+page)
    check(not re.search(r'<style\b',markup,re.I),
          'inline style block not migrated: '+page)
    check('guide-test-nav.js' in markup, 'shared navigation missing: '+page)
css=read(BASE/'guide-froid-unified.css')
check('data-theme="dark"' in css and 'data-theme="light"' in css,
      'canonical CSS must include light/dark theme treatment')
check('data-gf-page="gfh6"' in css and 'data-gf-page="gf7"' in css,
      'historical and investigation scoped rules missing')

if failures:
    print('Guide Froid TEST audit: FAIL',file=sys.stderr)
    for failure in failures: print(' - '+failure,file=sys.stderr)
    sys.exit(1)
print('Guide Froid TEST audit: OK (versions, navigation, links, test ids, image manifest)')
