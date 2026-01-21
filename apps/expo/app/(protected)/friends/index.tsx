import { useRouter } from "expo-router";
import { Plus, UserPlus, Users } from "lucide-react-native";
import { useCallback } from "react";
import {
  FlatList,
  Image,
  Pressable,
  RefreshControl,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Button } from "@/components/ui/button";
import { useFriends } from "@/lib/api/hooks/use-friends";
import type { Friend } from "@/types/friend";

function getAvatarUrl(avatarUrl: string | null): string | null {
  if (!avatarUrl) return null;
  if (avatarUrl.startsWith("http")) return avatarUrl;
  return `${process.env.EXPO_PUBLIC_API_URL}${avatarUrl}`;
}

function FriendItem({ friend }: { friend: Friend }) {
  const displayName = friend.displayName || friend.name || friend.email;
  const avatarUrl = getAvatarUrl(friend.avatarUrl);

  return (
    <View className="flex-row items-center px-4 py-3">
      {avatarUrl ? (
        <Image
          source={{ uri: avatarUrl }}
          className="h-12 w-12 rounded-full"
          resizeMode="cover"
        />
      ) : (
        <View className="h-12 w-12 items-center justify-center rounded-full bg-muted">
          <Text className="text-lg font-semibold text-muted-foreground">
            {displayName.charAt(0).toUpperCase()}
          </Text>
        </View>
      )}
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
        Ajoutez des amis pour commencer à discuter
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

function FriendListSkeleton() {
  return (
    <View>
      {Array.from({ length: 5 }).map((_, index) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: static skeleton list never reorders
        <View key={index} className="flex-row items-center px-4 py-3">
          <View className="h-12 w-12 animate-pulse rounded-full bg-muted" />
          <View className="ml-3 flex-1">
            <View className="mb-2 h-4 w-32 animate-pulse rounded bg-muted" />
            <View className="h-3 w-48 animate-pulse rounded bg-muted" />
          </View>
        </View>
      ))}
    </View>
  );
}

export default function FriendsScreen() {
  const router = useRouter();
  const { data, isLoading, isRefetching, refetch } = useFriends();

  const handleAddFriend = useCallback(() => {
    router.push("/friends/add");
  }, [router]);

  const renderItem = useCallback(
    ({ item }: { item: Friend }) => <FriendItem friend={item} />,
    [],
  );

  const keyExtractor = useCallback((item: Friend) => item.id, []);

  const ItemSeparator = useCallback(
    () => <View className="mx-4 h-px bg-border" />,
    [],
  );

  const ListEmptyComponent = useCallback(
    () => <EmptyState onAddFriend={handleAddFriend} />,
    [handleAddFriend],
  );

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
        <View className="flex-row items-center justify-between border-b border-border px-4 py-3">
          <Text className="text-xl font-semibold text-foreground">
            Mes amis
          </Text>
        </View>
        <FriendListSkeleton />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <View className="flex-row items-center justify-between border-b border-border px-4 py-3">
        <Text className="text-xl font-semibold text-foreground">Mes amis</Text>
        <Pressable
          onPress={handleAddFriend}
          className="h-10 w-10 items-center justify-center rounded-full active:bg-muted"
        >
          <Plus size={24} color="#3D2E2E" />
        </Pressable>
      </View>

      <FlatList
        data={data?.friends ?? []}
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
