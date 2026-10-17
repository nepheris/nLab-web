#!/usr/bin/env python3
"""Compile the nLab Demo Corpus public complete index from approved category manifests.
Run: python3 Library/demo/rebuild_demo_index.py  (from nLab-web root)
Nothing is copied from Drive; reference-only entries never get public URLs.
"""
import json
from pathlib import Path
from datetime import date
ROOT=Path(__file__).resolve().parent
M=ROOT/'manifests'
def load(p):return json.loads(p.read_text(encoding='utf-8'))
def save(p,o):p.write_text(json.dumps(o,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
def main():
 index=load(M/'index.json');files=[];groups=[];missing=[]
 for group in index['studios']:
  p=M/group['manifest'];items=load(p).get('files',[])
  group['fileCount']=len(items);rows=[]
  for n,f in enumerate(items,1):
   status=f.get('storage','reference-only');href=None
   if status=='local':
    dest=(p.parent/f.get('path','')).resolve()
    if not dest.is_relative_to(ROOT.resolve()) or not dest.exists():
     missing.append(f.get('name',''));status='missing-local'
    elif dest.is_file():
     href='./'+dest.relative_to(ROOT).as_posix()
    else:status='local-folder'
   row={'id':group['id']+'-'+str(n).zfill(3),'name':f.get('name',''),
        'categoryId':group['id'],'category':group['label'],
        'subCategory':f.get('category'),'kind':f.get('kind'),
        'storage':status,'href':href,
        'description':f.get('description') or f.get('label')}
   if f.get('review'):row['review']=f['review']
   rows.append(row)
  groups.append({'id':group['id'],'label':group['label'],'manifest':group['manifest'],
   'fileCount':len(rows),'publishedCount':sum(x['storage']=='local' for x in rows),
   'referenceCount':sum(x['storage']=='reference-only' for x in rows),
   'folderCount':sum(x['storage']=='local-folder' for x in rows),
   'missingCount':sum(x['storage']=='missing-local' for x in rows)})
  files.extend(rows)
 summary={'categories':len(groups),'entries':len(files),
  'local':sum(x['storage']=='local' for x in files),
  'referenceOnly':sum(x['storage']=='reference-only' for x in files),
  'localFolders':sum(x['storage']=='local-folder' for x in files),
  'missingLocal':len(missing)}
 out={'schema':'nlab-demo-complete-index/v1','updated':str(date.today()),
  'sourceManifest':'./index.json',
  'description':'Local files are public; reference-only Drive items are not downloadable.',
  'summary':summary,'categories':groups,'files':files}
 index['updated']=str(date.today());index['completeCatalogue']='./catalogue-complet.json'
 save(M/'index.json',index);save(M/'catalogue-complet.json',out)
 if missing:raise SystemExit('Missing published files: '+', '.join(missing))
 print('nLab Demo index:',summary)
if __name__=='__main__':main()
