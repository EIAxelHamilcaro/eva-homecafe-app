"use client";

import { Button } from "@packages/ui/components/ui/button";
import { useCallback, useEffect, useState } from "react";
import type { IBoardDto } from "@/application/dto/board/common-board.dto";
import { CreateTodoDialog } from "./create-todo-dialog";
import { OrganizationEmptyState } from "./organization-empty-state";
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
        setError("Failed to load lists");
        return;
      }
      const data = await response.json();
      setBoards(data.boards);
      setError(null);
    } catch {
      setError("Failed to load lists");
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

  return (
    <div>
      {boards.length === 0 ? (
        <OrganizationEmptyState onCreateClick={() => setDialogOpen(true)} />
      ) : (
        <>
          <div className="mb-4 flex justify-end">
            <Button onClick={() => setDialogOpen(true)}>New List</Button>
          </div>
          <div className="space-y-4">
            {boards.map((board) => (
              <TodoBoardCard
                key={board.id}
                board={board}
                onUpdate={fetchBoards}
              />
            ))}
          </div>
        </>
      )}

      <CreateTodoDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onCreated={fetchBoards}
      />
    </div>
  );
}
