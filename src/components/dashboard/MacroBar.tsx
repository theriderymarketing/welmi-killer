import { View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming, Easing } from 'react-native-reanimated';
import { useEffect } from 'react';
import { T } from '@/components/ui/Text';
import { colors } from '@/theme';

type Props = {
  label: string;
  consumed: number;
  target: number;
  color: string;
};

export function MacroBar({ label, consumed, target, color }: Props) {
  const ratio = Math.min(consumed / Math.max(target, 1), 1);
  const w = useSharedValue(0);

  useEffect(() => {
    w.value = withTiming(ratio, { duration: 800, easing: Easing.bezier(0.16, 1, 0.3, 1) });
  }, [ratio, w]);

  const fillStyle = useAnimatedStyle(() => ({ width: `${w.value * 100}%` }));

  return (
    <View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
        <T variant="label" color={colors.inkMid} uppercase>
          {label}
        </T>
        <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 4 }}>
          <T variant="num" color={colors.inkHi}>
            {Math.round(consumed)}
          </T>
          <T variant="bodySm" color={colors.inkLow}>
            / {target}g
          </T>
        </View>
      </View>
      <View
        style={{
          height: 4,
          backgroundColor: colors.divider,
          borderRadius: 999,
          overflow: 'hidden'
        }}
      >
        <Animated.View
          style={[{ height: '100%', backgroundColor: color, borderRadius: 999 }, fillStyle]}
        />
      </View>
    </View>
  );
}
