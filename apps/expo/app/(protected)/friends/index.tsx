import { useRouter } from "expo-router";
import {
  ArrowLeft,
  Check,
  Loader2,
  QrCode,
  ScanLine,
  UserMinus,
  UserPlus,
  Users,
  X,
} from "lucide-react-native";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  FlatList,
  Image,
  Pressable,
  RefreshControl,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Button } from "@/components/ui/button";
import {
  usePendingRequests,
  useRespondRequest,
} from "@/lib/api/hooks/use-friend-requests";
import { useFriends, useRemoveFriend } from "@/lib/api/hooks/use-friends";
import { colors } from "@/src/config/colors";
import type { Friend, PendingRequestWithSender } from "@/types/friend";

function getAvatarUrl(avatarUrl: string | null): string | null {
  if (!avatarUrl) return null;
  if (avatarUrl.startsWith("http")) return avatarUrl;
  return `${process.env.EXPO_PUBLIC_API_URL}${avatarUrl}`;
}

function AvatarCircle({
  src,
  name,
  size = "md",
}: {
  src: string | null;
  name: string | null;
  size?: "sm" | "md";
}) {
  const dimension = size === "sm" ? 32 : 44;
  const textSize = size === "sm" ? "text-xs" : "text-sm";
  const initial = (name ?? "?").charAt(0).toUpperCase();
  const uri = getAvatarUrl(src);

  if (uri) {
    return (
      <Image
        source={{ uri }}
        style={{
          width: dimension,
          height: dimension,
          borderRadius: dimension / 2,
        }}
        resizeMode="cover"
      />
    );
  }

  return (
    <View
      className="items-center justify-center rounded-full bg-homecafe-pink/20"
      style={{ width: dimension, height: dimension }}
    >
      <Text className={`${textSize} font-semibold text-homecafe-pink`}>
        {initial}
      </Text>
    </View>
  );
}

function FriendItem({
  friend,
  onRemove,
  isRemoving,
}: {
  friend: Friend;
  onRemove: (friendUserId: string) => void;
  isRemoving: boolean;
}) {
  const displayName = friend.displayName || friend.name || friend.email;

  return (
    <View className="flex-row items-center px-4 py-3">
      <AvatarCircle src={friend.avatarUrl} name={displayName} />
      <View className="ml-3 flex-1">
        <Text
          className="text-base font-medium text-foreground"
          numberOfLines={1}
        >
          {displayName}
        </Text>
        <Text className="text-sm text-muted-foreground" numberOfLines={1}>
          {friend.email}
        </Text>
      </View>
      <Pressable
        onPress={() => {
          Alert.alert(
            "Retirer cet ami ?",
            `Voulez-vous vraiment retirer ${displayName} de votre liste d'amis ?`,
            [
              { text: "Annuler", style: "cancel" },
              {
                text: "Retirer",
                style: "destructive",
                onPress: () => onRemove(friend.userId),
              },
            ],
          );
        }}
        disabled={isRemoving}
        className="ml-2 h-9 w-9 items-center justify-center rounded-full active:bg-muted"
      >
        {isRemoving ? (
          <Loader2 size={16} color={colors.mutedForeground} />
        ) : (
          <UserMinus size={16} color={colors.mutedForeground} />
        )}
      </Pressable>
    </View>
  );
}

function RequestItem({
  request,
  onRespond,
  isPending,
  respondingAction,
}: {
  request: PendingRequestWithSender;
  onRespond: (requestId: string, accept: boolean) => void;
  isPending: boolean;
  respondingAction: "accept" | "reject" | null;
}) {
  const displayName =
    request.senderDisplayName ?? request.senderName ?? "Utilisateur";

  return (
    <View className="flex-row items-center px-4 py-3">
      <AvatarCircle src={request.senderAvatarUrl} name={displayName} />
      <View className="ml-3 flex-1">
        <Text
          className="text-base font-medium text-foreground"
          numberOfLines={1}
        >
          {displayName}
        </Text>
        <Text className="text-sm text-muted-foreground" numberOfLines={1}>
          {request.senderEmail}
        </Text>
      </View>
      <View className="ml-2 flex-row gap-1.5">
        <Button
          variant="default"
          size="sm"
          onPress={() => onRespond(request.id, true)}
          loading={isPending && respondingAction === "accept"}
          disabled={isPending}
          className="bg-green-600"
        >
          <View className="flex-row items-center gap-1">
            <Check size={14} color="#FFFFFF" />
          </View>
        </Button>
        <Button
          variant="outline"
          size="sm"
          onPress={() => onRespond(request.id, false)}
          loading={isPending && respondingAction === "reject"}
          disabled={isPending}
        >
          <View className="flex-row items-center gap-1">
            <X size={14} color="#3D2E2E" />
          </View>
        </Button>
      </View>
    </View>
  );
}

