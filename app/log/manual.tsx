import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Pressable } from 'react-native';
import { router } from 'expo-router';
import { T } from '@/components/ui/Text';
import { colors, type } from '@/theme';

export default function ManualScreen() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.canvas }}>
      <View style={{ paddingHorizontal: 24, paddingTop: 8, alignItems: 'flex-end' }}>
        <Pressable onPress={() => router.back()} hitSlop={16}>
          <T variant="bodyMd" color={colors.inkMid}>
            Close
          </T>
        </Pressable>
      </View>

      <View style={{ paddingHorizontal: 24, marginTop: 24, flex: 1 }}>
        <T variant="label" color={colors.inkLow} uppercase>
          Manual entry
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
          Coming next.
        </T>
        <T variant="body" color={colors.inkMid} style={{ marginTop: 12 }}>
          Search the USDA food database, or enter raw kcal/macros for unique items not in the catalog.
          Snap or speak in the meantime — both are faster anyway.
        </T>
      </View>
    </SafeAreaView>
  );
}
