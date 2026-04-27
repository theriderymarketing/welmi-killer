/**
 * Welmi Claude proxy client — routes through user's Codespace proxy
 * which consumes the Max plan. Marginal cost ≈ €0.
 *
 * Endpoint: POST {PROXY_URL}/v1/messages   (Anthropic-compatible body)
 */

const PROXY_URL = process.env.EXPO_PUBLIC_CLAUDE_PROXY_URL!;
const PROXY_KEY = process.env.EXPO_PUBLIC_CLAUDE_PROXY_KEY!;

export type ClaudeMessage =
  | { role: 'user' | 'assistant'; content: string }
  | { role: 'user'; content: ClaudeContentBlock[] };

export type ClaudeContentBlock =
  | { type: 'text'; text: string }
  | {
      type: 'image';
      source: { type: 'base64'; media_type: string; data: string };
    };

export type ClaudeRequest = {
  model: 'claude-sonnet-4-6' | 'claude-haiku-4-5-20251001' | 'claude-opus-4-7';
  max_tokens: number;
  system?: string;
  temperature?: number;
  messages: ClaudeMessage[];
};

export type ClaudeResponse = {
  content: Array<{ type: 'text'; text: string }>;
  stop_reason: string;
  usage: { input_tokens: number; output_tokens: number };
};

export async function callClaude(req: ClaudeRequest): Promise<ClaudeResponse> {
  const r = await fetch(`${PROXY_URL}/v1/messages`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': PROXY_KEY,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify(req)
  });
  if (!r.ok) {
    const txt = await r.text();
    throw new Error(`claude_proxy_${r.status}: ${txt.slice(0, 200)}`);
  }
  return (await r.json()) as ClaudeResponse;
}

/** Extracts the first text block, throws if none found. */
export function extractText(resp: ClaudeResponse): string {
  const block = resp.content.find((c) => c.type === 'text');
  if (!block) throw new Error('claude_no_text_block');
  return block.text;
}
