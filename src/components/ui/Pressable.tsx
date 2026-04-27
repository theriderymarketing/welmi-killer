import { Pressable as RNPressable, type PressableProps, type ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { motion } from '@/theme';
import * as haptics from '@/lib/utils/haptics';

type Props = PressableProps & {
  scaleTo?: number;
  haptic?: 'tap' | 'press' | 'success' | 'none';
  style?: ViewStyle;
  children?: React.ReactNode;
};

/**
 * Animated press component. Spring scale + haptic by default.
 * Use everywhere instead of bare Pressable.
 */
export function PressScale({
  scaleTo = 0.96,
  haptic = 'tap',
  style,
  onPressIn,
  onPressOut,
  children,
  ...rest
}: Props) {
  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }]
  }));

  return (
    <Animated.View style={[animStyle, style]}>
      <RNPressable
        {...rest}
        onPressIn={(e) => {
          scale.value = withSpring(scaleTo, motion.springTight);
          if (haptic === 'tap') haptics.tap();
          else if (haptic === 'press') haptics.press();
          onPressIn?.(e);
        }}
        onPressOut={(e) => {
          scale.value = withSpring(1, motion.springTight);
          onPressOut?.(e);
        }}
      >
        {children as React.ReactNode}
      </RNPressable>
    </Animated.View>
  );
}
