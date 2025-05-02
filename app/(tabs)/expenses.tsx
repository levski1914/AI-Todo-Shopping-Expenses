import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  FlatList,
  StyleSheet,
  Platform,
  ScrollView,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { format } from "date-fns";
import { Picker } from "@react-native-picker/picker";
import { SafeAreaView } from "react-native";
import { Calendar } from "react-native-calendars";
import { Link } from "expo-router";
import { useTheme } from "../settings/ThemeContext";
export default function ExpensesScreen() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [editAmount, setEditAmount] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editDate, setEditDate] = useState(new Date());
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [modalCalendarVisible, setModalCalendarVisible] = useState(false);
  const [category, setCategory] = useState("Други");
  const [editCategory, setEditCategory] = useState("Други");
  const [filterCategory, setFilterCategory] = useState("Всички");
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const styles = isDark ? darkStyles : lightStyles;

  useEffect(() => {
    loadExpenses();
  }, []);

  useEffect(() => {
    AsyncStorage.setItem("expenses", JSON.stringify(expenses));
  }, [expenses]);

  interface Expense {
    amount: number;
    description: string;
    category: string;
    date: string;
  }

  function openEditModal(index: number) {
    const expense: Expense = expenses[index];
    setEditIndex(index);
    setEditAmount(expense.amount.toString());
    setEditDescription(expense.description);
    setEditDate(new Date(expense.date));
    setEditCategory(expense.category);
    setEditModalVisible(true);
  }

  function saveEditedExpense() {
    if (editIndex === null) return;

    const updated = [...expenses];
    updated[editIndex] = {
      amount: parseFloat(editAmount),
      description: editDescription,
      category: editCategory,
      date: format(editDate, "yyyy-MM-dd"),
    };

    setExpenses(updated);
    setEditModalVisible(false);
    setEditIndex(null);
    setEditCategory("");
  }

  const loadExpenses = async () => {
    const data = await AsyncStorage.getItem("expenses");
    if (data) setExpenses(JSON.parse(data));
  };

  const addExpense = () => {
    if (!amount || !description) return;
    const newExpense = {
      amount: parseFloat(amount),
      description,
      category,
      date: format(date, "yyyy-MM-dd"),
    };
    setExpenses([...expenses, newExpense]);
    setAmount("");
    setDescription("");
    setDate(new Date());
  };

  const todayKey = format(date, "yyyy-MM-dd");
  const todayExpenses = expenses.filter((e) => {
    const isSameDay = e.date === todayKey;
    const isMatchingCategory =
      filterCategory === "Всички" || e.category === filterCategory;
    return isSameDay && isMatchingCategory;
  });

  const total = todayExpenses.reduce((sum, e) => sum + e.amount, 0);

  const markedDates: Record<
    string,
    {
      marked?: boolean;
      dotColor?: string;
      selected?: boolean;
      selectedColor?: string;
    }
  > = expenses.reduce(
    (acc: Record<string, { marked?: boolean; dotColor?: string }>, curr) => {
      acc[curr.date] = {
        marked: true,
        dotColor: "#10b981",
      };
      return acc;
    },
    {}
  );

  markedDates[todayKey] = {
    ...(markedDates[todayKey] || {}),
    selected: true,
    selectedColor: "#60a5fa",
  };

  function deleteExpense(indexToDelete: number): void {
    const updated: Expense[] = expenses.filter((_, i) => i !== indexToDelete);
    setExpenses(updated);
    AsyncStorage.setItem("expenses", JSON.stringify(updated));
  }
  const getCategoryColor = (category: string) => {
    switch (category) {
      case "Храна":
        return "#10b981"; // зелено
      case "Транспорт":
        return "#facc15"; // жълто
      case "Сметки":
        return "#ef4444"; // червено
      case "Забавления":
        return "#6366f1"; // лилаво
      case "Други":
      default:
        return "#94a3b8"; // сиво
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Text style={styles.title}>💵 Разходи</Text>
          <Link href="/settings" asChild>
            <Pressable>
              <Text style={{ color: "#94a3b8", fontSize: 24 }}>⚙️</Text>
            </Pressable>
          </Link>
        </View>
        <Pressable
          onPress={() => setModalCalendarVisible(true)}
          style={[styles.input, { justifyContent: "center", marginBottom: 12 }]}
        >
          <Text>📅 {format(date, "yyyy-MM-dd")}</Text>
        </Pressable>

        <View style={styles.card}>
          <TextInput
            value={description}
            onChangeText={setDescription}
            placeholder="Описание"
            style={styles.input}
          />
          <TextInput
            value={amount}
            onChangeText={setAmount}
            placeholder="Сума"
            keyboardType="numeric"
            style={styles.input}
          />
          <Pressable
            style={[styles.input, { justifyContent: "center" }]}
            onPress={() => setShowPicker(true)}
          >
            <Text>{format(date, "yyyy-MM-dd")}</Text>
          </Pressable>
          <Text style={styles.label}>Категория:</Text>
          <Picker
            selectedValue={category}
            onValueChange={setCategory}
            style={styles.input}
          >
            <Picker.Item label="Храна" value="Храна" />
            <Picker.Item label="Транспорт" value="Транспорт" />
            <Picker.Item label="Сметки" value="Сметки" />
            <Picker.Item label="Забавления" value="Забавления" />
            <Picker.Item label="Други" value="Други" />
          </Picker>

          {showPicker && (
            <DateTimePicker
              value={date}
              mode="date"
              display="default"
              onChange={(_, d) => {
                setShowPicker(false);
                if (d) setDate(d);
              }}
            />
          )}

          <Pressable onPress={addExpense} style={styles.addButton}>
            <Text style={{ color: "white" }}>➕ Добави</Text>
          </Pressable>
        </View>

        <Text style={styles.subtitle}>
          Общо: {total.toFixed(2)} лв. за {format(date, "dd.MM.yyyy")}
        </Text>
        <Text style={[styles.label, { marginVertical: 10 }]}>
          Филтрирай по категория:
        </Text>
        <Picker
          selectedValue={filterCategory}
          onValueChange={setFilterCategory}
          style={[styles.input, { marginBottom: 20 }]}
        >
          <Picker.Item label="Всички" value="Всички" />
          <Picker.Item label="Храна" value="Храна" />
          <Picker.Item label="Транспорт" value="Транспорт" />
          <Picker.Item label="Сметки" value="Сметки" />
          <Picker.Item label="Забавления" value="Забавления" />
          <Picker.Item label="Други" value="Други" />
        </Picker>

        <FlatList
          data={todayExpenses}
          keyExtractor={(_, i) => i.toString()}
          renderItem={({ item, index }) => (
            <View
              style={[
                styles.listItem,
                { borderColor: getCategoryColor(item.category) },
              ]}
            >
              <View style={styles.listItemLeft}>
                <Text style={styles.descriptionText}>{item.description}</Text>
                <Text style={styles.amountText}>
                  💰 {item.amount.toFixed(2)} лв.
                </Text>
                <Text style={styles.metaText}>
                  🏷️ {item.category} | 📅 {item.date}
                </Text>
              </View>
              <View style={styles.actions}>
                <Pressable onPress={() => openEditModal(index)}>
                  <Text style={styles.editText}>✏️</Text>
                </Pressable>
                <Pressable onPress={() => deleteExpense(index)}>
                  <Text style={styles.deleteText}>🗑️</Text>
                </Pressable>
              </View>
            </View>
          )}
        />

        {editModalVisible && (
          <View style={styles.modalOverlay}>
            <View style={styles.modal}>
              <Text style={styles.title}>Редакция</Text>

              <TextInput
                value={editDescription}
                onChangeText={setEditDescription}
                placeholder="Описание"
                style={styles.input}
              />
              <TextInput
                value={editAmount}
                onChangeText={setEditAmount}
                placeholder="Сума"
                keyboardType="numeric"
                style={styles.input}
              />
              <Pressable
                style={[styles.input, { justifyContent: "center" }]}
                onPress={() => setShowPicker(true)}
              >
                <Text>{format(editDate, "yyyy-MM-dd")}</Text>
              </Pressable>
              <Text style={styles.label}>Категория:</Text>
              <Picker
                selectedValue={editCategory}
                onValueChange={setEditCategory}
                style={styles.input}
              >
                <Picker.Item label="Храна" value="Храна" />
                <Picker.Item label="Транспорт" value="Транспорт" />
                <Picker.Item label="Сметки" value="Сметки" />
                <Picker.Item label="Забавления" value="Забавления" />
                <Picker.Item label="Други" value="Други" />
              </Picker>

              {showPicker && (
                <DateTimePicker
                  value={editDate}
                  mode="date"
                  display="default"
                  onChange={(_, d) => {
                    setShowPicker(false);
                    if (d) setEditDate(d);
                  }}
                />
              )}

              <Pressable onPress={saveEditedExpense} style={styles.addButton}>
                <Text style={{ color: "white" }}>✅ Запази</Text>
              </Pressable>

              <Pressable
                onPress={() => setEditModalVisible(false)}
                style={[
                  styles.addButton,
                  { backgroundColor: "#ef4444", marginTop: 10 },
                ]}
              >
                <Text style={{ color: "white" }}>❌ Затвори</Text>
              </Pressable>
            </View>
          </View>
        )}

        {modalCalendarVisible && (
          <View style={styles.modalOverlay}>
            <View style={styles.modal}>
              <Calendar
                markedDates={markedDates}
                onDayPress={(day) => {
                  setDate(new Date(day.dateString));
                  setModalCalendarVisible(false);
                }}
                style={{ borderRadius: 12 }}
              />
              <Pressable
                onPress={() => setModalCalendarVisible(false)}
                style={[
                  styles.addButton,
                  { backgroundColor: "#ef4444", marginTop: 10 },
                ]}
              >
                <Text style={{ color: "white" }}>❌ Затвори</Text>
              </Pressable>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const baseStyles = {
  container: {
    flex: 1,
    padding: 0,
    paddingTop: 50,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 60,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold" as const,
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: "600" as const,
    marginBottom: 12,
  },
  card: {
    borderRadius: 16,
    padding: 16,
    gap: 10,
    marginBottom: 20,
  },
  input: {
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
  },
  addButton: {
    padding: 12,
    borderRadius: 10,
    alignItems: "center" as const,
  },
  deleteText: {
    fontSize: 20,
    fontWeight: "bold" as const,
  },
  modalOverlay: {
    position: "absolute" as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center" as const,
    alignItems: "center" as const,
    padding: 20,
    zIndex: 10,
  },
  modal: {
    borderRadius: 16,
    padding: 20,
    width: "100%",
  },
  editText: {
    fontSize: 20,
    fontWeight: "bold" as const,
  },
  listItem: {
    borderRadius: 12,
    borderWidth: 2,
    padding: 14,
    marginBottom: 12,
    flexDirection: "row" as const,
  },
  listItemLeft: {
    flex: 1,
  },
  descriptionText: {
    fontSize: 18,
    fontWeight: "bold" as const,
    marginBottom: 4,
  },
  amountText: {
    fontSize: 16,
    fontWeight: "600" as const,
    marginBottom: 4,
  },
  metaText: {
    fontSize: 13,
  },
  actions: {
    justifyContent: "space-between" as const,
    alignItems: "flex-end" as const,
    marginLeft: 10,
  },
};

const lightStyles = StyleSheet.create({
  ...baseStyles,
  container: { ...baseStyles.container, backgroundColor: "#fef3c7" },
  title: { ...baseStyles.title, color: "#1f2937" },
  subtitle: { ...baseStyles.subtitle, color: "#1f2937" },
  card: { ...baseStyles.card, backgroundColor: "#60a5fa" },
  input: {
    ...baseStyles.input,
    backgroundColor: "white",
    borderColor: "#e5e7eb",
    color: "#1f2937",
  },
  addButton: { ...baseStyles.addButton, backgroundColor: "#4ade80" },
  deleteText: { ...baseStyles.deleteText, color: "#ef4444" },
  modalOverlay: {
    ...baseStyles.modalOverlay,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modal: { ...baseStyles.modal, backgroundColor: "white" },
  editText: { ...baseStyles.editText, color: "#4f46e5" },
  listItem: {
    ...baseStyles.listItem,
    backgroundColor: "white",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  descriptionText: {
    ...baseStyles.descriptionText,
    color: "#1e293b",
  },
  amountText: {
    ...baseStyles.amountText,
    color: "#047857",
  },
  metaText: {
    ...baseStyles.metaText,
    color: "#6b7280",
  },
});

const darkStyles = StyleSheet.create({
  ...baseStyles,
  container: { ...baseStyles.container, backgroundColor: "#0f172a" },
  title: { ...baseStyles.title, color: "#facc15" },
  subtitle: { ...baseStyles.subtitle, color: "#facc15" },
  card: { ...baseStyles.card, backgroundColor: "#1e40af" },
  input: {
    ...baseStyles.input,
    backgroundColor: "#334155",
    borderColor: "#475569",
    color: "#f8fafc",
  },
  addButton: { ...baseStyles.addButton, backgroundColor: "#22c55e" },
  deleteText: { ...baseStyles.deleteText, color: "#f87171" },
  modalOverlay: {
    ...baseStyles.modalOverlay,
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  modal: { ...baseStyles.modal, backgroundColor: "#1e293b" },
  editText: { ...baseStyles.editText, color: "#818cf8" },
  listItem: {
    ...baseStyles.listItem,
    backgroundColor: "#1e293b",
  },
  descriptionText: {
    ...baseStyles.descriptionText,
    color: "#f1f5f9",
  },
  amountText: {
    ...baseStyles.amountText,
    color: "#34d399",
  },
  metaText: {
    ...baseStyles.metaText,
    color: "#94a3b8",
  },
});
