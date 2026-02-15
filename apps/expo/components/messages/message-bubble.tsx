import { Image, Pressable, Text, View } from "react-native";
import type { Message, ReactionEmoji } from "@/constants/chat";
import { cn } from "@/src/libs/utils";
import { MessageMedia } from "./message-media";
import { ReactionBar } from "./reaction-bar";

interface MessageBubbleProps {
  message: Message;
  isSent: boolean;
  userId: string;
  senderName?: string;
  senderImage?: string | null;
  onLongPress: () => void;
  onReactionPress: (emoji: ReactionEmoji) => void;
  onImagePress: (index: number) => void;
}

function formatMessageTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getAvatarColor(userId: string): string {
  const colors = [
    "#F691C3",
    "#FFA500",
    "#4CAF50",
    "#2196F3",
    "#9C27B0",
    "#E91E63",
    "#00BCD4",
    "#FF5722",
  ];
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = userId.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length] ?? "#F691C3";
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function Avatar({
  image,
  name,
  userId,
}: {
  image?: string | null;
  name?: string;
  userId: string;
}) {
  if (image) {
    return (
      <Image
        source={{ uri: image }}
        className="h-8 w-8 rounded-full"
        resizeMode="cover"
      />
    );
  }

  return (
    <View
      className="h-8 w-8 items-center justify-center rounded-full"
      style={{ backgroundColor: getAvatarColor(userId) }}
    >
      <Text className="text-xs font-semibold text-white">
        {name ? getInitials(name) : "?"}
      </Text>
    </View>
  );
}

export function MessageBubble({
  message,
  isSent,
  userId,
  senderName,
  senderImage,
  onLongPress,
  onReactionPress,
  onImagePress,
}: MessageBubbleProps) {
  const hasContent = message.content && message.content.trim().length > 0;
  const hasAttachments = message.attachments.length > 0;

  return (
    <View
      className={cn(
        "mb-2 flex-row items-end gap-2 px-4",
        isSent ? "justify-end" : "justify-start",
      )}
    >
      {!isSent && (
        <View className="mb-5">
          <Avatar
            image={senderImage}
            name={senderName}
            userId={message.senderId}
          />
        </View>
      )}

      <View className={cn("max-w-[70%]", isSent ? "items-end" : "items-start")}>
        <Pressable
          onLongPress={onLongPress}
          delayLongPress={300}
          className={cn(
            "overflow-hidden rounded-2xl",
            isSent
              ? "rounded-br-sm bg-[#3B82F6]"
              : "rounded-bl-sm bg-[#FF8C42]",
            hasContent && !hasAttachments && "px-4 py-2",
            hasAttachments && "pb-2",
          )}
        >
          {hasAttachments && (
            <View className={cn(hasContent && "mb-1")}>
              <MessageMedia
                attachments={message.attachments}
                onImagePress={onImagePress}
              />
            </View>
          )}
          {hasContent && (
            <Text
              className={cn(
                "text-base text-white",
                hasAttachments && "px-4 pb-1",
              )}
            >
              {message.content}
            </Text>
          )}
        </Pressable>
        <ReactionBar
          reactions={message.reactions}
          userId={userId}
          onReactionPress={onReactionPress}
        />
        <Text className="mt-1 text-xs text-muted-foreground">
          {formatMessageTime(message.createdAt)}
        </Text>
      </View>

      {isSent && (
        <View className="mb-5">
          <Avatar
            image={senderImage}
            name={senderName}
            userId={message.senderId}
          />
        </View>
      )}
    </View>
  );
}
