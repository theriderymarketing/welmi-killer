import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';
import { relations } from 'drizzle-orm';

export const profiles = sqliteTable('profiles', {
  id: text('id').primaryKey(), // anonymous local userId
  gender: text('gender').notNull(),
  birthdate: text('birthdate').notNull(), // ISO yyyy-mm-dd
  heightCm: real('height_cm').notNull(),
  weightKg: real('weight_kg').notNull(),
  activityLevel: text('activity_level').notNull(),
  goal: text('goal').notNull(),
  paceKgPerWeek: real('pace_kg_per_week').notNull().default(0.5),
  bmrKcal: integer('bmr_kcal').notNull(),
  tdeeKcal: integer('tdee_kcal').notNull(),
  targetKcal: integer('target_kcal').notNull(),
  targetProteinG: integer('target_protein_g').notNull(),
  targetCarbsG: integer('target_carbs_g').notNull(),
  targetFatG: integer('target_fat_g').notNull(),
  adjustMode: text('adjust_mode').notNull().default('balanced'),
  units: text('units').notNull().default('metric'),
  createdAt: integer('created_at', { mode: 'timestamp_ms' })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp_ms' })
    .notNull()
    .$defaultFn(() => new Date())
});

export const meals = sqliteTable('meals', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull(),
  consumedAt: integer('consumed_at', { mode: 'timestamp_ms' }).notNull(),
  source: text('source').notNull(), // photo | voice | manual | barcode
  photoLocalPath: text('photo_local_path'),
  rawInput: text('raw_input'),
  aiConfidence: real('ai_confidence'),
  totalKcal: real('total_kcal').notNull(),
  totalProteinG: real('total_protein_g').notNull(),
  totalCarbsG: real('total_carbs_g').notNull(),
  totalFatG: real('total_fat_g').notNull(),
  notes: text('notes'),
  createdAt: integer('created_at', { mode: 'timestamp_ms' })
    .notNull()
    .$defaultFn(() => new Date())
});

export const mealItems = sqliteTable('meal_items', {
  id: text('id').primaryKey(),
  mealId: text('meal_id')
    .notNull()
    .references(() => meals.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  quantityG: real('quantity_g').notNull(),
  kcal: real('kcal').notNull(),
  proteinG: real('protein_g').notNull(),
  carbsG: real('carbs_g').notNull(),
  fatG: real('fat_g').notNull(),
  confidence: real('confidence'),
  position: integer('position').notNull().default(0)
});

export const workouts = sqliteTable('workouts', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull(),
  externalId: text('external_id').notNull(), // e.g. strava_12345
  source: text('source').notNull(),
  type: text('type').notNull(),
  startAt: integer('start_at', { mode: 'timestamp_ms' }).notNull(),
  durationSec: integer('duration_sec').notNull(),
  kcal: real('kcal').notNull(),
  avgHr: integer('avg_hr'),
  deviceName: text('device_name'),
  syncedAt: integer('synced_at', { mode: 'timestamp_ms' })
    .notNull()
    .$defaultFn(() => new Date())
});

export const mealsRelations = relations(meals, ({ many }) => ({
  items: many(mealItems)
}));

export const mealItemsRelations = relations(mealItems, ({ one }) => ({
  meal: one(meals, { fields: [mealItems.mealId], references: [meals.id] })
}));

export type Profile = typeof profiles.$inferSelect;
export type NewProfile = typeof profiles.$inferInsert;
export type Meal = typeof meals.$inferSelect;
export type NewMeal = typeof meals.$inferInsert;
export type MealItem = typeof mealItems.$inferSelect;
export type NewMealItem = typeof mealItems.$inferInsert;
export type Workout = typeof workouts.$inferSelect;
