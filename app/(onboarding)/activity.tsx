import { router } from 'expo-router';
import { Shell } from '@/components/onboarding/Shell';
import { Chips } from '@/components/onboarding/Chips';
import { useOnboarding } from '@/store/onboarding';
import type { Activity } from '@/lib/nutrition/tdee';

export default function ActivityScreen() {
  const { activity, set } = useOnboarding();

  return (
    <Shell
      step={3}
      total={5}
      title="How active is a typical week?"
      hint="Movement outside of structured workouts — your job, your commute, your stairs."
      onCta={() => router.push('/(onboarding)/goal')}
    >
      <Chips<Activity>
        value={activity}
        onChange={(v) => set({ activity: v })}
        options={[
          { value: 'sedentary', label: 'Sedentary', sub: 'Desk-bound, little walking' },
          { value: 'light', label: 'Light', sub: '1–2 sessions / week, some walking' },
          { value: 'moderate', label: 'Moderate', sub: '3–4 sessions / week' },
          { value: 'active', label: 'Active', sub: '5–6 sessions / week, on your feet' },
          { value: 'very_active', label: 'Very active', sub: 'Daily training or physical job' }
        ]}
      />
    </Shell>
  );
}
