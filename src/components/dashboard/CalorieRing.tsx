import {
  Canvas,
  Path,
  Skia,
  SweepGradient,
  Group,
  BlurMask,
  vec
} from '@shopify/react-native-skia';
import { View } from 'react-native';
import { useEffect, type ReactNode } from 'react';
import { useDerivedValue, useSharedValue, withTiming, Easing } from 'react-native-reanimated';
import { colors, elevation } from '@/theme';

type Props = {
  size: number;
  strokeWidth?: number;
  progress: number;
  overage: boolean;
  children?: ReactNode;
};

/**
 * CalorieRing — Editorial-grade circular meter.
 *
 * Layers (back to front):
 *   1. Outer glow halo — soft chartreuse blur, breathes
 *   2. Track — concentric thin line, very subtle
 *   3. Tick marks — 60 micro-ticks (1 per 6°) for editorial detail
 *   4. Progress arc — the only saturated element, rounded caps
 *   5. End-point dot — pulse when active
 *   6. Center content (children)
 *
 * No gradient rainbow. No emoji glow. No "AI" violet sheen.
 */
export function CalorieRing({
  size,
  strokeWidth = 14,
  progress,
  overage,
  children
}: Props) {
  const r = (size - strokeWidth - 16) / 2;
  const cx = size / 2;
  const cy = size / 2;

  // Animated progress (0..1) and breathe loop (for halo opacity)
  const animated = useSharedValue(0);
  const breathe = useSharedValue(0);

  useEffect(() => {
    animated.value = withTiming(Math.min(progress, 1), {
      duration: 1100,
      easing: Easing.bezier(0.16, 1, 0.3, 1)
    });
  }, [progress, animated]);

  useEffect(() => {
    const loop = () => {
      breathe.value = withTiming(1, { duration: 2400, easing: Easing.inOut(Easing.cubic) }, () => {
        breathe.value = withTiming(0, { duration: 2400, easing: Easing.inOut(Easing.cubic) }, loop);
      });
    };
    loop();
  }, [breathe]);

  const end = useDerivedValue(() => animated.value);
  const haloOpacity = useDerivedValue(() => 0.08 + breathe.value * 0.07);

  // Build paths
  const trackPath = Skia.Path.Make();
  trackPath.addCircle(cx, cy, r);

  // Tick marks — 60 markers around the ring, length 4px
  const tickPath = Skia.Path.Make();
  const tickInner = r - 2;
  const tickOuter = r + 2;
  for (let i = 0; i < 60; i++) {
    const angle = (i / 60) * Math.PI * 2 - Math.PI / 2;
    const x1 = cx + Math.cos(angle) * tickInner;
    const y1 = cy + Math.sin(angle) * tickInner;
    const x2 = cx + Math.cos(angle) * tickOuter;
    const y2 = cy + Math.sin(angle) * tickOuter;
    tickPath.moveTo(x1, y1);
    tickPath.lineTo(x2, y2);
  }

  const arcColor = overage ? colors.danger : colors.accent;

  return (
    <View
      style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}
    >
      <Canvas style={{ position: 'absolute', width: size, height: size }}>
        {/* Halo — soft outer glow that breathes */}
        <Group opacity={haloOpacity}>
          <Path path={trackPath} style="stroke" strokeWidth={strokeWidth + 24} color={arcColor}>
            <BlurMask blur={32} style="normal" />
          </Path>
        </Group>

        {/* Track — very thin, very subtle */}
        <Path
          path={trackPath}
          style="stroke"
          strokeWidth={1}
          color={colors.divider}
        />

        {/* Tick marks — editorial detail */}
        <Path
          path={tickPath}
          style="stroke"
          strokeWidth={1}
          color={colors.inkDim}
          opacity={0.6}
        />

        {/* Progress arc — the hero */}
        <Group origin={vec(cx, cy)} transform={[{ rotate: -Math.PI / 2 }]}>
          <Path
            path={trackPath}
            style="stroke"
            strokeWidth={strokeWidth}
            strokeCap="round"
            start={0}
            end={end}
          >
            <SweepGradient
              c={vec(cx, cy)}
              colors={
                overage
                  ? [colors.danger, colors.warn, colors.danger]
                  : [colors.accent, colors.accent, colors.success, colors.accent]
              }
            />
          </Path>
        </Group>

        {/* Soft inner shadow on the arc for depth */}
        <Group origin={vec(cx, cy)} transform={[{ rotate: -Math.PI / 2 }]} opacity={0.5}>
          <Path
            path={trackPath}
            style="stroke"
            strokeWidth={strokeWidth}
            strokeCap="round"
            start={0}
            end={end}
            color={arcColor}
          >
            <BlurMask blur={8} style="solid" />
          </Path>
        </Group>
      </Canvas>

      <View style={{ alignItems: 'center', justifyContent: 'center' }}>{children}</View>
    </View>
  );
}
