"use client";

import { Button } from "@packages/ui/components/ui/button";
import { Calendar } from "@packages/ui/components/ui/calendar";
import { useCallback, useMemo } from "react";
import type {
  IChronologyCardDto,
  IGetChronologyOutputDto,
} from "@/application/dto/board/get-chronology.dto";

const BOARD_COLORS = [
  "bg-blue-500",
  "bg-green-500",
  "bg-purple-500",
  "bg-orange-500",
  "bg-pink-500",
  "bg-teal-500",
];

interface ChronologyCalendarProps {
  month: Date;
  eventDates: IGetChronologyOutputDto["eventDates"];
  cards: IChronologyCardDto[];
  selectedDate: string | null;
  onSelectDate: (date: string | null) => void;
  onMonthChange: (month: Date) => void;
}

export function ChronologyCalendar({
  month,
  eventDates,
  cards,
  selectedDate,
  onSelectDate,
  onMonthChange,
}: ChronologyCalendarProps) {
  const boardColorMap = useMemo(() => {
    const uniqueBoardIds = [...new Set(cards.map((c) => c.boardId))];
    const map = new Map<string, string>();
    for (const [i, boardId] of uniqueBoardIds.entries()) {
      map.set(boardId, BOARD_COLORS[i % BOARD_COLORS.length] ?? "bg-gray-400");
    }
    return map;
  }, [cards]);

  const selectedDay = selectedDate
    ? new Date(`${selectedDate}T00:00:00`)
    : undefined;

  const formatDateKey = useCallback((date: Date): string => {
    const year = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${year}-${m}-${d}`;
  }, []);

  const todayKey = useMemo(() => formatDateKey(new Date()), [formatDateKey]);

  return (
    <div>
      <Calendar
        mode="single"
        month={month}
        onMonthChange={onMonthChange}
        selected={selectedDay}
        onSelect={(date) => {
          if (date) {
            onSelectDate(formatDateKey(date));
          } else {
            onSelectDate(null);
          }
        }}
        components={{
          DayButton: ({ day, modifiers: mods, ...props }) => {
            const dateKey = formatDateKey(day.date);
            const info = eventDates[dateKey];
            const isToday = todayKey === dateKey;

            return (
              <Button
                variant="ghost"
                {...props}
                className={`relative flex aspect-square w-full min-w-8 flex-col items-center justify-center gap-0.5 rounded-md text-sm ${
                  selectedDate === dateKey
                    ? "bg-primary text-primary-foreground"
                    : isToday
                      ? "bg-accent text-accent-foreground"
                      : mods.outside
                        ? "text-muted-foreground opacity-50"
                        : ""
                } ${info ? "font-medium" : ""}`}
              >
                <span>{day.date.getDate()}</span>
                {info && (
                  <div className="flex gap-0.5">
                    {info.boards.map((b) => (
                      <span
                        key={b.id}
                        className={`size-1.5 rounded-full ${boardColorMap.get(b.id) ?? "bg-gray-400"}`}
                      />
                    ))}
                  </div>
                )}
              </Button>
            );
          },
        }}
      />
      <div className="mt-3 flex flex-wrap gap-2 px-3">
        {[...boardColorMap.entries()].map(([boardId, color]) => {
          const boardTitle = cards.find(
            (c) => c.boardId === boardId,
          )?.boardTitle;
          return (
            <div key={boardId} className="flex items-center gap-1.5">
              <span className={`size-2 rounded-full ${color}`} />
              <span className="text-xs text-muted-foreground">
                {boardTitle}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
