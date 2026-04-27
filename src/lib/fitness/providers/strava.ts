import { authorize, getValidToken, revoke, type OAuthConfig } from '../oauth';
import type { FitnessProvider, DailyEnergy, Workout } from '../types';

const CFG: OAuthConfig = {
  providerId: 'strava',
  authorizationEndpoint: 'https://www.strava.com/oauth/authorize',
  tokenEndpoint: 'https://www.strava.com/oauth/token',
  clientId: process.env.EXPO_PUBLIC_STRAVA_CLIENT_ID ?? '',
  clientSecret: process.env.STRAVA_CLIENT_SECRET,
  scopes: ['read', 'activity:read_all', 'profile:read_all'],
  usePKCE: false, // Strava does not support PKCE
  extraAuthParams: { approval_prompt: 'auto' }
};

type StravaActivity = {
  id: number;
  type: string;
  start_date: string;
  moving_time: number;
  calories?: number;
  average_heartrate?: number;
  device_name?: string;
};

export const stravaProvider: FitnessProvider = {
  id: 'strava',
  name: 'Strava',
  icon: '🏃',

  isConnected: async () => (await getValidToken(CFG)) !== null,

  connect: async () => {
    await authorize(CFG);
  },

  disconnect: async () => {
    await revoke('strava');
  },

  fetchToday: async (): Promise<DailyEnergy> => {
    const token = await getValidToken(CFG);
    if (!token) throw new Error('strava_not_connected');

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const after = Math.floor(todayStart.getTime() / 1000);

    const r = await fetch(
      `https://www.strava.com/api/v3/athlete/activities?after=${after}&per_page=30`,
      { headers: { Authorization: `Bearer ${token.accessToken}` } }
    );
    if (!r.ok) throw new Error(`strava_${r.status}`);
    const activities = (await r.json()) as StravaActivity[];

    const workouts: Workout[] = activities.map((a) => ({
      id: `strava_${a.id}`,
      type: a.type,
      start: new Date(a.start_date),
      durationSec: a.moving_time,
      kcal: a.calories ?? 0,
      avgHr: a.average_heartrate ? Math.round(a.average_heartrate) : null,
      deviceName: a.device_name ?? null,
      source: 'strava'
    }));

    return {
      date: todayStart,
      activeKcal: workouts.reduce((s, w) => s + w.kcal, 0),
      restingKcal: 0,
      steps: 0,
      workouts,
      source: 'strava'
    };
  }
};
