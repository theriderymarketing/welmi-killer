import { router } from 'expo-router';
import { Shell } from '@/components/onboarding/Shell';
import { Chips } from '@/components/onboarding/Chips';
import { useOnboarding } from '@/store/onboarding';
import type { Gender } from '@/lib/nutrition/bmr';

export default function GenderScreen() {
  const { gender, set } = useOnboarding();

  return (
    <Shell
      step={1}
      total={5}
      title="What's your sex at birth?"
      hint="Used only to compute your basal metabolic rate (Mifflin-St Jeor). Stored on-device."
      onCta={() => router.push('/(onboarding)/metrics')}
    >
      <Chips<Gender>
        value={gender}
        onChange={(v) => set({ gender: v })}
        options={[
          { value: 'male', label: 'Male' },
          { value: 'female', label: 'Female' },
          { value: 'other', label: 'Other / prefer not to say', sub: 'Uses an averaged formula' }
        ]}
      />
    </Shell>
  );
}
