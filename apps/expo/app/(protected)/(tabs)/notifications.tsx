import { CheckCheck } from "lucide-react-native";
import { useCallback, useMemo, useState } from "react";
import { FlatList, Pressable, RefreshControl, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { NoNotificationsEmpty } from "@/components/notifications/empty-state";
import { NotificationItem } from "@/components/notifications/notification-item";
import { NotificationListSkeleton } from "@/components/notifications/skeleton";
import { useRespondRequest } from "@/lib/api/hooks/use-friend-requests";
import {
  useMarkRead,
  useNotifications,
  useUnreadCount,
} from "@/lib/api/hooks/use-notifications";
import { useProfilesQuery } from "@/lib/api/hooks/use-profiles";
import { useSSE } from "@/lib/sse/use-sse";
import { useAuth } from "@/src/providers/auth-provider";
import type { Notification } from "@/types/notification";

export default function NotificationsTab() {
  const { user } = useAuth();
  const { data, isLoading, isRefetching, refetch } = useNotifications();
  const { data: unreadData } = useUnreadCount();
  const markReadMutation = useMarkRead();
  const respondRequestMutation = useRespondRequest();

  const [respondingRequestId, setRespondingRequestId] = useState<string | null>(
    null,
  );
  const [respondAction, setRespondAction] = useState<
    "accept" | "reject" | null
  >(null);
  const [respondedIds, setRespondedIds] = useState<Set<string>>(new Set());

  useSSE({ enabled: !!user });

  const unreadCount = unreadData?.unreadCount ?? data?.unreadCount ?? 0;

  const senderIds = useMemo(() => {
    if (!data?.notifications) return [];
    const ids = new Set<string>();
    for (const n of data.notifications) {
      const senderId = (n.data.senderId ?? n.data.acceptorId) as
        | string
        | undefined;
      if (senderId) ids.add(senderId);
    }
    return [...ids];
  }, [data?.notifications]);

  const { data: profilesData } = useProfilesQuery(senderIds);

  const senderProfiles = useMemo(() => {
    const map = new Map<string, { name: string; image: string | null }>();
    if (profilesData?.profiles) {
      for (const p of profilesData.profiles) {
        map.set(p.id, { name: p.name, image: p.image });
      }
    }
    return map;
  }, [profilesData?.profiles]);

  const { unread, read } = useMemo(() => {
    if (!data?.notifications) return { unread: [], read: [] };
    return {
      unread: data.notifications.filter((n) => n.readAt === null),
      read: data.notifications.filter((n) => n.readAt !== null),
    };
  }, [data?.notifications]);

  const sections = useMemo(() => {
    const items: Array<
      | { type: "header"; label: string; key: string }
      | { type: "separator"; key: string }
      | { type: "notification"; notification: Notification; key: string }
    > = [];

    if (unread.length > 0) {
      items.push({ type: "header", label: "Non lues", key: "header-unread" });
      for (const n of unread) {
        items.push({ type: "notification", notification: n, key: n.id });
      }
    }

    if (unread.length > 0 && read.length > 0) {
      items.push({ type: "separator", key: "separator" });
    }

    if (read.length > 0) {
      if (unread.length > 0) {
        items.push({ type: "header", label: "Lues", key: "header-read" });
      }
      for (const n of read) {
        items.push({ type: "notification", notification: n, key: n.id });
      }
    }

    return items;
  }, [unread, read]);

  function handleMarkAllAsRead() {
    for (const notification of unread) {
      markReadMutation.mutate({ notificationId: notification.id });
    }
  }

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
            setRespondedIds((prev) => new Set(prev).add(notification.id));
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
            setRespondedIds((prev) => new Set(prev).add(notification.id));
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
    ({ item }: { item: (typeof sections)[number] }) => {
      if (item.type === "header") {
        return (
          <View className="px-4 pb-1 pt-4">
            <Text className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {item.label}
            </Text>
          </View>
        );
      }

      if (item.type === "separator") {
        return <View className="mx-4 my-2 h-px bg-border" />;
      }

      const notification = item.notification;
      const requestId = notification.data?.requestId as string | undefined;
      const isThisRequest = requestId === respondingRequestId;

      const senderId = (notification.data?.senderId ??
        notification.data?.acceptorId) as string | undefined;
      const profile = senderId ? senderProfiles.get(senderId) : undefined;

      return (
        <NotificationItem
          notification={notification}
          senderImage={profile?.image ?? null}
          onPress={() => handleNotificationPress(notification)}
          onAccept={
            notification.type === "friend_request"
              ? () => handleAcceptRequest(notification)
              : undefined
          }
          onReject={
            notification.type === "friend_request"
              ? () => handleRejectRequest(notification)
              : undefined
          }
          isAccepting={isThisRequest && respondAction === "accept"}
          isRejecting={isThisRequest && respondAction === "reject"}
          responded={
            notification.readAt !== null || respondedIds.has(notification.id)
          }
        />
      );
    },
    [
      handleNotificationPress,
      handleAcceptRequest,
      handleRejectRequest,
      respondingRequestId,
      respondAction,
      respondedIds,
      senderProfiles,
    ],
  );

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
        <View className="border-b border-border px-4 py-3">
          <Text className="text-2xl font-bold text-foreground">
            Notifications
          </Text>
        </View>
        <NotificationListSkeleton />
      </SafeAreaView>
    );
  }

  if (!data || data.notifications.length === 0) {
    return (
      <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
        <View className="border-b border-border px-4 py-3">
          <Text className="text-2xl font-bold text-foreground">
            Notifications
          </Text>
        </View>
        <NoNotificationsEmpty />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <View className="flex-row items-center justify-between border-b border-border px-4 py-3">
        <View className="flex-row items-center gap-2">
          <Text className="text-2xl font-bold text-foreground">
            Notifications
          </Text>
          {unreadCount > 0 && (
            <View className="rounded-full bg-homecafe-pink px-2.5 py-0.5">
              <Text className="text-xs font-semibold text-white">
                {unreadCount} non lue{unreadCount > 1 ? "s" : ""}
              </Text>
            </View>
          )}
        </View>

        {unreadCount > 0 && (
          <Pressable
            onPress={handleMarkAllAsRead}
            disabled={markReadMutation.isPending}
            className="flex-row items-center gap-1 active:opacity-50"
          >
            <CheckCheck size={16} color="#8D7E7E" />
            <Text className="text-xs text-muted-foreground">Tout lu</Text>
          </Pressable>
        )}
      </View>

      <FlatList
        data={sections}
        renderItem={renderItem}
        keyExtractor={(item) => item.key}
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 24 }}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            tintColor="#F691C3"
            colors={["#F691C3"]}
          />
        }
      />
    </SafeAreaView>
  );
}
