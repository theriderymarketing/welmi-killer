import { View } from 'react-native';
import { router } from 'expo-router';
import { T } from '@/components/ui/Text';
import { PressScale } from '@/components/ui/Pressable';
import { useToday } from '@/hooks/useToday';
import { colors, radius, type } from '@/theme';

const SOURCE_LABEL: Record<string, string> = {
  photo: 'Scan',
  voice: 'Voice',
  manual: 'Manual',
  barcode: 'Barcode'
};

export function TodayMeals() {
  const { data: today } = useToday();
  if (!today) return null;

  const meals = today.meals;

  return (
    <View style={{ paddingHorizontal: 24, marginTop: 48 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 16 }}>
        <T variant="label" color={colors.inkLow} uppercase>
          Meals · {meals.length}
        </T>
        {meals.length > 0 ? (
          <T variant="label" color={colors.inkLow} uppercase>
            {Math.round(today.totals.kcal)} KCAL
          </T>
        ) : null}
      </View>

      {meals.length === 0 ? (
        <EmptyState />
      ) : (
        <View style={{ gap: 8 }}>
          {meals.map((m) => (
            <PressScale
              key={m.id}
              haptic="tap"
              onPress={() => router.push(`/meal/${m.id}`)}
              style={{
                backgroundColor: colors.surface,
                borderColor: colors.border,
                borderWidth: 1,
                borderRadius: radius.md,
                padding: 16,
                flexDirection: 'row',
                alignItems: 'center',
                gap: 12
              }}
            >
              <SourceBadge source={m.source} />
              <View style={{ flex: 1 }}>
                <T variant="bodyMd" color={colors.inkHi} numberOfLines={1}>
                  {SOURCE_LABEL[m.source] ?? m.source} meal
                </T>
                <T variant="bodySm" color={colors.inkLow} style={{ marginTop: 2 }}>
                  {new Date(m.consumedAt).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                  {m.aiConfidence != null
                    ? ` · ${Math.round(m.aiConfidence * 100)}% confidence`
                    : ''}
                </T>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <T
                  style={{
                    fontFamily: type.numLg.family,
                    fontSize: 18,
                    color: colors.inkHi,
                    letterSpacing: -0.3
                  }}
                >
                  {Math.round(m.totalKcal)}
                </T>
                <T variant="label" color={colors.inkLow} uppercase style={{ marginTop: 2 }}>
                  KCAL
                </T>
              </View>
            </PressScale>
          ))}
        </View>
      )}
    </View>
  );
}

function EmptyState() {
  return (
    <View
      style={{
        backgroundColor: colors.surface,
        borderColor: colors.border,
        borderWidth: 1,
        borderStyle: 'dashed',
        borderRadius: radius.md,
        padding: 24,
        alignItems: 'center'
      }}
    >
      <T
        style={{
          fontFamily: 'InstrumentSerif-Italic',
          fontSize: 28,
          letterSpacing: -0.5,
          color: colors.inkMid,
          textAlign: 'center'
        }}
      >
        Nothing logged yet.
      </T>
      <T variant="bodySm" color={colors.inkLow} align="center" style={{ marginTop: 8 }}>
        Snap your next meal to begin.
      </T>
    </View>
  );
}

function SourceBadge({ source }: { source: string }) {
  const map: Record<string, string> = {
    photo: '◐',
    voice: '◔',
    manual: '◍',
    barcode: '◓'
  };
  return (
    <View
      style={{
        width: 32,
        height: 32,
        borderRadius: 8,
        backgroundColor: colors.elevated,
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      <T variant="bodyMd" color={colors.accent}>
        {map[source] ?? '·'}
      </T>
    </View>
  );
}
