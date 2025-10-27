import * as SQLite from 'expo-sqlite';

export async function initTrainingAppSchema(db: SQLite.SQLiteDatabase): Promise<void> {
  // Use a transaction for atomic setup
  await db.execAsync(`
    PRAGMA journal_mode = WAL;

    CREATE TABLE IF NOT EXISTS exercises (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL,
      muscle_group TEXT
    );
  `);
}