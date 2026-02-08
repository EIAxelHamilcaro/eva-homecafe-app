import { requireAuth } from "@/adapters/guards/auth.guard";
import { PostDetail } from "./_components/post-detail";

export default async function PostDetailPage({
  params,
}: {
  params: Promise<{ postId: string }>;
}) {
  await requireAuth();
  const { postId } = await params;

  return (
    <div className="mx-auto max-w-2xl p-4">
      <PostDetail postId={postId} />
    </div>
  );
}
