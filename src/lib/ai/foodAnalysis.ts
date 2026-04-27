import * as ImageManipulator from 'expo-image-manipulator';
import { z } from 'zod';
import { chat, vision } from './claudeProxy';
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

/** Compresses an image (max 1024px wide, JPEG q=0.7) before upload. */
async function compressImage(uri: string): Promise<string> {
  const out = await ImageManipulator.manipulateAsync(
    uri,
    [{ resize: { width: 1024 } }],
    { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
  );
  return out.uri;
}

/** Tolerant JSON extraction (handles ```json fences and surrounding prose). */
function extractJson(text: string): unknown {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  let candidate = (fenced?.[1] ?? text).trim();
  // Trim anything before first `{` and after last `}`
  const first = candidate.indexOf('{');
  const last = candidate.lastIndexOf('}');
  if (first >= 0 && last > first) candidate = candidate.slice(first, last + 1);
  return JSON.parse(candidate);
}

function reconcileConfidence(parsed: FoodAnalysis): FoodAnalysis {
  if (!parsed.usable) return parsed;
  const computed = parsed.items.reduce(
    (a, i) => a + i.protein_g * 4 + i.carbs_g * 4 + i.fat_g * 9,
    0
  );
  const drift = Math.abs(computed - parsed.totals.kcal) / Math.max(parsed.totals.kcal, 1);
  if (drift > 0.15) parsed.confidence = parsed.confidence * 0.7;
  return parsed;
}

export async function analyzeFoodPhoto(localUri: string): Promise<FoodAnalysis> {
  const [compressed, prompt] = await Promise.all([compressImage(localUri), getPrompt('foodAnalysis')]);

  // /v1/vision endpoint does NOT accept `system` separately —
  // we fold the system instructions into the prompt body.
  const fullPrompt = `${prompt.system}\n\n---\n\n${prompt.userInstruction ?? 'Analyze this meal. JSON only.'}`;

  const text = await vision({ imageUri: compressed, prompt: fullPrompt });
  return reconcileConfidence(FoodAnalysisSchema.parse(extractJson(text)));
}

export async function analyzeFoodVoice(transcript: string): Promise<FoodAnalysis> {
  const prompt = await getPrompt('voiceParse');
  const text = await chat(transcript, prompt.system);
  return reconcileConfidence(FoodAnalysisSchema.parse(extractJson(text)));
}
