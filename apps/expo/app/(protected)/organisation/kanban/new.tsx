import { useRouter } from "expo-router";
import { ChevronLeft, X } from "lucide-react-native";
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

import { Button } from "../../../../components/ui/button";
import { Slider } from "../../../../components/ui/slider";

type LabelColor = "pink" | "orange" | "yellow" | "green" | "blue" | "purple";

const LABEL_COLORS: { color: LabelColor; hex: string }[] = [
  { color: "pink", hex: "#F5A5B8" },
  { color: "orange", hex: "#FB923C" },
  { color: "yellow", hex: "#FACC15" },
  { color: "green", hex: "#4ADE80" },
  { color: "blue", hex: "#60A5FA" },
  { color: "purple", hex: "#A78BFA" },
];

const COLUMNS = [
  { id: "todo", title: "À faire" },
  { id: "inprogress", title: "En cours" },
  { id: "done", title: "Terminé" },
];

export default function NewKanbanCardScreen() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [selectedLabels, setSelectedLabels] = useState<LabelColor[]>([]);
  const [progress, setProgress] = useState(0);
  const [selectedColumn, setSelectedColumn] = useState("todo");

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/(protected)/(tabs)" as const);
    }
  };

  const toggleLabel = (color: LabelColor) => {
    setSelectedLabels((prev) =>
      prev.includes(color) ? prev.filter((c) => c !== color) : [...prev, color],
    );
  };

  const handleSave = () => {
    if (!title.trim()) return;
    // TODO: Save to backend
    console.log("Save kanban card:", {
      title,
      labels: selectedLabels,
      progress,
      column: selectedColumn,
    });
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
              Nouvelle carte
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
              Titre de la carte
            </Text>
            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder="Ex: Finaliser le design"
              placeholderTextColor="#9CA3AF"
              className="rounded-lg border border-border bg-card px-4 py-3 text-base text-foreground"
            />
          </View>

          {/* Column selection */}
          <View className="mb-6">
            <Text className="mb-2 text-sm font-medium text-muted-foreground">
              Colonne
            </Text>
            <View className="flex-row gap-2">
              {COLUMNS.map((column) => (
                <Pressable
                  key={column.id}
                  onPress={() => setSelectedColumn(column.id)}
                  className={`flex-1 items-center rounded-lg border px-3 py-2 ${
                    selectedColumn === column.id
                      ? "border-primary bg-primary/10"
                      : "border-border bg-card"
                  }`}
                >
                  <Text
                    className={`text-sm font-medium ${
                      selectedColumn === column.id
                        ? "text-primary"
                        : "text-foreground"
                    }`}
                  >
                    {column.title}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Labels selection */}
          <View className="mb-6">
            <Text className="mb-2 text-sm font-medium text-muted-foreground">
              Labels
            </Text>
            <View className="flex-row flex-wrap gap-2">
              {LABEL_COLORS.map(({ color, hex }) => (
                <Pressable
                  key={color}
                  onPress={() => toggleLabel(color)}
                  className={`h-10 w-10 items-center justify-center rounded-full ${
                    selectedLabels.includes(color)
                      ? "border-2 border-foreground"
                      : ""
                  }`}
                  style={{ backgroundColor: hex }}
                >
                  {selectedLabels.includes(color) && (
                    <X size={16} color="#FFFFFF" />
                  )}
                </Pressable>
              ))}
            </View>
          </View>

          {/* Progress slider */}
          <View className="mb-6">
            <Text className="mb-2 text-sm font-medium text-muted-foreground">
              Progression ({progress}%)
            </Text>
            <View className="rounded-lg border border-border bg-card p-4">
              <Slider
                value={progress}
                onValueChange={setProgress}
                min={0}
                max={100}
                step={5}
              />
            </View>
          </View>

          {/* Preview */}
          <View className="mb-6">
            <Text className="mb-2 text-sm font-medium text-muted-foreground">
              Aperçu
            </Text>
            <View className="rounded-xl border border-border bg-card p-3">
              {/* Labels */}
              {selectedLabels.length > 0 && (
                <View className="mb-2 flex-row flex-wrap gap-1">
                  {selectedLabels.map((color) => {
                    const colorData = LABEL_COLORS.find(
                      (c) => c.color === color,
                    );
                    return (
                      <View
                        key={color}
                        className="h-2 w-8 rounded-full"
                        style={{ backgroundColor: colorData?.hex }}
                      />
                    );
                  })}
                </View>
              )}

              {/* Title */}
              <Text className="mb-2 text-base font-medium text-foreground">
                {title || "Titre de la carte"}
              </Text>

              {/* Progress bar */}
              <View className="h-1.5 rounded-full bg-muted">
                <View
                  className="h-full rounded-full bg-primary"
                  style={{ width: `${progress}%` }}
                />
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
