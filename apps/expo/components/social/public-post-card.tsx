import { Sticker, Users } from "lucide-react-native";
import { Image, Pressable, Text, View, type ViewProps } from "react-native";
import { ActionBar } from "@/components/shared/action-bar";
import { cn } from "@/src/libs/utils";

type PublicPostCardProps = ViewProps & {
  id: string;
  authorName: string;
  authorAvatar?: string;
  date: string;
  time: string;
  content: string;
  likesCount: number;
  commentsCount?: number;
  stickerUrl?: string;
  isLiked?: boolean;
  onPress?: () => void;
  onAuthorPress?: () => void;
  onStickerPress?: () => void;
  onLikePress?: () => void;
  onCommentPress?: () => void;
  onRepostPress?: () => void;
  onSharePress?: () => void;
  className?: string;
};

function PublicPostCard({
  id: _id,
  authorName,
  authorAvatar,
  date,
  time,
  content,
  likesCount,
  commentsCount = 0,
  stickerUrl,
  isLiked = false,
  onPress,
  onAuthorPress,
  onStickerPress,
  onLikePress,
  onCommentPress,
  onRepostPress,
  onSharePress,
  className,
  ...props
}: PublicPostCardProps) {
  return (
    <Pressable
      onPress={onPress}
      className={cn(
        "rounded-xl border border-border bg-card p-4 shadow-sm",
        className,
      )}
      {...props}
    >
      {/* Author info */}
      <Pressable
        onPress={onAuthorPress}
        className="mb-3 flex-row items-center"
        disabled={!onAuthorPress}
      >
        {authorAvatar ? (
          <Image
            source={{ uri: authorAvatar }}
            className="mr-3 h-10 w-10 rounded-full bg-muted"
          />
        ) : (
          <View className="mr-3 h-10 w-10 items-center justify-center rounded-full bg-primary/10">
            <Users size={20} color="#F691C3" />
          </View>
        )}
        <View className="flex-1">
          <Text className="text-base font-semibold text-foreground">
            {authorName}
          </Text>
          <Text className="text-sm text-muted-foreground">
            {date} · {time}
          </Text>
        </View>
      </Pressable>

      {/* Content */}
      <Text className="mb-3 text-base leading-6 text-foreground">
        {content}
      </Text>

      {/* Sticker */}
      {stickerUrl && (
        <Pressable
          onPress={onStickerPress}
          className="mb-3 items-start"
          disabled={!onStickerPress}
        >
          <Image
            source={{ uri: stickerUrl }}
            className="h-24 w-24 rounded-lg"
            resizeMode="contain"
          />
        </Pressable>
      )}

      {/* Sticker button (when no sticker yet) */}
      {!stickerUrl && onStickerPress && (
        <Pressable
          onPress={onStickerPress}
          className="mb-3 flex-row items-center gap-2 rounded-lg border border-dashed border-border bg-muted/30 p-3"
        >
          <Sticker size={20} color="#9CA3AF" />
          <Text className="text-sm text-muted-foreground">
            Ajouter un sticker
          </Text>
        </Pressable>
      )}

      {/* Stats */}
      <View className="mb-3 flex-row items-center gap-4">
        <Text className="text-sm text-muted-foreground">
          {likesCount} {likesCount === 1 ? "like" : "likes"}
        </Text>
        {commentsCount > 0 && (
          <Text className="text-sm text-muted-foreground">
            {commentsCount}{" "}
            {commentsCount === 1 ? "commentaire" : "commentaires"}
          </Text>
        )}
      </View>

      {/* Action bar */}
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

export { PublicPostCard, type PublicPostCardProps };
