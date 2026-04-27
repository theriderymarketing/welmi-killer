import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { loadExerciseLibrary, filterExercises, type ExerciseFilters } from '@/lib/exercises/library';

export function useExerciseLibrary() {
  return useQuery({
    queryKey: ['exercises', 'library'],
    queryFn: loadExerciseLibrary,
    staleTime: 24 * 60 * 60 * 1000, // 1 day
    gcTime: 7 * 24 * 60 * 60 * 1000 // 1 week
  });
}

export function useFilteredExercises(filters: ExerciseFilters) {
  const { data: library, ...rest } = useExerciseLibrary();
  const filtered = useMemo(() => {
    if (!library) return [];
    return filterExercises(library, filters);
  }, [library, filters.muscleGroup, filters.level, filters.equipment, filters.search]);

  return { data: filtered, library, ...rest };
}
