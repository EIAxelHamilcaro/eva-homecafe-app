import { type Href, useLocalSearchParams, useRouter } from "expo-router";
import {
  Check,
  Globe,
  Heart,
  Lock,
  MessageCircleMore,
  Pencil,
  Trash2,
  X,
} from "lucide-react-native";
import { useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  useAddComment,
  useDeleteComment,
  useDeletePost,
  usePost,
  usePostComments,
  usePostReactions,
  useTogglePostReaction,
  useUpdateComment,
} from "@/lib/api/hooks/use-posts";
import { useTogglePostPrivacy } from "@/lib/api/hooks/use-toggle-post-privacy";
import { useToast } from "@/lib/toast/toast-context";
import {
  formatPostDate,
  formatPostTime,
  stripHtml,
} from "@/lib/utils/post-format";
import { colors } from "@/src/config/colors";
import { useAuth } from "@/src/providers/auth-provider";

function formatRelativeTime(isoString: string): string {
  const now = Date.now();
  const then = new Date(isoString).getTime();
  const diffMs = now - then;
  const diffMin = Math.floor(diffMs / 60_000);
  if (diffMin < 1) return "à l'instant";
  if (diffMin < 60) return `il y a ${diffMin} min`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `il y a ${diffH}h`;
  const diffD = Math.floor(diffH / 24);
  if (diffD < 7) return `il y a ${diffD}j`;
  return new Date(isoString).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
  });
}

