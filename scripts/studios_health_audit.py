#!/usr/bin/env python3
"""nLab Studios registry health report. Static repository facts, not live availability."""
from __future__ import annotations
import argparse
import json
import re
from datetime import datetime, timezone
from pathlib import Path
from urllib.parse import unquote, urlsplit

CHANNELS = {"current", "test", "historical"}
SEMVER = re.compile(r"^\d+(?:\.\d+){0,2}(?:[-+][0-9a-zA-Z.-]+)?$")
ROOT = Path(__file__).resolve().parents[1]


def read_json(path: Path):
    try:
        return json.loads(path.read_text(encoding="utf-8")), None
    except (OSError, ValueError) as exc:
        return None, f"{type(exc).__name__}: {exc}"


def within(path: Path, root: Path) -> bool:
    return path == root or root in path.parents


def local_resource(base: Path, href: str, root: Path):
    """Resolve a repository-local relative link. None means remote or invalid."""
    if not isinstance(href, str) or not href.strip():
        return None, "empty link"
    parts = urlsplit(href.strip())
    if parts.scheme or parts.netloc:
        return None, "remote link (not checked)"
    target = (root / unquote(parts.path.lstrip("/"))) if parts.path.startswith("/") else (base / unquote(parts.path))
    resolved = target.resolve()
    if not within(resolved, root.resolve()):
        return None, "path escapes repository"
    if resolved.is_dir() or parts.path.endswith("/"):
        resolved = resolved / "index.html"
    return resolved, None


def scan(root: Path):
    app = root / "APP-Applications"
    catalog_path = app / "studios" / "catalog.json"
    catalog, failure = read_json(catalog_path)
    findings = []
    records = []
    if failure or not isinstance(catalog, dict):
        return {"schema": "nlab-studios-health/v1", "source": str(catalog_path.relative_to(root)),
                "summary": {"studios": 0, "entries": 0, "errors": 1, "warnings": 0},
                "findings": [{"severity": "error", "code": "catalog-invalid", "detail": failure or "expected object"}],
                "studios": []}
    entries = (catalog.get("studios") or []) + (catalog.get("derived_apps") or [])
    seen = set()
    def note(studio, level, code, detail):
        findings.append({"id": studio, "severity": level, "code": code, "detail": detail})

    for entry in entries:
        sid = entry.get("id") if isinstance(entry, dict) else None
        if not isinstance(sid, str) or not re.fullmatch(r"[a-z0-9][a-z0-9-]*", sid):
            note(str(sid), "error", "invalid-id", "Invalid or missing Studio ID")
            continue
        if sid in seen:
            note(sid, "error", "duplicate-id", "Duplicate catalog ID")
            continue
        seen.add(sid)
        home = app / sid
        record = {"id": sid, "name": entry.get("name", sid), "catalog_status": entry.get("status"),
                  "current": None, "test": None, "version_count": 0, "historical_count": 0,
                  "archive_files_checked": 0, "manifest": "absent", "pwa_installability": "not-verified"}
        records.append(record)
        declared = entry.get("version_registry", "../" + sid + "/versions.json")
        path, error = local_resource(app / "studios", declared, root)
        if error or not path or path != home / "versions.json":
            note(sid, "error", "registry-link", f"Catalog registry link invalid: {declared!r} ({error or path})")
            continue
        registry, failure = read_json(path)
        if failure or not isinstance(registry, dict):
            note(sid, "error", "registry-invalid", failure or "expected JSON object")
            continue
        versions = registry.get("versions")
        if not isinstance(versions, list):
            note(sid, "error", "versions-not-array", "versions[] missing")
            continue
        record["current"], record["test"] = registry.get("current"), registry.get("test")
        record["version_count"] = len(versions)
        record["historical_count"] = sum(isinstance(v, dict) and v.get("status") == "historical" for v in versions)
        seen_versions = {}
        for version in versions:
            if not isinstance(version, dict):
                note(sid, "error", "version-invalid", "Non-object version entry")
                continue
            value = version.get("version")
            if not isinstance(value, str) or not SEMVER.fullmatch(value):
                note(sid, "error", "version-invalid", f"Invalid semver: {value!r}")
                continue
            if value in seen_versions:
                note(sid, "error", "version-duplicate", f"Duplicate version {value}")
            seen_versions[value] = version
            status = version.get("status")
            if status not in CHANNELS:
                note(sid, "error", "unknown-status", f"{value} status {status!r}")
            target, issue = local_resource(home, version.get("href", ""), root)
            if issue and issue != "remote link (not checked)":
                note(sid, "error", "invalid-href", f"{value}: {issue}")
            elif target:
                record["archive_files_checked"] += 1
                if not target.is_file():
                    note(sid, "warning", "local-route-missing", f"{value} href {version.get('href')!r}: {target.relative_to(root)}")
            if version.get("current") is True and status != "current":
                note(sid, "error", "flag-status-mismatch", f"{value}: current:true but status={status}")
        for channel in ("current", "test"):
            value = registry.get(channel)
            if value is None:
                continue
            chosen = seen_versions.get(value)
            if chosen is None:
                note(sid, "error", "pointer-missing", f"{channel}={value!r} has no version entry")
            elif chosen.get("status") != channel:
                note(sid, "error", "pointer-status-mismatch", f"{channel}={value!r}: status={chosen.get('status')}")
        manifest_path = home / "manifest.webmanifest"
        if manifest_path.exists():
            manifest, failure = read_json(manifest_path)
            if failure or not isinstance(manifest, dict):
                record["manifest"] = "invalid"
                note(sid, "warning", "manifest-invalid", failure or "expected object")
            else:
                record["manifest"] = "present"
                if not manifest.get("name") and not manifest.get("short_name"):
                    note(sid, "warning", "manifest-name-missing", "No PWA name or short_name")
                if manifest.get("display") not in ("standalone", "fullscreen", "minimal-ui", "browser"):
                    note(sid, "warning", "manifest-display", f"display={manifest.get('display')!r}")
                for field in ("start_url", "scope"):
                    if not manifest.get(field):
                        note(sid, "warning", "manifest-field-missing", f"{field} missing")
                if not manifest.get("icons"):
                    note(sid, "warning", "manifest-icons-missing", "No declared icons")
        icon, issue = local_resource(app / "studios", entry.get("icon", ""), root)
        if icon is not None and not icon.is_file():
            note(sid, "warning", "catalog-icon-missing", str(icon.relative_to(root)))
        elif issue and issue != "remote link (not checked)":
            note(sid, "warning", "catalog-icon-invalid", issue)
    return {"schema": "nlab-studios-health/v1", "generated_utc": datetime.now(timezone.utc).isoformat(),
            "source": str(catalog_path.relative_to(root)),
            "summary": {"studios": len(records), "entries": sum(r["version_count"] for r in records),
                        "historical": sum(r["historical_count"] for r in records),
                        "errors": sum(f["severity"] == "error" for f in findings),
                        "warnings": sum(f["severity"] == "warning" for f in findings),
                        "manifests": sum(r["manifest"] == "present" for r in records)},
            "findings": findings, "studios": records,
            "limitations": "Static repository scan: no browser/Android/HTTP/PWA installation guarantee."}


