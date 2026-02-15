"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  useConversationsQuery,
  useProfilesQuery,
} from "@/app/(protected)/_hooks/use-chat";
import { getOtherParticipantId } from "../_constants/chat";
import { ChatPanel } from "./chat-panel";
import { ConversationsSidebar } from "./conversations-sidebar";
import { EmptyState } from "./empty-state";
import { NewConversationPanel } from "./new-conversation-panel";

interface MessagesPageClientProps {
  userId: string;
  userName: string;
  userImage: string | null;
}

export function MessagesPageClient({
  userId,
  userName,
  userImage,
}: MessagesPageClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlConversationId = searchParams.get("conversationId");
  const appliedUrlParamRef = useRef<string | null>(null);

  const [selectedConversationId, setSelectedConversationId] = useState<
    string | null
  >(urlConversationId);
  const [isNewMessage, setIsNewMessage] = useState(false);

  useEffect(() => {
    if (urlConversationId && urlConversationId !== appliedUrlParamRef.current) {
      setSelectedConversationId(urlConversationId);
      setIsNewMessage(false);
      appliedUrlParamRef.current = urlConversationId;
    }
  }, [urlConversationId]);

  const { data: conversationsData, isLoading: isLoadingConversations } =
    useConversationsQuery();

  const conversations = conversationsData?.conversations ?? [];

  const allParticipantIds = useMemo(() => {
    const ids = new Set<string>();
    ids.add(userId);
    for (const c of conversations) {
      for (const p of c.participants) {
        ids.add(p.userId);
      }
    }
    return [...ids];
  }, [conversations, userId]);

  const { data: profilesData } = useProfilesQuery(allParticipantIds);

  const profileMap = useMemo(() => {
    const map = new Map<string, { name: string; image: string | null }>();
    if (profilesData?.profiles) {
      for (const p of profilesData.profiles) {
        map.set(p.id, { name: p.name, image: p.image });
      }
    }
    return map;
  }, [profilesData]);

  const handleSelectConversation = useCallback(
    (conversationId: string) => {
      setSelectedConversationId(conversationId);
      setIsNewMessage(false);
      router.replace(`/messages?conversationId=${conversationId}`, {
        scroll: false,
      });
    },
    [router],
  );

  const handleNewMessage = useCallback(() => {
    setIsNewMessage(true);
    setSelectedConversationId(null);
  }, []);

  const handleConversationCreated = useCallback(
    (conversationId: string) => {
      setSelectedConversationId(conversationId);
      setIsNewMessage(false);
      router.replace(`/messages?conversationId=${conversationId}`, {
        scroll: false,
      });
    },
    [router],
  );

  const selectedConversation = conversations.find(
    (c) => c.id === selectedConversationId,
  );

  const otherUserId = selectedConversation
    ? getOtherParticipantId(selectedConversation.participants, userId)
    : undefined;

  const otherUserProfile = otherUserId
    ? profileMap.get(otherUserId)
    : undefined;

  const handleBack = useCallback(() => {
    setSelectedConversationId(null);
    router.replace("/messages", { scroll: false });
  }, [router]);

  const hasChatOpen = selectedConversationId && selectedConversation;

  return (
    <div className="fixed inset-x-0 top-[4.5rem] bottom-0 z-10 flex bg-background">
      <div
        className={`w-full border-r border-border md:block md:w-[360px] md:shrink-0 ${
          hasChatOpen ? "hidden" : "block"
        }`}
      >
        {isNewMessage ? (
          <NewConversationPanel
            userId={userId}
            onBack={() => setIsNewMessage(false)}
            onConversationCreated={handleConversationCreated}
          />
        ) : (
          <ConversationsSidebar
            conversations={conversations}
            isLoading={isLoadingConversations}
            selectedId={selectedConversationId}
            userId={userId}
            profileMap={profileMap}
            onSelect={handleSelectConversation}
            onNewMessage={handleNewMessage}
          />
        )}
      </div>

      <div className={`flex-1 ${hasChatOpen ? "flex" : "hidden md:flex"}`}>
        {hasChatOpen ? (
          <ChatPanel
            conversationId={selectedConversationId}
            userId={userId}
            userName={profileMap.get(userId)?.name ?? userName}
            userImage={profileMap.get(userId)?.image ?? userImage}
            otherUserName={otherUserProfile?.name ?? "Utilisateur"}
            otherUserImage={otherUserProfile?.image ?? null}
            otherUserId={otherUserId ?? ""}
            onBack={handleBack}
            onConversationDeleted={handleBack}
          />
        ) : (
          <EmptyState
            hasConversations={conversations.length > 0}
            onNewMessage={handleNewMessage}
          />
        )}
      </div>
    </div>
  );
}
