import React from "react";
import { StyleSheet, Text } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

export default function CreateWorkout() {
  return (
    <SafeAreaProvider>
        <Text style={styles.title}>Create Workout</Text>
        <Text style={styles.sub}>Placeholder page — implement UI here.</Text>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center", padding: 16 },
  title: { fontSize: 20, fontWeight: "700", marginBottom: 8 },
  sub: { color: "#666" },
});