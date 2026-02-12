import { useRouter } from "expo-router";
import { ChevronLeft, Plus, Trash2 } from "lucide-react-native";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Button } from "@/components/ui/button";

type TodoItemInput = {
  id: string;
  label: string;
};

export default function NewTodoListScreen() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [items, setItems] = useState<TodoItemInput[]>([]);
  const [newItemLabel, setNewItemLabel] = useState("");

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/(protected)/(tabs)" as const);
    }
  };

  const handleAddItem = () => {
    if (!newItemLabel.trim()) return;

    setItems((prev) => [
      ...prev,
      { id: String(Date.now()), label: newItemLabel.trim() },
    ]);
    setNewItemLabel("");
  };

  const handleRemoveItem = (itemId: string) => {
    setItems((prev) => prev.filter((item) => item.id !== itemId));
  };

  const handleSave = () => {
    if (!title.trim()) return;
    // TODO: Save to backend
    console.log("Save todo list:", { title, items });
    handleBack();
  };

  const canSave = title.trim().length > 0;

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        {/* Header */}
        <View className="flex-row items-center justify-between border-b border-border px-2 py-3">
          <View className="flex-row items-center">
            <Pressable
              onPress={handleBack}
              className="h-10 w-10 items-center justify-center rounded-full active:bg-muted"
            >
              <ChevronLeft size={24} color="#3D2E2E" />
            </Pressable>
            <Text className="ml-1 text-xl font-semibold text-foreground">
              Nouvelle liste
            </Text>
          </View>
          <Button
            onPress={handleSave}
            disabled={!canSave}
            className="rounded-full px-6"
          >
            Créer
          </Button>
        </View>

        <ScrollView
          className="flex-1 px-4"
          contentContainerStyle={{ paddingVertical: 16 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Title input */}
          <View className="mb-6">
            <Text className="mb-2 text-sm font-medium text-muted-foreground">
              Nom de la liste
            </Text>
            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder="Ex: Courses de la semaine"
              placeholderTextColor="#9CA3AF"
              className="rounded-lg border border-border bg-card px-4 py-3 text-base text-foreground"
            />
          </View>

          {/* Items list */}
          <View className="mb-4">
            <Text className="mb-2 text-sm font-medium text-muted-foreground">
              Éléments ({items.length})
            </Text>

            {items.map((item) => (
              <View
                key={item.id}
                className="mb-2 flex-row items-center justify-between rounded-lg border border-border bg-card px-4 py-3"
              >
                <Text className="flex-1 text-base text-foreground">
                  {item.label}
                </Text>
                <Pressable
                  onPress={() => handleRemoveItem(item.id)}
                  className="ml-2 h-8 w-8 items-center justify-center rounded-full active:bg-muted"
                >
                  <Trash2 size={18} color="#EF4444" />
                </Pressable>
              </View>
            ))}
          </View>

          {/* Add item input */}
          <View className="flex-row items-center gap-2">
            <TextInput
              value={newItemLabel}
              onChangeText={setNewItemLabel}
              placeholder="Ajouter un élément..."
              placeholderTextColor="#9CA3AF"
              className="flex-1 rounded-lg border border-dashed border-border bg-card px-4 py-3 text-base text-foreground"
              onSubmitEditing={handleAddItem}
              returnKeyType="done"
            />
            <Pressable
              onPress={handleAddItem}
              disabled={!newItemLabel.trim()}
              className="h-12 w-12 items-center justify-center rounded-full bg-primary active:opacity-80 disabled:opacity-50"
            >
              <Plus size={24} color="#FFFFFF" />
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
