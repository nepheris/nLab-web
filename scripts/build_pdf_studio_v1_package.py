#!/usr/bin/env python3
from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED
import json, datetime

ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'APP-Applications/pdf-studio/downloads/nLab-PDF-Studio-1.0.0-PORTABLE.zip'
INCLUDE=[
 ROOT/'APP-Applications/pdf-studio/v1',
 ROOT/'APP-Applications/_shared/studio-v1',
 ROOT/'assets/branding/nlab-wordmark.svg',
 ROOT/'assets/branding/nlab-favicon.svg',
]
def files():
    for p in INCLUDE:
        if p.is_dir():
            yield from sorted(x for x in p.rglob('*') if x.is_file())
        elif p.is_file():
            yield p
OUT.parent.mkdir(parents=True,exist_ok=True)
with ZipFile(OUT,'w',ZIP_DEFLATED,compresslevel=9) as z:
    for p in files():
        z.write(p,p.relative_to(ROOT))
    z.writestr('index.html','<!doctype html><meta charset="utf-8"><meta http-equiv="refresh" content="0;url=APP-Applications/pdf-studio/v1/"><title>nLab PDF Studio 1.0</title><a href="APP-Applications/pdf-studio/v1/">Ouvrir PDF Studio 1.0</a>')
    z.writestr('RELEASE.json',json.dumps({
      'product':'nLab PDF Studio','version':'1.0.0','channel':'TEST',
      'architecture':'standalone-studio-v1','legacy_runtimes_included':False,
      'built_at':datetime.datetime.now(datetime.timezone.utc).isoformat()
    },indent=2))
print(OUT)
