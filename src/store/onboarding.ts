import { create } from 'zustand';
import type { Gender } from '@/lib/nutrition/bmr';
import type { Activity, Goal } from '@/lib/nutrition/tdee';

type State = {
  gender: Gender;
  birthdate: string;
  heightCm: number;
  weightKg: number;
  activity: Activity;
  goal: Goal;
  pace: number;
  set: (patch: Partial<Omit<State, 'set' | 'reset'>>) => void;
  reset: () => void;
};

const DEFAULT = {
  gender: 'male' as Gender,
  birthdate: '1990-01-01',
  heightCm: 178,
  weightKg: 75,
  activity: 'moderate' as Activity,
  goal: 'maintain' as Goal,
  pace: 0.5
};

export const useOnboarding = create<State>((set) => ({
  ...DEFAULT,
  set: (patch) => set(patch),
  reset: () => set(DEFAULT)
}));
