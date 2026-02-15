"use client";

import { Badge } from "@packages/ui/components/ui/badge";
import { Button } from "@packages/ui/components/ui/button";
import {
  Calendar,
  CheckCheck,
  FileText,
  Link2,
  Pencil,
  Text,
  Timer,
  X,
} from "lucide-react";
import type {
  IBoardDto,
  ICardDto,
} from "@/application/dto/board/common-board.dto";

interface TableauBoardProps {
  board: IBoardDto;
  onDeleteBoard: () => void;
}

interface FlatCard extends ICardDto {
  columnTitle: string;
}

function getStatusBadge(card: FlatCard): { label: string; className: string } {
  if (card.isCompleted) {
    return { label: "Terminé", className: "bg-green-100 text-green-700" };
  }

  const col = card.columnTitle.toLowerCase();

  if (col.includes("attente")) {
    return { label: "En attente", className: "bg-yellow-100 text-yellow-700" };
  }

  if (col.includes("cours")) {
    return { label: "En cours", className: "bg-orange-100 text-orange-700" };
  }

  return { label: "À faire", className: "bg-blue-100 text-blue-700" };
}

function getPriorityLabel(progress: number): {
  label: string;
  className: string;
} {
  if (progress >= 80) {
    return { label: "Critique", className: "text-red-600 font-medium" };
  }

  if (progress >= 50) {
    return { label: "Prioritaire", className: "text-orange-600 font-medium" };
  }

  return { label: "—", className: "text-muted-foreground" };
}

function formatDate(dueDate: string | null): string {
  if (!dueDate) return "—";
  return new Date(dueDate).toLocaleDateString("fr-FR");
}

export function TableauBoard({ board, onDeleteBoard }: TableauBoardProps) {
  const cards: FlatCard[] = board.columns.flatMap((col) =>
    col.cards.map((card) => ({ ...card, columnTitle: col.title })),
  );

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold">{board.title}</h3>
        <Button
          variant="ghost"
          size="icon"
          onClick={onDeleteBoard}
          className="h-6 w-6 text-muted-foreground hover:text-destructive"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="overflow-auto rounded-lg border border-orange-100">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-orange-50/50 text-left text-xs text-muted-foreground">
              <th className="px-4 py-2 font-medium">
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5" />
                  Date
                </span>
              </th>
              <th className="px-4 py-2 font-medium">
                <span className="flex items-center gap-1.5">
                  <Pencil className="h-3.5 w-3.5" />
                  Nom
                </span>
              </th>
              <th className="px-4 py-2 font-medium">
                <span className="flex items-center gap-1.5">
                  <Text className="h-3.5 w-3.5" />
                  Texte
                </span>
              </th>
              <th className="px-4 py-2 font-medium">
                <span className="flex items-center gap-1.5">
                  <CheckCheck className="h-3.5 w-3.5" />
                  État
                </span>
              </th>
              <th className="px-4 py-2 font-medium">
                <span className="flex items-center gap-1.5">
                  <Timer className="h-3.5 w-3.5" />
                  Priorité
                </span>
              </th>
              <th className="px-4 py-2 font-medium">
                <span className="flex items-center gap-1.5">
                  <FileText className="h-3.5 w-3.5" />
                  Fichiers
                </span>
              </th>
            </tr>
          </thead>
          <tbody>
            {cards.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-8 text-center text-muted-foreground"
                >
                  Aucune tâche
                </td>
              </tr>
            ) : (
              cards.map((card) => {
                const status = getStatusBadge(card);
                const priority = getPriorityLabel(card.progress);

                return (
                  <tr
                    key={card.id}
                    className="border-b border-orange-50 last:border-b-0"
                  >
                    <td className="px-4 py-2 text-muted-foreground">
                      {formatDate(card.dueDate)}
                    </td>
                    <td className="px-4 py-2 font-medium">{card.title}</td>
                    <td className="max-w-[200px] truncate px-4 py-2 text-muted-foreground">
                      {card.description ?? "—"}
                    </td>
                    <td className="px-4 py-2">
                      <Badge variant="secondary" className={status.className}>
                        {status.label}
                      </Badge>
                    </td>
                    <td className={`px-4 py-2 ${priority.className}`}>
                      {priority.label}
                    </td>
                    <td className="px-4 py-2 text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Link2 className="h-3.5 w-3.5" />0
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
