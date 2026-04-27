import { View } from 'react-native';
import { useState } from 'react';
import { router } from 'expo-router';
import { Shell } from '@/components/onboarding/Shell';
import { NumberWheel } from '@/components/onboarding/NumberWheel';
import { T } from '@/components/ui/Text';
import { useOnboarding } from '@/store/onboarding';
import { colors } from '@/theme';
import { ageFromBirthdate } from '@/lib/nutrition/bmr';

const PAGES = ['age', 'height', 'weight'] as const;
type Page = (typeof PAGES)[number];

export default function MetricsScreen() {
  const [page, setPage] = useState<Page>('age');
  const { birthdate, heightCm, weightKg, set } = useOnboarding();
  const idx = PAGES.indexOf(page);

  const age = ageFromBirthdate(birthdate);

  const next = () => {
    if (page === 'age') setPage('height');
    else if (page === 'height') setPage('weight');
    else router.push('/(onboarding)/activity');
  };
  const back = () => {
    if (page === 'age') router.back();
    else if (page === 'height') setPage('age');
    else setPage('height');
  };

  const titles: Record<Page, string> = {
    age: 'How old are you?',
    height: 'How tall are you?',
    weight: 'What do you weigh today?'
  };
  const hints: Record<Page, string> = {
    age: 'Used to estimate your resting metabolism. Whole years.',
    height: "We'll use centimeters. You can switch units later.",
    weight: "Honest weight, even if you don't love the number — accuracy beats vanity."
  };

  return (
    <Shell
      step={2 + idx * 0.33}
      total={5}
      title={titles[page]}
      hint={hints[page]}
      onCta={next}
      onBack={back}
    >
      <View style={{ flex: 1, justifyContent: 'center' }}>
        {page === 'age' ? (
          <NumberWheel
            min={14}
            max={90}
            value={age}
            onChange={(v) => {
              const year = new Date().getFullYear() - v;
              set({ birthdate: `${year}-06-15` });
            }}
            unit="years"
          />
        ) : page === 'height' ? (
          <NumberWheel
            min={130}
            max={220}
            value={heightCm}
            onChange={(v) => set({ heightCm: v })}
            unit="cm"
          />
        ) : (
          <NumberWheel
            min={35}
            max={200}
            step={1}
            value={Math.round(weightKg)}
            onChange={(v) => set({ weightKg: v })}
            unit="kg"
          />
        )}
      </View>

      <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 6, marginBottom: 16 }}>
        {PAGES.map((p) => (
          <View
            key={p}
            style={{
              width: p === page ? 24 : 6,
              height: 6,
              borderRadius: 3,
              backgroundColor: p === page ? colors.accent : colors.divider
            }}
          />
        ))}
      </View>
    </Shell>
  );
}
