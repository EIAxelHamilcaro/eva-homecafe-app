"use client";

import { Input } from "@packages/ui/components/ui/input";
import { Plus } from "lucide-react";
import { useMemo, useState } from "react";
import { useAddEntryMutation } from "@/app/(protected)/_hooks/use-chronology";
import type { IChronologieEntryDto } from "@/application/dto/chronologie/common-chronologie.dto";

const BAR_COLORS = [
  "bg-amber-400",
  "bg-pink-300",
  "bg-orange-500",
  "bg-emerald-500",
  "bg-blue-400",
  "bg-purple-400",
];

interface GanttChartProps {
  chronologieId: string;
  entries: IChronologieEntryDto[];
  monthLabels: string[];
  startDate: Date;
  endDate: Date;
}

function daysBetween(a: Date, b: Date): number {
  return Math.round((b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24));
}

interface BarPosition {
  entry: IChronologieEntryDto;
  color: string;
  leftPercent: number;
  widthPercent: number;
}

export function GanttChart({
  chronologieId,
  entries,
  monthLabels,
  startDate,
  endDate,
}: GanttChartProps) {
  const totalDays = Math.max(daysBetween(startDate, endDate), 1);
  const addEntry = useAddEntryMutation(chronologieId);
  const [newEntryTitle, setNewEntryTitle] = useState("");

  const rows = useMemo(() => {
    return entries.map((entry): BarPosition => {
      const color =
        BAR_COLORS[entry.color % BAR_COLORS.length] ?? "bg-amber-400";

      const barStartRaw = entry.startDate
        ? new Date(`${entry.startDate}T00:00:00`)
        : null;
      const barEndRaw = entry.endDate
        ? new Date(`${entry.endDate}T00:00:00`)
        : null;

      if (!barStartRaw && !barEndRaw) {
        return { entry, color, leftPercent: 0, widthPercent: 0 };
      }

      const barStart = barStartRaw
        ? barStartRaw < startDate
          ? startDate
          : barStartRaw
        : barEndRaw!;
      const barEnd = barEndRaw
        ? barEndRaw > endDate
          ? endDate
          : barEndRaw
        : barStartRaw!;

      const leftDays = daysBetween(startDate, barStart);
      const spanDays = Math.max(daysBetween(barStart, barEnd), 1);

      const leftPercent = Math.max((leftDays / totalDays) * 100, 0);
      const widthPercent = Math.max((spanDays / totalDays) * 100, 2);

      return { entry, color, leftPercent, widthPercent };
    });
  }, [entries, startDate, endDate, totalDays]);

  function handleAddEntry(): void {
    if (!newEntryTitle.trim()) return;
    addEntry.mutate(
      { title: newEntryTitle.trim() },
      { onSuccess: () => setNewEntryTitle("") },
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-orange-100 bg-white">
      <div
        className="grid min-w-[600px]"
        style={{ gridTemplateColumns: "140px 1fr" }}
      >
        <div className="border-b border-r border-orange-100 px-4 py-2.5 text-xs font-medium text-muted-foreground">
          Tâche
        </div>
        <div className="border-b border-orange-100">
          <div className="flex h-full">
            {monthLabels.map((label) => (
              <div
                key={label}
                className="flex-1 border-l border-orange-50 px-3 py-2.5 text-xs font-medium text-muted-foreground first:border-l-0"
              >
                {label}
              </div>
            ))}
          </div>
        </div>

        {rows.map(({ entry, color, leftPercent, widthPercent }) => (
          <div key={entry.id} className="contents">
            <div
              className="truncate border-b border-r border-orange-50 px-4 py-3 text-sm"
              title={entry.title}
            >
              {entry.title}
            </div>
            <div className="relative border-b border-orange-50">
              <div className="flex h-full">
                {monthLabels.map((label) => (
                  <div
                    key={label}
                    className="flex-1 border-l border-orange-50 first:border-l-0"
                  />
                ))}
              </div>
              {widthPercent > 0 && (
                <div
                  className="absolute top-1/2 -translate-y-1/2"
                  style={{
                    left: `${leftPercent}%`,
                    width: `${widthPercent}%`,
                  }}
                >
                  <div className={`h-6 rounded-full ${color}`} />
                </div>
              )}
            </div>
          </div>
        ))}

        <div className="px-2 py-1.5">
          <div className="flex items-center gap-1">
            <Plus className="h-4 w-4 shrink-0 text-muted-foreground" />
            <Input
              placeholder="Ajouter..."
              value={newEntryTitle}
              onChange={(e) => setNewEntryTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleAddEntry();
              }}
              className="h-7 border-0 bg-transparent text-sm shadow-none focus-visible:ring-0"
            />
          </div>
        </div>
        <div />
      </div>
    </div>
  );
}
