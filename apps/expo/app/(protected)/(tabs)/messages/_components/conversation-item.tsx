import { Pressable, Text, View } from "react-native";
import type { Conversation, Participant } from "@/constants/chat";
import { cn } from "@/src/libs/utils";
import { UnreadBadge } from "./unread-badge";

interface ConversationItemProps {
  conversation: Conversation;
  currentUserId: string;
  participantNames: Map<string, string>;
  onPress: () => void;
}

const AVATAR_COLORS = [
  "#F691C3",
  "#FFA500",
  "#4CAF50",
  "#2196F3",
  "#9C27B0",
  "#E91E63",
  "#00BCD4",
  "#FF5722",
] as const;

const DEFAULT_COLOR = "#F691C3";

function getAvatarColor(userId: string): string {
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = userId.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length] ?? DEFAULT_COLOR;
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function formatTimestamp(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "À l'instant";
  if (diffMins < 60) return `${diffMins} min`;
  if (diffHours < 24) return `${diffHours}h`;
  if (diffDays === 1) return "Hier";
  if (diffDays < 7) return `${diffDays} jours`;
  return date.toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
}

function getOtherParticipant(
  participants: Participant[],
  currentUserId: string,
): Participant | undefined {
  return participants.find((p) => p.userId !== currentUserId);
}

export function ConversationItem({
  conversation,
  currentUserId,
  participantNames,
  onPress,
}: ConversationItemProps) {
  const otherParticipant = getOtherParticipant(
    conversation.participants,
    currentUserId,
  );
  const otherUserId = otherParticipant?.userId ?? "";
  const otherUserName = participantNames.get(otherUserId) ?? "Utilisateur";
  const avatarColor = getAvatarColor(otherUserId);
  const initials = getInitials(otherUserName);

  const lastMessagePreview = conversation.lastMessage
    ? conversation.lastMessage.hasAttachments &&
      !conversation.lastMessage.content
      ? "📷 Photo"
      : conversation.lastMessage.content
    : "Aucun message";

  const timestamp = conversation.lastMessage
    ? formatTimestamp(conversation.lastMessage.sentAt)
    : formatTimestamp(conversation.createdAt);

  const hasUnread = conversation.unreadCount > 0;

  return (
    <Pressable
      onPress={onPress}
      className={cn(
        "flex-row items-center px-4 py-3 active:bg-muted",
        hasUnread && "bg-muted/30",
      )}
    >
      <View
        className="mr-3 h-12 w-12 items-center justify-center rounded-full"
        style={{ backgroundColor: avatarColor }}
      >
        <Text className="text-lg font-semibold text-white">{initials}</Text>
      </View>

      <View className="flex-1">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-2">
            <Text
              className={cn(
                "text-base text-foreground",
                hasUnread && "font-semibold",
              )}
              numberOfLines={1}
            >
              {otherUserName}
            </Text>
            <UnreadBadge count={conversation.unreadCount} />
          </View>
          <Text className="text-sm text-muted-foreground">{timestamp}</Text>
        </View>

        <Text
          className={cn(
            "mt-0.5 text-sm text-muted-foreground",
            hasUnread && "font-medium text-foreground",
          )}
          numberOfLines={1}
        >
          {lastMessagePreview}
        </Text>
      </View>
    </Pressable>
  );
}
