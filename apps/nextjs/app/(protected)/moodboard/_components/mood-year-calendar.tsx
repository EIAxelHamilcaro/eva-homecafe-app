"use client";

import { useCallback, useState } from "react";
import type { MoodYearEntry } from "@/adapters/queries/mood-year-calendar.query";
import { getMoodColor } from "@/app/(protected)/mood/_components/mood-config";
import { MoodCellPopover } from "./mood-cell-popover";

interface MoodYearCalendarProps {
  year: number;
  initialData: MoodYearEntry[];
}

const MONTH_KEYS = [
  "jan",
  "feb",
  "mar",
  "apr",
  "may",
  "jun",
  "jul",
  "aug",
  "sep",
  "oct",
  "nov",
  "dec",
] as const;

const MONTH_HEADERS: Record<string, string> = {
  jan: "J",
  feb: "F",
  mar: "M",
  apr: "A",
  may: "M",
  jun: "J",
  jul: "J",
  aug: "A",
  sep: "S",
  oct: "O",
  nov: "N",
  dec: "D",
};

function daysInMonth(month: number, year: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function formatDate(year: number, month: number, day: number): string {
  const m = String(month + 1).padStart(2, "0");
  const d = String(day).padStart(2, "0");
  return `${year}-${m}-${d}`;
}

export function MoodYearCalendar({ year, initialData }: MoodYearCalendarProps) {
  const [moodMap, setMoodMap] = useState<Map<string, string>>(() => {
    const map = new Map<string, string>();
    for (const entry of initialData) {
      map.set(entry.date, entry.category);
    }
    return map;
  });

  const handleMoodSelected = useCallback((date: string, category: string) => {
    setMoodMap((prev) => {
      const next = new Map(prev);
      next.set(date, category);
      return next;
    });
  }, []);

  const today = new Date();
  const todayStr = formatDate(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  );

  return (
    <div className="w-full overflow-x-auto">
      {/* Month headers */}
      <div className="grid grid-cols-[2rem_repeat(12,1fr)]">
        <div />
        {MONTH_KEYS.map((key) => (
          <div
            key={key}
            className="pb-1 text-center text-xs font-bold text-foreground"
          >
            {MONTH_HEADERS[key]}
          </div>
        ))}
      </div>

      {/* Day rows */}
      {Array.from({ length: 31 }, (_, dayIdx) => {
        const day = dayIdx + 1;
        return (
          <div key={day} className="grid grid-cols-[2rem_repeat(12,1fr)]">
            <div className="flex h-6 items-center justify-end pr-1.5 text-xs font-semibold text-foreground">
              {day}
            </div>
            {MONTH_KEYS.map((monthKey, monthIdx) => {
              const maxDays = daysInMonth(monthIdx, year);
              if (day > maxDays) {
                return <div key={monthKey} className="h-6" />;
              }

              const dateStr = formatDate(year, monthIdx, day);
              const category = moodMap.get(dateStr);
              const isFuture = dateStr > todayStr;
              const bgColor = category ? getMoodColor(category) : undefined;

              return (
                <MoodCellPopover
                  key={dateStr}
                  date={dateStr}
                  onMoodSelected={handleMoodSelected}
                >
                  <button
                    type="button"
                    className="flex h-6 w-full items-center justify-center transition-colors hover:opacity-80"
                    style={bgColor ? { backgroundColor: bgColor } : undefined}
                  >
                    {!category && !isFuture && (
                      <span className="text-[9px] text-muted-foreground/40">
                        &rsaquo;
                      </span>
                    )}
                  </button>
                </MoodCellPopover>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}
