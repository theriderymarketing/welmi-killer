import AsyncStorage from '@react-native-async-storage/async-storage';

const REPO = process.env.EXPO_PUBLIC_DATA_REPO_RAW!;
const TTL_MS = 24 * 60 * 60 * 1000;

type PromptDoc = {
  version: number;
  system: string;
  userInstruction?: string;
  schema?: unknown;
};

type PromptKey = 'foodAnalysis' | 'voiceParse';

const PATH: Record<PromptKey, string> = {
  foodAnalysis: 'prompts/v1.json',
  voiceParse: 'prompts/voice-v1.json'
};

/**
 * Hot-updateable prompts hosted on GitHub raw.
 * 24h TTL cache via AsyncStorage. Falls back to cache on network failure.
 */
export async function getPrompt(key: PromptKey): Promise<PromptDoc> {
  const cacheKey = `prompt.${key}`;
  const url = `${REPO}/${PATH[key]}`;

  const cachedRaw = await AsyncStorage.getItem(cacheKey);
  const cached = cachedRaw ? (JSON.parse(cachedRaw) as { fetchedAt: number; doc: PromptDoc }) : null;
  if (cached && Date.now() - cached.fetchedAt < TTL_MS) return cached.doc;

  try {
    const r = await fetch(url, { headers: { 'Cache-Control': 'no-cache' } });
    if (!r.ok) throw new Error(`prompt_${r.status}`);
    const doc = (await r.json()) as PromptDoc;
    await AsyncStorage.setItem(cacheKey, JSON.stringify({ fetchedAt: Date.now(), doc }));
    return doc;
  } catch (err) {
    if (cached) return cached.doc;
    throw err;
  }
}
