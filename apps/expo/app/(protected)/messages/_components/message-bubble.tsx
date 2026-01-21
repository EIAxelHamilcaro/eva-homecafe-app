import { Pressable, Text, View } from "react-native";
import type { Message, ReactionEmoji } from "@/constants/chat";
import { cn } from "@/src/libs/utils";
import { ReactionBar } from "./reaction-bar";

interface MessageBubbleProps {
  message: Message;
  isSent: boolean;
  userId: string;
  onLongPress: () => void;
  onReactionPress: (emoji: ReactionEmoji) => void;
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
}: MessageBubbleProps) {
  const hasContent = message.content && message.content.trim().length > 0;

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
          "rounded-2xl px-4 py-2",
          isSent ? "rounded-br-sm bg-primary" : "rounded-bl-sm bg-[#FF8C42]",
        )}
      >
        {hasContent && (
          <Text className="text-base text-white">{message.content}</Text>
        )}
        {!hasContent && message.attachments.length > 0 && (
          <Text className="text-base text-white">📷 Photo</Text>
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
