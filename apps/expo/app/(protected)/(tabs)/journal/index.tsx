import { type Href, useRouter } from "expo-router";
import { Flame, NotebookPen, Plus } from "lucide-react-native";
import { useState } from "react";
import { ActivityIndicator, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { type PostData, PostFeed } from "@/components/journal/post-feed";
import { Button, Logo } from "@/components/ui";
import { useJournalEntries } from "@/lib/api/hooks/use-journal";
import { useJournalStreak } from "@/lib/api/hooks/use-journal-streak";
import { useTogglePostReaction } from "@/lib/api/hooks/use-posts";
import {
  formatPostDate,
  formatPostTime,
  stripHtml,
} from "@/lib/utils/post-format";
import type { Post } from "@/types/post";

function mapPostToPostData(post: Post, isLiked: boolean): PostData {
  return {
    id: post.id,
    date: formatPostDate(post.createdAt),
    time: formatPostTime(post.createdAt),
    content: stripHtml(post.content),
    likesCount: 0,
    isPrivate: post.isPrivate,
    isLiked,
  };
}

export default function JournalScreen() {
  const router = useRouter();
  const { data, isLoading, error } = useJournalEntries();
  const { data: streakData } = useJournalStreak();
  const toggleReaction = useTogglePostReaction();
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());

  const posts: PostData[] =
    data?.groups.flatMap((group) =>
      group.posts.map((post) =>
        mapPostToPostData(post, likedPosts.has(post.id)),
      ),
    ) ?? [];

  const handleAddPost = () => {
    router.push("/(protected)/(tabs)/journal/create" as Href);
  };

  const handlePostPress = (postId: string) => {
    router.push(`/(protected)/(tabs)/journal/post/${postId}` as Href);
  };

  const handleLikePress = (postId: string) => {
    setLikedPosts((prev) => {
      const next = new Set(prev);
      if (next.has(postId)) {
        next.delete(postId);
      } else {
        next.add(postId);
      }
      return next;
    });
    toggleReaction.mutate({ postId, emoji: "❤️" });
  };

  const handleCommentPress = (postId: string) => {
    router.push(`/(protected)/(tabs)/journal/post/${postId}` as Href);
  };

  const handleRepostPress = (_postId: string) => {};

  const handleSharePress = (_postId: string) => {};

  const HeaderComponent = (
    <View className="mb-4">
      {streakData && streakData.currentStreak > 0 && (
        <View className="flex-row items-center gap-2 mb-4 bg-orange-50 rounded-xl p-3 border border-orange-200">
          <Flame size={20} color="#F97316" />
          <Text className="text-orange-700 font-semibold text-base">
            {streakData.currentStreak} jours de suite
          </Text>
          {streakData.longestStreak > streakData.currentStreak && (
            <Text className="text-orange-400 text-sm">
              (record : {streakData.longestStreak})
            </Text>
          )}
        </View>
      )}

      <Button
        onPress={handleAddPost}
        className="flex-row items-center justify-center gap-2"
      >
        <Plus size={20} color="#fff" />
        <Text className="text-white font-semibold text-base">
          Ajouter un post
        </Text>
      </Button>

      <View className="mt-6 mb-2">
        <Text className="text-foreground text-2xl font-bold">
          Derniers posts
        </Text>
      </View>
    </View>
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

  if (error) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <View className="flex-1 items-center justify-center px-4">
          <Text className="text-destructive text-center text-base">
            Erreur lors du chargement du journal
          </Text>
          <Text className="text-muted-foreground text-center text-sm mt-2">
            {error.message}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (posts.length === 0) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <View className="flex-1 px-4">
          <View className="items-center py-4">
            <Logo width={80} />
          </View>
          <View className="flex-1 items-center justify-center">
            <NotebookPen size={48} color="#9CA3AF" />
            <Text className="text-foreground text-xl font-bold mt-4">
              Votre journal est vide
            </Text>
            <Text className="text-muted-foreground text-center text-base mt-2 mb-6">
              Commencez par ecrire votre premier post
            </Text>
            <Button
              onPress={handleAddPost}
              className="flex-row items-center justify-center gap-2"
            >
              <Plus size={20} color="#fff" />
              <Text className="text-white font-semibold text-base">
                Ecrire mon premier post
              </Text>
            </Button>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-1 px-4">
        <View className="items-center py-4">
          <Logo width={80} />
        </View>

        <PostFeed
          posts={posts}
          onPostPress={handlePostPress}
          onLikePress={handleLikePress}
          onCommentPress={handleCommentPress}
          onRepostPress={handleRepostPress}
          onSharePress={handleSharePress}
          ListHeaderComponent={HeaderComponent}
        />
      </View>
    </SafeAreaView>
  );
}
