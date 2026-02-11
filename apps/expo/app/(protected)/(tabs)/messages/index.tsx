import { useRouter } from "expo-router";
import { PenSquare } from "lucide-react-native";
import { useCallback, useMemo } from "react";
import { FlatList, RefreshControl, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { CloseButton } from "@/components/messages/close-button";
import { ConversationItem } from "@/components/messages/conversation-item";
import { NoConversationsEmpty } from "@/components/messages/empty-state";
import {
  ErrorBoundary,
  ErrorState,
} from "@/components/messages/error-boundary";
import { FAB } from "@/components/messages/fab";
import { ConversationListSkeleton } from "@/components/messages/skeleton";
import type { Conversation } from "@/constants/chat";
import { useConversations } from "@/lib/api/hooks/use-conversations";
import { useSSE } from "@/lib/sse/use-sse";
import { useAuth } from "@/src/providers/auth-provider";

export default function MessagesScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { data, isLoading, isRefetching, refetch, isError, error } =
    useConversations();

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

  const ListEmptyComponent = useCallback(() => <NoConversationsEmpty />, []);

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
        <View className="flex-row items-center justify-between border-b border-border px-4 py-3">
          <Text className="text-xl font-semibold text-foreground">
            Messagerie
          </Text>
          <CloseButton onPress={handleClose} />
        </View>
        <ConversationListSkeleton />
      </SafeAreaView>
    );
  }

  if (isError) {
    return (
      <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
        <View className="flex-row items-center justify-between border-b border-border px-4 py-3">
          <Text className="text-xl font-semibold text-foreground">
            Messagerie
          </Text>
          <CloseButton onPress={handleClose} />
        </View>
        <ErrorState
          message={error?.message || "Impossible de charger les conversations"}
          onRetry={() => refetch()}
        />
      </SafeAreaView>
    );
  }

  return (
    <ErrorBoundary onReset={() => refetch()}>
      <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
        <View className="flex-row items-center justify-between border-b border-border px-4 py-3">
          <Text className="text-xl font-semibold text-foreground">
            Messagerie
          </Text>
          <CloseButton onPress={handleClose} />
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
    </ErrorBoundary>
  );
}
