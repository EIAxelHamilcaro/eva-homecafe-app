"use client";

import {
  closestCorners,
  DndContext,
  type DragEndEvent,
  type DragOverEvent,
  DragOverlay,
  type DragStartEvent,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { arrayMove, sortableKeyboardCoordinates } from "@dnd-kit/sortable";
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
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  useAddCardMutation,
  useAddColumnMutation,
  useDeleteBoardMutation,
  useMoveCardMutation,
} from "@/app/(protected)/_hooks/use-boards";
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

  const boardColumnsRef = useRef(board.columns);
  useEffect(() => {
    if (board.columns !== boardColumnsRef.current) {
      boardColumnsRef.current = board.columns;
      setColumns(board.columns);
    }
  }, [board.columns]);

  const snapshotRef = useRef<IColumnDto[]>([]);
  const columnsRef = useRef(columns);
  useEffect(() => {
    columnsRef.current = columns;
  }, [columns]);

  const moveCardMutation = useMoveCardMutation(board.id);
  const addCardMutation = useAddCardMutation(board.id);
  const addColumnMutation = useAddColumnMutation(board.id);
  const deleteBoardMutation = useDeleteBoardMutation();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 200, tolerance: 5 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const sortedColumns = useMemo(
    () => [...columns].sort((a, b) => a.position - b.position),
    [columns],
  );

  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      snapshotRef.current = columns.map((c) => ({
        ...c,
        cards: [...c.cards],
      }));

      const cardId = event.active.id as string;
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
    if (!over || active.id === over.id) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    setColumns((prev) => {
      let sourceColIdx = -1;
      let sourceCardIdx = -1;
      let destColIdx = -1;
      let destCardIdx = -1;

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

        const overIdx = col.cards.findIndex((c) => c.id === overId);
        if (overIdx !== -1) {
          destColIdx = ci;
          destCardIdx = overIdx;
        }
      }

      if (sourceColIdx === -1 || destColIdx === -1) return prev;

      if (sourceColIdx === destColIdx) {
        if (destCardIdx === -1 || sourceCardIdx === destCardIdx) return prev;
        const next = prev.map((col) => ({ ...col, cards: [...col.cards] }));
        const col = next[sourceColIdx];
        if (!col) return prev;
        col.cards = arrayMove(col.cards, sourceCardIdx, destCardIdx);
        return next;
      }

      const next = prev.map((col) => ({ ...col, cards: [...col.cards] }));
      const sourceCol = next[sourceColIdx];
      const destCol = next[destColIdx];
      if (!sourceCol || !destCol) return prev;

      const [movedCard] = sourceCol.cards.splice(sourceCardIdx, 1);
      if (!movedCard) return prev;

      if (destCardIdx !== -1) {
        destCol.cards.splice(destCardIdx, 0, movedCard);
      } else {
        destCol.cards.push(movedCard);
      }
      return next;
    });
  }, []);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      setActiveCard(null);

      const { active, over } = event;
      if (!over) {
        setColumns(snapshotRef.current);
        return;
      }

      const activeId = active.id as string;
      const currentCols = columnsRef.current;

      let targetColId: string | null = null;
      let newPosition = 0;
      for (const col of currentCols) {
        const idx = col.cards.findIndex((c) => c.id === activeId);
        if (idx !== -1) {
          targetColId = col.id;
          newPosition = idx;
          break;
        }
      }

      if (!targetColId) return;

      moveCardMutation.mutate(
        { cardId: activeId, toColumnId: targetColId, newPosition },
        {
          onSuccess: (data) => {
            setColumns(data.columns);
            onUpdate();
          },
          onError: () => {
            setColumns(snapshotRef.current);
          },
        },
      );
    },
    [moveCardMutation, onUpdate],
  );

  const handleDragCancel = useCallback(() => {
    setActiveCard(null);
    setColumns(snapshotRef.current);
  }, []);

  const handleAddCard = useCallback(
    (columnId: string, title: string) => {
      addCardMutation.mutate(
        { columnId, title },
        {
          onSuccess: (data) => {
            setColumns(data.columns);
            onUpdate();
          },
        },
      );
    },
    [addCardMutation, onUpdate],
  );

  const handleAddColumn = useCallback(
    (title: string) => {
      addColumnMutation.mutate(
        { title },
        {
          onSuccess: (data) => {
            setShowAddColumn(false);
            setColumns(data.columns);
            onUpdate();
          },
        },
      );
    },
    [addColumnMutation, onUpdate],
  );

  const handleDeleteBoard = useCallback(() => {
    deleteBoardMutation.mutate(
      { boardId: board.id },
      {
        onSuccess: () => {
          onUpdate();
          onBack();
        },
      },
    );
  }, [deleteBoardMutation, board.id, onUpdate, onBack]);

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={onBack}>
            Retour
          </Button>
          <h2 className="text-lg font-semibold">{board.title}</h2>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAddColumn(true)}
          >
            + Colonne
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => setDeleteDialogOpen(true)}
          >
            Supprimer
          </Button>
        </div>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        <div className="flex gap-4 overflow-x-auto pb-4">
          {sortedColumns.map((col) => (
            <KanbanColumn
              key={col.id}
              column={col}
              onAddCard={(title) => handleAddCard(col.id, title)}
              onEditCard={(card) => setEditingCard({ card, columnId: col.id })}
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

        <DragOverlay
          dropAnimation={{
            duration: 200,
            easing: "cubic-bezier(0.25, 1, 0.5, 1)",
          }}
        >
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
          onUpdated={(data) => {
            setColumns(data.columns);
            onUpdate();
          }}
        />
      )}

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer le board</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer &quot;{board.title}&quot; ?
              Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteBoard}>
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
