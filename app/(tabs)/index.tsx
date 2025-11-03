import { router, Stack, useFocusEffect } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import React from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type ExerciseType = {
  id: number;
  name: string;
  muscle_group?: string | null;
};

export default function TabHome() {
  const [loading, setLoading] = React.useState(true);
  const [exCount, setExCount] = React.useState<number | null>(null);
  const [activeWorkoutName, setActiveWorkoutName] = React.useState<string | null>(null);

  const database = useSQLiteContext();

  // safe getAll helper: supports getAllAsync returning nested arrays, or raw expo-sqlite
  const dbGetAll = async <T,>(sql: string): Promise<T[]> => {
    try {
      if (database && typeof (database as any).getAllAsync === "function") {
        const res = await (database as any).getAllAsync(sql) as any;
        return Array.isArray(res) ? (res.flat() as T[]) : (res as T[]);
      }

      // fallback to raw transaction (expo-sqlite Database)
      return await new Promise<T[]>((resolve, reject) => {
        (database as any).transaction((tx: any) => {
          tx.executeSql(
            sql,
            [],
            (_t: any, rs: any) => {
              const out: T[] = [];
              for (let i = 0; i < rs.rows.length; i++) out.push(rs.rows.item(i));
              resolve(out);
            },
            (_t: any, err: any) => {
              reject(err);
              return false;
            }
          );
        }, reject);
      });
    } catch (err) {
      console.warn("dbGetAll failed:", err);
      return [];
    }
  };

  const loadData = React.useCallback(async () => {
    setLoading(true);
    try {
      // count exercises (fast)
      const exRows = await dbGetAll<{ cnt: number }>("SELECT COUNT(*) as cnt FROM exercises");
      setExCount(exRows[0]?.cnt ?? 0);

      // attempt to find an "active" workout (adjust query to your schema)
      // This assumes you have a workouts table and maybe a flag; change as needed.
      const w = await dbGetAll<{ id: number; name: string }>(
        "SELECT id, name FROM workouts WHERE id IS NOT NULL LIMIT 1"
      );
      setActiveWorkoutName(w[0]?.name ?? null);
    } catch (err) {
      console.error("loadData error", err);
      setExCount(0);
      setActiveWorkoutName(null);
    } finally {
      setLoading(false);
    }
  }, [database]);

  useFocusEffect(
    React.useCallback(() => {
      loadData();
    }, [loadData])
  );

  const QuickCard = ({ title, subtitle, emoji, onPress }: { title: string; subtitle?: string; emoji?: string; onPress: () => void }) => (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View style={styles.cardTop}>
        <Text style={styles.emoji}>{emoji ?? "🏋️"}</Text>
      </View>
      <Text style={styles.cardTitle}>{title}</Text>
      {subtitle ? <Text style={styles.cardSub}>{subtitle}</Text> : null}
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.screenCenter}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: "LyftIT" }} />
      {activeWorkoutName ? (
        <View style={styles.activeCard}>
          <Text style={styles.activeLabel}>Active Workout</Text>
          <Text style={styles.activeName}>{activeWorkoutName}</Text>
          <TouchableOpacity
            onPress={() => router.push("/workout")}
            style={styles.continueButton}
          >
            <Text style={styles.continueText}>Continue Workout</Text>
          </TouchableOpacity>
        </View>
      ) : null}

      <Text style={styles.sectionTitle}>Quick Actions</Text>

      <View style={styles.grid}>
        <QuickCard
          title="Start Workout"
          subtitle="Choose a plan"
          emoji="▶️"
          onPress={() => router.push("/workoutSelection")}
        />
        <QuickCard
          title="Custom Workout"
          subtitle="Create your own"
          emoji="+"
          onPress={() => router.push("/createWorkout")}
        />
        <QuickCard
          title="Browse Exercises"
          subtitle={exCount !== null ? `${exCount} exercises` : undefined}
          emoji="🏋️‍♂️"
          onPress={() => router.push("/exercises")}
        />
        <QuickCard
          title="Profile"
          subtitle="Settings & progress"
          emoji="👤"
          onPress={() => router.push("/profile")}
        />
      </View>

      {/* Optional: small preview list of exercises (show first 5) */}
      <Text style={[styles.sectionTitle, { marginTop: 12 }]}>Exercises Preview</Text>
      <FlatList<ExerciseType>
        data={[]} // keep empty or load a preview via dbGetAll("SELECT id,name,muscle_group FROM exercises LIMIT 5")
        ListEmptyComponent={<Text style={styles.previewEmpty}>Tap "Browse Exercises" to view all</Text>}
        keyExtractor={(it) => String(it.id)}
        renderItem={() => null}
        contentContainerStyle={{ paddingBottom: 120 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#f3f4f6" },
  screenCenter: { flex: 1, justifyContent: "center", alignItems: "center" },
  activeCard: {
    backgroundColor: "#dbeafe",
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 6,
  },
  activeLabel: { fontWeight: "700", color: "#1f2937", marginBottom: 6 },
  activeName: { fontSize: 18, fontWeight: "700", marginBottom: 12 },
  continueButton: {
    backgroundColor: "#fff",
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  continueText: { color: "#1f2937", fontWeight: "600" },

  sectionTitle: { fontSize: 18, fontWeight: "800", marginBottom: 12 },

  grid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" },
  card: {
    width: "48%",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    minHeight: 110,
    justifyContent: "flex-start",
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 6,
  },
  cardTop: { flexDirection: "row", justifyContent: "flex-end" },
  emoji: { fontSize: 22 },
  cardTitle: { fontSize: 16, fontWeight: "700", marginTop: 8 },
  cardSub: { color: "#6b7280", marginTop: 6 },

  previewEmpty: { color: "#6b7280", paddingHorizontal: 6 },
});