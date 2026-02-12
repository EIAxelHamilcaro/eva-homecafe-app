import { type Href, useRouter } from "expo-router";
import { UserPlus, Users } from "lucide-react-native";
import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  Share,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { PublicPostCard } from "@/components/social/public-post-card";
import { Button } from "@/components/ui";
import { useFriendFeed } from "@/lib/api/hooks/use-friend-feed";
import { useTogglePostReaction } from "@/lib/api/hooks/use-posts";
import {
  formatPostDate,
  formatPostTime,
  stripHtml,
} from "@/lib/utils/post-format";
import type { FeedPost } from "@/types/post";

export default function SocialScreen() {
  const router = useRouter();
  const {
    data,
    isLoading,
    error,
    refetch,
    isRefetching,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useFriendFeed();
  const toggleReaction = useTogglePostReaction();

  const [localLikes, setLocalLikes] = useState<Record<string, boolean>>({});
  const [localCounts, setLocalCounts] = useState<Record<string, number>>({});

  const posts = useMemo(
    () => data?.pages.flatMap((page) => page.data) ?? [],
    [data],
  );
  const hasFriends = data?.pages[0]?.hasFriends ?? true;

  const handleLikePress = (
    postId: string,
    currentlyLiked: boolean,
    currentCount: number,
  ) => {
    setLocalLikes((prev) => ({ ...prev, [postId]: !currentlyLiked }));
    setLocalCounts((prev) => ({
      ...prev,
      [postId]: currentlyLiked ? currentCount - 1 : currentCount + 1,
    }));
    toggleReaction.mutate({ postId, emoji: "heart" });
  };

  const handlePostPress = (postId: string) => {
    router.push(`/(protected)/(tabs)/journal/post/${postId}` as Href);
  };

  const handleCommentPress = (postId: string) => {
    router.push(`/(protected)/(tabs)/journal/post/${postId}` as Href);
  };

  const handleSharePress = async (postId: string) => {
    try {
      await Share.share({
        message: "Regarde ce post sur HomeCafe !",
        url: `https://homecafe.app/posts/${postId}`,
      });
    } catch (_) {
      // Share cancellation is expected on iOS
    }
  };

  const isLiked = (post: FeedPost) => localLikes[post.id] ?? post.hasReacted;

  const likesCount = (post: FeedPost) =>
    localCounts[post.id] ?? post.reactionCount;

  const handleEndReached = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  const renderPost = ({ item }: { item: FeedPost }) => (
    <PublicPostCard
      id={item.id}
      authorName={item.author.displayName || item.author.name}
      authorAvatar={item.author.avatarUrl ?? undefined}
      date={formatPostDate(item.createdAt)}
      time={formatPostTime(item.createdAt)}
      content={stripHtml(item.content)}
      likesCount={likesCount(item)}
      isLiked={isLiked(item)}
      onPress={() => handlePostPress(item.id)}
      onLikePress={() =>
        handleLikePress(item.id, isLiked(item), likesCount(item))
      }
      onCommentPress={() => handleCommentPress(item.id)}
      onSharePress={() => handleSharePress(item.id)}
      className="mb-4"
    />
  );

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#F691C3" />
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
        <View className="flex-1 items-center justify-center px-4">
          <Text className="text-center text-base text-destructive">
            Erreur lors du chargement du feed
          </Text>
          <Text className="mt-2 text-center text-sm text-muted-foreground">
            {error.message}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!hasFriends) {
    return (
      <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
        <View className="flex-1 px-4">
          <Text className="mb-4 text-2xl font-bold text-foreground">
            Social
          </Text>
          <View className="flex-1 items-center justify-center">
            <UserPlus size={48} color="#9CA3AF" />
            <Text className="mt-4 text-xl font-bold text-foreground">
              Ajoutez des amis
            </Text>
            <Text className="mb-6 mt-2 text-center text-base text-muted-foreground">
              Partagez votre code ami pour voir les posts de vos proches
            </Text>
            <Button
              onPress={() => router.push("/(protected)/friends" as Href)}
              className="flex-row items-center justify-center gap-2"
            >
              <UserPlus size={20} color="#fff" />
              <Text className="text-base font-semibold text-white">
                Ajouter des amis
              </Text>
            </Button>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  if (posts.length === 0) {
    return (
      <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
        <View className="flex-1 px-4">
          <Text className="mb-4 text-2xl font-bold text-foreground">
            Social
          </Text>
          <View className="flex-1 items-center justify-center">
            <Users size={48} color="#9CA3AF" />
            <Text className="mt-4 text-xl font-bold text-foreground">
              Aucun post pour le moment
            </Text>
            <Text className="mt-2 text-center text-base text-muted-foreground">
              Vos amis n'ont pas encore publie de posts publics
            </Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <View className="flex-1 px-4">
        <Text className="mb-4 text-2xl font-bold text-foreground">Social</Text>

        <FlatList
          data={posts}
          renderItem={renderPost}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 24 }}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={refetch}
              tintColor="#F691C3"
              colors={["#F691C3"]}
            />
          }
          onEndReached={handleEndReached}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            isFetchingNextPage ? (
              <View className="items-center py-4">
                <ActivityIndicator size="small" color="#F691C3" />
              </View>
            ) : null
          }
        />
      </View>
    </SafeAreaView>
  );
}
