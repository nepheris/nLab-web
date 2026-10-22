#!/usr/bin/env python3
"""Synthetic contract tests for the Studio health auditor (no network)."""
from __future__ import annotations
import importlib.util
import json
import tempfile
import unittest
from pathlib import Path

MODULE = Path(__file__).resolve().parents[1] / "scripts" / "studios_health_audit.py"
SPEC = importlib.util.spec_from_file_location("studio_health", MODULE)
audit = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(audit)


class StudioHealthAuditTests(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.root = Path(self.tmp.name)
        self.apps = self.root / "APP-Applications"
        (self.apps / "studios").mkdir(parents=True)
        (self.apps / "example" / "versions" / "0.9.0").mkdir(parents=True)
        (self.apps / "example" / "versions" / "0.9.0" / "index.html").write_text("historical", encoding="utf-8")
        (self.apps / "example" / "index.html").write_text("current", encoding="utf-8")
        (self.apps / "studios" / "catalog.json").write_text(json.dumps({
            "studios": [{"id": "example", "name": "Example Studio",
                         "version_registry": "../example/versions.json"}]}), encoding="utf-8")
        self.registry = self.apps / "example" / "versions.json"
        self.save({
            "current": "1.0.0", "test": None,
            "versions": [
                {"version": "1.0.0", "status": "current", "current": True, "href": "./"},
                {"version": "0.9.0", "status": "historical", "current": False,
                 "href": "./versions/0.9.0/"}]})

    def tearDown(self):
        self.tmp.cleanup()

    def save(self, obj):
        self.registry.write_text(json.dumps(obj), encoding="utf-8")

    def test_one_current_and_one_historical(self):
        result = audit.scan(self.root)
        self.assertEqual(result["summary"]["errors"], 0, result["findings"])
        self.assertEqual(result["summary"]["studios"], 1)
        self.assertEqual(result["summary"]["entries"], 2)
        self.assertEqual(result["summary"]["historical"], 1)
        self.assertEqual(result["studios"][0]["archive_files_checked"], 2)
        self.assertIn("| example |", audit.markdown(result))

    def test_manifest_link_is_not_installability_proof(self):
        home = self.apps / "example"
        (home / "index.html").write_text(
            '<html><head><link rel="manifest" href="./install.webmanifest"></head></html>',
            encoding="utf-8")
        (home / "install.webmanifest").write_text(
            json.dumps({"name": "Example", "start_url": "./", "scope": "./",
                        "display": "standalone", "icons": [{"src": "icon.png"}]}),
            encoding="utf-8")
        report = audit.scan(self.root)
        self.assertEqual(report["studios"][0]["manifest_link"], "linked-file")
        self.assertEqual(report["summary"]["linked_manifests"], 1)
        self.assertEqual(report["studios"][0]["pwa_installability"], "not-verified")
        (home / "install.webmanifest").unlink()
        report = audit.scan(self.root)
        self.assertEqual(report["studios"][0]["manifest_link"], "missing-target")
        self.assertIn("manifest-link-missing", {f["code"] for f in report["findings"]})

    def test_invalid_current_pointer_is_blocking(self):
        self.save({"current": "99.0.0", "test": None,
                   "versions": [{"version": "1.0.0", "status": "current", "href": "./"}]})
        result = audit.scan(self.root)
        self.assertIn("pointer-missing", {f["code"] for f in result["findings"]})

    def test_version_href_escape_rejected(self):
        self.save({"current": "1.0.0", "versions": [
            {"version": "1.0.0", "status": "current", "href": "../../../../private/"}]})
        result = audit.scan(self.root)
        self.assertIn("invalid-href", {f["code"] for f in result["findings"]})

    def test_invalid_and_missing_manifest_are_diagnostics_not_installability(self):
        result = audit.scan(self.root)
        self.assertEqual(result["studios"][0]["pwa_installability"], "not-verified")
        self.assertEqual(result["studios"][0]["manifest"], "absent")
        manifest = self.apps / "example" / "manifest.webmanifest"
        manifest.write_text("{", encoding="utf-8")
        result = audit.scan(self.root)
        self.assertIn("manifest-invalid", {f["code"] for f in result["findings"]})
        self.assertEqual(result["summary"]["errors"], 0)


if __name__ == "__main__":
    unittest.main()