function EmptyState({ onAddFriend }: { onAddFriend: () => void }) {
  return (
    <View className="flex-1 items-center justify-center px-8 py-20">
      <View className="mb-4 h-20 w-20 items-center justify-center rounded-full bg-muted">
        <Users size={40} color="#9CA3AF" />
      </View>
      <Text className="mb-2 text-center text-lg font-semibold text-foreground">
        Aucun ami
      </Text>
      <Text className="mb-6 text-center text-sm leading-5 text-muted-foreground">
        Envoyez des invitations pour ajouter des amis
      </Text>
      <Button variant="default" onPress={onAddFriend}>
        <View className="flex-row items-center gap-2">
          <UserPlus size={18} color="#FFFFFF" />
          <Text className="font-medium text-white">Ajouter un ami</Text>
        </View>
      </Button>
    </View>
  );
}

function ShimmerEffect({ children }: { children: React.ReactNode }) {
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]),
    );
    animation.start();
    return () => animation.stop();
  }, [animatedValue]);

  const opacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return <Animated.View style={{ opacity }}>{children}</Animated.View>;
}

function FriendListSkeleton() {
  return (
    <View>
      {Array.from({ length: 5 }).map((_, index) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: static skeleton list never reorders
        <ShimmerEffect key={index}>
          <View className="flex-row items-center px-4 py-3">
            <View className="h-11 w-11 rounded-full bg-muted" />
            <View className="ml-3 flex-1">
              <View className="mb-2 h-4 w-32 rounded bg-muted" />
              <View className="h-3 w-48 rounded bg-muted" />
            </View>
          </View>
        </ShimmerEffect>
      ))}
    </View>
  );
}

type ListItem =
  | { type: "requests-header"; key: string }
  | { type: "request"; request: PendingRequestWithSender; key: string }
  | { type: "friends-header"; key: string }
  | { type: "friend"; friend: Friend; key: string }
  | { type: "separator"; key: string }
  | { type: "empty"; key: string };