def markdown(report):
    s = report["summary"]
    lines = ["# nLab Studios — static registry health", "",
             f"**{s['studios']}** Studios/apps · **{s['entries']}** versions · **{s.get('historical',0)}** historiques · "
             f"**{s['errors']}** erreurs · **{s['warnings']}** alertes", "",
             "Static audit only. No claim of deployed URLs or device/PWA validation.", "",
             "| Studio | CURRENT | TEST | Versions | Historiques | Manifeste |",
             "|---|---|---|---:|---:|---|"]
    for row in report["studios"]:
        lines.append(f"| {row['id']} | {row['current'] or '—'} | {row['test'] or '—'} | {row['version_count']} | {row['historical_count']} | {row['manifest']} |")
    lines += ["", "## Findings", ""]
    lines += [f"- **{f['severity']}** `{f.get('id','catalog')}` / `{f['code']}`: {f['detail']}" for f in report["findings"]] or ["No findings."]
    return "\n".join(lines) + "\n"


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--root", type=Path, default=ROOT)
    parser.add_argument("--json", type=Path, default=Path("artifacts/studios-health/report.json"))
    parser.add_argument("--markdown", type=Path, default=Path("artifacts/studios-health/report.md"))
    parser.add_argument("--strict", action="store_true", help="Fail if critical registry inconsistencies exist")
    args = parser.parse_args()
    report = scan(args.root.resolve())
    for path, text in ((args.json, json.dumps(report, ensure_ascii=False, indent=2) + "\n"),
                       (args.markdown, markdown(report))):
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(text, encoding="utf-8")
    print(json.dumps({"report": str(args.json), "summary": report["summary"]}, ensure_ascii=False))
    return 1 if args.strict and report["summary"]["errors"] else 0


if __name__ == "__main__":
    raise SystemExit(main())
