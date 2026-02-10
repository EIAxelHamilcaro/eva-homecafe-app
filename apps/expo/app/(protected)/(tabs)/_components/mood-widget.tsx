import { useRouter } from "expo-router";
import { Smile } from "lucide-react-native";
import { ActivityIndicator, Pressable, Text, View } from "react-native";

import { MOOD_COLORS, MOODS } from "@/components/moodboard/mood-legend";
import { useTodayMood } from "@/lib/api/hooks/use-mood";
import { colors } from "@/src/config/colors";
import { cn } from "@/src/libs/utils";

export function MoodWidget() {
  const router = useRouter();
  const { data: todayMood, isLoading } = useTodayMood();

  const navigateToMoodboard = () => {
    router.push("/(protected)/moodboard");
  };

  return (
    <Pressable
      onPress={navigateToMoodboard}
      className="mb-4 rounded-2xl bg-card p-4 active:opacity-90"
    >
      <View className="mb-3 flex-row items-center gap-2">
        <Smile size={20} color={colors.primary} />
        <Text className="text-lg font-semibold text-foreground">Humeur</Text>
      </View>

      {isLoading ? (
        <View className="items-center py-2">
          <ActivityIndicator size="small" />
        </View>
      ) : todayMood ? (
        <View className="flex-row items-center gap-3">
          <View
            className={cn(
              "h-10 w-10 items-center justify-center rounded-full",
              MOOD_COLORS[todayMood.category],
            )}
          >
            <Text className="text-sm font-bold text-white">
              {todayMood.intensity}
            </Text>
          </View>
          <View className="flex-1">
            <Text className="text-base font-medium text-foreground">
              {MOODS.find((m) => m.key === todayMood.category)?.label ??
                todayMood.category}
            </Text>
            <Text className="text-xs text-muted-foreground">
              Intensité {todayMood.intensity}/10 — Appuie pour modifier
            </Text>
          </View>
        </View>
      ) : (
        <View className="items-center py-2">
          <Text className="text-sm text-muted-foreground">
            Pas encore d'humeur enregistrée
          </Text>
          <Text className="mt-1 text-xs font-medium text-primary">
            Enregistre ton humeur du jour
          </Text>
        </View>
      )}
    </Pressable>
  );
}
