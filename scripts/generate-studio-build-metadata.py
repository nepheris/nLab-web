#!/usr/bin/env python3
from __future__ import annotations
import argparse, json, subprocess
from datetime import datetime, timezone
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]

def git(*args:str)->str:
    return subprocess.check_output(["git",*args],cwd=ROOT,text=True).strip()

def main():
    ap=argparse.ArgumentParser(description="Generate nLab Studio build metadata from canonical version registry + Git")
    ap.add_argument("studio_dir",help="Path relative to repository root, e.g. APP-Applications/pdf-sign")
    ap.add_argument("--channel",default="test",choices=["current","test"])
    ap.add_argument("--source-path",default="")
    ap.add_argument("--output",default="build.json")
    ns=ap.parse_args()
    studio=(ROOT/ns.studio_dir).resolve()
    versions=studio/"versions.json"
    if not versions.exists(): raise SystemExit(f"Missing {versions}")
    reg=json.loads(versions.read_text(encoding="utf-8"))
    version=reg.get(ns.channel) or ""
    source_path=ns.source_path or str(Path(ns.studio_dir)/"index.html")
    sha=git("rev-parse","HEAD")
    branch=git("rev-parse","--abbrev-ref","HEAD")
    commit_date=git("show","-s","--format=%cI",sha)
    payload={
      "schema":"nlab.studio-build/v1",
      "studioId":Path(ns.studio_dir).name,
      "version":version,
      "channel":ns.channel.upper(),
      "commitSha":sha,
      "commitShort":sha[:8],
      "commitDate":commit_date,
      "branch":branch,
      "builtAt":datetime.now(timezone.utc).isoformat(),
      "releasedAt":None,
      "sourcePath":source_path,
      "source":"generated-from-git"
    }
    out=studio/ns.output
    out.write_text(json.dumps(payload,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
    print(out.relative_to(ROOT))

if __name__=="__main__": main()
