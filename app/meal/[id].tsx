import { View, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { eq } from 'drizzle-orm';
import { db } from '@/db/client';
import { meals, mealItems } from '@/db/schema';
import { deleteMeal } from '@/db/repos/meals';
import { T } from '@/components/ui/Text';
import { PressScale } from '@/components/ui/Pressable';
import { colors, radius, type } from '@/theme';

export default function MealDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const qc = useQueryClient();

  const { data } = useQuery({
    queryKey: ['meal', id],
    enabled: !!id,
    queryFn: async () => {
      const meal = (await db.select().from(meals).where(eq(meals.id, id!)))[0];
      const items = await db.select().from(mealItems).where(eq(mealItems.mealId, id!));
      return { meal, items };
    }
  });

  const remove = useMutation({
    mutationFn: () => deleteMeal(id!),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['today'] });
      router.back();
    }
  });

  if (!data?.meal) return null;
  const m = data.meal;

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: colors.canvas }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 60 }}>
        <View style={{ paddingHorizontal: 24 }}>
          <Pressable onPress={() => router.back()} hitSlop={16} style={{ paddingVertical: 12 }}>
            <T variant="bodyMd" color={colors.inkMid}>
              ‹ Back
            </T>
          </Pressable>

          <T variant="label" color={colors.inkLow} uppercase>
            {m.source} meal · {new Date(m.consumedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </T>
          <T
            style={{
              fontFamily: type.display.family,
              fontSize: 72,
              lineHeight: 76,
              letterSpacing: -2.5,
              color: colors.inkHi,
              marginTop: 4
            }}
          >
            {Math.round(m.totalKcal)}
          </T>
          <T variant="bodyMd" color={colors.inkMid}>
            kcal total
          </T>

          {/* Macros */}
          <View
            style={{
              flexDirection: 'row',
              marginTop: 24,
              backgroundColor: colors.surface,
              borderColor: colors.border,
              borderWidth: 1,
              borderRadius: radius.lg,
              padding: 18,
              justifyContent: 'space-between'
            }}
          >
            <Macro label="Protein" value={m.totalProteinG} color={colors.protein} />
            <Macro label="Carbs" value={m.totalCarbsG} color={colors.carbs} />
            <Macro label="Fat" value={m.totalFatG} color={colors.fat} />
          </View>

          {/* Items */}
          <T variant="label" color={colors.inkLow} uppercase style={{ marginTop: 32, marginBottom: 12 }}>
            Items · {data.items.length}
          </T>
          <View style={{ gap: 8 }}>
            {data.items.map((it) => (
              <View
                key={it.id}
                style={{
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                  borderWidth: 1,
                  borderRadius: radius.md,
                  padding: 14
                }}
              >
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'baseline'
                  }}
                >
                  <T variant="bodyMd" color={colors.inkHi} style={{ flex: 1 }}>
                    {it.name}
                  </T>
                  <T variant="num" color={colors.inkHi}>
                    {Math.round(it.kcal)} kcal
                  </T>
                </View>
                <View style={{ flexDirection: 'row', gap: 12, marginTop: 6 }}>
                  <T variant="bodySm" color={colors.inkLow}>
                    {Math.round(it.quantityG)}g
                  </T>
                  <T variant="bodySm" color={colors.protein}>
                    P {it.proteinG.toFixed(1)}
                  </T>
                  <T variant="bodySm" color={colors.carbs}>
                    C {it.carbsG.toFixed(1)}
                  </T>
                  <T variant="bodySm" color={colors.fat}>
                    F {it.fatG.toFixed(1)}
                  </T>
                </View>
              </View>
            ))}
          </View>

          {m.aiConfidence != null ? (
            <T variant="bodySm" color={colors.inkLow} style={{ marginTop: 16, textAlign: 'center' }}>
              AI confidence · {Math.round(m.aiConfidence * 100)}%
            </T>
          ) : null}

          <PressScale
            haptic="press"
            onPress={() => remove.mutate()}
            style={{
              marginTop: 32,
              backgroundColor: colors.surface,
              borderColor: colors.danger,
              borderWidth: 1,
              borderRadius: radius.lg,
              paddingVertical: 14,
              alignItems: 'center'
            }}
          >
            <T variant="bodyMd" color={colors.danger}>
              {remove.isPending ? 'Removing…' : 'Remove this meal'}
            </T>
          </PressScale>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function Macro({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <View style={{ alignItems: 'center', flex: 1 }}>
      <View
        style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: color, marginBottom: 8 }}
      />
      <T variant="numLg" color={colors.inkHi}>
        {value.toFixed(1)}g
      </T>
      <T variant="label" color={colors.inkLow} uppercase style={{ marginTop: 2 }}>
        {label}
      </T>
    </View>
  );
}
