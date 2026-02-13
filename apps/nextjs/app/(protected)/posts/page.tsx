import { requireAuth } from "@/adapters/guards/auth.guard";
import { PostsList } from "./_components/posts-list";

export default async function PostsPage() {
  await requireAuth();

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <PostsList />
    </div>
  );
}
