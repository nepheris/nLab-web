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

# Validate demo/library references used by Studio V2 pages and runtimes.
demo_ref_re=re.compile(r"""["'](\.\./\.\./Library/demo/[^"']*)["']""")
for studio_id in CONTRACTS["studios"]:
    if studio_id=="pdf-studio":
        files=[ROOT/"APP-Applications/pdf-studio/v2/index.html",ROOT/"APP-Applications/pdf-studio/v2/pdf-v2.js"]
    else:
        base=ROOT/"APP-Applications"/studio_id/"v2"
        files=[base/"index.html",base/"v2-app.js"]
    for src in files:
        if not src.exists(): continue
        text=src.read_text(encoding="utf-8")
        for ref in demo_ref_re.findall(text):
            # Studio references use ../../ from APP-Applications/<studio>/ after <base href="../">.
            rel=ref[len("../../"):]
            target=ROOT/rel
            if ref.endswith("/"):
                if not target.is_dir(): fail(f"{studio_id}: broken demo directory reference {ref}")
            elif not target.exists():
                fail(f"{studio_id}: broken demo file reference {ref}")

# Validate local paths declared by demo manifests.
manifest_dir=ROOT/"Library/demo/manifests"
if manifest_dir.exists():
    for manifest in manifest_dir.glob("*.json"):
        try: data=json.loads(manifest.read_text(encoding="utf-8"))
        except Exception as exc:
            fail(f"demo manifest {manifest.name}: invalid JSON: {exc}"); continue
        for item in data.get("files",[]):
            if item.get("storage")!="local" or not item.get("path"): continue
            target=(manifest.parent/item["path"]).resolve()
            try: target.relative_to(ROOT.resolve())
            except ValueError:
                fail(f"demo manifest {manifest.name}: path escapes repository: {item['path']}"); continue
            if not target.exists():
                fail(f"demo manifest {manifest.name}: missing local file {item['path']}")

if errors:
    print("Studio feature contracts: FAIL",file=sys.stderr)
    for e in errors: print(" - "+e,file=sys.stderr)
    raise SystemExit(1)
print(f"Studio feature contracts: OK ({len(CONTRACTS['studios'])} Studios)")
