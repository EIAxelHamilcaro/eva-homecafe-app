"use client";

import { Button } from "@packages/ui/components/ui/button";
import { UserPlus } from "lucide-react";
import { useState } from "react";
import { FriendsModal } from "@/app/(protected)/_components/friends-modal";
import { useFriendFeedQuery } from "@/app/(protected)/_hooks/use-feed";
import { FeedPostCard } from "./feed-post-card";

export function FriendFeed() {
  const [page, setPage] = useState(1);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const { data, isLoading, error } = useFriendFeedQuery(page);

  return (
    <div>
      {isLoading && (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-40 animate-pulse rounded-lg bg-muted" />
          ))}
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-center text-destructive">
          {error.message}
        </div>
      )}

      {!isLoading && !error && data && !data.hasFriends && (
        <div className="rounded-lg border border-dashed p-8 text-center">
          <p className="mb-2 text-lg font-medium text-muted-foreground">
            Pas encore de posts dans ton feed
          </p>
          <p className="mb-4 text-sm text-muted-foreground">
            Ajoute des amis pour voir leurs publications !
          </p>
          <Button
            onClick={() => setInviteModalOpen(true)}
            className="bg-homecafe-pink text-white hover:bg-homecafe-pink/90"
          >
            <UserPlus className="mr-2 h-4 w-4" />
            Inviter des amis
          </Button>
        </div>
      )}

      {!isLoading &&
        !error &&
        data &&
        data.hasFriends &&
        data.data.length === 0 && (
          <div className="rounded-lg border border-dashed p-8 text-center">
            <p className="mb-2 text-lg font-medium text-muted-foreground">
              Tes amis n&apos;ont encore rien publié
            </p>
            <p className="text-sm text-muted-foreground">
              Reviens plus tard pour voir ce que tes amis partagent !
            </p>
          </div>
        )}

      {!isLoading && !error && data && data.data.length > 0 && (
        <div className="space-y-4">
          {data.data.map((feedPost) => (
            <FeedPostCard key={feedPost.id} post={feedPost} />
          ))}

          {data.pagination.totalPages > 1 && (
            <div className="flex items-center justify-center gap-4 pt-4">
              <Button
                variant="outline"
                disabled={!data.pagination.hasPreviousPage}
                onClick={() => setPage((p) => p - 1)}
                className="rounded-md border px-3 py-1 text-sm disabled:opacity-50"
              >
                Précédent
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {data.pagination.page} / {data.pagination.totalPages}
              </span>
              <Button
                variant="outline"
                disabled={!data.pagination.hasNextPage}
                onClick={() => setPage((p) => p + 1)}
                className="rounded-md border px-3 py-1 text-sm disabled:opacity-50"
              >
                Suivant
              </Button>
            </div>
          )}
        </div>
      )}

      <FriendsModal
        open={inviteModalOpen}
        onOpenChange={setInviteModalOpen}
        defaultTab="invite"
      />
    </div>
  );
}
