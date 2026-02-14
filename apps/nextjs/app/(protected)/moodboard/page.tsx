import { Suspense } from "react";
import { requireAuth } from "@/adapters/guards/auth.guard";
import { getEmotionYearCalendar } from "@/adapters/queries/emotion-year-calendar.query";
import { DateSticker } from "@/app/(protected)/_components/date-sticker";
import { MoodboardWidgetServer } from "@/app/(protected)/dashboard/_components/moodboard-widget-server";
import { SuiviMonthlyWidget } from "@/app/(protected)/dashboard/_components/suivi-monthly-widget";
import { SuiviWeeklyWidget } from "@/app/(protected)/dashboard/_components/suivi-weekly-widget";
import { JournalBadges } from "@/app/(protected)/journal/_components/journal-badges";
import { MoodCalendarSection } from "./_components/mood-calendar-section";
import { MoodLegendCard } from "./_components/mood-legend-card";

function getLocalToday(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function WidgetSkeleton() {
  return <div className="h-24 animate-pulse rounded-xl bg-muted" />;
}

export default async function MoodboardPage() {
  const session = await requireAuth();
  const userId = session.user.id;
  const year = new Date().getFullYear();
  const today = getLocalToday();

  let yearData: Awaited<ReturnType<typeof getEmotionYearCalendar>> = [];
  try {
    yearData = await getEmotionYearCalendar(userId, year);
  } catch {
    /* empty */
  }

  return (
    <div className="container mx-auto max-w-7xl px-4 py-3">
      <div className="flex flex-col gap-4 lg:flex-row">
        {/* Left sidebar */}
        <div className="flex w-full flex-col gap-3 lg:w-32">
          <DateSticker />
          <MoodLegendCard />
        </div>

        {/* Center — Calendar */}
        <div className="min-w-0">
          <h1 className="text-lg font-bold">
            Que ressens-tu aujourd&apos;hui ?
          </h1>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Colore la case du jour pour un suivi des émotions poussé !
          </p>
          <div className="mt-2">
            <MoodCalendarSection year={year} initialData={yearData} />
          </div>
        </div>

        {/* Right sidebar — compact cards on desktop */}
        <div className="flex w-full min-w-0 flex-col gap-3 lg:w-[340px] lg:shrink-0 lg:gap-1 lg:[&_[data-slot=card-content]]:px-3 lg:[&_[data-slot=card-content]]:py-1.5">
          <Suspense fallback={<WidgetSkeleton />}>
            <MoodboardWidgetServer userId={userId} selectedDate={today} />
          </Suspense>
          <Suspense fallback={<WidgetSkeleton />}>
            <SuiviWeeklyWidget userId={userId} compact />
          </Suspense>
          <Suspense fallback={<WidgetSkeleton />}>
            <SuiviMonthlyWidget userId={userId} compact />
          </Suspense>
          <Suspense fallback={<WidgetSkeleton />}>
            <JournalBadges userId={userId} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
