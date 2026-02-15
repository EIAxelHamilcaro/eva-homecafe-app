"use client";

import { Button } from "@packages/ui/components/ui/button";
import { PenSquare } from "lucide-react";
import type { Conversation } from "../_constants/chat";
import { ConversationItem } from "./conversation-item";

interface ConversationsSidebarProps {
  conversations: Conversation[];
  isLoading: boolean;
  selectedId: string | null;
  userId: string;
  profileMap: Map<string, { name: string; image: string | null }>;
  onSelect: (id: string) => void;
  onNewMessage: () => void;
}

const SKELETON_KEYS = ["sk-1", "sk-2", "sk-3", "sk-4", "sk-5"] as const;

function SidebarSkeleton() {
  return (
    <div className="space-y-1 p-2">
      {SKELETON_KEYS.map((key) => (
        <div key={key} className="flex items-center gap-3 rounded-xl p-3">
          <div className="h-12 w-12 shrink-0 animate-pulse rounded-full bg-muted" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-24 animate-pulse rounded bg-muted" />
            <div className="h-3 w-40 animate-pulse rounded bg-muted" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function ConversationsSidebar({
  conversations,
  isLoading,
  selectedId,
  userId,
  profileMap,
  onSelect,
  onNewMessage,
}: ConversationsSidebarProps) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <h2 className="text-xl font-bold">Messagerie</h2>
        <Button
          size="icon"
          variant="ghost"
          onClick={onNewMessage}
          className="h-9 w-9 rounded-full bg-homecafe-pink text-white hover:bg-homecafe-pink-dark hover:text-white"
        >
          <PenSquare className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <SidebarSkeleton />
        ) : conversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 px-4 py-12 text-center">
            <p className="text-sm text-muted-foreground">Aucune conversation</p>
            <Button
              variant="link"
              onClick={onNewMessage}
              className="text-homecafe-pink"
            >
              Demarrer une conversation
            </Button>
          </div>
        ) : (
          <div className="space-y-0.5 p-2">
            {conversations.map((conversation) => (
              <ConversationItem
                key={conversation.id}
                conversation={conversation}
                isSelected={conversation.id === selectedId}
                userId={userId}
                profileMap={profileMap}
                onSelect={() => onSelect(conversation.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
