import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { T } from '@/components/ui/Text';
import { PressScale } from '@/components/ui/Pressable';
import { colors, radius, type } from '@/theme';

/**
 * Welcome — landing screen. Single hero number, short pitch, single CTA.
 * No "powered by AI" badge. The serif number IS the brand.
 */
export default function Welcome() {
  return (
    <SafeAreaView edges={['top', 'bottom']} style={{ flex: 1, backgroundColor: colors.canvas }}>
      <View style={{ flex: 1, paddingHorizontal: 24, justifyContent: 'space-between' }}>
        <View />

        <View style={{ alignItems: 'flex-start' }}>
          <Animated.View entering={FadeIn.duration(700).delay(100)}>
            <T variant="label" color={colors.inkLow} uppercase>
              Welmi Killer · v0.1
            </T>
          </Animated.View>

          <Animated.View entering={FadeInDown.duration(900).delay(250)}>
            <T
              style={{
                fontFamily: type.displayXl.family,
                fontSize: 84,
                lineHeight: 86,
                letterSpacing: -3,
                color: colors.inkHi,
                marginTop: 12
              }}
            >
              Eat by{'\n'}
              <T
                style={{
                  fontFamily: 'InstrumentSerif-Italic',
                  fontSize: 84,
                  lineHeight: 86,
                  letterSpacing: -3,
                  color: colors.accent
                }}
              >
                instinct.
              </T>
            </T>
          </Animated.View>

          <Animated.View entering={FadeInDown.duration(900).delay(450)}>
            <T variant="body" color={colors.inkMid} style={{ marginTop: 18, maxWidth: 320 }}>
              Snap your meal. Speak it. Sync your watch. Three taps to a calorie target that adjusts to
              the day you actually had.
            </T>
          </Animated.View>
        </View>

        <Animated.View entering={FadeIn.duration(700).delay(700)}>
          <PressScale
            haptic="press"
            onPress={() => router.push('/(onboarding)/gender')}
            style={{
              backgroundColor: colors.accent,
              borderRadius: radius.lg,
              paddingVertical: 18,
              alignItems: 'center'
            }}
          >
            <T variant="h3" color={colors.accentInk}>
              Begin
            </T>
          </PressScale>
          <T
            variant="bodySm"
            color={colors.inkLow}
            align="center"
            style={{ marginTop: 14 }}
          >
            Takes about 60 seconds. No account, no email.
          </T>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}
