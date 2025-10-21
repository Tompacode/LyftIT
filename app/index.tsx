import * as SQLite from 'expo-sqlite';
import React, { useEffect, useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { initTrainingAppSchema } from '../lib/db-init'; // adjust path as needed

export default function Index() {
  const [tableData, setTableData] = useState<Record<string, any[]>>({});

  useEffect(() => {
    (async () => {
      const db = await SQLite.openDatabaseAsync("lyftit.db");
      await initTrainingAppSchema(db);

      // Demo: Insert a row in each table if empty
      await db.runAsync(
        `INSERT OR IGNORE INTO exercises (name, description, muscle_group) VALUES (?, ?, ?)`,
        'Bench Press', 'Barbell bench press', 'Chest'
      );
      await db.runAsync(
        `INSERT OR IGNORE INTO users (id, name) VALUES (?, ?)`,
        1, 'Alice',    
        2, 'Bob',
        3, 'Charlie'
      );
      await db.runAsync(
        `INSERT OR IGNORE INTO workouts (id, user_id, name, created_at) VALUES (?, ?, ?, ?)`,
        1, 1, 'Push Day', Date.now()
      );
      await db.runAsync(
        `INSERT OR IGNORE INTO workout_exercises (id, workout_id, exercise_id, [order], reps, weight) VALUES (?, ?, ?, ?, ?, ?)`,
        1, 1, 1, 1, 10, 60
      );
      await db.runAsync(
        `INSERT OR IGNORE INTO personal_bests (id, user_id, exercise_id, weight, reps, date) VALUES (?, ?, ?, ?, ?, ?)`,
        1, 1, 1, 100, 5, Date.now()
      );

      // Query only requested fields
      const data: Record<string, any[]> = {};
      data["exercises"] = await db.getAllAsync(
        `SELECT description FROM exercises`
      );
      data["users"] = await db.getAllAsync(
        `SELECT name FROM users`
      );
      data["workouts"] = await db.getAllAsync(
        `SELECT name FROM workouts`
      );
      data["workout_exercises"] = await db.getAllAsync(
        `SELECT reps, weight FROM workout_exercises`
      );
      data["personal_bests"] = await db.getAllAsync(
        `SELECT pb.weight, pb.reps, e.name as exercise_name
         FROM personal_bests pb
         LEFT JOIN exercises e ON pb.exercise_id = e.id`
      );
      setTableData(data);
    })();
  }, []);

  const TABLES = [
    { name: "exercises", label: "Exercises", fields: ["description"] },
    { name: "users", label: "Users", fields: ["name"] },
    { name: "workouts", label: "Workouts", fields: ["name"] },
    { name: "workout_exercises", label: "Workout Exercises", fields: ["reps", "weight"] },
    { name: "personal_bests", label: "Personal Bests", fields: ["weight", "reps", "exercise_name"] },
  ];

  return (
    <ScrollView style={{ flex: 1, padding: 16, backgroundColor: "#fff" }}>
      {TABLES.map(({ name, label, fields }) => (
        <View key={name} style={{ marginBottom: 24 }}>
          <Text style={{ fontWeight: "bold", fontSize: 18, marginBottom: 8 }}>
            {label}
          </Text>
          {tableData[name] && tableData[name].length > 0 ? (
            tableData[name].map((row, idx) => (
              <Text
                key={idx}
                style={{
                  fontFamily: "monospace",
                  backgroundColor: "#f6f6f6",
                  padding: 8,
                  marginBottom: 4,
                  borderRadius: 4,
                }}
              >
                {fields.map(f => `${f}: ${row[f]}`).join(" | ")}
              </Text>
            ))
          ) : (
            <Text style={{ color: "#888" }}>No rows</Text>
          )}
        </View>
      ))}
    </ScrollView>
  );
}