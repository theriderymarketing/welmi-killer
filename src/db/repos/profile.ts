import { eq } from 'drizzle-orm';
import { db } from '../client';
import { profiles, type NewProfile, type Profile } from '../schema';
import { bmrMifflin, ageFromBirthdate, type Gender } from '@/lib/nutrition/bmr';
import { tdee, targetKcal, macroTargets, type Activity, type Goal } from '@/lib/nutrition/tdee';

export async function getProfile(userId: string): Promise<Profile | null> {
  const rows = await db.select().from(profiles).where(eq(profiles.id, userId));
  return rows[0] ?? null;
}

export async function upsertProfileFromOnboarding(input: {
  userId: string;
  gender: Gender;
  birthdate: string;
  heightCm: number;
  weightKg: number;
  activityLevel: Activity;
  goal: Goal;
  paceKgPerWeek: number;
}): Promise<Profile> {
  const ageYears = ageFromBirthdate(input.birthdate);
  const bmr = bmrMifflin({
    gender: input.gender,
    weightKg: input.weightKg,
    heightCm: input.heightCm,
    ageYears
  });
  const tdeeKcal = tdee(bmr, input.activityLevel);
  const target = targetKcal({ tdee: tdeeKcal, goal: input.goal, paceKgPerWeek: input.paceKgPerWeek });
  const macros = macroTargets({
    targetKcal: target,
    weightKg: input.weightKg,
    goal: input.goal
  });

  const now = new Date();
  const row: NewProfile = {
    id: input.userId,
    gender: input.gender,
    birthdate: input.birthdate,
    heightCm: input.heightCm,
    weightKg: input.weightKg,
    activityLevel: input.activityLevel,
    goal: input.goal,
    paceKgPerWeek: input.paceKgPerWeek,
    bmrKcal: bmr,
    tdeeKcal,
    targetKcal: target,
    targetProteinG: macros.proteinG,
    targetCarbsG: macros.carbsG,
    targetFatG: macros.fatG,
    adjustMode: 'balanced',
    units: 'metric',
    createdAt: now,
    updatedAt: now
  };

  const existing = await getProfile(input.userId);
  if (existing) {
    await db.update(profiles).set({ ...row, createdAt: existing.createdAt }).where(eq(profiles.id, input.userId));
  } else {
    await db.insert(profiles).values(row);
  }
  const saved = await getProfile(input.userId);
  if (!saved) throw new Error('profile_save_failed');
  return saved;
}
