import { requireAuth } from "@/adapters/guards/auth.guard";
import { FriendFeed } from "./_components/friend-feed";

export default async function SocialPage() {
  await requireAuth();

  return (
    <div className="mx-auto max-w-2xl p-4">
      <h1 className="mb-6 text-2xl font-bold">Social Feed</h1>
      <FriendFeed />
    </div>
  );
}
