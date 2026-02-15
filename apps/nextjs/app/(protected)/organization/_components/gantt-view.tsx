"use client";

import { Button } from "@packages/ui/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import type { IGetChronologyOutputDto } from "@/application/dto/board/get-chronology.dto";
import { GanttChart } from "./gantt-chart";

type ViewMode = "weeks" | "months";

function formatMonth(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

function formatMonthLabel(date: Date): string {
  const label = date.toLocaleDateString("fr-FR", {
    month: "long",
    year: "numeric",
  });
  return label.charAt(0).toUpperCase() + label.slice(1);
}

export function GanttView() {
  const [data, setData] = useState<IGetChronologyOutputDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>("weeks");

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
      // silently fail
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchChronology(currentMonth);
  }, [fetchChronology, currentMonth]);

  function handlePreviousMonth(): void {
    setCurrentMonth((prev) => {
      const next = new Date(prev);
      next.setMonth(next.getMonth() - 1);
      return next;
    });
  }

  function handleNextMonth(): void {
    setCurrentMonth((prev) => {
      const next = new Date(prev);
      next.setMonth(next.getMonth() + 1);
      return next;
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          <Button
            variant={viewMode === "weeks" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("weeks")}
          >
            Semaines
          </Button>
          <Button
            variant={viewMode === "months" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("months")}
          >
            Mois
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={handlePreviousMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="min-w-[140px] text-center text-sm font-medium">
            {formatMonthLabel(currentMonth)}
          </span>
          <Button variant="outline" size="icon" onClick={handleNextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center p-8">
          <p className="text-sm text-muted-foreground">Chargement...</p>
        </div>
      ) : (
        <GanttChart cards={data?.cards ?? []} viewMode={viewMode} />
      )}
    </div>
  );
}
