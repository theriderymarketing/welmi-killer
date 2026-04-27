import { View, ScrollView, Image, Pressable, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { useState, useEffect } from 'react';
import { T } from '@/components/ui/Text';
import { useExerciseLibrary } from '@/hooks/useExercises';
import { imageUrl } from '@/lib/exercises/library';
import { colors, radius, type } from '@/theme';

const LEVEL_LABEL: Record<string, string> = {
  beginner: 'Beginner',
  intermediate: 'Intermediate',
  expert: 'Advanced'
};
const LEVEL_COLOR: Record<string, string> = {
  beginner: '#9DBF6E',
  intermediate: '#E8B86A',
  expert: '#E26D5C'
};

export default function ExerciseDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const decodedId = id ? decodeURIComponent(id) : '';
  const { data: library } = useExerciseLibrary();

  const exercise = library?.find((e) => e.id === decodedId);

  // Toggle between frame 0 and frame 1 to fake animation
  const [frame, setFrame] = useState<0 | 1>(0);
  useEffect(() => {
    if (!exercise || exercise.images.length < 2) return;
    const t = setInterval(() => setFrame((f) => (f === 0 ? 1 : 0)), 700);
    return () => clearInterval(t);
  }, [exercise]);

  if (!exercise) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.canvas }}>
        <View style={{ padding: 24 }}>
          <Pressable onPress={() => router.back()} hitSlop={16}>
            <T variant="bodyMd" color={colors.inkMid}>
              ‹ Back
            </T>
          </Pressable>
          <T variant="body" color={colors.inkMid} style={{ marginTop: 24 }}>
            Exercise not found.
          </T>
        </View>
      </SafeAreaView>
    );
  }

  const screenW = Dimensions.get('window').width;
  const heroH = Math.min(screenW * 0.7, 320);

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: colors.canvas }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 80 }}>
        <View style={{ paddingHorizontal: 24 }}>
          <Pressable onPress={() => router.back()} hitSlop={16} style={{ paddingVertical: 12 }}>
            <T variant="bodyMd" color={colors.inkMid}>
              ‹ Back
            </T>
          </Pressable>
        </View>

        {/* Hero image */}
        <View
          style={{
            height: heroH,
            marginHorizontal: 24,
            marginTop: 8,
            borderRadius: radius.lg,
            overflow: 'hidden',
            backgroundColor: colors.elevated
          }}
        >
          {exercise.images[0] ? (
            <Image
              source={{ uri: imageUrl(exercise, frame) }}
              style={{ width: '100%', height: '100%' }}
              resizeMode="cover"
            />
          ) : null}
        </View>

        {/* Title + meta */}
        <View style={{ paddingHorizontal: 24, marginTop: 20 }}>
          <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
            <Tag label={LEVEL_LABEL[exercise.level]} color={LEVEL_COLOR[exercise.level]} />
            {exercise.equipment ? <Tag label={exercise.equipment} color={colors.inkMid} /> : null}
            {exercise.mechanic ? <Tag label={exercise.mechanic} color={colors.inkMid} /> : null}
            {exercise.force ? <Tag label={exercise.force} color={colors.inkMid} /> : null}
          </View>

          <T
            style={{
              fontFamily: type.display.family,
              fontSize: 40,
              lineHeight: 44,
              letterSpacing: -1.5,
              color: colors.inkHi,
              marginTop: 16
            }}
          >
            {exercise.name}
          </T>

          {/* Muscles */}
          <View style={{ marginTop: 24 }}>
            <T variant="label" color={colors.inkLow} uppercase>
              Primary
            </T>
            <View style={{ flexDirection: 'row', gap: 6, flexWrap: 'wrap', marginTop: 8 }}>
              {exercise.primaryMuscles.map((m) => (
                <MuscleTag key={m} label={m} highlighted />
              ))}
            </View>

            {exercise.secondaryMuscles.length > 0 ? (
              <>
                <T variant="label" color={colors.inkLow} uppercase style={{ marginTop: 16 }}>
                  Also works
                </T>
                <View style={{ flexDirection: 'row', gap: 6, flexWrap: 'wrap', marginTop: 8 }}>
                  {exercise.secondaryMuscles.map((m) => (
                    <MuscleTag key={m} label={m} />
                  ))}
                </View>
              </>
            ) : null}
          </View>

          {/* Instructions */}
          <View style={{ marginTop: 32 }}>
            <T variant="label" color={colors.inkLow} uppercase style={{ marginBottom: 12 }}>
              How to
            </T>
            <View style={{ gap: 14 }}>
              {exercise.instructions.map((step, i) => (
                <View key={i} style={{ flexDirection: 'row', gap: 12 }}>
                  <T
                    style={{
                      fontFamily: 'InstrumentSerif',
                      fontSize: 28,
                      color: colors.accent,
                      width: 32,
                      lineHeight: 28
                    }}
                  >
                    {String(i + 1).padStart(2, '0')}
                  </T>
                  <T variant="body" color={colors.inkHi} style={{ flex: 1 }}>
                    {step}
                  </T>
                </View>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function Tag({ label, color }: { label: string; color: string }) {
  return (
    <View
      style={{
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 999,
        borderWidth: 1,
        borderColor: color
      }}
    >
      <T variant="label" color={color} uppercase style={{ fontSize: 9, letterSpacing: 1 }}>
        {label}
      </T>
    </View>
  );
}

function MuscleTag({ label, highlighted }: { label: string; highlighted?: boolean }) {
  return (
    <View
      style={{
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 999,
        backgroundColor: highlighted ? colors.accent : colors.surface,
        borderWidth: 1,
        borderColor: highlighted ? colors.accent : colors.border
      }}
    >
      <T variant="bodySm" color={highlighted ? colors.accentInk : colors.inkHi} style={{ textTransform: 'capitalize' }}>
        {label}
      </T>
    </View>
  );
}
