import { Card, CardContent } from "@packages/ui/components/ui/card";
import { getChronology } from "@/adapters/queries/chronology.query";
import { CalendarWidgetClient } from "./calendar-widget-client";
import { WidgetEmptyState } from "./widget-empty-state";

interface CalendarWidgetProps {
  userId: string;
  selectedDate: string;
}

type EventInfo = { hasTodo: boolean; hasKanban: boolean; count: number };

export async function CalendarWidget({
  userId,
  selectedDate,
}: CalendarWidgetProps) {
  const [year, monthNum] = selectedDate.split("-").map(Number) as [
    number,
    number,
  ];
  const monthStr = `${year}-${String(monthNum).padStart(2, "0")}`;

  let result: Awaited<ReturnType<typeof getChronology>>;
  try {
    result = await getChronology(userId, monthStr);
  } catch {
    return <WidgetEmptyState type="calendar" />;
  }

  const eventDates: Record<string, EventInfo> = {};
  for (const c of result.cards) {
    const existing = eventDates[c.dueDate];
    if (existing) {
      existing.count++;
      if (c.boardType === "todo") existing.hasTodo = true;
      if (c.boardType === "kanban") existing.hasKanban = true;
    } else {
      eventDates[c.dueDate] = {
        hasTodo: c.boardType === "todo",
        hasKanban: c.boardType === "kanban",
        count: 1,
      };
    }
  }

  return (
    <Card className="border-0">
      <CardContent className="">
        <CalendarWidgetClient
          selectedDate={selectedDate}
          eventDates={eventDates}
        />
      </CardContent>
    </Card>
  );
}
