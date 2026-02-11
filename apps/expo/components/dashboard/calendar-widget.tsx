import { useRouter } from "expo-router";
import { Calendar, ChevronRight } from "lucide-react-native";
import { Pressable, Text, View } from "react-native";

import { useChronology } from "@/lib/api/hooks/use-boards";
import { colors } from "@/src/config/colors";

export function CalendarWidget() {
  const router = useRouter();
  const { data: chronology, isLoading, isError, refetch } = useChronology();

  const today = new Date();
  const dayName = today.toLocaleDateString("fr-FR", { weekday: "long" });
  const dayNumber = today.getDate();
  const monthName = today.toLocaleDateString("fr-FR", { month: "long" });
  const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
  const todayEvents = chronology?.eventDates?.[todayKey]?.count ?? 0;

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
            {isLoading ? (
              <View className="mt-1 h-3 w-28 rounded bg-muted" />
            ) : isError ? (
              <Text className="text-xs text-primary" onPress={() => refetch()}>
                Réessayer
              </Text>
            ) : todayEvents > 0 ? (
              <Text className="text-xs text-primary">
                {todayEvents} évènement{todayEvents > 1 ? "s" : ""} aujourd'hui
              </Text>
            ) : null}
          </View>
        </View>
        <ChevronRight size={20} color={colors.icon.muted} />
      </View>
    </Pressable>
  );
}
