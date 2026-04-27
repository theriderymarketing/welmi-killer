import { Canvas, Path, Skia, SweepGradient, vec } from '@shopify/react-native-skia';
import { View } from 'react-native';
import { useEffect, type ReactNode } from 'react';
import { useDerivedValue, useSharedValue, withTiming, Easing } from 'react-native-reanimated';

type Props = {
  size: number;
  strokeWidth: number;
  progress: number; // 0..1.2 (>1 = over target)
  overage: boolean;
  children?: ReactNode;
};

export function CalorieRing({ size, strokeWidth, progress, overage, children }: Props) {
  const r = (size - strokeWidth) / 2;
  const cx = size / 2;
  const cy = size / 2;

  const animated = useSharedValue(0);
  useEffect(() => {
    animated.value = withTiming(Math.min(progress, 1), {
      duration: 900,
      easing: Easing.out(Easing.cubic)
    });
  }, [progress, animated]);
  const end = useDerivedValue(() => animated.value);

  const path = Skia.Path.Make();
  path.addCircle(cx, cy, r);

  return (
    <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
      <Canvas style={{ position: 'absolute', width: size, height: size }}>
        <Path path={path} style="stroke" strokeWidth={strokeWidth} color="#27272a" />
        <Path
          path={path}
          style="stroke"
          strokeWidth={strokeWidth}
          strokeCap="round"
          start={0}
          end={end}
          origin={vec(cx, cy)}
          transform={[{ rotate: -Math.PI / 2 }]}
        >
          <SweepGradient
            c={vec(cx, cy)}
            colors={overage ? ['#f43f5e', '#f43f5e'] : ['#a3e635', '#22d3ee', '#a3e635']}
          />
        </Path>
      </Canvas>
      <View style={{ alignItems: 'center' }}>{children}</View>
    </View>
  );
}
