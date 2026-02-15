import { type Href, useRouter } from "expo-router";
import {
  ArrowLeft,
  Globe,
  Heart,
  Lock,
  MessageCircleMore,
} from "lucide-react-native";
import { useState } from "react";
import { Image, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTogglePostReaction, useUserPosts } from "@/lib/api/hooks/use-posts";
import { useTogglePostPrivacy } from "@/lib/api/hooks/use-toggle-post-privacy";
import { stripHtml, truncate } from "@/lib/utils/post-format";
import { colors } from "@/src/config/colors";

function formatDateHeading(isoString: string): string {
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return isoString;
  return date.toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatTime(isoString: string): string {
  const date = new Date(isoString);
  const hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${hours}h${minutes}`;
}

export default function PostsListScreen() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const { data, isLoading, error } = useUserPosts(page);
  const togglePrivacy = useTogglePostPrivacy();
  const toggleReaction = useTogglePostReaction();
  const [bouncingIds, setBouncingIds] = useState<Set<string>>(new Set());
  const [localPrivacy, setLocalPrivacy] = useState<Record<string, boolean>>({});
  const [localReactions, setLocalReactions] = useState<
    Record<string, { count: number; hasReacted: boolean }>
  >({});

  function handleTogglePrivacy(postId: string, currentIsPrivate: boolean) {
    const newValue = !currentIsPrivate;
    setLocalPrivacy((prev) => ({ ...prev, [postId]: newValue }));
    setBouncingIds((prev) => new Set(prev).add(postId));
    setTimeout(() => {
      setBouncingIds((prev) => {
        const next = new Set(prev);
        next.delete(postId);
        return next;
      });
    }, 400);
    togglePrivacy.mutate({ postId, isPrivate: newValue });
  }

  function handleToggleReaction(
    postId: string,
    currentHasReacted: boolean,
    currentCount: number,
  ) {
    if (toggleReaction.isPending) return;
    const newHasReacted = !currentHasReacted;
    const newCount = newHasReacted ? currentCount + 1 : currentCount - 1;
    setLocalReactions((prev) => ({
      ...prev,
      [postId]: { count: newCount, hasReacted: newHasReacted },
    }));
    toggleReaction.mutate(
      { postId, emoji: "\u2764\uFE0F" },
      {
        onSuccess: (result) => {
          setLocalReactions((prev) => ({
            ...prev,
            [postId]: {
              hasReacted: result.action === "added",
              count:
                result.action === "added"
                  ? currentCount + (currentHasReacted ? 0 : 1)
                  : currentCount - (currentHasReacted ? 1 : 0),
            },
          }));
        },
        onError: () => {
          setLocalReactions((prev) => ({
            ...prev,
            [postId]: { count: currentCount, hasReacted: currentHasReacted },
          }));
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
        {/* Header */}
        <View className="mb-6 flex-row items-center gap-3">
          <Pressable
            onPress={() => router.back()}
            className="h-10 w-10 items-center justify-center rounded-full bg-muted"
          >
            <ArrowLeft size={20} color={colors.foreground} />
          </Pressable>
          <Text className="text-2xl font-semibold text-foreground">
            Tous mes posts
          </Text>
        </View>

        {/* Loading */}
        {isLoading && (
          <View className="gap-4">
            {[1, 2, 3].map((i) => (
              <View key={i} className="h-48 rounded-lg bg-muted opacity-50" />
            ))}
          </View>
        )}

        {/* Error */}
        {error && (
          <View className="rounded-xl border border-destructive/50 bg-destructive/10 p-4">
            <Text className="text-center text-sm text-destructive">
              {error.message}
            </Text>
          </View>
        )}

        {/* Empty */}
        {!isLoading && !error && (!data || data.posts.length === 0) && (
          <View
            className="rounded-xl p-8"
            style={{ borderWidth: 12, borderColor: "rgba(4, 160, 86, 0.2)" }}
          >
            <Text className="mb-2 text-center text-lg font-medium text-muted-foreground">
              Aucun post pour le moment
            </Text>
            <Pressable
              onPress={() =>
                router.push("/(protected)/(tabs)/journal/create" as Href)
              }
              className="mt-4 self-center rounded-full bg-primary px-6 py-2 active:opacity-90"
            >
              <Text className="text-sm font-medium text-primary-foreground">
                Créer ton premier post
              </Text>
            </Pressable>
          </View>
        )}

        {/* Posts list */}
        {!isLoading && !error && data && data.posts.length > 0 && (
          <View className="gap-4">
            {data.posts.map((post) => {
              const isBouncing = bouncingIds.has(post.id);
              const isPrivate = localPrivacy[post.id] ?? post.isPrivate;

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
                  <View className="relative p-4 pb-0">
                    <View className="pr-10">
                      <Text className="text-xl font-bold capitalize text-foreground">
                        {formatDateHeading(post.createdAt)}
                      </Text>
                      <Text className="mt-0.5 text-sm text-muted-foreground">
                        {formatTime(post.createdAt)}
                      </Text>
                    </View>

                    <Pressable
                      onPress={() => handleTogglePrivacy(post.id, isPrivate)}
                      className="absolute right-4 top-4 h-9 w-9 items-center justify-center rounded-full"
                      style={[
                        {
                          backgroundColor: isPrivate
                            ? colors.homecafe.blue
                            : "#10B981",
                        },
                        isBouncing
                          ? { transform: [{ scale: 1.25 }] }
                          : undefined,
                      ]}
                    >
                      {isPrivate ? (
                        <Lock size={16} color="#fff" />
                      ) : (
                        <Globe size={16} color="#fff" />
                      )}
                    </Pressable>
                  </View>

                  <View className="px-4 pb-4 pt-3">
                    <Text className="text-base text-foreground">
                      {truncate(stripHtml(post.content), 200)}
                    </Text>

                    {post.images.length > 0 && (
                      <View className="mt-4 flex-row gap-2">
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
                      onPress={() => {
                        const reactionState = localReactions[post.id];
                        const hasReacted =
                          reactionState?.hasReacted ?? post.hasReacted;
                        const count =
                          reactionState?.count ?? post.reactionCount;
                        handleToggleReaction(post.id, hasReacted, count);
                      }}
                      className="flex-row items-center gap-1.5 p-2 active:opacity-60"
                    >
                      <Heart
                        size={20}
                        color="#EF4444"
                        fill={
                          (localReactions[post.id]?.hasReacted ??
                          post.hasReacted)
                            ? "#EF4444"
                            : "transparent"
                        }
                      />
                      {(localReactions[post.id]?.count ?? post.reactionCount) >
                        0 && (
                        <Text className="text-sm text-muted-foreground">
                          {localReactions[post.id]?.count ?? post.reactionCount}
                        </Text>
                      )}
                    </Pressable>
                    <View className="flex-row items-center gap-1.5 p-2">
                      <MessageCircleMore
                        size={20}
                        color={colors.mutedForeground}
                      />
                      {post.commentCount > 0 && (
                        <Text className="text-sm text-muted-foreground">
                          {post.commentCount}
                        </Text>
                      )}
                    </View>
                  </View>
                </Pressable>
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
      </ScrollView>
    </SafeAreaView>
  );
}
