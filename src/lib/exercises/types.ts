/**
 * Exercise schema — matches yuhonas/free-exercise-db v1.
 * 800+ exercises, CC0 licensed, with animated GIF demos.
 */

export type ExerciseLevel = 'beginner' | 'intermediate' | 'expert';

export type ExerciseForce = 'push' | 'pull' | 'static' | null;

export type ExerciseMechanic = 'compound' | 'isolation' | null;

export type ExerciseEquipment =
  | 'body only'
  | 'machine'
  | 'kettlebells'
  | 'dumbbell'
  | 'cable'
  | 'barbell'
  | 'bands'
  | 'medicine ball'
  | 'exercise ball'
  | 'e-z curl bar'
  | 'foam roll'
  | 'other'
  | null;

export type Muscle =
  | 'abdominals'
  | 'abductors'
  | 'adductors'
  | 'biceps'
  | 'calves'
  | 'chest'
  | 'forearms'
  | 'glutes'
  | 'hamstrings'
  | 'lats'
  | 'lower back'
  | 'middle back'
  | 'neck'
  | 'quadriceps'
  | 'shoulders'
  | 'traps'
  | 'triceps';

export type ExerciseCategory =
  | 'powerlifting'
  | 'strength'
  | 'stretching'
  | 'cardio'
  | 'olympic weightlifting'
  | 'strongman'
  | 'plyometrics';

export type Exercise = {
  id: string;            // e.g. "Barbell_Bench_Press_-_Medium_Grip"
  name: string;          // e.g. "Barbell Bench Press - Medium Grip"
  force: ExerciseForce;
  level: ExerciseLevel;
  mechanic: ExerciseMechanic;
  equipment: ExerciseEquipment;
  primaryMuscles: Muscle[];
  secondaryMuscles: Muscle[];
  instructions: string[];
  category: ExerciseCategory;
  images: string[];      // relative paths "Barbell_Bench_Press_-_Medium_Grip/0.jpg"
};

/**
 * Front-end-friendly muscle groups for the body picker.
 * Maps to one or more `Muscle` values.
 */
export type MuscleGroup =
  | 'chest'
  | 'back'
  | 'shoulders'
  | 'arms'
  | 'core'
  | 'legs'
  | 'glutes'
  | 'cardio';

export const MUSCLE_GROUP_MAP: Record<MuscleGroup, Muscle[]> = {
  chest: ['chest'],
  back: ['lats', 'middle back', 'lower back', 'traps'],
  shoulders: ['shoulders', 'neck'],
  arms: ['biceps', 'triceps', 'forearms'],
  core: ['abdominals'],
  legs: ['quadriceps', 'hamstrings', 'calves', 'adductors', 'abductors'],
  glutes: ['glutes'],
  cardio: []
};

export const MUSCLE_GROUP_LABEL: Record<MuscleGroup, string> = {
  chest: 'Chest',
  back: 'Back',
  shoulders: 'Shoulders',
  arms: 'Arms',
  core: 'Core',
  legs: 'Legs',
  glutes: 'Glutes',
  cardio: 'Cardio'
};
