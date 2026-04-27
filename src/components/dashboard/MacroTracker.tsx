import { View, Text, Pressable } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { router } from 'expo-router';
import { CalorieRing } from './CalorieRing';
import { MacroBar } from './MacroBar';
import { useToday } from '@/hooks/useToday';
import { useProfile } from '@/hooks/useProfile';
import { useFitnessAggregate } from '@/hooks/useFitnessAggregate';
import { adjustedTargetKcal } from '@/lib/nutrition/adjustedTargets';
import * as haptics from '@/lib/utils/haptics';

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
    <View className="px-5 pt-2">
      <View className="items-center">
        <CalorieRing size={260} strokeWidth={18} progress={progress} overage={overage > 0}>
          <Text className="text-5xl font-bold tracking-tight text-white tabular-nums">
            {Math.round(remaining)}
          </Text>
          <Text className="text-sm text-ink-500 mt-1">kcal left</Text>
          {overage > 0 ? (
            <Text className="text-xs text-accent-rose mt-1">+{Math.round(overage)} over</Text>
          ) : null}
        </CalorieRing>

        {activeKcal > 0 ? (
          <View className="mt-4 px-3 py-1.5 bg-ink-800 rounded-full flex-row items-center gap-2">
            <Text className="text-xs text-ink-300">
              🏃 +{Math.round(activeKcal)} kcal earned
            </Text>
          </View>
        ) : null}
      </View>

      <View className="mt-8 gap-4">
        <MacroBar label="Protein" consumed={consumed.proteinG} target={profile.targetProteinG} color="#34d399" />
        <MacroBar label="Carbs" consumed={consumed.carbsG} target={profile.targetCarbsG} color="#fbbf24" />
        <MacroBar label="Fat" consumed={consumed.fatG} target={profile.targetFatG} color="#f87171" />
      </View>

      <View className="flex-row gap-3 mt-8">
        <ActionButton icon="📷" label="Scan" onPress={() => router.push('/log/camera')} />
        <ActionButton icon="🎤" label="Voice" onPress={() => router.push('/log/voice')} />
        <ActionButton icon="✏️" label="Manual" onPress={() => router.push('/log/manual')} />
      </View>
    </View>
  );
}

function ActionButton({ icon, label, onPress }: { icon: string; label: string; onPress: () => void }) {
  const scale = useSharedValue(1);
  const style = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  return (
    <Animated.View style={[{ flex: 1 }, style]}>
      <Pressable
        onPressIn={() => {
          scale.value = withSpring(0.95);
          haptics.tap();
        }}
        onPressOut={() => {
          scale.value = withSpring(1);
        }}
        onPress={onPress}
        className="bg-ink-800 border border-ink-700 rounded-2xl py-4 items-center"
      >
        <Text className="text-2xl">{icon}</Text>
        <Text className="text-ink-300 text-xs mt-1 font-medium">{label}</Text>
      </Pressable>
    </Animated.View>
  );
}
