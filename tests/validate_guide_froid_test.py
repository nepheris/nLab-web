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
             'diagnostic-v5/uml.html','diagnostic-v5/uml-catalog.js','diagnostic-v5/data.js','diagnostic-v5/style.css']:
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
               'diagnostic-v5/uml-catalog.js']:
        result=subprocess.run([node,'--check',str(BASE/js)],capture_output=True,text=True,check=False)
        check(result.returncode==0,'JavaScript syntax invalid: '+js+' '+result.stderr[:260])

if failures:
    print('Guide Froid TEST audit: FAIL',file=sys.stderr)
    for failure in failures: print(' - '+failure,file=sys.stderr)
    sys.exit(1)
print('Guide Froid TEST audit: OK (versions, navigation, links, test ids, image manifest)')
