import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Pressable,
  ScrollView,
  StyleSheet,
  Dimensions,
} from "react-native";
import { format, addDays, subDays, isSameDay } from "date-fns";

export default function CalendarStrip({
  selectedDate,
  onDateChange,
}: {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
}) {
  const [dates, setDates] = useState<Date[]>([]);

  useEffect(() => {
    const today = new Date();
    const newDates = [];

    for (let i = -3; i <= 3; i++) {
      newDates.push(addDays(today, i));
    }
    setDates(newDates);
  }, []);

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.calendarContainer}
    >
      {dates.map((date, index) => {
        const isSelected = isSameDay(date, selectedDate);
        return (
          <Pressable
            key={index}
            onPress={() => onDateChange(date)}
            style={[styles.dateItem, isSelected && styles.selectedDateItem]}
          >
            <Text style={[styles.day, isSelected && styles.selectedText]}>
              {new Intl.DateTimeFormat("bg", { weekday: "short" }).format(date)}
            </Text>
            <Text style={[styles.date, isSelected && styles.selectedText]}>
              {format(date, "dd")}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  calendarContainer: {
    paddingVertical: 10,
    paddingHorizontal: 8,
  },
  dateItem: {
    alignItems: "center",
    justifyContent: "center",
    padding: 10,
    borderRadius: 12,
    marginHorizontal: 6,
    backgroundColor: "#e5e7eb",
  },
  selectedDateItem: {
    backgroundColor: "#4f46e5",
  },
  day: {
    fontSize: 14,
    color: "#374151",
  },
  date: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1f2937",
  },
  selectedText: {
    color: "white",
  },
});
