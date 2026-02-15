"use client";

import { Button } from "@packages/ui/components/ui/button";
import { ChevronLeft, ChevronRight, FolderSync } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import {
  useCalendarEventsQuery,
  useGoogleCalendarEventsQuery,
} from "../../_hooks/use-calendar-events";
import { CalendarGrid } from "./calendar-grid";
import { CreateCalendarEventDialog } from "./create-calendar-event-dialog";
import { GoogleCalendarDialog } from "./google-calendar-dialog";

function formatMonth(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

function formatMonthLabel(date: Date): string {
  return date.toLocaleDateString("fr-FR", { month: "long", year: "numeric" });
}

function shiftMonth(date: Date, offset: number): Date {
  return new Date(date.getFullYear(), date.getMonth() + offset, 1);
}

export interface UnifiedCalendarEvent {
  id: string;
  title: string;
  date: string;
  color: string;
  source: "local" | "google";
}

export function CalendarView() {
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [googleDialogOpen, setGoogleDialogOpen] = useState(false);

  const month = formatMonth(currentMonth);

  const { data: localData, isLoading: localLoading } =
    useCalendarEventsQuery(month);
  const { data: googleData, isLoading: googleLoading } =
    useGoogleCalendarEventsQuery(month);

  const googleConnected = googleData?.connected ?? false;
  const loading = localLoading || googleLoading;

  const events: UnifiedCalendarEvent[] = useMemo(() => {
    const result: UnifiedCalendarEvent[] = [];

    if (localData?.events) {
      for (const e of localData.events) {
        result.push({
          id: e.id,
          title: e.title,
          date: e.date,
          color: e.color,
          source: "local",
        });
      }
    }

    if (googleData?.events) {
      for (const e of googleData.events) {
        result.push({
          id: e.id,
          title: e.title,
          date: e.date,
          color: e.color,
          source: "google",
        });
      }
    }

    return result;
  }, [localData, googleData]);

  const handleDateClick = useCallback((dateKey: string) => {
    setSelectedDate(dateKey);
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentMonth((prev) => shiftMonth(prev, -1))}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-2xl font-bold capitalize">
            {formatMonthLabel(currentMonth)}
          </h2>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentMonth((prev) => shiftMonth(prev, 1))}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => setGoogleDialogOpen(true)}
        >
          <FolderSync className="mr-1.5 h-4 w-4" />
          {googleConnected ? "Google Calendar" : "Lier un calendrier externe"}
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center p-8">
          <p className="text-sm text-muted-foreground">Chargement...</p>
        </div>
      ) : (
        <CalendarGrid
          month={currentMonth}
          events={events}
          onDateClick={handleDateClick}
        />
      )}

      <CreateCalendarEventDialog
        open={selectedDate !== null}
        onOpenChange={(open) => {
          if (!open) setSelectedDate(null);
        }}
        date={selectedDate ?? ""}
        googleConnected={googleConnected}
      />

      <GoogleCalendarDialog
        open={googleDialogOpen}
        onOpenChange={setGoogleDialogOpen}
        connected={googleConnected}
      />
    </div>
  );
}
