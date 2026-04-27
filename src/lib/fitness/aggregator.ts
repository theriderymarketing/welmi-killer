import type { DailyEnergy, FitnessProvider, Workout } from './types';

/**
 * Combines DailyEnergy from multiple providers.
 * - workouts: dedupe via (type + start ±5min + duration ±60s)
 * - activeKcal: sum of dedupe winners
 * - steps: max() across sources (different sensors can disagree)
 * - restingKcal: max() (BMR-ish, monotonic)
 */
export function mergeDailyEnergy(days: DailyEnergy[]): DailyEnergy {
  if (days.length === 0) {
    return {
      date: new Date(new Date().setHours(0, 0, 0, 0)),
      activeKcal: 0,
      restingKcal: 0,
      steps: 0,
      workouts: [],
      source: 'strava' // arbitrary; nothing to display
    };
  }

  const allWorkouts = days.flatMap((d) => d.workouts);
  const dedupedWorkouts = dedupeWorkouts(allWorkouts);

  return {
    date: days[0].date,
    activeKcal: dedupedWorkouts.reduce((s, w) => s + w.kcal, 0),
    restingKcal: Math.max(...days.map((d) => d.restingKcal), 0),
    steps: Math.max(...days.map((d) => d.steps), 0),
    workouts: dedupedWorkouts,
    source: days[0].source
  };
}

function dedupeWorkouts(ws: Workout[]): Workout[] {
  const SOURCE_PRIORITY: Record<string, number> = {
    coros: 5,
    oura: 4,
    whoop: 4,
    strava: 3,
    polar: 2,
    withings: 1
  };

  const sorted = [...ws].sort((a, b) => {
    const p = (SOURCE_PRIORITY[b.source] ?? 0) - (SOURCE_PRIORITY[a.source] ?? 0);
    if (p !== 0) return p;
    return a.start.getTime() - b.start.getTime();
  });

  const kept: Workout[] = [];
  for (const w of sorted) {
    const dupe = kept.find(
      (k) =>
        k.type.toLowerCase() === w.type.toLowerCase() &&
        Math.abs(k.start.getTime() - w.start.getTime()) < 5 * 60_000 &&
        Math.abs(k.durationSec - w.durationSec) < 60
    );
    if (!dupe) kept.push(w);
  }
  return kept.sort((a, b) => b.start.getTime() - a.start.getTime());
}

export async function fetchAllConnected(providers: FitnessProvider[]): Promise<DailyEnergy[]> {
  const settled = await Promise.allSettled(
    providers.map(async (p) => {
      if (!(await p.isConnected())) return null;
      return p.fetchToday();
    })
  );
  return settled
    .filter((r): r is PromiseFulfilledResult<DailyEnergy | null> => r.status === 'fulfilled')
    .map((r) => r.value)
    .filter((d): d is DailyEnergy => d !== null);
}
