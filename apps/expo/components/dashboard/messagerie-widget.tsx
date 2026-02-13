import { useRouter } from "expo-router";
import { Eye } from "lucide-react-native";
import { Pressable, Text, View } from "react-native";

import { useUnreadCount } from "@/lib/api/hooks/use-notifications";
import { colors } from "@/src/config/colors";

export function MessagerieWidget() {
  const router = useRouter();
  const { data, isLoading, isError, refetch } = useUnreadCount();
  const unreadCount = data?.unreadCount ?? 0;

  return (
    <View className="relative rounded-2xl bg-card p-4">
      <View className="absolute right-4 top-4">
        <Eye size={20} color={colors.homecafe.blue} />
      </View>

      <Text className="text-lg font-semibold text-foreground">Messagerie</Text>
      <Text className="text-sm text-muted-foreground">
        Ceci est un affichage restreint
      </Text>

      <View className="mt-4">
        {isLoading ? (
          <View className="h-4 w-40 rounded bg-muted" />
        ) : isError ? (
          <Pressable onPress={() => refetch()}>
            <Text className="text-sm text-primary">Réessayer</Text>
          </Pressable>
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

      <Pressable
        onPress={() => router.push("/(protected)/(tabs)/messages")}
        className={`mt-4 self-start rounded-full px-4 py-1.5 active:opacity-90 ${unreadCount > 0 ? "bg-homecafe-green" : "bg-homecafe-pink"}`}
      >
        <Text className="text-sm font-medium text-white">Voir plus</Text>
      </Pressable>
    </View>
  );
}
