import { Suspense } from "react";
import { requireAuth } from "@/adapters/guards/auth.guard";
import { FriendsCardServer } from "../_components/friends-card-server";
import { SocialFeed } from "./_components/social-feed";
import { SocialGallery } from "./_components/social-gallery";

export default async function SocialPage() {
  const session = await requireAuth();
  const userId = session.user.id;

  return (
    <div className="container mx-auto max-w-7xl px-4 py-4">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div>
          <SocialFeed userId={userId} />
        </div>

        <div>
          <Suspense fallback={<div className="h-40 rounded-lg bg-muted" />}>
            <FriendsCardServer userId={userId} />
          </Suspense>
          <div className="mt-4">
            <SocialGallery userId={userId} />
          </div>
        </div>
      </div>
    </div>
  );
}
