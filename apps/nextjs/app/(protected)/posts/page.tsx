import { requireAuth } from "@/adapters/guards/auth.guard";
import { PostsList } from "./_components/posts-list";

export default async function PostsPage() {
  await requireAuth();

  return (
    <div className="mx-auto max-w-2xl p-4">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">My Posts</h1>
        <a
          href="/posts/new"
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          New Post
        </a>
      </div>
      <PostsList />
    </div>
  );
}
