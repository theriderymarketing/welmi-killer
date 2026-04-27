import { authorize, getValidToken, revoke, type OAuthConfig } from '../oauth';
import type { FitnessProvider, DailyEnergy, Workout } from '../types';

const CFG: OAuthConfig = {
  providerId: 'coros',
  authorizationEndpoint: 'https://open.coros.com/oauth2/authorize',
  tokenEndpoint: 'https://open.coros.com/oauth2/accesstoken',
  refreshEndpoint: 'https://open.coros.com/oauth2/refreshtoken',
  clientId: process.env.EXPO_PUBLIC_COROS_CLIENT_ID ?? '',
  clientSecret: process.env.COROS_CLIENT_SECRET,
  scopes: ['default'],
  usePKCE: false
};

type CorosActivity = {
  labelId: string;
  sportType: string;
  startTime: number; // epoch seconds
  totalTime: number; // seconds
  calories: number;
  avgHr?: number;
  deviceName?: string;
};

type CorosResponse = {
  data?: CorosActivity[];
  steps?: number;
  result?: string;
  message?: string;
};

const yyyymmdd = (d: Date) =>
  `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;

export const corosProvider: FitnessProvider = {
  id: 'coros',
  name: 'COROS',
  icon: '⌚',

  isConnected: async () => (await getValidToken(CFG)) !== null,

  connect: async () => {
    await authorize(CFG);
  },

  disconnect: async () => {
    await revoke('coros');
  },

  fetchToday: async (): Promise<DailyEnergy> => {
    const token = await getValidToken(CFG);
    if (!token) throw new Error('coros_not_connected');

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const day = yyyymmdd(todayStart);

    const r = await fetch(
      `https://open.coros.com/v2/coros/sport/list?startDate=${day}&endDate=${day}`,
      { headers: { Authorization: `Bearer ${token.accessToken}` } }
    );
    if (!r.ok) throw new Error(`coros_${r.status}`);
    const json = (await r.json()) as CorosResponse;

    const activities = json.data ?? [];
    const workouts: Workout[] = activities.map((a) => ({
      id: `coros_${a.labelId}`,
      type: a.sportType,
      start: new Date(a.startTime * 1000),
      durationSec: a.totalTime,
      kcal: a.calories,
      avgHr: a.avgHr ?? null,
      deviceName: a.deviceName ?? 'COROS',
      source: 'coros'
    }));

    return {
      date: todayStart,
      activeKcal: workouts.reduce((s, w) => s + w.kcal, 0),
      restingKcal: 0,
      steps: json.steps ?? 0,
      workouts,
      source: 'coros'
    };
  }
};
