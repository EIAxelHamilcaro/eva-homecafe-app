import { type Href, useRouter } from "expo-router";
import { Globe, Lock, Pencil } from "lucide-react-native";
import { useState } from "react";
import { Image, Pressable, Text, View } from "react-native";

import { useUpdatePost } from "@/lib/api/hooks/use-posts";
import {
  formatDateHeading,
  formatPostTime,
  stripHtml,
  truncate,
} from "@/lib/utils/post-format";
import { colors } from "@/src/config/colors";

interface JournalEntryCardProps {
  id: string;
  groupDate: string;
  content: string;
  isPrivate: boolean;
  images: string[];
  createdAt: string;
  onPress?: () => void;
}

export function JournalEntryCard({
  id,
  groupDate,
  content,
  isPrivate: initialPrivate,
  images,
  createdAt,
  onPress,
}: JournalEntryCardProps) {
  const router = useRouter();
  const updatePost = useUpdatePost();
  const [isPrivate, setIsPrivate] = useState(initialPrivate);
  const [isBouncing, setIsBouncing] = useState(false);

  const handleEdit = () => {
    router.push(`/(protected)/(tabs)/journal/edit/${id}` as Href);
  };

  const togglePrivacy = () => {
    const newValue = !isPrivate;
    setIsPrivate(newValue);
    setIsBouncing(true);
    setTimeout(() => setIsBouncing(false), 400);
    updatePost.mutate({ postId: id, isPrivate: newValue });
  };

  const displayContent = truncate(stripHtml(content), 150);

  return (
    <Pressable
      onPress={onPress}
      className="mb-3 rounded-xl p-4 active:opacity-90"
      style={{
        borderWidth: 12,
        borderColor: "rgba(4, 160, 86, 0.2)",
      }}
    >
      <View className="mb-1 flex-row items-center justify-between">
        <Text className="flex-1 text-sm font-medium capitalize text-foreground">
          {formatDateHeading(groupDate)}
        </Text>
        <View className="flex-row items-center gap-1.5">
          <Pressable
            onPress={handleEdit}
            className="h-8 w-8 items-center justify-center rounded-full active:bg-muted"
            hitSlop={8}
          >
            <Pencil size={14} color={colors.mutedForeground} />
          </Pressable>
          <Pressable
            onPress={togglePrivacy}
            className="h-8 w-8 items-center justify-center rounded-full"
            style={[
              {
                backgroundColor: isPrivate ? colors.homecafe.blue : "#10B981",
              },
              isBouncing && { transform: [{ scale: 1.25 }] },
            ]}
            hitSlop={8}
          >
            {isPrivate ? (
              <Lock size={16} color="#FFFFFF" />
            ) : (
              <Globe size={16} color="#FFFFFF" />
            )}
          </Pressable>
        </View>
      </View>

      <Text className="mb-2 text-xs text-muted-foreground">
        {formatPostTime(createdAt)}
      </Text>

      <View className="flex-row gap-3">
        <Text className="flex-1 text-sm leading-5 text-foreground">
          {displayContent}
        </Text>
        {images.length > 0 && (
          <View className="h-16 w-16 shrink-0 overflow-hidden rounded-lg">
            <Image
              source={{ uri: images[0] }}
              className="h-full w-full"
              resizeMode="cover"
            />
          </View>
        )}
      </View>
    </Pressable>
  );
}
