import { Suspense } from "react";
import { requireAuth } from "@/adapters/guards/auth.guard";
import { JournalBadges } from "./_components/journal-badges";
import { JournalEntries } from "./_components/journal-entries";
import { JournalGallery } from "./_components/journal-gallery";
import { JournalHeader } from "./_components/journal-header";

function WidgetSkeleton() {
  return <div className="h-48 animate-pulse rounded-xl bg-muted" />;
}

export default async function JournalPage() {
  const session = await requireAuth();
  const userId = session.user.id;
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  const today = `${y}-${m}-${d}`;

  return (
    <div className="container mx-auto max-w-7xl px-4 py-4">
      <JournalHeader
        userName={session.user.name}
        userImage={session.user.image}
        today={today}
      />

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div>
          <JournalEntries />
        </div>

        <div className="flex flex-col gap-4">
          <Suspense fallback={<WidgetSkeleton />}>
            <JournalGallery userId={userId} />
          </Suspense>
          <Suspense fallback={<WidgetSkeleton />}>
            <JournalBadges userId={userId} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
