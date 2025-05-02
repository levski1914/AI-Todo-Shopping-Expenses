import { View, Text, Switch, StyleSheet, Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import { useTheme } from "../settings/ThemeContext";

export default function SettingsScreen() {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  const { theme, toggleTheme } = useTheme();
  const darkMode = theme === "dark";
  useEffect(() => {
    loadSettings();
  }, []);

  async function loadSettings() {
    try {
      const notif = await AsyncStorage.getItem("settings.notifications");
      if (notif !== null) setNotificationsEnabled(JSON.parse(notif));
    } catch (err) {
      Alert.alert("Грешка", "Неуспешно зареждане на настройки.");
    }
  }

  async function saveSetting(key: string, value: boolean) {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(value));
    } catch (err) {
      Alert.alert("Грешка", "Неуспешно запазване.");
    }
  }

  const toggleNotifications = () => {
    const newValue = !notificationsEnabled;
    setNotificationsEnabled(newValue);
    saveSetting("settings.notifications", newValue);
  };

  const themeStyles = darkMode ? darkTheme : lightTheme;

  return (
    <View style={[styles.container, themeStyles.container]}>
      <Text style={[styles.title, themeStyles.text]}>⚙️ Настройки</Text>

      <View style={styles.row}>
        <Text style={[styles.label, themeStyles.text]}>Уведомления</Text>
        <Switch
          value={notificationsEnabled}
          onValueChange={toggleNotifications}
        />
      </View>

      <View style={styles.row}>
        <Text style={[styles.label, themeStyles.text]}>Тъмна тема</Text>
        <Switch value={darkMode} onValueChange={toggleTheme} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: "#e5e7eb",
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
  },
});

const lightTheme = StyleSheet.create({
  container: {
    backgroundColor: "#fef3c7",
  },
  text: {
    color: "#1f2937",
  },
});

const darkTheme = StyleSheet.create({
  container: {
    backgroundColor: "#1f2937",
  },
  text: {
    color: "#fef3c7",
  },
});
