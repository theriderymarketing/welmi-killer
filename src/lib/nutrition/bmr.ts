export type Gender = 'male' | 'female' | 'other';

/**
 * Mifflin-St Jeor (1990) — gold standard for resting metabolic rate
 * in non-athletic adult populations. Returns kcal/day.
 */
export function bmrMifflin(p: {
  gender: Gender;
  weightKg: number;
  heightCm: number;
  ageYears: number;
}): number {
  const base = 10 * p.weightKg + 6.25 * p.heightCm - 5 * p.ageYears;
  const offset = p.gender === 'male' ? 5 : p.gender === 'female' ? -161 : -78;
  return Math.round(base + offset);
}

export function ageFromBirthdate(isoDate: string): number {
  const b = new Date(isoDate);
  const now = new Date();
  let age = now.getFullYear() - b.getFullYear();
  const m = now.getMonth() - b.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < b.getDate())) age -= 1;
  return age;
}
