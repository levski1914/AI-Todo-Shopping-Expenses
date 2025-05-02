import AsyncStorage from "@react-native-async-storage/async-storage";
import { format, startOfDay, isSameDay, subDays } from "date-fns";

export async function migrateUnfinishedTasks() {
  try {
    const data = await AsyncStorage.getItem("tasksByDate");
    if (!data) return;

    const all = JSON.parse(data);
    const today = startOfDay(new Date());
    const yesterday = startOfDay(subDays(today, 1));

    const yesterdayKey = format(yesterday, "yyyy-MM-dd");
    const todayKey = format(today, "yyyy-MM-dd");

    const yesterdayTasks = all[yesterdayKey];
    if (!yesterdayTasks) return;

    for (const hour in yesterdayTasks) {
      const tasks = yesterdayTasks[hour].filter(
        (t: any) => t.status !== "Готово" && t.status !== "done"
      );

      if (tasks.length === 0) continue;

      if (!all[todayKey]) all[todayKey] = {};
      if (!all[todayKey][hour]) all[todayKey][hour] = [];

      all[todayKey][hour].push(...tasks);
    }

    // Опционално: чистим старите незавършени от вчера
    for (const hour in yesterdayTasks) {
      all[yesterdayKey][hour] = yesterdayTasks[hour].filter(
        (t: any) => t.status === "Готово" || t.status === "done"
      );
      if (all[yesterdayKey][hour].length === 0) {
        delete all[yesterdayKey][hour];
      }
    }

    if (Object.keys(all[yesterdayKey]).length === 0) {
      delete all[yesterdayKey];
    }

    await AsyncStorage.setItem("tasksByDate", JSON.stringify(all));
  } catch (err) {
    console.error("Грешка при прехвърляне на задачи от вчера:", err);
  }
}
