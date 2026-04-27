import { View, ScrollView, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { T } from '@/components/ui/Text';
import { WeekChart } from '@/components/stats/WeekChart';
import { useDailyHistory } from '@/hooks/useHistory';
import { useProfile } from '@/hooks/useProfile';
import { colors, radius, type } from '@/theme';

export default function StatsScreen() {
  const { data: history } = useDailyHistory(7);
  const { data: profile } = useProfile();

  const screenW = Dimensions.get('window').width;
  const chartW = screenW - 48 - 32;

  // Compute weekly summary
  const summary = (history ?? []).reduce(
    (acc, d) => ({
      kcal: acc.kcal + d.kcal,
      proteinG: acc.proteinG + d.proteinG,
      carbsG: acc.carbsG + d.carbsG,
      fatG: acc.fatG + d.fatG,
      logged: acc.logged + (d.mealCount > 0 ? 1 : 0)
    }),
    { kcal: 0, proteinG: 0, carbsG: 0, fatG: 0, logged: 0 }
  );
  const dayCount = history?.length ?? 7;
  const avgKcal = summary.logged > 0 ? Math.round(summary.kcal / summary.logged) : 0;

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: colors.canvas }}>
      <ScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 16, paddingBottom: 60 }}>
        <T variant="label" color={colors.inkLow} uppercase>
          History
        </T>
        <T
          style={{
            fontFamily: type.display.family,
            fontSize: 56,
            lineHeight: 60,
            letterSpacing: -2,
            color: colors.inkHi,
            marginTop: 4
          }}
        >
          Last 7 days.
        </T>

        {/* Chart card */}
        <View
          style={{
            marginTop: 24,
            backgroundColor: colors.surface,
            borderColor: colors.border,
            borderWidth: 1,
            borderRadius: radius.lg,
            padding: 16
          }}
        >
          <T variant="label" color={colors.inkLow} uppercase>
            Daily kcal
          </T>
          {history && profile ? (
            <View style={{ marginTop: 8 }}>
              <WeekChart days={history} targetKcal={profile.targetKcal} width={chartW} />
            </View>
          ) : null}
        </View>

        {/* Summary cards */}
        <View style={{ flexDirection: 'row', gap: 10, marginTop: 12 }}>
          <SummaryCard
            label="Days logged"
            value={`${summary.logged}/${dayCount}`}
          />
          <SummaryCard
            label="Avg / day"
            value={avgKcal > 0 ? `${avgKcal} kcal` : '—'}
          />
        </View>

        {/* Macros breakdown card */}
        <View
          style={{
            marginTop: 12,
            backgroundColor: colors.surface,
            borderColor: colors.border,
            borderWidth: 1,
            borderRadius: radius.lg,
            padding: 18
          }}
        >
          <T variant="label" color={colors.inkLow} uppercase>
            Week totals
          </T>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              marginTop: 14
            }}
          >
            <Macro label="Protein" value={summary.proteinG} color={colors.protein} />
            <Macro label="Carbs" value={summary.carbsG} color={colors.carbs} />
            <Macro label="Fat" value={summary.fatG} color={colors.fat} />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function SummaryCard({ label, value }: { label: string; value: string }) {
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
      <T variant="numLg" color={colors.inkHi} style={{ marginTop: 6 }}>
        {value}
      </T>
    </View>
  );
}

function Macro({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <View style={{ alignItems: 'center', flex: 1 }}>
      <View
        style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: color, marginBottom: 8 }}
      />
      <T variant="numLg" color={colors.inkHi}>
        {Math.round(value)}g
      </T>
      <T variant="label" color={colors.inkLow} uppercase style={{ marginTop: 2 }}>
        {label}
      </T>
    </View>
  );
}
