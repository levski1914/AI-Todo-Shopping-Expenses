import {
  View,
  Text,
  ScrollView,
  Pressable,
  FlatList,
  TextInput,
  Modal,
} from "react-native";
import React, { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { format, addDays } from "date-fns";
import { useFocusEffect } from "expo-router";

const hours = [
  "08:00",
  "09:00",
  "10:00",
  "11:00",
  "12:00",
  "13:00",
  "14:00",
  "15:00",
  "16:00",
  "17:00",
  "18:00",
  "19:00",
  "20:00",
  "21:00",
];

export default function TasksScreen() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [tasksByDate, setTasksByDate] = useState<any>({});
  const [modalVisible, setModalVisible] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [selectedHour, setSelectedHour] = useState<string | null>(null);

  const daysToShow = Array.from({ length: 7 }, (_, i) =>
    addDays(new Date(), i - 3)
  ); // 3 назад, 3 напред

  const formattedSelectedDate = format(selectedDate, "yyyy-MM-dd");

  useFocusEffect(
    React.useCallback(() => {
      loadTasks(); // зарежда пак задачите при връщане на таба
    }, [])
  );

  async function loadTasks() {
    try {
      const data = await AsyncStorage.getItem("tasksByDate");
      if (data) {
        setTasksByDate(JSON.parse(data));
      }
    } catch (error) {
      console.error("Грешка при зареждане:", error);
    }
  }

  async function saveTask(title: string, priority: string) {
    if (!selectedHour) return;
    const updatedTasks = { ...tasksByDate };

    if (!updatedTasks[formattedSelectedDate]) {
      updatedTasks[formattedSelectedDate] = {};
    }
    if (!updatedTasks[formattedSelectedDate][selectedHour]) {
      updatedTasks[formattedSelectedDate][selectedHour] = [];
    }

    updatedTasks[formattedSelectedDate][selectedHour].push({
      title,
      completed: false,
      status: "todo",
      priority,
    });

    await AsyncStorage.setItem("tasksByDate", JSON.stringify(updatedTasks));
    setTasksByDate(updatedTasks);
    setModalVisible(false);
    setNewTaskTitle("");
    setSelectedHour(null);
  }

  function handleAddTask(hour: string) {
    setSelectedHour(hour);
    setModalVisible(true);
  }
  async function handleDeleteTask(hour: string, taskIndex: number) {
    const updatedTasks = { ...tasksByDate };

    if (
      updatedTasks[formattedSelectedDate] &&
      updatedTasks[formattedSelectedDate][hour]
    ) {
      updatedTasks[formattedSelectedDate][hour].splice(taskIndex, 1); // махаме задачата по индекс

      // ако няма останали задачи за часа – изтриваме и самия час
      if (updatedTasks[formattedSelectedDate][hour].length === 0) {
        delete updatedTasks[formattedSelectedDate][hour];
      }

      // ако няма никакви задачи за деня – изтриваме и деня
      if (Object.keys(updatedTasks[formattedSelectedDate]).length === 0) {
        delete updatedTasks[formattedSelectedDate];
      }

      await AsyncStorage.setItem("tasksByDate", JSON.stringify(updatedTasks));
      setTasksByDate(updatedTasks);
    }
  }
  async function toggleTaskComplete(hour: string, taskIndex: number) {
    const updatedTasks = { ...tasksByDate };
    const task = updatedTasks[formattedSelectedDate][hour][taskIndex];
    task.completed = !task.completed; // сменя completed true/false

    await AsyncStorage.setItem("tasksByDate", JSON.stringify(updatedTasks));
    setTasksByDate(updatedTasks);
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#1A1441", paddingTop: 20 }}>
      {/* Календар */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ paddingHorizontal: 10, marginBottom: 20 }}
      >
        {daysToShow.map((day, index) => {
          const isSelected =
            format(day, "yyyy-MM-dd") === formattedSelectedDate;
          return (
            <Pressable
              key={index}
              onPress={() => setSelectedDate(day)}
              style={{
                backgroundColor: isSelected ? "#4f46e5" : "#2D245A",
                paddingVertical: 20,
                paddingHorizontal: 15,
                borderRadius: 10,
                marginRight: 10,
                marginBottom: 20,
              }}
            >
              <Text
                style={{ color: "white", textAlign: "center", fontSize: 16 }}
              >
                {format(day, "dd/MM")}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* Часове */}
      <FlatList
        data={hours}
        keyExtractor={(item) => item}
        renderItem={({ item: hour }) => (
          <View
            style={{
              backgroundColor: "#2D245A",
              marginHorizontal: 20,
              marginBottom: 10,
              padding: 15,
              borderRadius: 10,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Text style={{ color: "white", fontSize: 18 }}>{hour}</Text>
              <Pressable
                onPress={() => handleAddTask(hour)}
                style={{
                  backgroundColor: "#4f46e5",
                  paddingVertical: 6,
                  paddingHorizontal: 12,
                  borderRadius: 8,
                }}
              >
                <Text style={{ color: "white" }}>➕</Text>
              </Pressable>
            </View>

            {/* Показване на задачите */}
            {tasksByDate[formattedSelectedDate]?.[hour]?.map(
              (task: any, index: number) => (
                <View
                  key={index}
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginTop: 8,
                  }}
                >
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <Pressable onPress={() => toggleTaskComplete(hour, index)}>
                      <Text style={{ fontSize: 18, marginRight: 8 }}>
                        {task.completed ? "✅" : "☑️"}
                      </Text>
                    </Pressable>
                    <Text
                      style={{
                        color: task.completed ? "#6b7280" : "#d1d5db",
                        fontSize: 16,
                        textDecorationLine: task.completed
                          ? "line-through"
                          : "none",
                      }}
                    >
                      {task.title}
                    </Text>
                  </View>
                  <Pressable onPress={() => handleDeleteTask(hour, index)}>
                    <Text style={{ color: "red", fontSize: 16 }}>🗑️</Text>
                  </Pressable>
                </View>
              )
            )}
          </View>
        )}
      />

      {/* Модал за нова задача */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "rgba(0,0,0,0.5)",
          }}
        >
          <View
            style={{
              backgroundColor: "#1E1B4B",
              padding: 20,
              borderRadius: 12,
              width: "80%",
              position: "relative",
            }}
          >
            {/* Бутон Х за затваряне */}
            <Pressable
              onPress={() => {
                setModalVisible(false);
                setNewTaskTitle("");
                setSelectedHour(null);
              }}
              style={{
                position: "absolute",
                top: 10,
                right: 10,
                padding: 5,
              }}
            >
              <Text style={{ color: "white", fontSize: 20 }}>✖️</Text>
            </Pressable>

            <Text
              style={{
                color: "white",
                fontSize: 20,
                marginBottom: 15,
                textAlign: "center",
              }}
            >
              ➕ Нова задача за {selectedHour}
            </Text>

            {/* Input и бутона за запазване */}
            <TextInput
              placeholder="Име на задачата..."
              placeholderTextColor="#9ca3af"
              value={newTaskTitle}
              onChangeText={setNewTaskTitle}
              style={{
                backgroundColor: "#2D245A",
                color: "white",
                fontSize: 18,
                padding: 10,
                borderRadius: 10,
                marginBottom: 20,
              }}
            />

            <Pressable
              onPress={() => saveTask(newTaskTitle)}
              style={{
                backgroundColor: "#4f46e5",
                paddingVertical: 12,
                borderRadius: 10,
                alignItems: "center",
              }}
            >
              <Text style={{ color: "white", fontSize: 18 }}>✅ Запази</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}
