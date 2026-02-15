"use client";

import { useMemo } from "react";
import type { IChronologyCardDto } from "@/application/dto/board/get-chronology.dto";

const BAR_COLORS = [
  "bg-pink-400",
  "bg-orange-400",
  "bg-green-400",
  "bg-blue-400",
  "bg-purple-400",
  "bg-yellow-400",
];

const WEEK_COLUMNS = [
  "Tache",
  "Semaine 1",
  "Semaine 2",
  "Semaine 3",
  "Semaine 4",
];

const MONTH_COLUMNS = [
  "Tache",
  "Janvier",
  "Fevrier",
  "Mars",
  "Avril",
  "Mai",
  "Juin",
];

interface GanttChartProps {
  cards: IChronologyCardDto[];
  viewMode: "weeks" | "months";
}

function getWeekIndex(dueDate: string): number {
  const date = new Date(`${dueDate}T00:00:00`);
  const firstDayOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
  const firstDayOffset = firstDayOfMonth.getDay();
  const dayOfMonth = date.getDate();
  return Math.ceil((dayOfMonth + firstDayOffset) / 7);
}

function getMonthIndex(dueDate: string): number {
  const date = new Date(`${dueDate}T00:00:00`);
  return date.getMonth() + 1;
}

export function GanttChart({ cards, viewMode }: GanttChartProps) {
  const columns = viewMode === "weeks" ? WEEK_COLUMNS : MONTH_COLUMNS;
  const dataColumnCount = columns.length - 1;

  const rows = useMemo(() => {
    return cards.map((card, index) => {
      const color = BAR_COLORS[index % BAR_COLORS.length];
      let columnIndex: number;

      if (viewMode === "weeks") {
        const week = getWeekIndex(card.dueDate);
        columnIndex = Math.min(Math.max(week, 1), dataColumnCount);
      } else {
        const month = getMonthIndex(card.dueDate);
        columnIndex = Math.min(Math.max(month, 1), dataColumnCount);
      }

      return { card, color, columnIndex };
    });
  }, [cards, viewMode, dataColumnCount]);

  if (cards.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-orange-200 p-12 text-center">
        <p className="text-sm text-muted-foreground">
          Ajoutez des dates a vos taches pour les voir sur la timeline.
        </p>
      </div>
    );
  }

  const gridTemplateColumns = `140px repeat(${dataColumnCount}, 1fr)`;

  return (
    <div className="overflow-x-auto rounded-lg border border-orange-100">
      <div className="min-w-[600px]">
        <div className="grid bg-orange-50/50" style={{ gridTemplateColumns }}>
          {columns.map((col) => (
            <div
              key={col}
              className="px-3 py-2 text-xs font-medium text-muted-foreground"
            >
              {col}
            </div>
          ))}
        </div>

        {rows.map(({ card, color, columnIndex }) => (
          <div
            key={card.id}
            className="grid items-center border-b border-orange-50"
            style={{ gridTemplateColumns }}
          >
            <div className="truncate px-3 py-2 text-sm" title={card.title}>
              {card.title}
            </div>
            {columns.slice(1).map((colName, i) => (
              <div key={colName} className="px-1 py-2">
                {i + 1 === columnIndex && (
                  <div className={`h-6 rounded-full ${color}`} />
                )}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
