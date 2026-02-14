"use client";

import { Button } from "@packages/ui/components/ui/button";
import { Fragment, useCallback, useState } from "react";
import type { EmotionYearEntry } from "@/adapters/queries/emotion-year-calendar.query";
import { getMoodColor } from "@/app/(protected)/mood/_components/mood-config";
import { MoodCellPopover } from "./mood-cell-popover";

interface MoodYearCalendarProps {
  year: number;
  initialData: EmotionYearEntry[];
  cellSize?: string;
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

export function MoodYearCalendar({
  year,
  initialData,
  cellSize: cellSizeProp,
}: MoodYearCalendarProps) {
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

  const cellSize = cellSizeProp ?? "calc((100vh - 14rem) / 32)";

  return (
    <div
      className="inline-grid gap-0"
      style={{
        gridTemplateColumns: `1rem repeat(12, ${cellSize})`,
      }}
    >
      {/* Month headers */}
      <div />
      {MONTH_KEYS.map((key) => (
        <div
          key={key}
          className="flex items-end justify-center text-[10px] font-semibold tracking-wider text-foreground"
          style={{ height: cellSize }}
        >
          {MONTH_HEADERS[key]}
        </div>
      ))}

      {/* Day rows */}
      {Array.from({ length: 31 }, (_, dayIdx) => {
        const day = dayIdx + 1;
        return (
          <Fragment key={day}>
            <div
              className="flex items-center justify-end pr-0.5 text-[10px] font-bold leading-none text-foreground"
              style={{ height: cellSize }}
            >
              {day}
            </div>
            {MONTH_KEYS.map((monthKey, monthIdx) => {
              const maxDays = daysInMonth(monthIdx, year);
              if (day > maxDays) {
                return (
                  <div
                    key={monthKey}
                    style={{ height: cellSize, width: cellSize }}
                  />
                );
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
                  <Button
                    variant="ghost"
                    className={`flex items-center justify-center rounded-[3px] transition-colors hover:opacity-80 ${!category ? "bg-muted/50" : ""}`}
                    style={{
                      height: cellSize,
                      width: cellSize,
                      ...(bgColor ? { backgroundColor: bgColor } : {}),
                    }}
                  >
                    {!category && (
                      <span className="text-[7px] text-muted-foreground/60">
                        &#8744;
                      </span>
                    )}
                  </Button>
                </MoodCellPopover>
              );
            })}
          </Fragment>
        );
      })}
    </div>
  );
}
