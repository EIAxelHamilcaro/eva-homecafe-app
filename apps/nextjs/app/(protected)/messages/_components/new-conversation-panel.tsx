"use client";

import { Input } from "@packages/ui/components/ui/input";
import { ArrowLeft, Loader2, Search, Users } from "lucide-react";
import { useMemo, useState } from "react";
import {
  useCreateConversationMutation,
  useSearchRecipientsQuery,
} from "@/app/(protected)/_hooks/use-chat";
import { useFriendsQuery } from "@/app/(protected)/_hooks/use-friends";
import type { Recipient } from "../_constants/chat";
import { RecipientItem } from "./recipient-item";

interface NewConversationPanelProps {
  userId: string;
  onBack: () => void;
  onConversationCreated: (conversationId: string) => void;
}

export function NewConversationPanel({
  userId,
  onBack,
  onConversationCreated,
}: NewConversationPanelProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const { data: searchData, isLoading: isSearching } =
    useSearchRecipientsQuery(searchQuery);
  const { data: friendsData, isLoading: isLoadingFriends } = useFriendsQuery();
  const createConversation = useCreateConversationMutation();

  const searchRecipients = (searchData?.recipients ?? []).filter(
    (r) => r.id !== userId,
  );

  const recentFriends: Recipient[] = useMemo(() => {
    if (!friendsData?.friends) return [];
    return friendsData.friends.slice(0, 5).map((f) => ({
      id: f.userId,
      name: f.displayName ?? f.name ?? f.email,
      email: f.email,
      image: f.avatarUrl,
    }));
  }, [friendsData]);

  const isSearchActive = searchQuery.length >= 2;

  const handleSelectRecipient = (recipientId: string) => {
    createConversation.mutate(
      { recipientId },
      {
        onSuccess: (result) => {
          onConversationCreated(result.conversationId);
        },
      },
    );
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-3 border-b border-border px-4 py-3">
        <button
          type="button"
          onClick={onBack}
          className="rounded-full p-1.5 hover:bg-muted"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <h2 className="text-lg font-bold">Nouveau message</h2>
      </div>

      <div className="border-b border-border px-4 py-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher un ami..."
            className="rounded-full pl-10"
            autoFocus
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {createConversation.isPending ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : isSearchActive ? (
          isSearching ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : searchRecipients.length === 0 ? (
            <div className="px-4 py-8 text-center text-sm text-muted-foreground">
              Aucun resultat pour &quot;{searchQuery}&quot;
            </div>
          ) : (
            <div className="p-2">
              {searchRecipients.map((recipient) => (
                <RecipientItem
                  key={recipient.id}
                  recipient={recipient}
                  onSelect={() => handleSelectRecipient(recipient.id)}
                />
              ))}
            </div>
          )
        ) : isLoadingFriends ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : recentFriends.length === 0 ? (
          <div className="flex flex-col items-center gap-2 px-4 py-8 text-center">
            <Users className="h-8 w-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Ajoutez des amis pour leur envoyer des messages
            </p>
          </div>
        ) : (
          <div className="p-2">
            <p className="mb-2 px-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Amis recents
            </p>
            {recentFriends.map((friend) => (
              <RecipientItem
                key={friend.id}
                recipient={friend}
                onSelect={() => handleSelectRecipient(friend.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
