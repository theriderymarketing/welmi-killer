import { View } from 'react-native';
import { T } from '@/components/ui/Text';
import { PressScale } from '@/components/ui/Pressable';
import { colors, radius } from '@/theme';
import type { MuscleGroup } from '@/lib/exercises/types';
import { MUSCLE_GROUP_LABEL } from '@/lib/exercises/types';

type Props = {
  value: MuscleGroup | null;
  onChange: (v: MuscleGroup | null) => void;
};

const GROUPS: { id: MuscleGroup; icon: string }[] = [
  { id: 'chest', icon: '◯' },
  { id: 'back', icon: '◑' },
  { id: 'shoulders', icon: '◧' },
  { id: 'arms', icon: '◐' },
  { id: 'core', icon: '◈' },
  { id: 'legs', icon: '◰' },
  { id: 'glutes', icon: '◓' },
  { id: 'cardio', icon: '◔' }
];

export function MuscleGroupGrid({ value, onChange }: Props) {
  return (
    <View
      style={{
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8
      }}
    >
      {GROUPS.map((g) => {
        const active = value === g.id;
        return (
          <PressScale
            key={g.id}
            haptic="tap"
            onPress={() => onChange(active ? null : g.id)}
            style={{
              width: '23.5%',
              aspectRatio: 1,
              borderRadius: radius.md,
              backgroundColor: active ? colors.accent : colors.surface,
              borderColor: active ? colors.accent : colors.border,
              borderWidth: 1,
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6
            }}
          >
            <T
              style={{
                fontSize: 22,
                color: active ? colors.accentInk : colors.accent
              }}
            >
              {g.icon}
            </T>
            <T
              variant="label"
              color={active ? colors.accentInk : colors.inkMid}
              uppercase
              style={{ fontSize: 9 }}
            >
              {MUSCLE_GROUP_LABEL[g.id]}
            </T>
          </PressScale>
        );
      })}
    </View>
  );
}
