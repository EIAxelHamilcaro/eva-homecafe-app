import { useRouter } from "expo-router";
import { ChevronRight, PenLine } from "lucide-react-native";
import { Pressable, Text, View } from "react-native";

import { colors } from "@/src/config/colors";

export function JournalWidget() {
  const router = useRouter();

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
          <Text className="text-sm text-muted-foreground">
            Écrire une entrée
          </Text>
        </View>
        <ChevronRight size={20} color={colors.icon.muted} />
      </View>
    </Pressable>
  );
}
