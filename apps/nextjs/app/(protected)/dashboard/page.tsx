import { Suspense } from "react";
import { requireAuth } from "@/adapters/guards/auth.guard";
import { getProfileAvatarUrl } from "@/adapters/queries/profile-avatar.query";
import { CalendarWidget } from "./_components/calendar-widget";
import { GalleryWidget } from "./_components/gallery-widget";
import { JournalWidget } from "./_components/journal-widget";
import { MessagesWidget } from "./_components/messages-widget";
import { MoodWidget } from "./_components/mood-widget";
import { MoodboardWidgetServer } from "./_components/moodboard-widget-server";
import { SuiviWeeklyWidget } from "./_components/suivi-weekly-widget";
import { TasksWidget } from "./_components/tasks-widget";
import { WidgetSkeleton } from "./_components/widget-skeleton";

function getLocalToday(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const session = await requireAuth();
  const userId = session.user.id;
  const profileAvatar = await getProfileAvatarUrl(userId);

  const params = await searchParams;
  const today = getLocalToday();
  const selectedDate =
    params.date && DATE_REGEX.test(params.date) ? params.date : today;

  const userImage = profileAvatar ?? session.user.image;

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8">
      <div className="flex flex-col gap-4 lg:flex-row">
        <div className="flex flex-1 flex-col gap-4 h-fit bg-homecafe-green/10 p-4 rounded-xl">
          <Suspense fallback={<WidgetSkeleton />}>
            <GalleryWidget userId={userId} />
          </Suspense>
          <Suspense fallback={<WidgetSkeleton />}>
            <MessagesWidget userId={userId} />
          </Suspense>
          <Suspense fallback={<WidgetSkeleton />}>
            <MoodWidget userId={userId} />
          </Suspense>
        </div>

        <div className="flex flex-1 flex-col gap-4 h-fit bg-homecafe-pink/10 p-4 rounded-xl">
          <Suspense fallback={<WidgetSkeleton />}>
            <CalendarWidget userId={userId} selectedDate={selectedDate} />
          </Suspense>
          <Suspense fallback={<WidgetSkeleton />}>
            <TasksWidget userId={userId} />
          </Suspense>
        </div>

        {/* Column 3 */}
        <div className="flex flex-1 flex-col gap-4 h-fit bg-homecafe-orange/10 p-4 rounded-xl">
          <Suspense fallback={<WidgetSkeleton />}>
            <JournalWidget
              userId={userId}
              userName={session.user.name}
              userImage={userImage}
              selectedDate={selectedDate}
            />
          </Suspense>
          <Suspense fallback={<WidgetSkeleton />}>
            <MoodboardWidgetServer
              userId={userId}
              selectedDate={selectedDate}
            />
          </Suspense>
          <Suspense fallback={<WidgetSkeleton />}>
            <SuiviWeeklyWidget userId={userId} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
