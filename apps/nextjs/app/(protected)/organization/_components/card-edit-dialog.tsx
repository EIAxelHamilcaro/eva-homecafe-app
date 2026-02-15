"use client";

import { Button } from "@packages/ui/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@packages/ui/components/ui/dialog";
import { Input } from "@packages/ui/components/ui/input";
import { Progress } from "@packages/ui/components/ui/progress";
import { Textarea } from "@packages/ui/components/ui/textarea";
import { useCallback, useState } from "react";
import type {
  IBoardDto,
  ICardDto,
} from "@/application/dto/board/common-board.dto";

interface CardEditDialogProps {
  open: boolean;
  boardId: string;
  card: ICardDto;
  onOpenChange: (open: boolean) => void;
  onUpdated: (data: IBoardDto) => void;
}

export function CardEditDialog({
  open,
  boardId,
  card,
  onOpenChange,
  onUpdated,
}: CardEditDialogProps) {
  const [title, setTitle] = useState(card.title);
  const [description, setDescription] = useState(card.description ?? "");
  const [progress, setProgress] = useState(card.progress);
  const [dueDate, setDueDate] = useState(card.dueDate ?? "");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!title.trim()) return;

      setSubmitting(true);
      setError(null);

      try {
        const body: Record<string, unknown> = {};
        if (title.trim() !== card.title) {
          body.title = title.trim();
        }
        if (description !== (card.description ?? "")) {
          body.description = description || null;
        }
        if (progress !== card.progress) {
          body.progress = progress;
        }
        if (dueDate !== (card.dueDate ?? "")) {
          body.dueDate = dueDate || null;
        }

        if (Object.keys(body).length === 0) {
          onOpenChange(false);
          return;
        }

        const response = await fetch(
          `/api/v1/boards/${boardId}/cards/${card.id}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
          },
        );

        if (!response.ok) {
          const errData = await response.json();
          setError(errData.error ?? "Impossible de modifier la carte");
          return;
        }

        const data = await response.json();
        onOpenChange(false);
        onUpdated(data);
      } catch {
        setError("Impossible de modifier la carte");
      } finally {
        setSubmitting(false);
      }
    },
    [
      title,
      description,
      progress,
      dueDate,
      card,
      boardId,
      onOpenChange,
      onUpdated,
    ],
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Modifier la carte</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="card-title"
              className="mb-1 block text-sm font-medium"
            >
              Titre
            </label>
            <Input
              id="card-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              maxLength={200}
            />
          </div>

          <div>
            <label
              htmlFor="card-description"
              className="mb-1 block text-sm font-medium"
            >
              Description
            </label>
            <Textarea
              id="card-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ajouter une description..."
              rows={3}
              maxLength={5000}
            />
          </div>

          <div>
            <label
              htmlFor="card-progress"
              className="mb-1 block text-sm font-medium"
            >
              Progression : {progress}%
            </label>
            <div className="flex items-center gap-3">
              <input
                id="card-progress"
                type="range"
                min={0}
                max={100}
                value={progress}
                onChange={(e) => setProgress(Number(e.target.value))}
                className="flex-1"
              />
              <Progress value={progress} className="h-2 w-20" />
            </div>
          </div>

          <div>
            <label
              htmlFor="card-due-date"
              className="mb-1 block text-sm font-medium"
            >
              Date d'échéance
            </label>
            <Input
              id="card-due-date"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Annuler
            </Button>
            <Button type="submit" disabled={submitting || !title.trim()}>
              {submitting ? "Enregistrement..." : "Enregistrer"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
