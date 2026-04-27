import { View, Text } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { useEffect } from 'react';

type Props = {
  label: string;
  consumed: number;
  target: number;
  color: string;
};

export function MacroBar({ label, consumed, target, color }: Props) {
  const ratio = Math.min(consumed / Math.max(target, 1), 1);
  const width = useSharedValue(0);

  useEffect(() => {
    width.value = withTiming(ratio, { duration: 700 });
  }, [ratio, width]);

  const fillStyle = useAnimatedStyle(() => ({
    width: `${width.value * 100}%`
  }));

  return (
    <View>
      <View className="flex-row justify-between mb-1.5">
        <Text className="text-ink-300 text-sm font-medium">{label}</Text>
        <Text className="text-ink-500 text-sm tabular-nums">
          {Math.round(consumed)} / {target} g
        </Text>
      </View>
      <View className="h-2 bg-ink-800 rounded-full overflow-hidden">
        <Animated.View style={[{ height: '100%', backgroundColor: color, borderRadius: 999 }, fillStyle]} />
      </View>
    </View>
  );
}
