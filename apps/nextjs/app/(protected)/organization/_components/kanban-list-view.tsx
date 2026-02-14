"use client";

import { Button } from "@packages/ui/components/ui/button";
import { useCallback, useEffect, useState } from "react";
import type { IBoardDto } from "@/application/dto/board/common-board.dto";
import { CreateKanbanDialog } from "./create-kanban-dialog";
import { KanbanBoardView } from "./kanban-board-view";

export function KanbanListView() {
  const [boards, setBoards] = useState<IBoardDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedBoardId, setSelectedBoardId] = useState<string | null>(null);

  const fetchBoards = useCallback(async () => {
    try {
      const response = await fetch("/api/v1/boards?type=kanban");
      if (!response.ok) {
        setError("Failed to load boards");
        return;
      }
      const data = await response.json();
      setBoards(data.boards);
      setError(null);
    } catch {
      setError("Failed to load boards");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBoards();
  }, [fetchBoards]);

  const selectedBoard = boards.find((b) => b.id === selectedBoardId) ?? null;

  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center p-8">
        <p className="text-sm text-destructive">{error}</p>
      </div>
    );
  }

  if (selectedBoard) {
    return (
      <KanbanBoardView
        board={selectedBoard}
        onBack={() => setSelectedBoardId(null)}
        onUpdate={fetchBoards}
      />
    );
  }

  return (
    <div>
      {boards.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
          <p className="mb-2 text-lg font-medium">No kanban boards yet</p>
          <p className="mb-6 text-sm text-muted-foreground">
            Create your first kanban board to organize tasks visually.
          </p>
          <Button onClick={() => setDialogOpen(true)}>
            Create your first board
          </Button>
        </div>
      ) : (
        <>
          <div className="mb-4 flex justify-end">
            <Button onClick={() => setDialogOpen(true)}>New Board</Button>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {boards.map((board) => (
              <Button
                key={board.id}
                variant="ghost"
                onClick={() => setSelectedBoardId(board.id)}
                className="rounded-lg border p-4 text-left transition-colors hover:bg-accent"
              >
                <h3 className="font-semibold">{board.title}</h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  {board.columns.length} columns
                  {" / "}
                  {board.columns.reduce(
                    (sum, col) => sum + col.cards.length,
                    0,
                  )}{" "}
                  cards
                </p>
              </Button>
            ))}
          </div>
        </>
      )}

      <CreateKanbanDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onCreated={fetchBoards}
      />
    </div>
  );
}
