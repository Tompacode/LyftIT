import React from "react";
import { Button, ScrollView, StyleSheet, Text, View } from "react-native";

export default function App(){
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Welcome to the Training App</Text>
      <Text style={styles.subtitle}>
        This is a simple starter screen. Use the buttons below to begin.
      </Text>

      <View style={styles.actions}>
        <Button title="Get Started" onPress={() => { /* navigate or open feature */ }} />
        <View style={styles.spacer} />
        <Button title="Help" onPress={() => { /* show help */ }} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    alignItems: "stretch",
    justifyContent: "flex-start",
    flexGrow: 1,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 8,
    color: "#111",
  },
  subtitle: {
    fontSize: 16,
    color: "#444",
    marginBottom: 24,
  },
  actions: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  spacer: {
    width: 12,
  },
  status: {
    marginTop: 30,
    alignItems: "center",
  },
  statusText: {
    fontSize: 14,
    fontWeight: "600",
  },
});