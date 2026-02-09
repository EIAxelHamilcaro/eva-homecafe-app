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

export async function CalendarWidget({ userId }: CalendarWidgetProps) {
  const result = await getChronology(userId);

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
  const eventDateSet = new Set(
    eventDateKeys
      .filter((d) => d.startsWith(currentMonthPrefix))
      .map((d) => Number.parseInt(d.split("-")[2] ?? "0", 10)),
  );

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
          {days.map((day, i) => (
            <div
              key={`day-${day ?? `empty-${i}`}`}
              className={`py-1 rounded ${
                day && eventDateSet.has(day)
                  ? "bg-primary/20 font-medium text-primary"
                  : ""
              } ${day === now.getDate() ? "ring-1 ring-primary" : ""}`}
            >
              {day ?? ""}
            </div>
          ))}
        </div>
        <p className="mt-2 text-xs text-muted-foreground text-center">
          {eventDateKeys.length} {eventDateKeys.length === 1 ? "day" : "days"}{" "}
          with events
        </p>
      </CardContent>
    </Card>
  );
}
