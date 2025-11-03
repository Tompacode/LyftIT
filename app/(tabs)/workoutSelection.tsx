import React from "react";
import { StyleSheet, Text } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
/**
 * Some layouts expect a child route named "workoutPage".
 * Add this placeholder if your _layout.tsx references that route.
 */
export default function WorkoutPage() {
  return (
    <SafeAreaProvider>
      <Text style={styles.title}>Workout Page</Text>
      <Text style={styles.sub}>Placeholder for layout-referenced route "workoutPage".</Text>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center" },
  title: { fontSize: 20, fontWeight: "700" },
  sub: { color: "#666", marginTop: 8 },
});
