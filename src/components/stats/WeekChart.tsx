import { Canvas, Path, Skia, vec, Group, BlurMask, Circle, Line } from '@shopify/react-native-skia';
import { View } from 'react-native';
import { T } from '@/components/ui/Text';
import { colors, type } from '@/theme';
import type { DayTotal } from '@/db/repos/history';

type Props = {
  days: DayTotal[];
  targetKcal: number;
  width: number;
  height?: number;
};

const DAY_LETTER = ['S', 'M', 'T', 'W', 'T', 'F', 'S'] as const;

/**
 * 7-day kcal bar chart — editorial, no gridlines, target line in chartreuse.
 * Bars use proper height scaling, each labelled with day initial.
 */
export function WeekChart({ days, targetKcal, width, height = 180 }: Props) {
  const padding = { top: 24, right: 4, bottom: 30, left: 4 };
  const chartH = height - padding.top - padding.bottom;
  const chartW = width - padding.left - padding.right;
  const max = Math.max(targetKcal * 1.15, ...days.map((d) => d.kcal), 1);

  const barCount = days.length;
  const barGap = 8;
  const barW = (chartW - barGap * (barCount - 1)) / barCount;

  // Today index (last)
  const todayIdx = days.length - 1;

  // Target line y
  const targetY = padding.top + chartH - (targetKcal / max) * chartH;

  // Build bar paths
  const bars = days.map((d, i) => {
    const x = padding.left + i * (barW + barGap);
    const barH = (d.kcal / max) * chartH;
    const y = padding.top + chartH - barH;
    const path = Skia.Path.Make();
    path.addRRect({ rect: { x, y, width: barW, height: Math.max(barH, 2) }, rx: 4, ry: 4 });
    return { path, x, y, barH, isToday: i === todayIdx };
  });

  // Target line (dashed)
  const targetLine = Skia.Path.Make();
  targetLine.moveTo(padding.left, targetY);
  targetLine.lineTo(padding.left + chartW, targetY);

  return (
    <View style={{ width, height }}>
      <Canvas style={{ width, height }}>
        {/* Target line — dashed chartreuse */}
        <Group opacity={0.4}>
          <Path
            path={targetLine}
            style="stroke"
            strokeWidth={1}
            color={colors.accent}
          />
        </Group>

        {/* Bars */}
        {bars.map((b, i) => (
          <Group key={i}>
            {b.isToday ? (
              <Group opacity={0.25}>
                <Path path={b.path} color={colors.accent}>
                  <BlurMask blur={12} style="normal" />
                </Path>
              </Group>
            ) : null}
            <Path
              path={b.path}
              color={b.isToday ? colors.accent : days[i].kcal > 0 ? colors.surface : colors.divider}
            />
            {/* Border */}
            <Path
              path={b.path}
              style="stroke"
              strokeWidth={1}
              color={b.isToday ? colors.accent : colors.border}
            />
          </Group>
        ))}
      </Canvas>

      {/* Day labels */}
      <View
        style={{
          position: 'absolute',
          left: padding.left,
          right: padding.right,
          bottom: 4,
          flexDirection: 'row',
          gap: barGap
        }}
      >
        {days.map((d, i) => {
          const dayLetter = DAY_LETTER[d.date.getDay()];
          return (
            <View
              key={i}
              style={{
                width: barW,
                alignItems: 'center'
              }}
            >
              <T
                style={{
                  fontFamily: 'Inter-600',
                  fontSize: 11,
                  letterSpacing: 0.5,
                  color: i === todayIdx ? colors.accent : colors.inkLow
                }}
              >
                {dayLetter}
              </T>
            </View>
          );
        })}
      </View>

      {/* Target label */}
      <View
        pointerEvents="none"
        style={{
          position: 'absolute',
          left: 4,
          top: targetY - 18,
          paddingHorizontal: 6,
          paddingVertical: 2,
          backgroundColor: colors.canvas,
          borderRadius: 4
        }}
      >
        <T
          style={{
            fontFamily: type.label.family,
            fontSize: 10,
            letterSpacing: 0.6,
            color: colors.accent
          }}
        >
          {targetKcal} TARGET
        </T>
      </View>
    </View>
  );
}
