#!/usr/bin/env bash
set -euo pipefail
npm install --no-save --no-package-lock @playwright/test@1.55.0 >/dev/null
npx playwright install --with-deps chromium >/dev/null
python3 -m http.server 4173 --bind 127.0.0.1 >/tmp/nlab-pdf-http.log 2>&1 &
server_pid=$!
trap 'kill "$server_pid" 2>/dev/null || true' EXIT
for i in $(seq 1 30); do
  if curl -fsS http://127.0.0.1:4173/APP-Applications/pdf-studio/app-0.9.25.html >/dev/null; then break; fi
  sleep 1
done
npx playwright test APP-Applications/pdf-studio/tests/ui-0.9.25.spec.cjs --reporter=line --workers=1
