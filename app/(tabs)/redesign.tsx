import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  Alert,
} from "react-native";
import { addDays, format, isBefore, isEqual } from "date-fns";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Link, useFocusEffect } from "expo-router";
import AddTaskModal from "../tasks/TaskModal";
import { startOfDay } from "date-fns";
import { formatWithOptions } from "date-fns/fp";
import { bg } from "date-fns/locale";
import { migrateUnfinishedTasks } from "../tasks/migrateOldTasks";
import Voice from "@react-native-voice/voice";
import { useTheme } from "../settings/ThemeContext";

export default function TasksScreenRedesign() {
  const [modalVisible, setModalVisible] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [tasks, setTasks] = useState([]);
  const [stats, setStats] = useState({ todo: 0, inprogress: 0, done: 0 });

  const formatWithLocale = formatWithOptions({ locale: bg });
  const formattedDate = formatWithLocale("EEEE, dd MMMM yyyy", selectedDate);

  const { theme } = useTheme();
  const isDark = theme === "dark";
  const themedStyles = getThemedStyles(isDark);

  useFocusEffect(
    React.useCallback(() => {
      migrateUnfinishedTasks().then(loadTasks);
    }, [selectedDate])
  );

  // useEffect(() => {
  //   Voice.onSpeechResults = onSpeechResultsHandler;
  //   Voice.onSpeechError = onSpeechErrorHandler;
  //   return () => Voice.destroy().then(Voice.removeAllListeners);
  // }, []);

  // const onSpeechResultsHandler = (event) => {
  //   const spokenText = event.value?.[0] ?? "Нова задача";
  //   handleSaveTask(
  //     {
  //       title: spokenText,
  //       time: format(new Date(), "HH:mm"),
  //       priority: "medium",
  //       status: "todo",
  //       repeatType: "none",
  //     },
  //     false
  //   );
  // };

  // const onSpeechErrorHandler = (event) => {
  //   console.error("Грешка при гласово разпознаване:", event.error);
  // };

  const loadTasks = async () => {
    try {
      const data = await AsyncStorage.getItem("tasksByDate");
      if (!data) return;
      const all = JSON.parse(data);
      const dateKey = format(selectedDate, "yyyy-MM-dd");
      const dayTasks = all[dateKey] || {};
      const flatList = [];

      for (const hour in dayTasks) {
        for (const task of dayTasks[hour]) {
          flatList.push({ ...task, time: hour });
        }
      }

      const stat = flatList.reduce(
        (acc, task) => {
          acc[task.status] = (acc[task.status] || 0) + 1;
          return acc;
        },
        { todo: 0, inprogress: 0, done: 0 }
      );

      setTasks(flatList.sort((a, b) => a.time.localeCompare(b.time)));
      setStats(stat);
    } catch (err) {
      console.error("Грешка при зареждане на задачи", err);
    }
  };

  const handleSaveTask = async (task, isEdit, oldTask) => {
    const data = await AsyncStorage.getItem("tasksByDate");
    const all = data ? JSON.parse(data) : {};
    const startDate = selectedDate;
    const endDate = task.repeatUntil
      ? new Date(task.repeatUntil)
      : selectedDate;

    const addTaskToDay = (date) => {
      const dateKey = format(date, "yyyy-MM-dd");
      if (!all[dateKey]) all[dateKey] = {};
      if (isEdit && oldTask) {
        all[dateKey][oldTask.time] = (all[dateKey][oldTask.time] || []).filter(
          (t) => t.title !== oldTask.title
        );
      }
      all[dateKey][task.time] = [...(all[dateKey][task.time] || []), task];
    };

    if (task.repeatType === "none") {
      addTaskToDay(startDate);
    } else {
      let current = new Date(startDate);
      while (
        isBefore(startOfDay(current), startOfDay(endDate)) ||
        isEqual(startOfDay(current), startOfDay(endDate))
      ) {
        const isMatch =
          task.repeatType === "daily" ||
          (task.repeatType === "weekly" &&
            current.getDay() === startDate.getDay());
        if (isMatch) addTaskToDay(current);
        current = addDays(current, 1);
      }
    }

    await AsyncStorage.setItem("tasksByDate", JSON.stringify(all));
    await loadTasks();
    setModalVisible(false);
    setEditingTask(null);
  };

  const handleDeleteTask = (task) => {
    Alert.alert("Изтриване", "Как искаш да изтриеш задачата?", [
      { text: "Отказ", style: "cancel" },
      { text: "Само тази поява", onPress: () => deleteTask("single", task) },
      {
        text: "Всички повторения",
        style: "destructive",
        onPress: () => deleteTask("all", task),
      },
    ]);
  };

  const deleteTask = async (type, task) => {
    const data = await AsyncStorage.getItem("tasksByDate");
    if (!data) return;
    const all = JSON.parse(data);
    const fromDate = new Date(selectedDate);

    for (const dateKey in all) {
      const date = new Date(dateKey);
      const isSameDay =
        format(date, "yyyy-MM-dd") === format(fromDate, "yyyy-MM-dd");
      if (
        (type === "single" && isSameDay) ||
        (type === "all" &&
          (!task.repeatUntil || date <= new Date(task.repeatUntil)))
      ) {
        all[dateKey][task.time] = (all[dateKey][task.time] || []).filter(
          (t) => t.title !== task.title || t.time !== task.time
        );
        if (all[dateKey][task.time].length === 0)
          delete all[dateKey][task.time];
        if (Object.keys(all[dateKey]).length === 0) delete all[dateKey];
      }
    }
    await AsyncStorage.setItem("tasksByDate", JSON.stringify(all));
    await loadTasks();
  };

  return (
    <View style={themedStyles.container}>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <View>
          <Text style={themedStyles.headerTitle}>📅 Моите задачи</Text>
          <Text style={themedStyles.headerSubtitle}>{formattedDate}</Text>
        </View>
        <Link href="/settings" asChild>
          <Pressable>
            <Text style={{ color: "#94a3b8", fontSize: 24 }}>⚙️</Text>
          </Pressable>
        </Link>
      </View>
      <View style={themedStyles.calendarRow}>
        <Pressable onPress={() => setSelectedDate(addDays(selectedDate, -1))}>
          <Text style={themedStyles.arrow}>←</Text>
        </Pressable>
        <Text style={themedStyles.calendarDate}>{formattedDate}</Text>
        <Pressable onPress={() => setSelectedDate(addDays(selectedDate, 1))}>
          <Text style={themedStyles.arrow}>→</Text>
        </Pressable>
      </View>

      <Pressable onPress={() => Voice.start("bg-BG")} style={{ marginTop: 20 }}>
        <Text style={{ fontSize: 18, color: isDark ? "#60a5fa" : "#4f46e5" }}>
          🎤 Добави задача с глас
        </Text>
      </Pressable>

      <View style={themedStyles.statusContainer}>
        <StatusCard title="Да направя" count={stats.todo} color="#f87171" />
        <StatusCard
          title="В прогрес"
          count={stats.inprogress}
          color="#facc15"
        />
        <StatusCard title="Завършени" count={stats.done} color="#60a5fa" />
      </View>

      <Pressable
        onPress={() => setModalVisible(true)}
        style={{ marginTop: 20 }}
      >
        <Text style={{ fontSize: 18, color: isDark ? "#60a5fa" : "#4f46e5" }}>
          ➕ Добави задача
        </Text>
      </Pressable>

      <ScrollView style={{ marginTop: 20 }}>
        {tasks.map((task, index) => (
          <View key={index} style={themedStyles.taskItem}>
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 10 }}
            >
              <View
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: 6,
                  backgroundColor:
                    task.priority === "high"
                      ? "#ef4444"
                      : task.priority === "medium"
                      ? "#facc15"
                      : "#22c55e",
                }}
              />
              <View>
                <Text style={themedStyles.taskTime}>{task.time}</Text>
                <Text style={themedStyles.taskTitle}>{task.title}</Text>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>

      <AddTaskModal
        visible={modalVisible}
        onClose={() => {
          setModalVisible(false);
          setEditingTask(null);
        }}
        onSave={handleSaveTask}
        taskToEdit={editingTask}
      />
    </View>
  );
}

