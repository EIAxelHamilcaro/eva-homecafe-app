"use client";

import { Calendar } from "@packages/ui/components/ui/calendar";
import { fr } from "date-fns/locale";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type EventInfo = { hasTodo: boolean; hasKanban: boolean; count: number };

interface CalendarWidgetClientProps {
  selectedDate: string;
  eventDates: Record<string, EventInfo>;
}

function formatDateStr(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function CalendarWidgetClient({
  selectedDate,
  eventDates,
}: CalendarWidgetClientProps) {
  const router = useRouter();
  const selected = new Date(`${selectedDate}T00:00:00`);
  const [month, setMonth] = useState(selected);

  useEffect(() => {
    setMonth(new Date(`${selectedDate}T00:00:00`));
  }, [selectedDate]);

  const todoDates: Date[] = [];
  const kanbanDates: Date[] = [];
  const bothDates: Date[] = [];

  for (const [dateStr, info] of Object.entries(eventDates)) {
    const date = new Date(`${dateStr}T00:00:00`);
    if (info.hasTodo && info.hasKanban) {
      bothDates.push(date);
    } else if (info.hasTodo) {
      todoDates.push(date);
    } else if (info.hasKanban) {
      kanbanDates.push(date);
    }
  }

  return (
    <Calendar
      locale={fr}
      weekStartsOn={1}
      mode="single"
      selected={selected}
      month={month}
      className="w-full [--cell-size:2.5rem] [&_button[data-selected-single=true]]:bg-homecafe-pink [&_button[data-selected-single=true]]:text-white [&_button:hover]:bg-homecafe-pink/20"
      classNames={{
        root: "w-full",
        month: "w-full",
        table: "w-full",
        today:
          "bg-homecafe-pink/20 text-homecafe-pink rounded-md data-[selected=true]:rounded-none",
      }}
      onMonthChange={(newMonth) => {
        setMonth(newMonth);
        const y = newMonth.getFullYear();
        const m = String(newMonth.getMonth() + 1).padStart(2, "0");
        router.push(`/dashboard?date=${y}-${m}-01`, { scroll: false });
      }}
      onSelect={(date) => {
        if (date) {
          router.push(`/dashboard?date=${formatDateStr(date)}`, {
            scroll: false,
          });
        }
      }}
      modifiers={{
        todoOnly: todoDates,
        kanbanOnly: kanbanDates,
        both: bothDates,
      }}
      modifiersClassNames={{
        todoOnly:
          "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
        kanbanOnly:
          "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
        both: "bg-primary/20 text-primary",
      }}
    />
  );
}
