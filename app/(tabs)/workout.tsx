import { Stack } from "expo-router";
import React from "react";
import { StyleSheet, Text } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
export default function Workout() {
  return (
    <SafeAreaProvider>
        <Stack.Screen options={{ title: "Workout" }} />
        <Text style={styles.title}>Workout</Text>
      <Text style={styles.sub}>Placeholder workout screen — implement exercise UI here.</Text>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 22, fontWeight: "800", marginBottom: 8 },
  sub: { color: "#666" },
});