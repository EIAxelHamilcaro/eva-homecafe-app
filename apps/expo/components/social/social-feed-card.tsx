import { Globe, Heart, MessageCircle, User } from "lucide-react-native";
import { Image, Pressable, Text, View } from "react-native";
import { cn } from "@/src/libs/utils";

interface SocialFeedCardProps {
  dateHeading: string;
  authorName: string;
  authorAvatar: string | null;
  time: string;
  content: string;
  thumbnailUrl: string | null;
  reactionCount: number;
  commentCount: number;
  hasReacted: boolean;
  isOwn: boolean;
  isBouncing: boolean;
  onPress: () => void;
  onTogglePrivacy: () => void;
  onToggleReaction: () => void;
}

export function SocialFeedCard({
  dateHeading,
  authorName,
  authorAvatar,
  time,
  content,
  thumbnailUrl,
  reactionCount,
  commentCount,
  hasReacted,
  isOwn,
  isBouncing,
  onPress,
  onTogglePrivacy,
  onToggleReaction,
}: SocialFeedCardProps) {
  return (
    <Pressable
      onPress={onPress}
      className="rounded-xl p-4 active:opacity-90"
      style={{
        borderWidth: 12,
        borderColor: "rgba(4, 160, 86, 0.2)",
      }}
    >
      <View className="mb-1 flex-row items-center justify-between">
        <Text className="flex-1 text-sm font-medium capitalize text-foreground">
          {dateHeading}
        </Text>
        <View className="flex-row items-center gap-1.5">
          {isOwn && (
            <Pressable
              onPress={(e) => {
                e.stopPropagation?.();
                onTogglePrivacy();
              }}
              className="h-8 w-8 items-center justify-center rounded-full bg-emerald-500"
              style={isBouncing ? { transform: [{ scale: 1.25 }] } : undefined}
            >
              <Globe size={16} color="#fff" />
            </Pressable>
          )}
          <Pressable
            onPress={(e) => {
              e.stopPropagation?.();
              onToggleReaction();
            }}
            className={cn(
              "h-8 w-8 items-center justify-center rounded-full",
              hasReacted ? "bg-red-50" : "bg-muted",
            )}
          >
            <Heart
              size={16}
              color={hasReacted ? "#EF4444" : "#9CA3AF"}
              fill={hasReacted ? "#EF4444" : "transparent"}
            />
          </Pressable>
        </View>
      </View>

      <View className="mb-2 flex-row items-center gap-2">
        {authorAvatar ? (
          <Image
            source={{ uri: authorAvatar }}
            className="h-5 w-5 rounded-full bg-muted"
          />
        ) : (
          <View className="h-5 w-5 items-center justify-center rounded-full bg-homecafe-pink/20">
            <User size={12} color="#F691C3" />
          </View>
        )}
        <Text className="text-xs text-muted-foreground">{authorName}</Text>
        <Text className="text-xs text-muted-foreground">{time}</Text>
        {reactionCount > 0 && (
          <Text className="text-xs text-muted-foreground">
            {reactionCount} {"\u2764\uFE0F"}
          </Text>
        )}
        {commentCount > 0 && (
          <View className="flex-row items-center gap-0.5">
            <MessageCircle size={12} color="#9CA3AF" />
            <Text className="text-xs text-muted-foreground">
              {commentCount}
            </Text>
          </View>
        )}
      </View>

      <View className="flex-row gap-3">
        <Text className="flex-1 text-sm leading-5 text-foreground">
          {content}
        </Text>
        {thumbnailUrl && (
          <View className="h-16 w-16 shrink-0 overflow-hidden rounded-lg">
            <Image
              source={{ uri: thumbnailUrl }}
              className="h-full w-full"
              resizeMode="cover"
            />
          </View>
        )}
      </View>
    </Pressable>
  );
}
