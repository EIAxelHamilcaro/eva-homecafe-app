"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { IGetChronologyOutputDto } from "@/application/dto/board/get-chronology.dto";
import { ChronologyCalendar } from "./chronology-calendar";
import { ChronologyEventList } from "./chronology-event-list";

function formatMonth(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

export function ChronologyView() {
  const [data, setData] = useState<IGetChronologyOutputDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const fetchChronology = useCallback(async (month: Date) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `/api/v1/boards/chronology?month=${formatMonth(month)}`,
      );
      if (!response.ok) {
        setError("Failed to load chronology");
        return;
      }
      const result: IGetChronologyOutputDto = await response.json();
      setData(result);
    } catch {
      setError("Failed to load chronology");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchChronology(currentMonth);
  }, [fetchChronology, currentMonth]);

  const handleMonthChange = useCallback((month: Date) => {
    setCurrentMonth(month);
    setSelectedDate(null);
  }, []);

  const selectedCards = useMemo(() => {
    if (!data || !selectedDate) return [];
    return data.cards.filter((c) => c.dueDate === selectedDate);
  }, [data, selectedDate]);

  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center p-8">
        <p className="text-sm text-destructive">{error}</p>
      </div>
    );
  }

  if (!data || data.cards.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
        <p className="mb-2 text-lg font-medium">
          No events on your timeline yet
        </p>
        <p className="text-sm text-muted-foreground">
          Add due dates to your tasks in Todo or Kanban views to see them here.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-[auto_1fr]">
      <ChronologyCalendar
        month={currentMonth}
        eventDates={data.eventDates}
        cards={data.cards}
        selectedDate={selectedDate}
        onSelectDate={setSelectedDate}
        onMonthChange={handleMonthChange}
      />
      <ChronologyEventList selectedDate={selectedDate} cards={selectedCards} />
    </div>
  );
}