function StatusCard({ title, count, color }) {
  return (
    <View style={[styles.statusCard, { backgroundColor: color }]}>
      <Text style={styles.statusTitle}>{title}</Text>
      <Text style={styles.statusCount}>{count}</Text>
    </View>
  );
}

const getThemedStyles = (isDark) =>
  StyleSheet.create({
    container: {
      flex: 1,
      padding: 20,
      backgroundColor: isDark ? "#0f172a" : "#fef3c7",
    },
    headerTitle: {
      fontSize: 28,
      fontWeight: "bold",
      color: isDark ? "#facc15" : "#1f2937",
      marginTop: 20,
    },
    headerSubtitle: {
      fontSize: 16,
      color: isDark ? "#94a3b8" : "#6b7280",
    },
    calendarRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginTop: 10,
      marginBottom: 10,
    },
    calendarDate: {
      fontSize: 16,
      color: isDark ? "#e2e8f0" : "#4b5563",
      fontWeight: "bold",
    },
    arrow: {
      fontSize: 22,
      color: isDark ? "#60a5fa" : "#4f46e5",
      paddingHorizontal: 12,
    },
    statusContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      gap: 5,
    },
    taskItem: {
      backgroundColor: isDark ? "#1e293b" : "white",
      padding: 16,
      borderRadius: 14,
      marginBottom: 12,
    },
    taskTime: {
      fontSize: 14,
      color: isDark ? "#94a3b8" : "#9ca3af",
    },
    taskTitle: {
      fontSize: 18,
      color: isDark ? "#f8fafc" : "#1f2937",
      fontWeight: "600",
    },
  });

const styles = StyleSheet.create({
  statusCard: {
    flex: 1,
    padding: 13,
    borderRadius: 16,
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "white",
    marginBottom: 6,
  },
  statusCount: {
    fontSize: 20,
    color: "white",
    textAlign: "center",
    fontWeight: "800",
  },
});
