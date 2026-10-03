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
        runtime=ROOT/c.get("runtime", f"APP-Applications/{studio_id}/v2/v2-app.js")
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
    if c.get("required_capabilities"):
        manifest=ROOT/"APP-Applications"/studio_id/"v2/studio-manifest.js"
        sources=[]
        if manifest.exists(): sources.append(manifest.read_text(encoding="utf-8"))
        if runtime.exists(): sources.append(runtime.read_text(encoding="utf-8"))
        sources.append(html)
        mt="\n".join(sources)
        for capability in c["required_capabilities"]:
            if capability not in mt:
                fail(f"{studio_id}: missing declared capability {capability!r}")
    if studio_id!="pdf-studio":
        if "studio-v1/studio.css" in html:
            fail(f"{studio_id}: V2 page still imports Studio Core V1 CSS")
        if "studio-shell.js" in html:
            fail(f"{studio_id}: V2 page still imports legacy studio-shell.js")

# Validate the homogeneous nLab SVG icon libraries.
icon_registry=ROOT/"APP-Applications/_shared/studio-v2/icon-registry.js"
if icon_registry.exists():
    registry_text=icon_registry.read_text(encoding="utf-8")
    registry_names=set(re.findall(r"([A-Za-z0-9_]+):'<svg",registry_text))
    function_dir=ROOT/"assets/icons/functions"
    function_files={p.stem for p in function_dir.glob("*.svg")} if function_dir.exists() else set()
    missing_files=sorted(registry_names-function_files)
    extra_files=sorted(function_files-registry_names)
    if missing_files: fail("function SVG library missing: "+", ".join(missing_files))
    if extra_files: fail("function SVG library has unregistered files: "+", ".join(extra_files))
    for svg in function_dir.glob("*.svg"):
        t=svg.read_text(encoding="utf-8")
        if 'viewBox="0 0 24 24"' not in t: fail(f"{svg}: function icon must use 24x24 viewBox")
        if 'stroke="currentColor"' not in t: fail(f"{svg}: function icon must use currentColor")
        if 'stroke-width="1.7"' not in t: fail(f"{svg}: function icon must use stroke-width 1.7")
        if re.search(r'stroke="#|fill="#',t,re.I): fail(f"{svg}: hard-coded SVG color is forbidden")
    # Every icon name referenced by V2 manifests must exist in the canonical registry.
    for src in (ROOT/"APP-Applications").glob("*/v2/*"):
        if src.suffix.lower() not in {".js",".html"} or not src.is_file(): continue
        text=src.read_text(encoding="utf-8",errors="ignore")
        for name in re.findall(r"icon\s*:\s*['\"]([A-Za-z0-9_-]+)['\"]",text):
            if name not in registry_names:
                fail(f"{src.relative_to(ROOT)}: unknown function icon {name}")

studio_catalog=ROOT/"APP-Applications/studios/catalog.json"
if studio_catalog.exists():
    data=json.loads(studio_catalog.read_text(encoding="utf-8"))
    studio_dir=ROOT/"assets/studios"
    referenced=[]
    for s in list(data.get("studios",[]))+list(data.get("future",[])):
        icon_path=s.get("icon")
        if not icon_path: continue
        name=Path(icon_path).name
        referenced.append(name)
        target=studio_dir/name
        if not target.exists(): fail(f"studio icon missing: {name}")
    for svg in studio_dir.glob("*.svg"):
        t=svg.read_text(encoding="utf-8")
        if 'viewBox="0 0 64 64"' not in t: fail(f"{svg}: Studio icon must use 64x64 viewBox")
        if 'stroke="currentColor"' not in t: fail(f"{svg}: Studio icon must use currentColor")
        if 'stroke-width="3"' not in t: fail(f"{svg}: Studio icon must use stroke-width 3")
        if re.search(r'stroke="#|fill="#',t,re.I): fail(f"{svg}: hard-coded SVG color is forbidden")

# Validate canonical nLab Icon Library hierarchy and manifests.
icon_library=ROOT/"Library/demo/Images/nLab-Studio/Icon-Library"
if not icon_library.exists(): fail("canonical Icon-Library missing")
icon_index=json.loads((icon_library/"manifests/index.json").read_text(encoding="utf-8"))
expected_families={"studio-icons","function-icons","filetype-icons","ui-icons","symbology-icons"}
actual_families={x.get("id") for x in icon_index.get("families",[])}
if actual_families!=expected_families: fail(f"Icon-Library families mismatch: {sorted(actual_families)}")
for fam in expected_families:
    mf=json.loads((icon_library/"manifests"/f"{fam}.json").read_text(encoding="utf-8"))
    icons=mf.get("icons",[])
    if not icons: fail(f"{fam}: empty manifest")
    for item in icons:
        for key in ("id","label","file","family","description","usage","tags","status","planned","aliases"):
            if key not in item: fail(f"{fam}/{item.get('id','?')}: missing manifest field {key}")
        fp=(icon_library/"manifests"/item["file"]).resolve()
        if not fp.exists(): fail(f"{fam}/{item['id']}: missing SVG {fp}")
        t=fp.read_text(encoding="utf-8")
        if 'stroke="currentColor"' not in t: fail(f"{fp}: canonical icon must use currentColor")
if not (icon_library/"docs/mini-charte-iconographique-nlab.md").exists(): fail("Icon-Library charter missing")
if not (icon_library/"docs/icon-generation-prompt.md").exists(): fail("Icon-Library generation prompt missing")
if not (icon_library/"gallery/index.html").exists(): fail("Icon-Library gallery missing")

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
