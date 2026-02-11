import { useRouter } from "expo-router";
import { ChevronRight, Mail } from "lucide-react-native";
import { Pressable, Text, View } from "react-native";

import { useUnreadCount } from "@/lib/api/hooks/use-notifications";
import { colors } from "@/src/config/colors";

export function MessagerieWidget() {
  const router = useRouter();
  const { data, isLoading, isError, refetch } = useUnreadCount();
  const unreadCount = data?.unreadCount ?? 0;

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
            {isLoading ? (
              <View className="mt-1 h-4 w-32 rounded bg-muted" />
            ) : isError ? (
              <Text className="text-sm text-primary" onPress={() => refetch()}>
                Réessayer
              </Text>
            ) : unreadCount > 0 ? (
              <Text className="text-sm text-muted-foreground">
                {unreadCount > 1
                  ? `${unreadCount} messages non lus`
                  : `${unreadCount} message non lu`}
              </Text>
            ) : (
              <Text className="text-sm text-muted-foreground">
                Aucun message non lu
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
