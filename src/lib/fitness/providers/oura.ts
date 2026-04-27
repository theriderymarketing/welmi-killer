import { authorize, getValidToken, revoke, type OAuthConfig } from '../oauth';
import type { FitnessProvider, DailyEnergy, Workout } from '../types';

const CFG: OAuthConfig = {
  providerId: 'oura',
  authorizationEndpoint: 'https://cloud.ouraring.com/oauth/authorize',
  tokenEndpoint: 'https://api.ouraring.com/oauth/token',
  clientId: process.env.EXPO_PUBLIC_OURA_CLIENT_ID ?? '',
  clientSecret: process.env.OURA_CLIENT_SECRET,
  scopes: ['daily', 'heartrate', 'workout', 'session'],
  usePKCE: true
};

type OuraDailyActivity = {
  day: string;
  active_calories: number;
  total_calories: number;
  steps: number;
};

type OuraWorkout = {
  id: string;
  activity: string;
  start_datetime: string;
  end_datetime: string;
  calories: number;
  intensity: string;
};

const isoDate = (d: Date) => d.toISOString().slice(0, 10);

export const ouraProvider: FitnessProvider = {
  id: 'oura',
  name: 'Oura',
  icon: '💍',

  isConnected: async () => (await getValidToken(CFG)) !== null,
  connect: async () => {
    await authorize(CFG);
  },
  disconnect: async () => {
    await revoke('oura');
  },

  fetchToday: async (): Promise<DailyEnergy> => {
    const token = await getValidToken(CFG);
    if (!token) throw new Error('oura_not_connected');

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const day = isoDate(todayStart);

    const headers = { Authorization: `Bearer ${token.accessToken}` };
    const [activityR, workoutR] = await Promise.all([
      fetch(
        `https://api.ouraring.com/v2/usercollection/daily_activity?start_date=${day}&end_date=${day}`,
        { headers }
      ),
      fetch(`https://api.ouraring.com/v2/usercollection/workout?start_date=${day}&end_date=${day}`, {
        headers
      })
    ]);
    if (!activityR.ok) throw new Error(`oura_activity_${activityR.status}`);

    const activity = (await activityR.json()) as { data: OuraDailyActivity[] };
    const workoutsRaw = workoutR.ok
      ? ((await workoutR.json()) as { data: OuraWorkout[] })
      : { data: [] };

    const today = activity.data[0];
    const workouts: Workout[] = workoutsRaw.data.map((w) => ({
      id: `oura_${w.id}`,
      type: w.activity,
      start: new Date(w.start_datetime),
      durationSec: (new Date(w.end_datetime).getTime() - new Date(w.start_datetime).getTime()) / 1000,
      kcal: w.calories,
      avgHr: null,
      deviceName: 'Oura',
      source: 'oura'
    }));

    return {
      date: todayStart,
      activeKcal: today?.active_calories ?? 0,
      restingKcal: today ? today.total_calories - today.active_calories : 0,
      steps: today?.steps ?? 0,
      workouts,
      source: 'oura'
    };
  }
};
