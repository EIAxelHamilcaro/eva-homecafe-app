"use client";

import { Button } from "@packages/ui/components/ui/button";
import { ChevronLeft, ChevronRight, FolderSync } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import type { IGetChronologyOutputDto } from "@/application/dto/board/get-chronology.dto";
import { CalendarGrid } from "./calendar-grid";

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

export function CalendarView() {
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [data, setData] = useState<IGetChronologyOutputDto | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchChronology = useCallback(async (month: Date) => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/v1/boards/chronology?month=${formatMonth(month)}`,
      );
      if (response.ok) {
        const result: IGetChronologyOutputDto = await response.json();
        setData(result);
      }
    } catch {
      // Silently handle fetch errors
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchChronology(currentMonth);
  }, [fetchChronology, currentMonth]);

  function handlePreviousMonth(): void {
    setCurrentMonth((prev) => shiftMonth(prev, -1));
  }

  function handleNextMonth(): void {
    setCurrentMonth((prev) => shiftMonth(prev, 1));
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={handlePreviousMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-2xl font-bold capitalize">
            {formatMonthLabel(currentMonth)}
          </h2>
          <Button variant="outline" size="sm" onClick={handleNextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <Button variant="outline" size="sm">
          <FolderSync className="mr-1.5 h-4 w-4" />
          Lier un calendrier externe
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center p-8">
          <p className="text-sm text-muted-foreground">Chargement...</p>
        </div>
      ) : (
        <CalendarGrid month={currentMonth} cards={data?.cards ?? []} />
      )}
    </div>
  );
}
