import { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  FlatList,
  ScrollView,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Crypto from "expo-crypto";
// import { Picker } from "@react-native-picker/picker";
import { SafeAreaView } from "react-native";
import { useTheme } from "../settings/ThemeContext";
import CustomPicker from "../tasks/CustomPicker";
import { StatusBar, Platform } from "react-native";
import { Link } from "expo-router";

type Product = {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  price: number;
  bought: boolean;
};

export default function ShoppingScreen() {
  const [products, setProducts] = useState<Product[]>([]);
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [unit, setUnit] = useState("бр");
  const [price, setPrice] = useState("");
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const styles = isDark ? darkThemeStyles : lightThemeStyles;
  useEffect(() => {
    const loadProducts = async () => {
      const stored = await AsyncStorage.getItem("products");
      if (stored) setProducts(JSON.parse(stored));
    };
    loadProducts();
  }, []);

  useEffect(() => {
    AsyncStorage.setItem("products", JSON.stringify(products));
  }, [products]);

  const addProduct = () => {
    if (!name.trim()) return;
    const newProduct: Product = {
      id: Crypto.randomUUID(),
      name,
      quantity: parseFloat(quantity),
      unit,
      price: parseFloat(price),
      bought: false,
    };
    setProducts([...products, newProduct]);
    setName("");
    setQuantity("");
    setUnit("бр");
    setPrice("");
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={{ paddingBottom: 60 }}>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Text style={styles.title}>🛒 Списък за пазаруване</Text>
          <Link href="/settings" asChild>
            <Pressable>
              <Text style={{ color: "#94a3b8", fontSize: 24 }}>⚙️</Text>
            </Pressable>
          </Link>
        </View>
        <View style={styles.card}>
          <TextInput
            placeholder="Име на продукт"
            value={name}
            onChangeText={setName}
            style={styles.input}
            placeholderTextColor="#6b7280"
          />
          <TextInput
            placeholder="Количество"
            value={quantity}
            onChangeText={setQuantity}
            keyboardType="numeric"
            style={styles.input}
            placeholderTextColor="#6b7280"
          />
          <CustomPicker
            value={unit}
            onChange={setUnit}
            options={["бр", "кг", "гр", "л", "опаковка"]}
            placeholder="Мерна единица"
          />
          <TextInput
            placeholder="Цена"
            value={price}
            onChangeText={setPrice}
            keyboardType="numeric"
            style={styles.input}
            placeholderTextColor="#6b7280"
          />

          <Pressable onPress={addProduct} style={styles.addButton}>
            <Text style={{ color: "white", fontWeight: "bold" }}>
              ➕ Добави продукт
            </Text>
          </Pressable>
        </View>

        {products.length === 0 ? (
          <Text style={{ color: "#6b7280", textAlign: "center" }}>
            📝 Няма добавени продукти
          </Text>
        ) : (
          products.map((item) => (
            <View key={item.id} style={styles.listItem}>
              <View>
                <Text
                  style={[
                    styles.listTitle,
                    item.bought && {
                      textDecorationLine: "line-through",
                      color: "#4ade80",
                    },
                  ]}
                >
                  {item.name}
                </Text>
                <Text style={styles.listSubtitle}>
                  {item.quantity} {item.unit} • {item.price.toFixed(2)} лв.
                </Text>
              </View>
              <Pressable
                onPress={() => {
                  setProducts(products.filter((p) => p.id !== item.id));
                }}
              >
                <Text
                  style={{ color: "#ef4444", fontWeight: "bold", fontSize: 18 }}
                >
                  ❌
                </Text>
              </Pressable>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
const baseStyles = {
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 50,
  },
  title: {
    fontSize: 28,
    fontWeight: "700" as const,
    marginBottom: 20,
  },
  card: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
    gap: 10,
  },
  input: {
    padding: 12,
    borderRadius: 10,
    borderColor: "#e5e7eb",
    borderWidth: 1,
  },
  addButton: {
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center" as const,
    marginTop: 10,
  },
  listItem: {
    padding: 16,
    borderRadius: 14,
    marginBottom: 12,
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "center" as const,
  },
  listTitle: {
    fontSize: 18,
    fontWeight: "bold" as const,
  },
  listSubtitle: {
    fontSize: 14,
  },
};

const lightThemeStyles = {
  ...baseStyles,
  container: { ...baseStyles.container, backgroundColor: "#fef9c3" },
  title: { ...baseStyles.title, color: "#1f2937" },
  card: { ...baseStyles.card, backgroundColor: "#facc15" },
  input: { ...baseStyles.input, backgroundColor: "white", color: "#1f2937" },
  addButton: { ...baseStyles.addButton, backgroundColor: "#4ade80" },
  listItem: { ...baseStyles.listItem, backgroundColor: "#fef3c7" },
  listTitle: { ...baseStyles.listTitle, color: "#1f2937" },
  listSubtitle: { ...baseStyles.listSubtitle, color: "#6b7280" },
};

const darkThemeStyles = {
  ...baseStyles,
  container: { ...baseStyles.container, backgroundColor: "#0f172a" },
  title: { ...baseStyles.title, color: "#facc15" },
  card: { ...baseStyles.card, backgroundColor: "#1e293b" },
  input: { ...baseStyles.input, backgroundColor: "#334155", color: "#f1f5f9" },
  addButton: { ...baseStyles.addButton, backgroundColor: "#22c55e" },
  listItem: { ...baseStyles.listItem, backgroundColor: "#1e293b" },
  listTitle: { ...baseStyles.listTitle, color: "#f8fafc" },
  listSubtitle: { ...baseStyles.listSubtitle, color: "#94a3b8" },
};
