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

  return (
    <div className="w-full overflow-x-auto">
      {/* Month headers */}
      <div className="grid grid-cols-[2rem_repeat(12,1fr)]">
        <div />
        {MONTH_KEYS.map((key) => (
          <div
            key={key}
            className="pb-2 text-center text-sm font-medium text-foreground"
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
            <div className="flex aspect-square items-center justify-end pr-1 text-sm font-bold text-foreground">
              {day}
            </div>
            {MONTH_KEYS.map((monthKey, monthIdx) => {
              const maxDays = daysInMonth(monthIdx, year);
              if (day > maxDays) {
                return <div key={monthKey} />;
              }

              const dateStr = formatDate(year, monthIdx, day);
              const category = moodMap.get(dateStr);
              const bgColor = category ? getMoodColor(category) : undefined;

              return (
                <MoodCellPopover
                  key={dateStr}
                  date={dateStr}
                  onMoodSelected={handleMoodSelected}
                >
                  <button
                    type="button"
                    className="flex aspect-square w-full items-center justify-center rounded-md transition-colors hover:opacity-80"
                    style={bgColor ? { backgroundColor: bgColor } : undefined}
                  >
                    {!category && (
                      <span className="text-[10px] text-muted-foreground/40">
                        &#8744;
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
