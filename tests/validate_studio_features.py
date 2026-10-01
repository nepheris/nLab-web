#!/usr/bin/env python3
from __future__ import annotations
import json,re,sys
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
CONTRACTS=json.loads((ROOT/"tests/studio_feature_contracts.json").read_text(encoding="utf-8"))
errors=[]

def fail(msg): errors.append(msg)

for studio_id,c in CONTRACTS["studios"].items():
    if studio_id=="pdf-studio":
        index=ROOT/c["path"]; runtime=ROOT/c["runtime"]; registry=ROOT/"APP-Applications/pdf-studio/versions.json"
    else:
        index=ROOT/"APP-Applications"/studio_id/"v2/index.html"
        runtime=ROOT/"APP-Applications"/studio_id/"v2/v2-app.js"
        registry=ROOT/"APP-Applications"/studio_id/"versions.json"
    if not index.exists():
        fail(f"{studio_id}: missing V2 index {index.relative_to(ROOT)}"); continue
    reg=json.loads(registry.read_text(encoding="utf-8"))
    if str(reg.get("test"))!=str(c["test"]):
        fail(f"{studio_id}: TEST pointer {reg.get('test')!r} != contract {c['test']!r}")
    item=next((v for v in reg.get("versions",[]) if str(v.get("version"))==str(c["test"])),None)
    if not item:
        fail(f"{studio_id}: TEST version {c['test']} absent from registry")
    elif studio_id!="pdf-studio" and item.get("href")!="./v2/":
        fail(f"{studio_id}: V2 TEST href must be ./v2/, got {item.get('href')!r}")
    html=index.read_text(encoding="utf-8")
    ids=set(re.findall(r'\bid=["\']([^"\']+)["\']',html))
    for required in c.get("required_ids",[]):
        if required not in ids:
            fail(f"{studio_id}: missing required UI id #{required}")
    for marker in c.get("required_strings",[]):
        if marker.lower() not in html.lower():
            fail(f"{studio_id}: missing required HTML marker {marker!r}")
    if c.get("required_runtime_strings"):
        if not runtime.exists():
            fail(f"{studio_id}: missing runtime {runtime.relative_to(ROOT)}")
        else:
            js=runtime.read_text(encoding="utf-8")
            for marker in c["required_runtime_strings"]:
                if marker.lower() not in js.lower():
                    fail(f"{studio_id}: missing runtime marker {marker!r}")
    if studio_id!="pdf-studio":
        if "studio-v1/studio.css" in html:
            fail(f"{studio_id}: V2 page still imports Studio Core V1 CSS")
        if "studio-shell.js" in html:
            fail(f"{studio_id}: V2 page still imports legacy studio-shell.js")

if errors:
    print("Studio feature contracts: FAIL",file=sys.stderr)
    for e in errors: print(" - "+e,file=sys.stderr)
    raise SystemExit(1)
print(f"Studio feature contracts: OK ({len(CONTRACTS['studios'])} Studios)")
