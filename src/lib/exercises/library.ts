import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Exercise, ExerciseLevel, MuscleGroup } from './types';
import { MUSCLE_GROUP_MAP } from './types';

/**
 * Source: yuhonas/free-exercise-db (CC0 / Public Domain).
 * 800+ exercises with animated GIF demos hosted on raw.githubusercontent.com.
 */
const EXERCISES_JSON_URL =
  'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/dist/exercises.json';

const IMAGE_BASE_URL = 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises';

const CACHE_KEY = 'exercises.lib';
const CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 1 week

/** Fetches the exercise library, with a 1-week TTL cache. */
export async function loadExerciseLibrary(): Promise<Exercise[]> {
  const cachedRaw = await AsyncStorage.getItem(CACHE_KEY);
  if (cachedRaw) {
    const cached = JSON.parse(cachedRaw) as { fetchedAt: number; data: Exercise[] };
    if (Date.now() - cached.fetchedAt < CACHE_TTL_MS) return cached.data;
  }

  try {
    const r = await fetch(EXERCISES_JSON_URL);
    if (!r.ok) throw new Error(`exercises_${r.status}`);
    const data = (await r.json()) as Exercise[];
    await AsyncStorage.setItem(
      CACHE_KEY,
      JSON.stringify({ fetchedAt: Date.now(), data })
    );
    return data;
  } catch (e) {
    if (cachedRaw) return (JSON.parse(cachedRaw) as { data: Exercise[] }).data;
    throw e;
  }
}

export type ExerciseFilters = {
  muscleGroup?: MuscleGroup;
  level?: ExerciseLevel;
  equipment?: 'any' | 'none' | 'free' | 'machine';
  search?: string;
};

/**
 * Filter the loaded library. Pure, runs on whatever array you have in cache.
 */
export function filterExercises(
  list: Exercise[],
  f: ExerciseFilters
): Exercise[] {
  return list.filter((ex) => {
    if (f.level && ex.level !== f.level) return false;

    if (f.muscleGroup) {
      const group = MUSCLE_GROUP_MAP[f.muscleGroup];
      if (group.length > 0) {
        const matches =
          ex.primaryMuscles.some((m) => group.includes(m)) ||
          ex.secondaryMuscles.some((m) => group.includes(m));
        if (!matches) return false;
      } else if (f.muscleGroup === 'cardio') {
        if (ex.category !== 'cardio') return false;
      }
    }

    if (f.equipment === 'none' && ex.equipment !== 'body only') return false;
    if (f.equipment === 'machine' && ex.equipment !== 'machine') return false;
    if (
      f.equipment === 'free' &&
      !['barbell', 'dumbbell', 'kettlebells', 'e-z curl bar'].includes(ex.equipment ?? '')
    )
      return false;

    if (f.search) {
      const q = f.search.toLowerCase();
      if (!ex.name.toLowerCase().includes(q)) return false;
    }

    return true;
  });
}

export function imageUrl(exercise: Exercise, frame: 0 | 1 = 0): string {
  const path = exercise.images[frame] ?? exercise.images[0];
  if (!path) return '';
  // Library hosts GIFs at <id>/<n>.jpg but newer entries use .gif
  // We fall back to the original path which can be either.
  return `${IMAGE_BASE_URL}/${path}`;
}
