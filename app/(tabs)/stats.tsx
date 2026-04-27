import { View, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { T } from '@/components/ui/Text';
import { colors, type } from '@/theme';

export default function StatsScreen() {
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
          Your week.
        </T>
        <T variant="body" color={colors.inkMid} style={{ marginTop: 14 }}>
          Charts arrive in v0.2. For now, log meals and watch the ring fill.
        </T>

        <View
          style={{
            marginTop: 32,
            backgroundColor: colors.surface,
            borderRadius: 24,
            borderWidth: 1,
            borderColor: colors.border,
            borderStyle: 'dashed',
            padding: 32,
            alignItems: 'center'
          }}
        >
          <T
            style={{
              fontFamily: 'InstrumentSerif-Italic',
              fontSize: 28,
              color: colors.inkMid,
              textAlign: 'center'
            }}
          >
            Coming soon.
          </T>
          <T variant="bodySm" color={colors.inkLow} align="center" style={{ marginTop: 8 }}>
            7 / 30 / 90-day macro trends, weight curve, weekly averages.
          </T>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
