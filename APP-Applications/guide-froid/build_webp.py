#!/usr/bin/env python3
"""Generate lightweight public WebP test illustrations from verified local PNG sources."""
from __future__ import annotations
import json
from pathlib import Path
from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parent
ASSETS = ROOT / "assets" / "tests"
MANIFEST = ASSETS / "manifest.json"
if not MANIFEST.exists():
    raise SystemExit("Missing Guide Froid image manifest")
manifest = json.loads(MANIFEST.read_text(encoding="utf-8"))
count = 0
for code, item in manifest["images"].items():
    source = ASSETS / (code + ".png")
    dest = ASSETS / (code + ".webp")
    if not source.is_file():
        raise SystemExit(f"Missing approved illustration: {source}")
    with Image.open(source) as opened:
        image = ImageOps.exif_transpose(opened)
        image.thumbnail((1400, 1400), Image.Resampling.LANCZOS)
        if image.mode not in ("RGB", "RGBA"):
            image = image.convert("RGBA" if "A" in image.getbands() else "RGB")
        image.save(dest, "WEBP", quality=77, method=6)
    if dest.stat().st_size <= 0:
        raise SystemExit("Empty WebP generated: " + str(dest))
    item.update({"path": code + ".webp", "status": "published", "validated": True})
    count += 1
manifest["format"] = "webp"
MANIFEST.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
print(f"Guide Froid: generated {count} locally hosted WebP images")
