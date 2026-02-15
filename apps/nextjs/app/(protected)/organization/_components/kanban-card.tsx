"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Progress } from "@packages/ui/components/ui/progress";
import { GripVertical } from "lucide-react";
import type { ICardDto } from "@/application/dto/board/common-board.dto";

interface KanbanCardProps {
  card: ICardDto;
  onClick?: () => void;
  isOverlay?: boolean;
}

function CardContent({ card }: { card: ICardDto }) {
  const isOverdue =
    card.dueDate && new Date(card.dueDate) < new Date() && card.progress < 100;

  return (
    <div className="min-w-0 flex-1">
      <p className="text-sm font-medium">{card.title}</p>
      {card.description && (
        <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
          {card.description}
        </p>
      )}
      {(card.progress > 0 || card.dueDate) && (
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
      )}
    </div>
  );
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

  if (isOverlay) {
    return (
      <div className="w-72 rotate-2 scale-105 rounded-md border bg-background p-3 shadow-xl ring-2 ring-primary/20">
        <div className="flex items-start gap-2">
          <GripVertical className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground/40" />
          <CardContent card={card} />
        </div>
      </div>
    );
  }

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      className={`rounded-md border bg-background p-3 shadow-sm transition-shadow ${
        isDragging ? "shadow-md ring-2 ring-primary/10" : "hover:shadow-md"
      }`}
    >
      <div className="flex items-start gap-2">
        <button
          type="button"
          className="mt-0.5 shrink-0 cursor-grab touch-none text-muted-foreground/40 hover:text-muted-foreground active:cursor-grabbing"
          {...listeners}
        >
          <GripVertical className="h-4 w-4" />
        </button>
        <button
          type="button"
          className="min-w-0 flex-1 cursor-pointer text-left"
          onClick={onClick}
        >
          <CardContent card={card} />
        </button>
      </div>
    </div>
  );
}
