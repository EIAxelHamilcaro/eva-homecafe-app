"use client";

import { useCallback, useEffect, useState } from "react";
import type { IBoardDto } from "@/application/dto/board/common-board.dto";
import { TableauBoard } from "./tableau-board";

export function TableauView() {
  const [boards, setBoards] = useState<IBoardDto[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBoards = useCallback(async () => {
    try {
      const [todoRes, kanbanRes] = await Promise.all([
        fetch("/api/v1/boards?type=todo"),
        fetch("/api/v1/boards?type=kanban"),
      ]);

      const todoData = todoRes.ok ? await todoRes.json() : { boards: [] };
      const kanbanData = kanbanRes.ok ? await kanbanRes.json() : { boards: [] };

      setBoards([...todoData.boards, ...kanbanData.boards]);
    } catch {
      setBoards([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBoards();
  }, [fetchBoards]);

  const handleDeleteBoard = useCallback(
    async (boardId: string) => {
      try {
        const response = await fetch(`/api/v1/boards/${boardId}`, {
          method: "DELETE",
        });
        if (response.ok) {
          fetchBoards();
        }
      } catch {
        // Silently fail, board stays in list
      }
    },
    [fetchBoards],
  );

  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <p className="text-sm text-muted-foreground">Chargement...</p>
      </div>
    );
  }

  if (boards.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
        <p className="mb-2 text-lg font-medium">Aucun board.</p>
        <p className="text-sm text-muted-foreground">
          Créez des to-do lists ou des kanbans pour les voir ici.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {boards.map((board) => (
        <TableauBoard
          key={board.id}
          board={board}
          onDeleteBoard={() => handleDeleteBoard(board.id)}
        />
      ))}
    </div>
  );
}
