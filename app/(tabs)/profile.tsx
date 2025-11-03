import React from "react";
import { StyleSheet, Text } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
export default function Profile() {
  return (
    <SafeAreaProvider>
        <Text style={styles.title}>Profile</Text>
        <Text style={styles.sub}>Placeholder profile / settings screen.</Text>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center" },
  title: { fontSize: 20, fontWeight: "700" },
  sub: { color: "#666", marginTop: 8 },
});