import React from "react";
import { FlatList, StyleSheet, Text } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
export default function Exercises() {
  const sample = [{ id: "1", name: "Squat" }, { id: "2", name: "Bench Press" }];

  return (
    <SafeAreaProvider>
      <Text style={styles.title}>Exercises</Text>
      <FlatList
        data={sample}
        keyExtractor={(i) => i.id}
        renderItem={({ item }) => <Text style={styles.item}>{item.name}</Text>}
        ListEmptyComponent={<Text style={styles.sub}>No exercises yet</Text>}
      />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 20, fontWeight: "700", marginBottom: 12 },
  item: { paddingVertical: 10, fontSize: 16 },
  sub: { color: "#666" },
});