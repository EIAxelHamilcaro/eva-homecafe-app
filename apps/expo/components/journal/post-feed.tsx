import { SectionList, Text, View, type ViewProps } from "react-native";

import { cn } from "../../src/libs/utils";
import { PostCard, type PostCardProps } from "./post-card";

type PostData = Omit<PostCardProps, "onPress" | "className"> & {
  id: string;
};

type PostSection = {
  title: string;
  data: PostData[];
};

type PostFeedProps = ViewProps & {
  posts: PostData[];
  onPostPress?: (postId: string) => void;
  onLikePress?: (postId: string) => void;
  onCommentPress?: (postId: string) => void;
  onRepostPress?: (postId: string) => void;
  onSharePress?: (postId: string) => void;
  className?: string;
  ListHeaderComponent?: React.ReactElement;
  ListFooterComponent?: React.ReactElement;
};

function groupPostsByDate(posts: PostData[]): PostSection[] {
  const grouped: Record<string, PostData[]> = {};

  for (const post of posts) {
    const dateKey = post.date;
    if (!grouped[dateKey]) {
      grouped[dateKey] = [];
    }
    grouped[dateKey].push(post);
  }

  return Object.entries(grouped).map(([title, data]) => ({
    title,
    data,
  }));
}

function PostFeed({
  posts,
  onPostPress,
  onLikePress,
  onCommentPress,
  onRepostPress,
  onSharePress,
  className,
  ListHeaderComponent,
  ListFooterComponent,
  ...props
}: PostFeedProps) {
  const sections = groupPostsByDate(posts);

  const renderSectionHeader = ({ section }: { section: PostSection }) => (
    <View className="py-3 px-1">
      <Text className="text-foreground text-xl font-bold">{section.title}</Text>
    </View>
  );

  const renderItem = ({ item }: { item: PostData }) => (
    <PostCard
      id={item.id}
      date={item.date}
      time={item.time}
      content={item.content}
      likesCount={item.likesCount}
      isPrivate={item.isPrivate}
      isLiked={item.isLiked}
      onPress={() => onPostPress?.(item.id)}
      onLikePress={() => onLikePress?.(item.id)}
      onCommentPress={() => onCommentPress?.(item.id)}
      onRepostPress={() => onRepostPress?.(item.id)}
      onSharePress={() => onSharePress?.(item.id)}
      className="mb-4"
    />
  );

  return (
    <View className={cn("flex-1", className)} {...props}>
      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        renderSectionHeader={renderSectionHeader}
        showsVerticalScrollIndicator={false}
        stickySectionHeadersEnabled={false}
        contentContainerStyle={{ paddingBottom: 16 }}
        ListHeaderComponent={ListHeaderComponent}
        ListFooterComponent={ListFooterComponent}
      />
    </View>
  );
}

export { PostFeed, type PostFeedProps, type PostData, type PostSection };
