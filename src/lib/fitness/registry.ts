import type { FitnessProvider } from './types';
import { stravaProvider } from './providers/strava';
import { corosProvider } from './providers/coros';
import { ouraProvider } from './providers/oura';

/**
 * Provider registry. Add new providers here as they get implemented.
 * Strava is listed first because it transparently captures Garmin and
 * Apple Watch via user-side sync (Garmin Connect → Strava, app like RunGap).
 */
export const PROVIDERS: FitnessProvider[] = [stravaProvider, corosProvider, ouraProvider];
