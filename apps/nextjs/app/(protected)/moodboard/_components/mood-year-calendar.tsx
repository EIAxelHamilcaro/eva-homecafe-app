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
      <div className="grid grid-cols-[2.5rem_repeat(12,1fr)] gap-px">
        <div />
        {MONTH_KEYS.map((key) => (
          <div
            key={key}
            className="py-1 text-center text-xs font-semibold text-muted-foreground"
          >
            {MONTH_HEADERS[key]}
          </div>
        ))}
      </div>

      {Array.from({ length: 31 }, (_, dayIdx) => {
        const day = dayIdx + 1;
        return (
          <div
            key={day}
            className="grid grid-cols-[2.5rem_repeat(12,1fr)] gap-px"
          >
            <div className="flex items-center justify-end pr-2 text-xs font-medium text-muted-foreground">
              {day}
            </div>
            {MONTH_KEYS.map((monthKey, monthIdx) => {
              const maxDays = daysInMonth(monthIdx, year);
              if (day > maxDays) {
                return <div key={monthKey} />;
              }

              const dateStr = formatDate(year, monthIdx, day);
              const category = moodMap.get(dateStr);
              const isFuture = dateStr > todayStr;
              const isToday = dateStr === todayStr;
              const bgColor = category ? getMoodColor(category) : undefined;

              return (
                <MoodCellPopover
                  key={dateStr}
                  date={dateStr}
                  onMoodSelected={handleMoodSelected}
                >
                  <button
                    type="button"
                    className={`aspect-square w-full rounded-sm border transition-colors ${
                      isToday ? "ring-2 ring-homecafe-pink ring-offset-1" : ""
                    } ${
                      category
                        ? "border-transparent"
                        : isFuture
                          ? "border-muted bg-muted/30"
                          : "border-muted-foreground/20 bg-muted/50 hover:bg-muted"
                    }`}
                    style={bgColor ? { backgroundColor: bgColor } : undefined}
                  >
                    {!category && !isFuture && (
                      <span className="text-[8px] text-muted-foreground/50">
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
