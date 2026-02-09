import { Suspense } from "react";
import { requireAuth } from "@/adapters/guards/auth.guard";
import { CalendarWidget } from "./_components/calendar-widget";
import { GalleryWidget } from "./_components/gallery-widget";
import { JournalWidget } from "./_components/journal-widget";
import { MessagesWidget } from "./_components/messages-widget";
import { MoodWidget } from "./_components/mood-widget";
import { MoodboardWidget } from "./_components/moodboard-widget";
import { PostsWidget } from "./_components/posts-widget";
import { TasksWidget } from "./_components/tasks-widget";
import { WidgetSkeleton } from "./_components/widget-skeleton";

export default async function DashboardPage() {
  const session = await requireAuth();
  const userId = session.user.id;

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8">
      <h1 className="mb-6 font-bold text-2xl">Dashboard</h1>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
        <Suspense fallback={<WidgetSkeleton />}>
          <MoodWidget userId={userId} />
        </Suspense>
        <Suspense fallback={<WidgetSkeleton />}>
          <PostsWidget userId={userId} />
        </Suspense>
        <Suspense fallback={<WidgetSkeleton />}>
          <TasksWidget userId={userId} />
        </Suspense>
        <Suspense fallback={<WidgetSkeleton />}>
          <GalleryWidget userId={userId} />
        </Suspense>
        <Suspense fallback={<WidgetSkeleton />}>
          <MessagesWidget userId={userId} />
        </Suspense>
        <Suspense fallback={<WidgetSkeleton />}>
          <CalendarWidget userId={userId} />
        </Suspense>
        <Suspense fallback={<WidgetSkeleton />}>
          <JournalWidget />
        </Suspense>
        <Suspense fallback={<WidgetSkeleton />}>
          <MoodboardWidget userId={userId} />
        </Suspense>
      </div>
    </div>
  );
}
