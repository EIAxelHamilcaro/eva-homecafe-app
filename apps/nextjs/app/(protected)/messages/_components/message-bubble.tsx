"use client";

import Image from "next/image";
import { useMemo } from "react";
import { useToggleReactionMutation } from "@/app/(protected)/_hooks/use-chat";
import {
  formatMessageTime,
  getAvatarColor,
  getInitials,
  type Message,
  type Reaction,
  type ReactionEmoji,
} from "../_constants/chat";
import { ReactionPicker } from "./reaction-picker";

interface MessageBubbleProps {
  message: Message;
  isSent: boolean;
  userId: string;
  conversationId: string;
  senderName?: string;
  senderImage?: string | null;
  onImagePress?: (messageId: string, imageIndex: number) => void;
}

function groupReactions(
  reactions: Reaction[],
): Map<string, { count: number; userReacted: boolean }> {
  const groups = new Map<string, { users: Set<string> }>();
  for (const r of reactions) {
    const group = groups.get(r.emoji) ?? { users: new Set() };
    group.users.add(r.userId);
    groups.set(r.emoji, group);
  }
  return new Map(
    [...groups.entries()].map(([emoji, { users }]) => [
      emoji,
      { count: users.size, userReacted: false },
    ]),
  );
}

export function MessageBubble({
  message,
  isSent,
  userId,
  conversationId,
  senderName,
  senderImage,
  onImagePress,
}: MessageBubbleProps) {
  const toggleReaction = useToggleReactionMutation(
    conversationId,
    message.id,
    userId,
  );

  const reactionGroups = useMemo(() => {
    const groups = groupReactions(message.reactions);
    for (const [emoji, group] of groups) {
      const userReacted = message.reactions.some(
        (r) => r.userId === userId && r.emoji === emoji,
      );
      groups.set(emoji, { ...group, userReacted });
    }
    return groups;
  }, [message.reactions, userId]);

  const hasContent = message.content && message.content.trim().length > 0;
  const hasAttachments = message.attachments.length > 0;
  const hasReactions = reactionGroups.size > 0;

  const handleReaction = (emoji: ReactionEmoji) => {
    toggleReaction.mutate({ emoji });
  };

  const avatarColor = getAvatarColor(message.senderId);
  const initials = senderName ? getInitials(senderName) : undefined;

  const avatar = (
    <div className="mb-5 shrink-0">
      {senderImage ? (
        <Image
          src={senderImage}
          alt={senderName ?? ""}
          width={32}
          height={32}
          className="h-8 w-8 rounded-full object-cover"
        />
      ) : (
        <div
          className="flex h-8 w-8 items-center justify-center rounded-full"
          style={{ backgroundColor: avatarColor }}
        >
          <span className="text-xs font-semibold text-white">{initials}</span>
        </div>
      )}
    </div>
  );

  return (
    <div
      className={`group flex flex-col ${isSent ? "items-end" : "items-start"} px-4`}
    >
      <div className="flex max-w-[70%] items-end gap-2">
        {!isSent && avatar}

        {isSent && <ReactionPicker onSelect={handleReaction} />}

        <div
          className={`overflow-hidden rounded-2xl ${
            isSent ? "rounded-br-sm bg-[#3B82F6]" : "rounded-bl-sm bg-[#FF8C42]"
          }`}
        >
          {hasAttachments && (
            <div className="flex flex-wrap gap-1 p-1">
              {message.attachments.map((att, index) => (
                <button
                  key={att.id}
                  type="button"
                  onClick={() => onImagePress?.(message.id, index)}
                  className="cursor-pointer"
                >
                  <Image
                    src={att.url}
                    alt={att.filename}
                    width={400}
                    height={300}
                    unoptimized
                    className="max-h-48 max-w-full rounded-xl object-cover"
                  />
                </button>
              ))}
            </div>
          )}
          {hasContent && (
            <p
              className={`px-3.5 py-2 text-sm leading-relaxed text-white ${hasAttachments ? "pt-1" : ""}`}
            >
              {message.content}
            </p>
          )}
        </div>

        {!isSent && <ReactionPicker onSelect={handleReaction} />}

        {isSent && avatar}
      </div>

      {hasReactions && (
        <div
          className={`-mt-1 flex gap-1 px-2 ${isSent ? "justify-end" : "justify-start"}`}
        >
          {[...reactionGroups.entries()].map(
            ([emoji, { count, userReacted }]) => (
              <button
                key={emoji}
                type="button"
                onClick={() => handleReaction(emoji as ReactionEmoji)}
                className={`flex items-center gap-0.5 rounded-full border px-1.5 py-0.5 text-xs transition-colors ${
                  userReacted
                    ? "border-homecafe-pink bg-homecafe-pink-light"
                    : "border-border bg-background hover:bg-muted"
                }`}
              >
                <span>{emoji}</span>
                {count > 1 && (
                  <span className="text-muted-foreground">{count}</span>
                )}
              </button>
            ),
          )}
        </div>
      )}

      <span
        className={`mt-0.5 px-2 text-[10px] text-muted-foreground ${isSent ? "text-right" : "text-left"}`}
      >
        {formatMessageTime(message.createdAt)}
      </span>
    </div>
  );
}
