"use client";

import { Button } from "@packages/ui/components/ui/button";
import { Calendar } from "@packages/ui/components/ui/calendar";
import { Input } from "@packages/ui/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@packages/ui/components/ui/popover";
import { CalendarDays, Plus, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import {
  useAddEntryMutation,
  useRemoveEntryMutation,
  useUpdateEntryMutation,
} from "@/app/(protected)/_hooks/use-chronology";
import type { IChronologieEntryDto } from "@/application/dto/chronologie/common-chronologie.dto";

const BAR_COLORS = [
  { className: "bg-amber-400", label: "Jaune" },
  { className: "bg-pink-300", label: "Rose" },
  { className: "bg-orange-500", label: "Orange" },
  { className: "bg-emerald-500", label: "Vert" },
  { className: "bg-blue-400", label: "Bleu" },
  { className: "bg-purple-400", label: "Violet" },
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

function toDateStr(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function parseDate(s: string): Date {
  return new Date(`${s}T00:00:00`);
}

interface BarPosition {
  entry: IChronologieEntryDto;
  colorClass: string;
  leftPercent: number;
  widthPercent: number;
}

function EntryEditPopover({
  entry,
  colorClass,
  chronologieId,
  children,
}: {
  entry: IChronologieEntryDto;
  colorClass: string;
  chronologieId: string;
  children: React.ReactNode;
}) {
  const updateEntry = useUpdateEntryMutation(chronologieId);
  const removeEntry = useRemoveEntryMutation(chronologieId);
  const [open, setOpen] = useState(false);
  const [editTitle, setEditTitle] = useState(entry.title);
  const [pickingDate, setPickingDate] = useState<"start" | "end" | null>(null);

  function handleUpdateField(
    field: "title" | "startDate" | "endDate" | "color",
    value: string | number | null,
  ) {
    updateEntry.mutate({
      entryId: entry.id,
      [field]: value,
    });
  }

  function handleSelectDate(date: Date | undefined) {
    if (!date || !pickingDate) return;
    const dateStr = toDateStr(date);
    handleUpdateField(
      pickingDate === "start" ? "startDate" : "endDate",
      dateStr,
    );
    setPickingDate(null);
  }

  function handleClearDate(field: "startDate" | "endDate") {
    handleUpdateField(field, null);
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent className="w-80 p-0" side="right" align="start">
        {pickingDate ? (
          <div className="p-2">
            <div className="mb-2 flex items-center justify-between px-2">
              <span className="text-sm font-medium">
                {pickingDate === "start" ? "Date de début" : "Date de fin"}
              </span>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs"
                onClick={() => setPickingDate(null)}
              >
                Retour
              </Button>
            </div>
            <Calendar
              mode="single"
              selected={
                pickingDate === "start" && entry.startDate
                  ? parseDate(entry.startDate)
                  : pickingDate === "end" && entry.endDate
                    ? parseDate(entry.endDate)
                    : undefined
              }
              onSelect={handleSelectDate}
            />
          </div>
        ) : (
          <div className="space-y-3 p-4">
            <Input
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              onBlur={() => {
                if (editTitle.trim() && editTitle !== entry.title) {
                  handleUpdateField("title", editTitle.trim());
                }
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.currentTarget.blur();
                }
              }}
              className="h-8 text-sm font-medium"
            />

            <div className="space-y-1.5">
              <p className="text-xs font-medium text-muted-foreground">Dates</p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 flex-1 justify-start text-xs"
                  onClick={() => setPickingDate("start")}
                >
                  <CalendarDays className="mr-1.5 h-3 w-3" />
                  {entry.startDate ?? "Début"}
                </Button>
                {entry.startDate && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 shrink-0"
                    onClick={() => handleClearDate("startDate")}
                  >
                    <span className="text-xs text-muted-foreground">x</span>
                  </Button>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 flex-1 justify-start text-xs"
                  onClick={() => setPickingDate("end")}
                >
                  <CalendarDays className="mr-1.5 h-3 w-3" />
                  {entry.endDate ?? "Fin"}
                </Button>
                {entry.endDate && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 shrink-0"
                    onClick={() => handleClearDate("endDate")}
                  >
                    <span className="text-xs text-muted-foreground">x</span>
                  </Button>
                )}
              </div>
            </div>

            <div className="space-y-1.5">
              <p className="text-xs font-medium text-muted-foreground">
                Couleur
              </p>
              <div className="flex gap-1.5">
                {BAR_COLORS.map((c, i) => (
                  <button
                    type="button"
                    key={c.label}
                    title={c.label}
                    className={`h-6 w-6 rounded-full ${c.className} transition-all ${
                      entry.color === i
                        ? "ring-2 ring-offset-2 ring-gray-400"
                        : "hover:scale-110"
                    }`}
                    onClick={() => handleUpdateField("color", i)}
                  />
                ))}
              </div>
            </div>

            <div className="border-t pt-2">
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-full justify-start text-xs text-destructive hover:text-destructive"
                onClick={() => {
                  removeEntry.mutate({ entryId: entry.id });
                  setOpen(false);
                }}
              >
                <Trash2 className="mr-1.5 h-3 w-3" />
                Supprimer la tâche
              </Button>
            </div>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
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
      const colorClass =
        BAR_COLORS[entry.color % BAR_COLORS.length]?.className ??
        "bg-amber-400";

      const barStartRaw = entry.startDate ? parseDate(entry.startDate) : null;
      const barEndRaw = entry.endDate ? parseDate(entry.endDate) : null;

      if (!barStartRaw && !barEndRaw) {
        return { entry, colorClass, leftPercent: 0, widthPercent: 0 };
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

      return { entry, colorClass, leftPercent, widthPercent };
    });
  }, [entries, startDate, endDate, totalDays]);

  function handleAddEntry(): void {
    if (!newEntryTitle.trim()) return;
    const today = toDateStr(new Date());
    const inOneMonth = new Date();
    inOneMonth.setMonth(inOneMonth.getMonth() + 1);
    addEntry.mutate(
      {
        title: newEntryTitle.trim(),
        startDate: today,
        endDate: toDateStr(inOneMonth),
        color: entries.length % BAR_COLORS.length,
      },
      { onSuccess: () => setNewEntryTitle("") },
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-orange-100 bg-white">
      <div
        className="grid min-w-[600px]"
        style={{ gridTemplateColumns: "160px 1fr" }}
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

        {rows.map(({ entry, colorClass, leftPercent, widthPercent }) => (
          <div key={entry.id} className="contents">
            <EntryEditPopover
              entry={entry}
              colorClass={colorClass}
              chronologieId={chronologieId}
            >
              <button
                type="button"
                className="flex items-center gap-2 truncate border-b border-r border-orange-50 px-3 py-3 text-left text-sm hover:bg-orange-50/50"
                title={entry.title}
              >
                <span
                  className={`h-2.5 w-2.5 shrink-0 rounded-full ${colorClass}`}
                />
                <span className="truncate">{entry.title}</span>
              </button>
            </EntryEditPopover>
            <div className="relative border-b border-orange-50">
              <div className="flex h-full">
                {monthLabels.map((label) => (
                  <div
                    key={label}
                    className="flex-1 border-l border-orange-50 first:border-l-0"
                  />
                ))}
              </div>
              {widthPercent > 0 ? (
                <div
                  className="absolute top-1/2 -translate-y-1/2"
                  style={{
                    left: `${leftPercent}%`,
                    width: `${widthPercent}%`,
                  }}
                >
                  <div className={`h-6 rounded-full ${colorClass} shadow-sm`} />
                </div>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xs italic text-muted-foreground/50">
                    Cliquer pour définir les dates
                  </span>
                </div>
              )}
            </div>
          </div>
        ))}

        <div className="px-2 py-1.5">
          <div className="flex items-center gap-1">
            <Plus className="h-4 w-4 shrink-0 text-muted-foreground" />
            <Input
              placeholder="Ajouter une tâche..."
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
