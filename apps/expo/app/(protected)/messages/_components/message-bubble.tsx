import { Pressable, Text, View } from "react-native";
import type { Message, ReactionEmoji } from "@/constants/chat";
import { cn } from "@/src/libs/utils";
import { MessageMedia } from "./message-media";
import { ReactionBar } from "./reaction-bar";

interface MessageBubbleProps {
  message: Message;
  isSent: boolean;
  userId: string;
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

export function MessageBubble({
  message,
  isSent,
  userId,
  onLongPress,
  onReactionPress,
  onImagePress,
}: MessageBubbleProps) {
  const hasContent = message.content && message.content.trim().length > 0;
  const hasAttachments = message.attachments.length > 0;

  return (
    <View
      className={cn(
        "mb-2 max-w-[80%] px-4",
        isSent ? "ml-auto items-end" : "mr-auto items-start",
      )}
    >
      <Pressable
        onLongPress={onLongPress}
        delayLongPress={300}
        className={cn(
          "overflow-hidden rounded-2xl",
          isSent ? "rounded-br-sm bg-primary" : "rounded-bl-sm bg-[#FF8C42]",
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
  );
}
