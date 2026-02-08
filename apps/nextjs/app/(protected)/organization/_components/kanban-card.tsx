"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Progress } from "@packages/ui/components/ui/progress";
import type { ICardDto } from "@/application/dto/board/common-board.dto";

interface KanbanCardProps {
  card: ICardDto;
  onClick?: () => void;
  isOverlay?: boolean;
}

export function KanbanCard({ card, onClick, isOverlay }: KanbanCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: card.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const isOverdue =
    card.dueDate && new Date(card.dueDate) < new Date() && card.progress < 100;

  return (
    <div
      ref={isOverlay ? undefined : setNodeRef}
      style={isOverlay ? undefined : style}
      {...(isOverlay ? {} : attributes)}
      {...(isOverlay ? {} : listeners)}
      className={`cursor-grab rounded-md border bg-background p-3 shadow-sm ${
        isOverlay ? "rotate-2 shadow-lg" : ""
      }`}
    >
      <button
        type="button"
        onClick={onClick}
        className="w-full text-left"
        tabIndex={-1}
      >
        <p className="text-sm font-medium">{card.title}</p>
        {card.description && (
          <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
            {card.description}
          </p>
        )}
        <div className="mt-2 flex items-center gap-2">
          {card.progress > 0 && (
            <div className="flex flex-1 items-center gap-1.5">
              <Progress value={card.progress} className="h-1.5" />
              <span className="text-xs text-muted-foreground">
                {card.progress}%
              </span>
            </div>
          )}
          {card.dueDate && (
            <span
              className={`text-xs ${isOverdue ? "font-medium text-destructive" : "text-muted-foreground"}`}
            >
              {new Date(card.dueDate).toLocaleDateString()}
            </span>
          )}
        </div>
      </button>
    </div>
  );
}
