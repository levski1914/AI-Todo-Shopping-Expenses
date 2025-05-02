import React, { useEffect, useState } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  Pressable,
  Switch,
  StyleSheet,
  Platform,
} from "react-native";

import CustomPicker from "./CustomPicker";
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
const daysOfWeek = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Нд"];
export default function AddTaskModal({
  visible,
  onClose,
  onSave,
  taskToEdit,
}: {
  visible: boolean;
  onClose: () => void;
  onSave: (task: any, isEdit: boolean, oldTask?: any) => void;
  taskToEdit?: any;
}) {
  const [title, setTitle] = useState("");
  const [time, setTime] = useState("");
  const [priority, setPriority] = useState<"нисък" | "среден" | "висок">(
    "нисък"
  );
  const [status, setStatus] = useState<"Да направя" | "В прогрес" | "Готово">(
    "Да направя"
  );
  const [note, setNote] = useState("");
  const [alarm, setAlarm] = useState(false);
  const [repeatType, setRepeatType] = useState("none");
  const [repeatDays, setRepeatDays] = useState<string[]>([]);
  const [repeatUntil, setRepeatUntil] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  useEffect(() => {
    if (taskToEdit) {
      setTitle(taskToEdit.title || "");
      setTime(taskToEdit.time || "");
      setPriority(taskToEdit.priority || "нисък");
      setStatus(taskToEdit.status || "Да направя");
      setNote(taskToEdit.note || "");
      setAlarm(taskToEdit.alarm || false);
    } else {
      resetForm();
    }
  }, [taskToEdit, visible]);

  function resetForm() {
    setTitle("");
    setTime("");
    setPriority("нисък");
    setStatus("Да направя");
    setNote("");
    setAlarm(false);
    setRepeatType("none");
    setRepeatDays([]);
    setRepeatUntil(new Date());
  }

  interface RepeatDaysState {
    (prev: string[]): string[];
  }

  function toggleDay(day: string): void {
    setRepeatDays((prev: string[]) =>
      prev.includes(day)
        ? prev.filter((d: string) => d !== day)
        : [...prev, day]
    );
  }
  function handleSave() {
    if (!title || !time) return;

    const newTask = {
      title,
      time,
      priority,
      status,
      note,
      alarm,
      completed: false,
      repeatType,
      repeatDays,
      repeatUntil: repeatUntil.toISOString().split("T")[0],
    };

    onSave(newTask, !!taskToEdit, taskToEdit);
    resetForm();
    onClose();
  }

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <Pressable style={styles.closeButton} onPress={onClose}>
            <Text style={{ fontSize: 20 }}>✖️</Text>
          </Pressable>

          <Text style={styles.heading}>
            {taskToEdit ? "✏️ Редакция" : "➕ Нова задача"}
          </Text>

          <TextInput
            placeholder="Заглавие"
            value={title}
            onChangeText={setTitle}
            style={styles.input}
          />

          <Text style={styles.label}>Час:</Text>
          <View style={[styles.input, { paddingHorizontal: 0 }]}>
            <CustomPicker
              value={time}
              onChange={setTime}
              options={hours}
              placeholder="Избери час"
            />
          </View>

          <Text style={styles.label}>Приоритет:</Text>
          <View style={styles.row}>
            {["нисък", "среден", "висок"].map((p) => (
              <Pressable
                key={p}
                style={[
                  styles.tag,
                  priority === p && styles.tagSelected,
                  { backgroundColor: getPriorityColor(p) },
                ]}
                onPress={() => setPriority(p as any)}
              >
                <Text style={styles.tagText}>{p.toUpperCase()}</Text>
              </Pressable>
            ))}
          </View>

          <Text style={styles.label}>Статус:</Text>
          <View style={styles.row}>
            {["Да направя", "В прогрес", "Готово"].map((s) => (
              <Pressable
                key={s}
                style={[
                  styles.tag,
                  status === s && styles.tagSelected,
                  { backgroundColor: getStatusColor(s) },
                ]}
                onPress={() => setStatus(s as any)}
              >
                <Text style={styles.tagText}>{s.toUpperCase()}</Text>
              </Pressable>
            ))}
          </View>

          <TextInput
            placeholder="Бележка (по избор)"
            value={note}
            onChangeText={setNote}
            multiline
            style={[styles.input, { height: 60 }]}
          />

          <View
            style={[
              styles.row,
              { justifyContent: "space-between", marginVertical: 10 },
            ]}
          >
            <Text style={styles.label}>Аларма:</Text>
            <Switch value={alarm} onValueChange={setAlarm} />
          </View>
          <Text style={styles.label}>Повтаряне:</Text>
          <View style={[styles.input, { paddingHorizontal: 0 }]}>
            <CustomPicker
              value={repeatType}
              onChange={setRepeatType}
              options={["none", "daily", "weekly", "custom"]}
              placeholder="Избери повторение"
            />
          </View>

          {repeatType === "custom" && (
            <View>
              <Text style={styles.label}>Избери дни:</Text>
              <View style={styles.row}>
                {daysOfWeek.map((day) => (
                  <Pressable
                    key={day}
                    onPress={() => toggleDay(day)}
                    style={[
                      styles.tag,
                      repeatDays.includes(day) && styles.tagSelected,
                    ]}
                  >
                    <Text style={styles.tagText}>{day}</Text>
                  </Pressable>
                ))}
              </View>
            </View>
          )}

          {repeatType !== "none" && (
            <View>
              <Text style={styles.label}>До дата:</Text>

              <TextInput
                value={repeatUntil.toISOString().split("T")[0]}
                onChangeText={(text) => {
                  const regex = /^\d{4}-\d{2}-\d{2}$/;
                  if (regex.test(text)) {
                    const parsed = new Date(text);
                    if (!isNaN(parsed.getTime())) {
                      setRepeatUntil(parsed);
                    }
                  }
                }}
                placeholder="ГГГГ-ММ-ДД"
                inputMode="numeric"
                style={[styles.input, { fontFamily: "monospace" }]}
              />
            </View>
          )}

          <Pressable style={styles.saveButton} onPress={handleSave}>
            <Text style={{ color: "white", fontSize: 16 }}>
              ✅ {taskToEdit ? "Запази промените" : "Добави"}
            </Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

function getPriorityColor(p: string) {
  return p === "висок" ? "#ef4444" : p === "среден" ? "#facc15" : "#22c55e";
}
function getStatusColor(s: string) {
  return s === "Готово" ? "#60a5fa" : s === "В прогрес" ? "#facc15" : "#f87171";
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    padding: 20,
  },
  modal: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 20,
  },
  closeButton: {
    position: "absolute",
    right: 16,
    top: 16,
    padding: 10,
    zIndex: 10,
  },
  heading: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
  },
  input: {
    backgroundColor: "#f3f4f6",
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
  },
  row: {
    flexDirection: "row",
    gap: 10,
    flexWrap: "wrap",
  },
  tag: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  tagSelected: {
    borderWidth: 2,
    borderColor: "#4f46e5",
  },
  tagText: {
    color: "#1f2937",
    fontWeight: "bold",
  },
  label: {
    fontSize: 14,
    marginTop: 10,
    marginBottom: 4,
    color: "#374151",
  },
  saveButton: {
    backgroundColor: "#4f46e5",
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 10,
    alignItems: "center",
  },
});
