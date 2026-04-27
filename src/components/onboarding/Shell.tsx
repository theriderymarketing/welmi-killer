import { View, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import Animated, { useAnimatedStyle, useSharedValue, withTiming, Easing } from 'react-native-reanimated';
import { useEffect, type ReactNode } from 'react';
import { T } from '@/components/ui/Text';
import { PressScale } from '@/components/ui/Pressable';
import { colors, radius } from '@/theme';

type Props = {
  step: number;
  total: number;
  title: string;
  hint?: string;
  ctaLabel?: string;
  ctaDisabled?: boolean;
  onCta: () => void;
  onBack?: () => void;
  children: ReactNode;
};

/**
 * Shell — chrome shared by every onboarding screen.
 *  - Top: minimal step indicator (line that fills) + back arrow
 *  - Middle: step-specific content
 *  - Bottom: hero CTA, sticky
 */
export function Shell({
  step,
  total,
  title,
  hint,
  ctaLabel = 'Continue',
  ctaDisabled,
  onCta,
  onBack,
  children
}: Props) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withTiming(step / total, {
      duration: 500,
      easing: Easing.bezier(0.16, 1, 0.3, 1)
    });
  }, [step, total, progress]);

  const fillStyle = useAnimatedStyle(() => ({
    width: `${progress.value * 100}%`
  }));

  return (
    <SafeAreaView edges={['top', 'bottom']} style={{ flex: 1, backgroundColor: colors.canvas }}>
      {/* Top bar */}
      <View
        style={{
          paddingHorizontal: 24,
          paddingTop: 8,
          paddingBottom: 16,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 12
        }}
      >
        <Pressable
          onPress={onBack ?? (() => router.back())}
          hitSlop={16}
          style={{ paddingRight: 4 }}
        >
          <T variant="bodyMd" color={colors.inkMid}>
            ‹
          </T>
        </Pressable>

        <View
          style={{
            flex: 1,
            height: 2,
            backgroundColor: colors.divider,
            borderRadius: 999,
            overflow: 'hidden'
          }}
        >
          <Animated.View
            style={[{ height: '100%', backgroundColor: colors.accent }, fillStyle]}
          />
        </View>

        <T variant="meta" color={colors.inkLow}>
          {step}/{total}
        </T>
      </View>

      {/* Content */}
      <View style={{ flex: 1, paddingHorizontal: 24, paddingTop: 24 }}>
        <T variant="h1" color={colors.inkHi}>
          {title}
        </T>
        {hint ? (
          <T variant="body" color={colors.inkMid} style={{ marginTop: 8 }}>
            {hint}
          </T>
        ) : null}

        <View style={{ flex: 1, marginTop: 32 }}>{children}</View>
      </View>

      {/* Sticky CTA */}
      <View style={{ paddingHorizontal: 24, paddingBottom: 16 }}>
        <PressScale
          haptic="press"
          onPress={onCta}
          disabled={ctaDisabled}
          style={{
            backgroundColor: ctaDisabled ? colors.surface : colors.accent,
            borderRadius: radius.lg,
            paddingVertical: 18,
            alignItems: 'center',
            opacity: ctaDisabled ? 0.5 : 1
          }}
        >
          <T variant="h3" color={ctaDisabled ? colors.inkLow : colors.accentInk}>
            {ctaLabel}
          </T>
        </PressScale>
      </View>
    </SafeAreaView>
  );
}
