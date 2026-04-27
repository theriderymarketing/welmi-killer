import * as FileSystem from 'expo-file-system';
import * as ImageManipulator from 'expo-image-manipulator';
import { z } from 'zod';
import { callClaude, extractText } from './claudeProxy';
import { getPrompt } from '../github/prompts';

export const FoodItemSchema = z.object({
  name: z.string(),
  quantity_g: z.number().nonnegative(),
  kcal: z.number().int().nonnegative(),
  protein_g: z.number().nonnegative(),
  carbs_g: z.number().nonnegative(),
  fat_g: z.number().nonnegative(),
  confidence: z.number().min(0).max(1)
});

export const FoodAnalysisSchema = z.object({
  usable: z.boolean(),
  warning: z.string().nullable().optional(),
  items: z.array(FoodItemSchema),
  totals: z.object({
    kcal: z.number().int(),
    protein_g: z.number(),
    carbs_g: z.number(),
    fat_g: z.number()
  }),
  confidence: z.number().min(0).max(1),
  reasoning: z.string()
});

export type FoodAnalysis = z.infer<typeof FoodAnalysisSchema>;

/** Compresses + base64-encodes a local image URI. */
async function prepareImage(uri: string): Promise<string> {
  const compressed = await ImageManipulator.manipulateAsync(
    uri,
    [{ resize: { width: 1024 } }],
    { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG, base64: true }
  );
  if (!compressed.base64) throw new Error('image_encode_failed');
  return compressed.base64;
}

/** Extracts JSON from an LLM response, tolerant to ```json fences. */
function extractJson(text: string): unknown {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  const candidate = (fenced?.[1] ?? text).trim();
  return JSON.parse(candidate);
}

export async function analyzeFoodPhoto(localUri: string): Promise<FoodAnalysis> {
  const [base64, prompt] = await Promise.all([
    prepareImage(localUri),
    getPrompt('foodAnalysis')
  ]);

  const resp = await callClaude({
    model: 'claude-sonnet-4-6',
    max_tokens: 1024,
    temperature: 0.2,
    system: prompt.system,
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'image',
            source: { type: 'base64', media_type: 'image/jpeg', data: base64 }
          },
          { type: 'text', text: prompt.userInstruction ?? 'Analyze this meal. JSON only.' }
        ]
      }
    ]
  });

  const text = extractText(resp);
  const parsed = FoodAnalysisSchema.parse(extractJson(text));

  // Sanity: macro/kcal reconciliation — penalize confidence on drift > 15%
  if (parsed.usable) {
    const computed = parsed.items.reduce(
      (a, i) => a + i.protein_g * 4 + i.carbs_g * 4 + i.fat_g * 9,
      0
    );
    const drift = Math.abs(computed - parsed.totals.kcal) / Math.max(parsed.totals.kcal, 1);
    if (drift > 0.15) parsed.confidence = parsed.confidence * 0.7;
  }
  return parsed;
}

export async function analyzeFoodVoice(transcript: string): Promise<FoodAnalysis> {
  const prompt = await getPrompt('voiceParse');

  const resp = await callClaude({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 768,
    temperature: 0.2,
    system: prompt.system,
    messages: [{ role: 'user', content: transcript }]
  });

  const text = extractText(resp);
  return FoodAnalysisSchema.parse(extractJson(text));
}
