import { useEffect } from 'react';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withTiming,
  Easing
} from 'react-native-reanimated';
import { TextInput, type TextStyle } from 'react-native';

const AnimatedTextInput = Animated.createAnimatedComponent(TextInput);

type Props = {
  value: number;
  duration?: number;
  decimals?: number;
  style?: TextStyle;
  prefix?: string;
  suffix?: string;
};

/**
 * Count-up animation for numbers — uses TextInput because it's the only
 * RN component that supports animated `text` via animatedProps.
 *
 * No JS-thread re-renders during animation. Smooth on slow devices.
 */
export function CountUp({ value, duration = 900, decimals = 0, style, prefix = '', suffix = '' }: Props) {
  const v = useSharedValue(0);

  useEffect(() => {
    v.value = withTiming(value, {
      duration,
      easing: Easing.bezier(0.16, 1, 0.3, 1)
    });
  }, [value, duration, v]);

  const animatedProps = useAnimatedProps(() => ({
    text: `${prefix}${v.value.toFixed(decimals)}${suffix}`
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  }) as any);

  return (
    <AnimatedTextInput
      editable={false}
      defaultValue={`${prefix}0${decimals ? '.' + '0'.repeat(decimals) : ''}${suffix}`}
      animatedProps={animatedProps}
      style={[
        // Defaults — overridden by `style` prop
        { padding: 0, includeFontPadding: false } as TextStyle,
        style
      ]}
    />
  );
}
