import { requireAuth } from "@/adapters/guards/auth.guard";
import { CreatePostForm } from "./_components/create-post-form";

export default async function CreatePostPage() {
  await requireAuth();

  return (
    <div className="mx-auto max-w-2xl p-4">
      <h1 className="mb-6 text-2xl font-bold">Create a Post</h1>
      <CreatePostForm />
    </div>
  );
}
