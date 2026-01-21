import { useRouter } from "expo-router";
import { PenSquare, X } from "lucide-react-native";
import { useCallback, useMemo } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import type { Conversation } from "@/constants/chat";
import { useConversations } from "@/lib/api/hooks/use-conversations";
import { useSSE } from "@/lib/sse/use-sse";
import { useAuth } from "@/src/providers/auth-provider";

import { ConversationItem } from "./_components/conversation-item";
import { FAB } from "./_components/fab";

export default function MessagesScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { data, isLoading, isRefetching, refetch } = useConversations();

  useSSE({ enabled: !!user });

  const participantNames = useMemo(() => {
    const names = new Map<string, string>();
    if (data?.conversations) {
      for (const conversation of data.conversations) {
        for (const participant of conversation.participants) {
          if (!names.has(participant.userId)) {
            names.set(
              participant.userId,
              `Utilisateur ${participant.userId.slice(0, 4)}`,
            );
          }
        }
      }
    }
    return names;
  }, [data?.conversations]);

  const handleConversationPress = useCallback(
    (conversationId: string) => {
      router.push({
        pathname: "/messages/[conversationId]",
        params: { conversationId },
      });
    },
    [router],
  );

  const handleNewMessage = useCallback(() => {
    router.push({ pathname: "/messages/new" });
  }, [router]);

  const handleClose = useCallback(() => {
    router.back();
  }, [router]);

  const renderItem = useCallback(
    ({ item }: { item: Conversation }) => (
      <ConversationItem
        conversation={item}
        currentUserId={user?.id ?? ""}
        participantNames={participantNames}
        onPress={() => handleConversationPress(item.id)}
      />
    ),
    [user?.id, participantNames, handleConversationPress],
  );

  const keyExtractor = useCallback((item: Conversation) => item.id, []);

  const ItemSeparator = useCallback(
    () => <View className="mx-4 h-px bg-border" />,
    [],
  );

  const ListEmptyComponent = useCallback(
    () => (
      <View className="flex-1 items-center justify-center py-20">
        <Text className="text-center text-muted-foreground">
          Aucune conversation
        </Text>
        <Text className="mt-2 text-center text-sm text-muted-foreground">
          Appuyez sur le bouton + pour démarrer une nouvelle conversation
        </Text>
      </View>
    ),
    [],
  );

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#F691C3" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <View className="flex-row items-center justify-between border-b border-border px-4 py-3">
        <Text className="text-xl font-semibold text-foreground">
          Messagerie
        </Text>
        <Pressable
          onPress={handleClose}
          className="h-10 w-10 items-center justify-center rounded-full active:bg-muted"
        >
          <X size={24} color="#666" />
        </Pressable>
      </View>

      <FlatList
        data={data?.conversations ?? []}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        ItemSeparatorComponent={ItemSeparator}
        ListEmptyComponent={ListEmptyComponent}
        contentContainerStyle={{ flexGrow: 1 }}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            tintColor="#F691C3"
          />
        }
      />

      <FAB onPress={handleNewMessage}>
        <PenSquare size={24} color="#FFFFFF" />
      </FAB>
    </SafeAreaView>
  );
}
