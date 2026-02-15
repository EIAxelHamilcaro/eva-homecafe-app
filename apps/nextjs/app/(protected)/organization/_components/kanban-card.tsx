"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  CalendarDays,
  GripVertical,
  Link as LinkIcon,
  Trash2,
} from "lucide-react";
import Image from "next/image";
import type { ICardDto } from "@/application/dto/board/common-board.dto";

interface KanbanCardProps {
  card: ICardDto;
  onClick?: () => void;
  onDelete?: () => void;
  isOverlay?: boolean;
  userName?: string;
  userImage?: string | null;
}

const TAG_COLORS: Record<string, string> = {
  Perso: "bg-red-400",
  Maison: "bg-green-500",
  Déco: "bg-blue-500",
  Achats: "bg-emerald-500",
  "Vu sur Pinterest": "bg-orange-400",
  Travail: "bg-pink-400",
};

const DEFAULT_PRIORITY = {
  label: "Basse",
  bars: 1,
  color: "text-green-500",
};

const PRIORITY_CONFIG: Record<
  string,
  { label: string; bars: number; color: string }
> = {
  low: DEFAULT_PRIORITY,
  medium: { label: "Moyenne", bars: 2, color: "text-yellow-500" },
  high: { label: "Haute", bars: 3, color: "text-orange-500" },
  critical: { label: "Critique", bars: 4, color: "text-red-500" },
};

function CardContent({
  card,
  userName,
  userImage,
  onDelete,
}: {
  card: ICardDto;
  userName?: string;
  userImage?: string | null;
  onDelete?: () => void;
}) {
  const prio = PRIORITY_CONFIG[card.priority ?? "low"] ?? DEFAULT_PRIORITY;

  return (
    <div className="flex min-w-0 flex-1 flex-col gap-3">
      <div className="flex items-start gap-1">
        <p className="min-w-0 flex-1 text-base font-medium leading-snug">
          {card.title}
        </p>
        <span
          className={`shrink-0 text-sm font-bold leading-none tracking-tight ${prio.color}`}
          title={prio.label}
        >
          {"|".repeat(prio.bars)}
        </span>
        {onDelete && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="shrink-0 text-muted-foreground/40 transition-colors hover:text-destructive"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {card.description && (
        <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
          {card.description}
        </p>
      )}

      {card.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {card.tags.map((tag) => (
            <span
              key={tag}
              className={`rounded-full px-2 py-0.5 text-[10px] font-medium text-white ${TAG_COLORS[tag] ?? "bg-gray-400"}`}
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {card.link && (
        <a
          href={card.link}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-sm text-blue-500 hover:underline"
          onClick={(e) => e.stopPropagation()}
        >
          <LinkIcon className="h-3.5 w-3.5 shrink-0" />
          <span className="truncate">
            {card.link.replace(/^https?:\/\//, "").split("/")[0]}
          </span>
        </a>
      )}

      {card.content && (
        <div className="space-y-0.5">
          <p className="text-[10px] font-medium text-muted-foreground">Texte</p>
          <p className="line-clamp-3 text-[10px] leading-relaxed">
            {card.content}
          </p>
        </div>
      )}

      <div className="flex items-center justify-between text-[10px] text-muted-foreground">
        {userName && (
          <span className="flex items-center gap-1.5">
            {userImage ? (
              <Image
                src={userImage}
                alt={userName ?? ""}
                width={16}
                height={16}
                className="h-4 w-4 rounded-full object-cover"
              />
            ) : (
              <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-muted-foreground/20 text-[8px] font-medium">
                {userName.charAt(0).toUpperCase()}
              </span>
            )}
            <span>{userName}</span>
          </span>
        )}
        <div className="ml-auto flex items-center gap-1">
          <CalendarDays className="h-3 w-3" />
          <span>
            {new Date(card.dueDate ?? card.createdAt).toLocaleDateString(
              "fr-FR",
              {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
              },
            )}
          </span>
        </div>
      </div>
    </div>
  );
}

export function KanbanCard({
  card,
  onClick,
  onDelete,
  isOverlay,
  userName,
  userImage,
}: KanbanCardProps) {
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
      <div className="w-72 rotate-2 scale-105 rounded-xl border border-[#dadada] bg-background p-4 shadow-xl ring-2 ring-primary/20">
        <div className="flex items-start gap-2">
          <GripVertical className="mt-1 h-4 w-4 shrink-0 text-muted-foreground/30" />
          <CardContent card={card} userName={userName} userImage={userImage} />
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
      className={`rounded-xl border border-[#dadada] bg-background p-4 shadow-sm transition-shadow ${
        isDragging ? "shadow-md ring-2 ring-primary/10" : "hover:shadow-md"
      }`}
    >
      <div className="flex items-start gap-2">
        <button
          type="button"
          className="mt-1 shrink-0 cursor-grab touch-none text-muted-foreground/30 hover:text-muted-foreground active:cursor-grabbing"
          {...listeners}
        >
          <GripVertical className="h-4 w-4" />
        </button>
        <button
          type="button"
          className="min-w-0 flex-1 cursor-pointer text-left"
          onClick={onClick}
        >
          <CardContent
            card={card}
            userName={userName}
            userImage={userImage}
            onDelete={onDelete}
          />
        </button>
      </div>
    </div>
  );
}
