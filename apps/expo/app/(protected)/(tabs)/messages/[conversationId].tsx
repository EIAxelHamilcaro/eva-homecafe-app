import { useQueryClient } from "@tanstack/react-query";
import { useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import { ChevronLeft, Trash2 } from "lucide-react-native";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
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
import {
  useConversations,
  useDeleteConversation,
} from "@/lib/api/hooks/use-conversations";
import { useMultipleMediaUpload } from "@/lib/api/hooks/use-media-upload";
import {
  useMarkConversationRead,
  useMessages,
  useSendMessage,
} from "@/lib/api/hooks/use-messages";
import { useMarkRead } from "@/lib/api/hooks/use-notifications";
import { useProfilesQuery } from "@/lib/api/hooks/use-profiles";
import { useToggleReaction } from "@/lib/api/hooks/use-reactions";
import { useSSE } from "@/lib/sse/use-sse";
import { useToast } from "@/lib/toast/toast-context";
import { useAuth } from "@/src/providers/auth-provider";
import type { GetNotificationsResponse } from "@/types/notification";

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
  const navigation = useNavigation();
  const { user } = useAuth();
  const { showToast } = useToast();

  const deleteConversation = useDeleteConversation({
    onSuccess: () => router.back(),
  });

  const handleDelete = useCallback(() => {
    Alert.alert(
      "Supprimer la conversation",
      "Cette action est irréversible. Tous les messages seront supprimés.",
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Supprimer",
          style: "destructive",
          onPress: () => {
            if (conversationId) {
              deleteConversation.mutate(conversationId);
            }
          },
        },
      ],
    );
  }, [conversationId, deleteConversation]);

  const isScreenFocusedRef = useRef(true);
  useEffect(() => {
    const unsubFocus = navigation.addListener("focus", () => {
      isScreenFocusedRef.current = true;
    });
    const unsubBlur = navigation.addListener("blur", () => {
      isScreenFocusedRef.current = false;
    });
    return () => {
      unsubFocus();
      unsubBlur();
    };
  }, [navigation]);

  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(
    null,
  );
  const [isPickerVisible, setIsPickerVisible] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<SelectedMedia[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const [viewerVisible, setViewerVisible] = useState(false);
  const [viewerImages, setViewerImages] = useState<Attachment[]>([]);
  const [viewerInitialIndex, setViewerInitialIndex] = useState(0);

  const flatListRef = useRef<FlatList>(null);
  const newestMessageIdRef = useRef<string | null>(null);

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
    userId: user?.id ?? "",
    onError: () => {
      showToast("Impossible d'ajouter la réaction", "error");
    },
  });

  const markAsRead = useMarkConversationRead(conversationId ?? "");
  const markAsReadRef = useRef(markAsRead);
  markAsReadRef.current = markAsRead;

  useEffect(() => {
    if (conversationId) {
      markAsReadRef.current.mutate();
    }
  }, [conversationId]);

  useSSE({
    conversationId: conversationId ?? "",
    enabled: !!conversationId && !!user,
  });

  const queryClient = useQueryClient();
  const markNotificationRead = useMarkRead();
  const markedNotifIdsRef = useRef(new Set<string>());

  const { data: conversationsData } = useConversations();
  const otherUserId = useMemo(() => {
    const conv = conversationsData?.conversations?.find(
      (c) => c.id === conversationId,
    );
    return conv?.participants.find((p) => p.userId !== user?.id)?.userId;
  }, [conversationsData, conversationId, user?.id]);

  const profileIds = useMemo(() => {
    const ids: string[] = [];
    if (user?.id) ids.push(user.id);
    if (otherUserId) ids.push(otherUserId);
    return ids;
  }, [user?.id, otherUserId]);

  const { data: profilesData } = useProfilesQuery(profileIds);
  const currentUserProfile = user?.id
    ? profilesData?.profiles?.find((p) => p.id === user.id)
    : undefined;
  const otherUserProfile = otherUserId
    ? profilesData?.profiles?.find((p) => p.id === otherUserId)
    : undefined;

  const allMessages = useMemo(() => {
    if (!data?.pages) return [];
    const seen = new Set<string>();
    const messages: Message[] = [];
    for (const page of data.pages) {
      for (const msg of page.messages) {
        if (!seen.has(msg.id)) {
          seen.add(msg.id);
          messages.push(msg);
        }
      }
    }
    return messages;
  }, [data?.pages]);

  const processedMessages = useMemo(
    () => processMessagesWithSeparators(allMessages),
    [allMessages],
  );

  useEffect(() => {
    if (allMessages.length === 0) return;
    const newestId = allMessages[0]?.id ?? null;
    if (
      newestId !== newestMessageIdRef.current &&
      newestMessageIdRef.current !== null
    ) {
      flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
    }
    newestMessageIdRef.current = newestId;
  }, [allMessages]);

  const latestMessageId = allMessages[0]?.id ?? null;
  useEffect(() => {
    if (!isScreenFocusedRef.current || !conversationId || !latestMessageId)
      return;

    const queries = queryClient.getQueriesData<GetNotificationsResponse>({
      queryKey: ["notifications", "list"],
    });

    for (const [, cached] of queries) {
      if (!cached?.notifications) continue;
      for (const n of cached.notifications) {
        if (
          n.type === "new_message" &&
          n.readAt === null &&
          (n.data.conversationId as string | undefined) === conversationId &&
          !markedNotifIdsRef.current.has(n.id)
        ) {
          markedNotifIdsRef.current.add(n.id);
          markNotificationRead.mutate({ notificationId: n.id });
        }
      }
    }
  }, [conversationId, latestMessageId, queryClient, markNotificationRead]);

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
        toggleReaction.mutate({ messageId: selectedMessageId, emoji });
      }
    },
    [selectedMessageId, toggleReaction],
  );

  const handleReactionPress = useCallback(
    (messageId: string, emoji: ReactionEmoji) => {
      setSelectedMessageId(messageId);
      toggleReaction.mutate({ messageId, emoji });
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
        const isSent = item.message.senderId === user?.id;
        return (
          <MessageBubble
            message={item.message}
            isSent={isSent}
            userId={user?.id ?? ""}
            senderName={
              isSent
                ? (currentUserProfile?.name ?? user?.name)
                : (otherUserProfile?.name ?? undefined)
            }
            senderImage={
              isSent
                ? (currentUserProfile?.image ?? user?.image)
                : (otherUserProfile?.image ?? undefined)
            }
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
    [
      user,
      currentUserProfile,
      otherUserProfile,
      handleLongPress,
      handleReactionPress,
      handleImagePress,
    ],
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
          <View className="flex-row items-center gap-1">
            <Pressable
              onPress={handleDelete}
              className="h-10 w-10 items-center justify-center rounded-full active:bg-muted"
            >
              <Trash2 size={20} color="#ef4444" />
            </Pressable>
            <CloseButton onPress={handleBack} />
          </View>
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
          <View className="flex-row items-center gap-1">
            <Pressable
              onPress={handleDelete}
              className="h-10 w-10 items-center justify-center rounded-full active:bg-muted"
            >
              <Trash2 size={20} color="#ef4444" />
            </Pressable>
            <CloseButton onPress={handleBack} />
          </View>
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
            <View className="flex-row items-center gap-1">
              <Pressable
                onPress={handleDelete}
                className="h-10 w-10 items-center justify-center rounded-full active:bg-muted"
              >
                <Trash2 size={20} color="#ef4444" />
              </Pressable>
              <CloseButton onPress={handleBack} />
            </View>
          </View>

          <FlatList
            ref={flatListRef}
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
