import { requireAuth } from "@/adapters/guards/auth.guard";
import { SocialFeed } from "./_components/social-feed";
import { SocialGallery } from "./_components/social-gallery";

export default async function SocialPage() {
  const session = await requireAuth();
  const userId = session.user.id;

  return (
    <div className="container mx-auto max-w-7xl px-4 py-4">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div>
          <SocialFeed userId={userId} />
        </div>

        <div>
          <SocialGallery userId={userId} />
        </div>
      </div>
    </div>
  );
}
