"use client";

import { useEffect, useRef } from "react";
import {
  useDeleteConversationMutation,
  useMarkAsReadMutation,
  useMessagesQuery,
} from "@/app/(protected)/_hooks/use-chat";
import { ChatHeader } from "./chat-header";
import { MessageInput } from "./message-input";
import { MessageList } from "./message-list";

interface ChatPanelProps {
  conversationId: string;
  userId: string;
  userName: string;
  userImage: string | null;
  otherUserName: string;
  otherUserImage: string | null;
  otherUserId: string;
  onBack?: () => void;
  onConversationDeleted?: () => void;
}

export function ChatPanel({
  conversationId,
  userId,
  userName,
  userImage,
  otherUserName,
  otherUserImage,
  otherUserId,
  onBack,
  onConversationDeleted,
}: ChatPanelProps) {
  const markAsRead = useMarkAsReadMutation(conversationId);
  const deleteConversation = useDeleteConversationMutation();
  const markAsReadRef = useRef(markAsRead);
  markAsReadRef.current = markAsRead;

  const { dataUpdatedAt } = useMessagesQuery(conversationId);

  useEffect(() => {
    if (conversationId) {
      markAsReadRef.current.mutate();
    }
  }, [conversationId]);

  useEffect(() => {
    if (dataUpdatedAt) {
      markAsReadRef.current.mutate();
    }
  }, [dataUpdatedAt]);

  return (
    <div className="flex flex-1 flex-col">
      <ChatHeader
        name={otherUserName}
        image={otherUserImage}
        userId={otherUserId}
        onBack={onBack}
        onDelete={() => {
          deleteConversation.mutate(conversationId, {
            onSuccess: () => onConversationDeleted?.(),
          });
        }}
        isDeleting={deleteConversation.isPending}
      />
      <MessageList
        conversationId={conversationId}
        userId={userId}
        userName={userName}
        userImage={userImage}
        otherUserName={otherUserName}
        otherUserImage={otherUserImage}
      />
      <MessageInput conversationId={conversationId} userId={userId} />
    </div>
  );
}
