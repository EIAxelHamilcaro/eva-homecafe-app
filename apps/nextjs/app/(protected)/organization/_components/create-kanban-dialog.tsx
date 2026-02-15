"use client";

import { Button } from "@packages/ui/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@packages/ui/components/ui/dialog";
import { Input } from "@packages/ui/components/ui/input";
import { useCallback, useState } from "react";

interface CreateKanbanDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: () => void;
}

export function CreateKanbanDialog({
  open,
  onOpenChange,
  onCreated,
}: CreateKanbanDialogProps) {
  const [title, setTitle] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resetForm = useCallback(() => {
    setTitle("");
    setError(null);
  }, []);

  const handleOpenChange = useCallback(
    (nextOpen: boolean) => {
      if (!nextOpen) {
        resetForm();
      }
      onOpenChange(nextOpen);
    },
    [onOpenChange, resetForm],
  );

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!title.trim()) return;

      setSubmitting(true);
      setError(null);

      try {
        const response = await fetch("/api/v1/boards/kanban", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title: title.trim() }),
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
    [title, onOpenChange, onCreated, resetForm],
  );

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nouveau Kanban</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="kanban-title"
              className="mb-1 block text-sm font-medium"
            >
              Titre du board
            </label>
            <Input
              id="kanban-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="ex. Sprint 1"
              required
              maxLength={100}
            />
            <p className="mt-1 text-xs text-muted-foreground">
              Colonnes par défaut : À faire, En cours, Terminé
            </p>
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
            >
              Annuler
            </Button>
            <Button type="submit" disabled={submitting || !title.trim()}>
              {submitting ? "Création..." : "Créer"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
