import { type Href, useLocalSearchParams, useRouter } from "expo-router";
import { Lock, Pencil, Trash2, X } from "lucide-react-native";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ActionBar } from "@/components/shared/action-bar";
import {
  useDeletePost,
  usePost,
  useTogglePostReaction,
} from "@/lib/api/hooks/use-posts";
import { useToast } from "@/lib/toast/toast-context";
import {
  formatPostDate,
  formatPostTime,
  stripHtml,
} from "@/lib/utils/post-format";

export default function PostDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: post, isLoading, error } = usePost(id ?? "");
  const deletePost = useDeletePost();
  const toggleReaction = useTogglePostReaction();
  const { showToast } = useToast();
  const [liked, setLiked] = useState(false);

  const handleClose = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/journal");
    }
  };

  const handleEditPress = () => {
    if (id) {
      router.push(`/(protected)/(tabs)/journal/edit/${id}` as Href);
    }
  };

  const handleDeletePress = () => {
    Alert.alert(
      "Supprimer le post",
      "Es-tu sûr de vouloir supprimer ce post ? Cette action est irréversible.",
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Supprimer",
          style: "destructive",
          onPress: () => {
            if (!id) return;
            deletePost.mutate(id, {
              onSuccess: () => {
                showToast("Post supprimé", "success");
                router.replace("/(protected)/(tabs)/journal");
              },
              onError: (err) => {
                showToast(
                  err.message ?? "Erreur lors de la suppression",
                  "error",
                );
              },
            });
          },
        },
      ],
    );
  };

  const handleLikePress = () => {
    if (!id) return;
    setLiked((prev) => !prev);
    toggleReaction.mutate({ postId: id, emoji: "❤️" });
  };

  const handleCommentPress = () => {};

  const handleRepostPress = () => {};

  const handleSharePress = () => {};

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

  if (error || !post) {
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
          <Text className="text-destructive text-center text-base">
            {error?.message ?? "Post introuvable"}
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
          contentContainerStyle={{ paddingBottom: 16 }}
          showsVerticalScrollIndicator={false}
        >
          <View className="bg-card rounded-xl border border-border p-4 shadow-sm">
            <View className="flex-row items-start justify-between mb-3">
              <View>
                <Text className="text-foreground text-lg font-semibold">
                  {formatPostDate(post.createdAt)}
                </Text>
                <Text className="text-muted-foreground text-sm">
                  {formatPostTime(post.createdAt)}
                </Text>
              </View>
              <View className="flex-row items-center gap-2">
                {post.isPrivate && (
                  <View className="bg-blue-500 rounded-lg p-2">
                    <Lock size={18} color="#FFFFFF" />
                  </View>
                )}
                <Pressable
                  onPress={handleEditPress}
                  className="bg-muted rounded-lg p-2 active:opacity-60"
                  accessibilityRole="button"
                  accessibilityLabel="Modifier le post"
                >
                  <Pencil size={18} color="#6B7280" />
                </Pressable>
                <Pressable
                  onPress={handleDeletePress}
                  className="bg-red-100 rounded-lg p-2 active:opacity-60"
                  accessibilityRole="button"
                  accessibilityLabel="Supprimer le post"
                >
                  <Trash2 size={18} color="#EF4444" />
                </Pressable>
              </View>
            </View>

            <Text className="text-foreground text-base leading-6 mb-3">
              {stripHtml(post.content)}
            </Text>

            {post.images.length > 0 && (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                className="mb-3"
              >
                {post.images.map((uri) => (
                  <Image
                    key={uri}
                    source={{ uri }}
                    className="w-48 h-48 rounded-lg mr-2"
                    resizeMode="cover"
                  />
                ))}
              </ScrollView>
            )}

            <ActionBar
              liked={liked}
              onLikePress={handleLikePress}
              onCommentPress={handleCommentPress}
              onRepostPress={handleRepostPress}
              onSharePress={handleSharePress}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
