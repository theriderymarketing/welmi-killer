import { View } from 'react-native';
import { T } from '@/components/ui/Text';
import { PressScale } from '@/components/ui/Pressable';
import { colors, radius } from '@/theme';

type Props<T extends string> = {
  options: { value: T; label: string; sub?: string }[];
  value: T;
  onChange: (v: T) => void;
  layout?: 'list' | 'wrap';
};

/**
 * Generic chip selector. List = vertical full-width rows (default).
 * Wrap = horizontal pills.
 */
export function Chips<TValue extends string>({
  options,
  value,
  onChange,
  layout = 'list'
}: Props<TValue>) {
  if (layout === 'wrap') {
    return (
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
        {options.map((o) => {
          const active = value === o.value;
          return (
            <PressScale
              key={o.value}
              onPress={() => onChange(o.value)}
              style={{
                paddingHorizontal: 16,
                paddingVertical: 10,
                borderRadius: 999,
                backgroundColor: active ? colors.accent : colors.surface,
                borderWidth: 1,
                borderColor: active ? colors.accent : colors.border
              }}
            >
              <T variant="bodyMd" color={active ? colors.accentInk : colors.inkHi}>
                {o.label}
              </T>
            </PressScale>
          );
        })}
      </View>
    );
  }

  return (
    <View style={{ gap: 10 }}>
      {options.map((o) => {
        const active = value === o.value;
        return (
          <PressScale
            key={o.value}
            onPress={() => onChange(o.value)}
            style={{
              paddingHorizontal: 18,
              paddingVertical: 18,
              borderRadius: radius.md,
              backgroundColor: active ? colors.accent : colors.surface,
              borderWidth: 1,
              borderColor: active ? colors.accent : colors.border,
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >
            <View style={{ flex: 1 }}>
              <T variant="h3" color={active ? colors.accentInk : colors.inkHi}>
                {o.label}
              </T>
              {o.sub ? (
                <T
                  variant="bodySm"
                  color={active ? colors.accentInk : colors.inkMid}
                  style={{ marginTop: 2, opacity: active ? 0.7 : 1 }}
                >
                  {o.sub}
                </T>
              ) : null}
            </View>
            <T variant="h3" color={active ? colors.accentInk : colors.inkLow}>
              {active ? '✓' : ''}
            </T>
          </PressScale>
        );
      })}
    </View>
  );
}
