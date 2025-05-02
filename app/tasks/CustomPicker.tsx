import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  Pressable,
  FlatList,
  StyleSheet,
} from "react-native";

export default function CustomPicker({
  value,
  options,
  onChange,
  placeholder = "Избери...",
}: {
  value: string;
  options: string[];
  onChange: (val: string) => void;
  placeholder?: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Pressable style={styles.input} onPress={() => setOpen(true)}>
        <Text style={{ color: value ? "#1f2937" : "#9ca3af" }}>
          {value || placeholder}
        </Text>
      </Pressable>

      <Modal visible={open} transparent animationType="slide">
        <View style={styles.overlay}>
          <View style={styles.modal}>
            <Text style={styles.label}>Избери стойност</Text>
            <FlatList
              data={options}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <Pressable
                  onPress={() => {
                    onChange(item);
                    setOpen(false);
                  }}
                  style={styles.option}
                >
                  <Text style={styles.optionText}>{item}</Text>
                </Pressable>
              )}
            />
            <Pressable onPress={() => setOpen(false)}>
              <Text
                style={{ color: "#ef4444", textAlign: "center", marginTop: 10 }}
              >
                Затвори
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  input: {
    backgroundColor: "#f3f4f6",
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    padding: 20,
  },
  modal: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 20,
  },
  label: {
    fontWeight: "bold",
    fontSize: 16,
    marginBottom: 10,
  },
  option: {
    padding: 12,
    borderBottomWidth: 1,
    borderColor: "#e5e7eb",
  },
  optionText: {
    fontSize: 16,
  },
});
