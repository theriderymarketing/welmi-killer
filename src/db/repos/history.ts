import { and, eq, gte, lt } from 'drizzle-orm';
import { db } from '../client';
import { meals } from '../schema';

export type DayTotal = {
  date: Date;
  kcal: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  mealCount: number;
};

/** Returns the last `days` days, oldest first, with totals. */
export async function getDailyHistory(userId: string, days: number): Promise<DayTotal[]> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const startBoundary = new Date(today);
  startBoundary.setDate(startBoundary.getDate() - (days - 1));

  const endBoundary = new Date(today);
  endBoundary.setDate(endBoundary.getDate() + 1);

  const rows = await db
    .select()
    .from(meals)
    .where(
      and(
        eq(meals.userId, userId),
        gte(meals.consumedAt, startBoundary),
        lt(meals.consumedAt, endBoundary)
      )
    );

  // Bucket by day
  const buckets = new Map<string, DayTotal>();
  for (let i = 0; i < days; i++) {
    const d = new Date(startBoundary);
    d.setDate(d.getDate() + i);
    const key = d.toISOString().slice(0, 10);
    buckets.set(key, {
      date: d,
      kcal: 0,
      proteinG: 0,
      carbsG: 0,
      fatG: 0,
      mealCount: 0
    });
  }

  for (const r of rows) {
    const key = r.consumedAt.toISOString().slice(0, 10);
    const b = buckets.get(key);
    if (!b) continue;
    b.kcal += r.totalKcal;
    b.proteinG += r.totalProteinG;
    b.carbsG += r.totalCarbsG;
    b.fatG += r.totalFatG;
    b.mealCount += 1;
  }

  return Array.from(buckets.values()).sort((a, b) => a.date.getTime() - b.date.getTime());
}
