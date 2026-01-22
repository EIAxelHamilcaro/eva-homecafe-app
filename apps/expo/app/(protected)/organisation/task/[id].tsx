import { useLocalSearchParams, useRouter } from "expo-router";
import { Check, Pencil, Trash2, X } from "lucide-react-native";
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

const MOCK_TASK = {
  id: "1",
  title: "Finaliser le design",
  description: "Compléter les maquettes pour la page d'accueil",
  labels: ["pink", "orange"] as LabelColor[],
  progress: 75,
  column: "inprogress",
  createdAt: "2026-01-20",
  dueDate: "2026-01-25",
};

export default function TaskDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(MOCK_TASK.title);
  const [description, setDescription] = useState(MOCK_TASK.description);
  const [selectedLabels, setSelectedLabels] = useState<LabelColor[]>(
    MOCK_TASK.labels,
  );
  const [progress, setProgress] = useState(MOCK_TASK.progress);

  const handleClose = () => {
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
    // TODO: Save to backend
    console.log("Save task:", {
      id,
      title,
      description,
      selectedLabels,
      progress,
    });
    setIsEditing(false);
  };

  const handleDelete = () => {
    // TODO: Delete from backend
    console.log("Delete task:", id);
    handleClose();
  };

  const handleMarkComplete = () => {
    setProgress(100);
    // TODO: Update backend
    console.log("Mark task complete:", id);
  };

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        {/* Header */}
        <View className="flex-row items-center justify-between border-b border-border px-4 py-3">
          <Pressable
            onPress={handleClose}
            className="h-10 w-10 items-center justify-center rounded-full border-2 border-primary"
          >
            <X size={20} color="#F691C3" />
          </Pressable>

          <View className="flex-row gap-2">
            {isEditing ? (
              <Button onPress={handleSave} className="rounded-full px-6">
                Enregistrer
              </Button>
            ) : (
              <>
                <Pressable
                  onPress={() => setIsEditing(true)}
                  className="h-10 w-10 items-center justify-center rounded-full bg-muted active:opacity-80"
                >
                  <Pencil size={18} color="#3D2E2E" />
                </Pressable>
                <Pressable
                  onPress={handleDelete}
                  className="h-10 w-10 items-center justify-center rounded-full bg-destructive/10 active:opacity-80"
                >
                  <Trash2 size={18} color="#EF4444" />
                </Pressable>
              </>
            )}
          </View>
        </View>

        <ScrollView
          className="flex-1 px-4"
          contentContainerStyle={{ paddingVertical: 16 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Labels */}
          <View className="mb-4">
            {isEditing ? (
              <>
                <Text className="mb-2 text-sm font-medium text-muted-foreground">
                  Labels
                </Text>
                <View className="flex-row flex-wrap gap-2">
                  {LABEL_COLORS.map(({ color, hex }) => (
                    <Pressable
                      key={color}
                      onPress={() => toggleLabel(color)}
                      className={`h-8 w-8 items-center justify-center rounded-full ${
                        selectedLabels.includes(color)
                          ? "border-2 border-foreground"
                          : ""
                      }`}
                      style={{ backgroundColor: hex }}
                    >
                      {selectedLabels.includes(color) && (
                        <X size={14} color="#FFFFFF" />
                      )}
                    </Pressable>
                  ))}
                </View>
              </>
            ) : (
              <View className="flex-row flex-wrap gap-1">
                {selectedLabels.map((color) => {
                  const colorData = LABEL_COLORS.find((c) => c.color === color);
                  return (
                    <View
                      key={color}
                      className="h-3 w-10 rounded-full"
                      style={{ backgroundColor: colorData?.hex }}
                    />
                  );
                })}
              </View>
            )}
          </View>

          {/* Title */}
          <View className="mb-4">
            {isEditing ? (
              <>
                <Text className="mb-2 text-sm font-medium text-muted-foreground">
                  Titre
                </Text>
                <TextInput
                  value={title}
                  onChangeText={setTitle}
                  placeholder="Titre de la tâche"
                  placeholderTextColor="#9CA3AF"
                  className="rounded-lg border border-border bg-card px-4 py-3 text-lg font-semibold text-foreground"
                />
              </>
            ) : (
              <Text className="text-2xl font-bold text-foreground">
                {title}
              </Text>
            )}
          </View>

          {/* Description */}
          <View className="mb-6">
            {isEditing ? (
              <>
                <Text className="mb-2 text-sm font-medium text-muted-foreground">
                  Description
                </Text>
                <TextInput
                  value={description}
                  onChangeText={setDescription}
                  placeholder="Ajouter une description..."
                  placeholderTextColor="#9CA3AF"
                  multiline
                  numberOfLines={4}
                  className="min-h-[100px] rounded-lg border border-border bg-card px-4 py-3 text-base text-foreground"
                  textAlignVertical="top"
                />
              </>
            ) : (
              <Text className="text-base text-muted-foreground leading-6">
                {description || "Aucune description"}
              </Text>
            )}
          </View>

          {/* Progress */}
          <View className="mb-6">
            <View className="mb-2 flex-row items-center justify-between">
              <Text className="text-sm font-medium text-muted-foreground">
                Progression
              </Text>
              <Text className="text-sm font-semibold text-foreground">
                {progress}%
              </Text>
            </View>
            {isEditing ? (
              <View className="rounded-lg border border-border bg-card p-4">
                <Slider
                  value={progress}
                  onValueChange={setProgress}
                  min={0}
                  max={100}
                  step={5}
                />
              </View>
            ) : (
              <View className="h-3 rounded-full bg-muted">
                <View
                  className="h-full rounded-full bg-primary"
                  style={{ width: `${progress}%` }}
                />
              </View>
            )}
          </View>

          {/* Dates */}
          <View className="mb-6 rounded-lg border border-border bg-card p-4">
            <View className="mb-2 flex-row items-center justify-between">
              <Text className="text-sm text-muted-foreground">Créée le</Text>
              <Text className="text-sm font-medium text-foreground">
                {MOCK_TASK.createdAt}
              </Text>
            </View>
            <View className="flex-row items-center justify-between">
              <Text className="text-sm text-muted-foreground">Échéance</Text>
              <Text className="text-sm font-medium text-foreground">
                {MOCK_TASK.dueDate}
              </Text>
            </View>
          </View>

          {/* Mark complete button */}
          {!isEditing && progress < 100 && (
            <Button
              onPress={handleMarkComplete}
              variant="outline"
              className="flex-row items-center justify-center gap-2"
            >
              <Check size={18} color="#4ADE80" />
              <Text className="font-medium text-foreground">
                Marquer comme terminé
              </Text>
            </Button>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
