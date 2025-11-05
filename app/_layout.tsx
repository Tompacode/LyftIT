import { Stack } from 'expo-router';
import { SQLiteDatabase, SQLiteProvider } from 'expo-sqlite';

export default function Layout() {
  const createDbIfNeeded = async (db: SQLiteDatabase) => {
    await db.execAsync(
      "CREATE TABLE IF NOT EXISTS exercises (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT UNIQUE NOT NULL, muscle_group TEXT);"
    );
    await db.execAsync(
      "CREATE TABLE IF NOT EXISTS workouts (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT UNIQUE NOT NULL);"
    );
  };
  
  return (
    <SQLiteProvider databaseName='testerdb.db' onInit={createDbIfNeeded}>
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="exercises" options={{ presentation: 'modal'}} />
    </Stack>
    </SQLiteProvider>
  );
}
