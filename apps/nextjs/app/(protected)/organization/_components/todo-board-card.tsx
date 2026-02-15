"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@packages/ui/components/ui/alert-dialog";
import { Button } from "@packages/ui/components/ui/button";
import { Checkbox } from "@packages/ui/components/ui/checkbox";
import { Input } from "@packages/ui/components/ui/input";
import { Pin, PinOff } from "lucide-react";
import { useCallback, useState } from "react";
import type { IBoardDto } from "@/application/dto/board/common-board.dto";

interface TodoBoardCardProps {
  board: IBoardDto;
  onUpdate: () => void;
  isPinned?: boolean;
  onTogglePin?: (boardId: string) => void;
}

export function TodoBoardCard({
  board,
  onUpdate,
  isPinned,
  onTogglePin,
}: TodoBoardCardProps) {
  const [editingTitle, setEditingTitle] = useState(false);
  const [title, setTitle] = useState(board.title);
  const [newItemTitle, setNewItemTitle] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingCardId, setEditingCardId] = useState<string | null>(null);
  const [editingCardTitle, setEditingCardTitle] = useState("");

  const cards = board.columns[0]?.cards ?? [];

  const handleToggleCard = useCallback(
    async (cardId: string) => {
      try {
        const response = await fetch(`/api/v1/boards/${board.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ toggleCardIds: [cardId] }),
        });
        if (!response.ok) {
          setError("Impossible de mettre à jour l'élément");
          return;
        }
        setError(null);
        onUpdate();
      } catch {
        setError("Impossible de mettre à jour l'élément");
      }
    },
    [board.id, onUpdate],
  );

  const handleUpdateTitle = useCallback(async () => {
    if (!title.trim() || title.trim() === board.title) {
      setTitle(board.title);
      setEditingTitle(false);
      return;
    }

    try {
      const response = await fetch(`/api/v1/boards/${board.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: title.trim() }),
      });
      if (!response.ok) {
        setError("Impossible de modifier le titre");
        setTitle(board.title);
      } else {
        setError(null);
        onUpdate();
      }
      setEditingTitle(false);
    } catch {
      setTitle(board.title);
      setEditingTitle(false);
    }
  }, [board.id, board.title, title, onUpdate]);

  const handleAddItem = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!newItemTitle.trim()) return;

      try {
        const response = await fetch(`/api/v1/boards/${board.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            addCards: [{ title: newItemTitle.trim() }],
          }),
        });
        if (!response.ok) {
          setError("Impossible d'ajouter l'élément");
          return;
        }
        setError(null);
        setNewItemTitle("");
        onUpdate();
      } catch {
        setError("Impossible d'ajouter l'élément");
      }
    },
    [board.id, newItemTitle, onUpdate],
  );

  const handleUpdateCardTitle = useCallback(
    async (cardId: string, newTitle: string) => {
      const card = cards.find((c) => c.id === cardId);
      if (!newTitle.trim() || newTitle.trim() === card?.title) {
        setEditingCardId(null);
        return;
      }
      try {
        const response = await fetch(
          `/api/v1/boards/${board.id}/cards/${cardId}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ title: newTitle.trim() }),
          },
        );
        if (!response.ok) {
          setError("Impossible de modifier l'élément");
        } else {
          setError(null);
          onUpdate();
        }
      } catch {
        setError("Impossible de modifier l'élément");
      }
      setEditingCardId(null);
    },
    [board.id, cards, onUpdate],
  );

  const handleRemoveItem = useCallback(
    async (cardId: string) => {
      try {
        const response = await fetch(`/api/v1/boards/${board.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ removeCardIds: [cardId] }),
        });
        if (!response.ok) {
          setError("Impossible de supprimer l'élément");
          return;
        }
        setError(null);
        onUpdate();
      } catch {
        setError("Impossible de supprimer l'élément");
      }
    },
    [board.id, onUpdate],
  );

  const handleDelete = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/v1/boards/${board.id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        setError("Impossible de supprimer la liste");
        return;
      }
      onUpdate();
    } catch {
      setError("Impossible de supprimer la liste");
    } finally {
      setLoading(false);
      setDeleteDialogOpen(false);
    }
  }, [board.id, onUpdate]);

  const completedCount = cards.filter((c) => c.isCompleted).length;

  return (
    <div className="rounded-lg border bg-white p-4">
      <div className="mb-3 flex items-center justify-between">
        {editingTitle ? (
          <Input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={handleUpdateTitle}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleUpdateTitle();
              if (e.key === "Escape") {
                setTitle(board.title);
                setEditingTitle(false);
              }
            }}
            className="flex-1 text-sm font-semibold"
            maxLength={100}
            autoFocus
          />
        ) : (
          <Button
            variant="ghost"
            onClick={() => setEditingTitle(true)}
            className="text-sm font-semibold hover:underline"
          >
            {board.title}
          </Button>
        )}
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">
            {completedCount}/{cards.length}
          </span>
          {onTogglePin && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onTogglePin(board.id)}
              className={`h-7 w-7 ${isPinned ? "text-orange-500" : "text-muted-foreground hover:text-orange-500"}`}
              aria-label={isPinned ? "Dépingler" : "Épingler au dashboard"}
            >
              {isPinned ? (
                <PinOff className="h-4 w-4" />
              ) : (
                <Pin className="h-4 w-4" />
              )}
            </Button>
          )}
          <Button
            variant="ghost"
            onClick={() => setDeleteDialogOpen(true)}
            className="text-xs text-muted-foreground hover:text-destructive"
          >
            Supprimer
          </Button>
        </div>
      </div>

      {error && <p className="mb-2 text-xs text-destructive">{error}</p>}

      <div className="scrollbar-hover max-h-52 space-y-1 overflow-y-auto overscroll-y-contain">
        {cards.map((card) => (
          <div key={card.id} className="group flex items-center gap-2">
            <Checkbox
              checked={card.isCompleted}
              onCheckedChange={() => handleToggleCard(card.id)}
            />
            {editingCardId === card.id ? (
              <Input
                type="text"
                value={editingCardTitle}
                onChange={(e) => setEditingCardTitle(e.target.value)}
                onBlur={() => handleUpdateCardTitle(card.id, editingCardTitle)}
                onKeyDown={(e) => {
                  if (e.key === "Enter")
                    handleUpdateCardTitle(card.id, editingCardTitle);
                  if (e.key === "Escape") setEditingCardId(null);
                }}
                className="h-7 flex-1 text-sm"
                maxLength={200}
                autoFocus
              />
            ) : (
              <button
                type="button"
                onClick={() => {
                  setEditingCardId(card.id);
                  setEditingCardTitle(card.title);
                }}
                className={`flex-1 cursor-text text-left text-sm ${card.isCompleted ? "text-muted-foreground line-through" : ""}`}
              >
                {card.title}
              </button>
            )}
            <Button
              variant="ghost"
              onClick={() => handleRemoveItem(card.id)}
              className="text-xs text-muted-foreground opacity-0 hover:text-destructive group-hover:opacity-100"
              aria-label="Supprimer l'élément"
            >
              x
            </Button>
          </div>
        ))}
      </div>

      <form onSubmit={handleAddItem} className="mt-2">
        <Input
          type="text"
          value={newItemTitle}
          onChange={(e) => setNewItemTitle(e.target.value)}
          placeholder="Ajouter un élément..."
          className="text-sm"
          maxLength={200}
        />
      </form>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer la liste</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer &quot;{board.title}&quot; ?
              Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={loading}>
              {loading ? "Suppression..." : "Supprimer"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
