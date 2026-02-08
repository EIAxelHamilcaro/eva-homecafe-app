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
import { Checkbox } from "@packages/ui/components/ui/checkbox";
import { Input } from "@packages/ui/components/ui/input";
import { useCallback, useState } from "react";
import type { IBoardDto } from "@/application/dto/board/common-board.dto";

interface TodoBoardCardProps {
  board: IBoardDto;
  onUpdate: () => void;
}

export function TodoBoardCard({ board, onUpdate }: TodoBoardCardProps) {
  const [editingTitle, setEditingTitle] = useState(false);
  const [title, setTitle] = useState(board.title);
  const [newItemTitle, setNewItemTitle] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
          setError("Failed to update item");
          return;
        }
        setError(null);
        onUpdate();
      } catch {
        setError("Failed to update item");
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
        setError("Failed to update title");
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
          setError("Failed to add item");
          return;
        }
        setError(null);
        setNewItemTitle("");
        onUpdate();
      } catch {
        setError("Failed to add item");
      }
    },
    [board.id, newItemTitle, onUpdate],
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
          setError("Failed to remove item");
          return;
        }
        setError(null);
        onUpdate();
      } catch {
        setError("Failed to remove item");
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
        setError("Failed to delete list");
        return;
      }
      onUpdate();
    } catch {
      setError("Failed to delete list");
    } finally {
      setLoading(false);
      setDeleteDialogOpen(false);
    }
  }, [board.id, onUpdate]);

  const completedCount = cards.filter((c) => c.isCompleted).length;

  return (
    <div className="rounded-lg border p-4">
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
          <button
            type="button"
            onClick={() => setEditingTitle(true)}
            className="text-sm font-semibold hover:underline"
          >
            {board.title}
          </button>
        )}
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">
            {completedCount}/{cards.length}
          </span>
          <button
            type="button"
            onClick={() => setDeleteDialogOpen(true)}
            className="text-xs text-muted-foreground hover:text-destructive"
          >
            Delete
          </button>
        </div>
      </div>

      {error && <p className="mb-2 text-xs text-destructive">{error}</p>}

      <div className="space-y-1">
        {cards.map((card) => (
          <div key={card.id} className="flex items-center gap-2 group">
            <Checkbox
              checked={card.isCompleted}
              onCheckedChange={() => handleToggleCard(card.id)}
            />
            <span
              className={`flex-1 text-sm ${card.isCompleted ? "line-through text-muted-foreground" : ""}`}
            >
              {card.title}
            </span>
            <button
              type="button"
              onClick={() => handleRemoveItem(card.id)}
              className="text-xs text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-destructive"
              aria-label="Remove item"
            >
              x
            </button>
          </div>
        ))}
      </div>

      <form onSubmit={handleAddItem} className="mt-2">
        <Input
          type="text"
          value={newItemTitle}
          onChange={(e) => setNewItemTitle(e.target.value)}
          placeholder="Add item..."
          className="text-sm"
          maxLength={200}
        />
      </form>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete list</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{board.title}&quot;? This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={loading}>
              {loading ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
