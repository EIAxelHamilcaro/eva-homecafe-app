import { requireAuth } from "@/adapters/guards/auth.guard";
import { PublicGalleryGrid } from "./_components/public-gallery-grid";
import { PublicGalleryHeader } from "./_components/public-gallery-header";

export default async function PublicGalleryPage() {
  const session = await requireAuth();

  return (
    <div className="container mx-auto max-w-5xl px-4 py-6">
      <PublicGalleryHeader />
      <PublicGalleryGrid userId={session.user.id} />
    </div>
  );
}
