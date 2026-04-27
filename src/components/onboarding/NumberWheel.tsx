import { View, FlatList, type ListRenderItem } from 'react-native';
import { useEffect, useRef } from 'react';
import { T } from '@/components/ui/Text';
import { colors, type } from '@/theme';
import * as haptics from '@/lib/utils/haptics';

type Props = {
  min: number;
  max: number;
  step?: number;
  value: number;
  onChange: (v: number) => void;
  unit?: string;
  format?: (v: number) => string;
};

const ITEM_HEIGHT = 56;
const VISIBLE = 5;

/**
 * Vertical scroll wheel (like iOS picker but custom-styled).
 * Snap to item, haptic tick on each rest, hero serif number in center.
 */
export function NumberWheel({ min, max, step = 1, value, onChange, unit, format }: Props) {
  const ref = useRef<FlatList<number>>(null);
  const lastIndex = useRef<number>(-1);

  const items = Array.from({ length: Math.floor((max - min) / step) + 1 }, (_, i) => min + i * step);

  useEffect(() => {
    const idx = Math.round((value - min) / step);
    ref.current?.scrollToOffset({ offset: idx * ITEM_HEIGHT, animated: false });
    lastIndex.current = idx;
  }, [value, min, step]);

  const renderItem: ListRenderItem<number> = ({ item }) => {
    const isCenter = item === value;
    return (
      <View
        style={{
          height: ITEM_HEIGHT,
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <T
          variant={isCenter ? 'displayMd' : 'h2'}
          color={isCenter ? colors.inkHi : colors.inkLow}
          style={{
            fontSize: isCenter ? 56 : 28,
            opacity: isCenter ? 1 : 0.4
          }}
        >
          {format ? format(item) : String(item)}
        </T>
      </View>
    );
  };

  return (
    <View
      style={{
        height: ITEM_HEIGHT * VISIBLE,
        position: 'relative',
        justifyContent: 'center'
      }}
    >
      {/* Center band — subtle highlight */}
      <View
        pointerEvents="none"
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: ITEM_HEIGHT * 2,
          height: ITEM_HEIGHT,
          borderTopWidth: 1,
          borderBottomWidth: 1,
          borderColor: colors.divider
        }}
      />

      <FlatList
        ref={ref}
        data={items}
        keyExtractor={(i) => String(i)}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        snapToInterval={ITEM_HEIGHT}
        decelerationRate="fast"
        contentContainerStyle={{
          paddingTop: ITEM_HEIGHT * 2,
          paddingBottom: ITEM_HEIGHT * 2
        }}
        onMomentumScrollEnd={(e) => {
          const idx = Math.round(e.nativeEvent.contentOffset.y / ITEM_HEIGHT);
          const v = items[Math.max(0, Math.min(items.length - 1, idx))];
          if (v !== undefined && v !== value) {
            onChange(v);
            haptics.tap();
          }
        }}
        onScroll={(e) => {
          const idx = Math.round(e.nativeEvent.contentOffset.y / ITEM_HEIGHT);
          if (idx !== lastIndex.current) {
            lastIndex.current = idx;
            haptics.tap();
          }
        }}
        scrollEventThrottle={16}
      />

      {/* Unit label — fixed right, only when at rest */}
      {unit ? (
        <View
          pointerEvents="none"
          style={{
            position: 'absolute',
            right: 24,
            top: ITEM_HEIGHT * 2 + 18,
            height: ITEM_HEIGHT
          }}
        >
          <T
            variant="label"
            uppercase
            color={colors.inkLow}
            style={{ fontSize: 12, letterSpacing: 1.2 }}
          >
            {unit}
          </T>
        </View>
      ) : null}
    </View>
  );
}
