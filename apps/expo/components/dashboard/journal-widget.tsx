import { useRouter } from "expo-router";
import { ChevronRight, Flame, PenLine } from "lucide-react-native";
import { Pressable, Text, View } from "react-native";

import { useJournalStreak } from "@/lib/api/hooks/use-journal-streak";
import { colors } from "@/src/config/colors";

export function JournalWidget() {
  const router = useRouter();
  const { data: streak, isLoading, isError, refetch } = useJournalStreak();
  const currentStreak = streak?.currentStreak ?? 0;

  return (
    <Pressable
      onPress={() => router.push("/(protected)/journal/create")}
      className="mb-4 rounded-2xl bg-card p-4 active:opacity-90"
    >
      <View className="flex-row items-center gap-3">
        <View className="h-12 w-12 items-center justify-center rounded-full bg-primary/10">
          <PenLine size={24} color={colors.primary} />
        </View>
        <View className="flex-1">
          <Text className="text-lg font-semibold text-foreground">Journal</Text>
          {isLoading ? (
            <View className="mt-1 h-4 w-36 rounded bg-muted" />
          ) : isError ? (
            <Text className="text-sm text-primary" onPress={() => refetch()}>
              Réessayer
            </Text>
          ) : currentStreak > 0 ? (
            <View className="flex-row items-center gap-1">
              <Flame size={14} color={colors.primary} />
              <Text className="text-sm text-muted-foreground">
                {currentStreak} jour{currentStreak > 1 ? "s" : ""} de suite
              </Text>
            </View>
          ) : (
            <Text className="text-sm text-muted-foreground">
              Commence ton journal
            </Text>
          )}
        </View>
        <ChevronRight size={20} color={colors.icon.muted} />
      </View>
    </Pressable>
  );
}
