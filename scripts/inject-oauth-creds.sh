#!/usr/bin/env bash
# Inject OAuth client credentials into .env interactively.
# Run after registering apps on Strava / COROS / Oura per OAUTH-SETUP.md.
#
# Usage:  ./scripts/inject-oauth-creds.sh

set -euo pipefail
cd "$(dirname "$0")/.."

ENV_FILE=".env"
[[ -f "$ENV_FILE" ]] || { echo "Missing .env — run \`cp .env.example .env\` first"; exit 1; }

prompt() {
  local var=$1 label=$2
  local current
  current=$(grep -E "^${var}=" "$ENV_FILE" | cut -d= -f2-)
  read -rp "$label [${current:-empty}]: " input
  if [[ -n "${input:-}" ]]; then
    if grep -qE "^${var}=" "$ENV_FILE"; then
      sed -i.bak "s|^${var}=.*|${var}=${input}|" "$ENV_FILE"
    else
      echo "${var}=${input}" >> "$ENV_FILE"
    fi
  fi
}

echo "==> Strava (https://www.strava.com/settings/api)"
prompt EXPO_PUBLIC_STRAVA_CLIENT_ID "  Client ID"
prompt STRAVA_CLIENT_SECRET         "  Client Secret"

echo "==> COROS (https://opena.coros.com/)"
prompt EXPO_PUBLIC_COROS_CLIENT_ID  "  Client ID"
prompt COROS_CLIENT_SECRET          "  Client Secret"

echo "==> Oura (https://cloud.ouraring.com/oauth/applications)"
prompt EXPO_PUBLIC_OURA_CLIENT_ID   "  Client ID"
prompt OURA_CLIENT_SECRET           "  Client Secret"

rm -f "${ENV_FILE}.bak"
echo "✓ .env updated. Re-run \`npx expo start --dev-client\` to pick up changes."
