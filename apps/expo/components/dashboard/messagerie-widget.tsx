import { useRouter } from "expo-router";
import { Eye } from "lucide-react-native";
import { useMemo } from "react";
import { Pressable, Text, View } from "react-native";

import { useConversations } from "@/lib/api/hooks/use-conversations";
import { colors } from "@/src/config/colors";

export function MessagerieWidget() {
  const router = useRouter();
  const { data, isLoading, isError, refetch } = useConversations({
    page: 1,
    limit: 10,
  });

  const unreadCount = useMemo(() => {
    if (!data?.conversations) return 0;
    return data.conversations.reduce((sum, c) => sum + c.unreadCount, 0);
  }, [data?.conversations]);

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
        className="mt-4 self-start rounded-full bg-primary px-4 py-1.5 active:opacity-90"
      >
        <Text className="text-sm font-medium text-primary-foreground">
          Voir plus
        </Text>
      </Pressable>
    </View>
  );
}
