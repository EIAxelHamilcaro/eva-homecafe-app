import { useRouter } from "expo-router";
import { Calendar, ChevronRight } from "lucide-react-native";
import { Pressable, Text, View } from "react-native";

import { colors } from "@/src/config/colors";

export function CalendarWidget() {
  const router = useRouter();
  const today = new Date();
  const dayName = today.toLocaleDateString("fr-FR", { weekday: "long" });
  const dayNumber = today.getDate();
  const monthName = today.toLocaleDateString("fr-FR", { month: "long" });

  return (
    <Pressable
      onPress={() => router.push("/organisation" as `/organisation`)}
      className="mb-4 rounded-2xl bg-card p-4 active:opacity-90"
    >
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-3">
          <View className="h-14 w-14 items-center justify-center rounded-xl bg-primary/10">
            <Calendar size={28} color={colors.primary} />
          </View>
          <View>
            <Text className="text-lg font-semibold capitalize text-foreground">
              {dayName}
            </Text>
            <Text className="text-sm text-muted-foreground">
              {dayNumber} {monthName}
            </Text>
          </View>
        </View>
        <ChevronRight size={20} color={colors.icon.muted} />
      </View>
    </Pressable>
  );
}
