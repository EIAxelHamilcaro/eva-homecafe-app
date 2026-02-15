"use client";

import Image from "next/image";
import {
  type Conversation,
  formatTimestamp,
  getAvatarColor,
  getInitials,
  getOtherParticipantId,
} from "../_constants/chat";

interface ConversationItemProps {
  conversation: Conversation;
  isSelected: boolean;
  userId: string;
  profileMap: Map<string, { name: string; image: string | null }>;
  onSelect: () => void;
}

export function ConversationItem({
  conversation,
  isSelected,
  userId,
  profileMap,
  onSelect,
}: ConversationItemProps) {
  const otherUserId = getOtherParticipantId(conversation.participants, userId);
  const profile = otherUserId ? profileMap.get(otherUserId) : undefined;
  const displayName = profile?.name ?? "Utilisateur";
  const avatarColor = getAvatarColor(otherUserId ?? "");
  const initials = getInitials(displayName);
  const hasUnread = conversation.unreadCount > 0;

  const lastMessagePreview = conversation.lastMessage
    ? conversation.lastMessage.hasAttachments
      ? conversation.lastMessage.content
        ? `📷 ${conversation.lastMessage.content}`
        : "📷 Photo"
      : conversation.lastMessage.content || "Aucun message"
    : "Aucun message";

  const timestamp = conversation.lastMessage
    ? formatTimestamp(conversation.lastMessage.sentAt)
    : formatTimestamp(conversation.createdAt);

  return (
    <button
      type="button"
      onClick={onSelect}
      className={`flex w-full items-center gap-3 rounded-xl p-3 text-left transition-colors ${
        isSelected
          ? "bg-homecafe-pink-light"
          : hasUnread
            ? "bg-muted/40 hover:bg-muted/60"
            : "hover:bg-muted/40"
      }`}
    >
      {profile?.image ? (
        <Image
          src={profile.image}
          alt={displayName}
          width={48}
          height={48}
          className="h-12 w-12 shrink-0 rounded-full object-cover"
        />
      ) : (
        <div
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full"
          style={{ backgroundColor: avatarColor }}
        >
          <span className="text-sm font-semibold text-white">{initials}</span>
        </div>
      )}

      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <span
            className={`truncate text-sm ${hasUnread ? "font-semibold" : "font-medium"}`}
          >
            {displayName}
          </span>
          <span className="shrink-0 text-xs text-muted-foreground">
            {timestamp}
          </span>
        </div>

        <div className="mt-0.5 flex items-center justify-between gap-2">
          <p
            className={`truncate text-xs ${
              hasUnread
                ? "font-medium text-foreground"
                : "text-muted-foreground"
            }`}
          >
            {lastMessagePreview}
          </p>
          {hasUnread && (
            <span className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-homecafe-pink px-1.5 text-[10px] font-bold text-white">
              {conversation.unreadCount}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}
