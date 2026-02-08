"use client";

import {
  closestCorners,
  DndContext,
  type DragEndEvent,
  type DragOverEvent,
  DragOverlay,
  type DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
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
import { useCallback, useState } from "react";
import type {
  IBoardDto,
  ICardDto,
  IColumnDto,
} from "@/application/dto/board/common-board.dto";
import { AddColumnForm } from "./add-column-form";
import { CardEditDialog } from "./card-edit-dialog";
import { KanbanCard } from "./kanban-card";
import { KanbanColumn } from "./kanban-column";

interface KanbanBoardViewProps {
  board: IBoardDto;
  onBack: () => void;
  onUpdate: () => void;
}

export function KanbanBoardView({
  board,
  onBack,
  onUpdate,
}: KanbanBoardViewProps) {
  const [columns, setColumns] = useState<IColumnDto[]>(board.columns);
  const [activeCard, setActiveCard] = useState<ICardDto | null>(null);
  const [editingCard, setEditingCard] = useState<{
    card: ICardDto;
    columnId: string;
  } | null>(null);
  const [showAddColumn, setShowAddColumn] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
  );

  const applyBoardResponse = useCallback(
    (data: IBoardDto) => {
      setColumns(data.columns);
      onUpdate();
    },
    [onUpdate],
  );

  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      const { active } = event;
      const cardId = active.id as string;

      for (const col of columns) {
        const card = col.cards.find((c) => c.id === cardId);
        if (card) {
          setActiveCard(card);
          break;
        }
      }
    },
    [columns],
  );

  const handleDragOver = useCallback((event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    setColumns((prev) => {
      let sourceColIdx = -1;
      let sourceCardIdx = -1;
      let destColIdx = -1;

      for (let ci = 0; ci < prev.length; ci++) {
        const col = prev[ci];
        if (!col) continue;
        const cardIdx = col.cards.findIndex((c) => c.id === activeId);
        if (cardIdx !== -1) {
          sourceColIdx = ci;
          sourceCardIdx = cardIdx;
        }
        if (col.id === overId) {
          destColIdx = ci;
        }
        const overCardIdx = col.cards.findIndex((c) => c.id === overId);
        if (overCardIdx !== -1) {
          destColIdx = ci;
        }
      }

      if (sourceColIdx === -1 || destColIdx === -1) return prev;
      if (sourceColIdx === destColIdx) return prev;

      const next = prev.map((col) => ({
        ...col,
        cards: [...col.cards],
      }));
      const sourceCol = next[sourceColIdx];
      const destCol = next[destColIdx];
      if (!sourceCol || !destCol) return prev;

      const [movedCard] = sourceCol.cards.splice(sourceCardIdx, 1);
      if (!movedCard) return prev;

      const overCardIdx = destCol.cards.findIndex((c) => c.id === overId);
      if (overCardIdx !== -1) {
        destCol.cards.splice(overCardIdx, 0, movedCard);
      } else {
        destCol.cards.push(movedCard);
      }
      return next;
    });
  }, []);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      setActiveCard(null);

      if (!over) return;

      const activeId = active.id as string;
      const overId = over.id as string;

      setColumns((prev) => {
        let targetColId: string | null = null;
        let newPosition = 0;

        for (const col of prev) {
          const cardIdx = col.cards.findIndex((c) => c.id === activeId);
          if (cardIdx !== -1) {
            targetColId = col.id;
            newPosition = cardIdx;
            break;
          }
          if (col.id === overId) {
            targetColId = col.id;
            newPosition = col.cards.length;
          }
        }

        if (!targetColId) return prev;

        fetch(`/api/v1/boards/${board.id}/cards/${activeId}/move`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ toColumnId: targetColId, newPosition }),
        })
          .then((res) => (res.ok ? res.json() : null))
          .then((data) => {
            if (data) applyBoardResponse(data);
          })
          .catch(() => onUpdate());

        return prev;
      });
    },
    [board.id, applyBoardResponse, onUpdate],
  );

  const handleAddCard = useCallback(
    async (columnId: string, title: string) => {
      try {
        const response = await fetch(`/api/v1/boards/${board.id}/cards`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ columnId, title }),
        });
        if (response.ok) {
          const data = await response.json();
          applyBoardResponse(data);
        }
      } catch {
        /* ignore */
      }
    },
    [board.id, applyBoardResponse],
  );

  const handleAddColumn = useCallback(
    async (title: string) => {
      try {
        const response = await fetch(`/api/v1/boards/${board.id}/columns`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title }),
        });
        if (response.ok) {
          const data = await response.json();
          setShowAddColumn(false);
          applyBoardResponse(data);
        }
      } catch {
        /* ignore */
      }
    },
    [board.id, applyBoardResponse],
  );

  const handleDeleteBoard = useCallback(async () => {
    try {
      await fetch(`/api/v1/boards/${board.id}`, { method: "DELETE" });
      onUpdate();
      onBack();
    } catch {
      /* ignore */
    }
  }, [board.id, onUpdate, onBack]);

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={onBack}>
            Back
          </Button>
          <h2 className="text-lg font-semibold">{board.title}</h2>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAddColumn(true)}
          >
            + Column
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => setDeleteDialogOpen(true)}
          >
            Delete
          </Button>
        </div>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-4 overflow-x-auto pb-4">
          {columns
            .sort((a, b) => a.position - b.position)
            .map((col) => (
              <KanbanColumn
                key={col.id}
                column={col}
                onAddCard={(title) => handleAddCard(col.id, title)}
                onEditCard={(card) =>
                  setEditingCard({ card, columnId: col.id })
                }
              />
            ))}
          {showAddColumn && (
            <div className="w-72 shrink-0">
              <AddColumnForm
                onSubmit={handleAddColumn}
                onCancel={() => setShowAddColumn(false)}
              />
            </div>
          )}
        </div>

        <DragOverlay>
          {activeCard ? <KanbanCard card={activeCard} isOverlay /> : null}
        </DragOverlay>
      </DndContext>

      {editingCard && (
        <CardEditDialog
          open
          boardId={board.id}
          card={editingCard.card}
          onOpenChange={(open) => {
            if (!open) setEditingCard(null);
          }}
          onUpdated={applyBoardResponse}
        />
      )}

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete board</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{board.title}&quot;? This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteBoard}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