export default function FriendsScreen() {
  const router = useRouter();
  const { data, isLoading, isRefetching, refetch } = useFriends();
  const { data: pendingData, refetch: refetchPending } = usePendingRequests();
  const removeFriendMutation = useRemoveFriend();
  const respondMutation = useRespondRequest();

  const [respondingRequestId, setRespondingRequestId] = useState<string | null>(
    null,
  );
  const [respondAction, setRespondAction] = useState<
    "accept" | "reject" | null
  >(null);

  const friends = data?.friends ?? [];
  const requests = pendingData?.requests ?? [];
  const pendingCount = pendingData?.pagination?.total ?? 0;

  const handleGoBack = useCallback(() => {
    router.back();
  }, [router]);

  const handleAddFriend = useCallback(() => {
    router.push("/friends/add");
  }, [router]);

  const handleShowQRCode = useCallback(() => {
    router.push("/friends/qr-code");
  }, [router]);

  const handleScanQRCode = useCallback(() => {
    router.push("/friends/scan");
  }, [router]);

  const handleRemoveFriend = useCallback(
    (friendUserId: string) => {
      removeFriendMutation.mutate({ friendUserId });
    },
    [removeFriendMutation],
  );

  const handleRespondRequest = useCallback(
    (requestId: string, accept: boolean) => {
      setRespondingRequestId(requestId);
      setRespondAction(accept ? "accept" : "reject");
      respondMutation.mutate(
        { requestId, accept },
        {
          onSettled: () => {
            setRespondingRequestId(null);
            setRespondAction(null);
          },
        },
      );
    },
    [respondMutation],
  );

  async function handleRefresh() {
    await Promise.all([refetch(), refetchPending()]);
  }

  const listItems: ListItem[] = [];

  if (requests.length > 0) {
    listItems.push({
      type: "requests-header",
      key: "requests-header",
    });
    for (const request of requests) {
      listItems.push({ type: "request", request, key: `req-${request.id}` });
    }
    if (friends.length > 0) {
      listItems.push({ type: "separator", key: "sep" });
    }
  }

  if (friends.length > 0) {
    listItems.push({ type: "friends-header", key: "friends-header" });
    for (const friend of friends) {
      listItems.push({ type: "friend", friend, key: `friend-${friend.id}` });
    }
  }

  if (friends.length === 0 && requests.length === 0 && !isLoading) {
    listItems.push({ type: "empty", key: "empty" });
  }

  const renderItem = useCallback(
    ({ item }: { item: ListItem }) => {
      switch (item.type) {
        case "requests-header":
          return (
            <View className="flex-row items-center gap-2 px-4 pb-1 pt-4">
              <Text className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Demandes en attente
              </Text>
              {pendingCount > 0 && (
                <View className="rounded-full bg-homecafe-pink px-2 py-0.5">
                  <Text className="text-[10px] font-bold text-white">
                    {pendingCount}
                  </Text>
                </View>
              )}
            </View>
          );
        case "request":
          return (
            <RequestItem
              request={item.request}
              onRespond={handleRespondRequest}
              isPending={
                respondMutation.isPending &&
                respondingRequestId === item.request.id
              }
              respondingAction={
                respondingRequestId === item.request.id ? respondAction : null
              }
            />
          );
        case "friends-header":
          return (
            <View className="px-4 pb-1 pt-4">
              <Text className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Mes amis
              </Text>
            </View>
          );
        case "friend":
          return (
            <FriendItem
              friend={item.friend}
              onRemove={handleRemoveFriend}
              isRemoving={
                removeFriendMutation.isPending &&
                removeFriendMutation.variables?.friendUserId ===
                  item.friend.userId
              }
            />
          );
        case "separator":
          return <View className="mx-4 my-2 h-px bg-border" />;
        case "empty":
          return <EmptyState onAddFriend={handleAddFriend} />;
        default:
          return null;
      }
    },
    [
      pendingCount,
      respondMutation.isPending,
      respondingRequestId,
      respondAction,
      removeFriendMutation.isPending,
      removeFriendMutation.variables,
      handleAddFriend,
      handleRemoveFriend,
      handleRespondRequest,
    ],
  );

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
        <View className="flex-row items-center border-b border-border px-4 py-3">
          <Pressable
            onPress={handleGoBack}
            className="mr-3 h-10 w-10 items-center justify-center rounded-full active:bg-muted"
          >
            <ArrowLeft size={24} color="#3D2E2E" />
          </Pressable>
          <Text className="flex-1 text-xl font-semibold text-foreground">
            Mes amis
          </Text>
        </View>
        <FriendListSkeleton />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <View className="flex-row items-center border-b border-border px-4 py-3">
        <Pressable
          onPress={handleGoBack}
          className="mr-3 h-10 w-10 items-center justify-center rounded-full active:bg-muted"
        >
          <ArrowLeft size={24} color="#3D2E2E" />
        </Pressable>
        <Text className="flex-1 text-xl font-semibold text-foreground">
          Mes amis
        </Text>
        <View className="flex-row gap-1">
          <Pressable
            onPress={handleShowQRCode}
            className="h-10 w-10 items-center justify-center rounded-full active:bg-muted"
          >
            <QrCode size={22} color="#3D2E2E" />
          </Pressable>
          <Pressable
            onPress={handleScanQRCode}
            className="h-10 w-10 items-center justify-center rounded-full active:bg-muted"
          >
            <ScanLine size={22} color="#3D2E2E" />
          </Pressable>
          <Pressable
            onPress={handleAddFriend}
            className="h-10 w-10 items-center justify-center rounded-full active:bg-muted"
          >
            <UserPlus size={22} color="#3D2E2E" />
          </Pressable>
        </View>
      </View>

      <FlatList
        data={listItems}
        renderItem={renderItem}
        keyExtractor={(item) => item.key}
        contentContainerStyle={{ flexGrow: 1 }}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={handleRefresh}
            tintColor="#F691C3"
          />
        }
      />
    </SafeAreaView>
  );
}
