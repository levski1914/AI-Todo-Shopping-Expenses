import React from "react";
import { View, Text, Switch, StyleSheet, ScrollView } from "react-native";

export default function SettingsScreen() {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>⚙️ Настройки</Text>

      <View style={styles.setting}>
        <Text style={styles.label}>🎨 Тъмна тема</Text>
        <Switch value={true} onValueChange={() => {}} />
      </View>

      <View style={styles.setting}>
        <Text style={styles.label}>🗣️ Гласов контрол</Text>
        <Switch value={false} onValueChange={() => {}} />
      </View>

      <View style={styles.setting}>
        <Text style={styles.label}>🔔 Известия</Text>
        <Switch value={true} onValueChange={() => {}} />
      </View>

      <Text style={styles.version}>Версия: 1.0.0</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f172a",
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#facc15",
    marginBottom: 20,
  },
  setting: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#1e293b",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  label: {
    color: "#f1f5f9",
    fontSize: 16,
  },
  version: {
    marginTop: 30,
    color: "#64748b",
    textAlign: "center",
    fontSize: 14,
  },
});
