import { View } from 'react-native';
import { router } from 'expo-router';
import { CalorieRing } from './CalorieRing';
import { MacroBar } from './MacroBar';
import { CountUp } from '@/components/ui/CountUp';
import { T } from '@/components/ui/Text';
import { PressScale } from '@/components/ui/Pressable';
import { useToday } from '@/hooks/useToday';
import { useProfile } from '@/hooks/useProfile';
import { useFitnessAggregate } from '@/hooks/useFitnessAggregate';
import { adjustedTargetKcal } from '@/lib/nutrition/adjustedTargets';
import { colors, type, radius } from '@/theme';

export function MacroTracker() {
  const { data: profile } = useProfile();
  const { data: today } = useToday();
  const { data: fitness } = useFitnessAggregate();

  if (!profile || !today) return null;

  const activeKcal = fitness?.activeKcal ?? 0;
  const adjustedTarget = adjustedTargetKcal({
    baseTargetKcal: profile.targetKcal,
    activeKcalToday: activeKcal,
    mode: profile.adjustMode as 'strict' | 'balanced' | 'athlete'
  });

  const consumed = today.totals;
  const remaining = Math.max(0, adjustedTarget - consumed.kcal);
  const overage = Math.max(0, consumed.kcal - adjustedTarget);
  const progress = consumed.kcal / Math.max(adjustedTarget, 1);

  return (
    <View style={{ paddingHorizontal: 24 }}>
      {/* Hero ring */}
      <View style={{ alignItems: 'center', marginTop: 8 }}>
        <CalorieRing size={300} strokeWidth={14} progress={progress} overage={overage > 0}>
          <View style={{ alignItems: 'center', marginTop: -4 }}>
            <CountUp
              value={overage > 0 ? overage : remaining}
              style={{
                fontFamily: type.displayXl.family,
                fontSize: 96,
                lineHeight: 100,
                letterSpacing: -3,
                color: overage > 0 ? colors.danger : colors.inkHi,
                textAlign: 'center',
                width: 220
              }}
            />
            <T variant="label" color={colors.inkLow} uppercase style={{ marginTop: 4 }}>
              {overage > 0 ? 'KCAL OVER' : 'KCAL LEFT'}
            </T>
          </View>
        </CalorieRing>

        {/* Sub-stats row */}
        <View
          style={{
            flexDirection: 'row',
            marginTop: 24,
            paddingHorizontal: 4,
            justifyContent: 'space-between',
            width: '100%'
          }}
        >
          <Stat label="Eaten" value={Math.round(consumed.kcal)} />
          <Divider />
          <Stat label="Burned" value={Math.round(activeKcal)} accent={activeKcal > 0} />
          <Divider />
          <Stat label="Goal" value={adjustedTarget} />
        </View>
      </View>

      {/* Macros */}
      <View style={{ marginTop: 40, gap: 18 }}>
        <MacroBar
          label="Protein"
          consumed={consumed.proteinG}
          target={profile.targetProteinG}
          color={colors.protein}
        />
        <MacroBar
          label="Carbs"
          consumed={consumed.carbsG}
          target={profile.targetCarbsG}
          color={colors.carbs}
        />
        <MacroBar
          label="Fat"
          consumed={consumed.fatG}
          target={profile.targetFatG}
          color={colors.fat}
        />
      </View>

      {/* Actions — single hero CTA + 2 secondary */}
      <View style={{ marginTop: 36 }}>
        <PressScale
          haptic="press"
          onPress={() => router.push('/log/camera')}
          style={{
            backgroundColor: colors.accent,
            borderRadius: radius.lg,
            paddingVertical: 18,
            alignItems: 'center'
          }}
        >
          <T variant="h3" color={colors.accentInk}>
            Scan a meal
          </T>
        </PressScale>

        <View style={{ flexDirection: 'row', gap: 10, marginTop: 10 }}>
          <SecondaryAction label="Voice" onPress={() => router.push('/log/voice')} />
          <SecondaryAction label="Manual" onPress={() => router.push('/log/manual')} />
        </View>
      </View>
    </View>
  );
}

function Stat({ label, value, accent = false }: { label: string; value: number; accent?: boolean }) {
  return (
    <View style={{ alignItems: 'center', flex: 1 }}>
      <CountUp
        value={value}
        style={{
          fontFamily: type.numLg.family,
          fontSize: type.numLg.size,
          lineHeight: type.numLg.lineHeight,
          letterSpacing: type.numLg.letter,
          color: accent ? colors.accent : colors.inkHi,
          textAlign: 'center',
          width: 80
        }}
      />
      <T variant="label" color={colors.inkLow} uppercase style={{ marginTop: 4 }}>
        {label}
      </T>
    </View>
  );
}

function Divider() {
  return <View style={{ width: 1, backgroundColor: colors.divider, marginVertical: 4 }} />;
}

function SecondaryAction({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <PressScale
      haptic="tap"
      onPress={onPress}
      style={{
        flex: 1,
        backgroundColor: colors.surface,
        borderColor: colors.border,
        borderWidth: 1,
        borderRadius: radius.lg,
        paddingVertical: 16,
        alignItems: 'center'
      }}
    >
      <T variant="bodyMd" color={colors.inkHi}>
        {label}
      </T>
    </PressScale>
  );
}
