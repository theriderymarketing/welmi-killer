import * as SQLite from 'expo-sqlite';
import { drizzle } from 'drizzle-orm/expo-sqlite';
import * as schema from './schema';

const sqlite = SQLite.openDatabaseSync('welmi.db');
export const db = drizzle(sqlite, { schema });

/**
 * Bootstraps schema. Drizzle migrations are normally generated with
 * `drizzle-kit generate` and applied via expo-sqlite migration runner.
 * For V1 we use idempotent CREATE IF NOT EXISTS to keep boot simple.
 */
export async function initDatabase(): Promise<void> {
  sqlite.execSync(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS profiles (
      id TEXT PRIMARY KEY,
      gender TEXT NOT NULL,
      birthdate TEXT NOT NULL,
      height_cm REAL NOT NULL,
      weight_kg REAL NOT NULL,
      activity_level TEXT NOT NULL,
      goal TEXT NOT NULL,
      pace_kg_per_week REAL NOT NULL DEFAULT 0.5,
      bmr_kcal INTEGER NOT NULL,
      tdee_kcal INTEGER NOT NULL,
      target_kcal INTEGER NOT NULL,
      target_protein_g INTEGER NOT NULL,
      target_carbs_g INTEGER NOT NULL,
      target_fat_g INTEGER NOT NULL,
      adjust_mode TEXT NOT NULL DEFAULT 'balanced',
      units TEXT NOT NULL DEFAULT 'metric',
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS meals (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      consumed_at INTEGER NOT NULL,
      source TEXT NOT NULL,
      photo_local_path TEXT,
      raw_input TEXT,
      ai_confidence REAL,
      total_kcal REAL NOT NULL,
      total_protein_g REAL NOT NULL,
      total_carbs_g REAL NOT NULL,
      total_fat_g REAL NOT NULL,
      notes TEXT,
      created_at INTEGER NOT NULL
    );
    CREATE INDEX IF NOT EXISTS meals_user_day_idx ON meals(user_id, consumed_at DESC);

    CREATE TABLE IF NOT EXISTS meal_items (
      id TEXT PRIMARY KEY,
      meal_id TEXT NOT NULL REFERENCES meals(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      quantity_g REAL NOT NULL,
      kcal REAL NOT NULL,
      protein_g REAL NOT NULL,
      carbs_g REAL NOT NULL,
      fat_g REAL NOT NULL,
      confidence REAL,
      position INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS workouts (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      external_id TEXT NOT NULL,
      source TEXT NOT NULL,
      type TEXT NOT NULL,
      start_at INTEGER NOT NULL,
      duration_sec INTEGER NOT NULL,
      kcal REAL NOT NULL,
      avg_hr INTEGER,
      device_name TEXT,
      synced_at INTEGER NOT NULL,
      UNIQUE(user_id, external_id)
    );
    CREATE INDEX IF NOT EXISTS workouts_user_day_idx ON workouts(user_id, start_at DESC);
  `);
}
