import { useCallback, useState } from "react";
import { FlatList, RefreshControl, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { NoNotificationsEmpty } from "@/components/notifications/empty-state";
import { NotificationItem } from "@/components/notifications/notification-item";
import { NotificationListSkeleton } from "@/components/notifications/skeleton";
import { useRespondRequest } from "@/lib/api/hooks/use-friend-requests";
import {
  useMarkRead,
  useNotifications,
} from "@/lib/api/hooks/use-notifications";
import { useSSE } from "@/lib/sse/use-sse";
import { useAuth } from "@/src/providers/auth-provider";
import type { Notification } from "@/types/notification";

export default function NotificationsScreen() {
  const { user } = useAuth();
  const { data, isLoading, isRefetching, refetch } = useNotifications();
  const markReadMutation = useMarkRead();
  const respondRequestMutation = useRespondRequest();

  const [respondingRequestId, setRespondingRequestId] = useState<string | null>(
    null,
  );
  const [respondAction, setRespondAction] = useState<
    "accept" | "reject" | null
  >(null);

  useSSE({ enabled: !!user });

  const handleNotificationPress = useCallback(
    (notification: Notification) => {
      if (notification.readAt === null) {
        markReadMutation.mutate({ notificationId: notification.id });
      }
    },
    [markReadMutation],
  );

  const handleAcceptRequest = useCallback(
    (notification: Notification) => {
      const requestId = notification.data?.requestId as string | undefined;
      if (!requestId) return;

      setRespondingRequestId(requestId);
      setRespondAction("accept");

      respondRequestMutation.mutate(
        { requestId, accept: true },
        {
          onSettled: () => {
            setRespondingRequestId(null);
            setRespondAction(null);
          },
          onSuccess: () => {
            if (notification.readAt === null) {
              markReadMutation.mutate({ notificationId: notification.id });
            }
          },
        },
      );
    },
    [respondRequestMutation, markReadMutation],
  );

  const handleRejectRequest = useCallback(
    (notification: Notification) => {
      const requestId = notification.data?.requestId as string | undefined;
      if (!requestId) return;

      setRespondingRequestId(requestId);
      setRespondAction("reject");

      respondRequestMutation.mutate(
        { requestId, accept: false },
        {
          onSettled: () => {
            setRespondingRequestId(null);
            setRespondAction(null);
          },
          onSuccess: () => {
            if (notification.readAt === null) {
              markReadMutation.mutate({ notificationId: notification.id });
            }
          },
        },
      );
    },
    [respondRequestMutation, markReadMutation],
  );

  const renderItem = useCallback(
    ({ item }: { item: Notification }) => {
      const requestId = item.data?.requestId as string | undefined;
      const isThisRequest = requestId === respondingRequestId;

      return (
        <NotificationItem
          notification={item}
          onPress={() => handleNotificationPress(item)}
          onAccept={
            item.type === "friend_request"
              ? () => handleAcceptRequest(item)
              : undefined
          }
          onReject={
            item.type === "friend_request"
              ? () => handleRejectRequest(item)
              : undefined
          }
          isAccepting={isThisRequest && respondAction === "accept"}
          isRejecting={isThisRequest && respondAction === "reject"}
        />
      );
    },
    [
      handleNotificationPress,
      handleAcceptRequest,
      handleRejectRequest,
      respondingRequestId,
      respondAction,
    ],
  );

  const keyExtractor = useCallback((item: Notification) => item.id, []);

  const ItemSeparator = useCallback(
    () => <View className="mx-4 h-px bg-border" />,
    [],
  );

  const ListEmptyComponent = useCallback(() => <NoNotificationsEmpty />, []);

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
        <View className="border-b border-border px-4 py-3">
          <Text className="text-xl font-semibold text-foreground">
            Notifications
          </Text>
        </View>
        <NotificationListSkeleton />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <View className="border-b border-border px-4 py-3">
        <Text className="text-xl font-semibold text-foreground">
          Notifications
        </Text>
      </View>

      <FlatList
        data={data?.notifications ?? []}
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
    </SafeAreaView>
  );
}
