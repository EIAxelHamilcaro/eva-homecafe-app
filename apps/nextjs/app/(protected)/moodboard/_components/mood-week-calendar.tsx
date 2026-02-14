"use client";

import { Button } from "@packages/ui/components/ui/button";
import { useCallback, useState } from "react";
import type { EmotionYearEntry } from "@/adapters/queries/emotion-year-calendar.query";
import { getMoodColor } from "@/app/(protected)/mood/_components/mood-config";
import { MoodCellPopover } from "./mood-cell-popover";

interface MoodWeekCalendarProps {
  initialData: EmotionYearEntry[];
}

const WEEK_HEADERS = ["L", "M", "M", "J", "V", "S", "D"];

function getWeekDates(): string[] {
  const now = new Date();
  const day = now.getDay();
  const monday = new Date(now);
  monday.setDate(now.getDate() - (day === 0 ? 6 : day - 1));

  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${dd}`;
  });
}

export function MoodWeekCalendar({ initialData }: MoodWeekCalendarProps) {
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

  const weekDates = getWeekDates();

  return (
    <div className="grid grid-cols-7 gap-2">
      {WEEK_HEADERS.map((label, idx) => (
        <div
          key={`h-${weekDates[idx]}`}
          className="text-center text-sm font-bold text-foreground"
        >
          {label}
        </div>
      ))}
      {weekDates.map((dateStr) => {
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
              className={`flex aspect-square w-full items-center justify-center rounded-[4px] transition-colors hover:opacity-80 ${!category ? "bg-muted/50" : ""}`}
              style={bgColor ? { backgroundColor: bgColor } : {}}
            >
              {!category && (
                <span className="text-xs text-muted-foreground/60">
                  &#8744;
                </span>
              )}
            </Button>
          </MoodCellPopover>
        );
      })}
    </div>
  );
}
