import { Suspense } from "react";
import { requireAuth } from "@/adapters/guards/auth.guard";
import { getMoodYearCalendar } from "@/adapters/queries/mood-year-calendar.query";
import { Footer } from "@/app/(protected)/_components/footer";
import { MoodboardWidgetServer } from "@/app/(protected)/dashboard/_components/moodboard-widget-server";
import { SuiviWeeklyWidget } from "@/app/(protected)/dashboard/_components/suivi-weekly-widget";
import { JournalBadges } from "@/app/(protected)/journal/_components/journal-badges";
import { DateStickerCard } from "./_components/date-sticker-card";
import { MoodLegendCard } from "./_components/mood-legend-card";
import { MoodYearCalendar } from "./_components/mood-year-calendar";
import { SuiviMonthlyCard } from "./_components/suivi-monthly-card";

function getLocalToday(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function WidgetSkeleton() {
  return <div className="h-48 animate-pulse rounded-xl bg-muted" />;
}

export default async function MoodboardPage() {
  const session = await requireAuth();
  const userId = session.user.id;
  const year = new Date().getFullYear();
  const today = getLocalToday();

  let yearData: Awaited<ReturnType<typeof getMoodYearCalendar>> = [];
  try {
    yearData = await getMoodYearCalendar(userId, year);
  } catch {
    /* empty */
  }

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8">
      <div className="flex flex-col gap-6 lg:flex-row">
        {/* Left sidebar */}
        <div className="flex w-full flex-col gap-4 lg:w-36">
          <DateStickerCard />
          <MoodLegendCard />
        </div>

        {/* Center — Calendar */}
        <div className="flex-1">
          <h1 className="text-xl font-bold">
            Que ressens-tu aujourd&apos;hui ?
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Colore la case du jour pour un suivi des émotions poussé !
          </p>
          <div className="mt-4">
            <MoodYearCalendar year={year} initialData={yearData} />
          </div>
        </div>

        {/* Right sidebar */}
        <div className="flex w-full flex-col gap-4 lg:w-80">
          <Suspense fallback={<WidgetSkeleton />}>
            <MoodboardWidgetServer userId={userId} selectedDate={today} />
          </Suspense>
          <Suspense fallback={<WidgetSkeleton />}>
            <SuiviWeeklyWidget userId={userId} />
          </Suspense>
          <Suspense fallback={<WidgetSkeleton />}>
            <SuiviMonthlyCard userId={userId} />
          </Suspense>
          <Suspense fallback={<WidgetSkeleton />}>
            <JournalBadges userId={userId} />
          </Suspense>
        </div>
      </div>

      <div className="mt-8">
        <Footer />
      </div>
    </div>
  );
}
