import { View, ScrollView } from 'react-native';
import { useState } from 'react';
import Animated, { FadeInDown, FadeOut } from 'react-native-reanimated';
import { T } from '@/components/ui/Text';
import { PressScale } from '@/components/ui/Pressable';
import { CountUp } from '@/components/ui/CountUp';
import { colors, radius, type } from '@/theme';
import type { FoodAnalysis } from '@/lib/ai/foodAnalysis';

type Props = {
  result: FoodAnalysis;
  onConfirm: (items: FoodAnalysis['items']) => void;
  onCancel: () => void;
};

/**
 * Bottom sheet showing AI-detected items.
 * User can swipe-to-dismiss any item before saving.
 */
export function ConfirmSheet({ result, onConfirm, onCancel }: Props) {
  const [items, setItems] = useState(result.items);

  const totals = items.reduce(
    (acc, i) => ({
      kcal: acc.kcal + i.kcal,
      proteinG: acc.proteinG + i.protein_g,
      carbsG: acc.carbsG + i.carbs_g,
      fatG: acc.fatG + i.fat_g
    }),
    { kcal: 0, proteinG: 0, carbsG: 0, fatG: 0 }
  );

  const remove = (idx: number) => setItems((arr) => arr.filter((_, i) => i !== idx));

  return (
    <View
      style={{
        backgroundColor: colors.canvas,
        borderTopLeftRadius: radius.xl,
        borderTopRightRadius: radius.xl,
        padding: 24,
        maxHeight: '85%'
      }}
    >
      <View
        style={{
          width: 36,
          height: 4,
          borderRadius: 2,
          backgroundColor: colors.divider,
          alignSelf: 'center',
          marginBottom: 18
        }}
      />

      <T variant="label" color={colors.inkLow} uppercase>
        Detected · {Math.round(result.confidence * 100)}% confidence
      </T>
      <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 6, marginTop: 4 }}>
        <CountUp
          value={totals.kcal}
          style={{
            fontFamily: type.display.family,
            fontSize: 56,
            lineHeight: 60,
            letterSpacing: -2,
            color: colors.inkHi,
            width: 200
          }}
        />
        <T variant="bodyMd" color={colors.inkMid}>
          kcal
        </T>
      </View>
      <T variant="bodySm" color={colors.inkLow} style={{ marginTop: 2 }}>
        P {totals.proteinG.toFixed(1)} · C {totals.carbsG.toFixed(1)} · F {totals.fatG.toFixed(1)}
      </T>

      <ScrollView style={{ marginTop: 20, marginBottom: 20 }} showsVerticalScrollIndicator={false}>
        {items.map((it, idx) => (
          <Animated.View
            key={`${it.name}-${idx}`}
            entering={FadeInDown.duration(220).delay(idx * 60)}
            exiting={FadeOut.duration(180)}
          >
            <View
              style={{
                backgroundColor: colors.surface,
                borderColor: colors.border,
                borderWidth: 1,
                borderRadius: radius.md,
                padding: 14,
                marginBottom: 8,
                flexDirection: 'row',
                alignItems: 'center',
                gap: 12
              }}
            >
              <View style={{ flex: 1 }}>
                <T variant="bodyMd" color={colors.inkHi}>
                  {it.name}
                </T>
                <T variant="bodySm" color={colors.inkLow} style={{ marginTop: 2 }}>
                  {Math.round(it.quantity_g)}g · {Math.round(it.confidence * 100)}%
                </T>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <T variant="num" color={colors.inkHi}>
                  {it.kcal} kcal
                </T>
                <T variant="bodySm" color={colors.inkLow} style={{ marginTop: 2 }}>
                  {it.protein_g.toFixed(1)} · {it.carbs_g.toFixed(1)} · {it.fat_g.toFixed(1)}
                </T>
              </View>
              <PressScale haptic="tap" onPress={() => remove(idx)} style={{ paddingHorizontal: 4 }}>
                <T variant="bodyMd" color={colors.inkLow}>
                  ✕
                </T>
              </PressScale>
            </View>
          </Animated.View>
        ))}
      </ScrollView>

      <View style={{ flexDirection: 'row', gap: 10 }}>
        <PressScale
          haptic="tap"
          onPress={onCancel}
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
          <T variant="bodyMd" color={colors.inkMid}>
            Retake
          </T>
        </PressScale>
        <PressScale
          haptic="press"
          onPress={() => onConfirm(items)}
          style={{
            flex: 2,
            backgroundColor: colors.accent,
            borderRadius: radius.lg,
            paddingVertical: 16,
            alignItems: 'center'
          }}
        >
          <T variant="h3" color={colors.accentInk}>
            Log {Math.round(totals.kcal)} kcal
          </T>
        </PressScale>
      </View>
    </View>
  );
}
