import { requireAuth } from "@/adapters/guards/auth.guard";
import { GalleryClient } from "./_components/gallery-client";

export default async function GalleryPage() {
  await requireAuth();

  return (
    <div className="container mx-auto max-w-5xl px-4 py-6">
      <GalleryClient />
    </div>
  );
}
