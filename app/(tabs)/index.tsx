import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeIn } from 'react-native-reanimated';
import { MacroTracker } from '@/components/dashboard/MacroTracker';
import { TodayMeals } from '@/components/dashboard/TodayMeals';
import { T } from '@/components/ui/Text';
import { colors } from '@/theme';

export default function TodayScreen() {
  const today = new Date();
  const dayName = today
    .toLocaleDateString('en-US', { weekday: 'long' })
    .toUpperCase();
  const dateStr = today.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  });

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: colors.canvas }}>
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 60 }}
      >
        {/* Editorial header */}
        <Animated.View
          entering={FadeIn.duration(500)}
          style={{ paddingHorizontal: 24, paddingTop: 16, paddingBottom: 8 }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 12 }}>
            <T variant="label" color={colors.inkLow} uppercase>
              {dayName}
            </T>
            <View style={{ width: 1, height: 12, backgroundColor: colors.divider }} />
            <T variant="label" color={colors.inkLow} uppercase>
              {dateStr}
            </T>
          </View>
          <T variant="h1" color={colors.inkHi} style={{ marginTop: 4 }}>
            Today
          </T>
        </Animated.View>

        <MacroTracker />
        <TodayMeals />
      </ScrollView>
    </SafeAreaView>
  );
}
