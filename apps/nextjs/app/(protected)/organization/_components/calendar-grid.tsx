"use client";

import { useMemo } from "react";
import type { UnifiedCalendarEvent } from "./calendar-view";

interface CalendarGridProps {
  month: Date;
  events: UnifiedCalendarEvent[];
  onDateClick: (dateKey: string) => void;
}

const DAY_NAMES = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

const COLOR_MAP: Record<string, string> = {
  pink: "bg-pink-400",
  green: "bg-green-400",
  orange: "bg-orange-400",
  blue: "bg-blue-400",
  purple: "bg-purple-400",
  amber: "bg-amber-400",
  red: "bg-red-400",
  teal: "bg-teal-400",
};

const MAX_VISIBLE_EVENTS = 3;

interface CalendarDay {
  date: Date;
  dateKey: string;
  isCurrentMonth: boolean;
  events: UnifiedCalendarEvent[];
}

function formatDateKey(date: Date): string {
  const year = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${year}-${m}-${d}`;
}

function buildCalendarDays(
  month: Date,
  eventsByDate: Map<string, UnifiedCalendarEvent[]>,
): CalendarDay[] {
  const year = month.getFullYear();
  const monthIndex = month.getMonth();
  const firstDay = new Date(year, monthIndex, 1);
  const lastDay = new Date(year, monthIndex + 1, 0);
  const startOffset = (firstDay.getDay() - 1 + 7) % 7;
  const days: CalendarDay[] = [];

  for (let i = startOffset - 1; i >= 0; i--) {
    const date = new Date(year, monthIndex, -i);
    const dateKey = formatDateKey(date);
    days.push({
      date,
      dateKey,
      isCurrentMonth: false,
      events: eventsByDate.get(dateKey) ?? [],
    });
  }

  for (let d = 1; d <= lastDay.getDate(); d++) {
    const date = new Date(year, monthIndex, d);
    const dateKey = formatDateKey(date);
    days.push({
      date,
      dateKey,
      isCurrentMonth: true,
      events: eventsByDate.get(dateKey) ?? [],
    });
  }

  const remaining = 7 - (days.length % 7);
  if (remaining < 7) {
    for (let i = 1; i <= remaining; i++) {
      const date = new Date(year, monthIndex + 1, i);
      const dateKey = formatDateKey(date);
      days.push({
        date,
        dateKey,
        isCurrentMonth: false,
        events: eventsByDate.get(dateKey) ?? [],
      });
    }
  }

  return days;
}

export function CalendarGrid({
  month,
  events,
  onDateClick,
}: CalendarGridProps) {
  const eventsByDate = useMemo(() => {
    const map = new Map<string, UnifiedCalendarEvent[]>();
    for (const event of events) {
      const existing = map.get(event.date);
      if (existing) {
        existing.push(event);
      } else {
        map.set(event.date, [event]);
      }
    }
    return map;
  }, [events]);

  const days = useMemo(
    () => buildCalendarDays(month, eventsByDate),
    [month, eventsByDate],
  );

  const today = formatDateKey(new Date());

  return (
    <div className="overflow-auto rounded-lg border border-orange-100">
      <div className="grid grid-cols-7 border-b border-orange-100 bg-orange-50/50">
        {DAY_NAMES.map((name) => (
          <div
            key={name}
            className="px-2 py-2 text-center text-xs font-medium text-muted-foreground"
          >
            {name}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7">
        {days.map((day) => {
          const visibleEvents = day.events.slice(0, MAX_VISIBLE_EVENTS);
          const overflowCount = day.events.length - MAX_VISIBLE_EVENTS;
          const isToday = day.dateKey === today;

          return (
            <button
              type="button"
              key={day.dateKey}
              onClick={() => onDateClick(day.dateKey)}
              className={`min-h-[60px] border-b border-r border-orange-50 p-1.5 text-left transition-colors hover:bg-orange-50/30 sm:min-h-[80px] sm:p-2 lg:min-h-[100px] ${
                day.isCurrentMonth ? "bg-white" : "bg-gray-50/50"
              }`}
            >
              <span
                className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-sm ${
                  isToday
                    ? "bg-orange-500 font-bold text-white"
                    : day.isCurrentMonth
                      ? "font-medium"
                      : "text-muted-foreground"
                }`}
              >
                {day.date.getDate()}
              </span>

              <div className="mt-1 flex flex-col gap-0.5">
                {visibleEvents.map((event) => (
                  <div
                    key={event.id}
                    className={`flex items-center gap-1 truncate rounded px-1.5 py-0.5 text-xs font-medium text-white ${
                      COLOR_MAP[event.color] ?? "bg-blue-400"
                    }`}
                  >
                    {event.source === "google" && (
                      <svg
                        className="h-2.5 w-2.5 shrink-0"
                        viewBox="0 0 24 24"
                        role="img"
                        aria-label="Google"
                      >
                        <path
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                          fill="currentColor"
                        />
                        <path
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                          fill="currentColor"
                        />
                      </svg>
                    )}
                    <span className="truncate">{event.title}</span>
                  </div>
                ))}

                {overflowCount > 0 && (
                  <span className="px-1.5 text-xs text-muted-foreground">
                    +{overflowCount}
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
