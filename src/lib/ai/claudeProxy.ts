/**
 * Welmi proxy client.
 *
 * Welmi proxy stack:
 *   Cloudflare Worker (welmi-proxy.welmi.workers.dev)
 *     -> wakes Codespace (FastAPI :8787)
 *     -> Claude Code CLI in headless (`claude -p ...`)
 *     -> Returns raw Claude Code CLI JSON: { result: string, ...usage, model }
 *
 * Auth: Bearer PROXY_API_KEY.
 * Cold start (first call after 30min idle): 60-90s.
 * First chat call: ~25s (CLI bootstrap + cache prime).
 * Warm calls: 2-5s.
 * Concurrency: 1 request at a time (asyncio mutex on /v1/chat and /v1/vision).
 *
 * Endpoints:
 *   POST /v1/chat    JSON  { prompt, system? }     -> ClaudeCliResult
 *   POST /v1/vision  multipart  prompt, image      -> ClaudeCliResult
 *   GET  /health
 */

const PROXY_URL = process.env.EXPO_PUBLIC_CLAUDE_PROXY_URL!;
const PROXY_KEY = process.env.EXPO_PUBLIC_CLAUDE_PROXY_KEY!;

export type ClaudeCliResult = {
  result: string;
  is_error: boolean;
  duration_ms?: number;
  total_cost_usd?: number;
  usage?: unknown;
  modelUsage?: Record<string, unknown>;
};

class ProxyError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

async function postJson(path: string, body: unknown, timeoutMs = 120_000): Promise<ClaudeCliResult> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const r = await fetch(`${PROXY_URL}${path}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${PROXY_KEY}`
      },
      body: JSON.stringify(body),
      signal: ctrl.signal
    });
    if (!r.ok) {
      const txt = await r.text();
      throw new ProxyError(r.status, `welmi_${r.status}: ${txt.slice(0, 200)}`);
    }
    const json = (await r.json()) as ClaudeCliResult;
    if (json.is_error) throw new ProxyError(500, `claude_error: ${json.result?.slice(0, 200)}`);
    return json;
  } finally {
    clearTimeout(timer);
  }
}

/** Plain text/JSON-out chat. Returns the raw `.result` text from Claude. */
export async function chat(prompt: string, system?: string): Promise<string> {
  const out = await postJson('/v1/chat', { prompt, system });
  return out.result;
}

/**
 * Vision call. Sends an image (local URI from camera/gallery) plus a prompt.
 * The proxy expects multipart with fields { prompt, image }.
 */
export async function vision(opts: { imageUri: string; prompt: string; system?: string }): Promise<string> {
  const form = new FormData();
  form.append('image', {
    uri: opts.imageUri,
    name: 'meal.jpg',
    type: 'image/jpeg'
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } as any);
  form.append('prompt', opts.prompt);
  if (opts.system) form.append('system', opts.system);

  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 120_000);
  try {
    const r = await fetch(`${PROXY_URL}/v1/vision`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${PROXY_KEY}` },
      body: form,
      signal: ctrl.signal
    });
    if (!r.ok) {
      const txt = await r.text();
      throw new ProxyError(r.status, `welmi_vision_${r.status}: ${txt.slice(0, 200)}`);
    }
    const json = (await r.json()) as ClaudeCliResult;
    if (json.is_error) throw new ProxyError(500, `claude_vision_error: ${json.result?.slice(0, 200)}`);
    return json.result;
  } finally {
    clearTimeout(timer);
  }
}

export async function healthcheck(): Promise<boolean> {
  try {
    const r = await fetch(`${PROXY_URL}/health`);
    if (!r.ok) return false;
    const j = (await r.json()) as { status?: string };
    return j.status === 'healthy';
  } catch {
    return false;
  }
}
