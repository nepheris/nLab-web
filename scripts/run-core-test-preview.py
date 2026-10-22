#!/usr/bin/env python3
"""Start the isolated nLab Studio Core 3.10 TEST preview from the extracted CI kit."""
from __future__ import annotations
import argparse
import functools
import http.server
import json
import socket
import sys
import webbrowser
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
URL_PATH = "/APP-Applications/studio-core-test/"
EXPECTED = "0.8.0"


def verify(root: Path):
    root = root.resolve()
    paths = [
        "APP-Applications/studio-core-test/index.html",
        "APP-Applications/studio-core-test/manifest.webmanifest",
        "APP-Applications/studio-core-test/versions.json",
        "APP-Applications/_shared/studio-v2/studio.css",
        "APP-Applications/studio-core-test/versions/0.7.0/index.html",
        "APP-Applications/studios/index.html",
        "FRMW-Frameworks/Web-Framework/runtime/application-shell-runtime.js",
        "assets/branding/nlab-wordmark.svg",
        "Library/demo/index.html",
    ]
    missing = [p for p in paths if not (root / p).is_file()]
    if missing:
        raise ValueError("Kit incomplet : " + ", ".join(missing))
    reg = json.loads((root / "APP-Applications/studio-core-test/versions.json").read_text(encoding="utf-8"))
    if reg.get("test") != EXPECTED or reg.get("current") is not None:
        raise ValueError("Mauvaise version : ce kit exige Lab 0.8 TEST et CURRENT null")
    if not any(v.get("version") == EXPECTED and v.get("status") == "test" for v in reg.get("versions", [])):
        raise ValueError("La version TEST n'est pas déclarée dans le registre")
    return root


def main():
    parser = argparse.ArgumentParser(description="nLab Core 3.10 TEST · aperçu local en lecture seule")
    parser.add_argument("--port", type=int, default=8765)
    parser.add_argument("--lan", action="store_true", help="Expose le serveur sur le réseau local ; PAS d'HTTPS")
    parser.add_argument("--no-browser", action="store_true")
    parser.add_argument("--check", action="store_true", help="Vérifie le kit puis s'arrête")
    opts = parser.parse_args()
    try:
        verify(ROOT)
    except (ValueError, OSError, json.JSONDecodeError) as exc:
        parser.error(str(exc))
    if opts.check:
        print("Core 3.10 TEST / Lab 0.8 : archive complète, canal TEST isolé.")
        return 0
    if not 1 <= opts.port <= 65535:
        parser.error("port hors plage")
    host = "0.0.0.0" if opts.lan else "127.0.0.1"
    handler = functools.partial(http.server.SimpleHTTPRequestHandler, directory=str(ROOT))
    try:
        server = http.server.ThreadingHTTPServer((host, opts.port), handler)
    except OSError as exc:
        parser.error(f"Impossible de démarrer : {exc}")
    local = f"http://localhost:{opts.port}{URL_PATH}"
    print(f"\nCore 3.10 TEST / Lab 0.8 : {local}\n", flush=True)
    if opts.lan:
        print("⚠ Réseau local : accès HTTP sans authentification ni HTTPS ; utiliser seulement sur un réseau privé de confiance.")
        print("Android : ouvrir http://<IP_LOCALE_DU_PC>:" + str(opts.port) + URL_PATH)
        print("PWA Android/HTTPS : NON VALIDABLE par ce serveur HTTP LAN.", flush=True)
    if not opts.no_browser and not opts.lan:
        try:
            webbrowser.open(local)
        except Exception:
            pass
    try:
        server.serve_forever(poll_interval=0.5)
    except KeyboardInterrupt:
        print("\nServeur arrêté.", flush=True)
    finally:
        server.server_close()
    return 0


if __name__ == "__main__":
    sys.exit(main())
