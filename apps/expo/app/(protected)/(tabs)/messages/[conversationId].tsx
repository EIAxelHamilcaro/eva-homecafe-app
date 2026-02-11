import { useLocalSearchParams, useRouter } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
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
import { CloseButton } from "@/components/messages/close-button";
import { DateSeparator } from "@/components/messages/date-separator";
import { NoMessagesEmpty } from "@/components/messages/empty-state";
import {
  ErrorBoundary,
  ErrorState,
} from "@/components/messages/error-boundary";
import { ImageViewer } from "@/components/messages/image-viewer";
import type { SelectedMedia } from "@/components/messages/media-picker";
import { MediaPreview } from "@/components/messages/media-preview";
import { MessageBubble } from "@/components/messages/message-bubble";
import { MessageInput } from "@/components/messages/message-input";
import { ReactionPicker } from "@/components/messages/reaction-picker";
import { MessageListSkeleton } from "@/components/messages/skeleton";
import type { Attachment, Message, ReactionEmoji } from "@/constants/chat";
import { useMultipleMediaUpload } from "@/lib/api/hooks/use-media-upload";
import { useMessages, useSendMessage } from "@/lib/api/hooks/use-messages";
import { useToggleReaction } from "@/lib/api/hooks/use-reactions";
import { useSSE } from "@/lib/sse/use-sse";
import { useToast } from "@/lib/toast/toast-context";
import { useAuth } from "@/src/providers/auth-provider";

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
  const { showToast } = useToast();

  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(
    null,
  );
  const [isPickerVisible, setIsPickerVisible] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<SelectedMedia[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const [viewerVisible, setViewerVisible] = useState(false);
  const [viewerImages, setViewerImages] = useState<Attachment[]>([]);
  const [viewerInitialIndex, setViewerInitialIndex] = useState(0);

  const {
    data,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isError,
    error,
    refetch,
  } = useMessages(conversationId ?? "");

  const sendMessage = useSendMessage({
    conversationId: conversationId ?? "",
    senderId: user?.id ?? "",
    onError: () => {
      showToast("Impossible d'envoyer le message", "error");
    },
  });

  const uploadMedia = useMultipleMediaUpload({
    onError: () => {
      showToast("Échec de l'envoi des images", "error");
    },
  });

  const toggleReaction = useToggleReaction({
    conversationId: conversationId ?? "",
    messageId: selectedMessageId ?? "",
    userId: user?.id ?? "",
    onError: () => {
      showToast("Impossible d'ajouter la réaction", "error");
    },
  });

  useSSE({
    conversationId: conversationId ?? "",
    enabled: !!conversationId && !!user,
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

  const handleMediaSelected = useCallback((media: SelectedMedia[]) => {
    setSelectedMedia((prev) => [...prev, ...media].slice(0, 10));
  }, []);

  const handleRemoveMedia = useCallback((index: number) => {
    setSelectedMedia((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handleSend = useCallback(
    async (content: string) => {
      if (selectedMedia.length > 0) {
        setIsUploading(true);
        try {
          const uploadResults = await uploadMedia.mutateAsync(
            selectedMedia.map((m) => ({
              uri: m.uri,
              type: m.type,
              fileName: m.fileName,
              fileSize: m.fileSize,
            })),
          );

          const attachments: Attachment[] = uploadResults.map((result) => ({
            id: result.id,
            url: result.url,
            mimeType: result.mimeType,
            size: result.size,
            filename: result.filename,
            dimensions: result.dimensions,
          }));

          sendMessage.mutate({
            content: content || undefined,
            attachments,
          });

          setSelectedMedia([]);
        } finally {
          setIsUploading(false);
        }
      } else if (content.trim().length > 0) {
        sendMessage.mutate({ content });
      }
    },
    [selectedMedia, uploadMedia, sendMessage],
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

  const handleImagePress = useCallback(
    (messageId: string, imageIndex: number) => {
      const message = allMessages.find((m) => m.id === messageId);
      if (message && message.attachments.length > 0) {
        setViewerImages(message.attachments);
        setViewerInitialIndex(imageIndex);
        setViewerVisible(true);
      }
    },
    [allMessages],
  );

  const handleCloseViewer = useCallback(() => {
    setViewerVisible(false);
    setViewerImages([]);
    setViewerInitialIndex(0);
  }, []);

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
            onImagePress={(index) => {
              if (item.message) handleImagePress(item.message.id, index);
            }}
          />
        );
      }

      return null;
    },
    [user?.id, handleLongPress, handleReactionPress, handleImagePress],
  );

  const keyExtractor = useCallback((item: MessageWithSeparator) => item.id, []);

  const ListEmptyComponent = useCallback(() => <NoMessagesEmpty />, []);

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
      <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
        <View className="flex-row items-center justify-between border-b border-border px-2 py-3">
          <View className="flex-row items-center">
            <Pressable
              onPress={handleBack}
              className="h-10 w-10 items-center justify-center rounded-full active:bg-muted"
            >
              <ChevronLeft size={24} color="#000" />
            </Pressable>
            <Text className="ml-1 text-xl font-semibold text-foreground">
              Nouveau message
            </Text>
          </View>
          <CloseButton onPress={handleBack} />
        </View>
        <MessageListSkeleton />
      </SafeAreaView>
    );
  }

  if (isError) {
    return (
      <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
        <View className="flex-row items-center justify-between border-b border-border px-2 py-3">
          <View className="flex-row items-center">
            <Pressable
              onPress={handleBack}
              className="h-10 w-10 items-center justify-center rounded-full active:bg-muted"
            >
              <ChevronLeft size={24} color="#000" />
            </Pressable>
            <Text className="ml-1 text-xl font-semibold text-foreground">
              Nouveau message
            </Text>
          </View>
          <CloseButton onPress={handleBack} />
        </View>
        <ErrorState
          message={error?.message || "Impossible de charger les messages"}
          onRetry={() => refetch()}
        />
      </SafeAreaView>
    );
  }

  return (
    <ErrorBoundary onReset={() => refetch()}>
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
                Nouveau message
              </Text>
            </View>
            <CloseButton onPress={handleBack} />
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

          <MediaPreview
            media={selectedMedia}
            onRemove={handleRemoveMedia}
            uploadProgresses={uploadMedia.fileProgresses}
            isUploading={isUploading}
          />

          <MessageInput
            onSend={handleSend}
            onMediaSelected={handleMediaSelected}
            disabled={sendMessage.isPending || isUploading}
            hasMedia={selectedMedia.length > 0}
          />
        </KeyboardAvoidingView>

        <ReactionPicker
          visible={isPickerVisible}
          onClose={handleClosePicker}
          onSelectReaction={handleSelectReaction}
        />

        <ImageViewer
          visible={viewerVisible}
          images={viewerImages}
          initialIndex={viewerInitialIndex}
          onClose={handleCloseViewer}
        />
      </SafeAreaView>
    </ErrorBoundary>
  );
}
