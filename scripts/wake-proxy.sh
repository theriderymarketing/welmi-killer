#!/usr/bin/env bash
# Wake Welmi Codespace + ensure uvicorn is running, then verify /health.
# Run before a session if you want to avoid the 60-90s cold-start delay.

set -euo pipefail
CODESPACE="musical-halibut-r7v47wjv4g4f945"
PROXY_URL="${EXPO_PUBLIC_CLAUDE_PROXY_URL:-https://welmi-proxy.welmi.workers.dev}"

echo "→ Waking $CODESPACE"
gh codespace ssh -c "$CODESPACE" -- "echo awake"

echo "→ Ensuring uvicorn"
gh codespace ssh -c "$CODESPACE" -- \
  "pgrep -f 'uvicorn main:app' >/dev/null || (cd /workspaces/welmi-claude-proxy && nohup uvicorn main:app --host 0.0.0.0 --port 8787 > /tmp/uvicorn.log 2>&1 &)"

echo "→ Verifying $PROXY_URL/health"
sleep 3
curl -fsS --max-time 30 "$PROXY_URL/health" && echo
echo "✓ Welmi proxy ready"
