import { View, Text, Pressable, ScrollView } from "react-native";
import { Link, useFocusEffect } from "expo-router";
import React, { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { format } from "date-fns";
import { SafeAreaView } from "react-native";
import { StatusBar, Platform } from "react-native";
import { ThemeProvider } from "../settings/ThemeContext";

export default function HomeScreen() {
  const [tasks, setTasks] = useState([]);
  const [shoppingItems, setShoppingItems] = useState([]);
  const [expenses, setExpenses] = useState<{ amount: number; date: string }[]>(
    []
  );

  useFocusEffect(
    React.useCallback(() => {
      loadData();
    }, [])
  );

  async function loadData() {
    try {
      const tasksData = await AsyncStorage.getItem("tasksByDate");
      const shoppingData = await AsyncStorage.getItem("shopping");
      const expensesData = await AsyncStorage.getItem("expenses");

      if (tasksData) setTasks(JSON.parse(tasksData));
      if (shoppingData) setShoppingItems(JSON.parse(shoppingData));
      if (expensesData) setExpenses(JSON.parse(expensesData));
    } catch (error) {
      console.error("Грешка при зареждане на данни:", error);
    }
  }

  function countTotalTasks(data: any) {
    let total = 0;
    for (const date in data) {
      for (const hour in data[date]) {
        total += data[date][hour].length;
      }
    }
    return total;
  }

  function getTodayTasks(data: any) {
    const todayKey = format(new Date(), "yyyy-MM-dd");
    let total = 0,
      done = 0;
    if (!data[todayKey]) return { total: 0, done: 0 };
    for (const hour in data[todayKey]) {
      const list = data[todayKey][hour];
      total += list.length;
      done += list.filter((t: any) => t.status === "done").length;
    }
    return { total, done };
  }

  const today = new Date();
  const { total, done } = getTodayTasks(tasks);
  const todayExpenses = expenses.filter(
    (e) => e.date === format(today, "yyyy-MM-dd")
  );
  const totalTodaySpent = todayExpenses.reduce(
    (sum, e) => sum + Number(e.amount),
    0
  );

  return (
    <ThemeProvider>
      <SafeAreaView
        style={{
          flex: 1,
          backgroundColor: "#0f172a",
          paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
        }}
      >
        <ScrollView contentContainerStyle={{ padding: 20 }}>
          {/* Настройки и заглавие */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Text
              style={{ fontSize: 28, fontWeight: "bold", color: "#facc15" }}
            >
              🤖 Todo AI
            </Text>
            <Link href="/settings" asChild>
              <Pressable>
                <Text style={{ color: "#94a3b8", fontSize: 24 }}>⚙️</Text>
              </Pressable>
            </Link>
          </View>

          {/* Подзаглавие */}
          <Text style={{ color: "#94a3b8", marginTop: 4, marginBottom: 16 }}>
            Добре дошъл! Ето какво те чака днес:
          </Text>

          {/* "Днес" секция */}
          <View style={infoBox}>
            <Text style={infoTitle}>📅 Днес</Text>
            <Text style={infoLine}>
              • Задачи: {done}/{total}
            </Text>
            <Text style={infoLine}>
              • Продукти за пазаруване: {shoppingItems.length}
            </Text>
            <Text style={infoLine}>
              • Изхарчено днес: {totalTodaySpent.toFixed(2)} лв.
            </Text>
          </View>

          {/* Бърз бутон */}
          <Pressable style={addButton}>
            <Text style={{ color: "white", fontWeight: "bold" }}>
              ➕ Добави задача
            </Text>
          </Pressable>

          {/* Модули */}
          <View style={{ gap: 16, marginTop: 16 }}>
            <Link href="/redesign" asChild>
              <Pressable style={cardStyle}>
                <Text style={cardTitle}>📋 Задачи</Text>
                <Text style={cardText}>
                  {countTotalTasks(tasks)} общо задачи
                </Text>
              </Pressable>
            </Link>

            <Link href="/shopping" asChild>
              <Pressable style={cardStyle}>
                <Text style={cardTitle}>🛍️ Пазаруване</Text>
                <Text style={cardText}>
                  {shoppingItems.length > 0
                    ? `${shoppingItems.length} продукта`
                    : "Няма активен списък"}
                </Text>
              </Pressable>
            </Link>

            <Link href="/expenses" asChild>
              <Pressable style={cardStyle}>
                <Text style={cardTitle}>💵 Разходи</Text>
                <Text style={cardText}>
                  Общо разходи:{" "}
                  {expenses
                    .reduce((sum, e) => sum + Number(e.amount), 0)
                    .toFixed(2)}{" "}
                  лв.
                </Text>
              </Pressable>
            </Link>
          </View>

          {/* Асистент подсказка */}
          <View style={{ marginTop: 32, alignItems: "center" }}>
            <Text style={{ color: "#38bdf8", fontSize: 14 }}>
              🗣️ Кажи: „Напомни ми да платя сметката в 18:00“
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </ThemeProvider>
  );
}

const cardStyle = {
  backgroundColor: "#1e293b",
  padding: 20,
  borderRadius: 16,
  shadowColor: "#000",
  shadowOpacity: 0.2,
  shadowRadius: 8,
  elevation: 4,
};

const cardTitle = {
  fontSize: 20,
  color: "#f1f5f9",
  fontWeight: "bold",
  marginBottom: 6,
};

const cardText = {
  fontSize: 14,
  color: "#94a3b8",
};

const infoBox = {
  backgroundColor: "#1e40af",
  padding: 16,
  borderRadius: 14,
  marginBottom: 20,
};

const infoTitle = {
  color: "#facc15",
  fontSize: 16,
  fontWeight: "bold",
  marginBottom: 6,
};

const infoLine = {
  color: "#e2e8f0",
  fontSize: 14,
};

const addButton = {
  backgroundColor: "#10b981",
  paddingVertical: 12,
  borderRadius: 12,
  alignItems: "center",
  marginBottom: 20,
};
