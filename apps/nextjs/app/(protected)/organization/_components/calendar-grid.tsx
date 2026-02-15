"use client";

import { useMemo } from "react";
import type { IChronologyCardDto } from "@/application/dto/board/get-chronology.dto";

interface CalendarGridProps {
  month: Date;
  cards: IChronologyCardDto[];
}

const DAY_NAMES = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

const EVENT_COLORS = [
  "bg-pink-300",
  "bg-green-300",
  "bg-orange-300",
  "bg-blue-300",
  "bg-purple-300",
];

const MAX_VISIBLE_EVENTS = 3;

interface CalendarDay {
  date: Date;
  dateKey: string;
  isCurrentMonth: boolean;
  events: IChronologyCardDto[];
}

function formatDateKey(date: Date): string {
  const year = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${year}-${m}-${d}`;
}

function getEventColor(index: number): string {
  return EVENT_COLORS[index % EVENT_COLORS.length] ?? "bg-pink-300";
}

function buildCalendarDays(
  month: Date,
  cardsByDate: Map<string, IChronologyCardDto[]>,
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
      events: cardsByDate.get(dateKey) ?? [],
    });
  }

  for (let d = 1; d <= lastDay.getDate(); d++) {
    const date = new Date(year, monthIndex, d);
    const dateKey = formatDateKey(date);
    days.push({
      date,
      dateKey,
      isCurrentMonth: true,
      events: cardsByDate.get(dateKey) ?? [],
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
        events: cardsByDate.get(dateKey) ?? [],
      });
    }
  }

  return days;
}

export function CalendarGrid({ month, cards }: CalendarGridProps) {
  const cardsByDate = useMemo(() => {
    const map = new Map<string, IChronologyCardDto[]>();
    for (const card of cards) {
      const existing = map.get(card.dueDate);
      if (existing) {
        existing.push(card);
      } else {
        map.set(card.dueDate, [card]);
      }
    }
    return map;
  }, [cards]);

  const boardColorMap = useMemo(() => {
    const uniqueBoardIds = [...new Set(cards.map((c) => c.boardId))];
    const map = new Map<string, string>();
    for (const [i, boardId] of uniqueBoardIds.entries()) {
      map.set(boardId, getEventColor(i));
    }
    return map;
  }, [cards]);

  const days = useMemo(
    () => buildCalendarDays(month, cardsByDate),
    [month, cardsByDate],
  );

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

          return (
            <div
              key={day.dateKey}
              className={`min-h-[60px] border-b border-r border-orange-50 p-1.5 sm:min-h-[80px] sm:p-2 lg:min-h-[100px] ${
                day.isCurrentMonth ? "bg-white" : "bg-gray-50/50"
              }`}
            >
              <span
                className={`text-sm ${
                  day.isCurrentMonth ? "font-medium" : "text-muted-foreground"
                }`}
              >
                {day.date.getDate()}
              </span>

              <div className="mt-1 flex flex-col gap-0.5">
                {visibleEvents.map((event) => (
                  <div
                    key={event.id}
                    className={`truncate rounded px-1.5 py-0.5 text-xs font-medium text-white ${
                      boardColorMap.get(event.boardId) ?? EVENT_COLORS[0]
                    }`}
                  >
                    {event.title}
                  </div>
                ))}

                {overflowCount > 0 && (
                  <span className="px-1.5 text-xs text-muted-foreground">
                    +{overflowCount}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
