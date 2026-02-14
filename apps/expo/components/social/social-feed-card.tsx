import { Globe, Heart, User } from "lucide-react-native";
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
      className="rounded-xl border-4 border-homecafe-green/20 bg-card p-4"
    >
      {/* Date heading + actions row */}
      <View className="mb-1 flex-row items-center justify-between">
        <Text className="flex-1 text-base font-semibold capitalize text-foreground">
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

      {/* Author info line */}
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
        <Text className="text-xs text-muted-foreground">·</Text>
        <Text className="text-xs text-muted-foreground">{time}</Text>
        {reactionCount > 0 && (
          <>
            <Text className="text-xs text-muted-foreground">·</Text>
            <Text className="text-xs text-muted-foreground">
              {reactionCount} ❤️
            </Text>
          </>
        )}
      </View>

      {/* Content + thumbnail */}
      <View className="flex-row gap-3">
        <Text className="flex-1 text-sm leading-6 text-foreground">
          {content}
        </Text>
        {thumbnailUrl && (
          <Image
            source={{ uri: thumbnailUrl }}
            className="h-16 w-16 rounded-lg bg-muted"
            resizeMode="cover"
          />
        )}
      </View>
    </Pressable>
  );
}
