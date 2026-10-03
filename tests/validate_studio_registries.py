#!/usr/bin/env python3
"""Validate nLab Studio catalog/version registry consistency."""
from __future__ import annotations

import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CATALOG = ROOT / "APP-Applications" / "studios" / "catalog.json"
SEMVER_RE = re.compile(r"^\d+(?:\.\d+){0,2}(?:[-+][0-9A-Za-z.-]+)?$")


def load(path: Path):
    with path.open("r", encoding="utf-8") as fh:
        return json.load(fh)


def fail(message: str, errors: list[str]) -> None:
    errors.append(message)


def main() -> int:
    errors: list[str] = []
    catalog = load(CATALOG)
    studios = catalog.get("studios") or []
    derived_apps = catalog.get("derived_apps") or []

    seen_ids: set[str] = set()
    for studio in studios:
        studio_id = studio.get("id")
        if not studio_id:
            fail("catalog: Studio without id", errors)
            continue
        if studio_id in seen_ids:
            fail(f"catalog: duplicate Studio id {studio_id}", errors)
            continue
        seen_ids.add(studio_id)

        registry_path = ROOT / "APP-Applications" / studio_id / "versions.json"
        if not registry_path.exists():
            fail(f"{studio_id}: missing versions.json", errors)
            continue

        registry = load(registry_path)
        versions = registry.get("versions") or []
        by_version: dict[str, dict] = {}
        for item in versions:
            version = str(item.get("version") or "")
            if not version:
                fail(f"{studio_id}: version entry without version", errors)
                continue
            if version in by_version:
                fail(f"{studio_id}: duplicate version {version}", errors)
            by_version[version] = item
            if not SEMVER_RE.match(version):
                fail(f"{studio_id}: non-semver version {version}", errors)

        current = registry.get("current")
        test = registry.get("test")
        active = {str(v) for v in (current, test) if v}

        if not active:
            fail(f"{studio_id}: no CURRENT or TEST pointer", errors)

        for channel, pointer in (("current", current), ("test", test)):
            if not pointer:
                continue
            pointer = str(pointer)
            item = by_version.get(pointer)
            if item is None:
                fail(f"{studio_id}: {channel} pointer {pointer} is absent from versions[]", errors)
                continue
            status = str(item.get("status") or "").lower()
            if status != channel:
                fail(f"{studio_id}: {pointer} is selected as {channel} but status={status!r}", errors)
            if channel == "current" and item.get("current") is not True:
                fail(f"{studio_id}: CURRENT {pointer} must have current=true", errors)
            if channel == "test" and item.get("current") is True:
                fail(f"{studio_id}: TEST {pointer} must not have current=true", errors)

        for version, item in by_version.items():
            status = str(item.get("status") or "").lower()
            is_current = item.get("current") is True
            if version not in active and (status in {"current", "test"} or is_current):
                fail(
                    f"{studio_id}: inactive version {version} still advertises "
                    f"status={status!r}, current={is_current}",
                    errors,
                )
            if status == "historical" and version in active:
                fail(f"{studio_id}: historical version {version} is referenced by an active pointer", errors)

        catalog_registry = studio.get("version_registry")
        expected_suffix = f"../{studio_id}/versions.json"
        if catalog_registry and not str(catalog_registry).endswith(expected_suffix):
            fail(
                f"{studio_id}: catalog version_registry={catalog_registry!r} does not target {expected_suffix}",
                errors,
            )

    for app in derived_apps:
        app_id = app.get("id")
        if not app_id:
            fail("catalog: derived app without id", errors)
            continue
        if app_id in seen_ids:
            fail(f"catalog: duplicate Studio/derived app id {app_id}", errors)
            continue
        seen_ids.add(app_id)
        parent = app.get("parent_studio")
        if not parent or parent not in {s.get("id") for s in studios}:
            fail(f"{app_id}: invalid parent_studio {parent!r}", errors)
        registry_path = ROOT / "APP-Applications" / app_id / "versions.json"
        if not registry_path.exists():
            fail(f"{app_id}: missing versions.json", errors)
            continue
        registry = load(registry_path)
        versions = registry.get("versions") or []
        by_version = {str(item.get("version") or ""): item for item in versions if item.get("version")}
        for version in by_version:
            if not SEMVER_RE.match(version):
                fail(f"{app_id}: non-semver version {version}", errors)
        for channel in ("current", "test"):
            pointer = registry.get(channel)
            if not pointer:
                continue
            item = by_version.get(str(pointer))
            if item is None:
                fail(f"{app_id}: {channel} pointer {pointer} is absent from versions[]", errors)
                continue
            if str(item.get("status") or "").lower() != channel:
                fail(f"{app_id}: {pointer} selected as {channel} but status={item.get('status')!r}", errors)
        if any("date" in item for item in versions):
            fail(f"{app_id}: mutable release date must not be hard-coded in versions[]", errors)

    if errors:
        print("Studio registry validation: FAIL", file=sys.stderr)
        for err in errors:
            print(f" - {err}", file=sys.stderr)
        return 1

    print(f"Studio registry validation: OK ({len(studios)} Studios, {len(derived_apps)} derived apps)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
