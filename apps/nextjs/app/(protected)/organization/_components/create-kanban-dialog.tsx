"use client";

import { Button } from "@packages/ui/components/ui/button";
import { Checkbox } from "@packages/ui/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@packages/ui/components/ui/dialog";
import { Input } from "@packages/ui/components/ui/input";
import { X } from "lucide-react";
import { useCallback, useState } from "react";

interface CreateKanbanDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: () => void;
}

const PREDEFINED_COLUMNS = [
  { title: "À faire", emoji: "📋" },
  { title: "En cours", emoji: "⏳" },
  { title: "En attente", emoji: "📨" },
  { title: "Terminé", emoji: "✅" },
];

export function CreateKanbanDialog({
  open,
  onOpenChange,
  onCreated,
}: CreateKanbanDialogProps) {
  const [title, setTitle] = useState("");
  const [selectedColumns, setSelectedColumns] = useState<string[]>([
    "À faire",
    "En cours",
    "Terminé",
  ]);
  const [customColumnName, setCustomColumnName] = useState("");
  const [customColumns, setCustomColumns] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resetForm = useCallback(() => {
    setTitle("");
    setSelectedColumns(["À faire", "En cours", "Terminé"]);
    setCustomColumnName("");
    setCustomColumns([]);
    setError(null);
  }, []);

  const handleOpenChange = useCallback(
    (nextOpen: boolean) => {
      if (!nextOpen) resetForm();
      onOpenChange(nextOpen);
    },
    [onOpenChange, resetForm],
  );

  const toggleColumn = useCallback((colTitle: string) => {
    setSelectedColumns((prev) =>
      prev.includes(colTitle)
        ? prev.filter((c) => c !== colTitle)
        : [...prev, colTitle],
    );
  }, []);

  const handleAddCustomColumn = useCallback(() => {
    const trimmed = customColumnName.trim();
    if (!trimmed) return;
    if (
      customColumns.includes(trimmed) ||
      PREDEFINED_COLUMNS.some((c) => c.title === trimmed)
    )
      return;
    setCustomColumns((prev) => [...prev, trimmed]);
    setSelectedColumns((prev) => [...prev, trimmed]);
    setCustomColumnName("");
  }, [customColumnName, customColumns]);

  const removeCustomColumn = useCallback((colTitle: string) => {
    setCustomColumns((prev) => prev.filter((c) => c !== colTitle));
    setSelectedColumns((prev) => prev.filter((c) => c !== colTitle));
  }, []);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!title.trim()) return;

      setSubmitting(true);
      setError(null);

      const allColumns = selectedColumns.map((colTitle) => ({
        title: colTitle,
      }));

      try {
        const response = await fetch("/api/v1/boards/kanban", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: title.trim(),
            columns: allColumns.length > 0 ? allColumns : undefined,
          }),
        });

        if (!response.ok) {
          const data = await response.json();
          setError(data.error ?? "Impossible de créer le board");
          return;
        }

        resetForm();
        onOpenChange(false);
        onCreated();
      } catch {
        setError("Impossible de créer le board");
      } finally {
        setSubmitting(false);
      }
    },
    [title, selectedColumns, onOpenChange, onCreated, resetForm],
  );

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Nouveau Kanban</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-5">
          <Input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Nom du kanban"
            required
            maxLength={100}
          />

          <div>
            <p className="mb-2 text-sm font-semibold">Colonnes</p>
            <div className="space-y-2">
              {PREDEFINED_COLUMNS.map((col) => (
                <button
                  key={col.title}
                  type="button"
                  className="flex w-full cursor-pointer items-center gap-2"
                  onClick={() => toggleColumn(col.title)}
                >
                  <Checkbox
                    checked={selectedColumns.includes(col.title)}
                    onCheckedChange={() => toggleColumn(col.title)}
                  />
                  <span className="text-sm">
                    {col.emoji} {col.title}
                  </span>
                </button>
              ))}
              {customColumns.map((col) => (
                <div key={col} className="flex items-center gap-2">
                  <Checkbox checked onCheckedChange={() => {}} disabled />
                  <span className="flex-1 text-sm">{col}</span>
                  <button
                    type="button"
                    onClick={() => removeCustomColumn(col)}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={() =>
                customColumnName.trim()
                  ? handleAddCustomColumn()
                  : document.getElementById("custom-col-input")?.focus()
              }
              className="mt-2 text-sm text-muted-foreground hover:text-foreground"
            >
              + Ajouter
            </button>
            <Input
              id="custom-col-input"
              type="text"
              value={customColumnName}
              onChange={(e) => setCustomColumnName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddCustomColumn();
                }
              }}
              placeholder="Nom de la colonne"
              maxLength={100}
              className="mt-2"
            />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={submitting || !title.trim()}
              className="bg-pink-400 hover:bg-pink-500"
            >
              {submitting ? "Création..." : "Créer"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
