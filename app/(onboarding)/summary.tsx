import { View } from 'react-native';
import { useState } from 'react';
import { router } from 'expo-router';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { Shell } from '@/components/onboarding/Shell';
import { CountUp } from '@/components/ui/CountUp';
import { T } from '@/components/ui/Text';
import { useOnboarding } from '@/store/onboarding';
import { useUserId } from '@/hooks/useProfile';
import { upsertProfileFromOnboarding } from '@/db/repos/profile';
import { bmrMifflin, ageFromBirthdate } from '@/lib/nutrition/bmr';
import { tdee, targetKcal, macroTargets } from '@/lib/nutrition/tdee';
import { colors, type, radius } from '@/theme';
import * as haptics from '@/lib/utils/haptics';

export default function SummaryScreen() {
  const { gender, birthdate, heightCm, weightKg, activity, goal, pace } = useOnboarding();
  const { data: userId } = useUserId();
  const [submitting, setSubmitting] = useState(false);

  const ageYears = ageFromBirthdate(birthdate);
  const bmr = bmrMifflin({ gender, weightKg, heightCm, ageYears });
  const tdeeKcal = tdee(bmr, activity);
  const target = targetKcal({ tdee: tdeeKcal, goal, paceKgPerWeek: pace });
  const macros = macroTargets({ targetKcal: target, weightKg, goal });

  const submit = async () => {
    if (!userId || submitting) return;
    setSubmitting(true);
    haptics.success();
    await upsertProfileFromOnboarding({
      userId,
      gender,
      birthdate,
      heightCm,
      weightKg,
      activityLevel: activity,
      goal,
      paceKgPerWeek: pace
    });
    router.replace('/(tabs)');
  };

  return (
    <Shell
      step={5}
      total={5}
      title="Here's your plan."
      hint="Computed on-device using Mifflin-St Jeor. Adjusts daily based on workouts."
      ctaLabel={submitting ? 'Saving…' : 'Start tracking'}
      ctaDisabled={submitting}
      onCta={submit}
    >
      {/* Hero target */}
      <Animated.View entering={FadeInDown.duration(700)}>
        <View
          style={{
            backgroundColor: colors.surface,
            borderColor: colors.border,
            borderWidth: 1,
            borderRadius: radius.lg,
            padding: 28,
            alignItems: 'center'
          }}
        >
          <T variant="label" color={colors.inkLow} uppercase>
            Daily target
          </T>
          <CountUp
            value={target}
            duration={1100}
            style={{
              fontFamily: type.displayXl.family,
              fontSize: 84,
              lineHeight: 88,
              letterSpacing: -3,
              color: colors.accent,
              marginTop: 4,
              width: 240,
              textAlign: 'center'
            }}
          />
          <T variant="bodySm" color={colors.inkMid} style={{ marginTop: -2 }}>
            kcal / day
          </T>
        </View>
      </Animated.View>

      {/* Sub-stats grid */}
      <Animated.View entering={FadeInDown.duration(700).delay(120)}>
        <View
          style={{
            flexDirection: 'row',
            marginTop: 14,
            gap: 10
          }}
        >
          <Card label="BMR" value={bmr} suffix="kcal" />
          <Card label="TDEE" value={tdeeKcal} suffix="kcal" />
        </View>
      </Animated.View>

      {/* Macros */}
      <Animated.View entering={FadeIn.duration(900).delay(280)}>
        <View
          style={{
            marginTop: 14,
            backgroundColor: colors.surface,
            borderColor: colors.border,
            borderWidth: 1,
            borderRadius: radius.lg,
            padding: 18,
            flexDirection: 'row',
            justifyContent: 'space-between'
          }}
        >
          <Macro label="Protein" value={macros.proteinG} color={colors.protein} />
          <Macro label="Carbs" value={macros.carbsG} color={colors.carbs} />
          <Macro label="Fat" value={macros.fatG} color={colors.fat} />
        </View>
      </Animated.View>
    </Shell>
  );
}

function Card({ label, value, suffix }: { label: string; value: number; suffix?: string }) {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.surface,
        borderColor: colors.border,
        borderWidth: 1,
        borderRadius: radius.md,
        padding: 16
      }}
    >
      <T variant="label" color={colors.inkLow} uppercase>
        {label}
      </T>
      <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 4, marginTop: 6 }}>
        <CountUp
          value={value}
          style={{
            fontFamily: type.numLg.family,
            fontSize: 26,
            lineHeight: 30,
            letterSpacing: -0.4,
            color: colors.inkHi,
            width: 70
          }}
        />
        {suffix ? (
          <T variant="bodySm" color={colors.inkLow}>
            {suffix}
          </T>
        ) : null}
      </View>
    </View>
  );
}

function Macro({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <View style={{ alignItems: 'center', flex: 1 }}>
      <View
        style={{
          width: 6,
          height: 6,
          borderRadius: 3,
          backgroundColor: color,
          marginBottom: 8
        }}
      />
      <T variant="numLg" color={colors.inkHi}>
        {value}g
      </T>
      <T variant="label" color={colors.inkLow} uppercase style={{ marginTop: 2 }}>
        {label}
      </T>
    </View>
  );
}
