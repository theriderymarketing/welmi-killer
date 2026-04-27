import { View, ScrollView } from 'react-native';
import { T } from '@/components/ui/Text';
import { PressScale } from '@/components/ui/Pressable';
import { colors, radius } from '@/theme';
import type { ExerciseLevel } from '@/lib/exercises/types';

type EquipmentTag = 'any' | 'none' | 'free' | 'machine';

type Props = {
  level: ExerciseLevel | null;
  setLevel: (v: ExerciseLevel | null) => void;
  equipment: EquipmentTag;
  setEquipment: (v: EquipmentTag) => void;
};

const LEVEL_OPTIONS: { id: ExerciseLevel; label: string }[] = [
  { id: 'beginner', label: 'Beginner' },
  { id: 'intermediate', label: 'Intermediate' },
  { id: 'expert', label: 'Advanced' }
];

const EQUIPMENT_OPTIONS: { id: EquipmentTag; label: string }[] = [
  { id: 'any', label: 'Any' },
  { id: 'none', label: 'Bodyweight' },
  { id: 'free', label: 'Free weights' },
  { id: 'machine', label: 'Machine' }
];

export function Filters({ level, setLevel, equipment, setEquipment }: Props) {
  return (
    <View>
      <T variant="label" color={colors.inkLow} uppercase style={{ marginBottom: 8 }}>
        Level
      </T>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 8, paddingRight: 24 }}
      >
        <Chip
          label="All"
          active={level === null}
          onPress={() => setLevel(null)}
        />
        {LEVEL_OPTIONS.map((o) => (
          <Chip
            key={o.id}
            label={o.label}
            active={level === o.id}
            onPress={() => setLevel(o.id)}
          />
        ))}
      </ScrollView>

      <T variant="label" color={colors.inkLow} uppercase style={{ marginTop: 16, marginBottom: 8 }}>
        Equipment
      </T>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 8, paddingRight: 24 }}
      >
        {EQUIPMENT_OPTIONS.map((o) => (
          <Chip
            key={o.id}
            label={o.label}
            active={equipment === o.id}
            onPress={() => setEquipment(o.id)}
          />
        ))}
      </ScrollView>
    </View>
  );
}

function Chip({
  label,
  active,
  onPress
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <PressScale
      haptic="tap"
      onPress={onPress}
      style={{
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 999,
        backgroundColor: active ? colors.accent : colors.surface,
        borderColor: active ? colors.accent : colors.border,
        borderWidth: 1
      }}
    >
      <T variant="bodySm" color={active ? colors.accentInk : colors.inkHi}>
        {label}
      </T>
    </PressScale>
  );
}
