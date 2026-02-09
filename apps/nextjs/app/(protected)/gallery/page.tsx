import { requireAuth } from "@/adapters/guards/auth.guard";
import { GalleryUpload } from "./_components/gallery-upload";

export default async function GalleryPage() {
  await requireAuth();

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <h1 className="mb-6 font-bold text-2xl">Gallery</h1>
      <GalleryUpload />
    </div>
  );
}
