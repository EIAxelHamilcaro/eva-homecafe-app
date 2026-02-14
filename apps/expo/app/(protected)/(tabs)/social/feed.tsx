import { type Href, useRouter } from "expo-router";
import {
  ArrowLeft,
  Globe,
  Heart,
  MessageCircleMore,
} from "lucide-react-native";
import { useState } from "react";
import { Image, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTogglePostReaction } from "@/lib/api/hooks/use-posts";
import { useTogglePostPrivacy } from "@/lib/api/hooks/use-toggle-post-privacy";
import { useUnifiedFeed } from "@/lib/api/hooks/use-unified-feed";
import {
  formatPostDate,
  formatPostTime,
  stripHtml,
  truncate,
} from "@/lib/utils/post-format";
import { colors } from "@/src/config/colors";
import { useAuth } from "@/src/providers/auth-provider";

export default function SocialFeedScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const currentUserId = user?.id ?? "";
  const [page, setPage] = useState(1);
  const { data, isLoading, error } = useUnifiedFeed(page, 20);
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
    toggleReaction.mutate(
      { postId, emoji: "\u2764\uFE0F" },
      {
        onSuccess: (result) => {
          setLocalLikes((prev) => ({
            ...prev,
            [postId]: result.action === "added",
          }));
          setLocalCounts((prev) => ({
            ...prev,
            [postId]:
              result.action === "added"
                ? currentCount + (currentlyReacted ? 0 : 1)
                : currentCount - (currentlyReacted ? 1 : 0),
          }));
        },
        onError: () => {
          setLocalLikes((prev) => ({
            ...prev,
            [postId]: currentlyReacted,
          }));
          setLocalCounts((prev) => ({ ...prev, [postId]: currentCount }));
        },
      },
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="mb-6 flex-row items-center gap-3">
          <Pressable
            onPress={() => router.back()}
            className="h-10 w-10 items-center justify-center rounded-full bg-muted"
          >
            <ArrowLeft size={20} color={colors.foreground} />
          </Pressable>
          <View className="flex-1">
            <Text className="text-2xl font-semibold text-foreground">
              Posts publics
            </Text>
            <Text className="text-sm text-muted-foreground">
              Tes posts et ceux de tes amis
            </Text>
          </View>
        </View>

        {isLoading && (
          <View className="gap-4">
            {[1, 2, 3].map((i) => (
              <View key={i} className="h-48 rounded-lg bg-muted opacity-50" />
            ))}
          </View>
        )}

        {error && (
          <View className="rounded-xl border border-destructive/50 bg-destructive/10 p-4">
            <Text className="text-center text-sm text-destructive">
              {error.message}
            </Text>
          </View>
        )}

        {!isLoading && !error && (!data || data.data.length === 0) && (
          <View
            className="rounded-xl p-8"
            style={{ borderWidth: 12, borderColor: "rgba(4, 160, 86, 0.2)" }}
          >
            <Text className="mb-2 text-center text-lg font-medium text-muted-foreground">
              Aucun post pour le moment
            </Text>
            <Text className="text-center text-sm text-muted-foreground">
              {data?.hasFriends
                ? "Aucun post public pour le moment"
                : "Ajoute des amis pour voir leurs publications ici !"}
            </Text>
          </View>
        )}

        {!isLoading && !error && data && data.data.length > 0 && (
          <View className="gap-4">
            {data.data.map((post) => {
              const isOwn = post.author.id === currentUserId;
              const authorName = post.author.displayName ?? post.author.name;
              const hasReacted = localLikes[post.id] ?? post.hasReacted;
              const reactionCount = localCounts[post.id] ?? post.reactionCount;
              const isBouncing = bouncingIds.has(post.id);

              return (
                <Pressable
                  key={post.id}
                  onPress={() =>
                    router.push(
                      `/(protected)/(tabs)/journal/post/${post.id}` as Href,
                    )
                  }
                  className="overflow-hidden rounded-lg border border-border bg-card"
                >
                  <View className="flex-row items-center gap-3 px-4 pt-4">
                    {post.author.avatarUrl ? (
                      <Image
                        source={{ uri: post.author.avatarUrl }}
                        className="h-9 w-9 rounded-full"
                        resizeMode="cover"
                      />
                    ) : (
                      <View className="h-9 w-9 items-center justify-center rounded-full bg-homecafe-pink/20">
                        <Text className="text-sm font-medium text-homecafe-pink">
                          {authorName.charAt(0).toUpperCase()}
                        </Text>
                      </View>
                    )}
                    <View className="min-w-0 flex-1">
                      <Text className="text-sm font-semibold text-foreground">
                        {authorName}
                      </Text>
                      <Text className="text-xs capitalize text-muted-foreground">
                        {formatPostDate(post.createdAt)}
                        {" \u00B7 "}
                        {formatPostTime(post.createdAt)}
                      </Text>
                    </View>
                    {isOwn && (
                      <Pressable
                        onPress={() => handleTogglePrivacy(post.id)}
                        className="h-8 w-8 items-center justify-center rounded-full bg-emerald-500"
                        style={
                          isBouncing
                            ? { transform: [{ scale: 1.25 }] }
                            : undefined
                        }
                      >
                        <Globe size={14} color="#fff" />
                      </Pressable>
                    )}
                  </View>

                  <View className="px-4 pb-4 pt-3">
                    <Text className="text-sm text-foreground">
                      {truncate(stripHtml(post.content), 250)}
                    </Text>

                    {post.images.length > 0 && (
                      <View className="mt-3 flex-row gap-2">
                        {post.images.slice(0, 3).map((img, index) => (
                          <View
                            key={img}
                            className="relative flex-1 overflow-hidden rounded-lg"
                            style={{ aspectRatio: 1 }}
                          >
                            <Image
                              source={{ uri: img }}
                              style={{ width: "100%", height: "100%" }}
                              resizeMode="cover"
                            />
                            {index === 2 && post.images.length > 3 && (
                              <View className="absolute inset-0 items-center justify-center rounded-lg bg-black/40">
                                <Text className="text-lg font-semibold text-white">
                                  +{post.images.length - 3}
                                </Text>
                              </View>
                            )}
                          </View>
                        ))}
                      </View>
                    )}
                  </View>

                  <View
                    className="flex-row items-center justify-around px-4 py-3"
                    style={{ backgroundColor: "rgba(183, 127, 255, 0.15)" }}
                  >
                    <Pressable
                      onPress={() =>
                        handleToggleReaction(post.id, hasReacted, reactionCount)
                      }
                      className="flex-row items-center gap-1.5 p-2 active:opacity-60"
                    >
                      <Heart
                        size={20}
                        color="#EF4444"
                        fill={hasReacted ? "#EF4444" : "transparent"}
                      />
                      {reactionCount > 0 && (
                        <Text className="text-sm text-muted-foreground">
                          {reactionCount}
                        </Text>
                      )}
                    </Pressable>
                    <View className="flex-row items-center gap-1.5 p-2">
                      <MessageCircleMore
                        size={20}
                        color={colors.mutedForeground}
                      />
                      {(post.commentCount ?? 0) > 0 && (
                        <Text className="text-sm text-muted-foreground">
                          {post.commentCount}
                        </Text>
                      )}
                    </View>
                  </View>
                </Pressable>
              );
            })}

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
                  <Text className="text-sm text-foreground">
                    Pr{"\u00E9"}c{"\u00E9"}dent
                  </Text>
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
      </ScrollView>
    </SafeAreaView>
  );
}
