import { View } from 'react-native';
import { router } from 'expo-router';
import { Shell } from '@/components/onboarding/Shell';
import { Chips } from '@/components/onboarding/Chips';
import { NumberWheel } from '@/components/onboarding/NumberWheel';
import { T } from '@/components/ui/Text';
import { useOnboarding } from '@/store/onboarding';
import type { Goal } from '@/lib/nutrition/tdee';
import { colors } from '@/theme';

export default function GoalScreen() {
  const { goal, pace, set } = useOnboarding();
  const showPace = goal !== 'maintain';

  return (
    <Shell
      step={4}
      total={5}
      title="What are you optimizing for?"
      hint="Honest answer beats ambitious answer. You can re-tune any time."
      onCta={() => router.push('/(onboarding)/summary')}
    >
      <View style={{ gap: 24 }}>
        <Chips<Goal>
          value={goal}
          onChange={(v) => set({ goal: v })}
          options={[
            { value: 'lose', label: 'Lose fat', sub: 'Conservative deficit, protein-forward' },
            { value: 'maintain', label: 'Hold steady', sub: 'Eat at maintenance' },
            { value: 'gain', label: 'Build muscle', sub: 'Modest surplus, lean gain' }
          ]}
        />

        {showPace ? (
          <View style={{ marginTop: 8 }}>
            <T variant="label" color={colors.inkLow} uppercase>
              Pace · {goal === 'lose' ? 'fat loss' : 'lean gain'}
            </T>
            <View style={{ alignItems: 'center', marginTop: 4 }}>
              <NumberWheel
                min={1}
                max={10}
                step={1}
                value={Math.round(pace * 10)}
                onChange={(v) => set({ pace: v / 10 })}
                unit="kg / week"
                format={(n) => (n / 10).toFixed(1)}
              />
            </View>
            <T variant="bodySm" color={colors.inkLow} align="center" style={{ marginTop: 4 }}>
              {pace <= 0.4
                ? 'Gentle — sustainable, low diet fatigue.'
                : pace <= 0.7
                  ? 'Steady — the sweet spot.'
                  : 'Aggressive — short windows only.'}
            </T>
          </View>
        ) : null}
      </View>
    </Shell>
  );
}
