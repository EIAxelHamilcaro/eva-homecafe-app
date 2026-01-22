import { type Href, useRouter } from "expo-router";
import { Plus } from "lucide-react-native";
import { SafeAreaView, Text, View } from "react-native";

import { type PostData, PostFeed } from "../../../components/journal/post-feed";
import { Button, Logo } from "../../../components/ui";

const MOCK_POSTS: PostData[] = [
  {
    id: "1",
    date: "Lundi 11 août 2025",
    time: "20h59",
    content:
      "Lorem ipsum dolor sit amet consectetur adipiscing elit aliquam mauris sed ma lorem ipsum dolor sit amet consectetur adipiscing elit aliquam mauris sed ma lorem ipsum dolor sit amet consectetur adipiscing elit aliquam mauris sed ma lorem ipsum dolor sit amet consectetur adipiscing elit aliquam mauris sed ma",
    likesCount: 4,
    isPrivate: true,
    isLiked: false,
  },
  {
    id: "2",
    date: "Lundi 11 août 2025",
    time: "18h30",
    content:
      "Lorem ipsum dolor sit amet consectetur adipiscing elit aliquam mauris sed ma lorem ipsum dolor sit amet consectetur adipiscing elit aliquam mauris sed ma lorem ipsum dolor sit amet consectetur adipiscing elit aliquam mauris sed ma",
    likesCount: 2,
    isPrivate: true,
    isLiked: true,
  },
  {
    id: "3",
    date: "Dimanche 10 août 2025",
    time: "15h42",
    content:
      "Lorem ipsum dolor sit amet consectetur adipiscing elit aliquam mauris sed ma lorem ipsum dolor sit amet consectetur adipiscing elit.",
    likesCount: 7,
    isPrivate: true,
    isLiked: false,
  },
  {
    id: "4",
    date: "Samedi 9 août 2025",
    time: "12h15",
    content:
      "Lorem ipsum dolor sit amet consectetur adipiscing elit aliquam mauris sed ma lorem ipsum dolor sit amet consectetur adipiscing elit aliquam mauris sed ma.",
    likesCount: 3,
    isPrivate: false,
    isLiked: false,
  },
];

export default function JournalScreen() {
  const router = useRouter();

  const handleAddPost = () => {
    router.push("/(protected)/journal/create" as Href);
  };

  const handlePostPress = (postId: string) => {
    router.push(`/(protected)/journal/post/${postId}` as Href);
  };

  const handleLikePress = (postId: string) => {
    console.log("Like pressed for post:", postId);
  };

  const handleCommentPress = (postId: string) => {
    router.push(`/(protected)/journal/post/${postId}` as Href);
  };

  const handleRepostPress = (postId: string) => {
    console.log("Repost pressed for post:", postId);
  };

  const handleSharePress = (postId: string) => {
    console.log("Share pressed for post:", postId);
  };

  const HeaderComponent = (
    <View className="mb-4">
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
        <Text className="text-muted-foreground text-sm">@monpseudo</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-1 px-4">
        <View className="items-center py-4">
          <Logo width={80} />
        </View>

        <PostFeed
          posts={MOCK_POSTS}
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
