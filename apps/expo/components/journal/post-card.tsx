import { Lock } from "lucide-react-native";
import { Pressable, Text, View, type ViewProps } from "react-native";
import { ActionBar } from "@/components/shared/action-bar";
import { cn } from "@/src/libs/utils";

type PostCardProps = ViewProps & {
  id: string;
  date: string;
  time: string;
  content: string;
  likesCount: number;
  isPrivate?: boolean;
  isLiked?: boolean;
  onPress?: () => void;
  onLikePress?: () => void;
  onCommentPress?: () => void;
  onRepostPress?: () => void;
  onSharePress?: () => void;
  className?: string;
};

function PostCard({
  id: _id,
  date,
  time,
  content,
  likesCount,
  isPrivate = true,
  isLiked = false,
  onPress,
  onLikePress,
  onCommentPress,
  onRepostPress,
  onSharePress,
  className,
  ...props
}: PostCardProps) {
  return (
    <Pressable
      onPress={onPress}
      className={cn(
        "bg-card rounded-xl border border-border p-4 shadow-sm",
        className,
      )}
      {...props}
    >
      <View className="flex-row items-start justify-between mb-3">
        <View>
          <Text className="text-foreground text-lg font-semibold">{date}</Text>
          <Text className="text-muted-foreground text-sm">{time}</Text>
        </View>
        {isPrivate && (
          <View className="bg-blue-500 rounded-lg p-2">
            <Lock size={18} color="#FFFFFF" />
          </View>
        )}
      </View>

      <Text className="text-foreground text-base leading-6 mb-3">
        {content}
      </Text>

      <Text className="text-muted-foreground text-sm mb-3">
        {likesCount} {likesCount === 1 ? "like" : "likes"}
      </Text>

      <ActionBar
        liked={isLiked}
        onLikePress={onLikePress}
        onCommentPress={onCommentPress}
        onRepostPress={onRepostPress}
        onSharePress={onSharePress}
      />
    </Pressable>
  );
}

export { PostCard, type PostCardProps };
