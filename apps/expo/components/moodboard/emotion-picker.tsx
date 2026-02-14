import { Modal, Pressable, Text, View } from "react-native";
import type { MoodCategory } from "@/types/mood";

interface EmotionOption {
  value: MoodCategory;
  label: string;
  color: string;
}

const EMOTION_OPTIONS: EmotionOption[] = [
  { value: "calme", label: "Calme", color: "#0062DD" },
  { value: "enervement", label: "Énervement", color: "#F21622" },
  { value: "excitation", label: "Excitation", color: "#F691C3" },
  { value: "anxiete", label: "Anxiété", color: "#DADADA" },
  { value: "tristesse", label: "Tristesse", color: "#000000" },
  { value: "bonheur", label: "Bonheur", color: "#81C784" },
  { value: "ennui", label: "Ennui", color: "#FDECCE" },
  { value: "nervosite", label: "Nervosité", color: "#F46604" },
  { value: "productivite", label: "Productivité", color: "#FDCB08" },
];

interface EmotionPickerProps {
  visible: boolean;
  selectedDate: string | null;
  onClose: () => void;
  onSelect: (category: MoodCategory) => void;
}

function EmotionPicker({
  visible,
  selectedDate,
  onClose,
  onSelect,
}: EmotionPickerProps) {
  const handleSelect = (category: MoodCategory) => {
    onSelect(category);
    onClose();
  };

  const formattedDate = selectedDate
    ? new Date(`${selectedDate}T00:00:00`).toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "long",
      })
    : "";

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable className="flex-1 justify-end bg-black/40" onPress={onClose}>
        <Pressable
          className="rounded-t-3xl bg-background px-6 pb-10 pt-6"
          onPress={(e) => e.stopPropagation()}
        >
          <View className="mb-1 items-center">
            <View className="mb-4 h-1 w-10 rounded-full bg-muted-foreground/30" />
          </View>
          <Text className="mb-1 text-center text-lg font-semibold text-foreground">
            Que ressens-tu ?
          </Text>
          {formattedDate !== "" && (
            <Text className="mb-5 text-center text-sm text-muted-foreground">
              {formattedDate}
            </Text>
          )}
          <View className="flex-row flex-wrap justify-center gap-4">
            {EMOTION_OPTIONS.map((emotion) => (
              <Pressable
                key={emotion.value}
                onPress={() => handleSelect(emotion.value)}
                className="items-center active:opacity-70"
                style={{ width: 80 }}
                accessibilityLabel={emotion.label}
                accessibilityRole="button"
              >
                <View
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 22,
                    backgroundColor: emotion.color,
                  }}
                />
                <Text className="mt-1.5 text-xs font-medium text-foreground">
                  {emotion.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

export { EmotionPicker, EMOTION_OPTIONS, type EmotionPickerProps };