export default function PostDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const postId = id ?? "";
  const { user } = useAuth();
  const currentUserId = user?.id ?? "";

  const { data: post, isLoading, error: postError } = usePost(postId);
  const { data: reactions } = usePostReactions(postId);
  const { data: comments } = usePostComments(postId);

  const deletePost = useDeletePost();
  const toggleReaction = useTogglePostReaction();
  const togglePrivacy = useTogglePostPrivacy();
  const addComment = useAddComment(postId);
  const deleteComment = useDeleteComment(postId);
  const updateComment = useUpdateComment(postId);
  const { showToast } = useToast();

  const commentInputRef = useRef<TextInput>(null);
  const [commentText, setCommentText] = useState("");
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingCommentText, setEditingCommentText] = useState("");
  const [localIsPrivate, setLocalIsPrivate] = useState<boolean | null>(null);

  const handleClose = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/journal");
    }
  };

  const handleEditPress = () => {
    if (postId) {
      router.push(`/(protected)/(tabs)/journal/edit/${postId}` as Href);
    }
  };

  const handleDeletePress = () => {
    Alert.alert(
      "Supprimer le post",
      "Voulez-vous vraiment supprimer cette publication ? Cette action est irréversible.",
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Supprimer",
          style: "destructive",
          onPress: () => {
            if (!postId) return;
            deletePost.mutate(postId, {
              onSuccess: () => {
                showToast("Post supprimé", "success");
                router.replace("/(protected)/(tabs)/journal");
              },
              onError: (err) => {
                showToast(
                  err.message ?? "Impossible de supprimer la publication",
                  "error",
                );
              },
            });
          },
        },
      ],
    );
  };

  const handleTogglePrivacy = () => {
    if (!postId || !post) return;
    const current = localIsPrivate ?? post.isPrivate;
    const newValue = !current;
    setLocalIsPrivate(newValue);
    togglePrivacy.mutate({ postId, isPrivate: newValue });
  };

  const handleToggleReaction = () => {
    if (!postId || toggleReaction.isPending) return;
    toggleReaction.mutate({ postId, emoji: "❤️" });
  };

  const handleSubmitComment = () => {
    const trimmed = commentText.trim();
    if (!trimmed || addComment.isPending) return;
    addComment.mutate(
      { content: trimmed },
      { onSuccess: () => setCommentText("") },
    );
  };

  const handleUpdateComment = (commentId: string) => {
    const trimmed = editingCommentText.trim();
    if (!trimmed) return;
    updateComment.mutate(
      { commentId, content: trimmed },
      {
        onSuccess: () => {
          setEditingCommentId(null);
          setEditingCommentText("");
        },
      },
    );
  };

  const handleDeleteComment = (commentId: string) => {
    if (deleteComment.isPending) return;
    deleteComment.mutate({ commentId });
  };

  const isOwner = post?.userId === currentUserId;
  const isPrivate = localIsPrivate ?? post?.isPrivate ?? false;
  const likeCount = reactions?.totalCount ?? 0;
  const userLiked = reactions
    ? reactions.reactions.some(
        (r) => r.emoji === "❤️" && r.userId === currentUserId,
      )
    : false;
  const commentList = comments?.comments ?? [];

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <View className="items-end px-4 py-2">
          <Pressable
            onPress={handleClose}
            className="h-10 w-10 items-center justify-center rounded-full border-2 border-primary"
          >
            <X size={20} color="#F691C3" />
          </Pressable>
        </View>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#F691C3" />
        </View>
      </SafeAreaView>
    );
  }

  if (postError || !post) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <View className="items-end px-4 py-2">
          <Pressable
            onPress={handleClose}
            className="h-10 w-10 items-center justify-center rounded-full border-2 border-primary"
          >
            <X size={20} color="#F691C3" />
          </Pressable>
        </View>
        <View className="flex-1 items-center justify-center px-4">
          <Text className="text-center text-base text-destructive">
            {postError?.message ?? "Post introuvable"}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <View className="items-end px-4 py-2">
          <Pressable
            onPress={handleClose}
            className="h-10 w-10 items-center justify-center rounded-full border-2 border-primary"
          >
            <X size={20} color="#F691C3" />
          </Pressable>
        </View>

        <ScrollView
          className="flex-1 px-4"
          contentContainerStyle={{ paddingBottom: 24 }}
          showsVerticalScrollIndicator={false}
        >
          <View className="overflow-hidden rounded-xl border border-border bg-card">
            <View className="relative p-4">
              <View className="pr-12">
                <Text className="text-xl font-bold capitalize text-foreground">
                  {formatPostDate(post.createdAt)}
                </Text>
                <Text className="mt-0.5 text-sm text-muted-foreground">
                  {formatPostTime(post.createdAt)}
                </Text>
              </View>

              {isOwner ? (
                <Pressable
                  onPress={handleTogglePrivacy}
                  className="absolute right-4 top-4 h-9 w-9 items-center justify-center rounded-full active:opacity-80"
                  style={{
                    backgroundColor: isPrivate
                      ? colors.homecafe.blue
                      : "#10B981",
                  }}
                >
                  {isPrivate ? (
                    <Lock size={16} color="#fff" />
                  ) : (
                    <Globe size={16} color="#fff" />
                  )}
                </Pressable>
              ) : (
                <View
                  className="absolute right-4 top-4 h-9 w-9 items-center justify-center rounded-full"
                  style={{ backgroundColor: "#10B981" }}
                >
                  <Globe size={16} color="#fff" />
                </View>
              )}
            </View>

            <View className="px-4 pb-4">
              <Text className="text-base leading-6 text-foreground">
                {stripHtml(post.content)}
              </Text>
            </View>

            {post.images.length > 0 && (
              <View className="flex-row flex-wrap gap-3 px-4 pb-4">
                {post.images.map((uri) => (
                  <View
                    key={uri}
                    className="overflow-hidden rounded-lg"
                    style={{
                      width: post.images.length === 1 ? "100%" : "47%",
                      aspectRatio: 16 / 9,
                    }}
                  >
                    <Image
                      source={{ uri }}
                      style={{ width: "100%", height: "100%" }}
                      resizeMode="cover"
                    />
                  </View>
                ))}
              </View>
            )}

            <View
              className="flex-row items-center justify-around px-4 py-3"
              style={{ backgroundColor: "rgba(183, 127, 255, 0.15)" }}
            >
              <Pressable
                onPress={handleToggleReaction}
                disabled={toggleReaction.isPending}
                className="flex-row items-center gap-1.5 p-2 active:opacity-60"
                style={toggleReaction.isPending ? { opacity: 0.5 } : undefined}
              >
                <Heart
                  size={20}
                  color="#EF4444"
                  fill={userLiked ? "#EF4444" : "transparent"}
                />
                {likeCount > 0 && (
                  <Text className="text-sm text-muted-foreground">
                    {likeCount}
                  </Text>
                )}
              </Pressable>
              <Pressable
                onPress={() => commentInputRef.current?.focus()}
                className="flex-row items-center gap-1.5 p-2 active:opacity-60"
              >
                <MessageCircleMore size={20} color={colors.mutedForeground} />
                {commentList.length > 0 && (
                  <Text className="text-sm text-muted-foreground">
                    {commentList.length}
                  </Text>
                )}
              </Pressable>
            </View>
          </View>

          <View className="mt-4 gap-3">
            <TextInput
              ref={commentInputRef}
              value={commentText}
              onChangeText={setCommentText}
              placeholder="Ajouter un commentaire"
              placeholderTextColor={colors.mutedForeground}
              multiline
              numberOfLines={2}
              className="rounded-lg border border-border bg-transparent px-4 py-3 text-sm text-foreground"
              style={{ minHeight: 56, textAlignVertical: "top" }}
            />
            <View className="items-end">
              <Pressable
                onPress={handleSubmitComment}
                disabled={!commentText.trim() || addComment.isPending}
                className="rounded-full bg-primary px-6 py-2 active:opacity-80"
                style={
                  !commentText.trim() || addComment.isPending
                    ? { opacity: 0.5 }
                    : undefined
                }
              >
                <Text className="text-sm font-medium text-primary-foreground">
                  {addComment.isPending ? "Envoi..." : "Envoyer"}
                </Text>
              </Pressable>
            </View>
          </View>

          {commentList.length > 0 && (
            <View className="mt-4 gap-3">
              {commentList.map((comment) => {
                const name = comment.displayName ?? comment.userName;
                const isEditing = editingCommentId === comment.id;
                const isCommentOwner = comment.userId === currentUserId;

                return (
                  <View
                    key={comment.id}
                    className="flex-row gap-3 rounded-lg border border-border bg-card p-4"
                  >
                    {comment.avatarUrl ? (
                      <Image
                        source={{ uri: comment.avatarUrl }}
                        className="h-8 w-8 rounded-full"
                        resizeMode="cover"
                      />
                    ) : (
                      <View className="h-8 w-8 items-center justify-center rounded-full bg-homecafe-pink/20">
                        <Text className="text-xs font-medium text-homecafe-pink">
                          {name.charAt(0).toUpperCase()}
                        </Text>
                      </View>
                    )}

                    <View className="min-w-0 flex-1">
                      <View className="flex-row items-center gap-2">
                        <Text className="text-sm font-semibold text-foreground">
                          {name}
                        </Text>
                        <Text className="text-xs text-muted-foreground">
                          {formatRelativeTime(comment.createdAt)}
                        </Text>
                      </View>

                      {isEditing ? (
                        <View className="mt-1 flex-row items-center gap-2">
                          <TextInput
                            value={editingCommentText}
                            onChangeText={setEditingCommentText}
                            className="flex-1 rounded-md border border-border bg-transparent px-2 py-1 text-sm text-foreground"
                            onSubmitEditing={() =>
                              handleUpdateComment(comment.id)
                            }
                          />
                          <Pressable
                            onPress={() => handleUpdateComment(comment.id)}
                            className="p-1 active:opacity-60"
                          >
                            <Check size={16} color="#10B981" />
                          </Pressable>
                          <Pressable
                            onPress={() => setEditingCommentId(null)}
                            className="p-1 active:opacity-60"
                          >
                            <X size={16} color={colors.mutedForeground} />
                          </Pressable>
                        </View>
                      ) : (
                        <Text className="mt-0.5 text-sm text-foreground">
                          {comment.content}
                        </Text>
                      )}
                    </View>

                    {isCommentOwner && !isEditing && (
                      <View className="flex-row gap-1">
                        <Pressable
                          onPress={() => {
                            setEditingCommentId(comment.id);
                            setEditingCommentText(comment.content);
                          }}
                          className="p-1 active:opacity-60"
                        >
                          <Pencil size={14} color={colors.mutedForeground} />
                        </Pressable>
                        <Pressable
                          onPress={() => handleDeleteComment(comment.id)}
                          disabled={deleteComment.isPending}
                          className="p-1 active:opacity-60"
                          style={
                            deleteComment.isPending
                              ? { opacity: 0.5 }
                              : undefined
                          }
                        >
                          <Trash2 size={14} color="#EF4444" />
                        </Pressable>
                      </View>
                    )}
                  </View>
                );
              })}
            </View>
          )}

          {isOwner && (
            <View className="mt-4 flex-row items-center gap-4">
              <Pressable
                onPress={handleEditPress}
                className="flex-row items-center gap-1.5 active:opacity-60"
              >
                <Pencil size={16} color={colors.mutedForeground} />
                <Text className="text-sm text-muted-foreground">Modifier</Text>
              </Pressable>
              <Pressable
                onPress={handleDeletePress}
                className="flex-row items-center gap-1.5 active:opacity-60"
              >
                <Trash2 size={16} color="#EF4444" />
                <Text className="text-sm text-destructive">Supprimer</Text>
              </Pressable>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
