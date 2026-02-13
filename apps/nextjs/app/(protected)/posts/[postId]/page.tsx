import { requireAuth } from "@/adapters/guards/auth.guard";
import { PostDetail } from "./_components/post-detail";

export default async function PostDetailPage({
  params,
}: {
  params: Promise<{ postId: string }>;
}) {
  const session = await requireAuth();
  const { postId } = await params;

  return <PostDetail postId={postId} currentUserId={session.user.id} />;
}
