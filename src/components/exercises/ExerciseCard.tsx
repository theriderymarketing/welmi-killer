import { View, Image } from 'react-native';
import { router } from 'expo-router';
import { T } from '@/components/ui/Text';
import { PressScale } from '@/components/ui/Pressable';
import { colors, radius } from '@/theme';
import { imageUrl } from '@/lib/exercises/library';
import type { Exercise } from '@/lib/exercises/types';

const LEVEL_LABEL: Record<Exercise['level'], string> = {
  beginner: 'Beginner',
  intermediate: 'Intermediate',
  expert: 'Advanced'
};

const LEVEL_COLOR: Record<Exercise['level'], string> = {
  beginner: '#9DBF6E',
  intermediate: '#E8B86A',
  expert: '#E26D5C'
};

export function ExerciseCard({ exercise }: { exercise: Exercise }) {
  return (
    <PressScale
      haptic="tap"
      onPress={() => router.push(`/exercise/${encodeURIComponent(exercise.id)}`)}
      style={{
        backgroundColor: colors.surface,
        borderColor: colors.border,
        borderWidth: 1,
        borderRadius: radius.lg,
        overflow: 'hidden',
        flexDirection: 'row',
        gap: 12,
        padding: 8,
        alignItems: 'center'
      }}
    >
      {exercise.images[0] ? (
        <Image
          source={{ uri: imageUrl(exercise, 0) }}
          style={{
            width: 84,
            height: 84,
            borderRadius: radius.md,
            backgroundColor: colors.elevated
          }}
        />
      ) : (
        <View
          style={{
            width: 84,
            height: 84,
            borderRadius: radius.md,
            backgroundColor: colors.elevated
          }}
        />
      )}

      <View style={{ flex: 1, paddingVertical: 4 }}>
        <T variant="bodyMd" color={colors.inkHi} numberOfLines={2}>
          {exercise.name}
        </T>
        <View style={{ flexDirection: 'row', gap: 8, marginTop: 6, flexWrap: 'wrap' }}>
          <View
            style={{
              paddingHorizontal: 8,
              paddingVertical: 2,
              borderRadius: 999,
              backgroundColor: 'transparent',
              borderColor: LEVEL_COLOR[exercise.level],
              borderWidth: 1
            }}
          >
            <T
              variant="label"
              color={LEVEL_COLOR[exercise.level]}
              uppercase
              style={{ fontSize: 9 }}
            >
              {LEVEL_LABEL[exercise.level]}
            </T>
          </View>
          {exercise.equipment ? (
            <T variant="bodySm" color={colors.inkLow}>
              · {exercise.equipment}
            </T>
          ) : null}
        </View>
        <T variant="bodySm" color={colors.inkMid} style={{ marginTop: 4 }} numberOfLines={1}>
          {exercise.primaryMuscles.join(' · ')}
        </T>
      </View>
    </PressScale>
  );
}
