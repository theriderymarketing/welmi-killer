export type AdjustMode = 'strict' | 'balanced' | 'athlete';

/**
 * Decides how much exercise calories to give back as eating budget.
 * - strict   : ignore (cut discipline)
 * - balanced : 50% credit (default — accounts for BMR overlap with active kcal)
 * - athlete  : 100% credit (high training volume)
 */
export function adjustedTargetKcal(opts: {
  baseTargetKcal: number;
  activeKcalToday: number;
  mode: AdjustMode;
}): number {
  const factor = opts.mode === 'strict' ? 0 : opts.mode === 'athlete' ? 1 : 0.5;
  return Math.round(opts.baseTargetKcal + opts.activeKcalToday * factor);
}
