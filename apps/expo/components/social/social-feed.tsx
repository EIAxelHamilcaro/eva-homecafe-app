import { type Href, useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { useTogglePostReaction } from "@/lib/api/hooks/use-posts";
import { useTogglePostPrivacy } from "@/lib/api/hooks/use-toggle-post-privacy";
import { useUnifiedFeed } from "@/lib/api/hooks/use-unified-feed";
import {
  formatPostDate,
  formatPostTime,
  stripHtml,
  truncate,
} from "@/lib/utils/post-format";
import { useAuth } from "@/src/providers/auth-provider";
import { SocialFeedCard } from "./social-feed-card";

export function SocialFeed() {
  const router = useRouter();
  const { user } = useAuth();
  const [page, setPage] = useState(1);
  const { data, isLoading, error } = useUnifiedFeed(page);
  const togglePrivacy = useTogglePostPrivacy();
  const toggleReaction = useTogglePostReaction();
  const [bouncingIds, setBouncingIds] = useState<Set<string>>(new Set());
  const [localLikes, setLocalLikes] = useState<Record<string, boolean>>({});
  const [localCounts, setLocalCounts] = useState<Record<string, number>>({});

  function bounce(postId: string) {
    setBouncingIds((prev) => new Set(prev).add(postId));
    setTimeout(() => {
      setBouncingIds((prev) => {
        const next = new Set(prev);
        next.delete(postId);
        return next;
      });
    }, 400);
  }

  function handleTogglePrivacy(postId: string) {
    bounce(postId);
    togglePrivacy.mutate({ postId, isPrivate: true });
  }

  function handleToggleReaction(
    postId: string,
    currentlyReacted: boolean,
    currentCount: number,
  ) {
    setLocalLikes((prev) => ({ ...prev, [postId]: !currentlyReacted }));
    setLocalCounts((prev) => ({
      ...prev,
      [postId]: currentlyReacted ? currentCount - 1 : currentCount + 1,
    }));
    toggleReaction.mutate({ postId, emoji: "heart" });
  }

  const isLiked = (postId: string, serverReacted: boolean) =>
    localLikes[postId] ?? serverReacted;

  const likesCount = (postId: string, serverCount: number) =>
    localCounts[postId] ?? serverCount;

  return (
    <View className="rounded-lg border border-border/60 bg-card">
      {/* Header */}
      <View className="p-4 pb-2">
        <Text className="text-xl font-semibold text-foreground">
          Derniers posts publics
        </Text>
        <Text className="text-sm text-muted-foreground">
          Tes posts et ceux de tes amis
        </Text>
      </View>

      {/* Content */}
      <View className="px-4 pb-4">
        {isLoading && (
          <View className="gap-4">
            {[1, 2, 3].map((i) => (
              <View
                key={i}
                className="h-32 animate-pulse rounded-xl bg-muted"
              />
            ))}
          </View>
        )}

        {error && (
          <View className="rounded-xl border border-destructive/50 bg-destructive/10 p-4">
            <Text className="text-center text-destructive">
              {error.message}
            </Text>
          </View>
        )}

        {!isLoading && !error && data && data.data.length === 0 && (
          <View className="rounded-xl border-4 border-homecafe-green/20 p-8">
            <Text className="text-center text-sm text-muted-foreground">
              {data.hasFriends
                ? "Aucun post public pour le moment"
                : "Ajoute des amis pour voir leurs posts ici !"}
            </Text>
            {!data.hasFriends && (
              <Pressable
                onPress={() =>
                  router.push("/(protected)/(tabs)/profile" as Href)
                }
                className="mt-3 self-center rounded-full bg-homecafe-pink px-4 py-1.5"
              >
                <Text className="text-sm font-medium text-white">
                  Mon profil
                </Text>
              </Pressable>
            )}
          </View>
        )}

        {!isLoading && !error && data && data.data.length > 0 && (
          <View className="gap-3">
            {data.data.map((post) => {
              const reacted = isLiked(post.id, post.hasReacted);
              const count = likesCount(post.id, post.reactionCount);
              return (
                <SocialFeedCard
                  key={post.id}
                  dateHeading={formatPostDate(post.createdAt)}
                  authorName={post.author.displayName ?? post.author.name}
                  authorAvatar={post.author.avatarUrl}
                  time={formatPostTime(post.createdAt)}
                  content={truncate(stripHtml(post.content), 150)}
                  thumbnailUrl={
                    post.images.length > 0 ? (post.images[0] as string) : null
                  }
                  reactionCount={count}
                  hasReacted={reacted}
                  isOwn={post.author.id === user?.id}
                  isBouncing={bouncingIds.has(post.id)}
                  onPress={() =>
                    router.push(
                      `/(protected)/(tabs)/journal/post/${post.id}` as Href,
                    )
                  }
                  onTogglePrivacy={() => handleTogglePrivacy(post.id)}
                  onToggleReaction={() =>
                    handleToggleReaction(post.id, reacted, count)
                  }
                />
              );
            })}

            {/* Pagination */}
            {data.pagination.totalPages > 1 && (
              <View className="flex-row items-center justify-center gap-4 pt-4">
                <Pressable
                  onPress={() => setPage((p) => p - 1)}
                  disabled={!data.pagination.hasPreviousPage}
                  className="rounded-lg border border-border px-3 py-1.5"
                  style={
                    !data.pagination.hasPreviousPage
                      ? { opacity: 0.4 }
                      : undefined
                  }
                >
                  <Text className="text-sm text-foreground">Précédent</Text>
                </Pressable>
                <Text className="text-sm text-muted-foreground">
                  {data.pagination.page} / {data.pagination.totalPages}
                </Text>
                <Pressable
                  onPress={() => setPage((p) => p + 1)}
                  disabled={!data.pagination.hasNextPage}
                  className="rounded-lg border border-border px-3 py-1.5"
                  style={
                    !data.pagination.hasNextPage ? { opacity: 0.4 } : undefined
                  }
                >
                  <Text className="text-sm text-foreground">Suivant</Text>
                </Pressable>
              </View>
            )}
          </View>
        )}
      </View>
    </View>
  );
}
