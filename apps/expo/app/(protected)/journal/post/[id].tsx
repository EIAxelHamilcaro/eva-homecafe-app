import { useLocalSearchParams, useRouter } from "expo-router";
import { Lock, X } from "lucide-react-native";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ActionBar } from "../../../../components/shared/action-bar";
import { Button } from "../../../../components/ui/button";

type Comment = {
  id: string;
  author: string;
  content: string;
  createdAt: string;
};

const MOCK_POST = {
  id: "1",
  date: "Lundi 11 août 2025",
  time: "20h59",
  content:
    "Lorem ipsum dolor sit amet consectetur adipiscing elit aliquam mauris sed ma lorem ipsum dolor sit amet consectetur adipiscing elit aliquam mauris sed ma lorem ipsum dolor sit amet consectetur adipiscing elit aliquam mauris sed ma lorem ipsum dolor sit amet consectetur adipiscing elit aliquam mauris sed ma. Lorem ipsum dolor sit amet consectetur adipiscing elit aliquam mauris sed ma lorem ipsum dolor sit amet consectetur adipiscing elit aliquam mauris sed ma lorem ipsum dolor sit amet consectetur adipiscing elit aliquam mauris sed ma lorem ipsum dolor sit amet consectetur adipiscing elit aliquam mauris sed ma",
  likesCount: 4,
  isPrivate: true,
  isLiked: true,
};

const MOCK_COMMENTS: Comment[] = [];

export default function PostDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [post, setPost] = useState(MOCK_POST);
  const [comments, setComments] = useState<Comment[]>(MOCK_COMMENTS);
  const [commentText, setCommentText] = useState("");

  const handleClose = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/journal");
    }
  };

  const handleLikePress = () => {
    setPost((prev) => ({
      ...prev,
      isLiked: !prev.isLiked,
      likesCount: prev.isLiked ? prev.likesCount - 1 : prev.likesCount + 1,
    }));
  };

  const handleCommentPress = () => {
    // Focus comment input - handled by scroll to bottom
  };

  const handleRepostPress = () => {
    // Handle repost
    console.log("Repost post:", id);
  };

  const handleSharePress = () => {
    // Handle share
    console.log("Share post:", id);
  };

  const handleSendComment = () => {
    if (!commentText.trim()) return;

    const newComment: Comment = {
      id: String(Date.now()),
      author: "Eva Cadario",
      content: commentText.trim(),
      createdAt: new Date().toLocaleString("fr-FR"),
    };

    setComments((prev) => [...prev, newComment]);
    setCommentText("");
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        {/* Close button */}
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
          {/* Post card */}
          <View className="bg-card rounded-xl border border-border p-4 shadow-sm">
            {/* Header with date and lock */}
            <View className="flex-row items-start justify-between mb-3">
              <View>
                <Text className="text-foreground text-lg font-semibold">
                  {post.date}
                </Text>
                <Text className="text-muted-foreground text-sm">
                  {post.time}
                </Text>
              </View>
              {post.isPrivate && (
                <View className="bg-blue-500 rounded-lg p-2">
                  <Lock size={18} color="#FFFFFF" />
                </View>
              )}
            </View>

            {/* Content */}
            <Text className="text-foreground text-base leading-6 mb-3">
              {post.content}
            </Text>

            {/* Likes count */}
            <Text className="text-muted-foreground text-sm mb-3">
              {post.likesCount} {post.likesCount === 1 ? "like" : "likes"}
            </Text>

            {/* Action bar */}
            <ActionBar
              liked={post.isLiked}
              onLikePress={handleLikePress}
              onCommentPress={handleCommentPress}
              onRepostPress={handleRepostPress}
              onSharePress={handleSharePress}
            />
          </View>

          {/* Comments section */}
          {comments.length > 0 && (
            <View className="mt-4">
              <Text className="text-foreground font-semibold text-base mb-3">
                Commentaires ({comments.length})
              </Text>
              {comments.map((comment) => (
                <View
                  key={comment.id}
                  className="bg-card rounded-lg border border-border p-3 mb-2"
                >
                  <View className="flex-row items-center justify-between mb-1">
                    <Text className="text-foreground font-medium text-sm">
                      {comment.author}
                    </Text>
                    <Text className="text-muted-foreground text-xs">
                      {comment.createdAt}
                    </Text>
                  </View>
                  <Text className="text-foreground text-sm">
                    {comment.content}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </ScrollView>

        {/* Comment input section */}
        <View className="px-4 pb-4 pt-2 border-t border-border bg-background">
          <TextInput
            value={commentText}
            onChangeText={setCommentText}
            placeholder="Ajouter un commentaire"
            placeholderTextColor="#9CA3AF"
            multiline
            className="bg-card rounded-lg border border-border px-4 py-3 text-foreground text-base min-h-[48px] max-h-[120px] mb-3"
          />
          <View className="items-end">
            <Button
              onPress={handleSendComment}
              disabled={!commentText.trim()}
              className="rounded-full px-6"
            >
              Envoyer
            </Button>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
