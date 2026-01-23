import { useRouter } from "expo-router";
import { Smile } from "lucide-react-native";
import { Pressable, Text, View } from "react-native";

import { colors } from "@/src/config/colors";

export function MoodWidget() {
  const router = useRouter();
  const moods = ["😢", "😕", "😐", "🙂", "😊"];

  return (
    <View className="mb-4 rounded-2xl bg-card p-4">
      <View className="mb-3 flex-row items-center gap-2">
        <Smile size={20} color={colors.primary} />
        <Text className="text-lg font-semibold text-foreground">Humeur</Text>
      </View>
      <View className="flex-row justify-between">
        {moods.map((mood) => (
          <Pressable
            key={mood}
            onPress={() => router.push("/(protected)/moodboard")}
            className="h-12 w-12 items-center justify-center rounded-full bg-muted active:bg-muted/80"
          >
            <Text className="text-2xl">{mood}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}
