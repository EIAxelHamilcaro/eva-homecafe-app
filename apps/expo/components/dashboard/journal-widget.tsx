import { useRouter } from "expo-router";
import { Flame, Lock, Pen } from "lucide-react-native";
import { Pressable, Text, View } from "react-native";

import { useJournalStreak } from "@/lib/api/hooks/use-journal-streak";
import { colors } from "@/src/config/colors";

interface JournalWidgetProps {
  selectedDate: string;
}

export function JournalWidget({ selectedDate }: JournalWidgetProps) {
  const router = useRouter();
  const { data: streak } = useJournalStreak();
  const currentStreak = streak?.currentStreak ?? 0;

  const dateLabel = new Date(`${selectedDate}T12:00:00`).toLocaleDateString(
    "fr-FR",
    {
      weekday: "long",
      day: "numeric",
      month: "long",
    },
  );

  const handlePress = () => {
    router.push("/(protected)/(tabs)/journal/create");
  };

  return (
    <Pressable
      onPress={handlePress}
      className="rounded-2xl bg-card p-4 active:opacity-90"
    >
      <View className="flex-row items-start justify-between">
        <View>
          <Text className="text-lg font-semibold text-foreground">Journal</Text>
          <Text className="text-sm capitalize text-muted-foreground">
            {dateLabel}
          </Text>
        </View>
        <View className="flex-row items-center gap-2">
          {currentStreak > 0 && (
            <View className="flex-row items-center gap-1">
              <Flame size={14} color={colors.primary} />
              <Text className="text-sm text-muted-foreground">
                {currentStreak}j
              </Text>
            </View>
          )}
          <Lock size={18} color="#8D7E7E" />
        </View>
      </View>

      <View className="mt-4 flex-row items-center gap-3 rounded-xl bg-muted/50 px-4 py-4">
        <View className="h-9 w-9 items-center justify-center rounded-full bg-homecafe-pink/10">
          <Pen size={16} color={colors.homecafe.pink} />
        </View>
        <Text className="text-sm text-muted-foreground">
          Commence à écrire ici...
        </Text>
      </View>
    </Pressable>
  );
}
