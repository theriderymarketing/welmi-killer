export type Activity = 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
export type Goal = 'lose' | 'maintain' | 'gain';

const ACTIVITY_FACTOR: Record<Activity, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  very_active: 1.9
};

export function tdee(bmr: number, activity: Activity): number {
  return Math.round(bmr * ACTIVITY_FACTOR[activity]);
}

/** 1 kg fat ≈ 7700 kcal. Caps deficit at floor 1200 kcal/day. */
export function targetKcal(opts: {
  tdee: number;
  goal: Goal;
  paceKgPerWeek: number;
}): number {
  const dailyDelta = (opts.paceKgPerWeek * 7700) / 7;
  if (opts.goal === 'lose') return Math.max(1200, Math.round(opts.tdee - dailyDelta));
  if (opts.goal === 'gain') return Math.round(opts.tdee + dailyDelta);
  return opts.tdee;
}

/**
 * Macro split — protein anchored to bodyweight, fat ≥ 0.8g/kg, carbs fill.
 * Goals shift protein density: cut > maintain > bulk.
 */
export function macroTargets(p: {
  targetKcal: number;
  weightKg: number;
  goal: Goal;
}): { proteinG: number; carbsG: number; fatG: number } {
  const proteinPerKg = p.goal === 'lose' ? 2.2 : p.goal === 'gain' ? 1.8 : 1.6;
  const proteinG = Math.round(p.weightKg * proteinPerKg);
  const fatG = Math.round(Math.max(p.weightKg * 0.8, (p.targetKcal * 0.25) / 9));
  const remaining = p.targetKcal - proteinG * 4 - fatG * 9;
  const carbsG = Math.max(0, Math.round(remaining / 4));
  return { proteinG, carbsG, fatG };
}
