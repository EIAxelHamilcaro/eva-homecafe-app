import { useRouter } from "expo-router";
import { ChevronRight, Mail } from "lucide-react-native";
import { Pressable, Text, View } from "react-native";

import { MOCK_UNREAD_MESSAGES } from "@/constants/dashboard-mock-data";
import { colors } from "@/src/config/colors";

export function MessagerieWidget() {
  const router = useRouter();

  return (
    <Pressable
      onPress={() => router.push("/(protected)/(tabs)/messages")}
      className="mb-4 rounded-2xl bg-card p-4 active:opacity-90"
    >
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-3">
          <View className="h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Mail size={24} color={colors.primary} />
          </View>
          <View>
            <Text className="text-lg font-semibold text-foreground">
              Messagerie
            </Text>
            {MOCK_UNREAD_MESSAGES > 0 && (
              <Text className="text-sm text-muted-foreground">
                {MOCK_UNREAD_MESSAGES} message
                {MOCK_UNREAD_MESSAGES > 1 ? "s" : ""} non lu
                {MOCK_UNREAD_MESSAGES > 1 ? "s" : ""}
              </Text>
            )}
          </View>
        </View>
        <View className="flex-row items-center">
          <Text className="mr-1 text-sm text-primary">Voir plus</Text>
          <ChevronRight size={16} color={colors.primary} />
        </View>
      </View>
    </Pressable>
  );
}
