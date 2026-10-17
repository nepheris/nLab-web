#!/usr/bin/env bash
# Isolated static TEST preview for Linux Chrome and a phone on the SAME trusted Wi-Fi.
# Serves ONLY selected public Studio Core assets. Does not deploy or modify CURRENT.
set -euo pipefail
command -v python3 >/dev/null || { echo "Python 3 requis."; exit 1; }
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
for p in APP-Applications/studio-core-lab/index.html APP-Applications/_shared/studio-v2/input-picker.js assets/icons; do
  [[ -e "$ROOT/$p" ]] || { echo "Fichier manquant dans la branche TEST: $p"; exit 1; }
done
TMP="$(mktemp -d)"
cleanup(){ rm -rf "$TMP"; }
trap cleanup EXIT
mkdir -p "$TMP/APP-Applications/_shared" "$TMP/APP-Applications/studio-core-lab" "$TMP/assets"
cp -R "$ROOT/APP-Applications/_shared/studio-v1" "$TMP/APP-Applications/_shared/"
cp -R "$ROOT/APP-Applications/_shared/studio-v2" "$TMP/APP-Applications/_shared/"
cp -R "$ROOT/APP-Applications/studio-core-lab/." "$TMP/APP-Applications/studio-core-lab/"
cp -R "$ROOT/assets/icons" "$TMP/assets/"
PORT="${PORT:-8770}"
IP="$(hostname -I 2>/dev/null | awk '{print $1}')"
echo ""
echo "Studio Core Lab — prévisualisation sans déploiement"
echo "Chrome sur Linux : http://127.0.0.1:${PORT}/APP-Applications/studio-core-lab/"
if [[ -n "$IP" ]]; then
 echo "Chrome sur Android (même Wi-Fi) : http://${IP}:${PORT}/APP-Applications/studio-core-lab/"
fi
echo "Ce serveur de test est visible sur le réseau local : utiliser uniquement un Wi-Fi de confiance."
echo "Seuls les modules Studio Core nécessaires sont exposés. Aucun fichier choisi n'est téléversé."
echo "Ctrl+C pour arrêter et supprimer la copie temporaire."
cd "$TMP"
exec python3 -m http.server "$PORT" --bind 0.0.0.0
