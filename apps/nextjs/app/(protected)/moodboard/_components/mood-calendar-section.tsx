"use client";

import { useState } from "react";
import type { EmotionYearEntry } from "@/adapters/queries/emotion-year-calendar.query";
import { MoodWeekCalendar } from "./mood-week-calendar";
import { MoodYearCalendar } from "./mood-year-calendar";

interface MoodCalendarSectionProps {
  year: number;
  initialData: EmotionYearEntry[];
}

export function MoodCalendarSection({
  year,
  initialData,
}: MoodCalendarSectionProps) {
  const [showFull, setShowFull] = useState(false);

  return (
    <>
      {/* Desktop: always show full year calendar */}
      <div className="hidden lg:block">
        <MoodYearCalendar year={year} initialData={initialData} />
      </div>

      {/* Mobile: week view with toggle to full */}
      <div className="lg:hidden">
        {showFull ? (
          <MoodYearCalendar
            year={year}
            initialData={initialData}
            cellSize="calc((100vw - 3.5rem) / 12)"
          />
        ) : (
          <MoodWeekCalendar initialData={initialData} />
        )}
        <div className="mt-4 flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => setShowFull(!showFull)}
            className="rounded-full border border-foreground/15 px-5 py-2 text-sm font-medium text-foreground shadow-sm transition-colors hover:bg-muted"
          >
            {showFull ? "Voir la semaine" : "Voir le graphique entier"}
          </button>
        </div>
      </div>
    </>
  );
}
