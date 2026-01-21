import { useLocalSearchParams, useRouter } from "expo-router";
import { ChevronLeft, X } from "lucide-react-native";
import { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import type { Message, ReactionEmoji } from "@/constants/chat";
import { useMessages, useSendMessage } from "@/lib/api/hooks/use-messages";
import { useToggleReaction } from "@/lib/api/hooks/use-reactions";
import { useAuth } from "@/src/providers/auth-provider";

import { DateSeparator } from "./_components/date-separator";
import { MessageBubble } from "./_components/message-bubble";
import { MessageInput } from "./_components/message-input";
import { ReactionPicker } from "./_components/reaction-picker";

interface MessageWithSeparator {
  type: "message" | "separator";
  id: string;
  message?: Message;
  date?: string;
}

function isSameDay(date1: string, date2: string): boolean {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  return d1.toDateString() === d2.toDateString();
}

function processMessagesWithSeparators(
  messages: Message[],
): MessageWithSeparator[] {
  const result: MessageWithSeparator[] = [];

  for (let i = 0; i < messages.length; i++) {
    const message = messages[i];
    if (!message) continue;

    result.push({
      type: "message",
      id: message.id,
      message,
    });

    const nextMessage = messages[i + 1];
    if (!nextMessage || !isSameDay(message.createdAt, nextMessage.createdAt)) {
      result.push({
        type: "separator",
        id: `separator-${message.createdAt}`,
        date: message.createdAt,
      });
    }
  }

  return result;
}

export default function ConversationScreen() {
  const { conversationId } = useLocalSearchParams<{ conversationId: string }>();
  const router = useRouter();
  const { user } = useAuth();

  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(
    null,
  );
  const [isPickerVisible, setIsPickerVisible] = useState(false);

  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useMessages(conversationId ?? "");

  const sendMessage = useSendMessage({
    conversationId: conversationId ?? "",
    senderId: user?.id ?? "",
  });

  const toggleReaction = useToggleReaction({
    conversationId: conversationId ?? "",
    messageId: selectedMessageId ?? "",
    userId: user?.id ?? "",
  });

  const allMessages = useMemo(() => {
    if (!data?.pages) return [];
    return data.pages.flatMap((page) => page.messages);
  }, [data?.pages]);

  const processedMessages = useMemo(
    () => processMessagesWithSeparators(allMessages),
    [allMessages],
  );

  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  const handleClose = useCallback(() => {
    router.dismissTo("/messages");
  }, [router]);

  const handleSend = useCallback(
    (content: string) => {
      sendMessage.mutate({ content });
    },
    [sendMessage],
  );

  const handleLoadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const handleLongPress = useCallback((messageId: string) => {
    setSelectedMessageId(messageId);
    setIsPickerVisible(true);
  }, []);

  const handleClosePicker = useCallback(() => {
    setIsPickerVisible(false);
    setSelectedMessageId(null);
  }, []);

  const handleSelectReaction = useCallback(
    (emoji: ReactionEmoji) => {
      if (selectedMessageId) {
        toggleReaction.mutate({ emoji });
      }
    },
    [selectedMessageId, toggleReaction],
  );

  const handleReactionPress = useCallback(
    (messageId: string, emoji: ReactionEmoji) => {
      setSelectedMessageId(messageId);
      toggleReaction.mutate({ emoji });
    },
    [toggleReaction],
  );

  const renderItem = useCallback(
    ({ item }: { item: MessageWithSeparator }) => {
      if (item.type === "separator" && item.date) {
        return <DateSeparator date={item.date} />;
      }

      if (item.type === "message" && item.message) {
        return (
          <MessageBubble
            message={item.message}
            isSent={item.message.senderId === user?.id}
            userId={user?.id ?? ""}
            onLongPress={() => {
              if (item.message) handleLongPress(item.message.id);
            }}
            onReactionPress={(emoji) => {
              if (item.message) handleReactionPress(item.message.id, emoji);
            }}
          />
        );
      }

      return null;
    },
    [user?.id, handleLongPress, handleReactionPress],
  );

  const keyExtractor = useCallback((item: MessageWithSeparator) => item.id, []);

  const ListEmptyComponent = useCallback(
    () => (
      <View className="flex-1 items-center justify-center py-20">
        <Text className="text-center text-muted-foreground">Aucun message</Text>
        <Text className="mt-2 text-center text-sm text-muted-foreground">
          Envoyez un message pour démarrer la conversation
        </Text>
      </View>
    ),
    [],
  );

  const ListFooterComponent = useCallback(
    () =>
      isFetchingNextPage ? (
        <View className="py-4">
          <ActivityIndicator size="small" color="#F691C3" />
        </View>
      ) : null,
    [isFetchingNextPage],
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
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
        keyboardVerticalOffset={0}
      >
        <View className="flex-row items-center justify-between border-b border-border px-2 py-3">
          <View className="flex-row items-center">
            <Pressable
              onPress={handleBack}
              className="h-10 w-10 items-center justify-center rounded-full active:bg-muted"
            >
              <ChevronLeft size={24} color="#000" />
            </Pressable>
            <Text className="ml-1 text-xl font-semibold text-foreground">
              Conversation
            </Text>
          </View>
          <Pressable
            onPress={handleClose}
            className="h-10 w-10 items-center justify-center rounded-full active:bg-muted"
          >
            <X size={24} color="#666" />
          </Pressable>
        </View>

        <FlatList
          data={processedMessages}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          ListEmptyComponent={ListEmptyComponent}
          ListFooterComponent={ListFooterComponent}
          inverted
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          contentContainerStyle={{
            flexGrow: 1,
            paddingVertical: 8,
          }}
          keyboardShouldPersistTaps="handled"
        />

        <MessageInput onSend={handleSend} disabled={sendMessage.isPending} />
      </KeyboardAvoidingView>

      <ReactionPicker
        visible={isPickerVisible}
        onClose={handleClosePicker}
        onSelectReaction={handleSelectReaction}
      />
    </SafeAreaView>
  );
}
