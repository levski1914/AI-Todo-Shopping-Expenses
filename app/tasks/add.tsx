import { useState } from "react";
import { View, Text, TextInput, Pressable, Alert } from "react-native";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function AddTaskScreen() {
  const [title, setTitle] = useState("");

  async function handleAddTask() {
    if (!title.trim()) {
      Alert.alert("Грешка", "Моля, въведете заглавие на задачата.");
      return;
    }

    try {
      const tasksData = await AsyncStorage.getItem("tasks");
      const currentTasks = tasksData ? JSON.parse(tasksData) : [];

      const newTask = {
        title: title.trim(),
        createdAt: new Date().toISOString(),
      };

      const updatedTasks = [...currentTasks, newTask];
      await AsyncStorage.setItem("tasks", JSON.stringify(updatedTasks));

      setTitle(""); // <== Изчистваме input-а
      router.replace("/tasks"); // <== Отиваме към задачите
    } catch (error) {
      console.error("Грешка при добавяне на задача:", error);
      Alert.alert("Грешка", "Неуспешно запазване на задачата.");
    }
  }

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "#1A1441",
        padding: 20,
        justifyContent: "center",
      }}
    >
      <Text
        style={{
          fontSize: 32,
          fontWeight: "bold",
          color: "white",
          textAlign: "center",
          marginBottom: 30,
        }}
      >
        ➕ Нова Задача
      </Text>

      <TextInput
        placeholder="Въведете заглавие..."
        placeholderTextColor="#9ca3af"
        style={{
          backgroundColor: "#2D245A",
          color: "white",
          fontSize: 18,
          padding: 15,
          borderRadius: 12,
          marginBottom: 20,
        }}
        value={title}
        onChangeText={setTitle}
      />

      <Pressable
        onPress={handleAddTask}
        style={({ pressed }) => ({
          backgroundColor: pressed ? "#4338ca" : "#4f46e5",
          paddingVertical: 15,
          borderRadius: 12,
          alignItems: "center",
        })}
      >
        <Text style={{ color: "white", fontSize: 18 }}>✅ Добави</Text>
      </Pressable>
    </View>
  );
}
