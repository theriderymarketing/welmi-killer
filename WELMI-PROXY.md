# Welmi proxy — operations

The Welmi proxy is the AI backbone. It forwards the app's prompts to a Claude Code CLI running headless inside a GitHub Codespace, consuming your Max subscription.

## Topology

```
App (Expo)
  └── HTTPS Bearer auth ──> Cloudflare Worker (welmi-proxy.welmi.workers.dev)
                              └── Reverse-proxy ──> Codespace tunnel
                                                      (musical-halibut, port 8787, public)
                                                      └── FastAPI (main.py)
                                                            └── Claude Code CLI (`claude -p`)
```

## Verified state (2026-04-27 13:40)

- Codespace `musical-halibut-r7v47wjv4g4f945` — **Available**
- Port `8787` — **public** (required for Worker to reach it)
- Uvicorn — **running** (PID present)
- `/health` via Worker — **200 OK** in ~1s
- `/v1/chat` via Worker with `Bearer change-me` — **200 OK**, returned "PONG"
  via `claude-opus-4-7` (cold call ~27s, warm calls 2-5s expected)

## Active API key

```
PROXY_API_KEY = change-me
```

This is the **default fallback** because the Codespace `printenv` shows no
`PROXY_API_KEY` injected. The 64-hex key noted in your memory
(`752c956…34c32e`) was generated but never attached as a Codespace secret.

### Rotate to a real key

1. Generate a strong key:
   ```bash
   openssl rand -hex 32
   ```
2. Add it as a Codespace secret in GitHub:
   - https://github.com/settings/codespaces
   - **New secret** → name `PROXY_API_KEY` → value = the hex string
   - **Repository access** → tick `theriderymarketing/welmi-claude-proxy`
3. Restart the Codespace **and** re-run uvicorn (the secret is loaded at process start):
   ```bash
   gh codespace stop  -c musical-halibut-r7v47wjv4g4f945
   gh codespace ssh   -c musical-halibut-r7v47wjv4g4f945 -- "cd /workspaces/welmi-claude-proxy && nohup uvicorn main:app --host 0.0.0.0 --port 8787 > /tmp/uvicorn.log 2>&1 &"
   ```
4. Update `~/welmi-killer/.env`:
   ```
   EXPO_PUBLIC_CLAUDE_PROXY_KEY=<your_new_key>
   ```

## Cold-start mitigation

Codespaces auto-shutdown after 30 min idle. First call wakes it (60-90s). To
avoid the cold-start delay before a demo or session:

```bash
# Wake without making a real call
gh codespace ssh -c musical-halibut-r7v47wjv4g4f945 -- "echo woke"
# Then ensure uvicorn is up
gh codespace ssh -c musical-halibut-r7v47wjv4g4f945 -- \
  "pgrep -f uvicorn || (cd /workspaces/welmi-claude-proxy && nohup uvicorn main:app --host 0.0.0.0 --port 8787 > /tmp/uvicorn.log 2>&1 &)"
# Verify
curl https://welmi-proxy.welmi.workers.dev/health
```

Wrap as `~/welmi-killer/scripts/wake-proxy.sh` (already provided).

## Quotas

- Codespace: 60 h/month free (Personal account) — ~2 h/day if always-on.
  Auto-sleep saves quota when idle.
- Claude Code CLI: bound by your Max plan rate limits.
- Cloudflare Worker: 100k requests/day free.

## Response format

The proxy returns the **raw Claude Code CLI JSON**, not Anthropic-style:

```json
{
  "type": "result",
  "subtype": "success",
  "is_error": false,
  "result": "<the text Claude produced>",
  "duration_ms": 1693,
  "total_cost_usd": 0.094,
  "usage": { ... },
  "modelUsage": {
    "claude-haiku-4-5-20251001": { ... },
    "claude-opus-4-7[1m]": { ... }
  }
}
```

Client parses `.result` (string). The model is decided by the CLI session
(currently Opus 4.7 for chat) — the app cannot pick.

## Vision endpoint format

`POST /v1/vision` expects multipart fields:
- `image` (file) — JPEG/PNG
- `prompt` (string)
- `system` (string, optional)

Same response shape.
