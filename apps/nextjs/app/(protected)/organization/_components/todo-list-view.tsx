"use client";

import { Button } from "@packages/ui/components/ui/button";
import { Plus } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import type { IBoardDto } from "@/application/dto/board/common-board.dto";
import { CreateTodoDialog } from "./create-todo-dialog";
import { TodoBoardCard } from "./todo-board-card";

export function TodoListView() {
  const [boards, setBoards] = useState<IBoardDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

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
    <div className="space-y-4">
      {boards.map((board) => (
        <TodoBoardCard key={board.id} board={board} onUpdate={fetchBoards} />
      ))}

      <Button
        variant="outline"
        onClick={() => setDialogOpen(true)}
        className="w-full gap-2 border-dashed border-orange-200 text-muted-foreground hover:border-orange-400 hover:text-foreground"
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
