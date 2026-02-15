"use client";

import { Button } from "@packages/ui/components/ui/button";
import { MessageCircle, PenSquare } from "lucide-react";

interface EmptyStateProps {
  hasConversations: boolean;
  onNewMessage: () => void;
}

export function EmptyState({
  hasConversations,
  onNewMessage,
}: EmptyStateProps) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-homecafe-pink-light">
        <MessageCircle className="h-10 w-10 text-homecafe-pink" />
      </div>
      {hasConversations ? (
        <>
          <h3 className="text-xl font-semibold">Vos messages</h3>
          <p className="max-w-sm text-muted-foreground">
            Selectionnez une conversation pour commencer a discuter
          </p>
        </>
      ) : (
        <>
          <h3 className="text-xl font-semibold">Aucune conversation</h3>
          <p className="max-w-sm text-muted-foreground">
            Envoyez votre premier message a un ami !
          </p>
          <Button
            onClick={onNewMessage}
            className="mt-2 gap-2 rounded-full bg-homecafe-pink hover:bg-homecafe-pink-dark"
          >
            <PenSquare className="h-4 w-4" />
            Nouveau message
          </Button>
        </>
      )}
    </div>
  );
}
