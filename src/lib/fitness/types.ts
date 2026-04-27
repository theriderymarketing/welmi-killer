export type WorkoutSourceTag = 'strava' | 'coros' | 'oura' | 'whoop' | 'withings' | 'polar';

export type Workout = {
  id: string;
  type: string;             // run, ride, swim, strength, walk...
  start: Date;
  durationSec: number;
  kcal: number;
  avgHr: number | null;
  deviceName: string | null; // "Apple Watch", "Garmin Forerunner 955", "COROS Pace 3"...
  source: WorkoutSourceTag;
};

export type DailyEnergy = {
  date: Date;                // start of day, local
  activeKcal: number;        // sum of workout kcal
  restingKcal: number;       // BMR estimated/measured
  steps: number;
  workouts: Workout[];
  source: WorkoutSourceTag;
};

export type FitnessProvider = {
  id: WorkoutSourceTag;
  name: string;
  icon: string;
  isConnected: () => Promise<boolean>;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  fetchToday: () => Promise<DailyEnergy>;
};
