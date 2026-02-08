import { requireAuth } from "@/adapters/guards/auth.guard";
import { EditPostForm } from "./_components/edit-post-form";

export default async function EditPostPage({
  params,
}: {
  params: Promise<{ postId: string }>;
}) {
  const session = await requireAuth();
  const { postId } = await params;

  return (
    <div className="mx-auto max-w-2xl p-4">
      <h1 className="mb-6 text-2xl font-bold">Edit Post</h1>
      <EditPostForm postId={postId} currentUserId={session.user.id} />
    </div>
  );
}
