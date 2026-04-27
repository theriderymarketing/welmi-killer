import { and, eq, gte, lte, desc } from 'drizzle-orm';
import { db } from '../client';
import { meals, mealItems, type NewMeal, type NewMealItem } from '../schema';
import { randomUUID } from 'expo-crypto';

export async function insertMealWithItems(opts: {
  userId: string;
  consumedAt: Date;
  source: 'photo' | 'voice' | 'manual' | 'barcode';
  photoLocalPath?: string;
  rawInput?: string;
  aiConfidence?: number;
  items: Array<{
    name: string;
    quantityG: number;
    kcal: number;
    proteinG: number;
    carbsG: number;
    fatG: number;
    confidence?: number;
  }>;
}): Promise<string> {
  const mealId = randomUUID();

  const totals = opts.items.reduce(
    (acc, i) => ({
      kcal: acc.kcal + i.kcal,
      proteinG: acc.proteinG + i.proteinG,
      carbsG: acc.carbsG + i.carbsG,
      fatG: acc.fatG + i.fatG
    }),
    { kcal: 0, proteinG: 0, carbsG: 0, fatG: 0 }
  );

  const newMeal: NewMeal = {
    id: mealId,
    userId: opts.userId,
    consumedAt: opts.consumedAt,
    source: opts.source,
    photoLocalPath: opts.photoLocalPath ?? null,
    rawInput: opts.rawInput ?? null,
    aiConfidence: opts.aiConfidence ?? null,
    totalKcal: totals.kcal,
    totalProteinG: totals.proteinG,
    totalCarbsG: totals.carbsG,
    totalFatG: totals.fatG,
    notes: null
  };

  const newItems: NewMealItem[] = opts.items.map((it, idx) => ({
    id: randomUUID(),
    mealId,
    name: it.name,
    quantityG: it.quantityG,
    kcal: it.kcal,
    proteinG: it.proteinG,
    carbsG: it.carbsG,
    fatG: it.fatG,
    confidence: it.confidence ?? null,
    position: idx
  }));

  await db.transaction(async (tx) => {
    await tx.insert(meals).values(newMeal);
    if (newItems.length > 0) await tx.insert(mealItems).values(newItems);
  });
  return mealId;
}

export async function getMealsForDay(userId: string, day: Date) {
  const start = new Date(day);
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(end.getDate() + 1);

  return db
    .select()
    .from(meals)
    .where(
      and(
        eq(meals.userId, userId),
        gte(meals.consumedAt, start),
        lte(meals.consumedAt, end)
      )
    )
    .orderBy(desc(meals.consumedAt));
}

export async function getDailyTotals(userId: string, day: Date) {
  const rows = await getMealsForDay(userId, day);
  return rows.reduce(
    (acc, m) => ({
      kcal: acc.kcal + m.totalKcal,
      proteinG: acc.proteinG + m.totalProteinG,
      carbsG: acc.carbsG + m.totalCarbsG,
      fatG: acc.fatG + m.totalFatG,
      mealCount: acc.mealCount + 1
    }),
    { kcal: 0, proteinG: 0, carbsG: 0, fatG: 0, mealCount: 0 }
  );
}

export async function deleteMeal(mealId: string): Promise<void> {
  await db.delete(meals).where(eq(meals.id, mealId));
}
