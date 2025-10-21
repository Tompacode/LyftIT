import * as SQLite from 'expo-sqlite';

export async function initTrainingAppSchema(db: SQLite.SQLiteDatabase): Promise<void> {
  // Use a transaction for atomic setup
  await db.execAsync(`
    PRAGMA journal_mode = WAL;

    CREATE TABLE IF NOT EXISTS exercises (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL,
      description TEXT,
      muscle_group TEXT
    );

    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS workouts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      name TEXT,
      created_at INTEGER,
      FOREIGN KEY(user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS workout_exercises (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      workout_id INTEGER,
      exercise_id INTEGER,
      [order] INTEGER,
      reps INTEGER,
      weight REAL,
      FOREIGN KEY(workout_id) REFERENCES workouts(id),
      FOREIGN KEY(exercise_id) REFERENCES exercises(id)
    );

    CREATE TABLE IF NOT EXISTS personal_bests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      exercise_id INTEGER,
      weight REAL,
      reps INTEGER,
      date INTEGER,
      FOREIGN KEY(user_id) REFERENCES users(id),
      FOREIGN KEY(exercise_id) REFERENCES exercises(id)
    );
  `);
}