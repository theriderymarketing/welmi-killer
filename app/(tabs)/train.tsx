import { View, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';
import { T } from '@/components/ui/Text';
import { MuscleGroupGrid } from '@/components/exercises/MuscleGroupGrid';
import { Filters } from '@/components/exercises/Filters';
import { ExerciseCard } from '@/components/exercises/ExerciseCard';
import { useFilteredExercises } from '@/hooks/useExercises';
import { colors, type } from '@/theme';
import type { MuscleGroup, ExerciseLevel } from '@/lib/exercises/types';

export default function TrainScreen() {
  const [muscleGroup, setMuscleGroup] = useState<MuscleGroup | null>(null);
  const [level, setLevel] = useState<ExerciseLevel | null>('beginner');
  const [equipment, setEquipment] = useState<'any' | 'none' | 'free' | 'machine'>('any');

  const { data: results, isLoading, error, library } = useFilteredExercises({
    muscleGroup: muscleGroup ?? undefined,
    level: level ?? undefined,
    equipment
  });

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: colors.canvas }}>
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 16, paddingBottom: 60 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <T variant="label" color={colors.inkLow} uppercase>
          Train
        </T>
        <T
          style={{
            fontFamily: type.display.family,
            fontSize: 56,
            lineHeight: 60,
            letterSpacing: -2,
            color: colors.inkHi,
            marginTop: 4
          }}
        >
          Move with{'\n'}
          <T
            style={{
              fontFamily: 'InstrumentSerif-Italic',
              fontSize: 56,
              color: colors.accent
            }}
          >
            intent.
          </T>
        </T>

        {/* Library size */}
        {library ? (
          <T variant="bodySm" color={colors.inkLow} style={{ marginTop: 12 }}>
            {library.length} exercises · CC0 Free Exercise DB
          </T>
        ) : null}

        {/* Muscle group picker */}
        <View style={{ marginTop: 24 }}>
          <T variant="label" color={colors.inkLow} uppercase style={{ marginBottom: 12 }}>
            Target muscle
          </T>
          <MuscleGroupGrid value={muscleGroup} onChange={setMuscleGroup} />
        </View>

        {/* Filters */}
        <View style={{ marginTop: 24 }}>
          <Filters
            level={level}
            setLevel={setLevel}
            equipment={equipment}
            setEquipment={setEquipment}
          />
        </View>

        {/* Results */}
        <View style={{ marginTop: 28 }}>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'baseline',
              marginBottom: 12
            }}
          >
            <T variant="label" color={colors.inkLow} uppercase>
              {muscleGroup ? `${muscleGroup} ·` : 'All ·'} {results?.length ?? 0} matches
            </T>
          </View>

          {isLoading ? (
            <View style={{ alignItems: 'center', padding: 40 }}>
              <ActivityIndicator color={colors.accent} />
              <T variant="bodySm" color={colors.inkLow} style={{ marginTop: 12 }}>
                Loading library…
              </T>
            </View>
          ) : error ? (
            <View style={{ padding: 24, alignItems: 'center' }}>
              <T variant="bodyMd" color={colors.danger}>
                Couldn't load exercises.
              </T>
              <T variant="bodySm" color={colors.inkLow} style={{ marginTop: 6 }}>
                Check your network and pull to refresh.
              </T>
            </View>
          ) : results && results.length > 0 ? (
            <View style={{ gap: 8 }}>
              {results.slice(0, 50).map((ex) => (
                <ExerciseCard key={ex.id} exercise={ex} />
              ))}
              {results.length > 50 ? (
                <T variant="bodySm" color={colors.inkLow} align="center" style={{ marginTop: 12 }}>
                  + {results.length - 50} more — refine filters above
                </T>
              ) : null}
            </View>
          ) : (
            <View
              style={{
                padding: 32,
                alignItems: 'center',
                borderRadius: 16,
                borderWidth: 1,
                borderColor: colors.border,
                borderStyle: 'dashed',
                backgroundColor: colors.surface
              }}
            >
              <T
                style={{
                  fontFamily: 'InstrumentSerif-Italic',
                  fontSize: 28,
                  color: colors.inkMid,
                  textAlign: 'center'
                }}
              >
                No matches.
              </T>
              <T variant="bodySm" color={colors.inkLow} align="center" style={{ marginTop: 8 }}>
                Try removing the equipment filter.
              </T>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
