import { useMemo, useState } from "react";
import { View } from "react-native";

import {
  Calendar,
  createDot,
  type MarkedDate,
} from "@/components/organisation/calendar";
import { useChronology } from "@/lib/api/hooks/use-boards";

interface CalendarWidgetProps {
  selectedDate: string;
  onSelectDate: (date: string) => void;
}

export function CalendarWidget({
  selectedDate,
  onSelectDate,
}: CalendarWidgetProps) {
  const [currentMonth, setCurrentMonth] = useState(() => {
    const parts = selectedDate.split("-");
    return `${parts[0]}-${parts[1]}`;
  });
  const { data: chronology } = useChronology(currentMonth);

  const markedDates = useMemo(() => {
    if (!chronology?.cards) return {};
    const dateInfo: Record<string, { hasTodo: boolean; hasKanban: boolean }> =
      {};
    for (const card of chronology.cards) {
      const existing = dateInfo[card.dueDate];
      if (existing) {
        if (card.boardType === "todo") existing.hasTodo = true;
        if (card.boardType === "kanban") existing.hasKanban = true;
      } else {
        dateInfo[card.dueDate] = {
          hasTodo: card.boardType === "todo",
          hasKanban: card.boardType === "kanban",
        };
      }
    }
    const marks: Record<string, MarkedDate> = {};
    for (const [dateKey, info] of Object.entries(dateInfo)) {
      if (info.hasTodo && info.hasKanban) {
        marks[dateKey] = {
          dots: [createDot("pink", `both-${dateKey}`)],
          marked: true,
        };
      } else if (info.hasTodo) {
        marks[dateKey] = {
          dots: [createDot("blue", `todo-${dateKey}`)],
          marked: true,
        };
      } else if (info.hasKanban) {
        marks[dateKey] = {
          dots: [createDot("purple", `kanban-${dateKey}`)],
          marked: true,
        };
      }
    }
    return marks;
  }, [chronology]);

  return (
    <View className="rounded-2xl bg-card p-4">
      <Calendar
        selectedDate={selectedDate}
        markedDates={markedDates}
        onDayPress={(date) => {
          onSelectDate(date.dateString);
        }}
        onMonthChange={(date) => {
          setCurrentMonth(
            `${date.year}-${String(date.month).padStart(2, "0")}`,
          );
        }}
      />
    </View>
  );
}
