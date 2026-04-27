import { Canvas, Path, Skia, vec, Group, BlurMask } from '@shopify/react-native-skia';
import { View } from 'react-native';
import { colors } from '@/theme';

type Props = { size?: number };

/**
 * Brand mark — minimal: open ring with a 2-o'clock notch.
 * Communicates "consumed/remaining" without spelling it out.
 */
export function Logo({ size = 64 }: Props) {
  const r = size / 2 - 4;
  const cx = size / 2;
  const cy = size / 2;

  // Full ring path
  const path = Skia.Path.Make();
  path.addCircle(cx, cy, r);

  // Render: outer halo + ring (with 0.7 trim, leaving an open arc at 2-o'clock)
  return (
    <View style={{ width: size, height: size }}>
      <Canvas style={{ width: size, height: size }}>
        <Group opacity={0.18}>
          <Path path={path} style="stroke" strokeWidth={size * 0.15} color={colors.accent}>
            <BlurMask blur={size * 0.15} style="normal" />
          </Path>
        </Group>
        <Group origin={vec(cx, cy)} transform={[{ rotate: -Math.PI / 2 }]}>
          <Path
            path={path}
            style="stroke"
            strokeWidth={Math.max(2, size * 0.08)}
            strokeCap="round"
            color={colors.accent}
            start={0}
            end={0.78}
          />
        </Group>
      </Canvas>
    </View>
  );
}
