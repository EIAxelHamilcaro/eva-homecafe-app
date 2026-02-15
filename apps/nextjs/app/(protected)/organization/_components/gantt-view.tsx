"use client";

import { Button } from "@packages/ui/components/ui/button";
import { Input } from "@packages/ui/components/ui/input";
import { ChevronLeft, ChevronRight, Plus, Trash2, X } from "lucide-react";
import { useMemo, useState } from "react";
import {
  useChronologiesQuery,
  useCreateChronologieMutation,
  useDeleteChronologieMutation,
} from "@/app/(protected)/_hooks/use-chronology";
import { GanttChart } from "./gantt-chart";

const MONTH_COUNT = 6;

function capitalizeFirst(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function GanttView() {
  const { data, isLoading } = useChronologiesQuery();
  const createChronologie = useCreateChronologieMutation();
  const deleteChronologie = useDeleteChronologieMutation();
  const [newTitle, setNewTitle] = useState("");
  const [showCreate, setShowCreate] = useState(false);

  const [baseMonth, setBaseMonth] = useState<Date>(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });

  const { monthLabels, startDate, endDate } = useMemo(() => {
    const labels: string[] = [];
    const start = new Date(baseMonth.getFullYear(), baseMonth.getMonth(), 1);
    for (let i = 0; i < MONTH_COUNT; i++) {
      const d = new Date(start.getFullYear(), start.getMonth() + i, 1);
      labels.push(
        capitalizeFirst(d.toLocaleDateString("fr-FR", { month: "long" })),
      );
    }
    const end = new Date(
      start.getFullYear(),
      start.getMonth() + MONTH_COUNT,
      0,
    );
    return { monthLabels: labels, startDate: start, endDate: end };
  }, [baseMonth]);

  function handlePrevious(): void {
    setBaseMonth(
      (prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1),
    );
  }

  function handleNext(): void {
    setBaseMonth(
      (prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1),
    );
  }

  function handleCreate(): void {
    if (!newTitle.trim()) return;
    createChronologie.mutate(
      { title: newTitle.trim() },
      {
        onSuccess: () => {
          setNewTitle("");
          setShowCreate(false);
        },
      },
    );
  }

  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <p className="text-sm text-muted-foreground">Chargement...</p>
      </div>
    );
  }

  const chronologies = data?.chronologies ?? [];

  return (
    <div className="space-y-4">
      {chronologies.map((chrono) => (
        <div key={chrono.id} className="relative">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-sm font-semibold">{chrono.title}</h3>
            <Button
              variant="ghost"
              size="icon"
              onClick={() =>
                deleteChronologie.mutate({ chronologieId: chrono.id })
              }
              className="h-6 w-6 text-muted-foreground hover:text-destructive"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>

          <div className="relative">
            <Button
              variant="ghost"
              size="icon"
              onClick={handlePrevious}
              className="absolute -left-3 top-1/2 z-10 h-8 w-8 -translate-y-1/2 rounded-full border border-orange-100 bg-white shadow-sm hover:bg-orange-50"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={handleNext}
              className="absolute -right-3 top-1/2 z-10 h-8 w-8 -translate-y-1/2 rounded-full border border-orange-100 bg-white shadow-sm hover:bg-orange-50"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>

            <GanttChart
              chronologieId={chrono.id}
              entries={chrono.entries}
              monthLabels={monthLabels}
              startDate={startDate}
              endDate={endDate}
            />
          </div>
        </div>
      ))}

      {chronologies.length === 0 && !showCreate && (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-orange-200 p-12 text-center">
          <p className="mb-3 text-sm text-muted-foreground">
            Aucune chronologie. Créez-en une pour planifier vos tâches.
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowCreate(true)}
          >
            <Plus className="mr-1.5 h-4 w-4" />
            Nouvelle chronologie
          </Button>
        </div>
      )}

      {showCreate && (
        <div className="flex items-center gap-2 rounded-lg border border-orange-100 bg-white p-3">
          <Input
            placeholder="Nom de la chronologie..."
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleCreate();
            }}
            className="h-8 text-sm"
            autoFocus
          />
          <Button
            size="sm"
            onClick={handleCreate}
            disabled={createChronologie.isPending || !newTitle.trim()}
          >
            {createChronologie.isPending ? "..." : "Créer"}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => {
              setShowCreate(false);
              setNewTitle("");
            }}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      {chronologies.length > 0 && !showCreate && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowCreate(true)}
          className="w-full text-muted-foreground hover:text-foreground"
        >
          <Plus className="mr-1.5 h-4 w-4" />
          Nouvelle chronologie
        </Button>
      )}
    </div>
  );
}
