"use client";

import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
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
import { Input } from "@packages/ui/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@packages/ui/components/ui/popover";
import { MoreHorizontal, Trash2 } from "lucide-react";
import { useCallback, useRef, useState } from "react";
import type {
  ICardDto,
  IColumnDto,
} from "@/application/dto/board/common-board.dto";
import { KanbanCard } from "./kanban-card";

export const COLUMN_COLORS = [
  { bg: "bg-[#f691c3]/25", text: "text-[#f691c3]", hex: "#f691c3" },
  { bg: "bg-[#b77fff]/25", text: "text-[#b77fff]", hex: "#b77fff" },
  { bg: "bg-[#0062dd]/25", text: "text-[#0062dd]", hex: "#0062dd" },
  { bg: "bg-[#04a056]/25", text: "text-[#04a056]", hex: "#04a056" },
  { bg: "bg-[#f46604]/25", text: "text-[#f46604]", hex: "#f46604" },
];

interface KanbanColumnProps {
  column: IColumnDto;
  colorIndex: number;
  onAddCard: (title: string) => void;
  onEditCard: (card: ICardDto) => void;
  onDeleteCard: (cardId: string) => void;
  onUpdateColumn?: (data: { title?: string; color?: number | null }) => void;
  onDeleteColumn?: () => void;
  userName: string;
  userImage: string | null;
}

export function KanbanColumn({
  column,
  colorIndex,
  onAddCard,
  onEditCard,
  onDeleteCard,
  onUpdateColumn,
  onDeleteColumn,
  userName,
  userImage,
}: KanbanColumnProps) {
  const colors = COLUMN_COLORS[colorIndex % COLUMN_COLORS.length] ?? {
    bg: "bg-[#f691c3]/25",
    text: "text-[#f691c3]",
    hex: "#f691c3",
  };
  const [newCardTitle, setNewCardTitle] = useState("");
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editTitle, setEditTitle] = useState(column.title);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const titleInputRef = useRef<HTMLInputElement>(null);
  const { setNodeRef, isOver } = useDroppable({ id: column.id });

  const handleAddCard = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!newCardTitle.trim()) return;
      onAddCard(newCardTitle.trim());
      setNewCardTitle("");
    },
    [newCardTitle, onAddCard],
  );

  const handleTitleSubmit = useCallback(() => {
    const trimmed = editTitle.trim();
    if (trimmed && trimmed !== column.title) {
      onUpdateColumn?.({ title: trimmed });
    }
    setIsEditingTitle(false);
  }, [editTitle, column.title, onUpdateColumn]);

  const handleTitleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") {
        handleTitleSubmit();
      } else if (e.key === "Escape") {
        setEditTitle(column.title);
        setIsEditingTitle(false);
      }
    },
    [handleTitleSubmit, column.title],
  );

  const handleColorSelect = useCallback(
    (idx: number) => {
      onUpdateColumn?.({ color: idx });
      setMenuOpen(false);
    },
    [onUpdateColumn],
  );

  const cardIds = column.cards.map((c) => c.id);

  return (
    <div
      className={"flex w-64 shrink-0 flex-col rounded-2xl p-2.5 sm:w-72 sm:p-3"}
    >
      <div className="mb-3 flex items-center justify-between">
        <div className="flex min-w-0 flex-1 items-center gap-1">
          {isEditingTitle ? (
            <input
              ref={titleInputRef}
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              onBlur={handleTitleSubmit}
              onKeyDown={handleTitleKeyDown}
              className={`w-full border-none bg-transparent text-sm font-normal outline-none ${colors.text}`}
              maxLength={100}
              autoFocus
            />
          ) : (
            <button
              type="button"
              onClick={() => {
                setEditTitle(column.title);
                setIsEditingTitle(true);
              }}
              className={`cursor-text truncate text-sm font-normal ${colors.text}`}
            >
              {column.title}
            </button>
          )}
          <span className={`shrink-0 text-xs ${colors.text} opacity-50`}>
            {column.cards.length}
          </span>
        </div>

        {(onUpdateColumn || onDeleteColumn) && (
          <Popover open={menuOpen} onOpenChange={setMenuOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 shrink-0 opacity-50 hover:opacity-100"
              >
                <MoreHorizontal className="h-3.5 w-3.5" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-48 p-2" align="end">
              {onUpdateColumn && (
                <div className="mb-2">
                  <p className="mb-1.5 px-1 text-xs text-muted-foreground">
                    Couleur
                  </p>
                  <div className="flex gap-1.5 px-1">
                    {COLUMN_COLORS.map((c, idx) => (
                      <button
                        key={c.hex}
                        type="button"
                        onClick={() => handleColorSelect(idx)}
                        className={`h-5 w-5 rounded-full transition-transform hover:scale-110 ${
                          idx === colorIndex
                            ? "ring-2 ring-offset-1 ring-gray-400"
                            : ""
                        }`}
                        style={{ backgroundColor: c.hex }}
                      />
                    ))}
                  </div>
                </div>
              )}
              {onDeleteColumn && (
                <>
                  <div className="my-1 h-px bg-border" />
                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false);
                      setDeleteDialogOpen(true);
                    }}
                    className="flex w-full items-center gap-2 rounded-sm px-1 py-1.5 text-sm text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Supprimer la colonne
                  </button>
                </>
              )}
            </PopoverContent>
          </Popover>
        )}
      </div>

      <SortableContext items={cardIds} strategy={verticalListSortingStrategy}>
        <div
          ref={setNodeRef}
          className={`scrollbar-hover flex min-h-8 ${colors.bg} max-h-[40vh] p-2 flex-col gap-2 overflow-y-auto overscroll-y-contain rounded-xl transition-colors ${
            isOver ? "bg-primary/5 ring-2 ring-primary/10" : ""
          }`}
        >
          {column.cards.map((card) => (
            <KanbanCard
              key={card.id}
              card={card}
              onClick={() => onEditCard(card)}
              onDelete={() => onDeleteCard(card.id)}
              userName={userName}
              userImage={userImage}
            />
          ))}
        </div>
      </SortableContext>

      <form onSubmit={handleAddCard} className="mt-3">
        <Input
          type="text"
          value={newCardTitle}
          onChange={(e) => setNewCardTitle(e.target.value)}
          placeholder="+ Ajouter une carte"
          className="bg-white text-sm"
          maxLength={200}
        />
      </form>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer la colonne</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer &quot;{column.title}&quot; ?
              Cette colonne doit être vide pour être supprimée.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={onDeleteColumn}>
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
