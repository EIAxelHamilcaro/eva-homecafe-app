import { requireAuth } from "@/adapters/guards/auth.guard";
import { FeedList } from "./_components/feed-list";

export default async function FeedPage() {
  const session = await requireAuth();

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <FeedList currentUserId={session.user.id} />
    </div>
  );
}
