"use client";

import { Button } from "@packages/ui/components/ui/button";
import { Plus } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import type { IBoardDto } from "@/application/dto/board/common-board.dto";
import {
  useDashboardLayoutQuery,
  useUpdateDashboardLayoutMutation,
} from "../../_hooks/use-dashboard-layout";
import { CreateTodoDialog } from "./create-todo-dialog";
import { TodoBoardCard } from "./todo-board-card";

export function TodoListView() {
  const [boards, setBoards] = useState<IBoardDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { data: layoutData } = useDashboardLayoutQuery();
  const updateLayout = useUpdateDashboardLayoutMutation();

  const fetchBoards = useCallback(async () => {
    try {
      const response = await fetch("/api/v1/boards?type=todo");
      if (!response.ok) {
        setError("Impossible de charger les listes");
        return;
      }
      const data = await response.json();
      setBoards(data.boards);
      setError(null);
    } catch {
      setError("Impossible de charger les listes");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBoards();
  }, [fetchBoards]);

  const handleTogglePin = useCallback(
    (boardId: string) => {
      const current = layoutData?.pinnedBoardIds ?? [];
      const newPinnedIds = current.includes(boardId)
        ? current.filter((id) => id !== boardId)
        : [...current, boardId];
      updateLayout.mutate({ pinnedBoardIds: newPinnedIds });
    },
    [layoutData?.pinnedBoardIds, updateLayout],
  );

  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <p className="text-sm text-muted-foreground">Chargement...</p>
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

  return (
    <div className="flex flex-col gap-4">
      <div className="space-y-4">
        {boards.map((board) => (
          <TodoBoardCard
            key={board.id}
            board={board}
            onUpdate={fetchBoards}
            isPinned={layoutData?.pinnedBoardIds?.includes(board.id) ?? false}
            onTogglePin={handleTogglePin}
          />
        ))}
      </div>

      <Button
        variant="outline"
        onClick={() => setDialogOpen(true)}
        className="w-full shrink-0 gap-2 border-dashed border-orange-200 text-muted-foreground hover:border-orange-400 hover:text-foreground"
      >
        <Plus className="h-4 w-4" />
        Ajouter une Nouvelle To do list
      </Button>

      <CreateTodoDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onCreated={fetchBoards}
      />
    </div>
  );
}
