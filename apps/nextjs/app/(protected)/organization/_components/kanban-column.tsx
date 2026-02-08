"use client";

import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Input } from "@packages/ui/components/ui/input";
import { useCallback, useState } from "react";
import type {
  ICardDto,
  IColumnDto,
} from "@/application/dto/board/common-board.dto";
import { KanbanCard } from "./kanban-card";

interface KanbanColumnProps {
  column: IColumnDto;
  onAddCard: (title: string) => void;
  onEditCard: (card: ICardDto) => void;
}

export function KanbanColumn({
  column,
  onAddCard,
  onEditCard,
}: KanbanColumnProps) {
  const [newCardTitle, setNewCardTitle] = useState("");
  const { setNodeRef } = useDroppable({ id: column.id });

  const handleAddCard = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!newCardTitle.trim()) return;
      onAddCard(newCardTitle.trim());
      setNewCardTitle("");
    },
    [newCardTitle, onAddCard],
  );

  const cardIds = column.cards.map((c) => c.id);

  return (
    <div className="flex w-72 shrink-0 flex-col rounded-lg bg-muted/50 p-3">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold">{column.title}</h3>
        <span className="text-xs text-muted-foreground">
          {column.cards.length}
        </span>
      </div>

      <SortableContext items={cardIds} strategy={verticalListSortingStrategy}>
        <div ref={setNodeRef} className="flex min-h-[2rem] flex-col gap-2">
          {column.cards.map((card) => (
            <KanbanCard
              key={card.id}
              card={card}
              onClick={() => onEditCard(card)}
            />
          ))}
        </div>
      </SortableContext>

      <form onSubmit={handleAddCard} className="mt-3">
        <Input
          type="text"
          value={newCardTitle}
          onChange={(e) => setNewCardTitle(e.target.value)}
          placeholder="+ Add card"
          className="text-sm"
          maxLength={200}
        />
      </form>
    </div>
  );
}
