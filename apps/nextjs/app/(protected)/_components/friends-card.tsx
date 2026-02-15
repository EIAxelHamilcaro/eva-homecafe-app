"use client";

import { Button } from "@packages/ui/components/ui/button";
import { Card, CardContent } from "@packages/ui/components/ui/card";
import { UserPlus, Users } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

import type { FriendsPreviewData } from "@/adapters/queries/friends-preview.query";
import { FriendsModal } from "./friends-modal";

interface FriendsCardProps {
  data: FriendsPreviewData;
}

function AvatarThumbnail({ src, name }: { src: string | null; name: string }) {
  const initial = (name ?? "?").charAt(0).toUpperCase();

  if (src) {
    return (
      <div className="relative h-8 w-8 shrink-0 overflow-hidden rounded-full border-2 border-background">
        <Image src={src} alt={name} fill className="object-cover" />
      </div>
    );
  }

  return (
    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-background bg-homecafe-pink-light">
      <span className="text-xs font-semibold text-homecafe-pink-dark">
        {initial}
      </span>
    </div>
  );
}

export function FriendsCard({ data }: FriendsCardProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTab, setModalTab] = useState<"friends" | "requests" | "invite">(
    "friends",
  );

  return (
    <>
      <Card className="border-0">
        <CardContent className="p-4">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-homecafe-pink" />
              <h3 className="text-sm font-semibold">Amis</h3>
            </div>
            <span className="text-sm text-muted-foreground">{data.count}</span>
          </div>

          {data.friends.length > 0 ? (
            <div className="mb-3 flex -space-x-2">
              {data.friends.map((friend) => (
                <AvatarThumbnail
                  key={friend.id}
                  src={friend.avatarUrl}
                  name={friend.displayName ?? friend.name}
                />
              ))}
              {data.count > 4 && (
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-background bg-muted">
                  <span className="text-xs font-medium text-muted-foreground">
                    +{data.count - 4}
                  </span>
                </div>
              )}
            </div>
          ) : (
            <p className="mb-3 text-sm text-muted-foreground">
              Aucun ami pour le moment
            </p>
          )}

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={() => {
                setModalTab("friends");
                setModalOpen(true);
              }}
            >
              Voir tout
            </Button>
            <Button
              size="sm"
              className="flex-1"
              onClick={() => {
                setModalTab("invite");
                setModalOpen(true);
              }}
            >
              <UserPlus className="mr-1 h-4 w-4" />
              Inviter
            </Button>
          </div>
        </CardContent>
      </Card>

      <FriendsModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        defaultTab={modalTab}
      />
    </>
  );
}
