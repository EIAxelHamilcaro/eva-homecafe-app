import { useState } from "react";
import { FlatList, RefreshControl, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  PublicPostCard,
  type PublicPostCardProps,
} from "@/components/social/public-post-card";

type PublicPost = Omit<
  PublicPostCardProps,
  | "onPress"
  | "onAuthorPress"
  | "onStickerPress"
  | "onLikePress"
  | "onCommentPress"
  | "onRepostPress"
  | "onSharePress"
  | "className"
>;

const MOCK_PUBLIC_POSTS: PublicPost[] = [
  {
    id: "1",
    authorName: "Marie Dupont",
    authorAvatar: "https://i.pravatar.cc/150?img=1",
    date: "Aujourd'hui",
    time: "14h30",
    content:
      "Journée incroyable au café ! Le nouveau blend colombien est une pure merveille. Qui d'autre l'a essayé ?",
    likesCount: 24,
    commentsCount: 5,
    isLiked: true,
  },
  {
    id: "2",
    authorName: "Thomas Martin",
    authorAvatar: "https://i.pravatar.cc/150?img=2",
    date: "Hier",
    time: "18h15",
    content:
      "Premier jour de ma routine café matinale. Objectif : 30 jours de café conscient. Jour 1 ✅",
    likesCount: 42,
    commentsCount: 12,
    stickerUrl:
      "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExcHVrNDloYnV0bGx0OG1rMnVxZ2x3cWF0dWJ0a2N4c3BjMnZ2bHE4aiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9cw/gjrYDwbjnK8x36xZIO/giphy.gif",
    isLiked: false,
  },
  {
    id: "3",
    authorName: "Sophie Bernard",
    authorAvatar: "https://i.pravatar.cc/150?img=3",
    date: "22 janv.",
    time: "09h00",
    content:
      "Petit moment de bonheur ce matin avec mon latte art. Après des semaines d'entraînement, je commence enfin à maîtriser la rosetta !",
    likesCount: 89,
    commentsCount: 23,
    isLiked: true,
  },
  {
    id: "4",
    authorName: "Lucas Petit",
    date: "21 janv.",
    time: "16h45",
    content:
      "Découverte du jour : le cold brew maison, c'est tellement simple et délicieux ! Recette dans les commentaires.",
    likesCount: 156,
    commentsCount: 34,
    isLiked: false,
  },
  {
    id: "5",
    authorName: "Emma Leroy",
    authorAvatar: "https://i.pravatar.cc/150?img=5",
    date: "20 janv.",
    time: "11h20",
    content:
      "Week-end de détente avec un bon livre et mon café préféré. Parfois, les petits plaisirs sont les meilleurs !",
    likesCount: 67,
    commentsCount: 8,
    isLiked: true,
  },
];

export default function SocialScreen() {
  const [posts, setPosts] = useState(MOCK_PUBLIC_POSTS);
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    // TODO: Fetch latest posts from backend
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setRefreshing(false);
  };

  const handleLikePost = (postId: string) => {
    setPosts((prev) =>
      prev.map((post) =>
        post.id === postId
          ? {
              ...post,
              isLiked: !post.isLiked,
              likesCount: post.isLiked
                ? post.likesCount - 1
                : post.likesCount + 1,
            }
          : post,
      ),
    );
  };

  const handlePostPress = (postId: string) => {
    console.log("Open post:", postId);
    // TODO: Navigate to post detail
  };

  const handleAuthorPress = (authorName: string) => {
    console.log("Open author profile:", authorName);
    // TODO: Navigate to author profile
  };

  const handleCommentPress = (postId: string) => {
    console.log("Open comments:", postId);
    // TODO: Navigate to comments
  };

  const handleSharePress = (postId: string) => {
    console.log("Share post:", postId);
    // TODO: Open share sheet
  };

  const renderPost = ({ item }: { item: PublicPost }) => (
    <PublicPostCard
      {...item}
      onPress={() => handlePostPress(item.id)}
      onAuthorPress={() => handleAuthorPress(item.authorName)}
      onLikePress={() => handleLikePost(item.id)}
      onCommentPress={() => handleCommentPress(item.id)}
      onSharePress={() => handleSharePress(item.id)}
      className="mb-4"
    />
  );

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <View className="flex-1 px-4">
        {/* Header */}
        <Text className="mb-4 text-2xl font-bold text-foreground">Social</Text>

        {/* Section title */}
        <Text className="mb-4 text-lg font-semibold text-foreground">
          Derniers posts publics
        </Text>

        {/* Post feed */}
        <FlatList
          data={posts}
          renderItem={renderPost}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 24 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor="#F691C3"
              colors={["#F691C3"]}
            />
          }
          ListEmptyComponent={
            <View className="flex-1 items-center justify-center py-12">
              <Text className="text-base text-muted-foreground">
                Aucun post public pour le moment
              </Text>
            </View>
          }
        />
      </View>
    </SafeAreaView>
  );
}
