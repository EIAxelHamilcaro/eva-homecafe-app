import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@packages/ui/components/ui/card";
import Link from "next/link";
import { getChronology } from "@/adapters/queries/chronology.query";
import { WidgetEmptyState } from "./widget-empty-state";

interface CalendarWidgetProps {
  userId: string;
}

type DayEventInfo = {
  hasTodo: boolean;
  hasKanban: boolean;
  count: number;
};

export async function CalendarWidget({ userId }: CalendarWidgetProps) {
  let result: Awaited<ReturnType<typeof getChronology>>;
  try {
    result = await getChronology(userId);
  } catch {
    return <WidgetEmptyState type="calendar" />;
  }

  const eventDateKeys = Object.keys(result.eventDates);

  if (eventDateKeys.length === 0) {
    return <WidgetEmptyState type="calendar" />;
  }

  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = new Date(year, month, 1).getDay();

  const monthName = now.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  const days: (number | null)[] = [];
  for (let i = 0; i < firstDayOfWeek; i++) {
    days.push(null);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    days.push(d);
  }

  const currentMonthPrefix = `${year}-${String(month + 1).padStart(2, "0")}-`;
  const dayEventMap = new Map<number, DayEventInfo>();

  for (const c of result.cards) {
    if (!c.dueDate.startsWith(currentMonthPrefix)) continue;
    const dayNum = Number.parseInt(c.dueDate.split("-")[2] ?? "0", 10);
    const existing = dayEventMap.get(dayNum);
    if (existing) {
      existing.count++;
      if (c.boardType === "todo") existing.hasTodo = true;
      if (c.boardType === "kanban") existing.hasKanban = true;
    } else {
      dayEventMap.set(dayNum, {
        hasTodo: c.boardType === "todo",
        hasKanban: c.boardType === "kanban",
        count: 1,
      });
    }
  }

  function getDayColorClass(day: number): string {
    const info = dayEventMap.get(day);
    if (!info) return "";
    if (info.hasTodo && info.hasKanban)
      return "bg-primary/20 font-medium text-primary";
    if (info.hasTodo)
      return "bg-blue-100 font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-300";
    return "bg-purple-100 font-medium text-purple-700 dark:bg-purple-900/30 dark:text-purple-300";
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <Link href="/organization" className="hover:underline">
            {monthName}
          </Link>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-1 text-center text-xs">
          {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
            <div key={day} className="font-medium text-muted-foreground py-1">
              {day}
            </div>
          ))}
          {days.map((day, i) => {
            const eventInfo = day ? dayEventMap.get(day) : undefined;
            return (
              <div
                key={`day-${day ?? `empty-${i}`}`}
                className={`relative py-1 rounded ${
                  day ? getDayColorClass(day) : ""
                } ${day === now.getDate() ? "ring-1 ring-primary" : ""}`}
              >
                {day ?? ""}
                {eventInfo && eventInfo.count > 1 && (
                  <span className="absolute -top-1 -right-1 flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-primary px-0.5 text-[9px] font-bold text-primary-foreground">
                    {eventInfo.count > 9 ? "9+" : eventInfo.count}
                  </span>
                )}
              </div>
            );
          })}
        </div>
        <p className="mt-2 text-xs text-muted-foreground text-center">
          {eventDateKeys.length} {eventDateKeys.length === 1 ? "day" : "days"}{" "}
          with events
        </p>
      </CardContent>
    </Card>
  );
}
