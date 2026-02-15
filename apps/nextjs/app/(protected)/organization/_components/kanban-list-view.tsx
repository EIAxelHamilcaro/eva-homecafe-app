"use client";

import { Button } from "@packages/ui/components/ui/button";
import { Plus } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import type { IBoardDto } from "@/application/dto/board/common-board.dto";
import { CreateKanbanDialog } from "./create-kanban-dialog";
import { KanbanBoardView } from "./kanban-board-view";

interface KanbanListViewProps {
  userName: string;
  userImage: string | null;
}

export function KanbanListView({ userName, userImage }: KanbanListViewProps) {
  const [boards, setBoards] = useState<IBoardDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const fetchBoards = useCallback(async () => {
    try {
      const response = await fetch("/api/v1/boards?type=kanban");
      if (!response.ok) {
        setError("Impossible de charger les boards");
        return;
      }
      const data = await response.json();
      setBoards(data.boards);
      setError(null);
    } catch {
      setError("Impossible de charger les boards");
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

  if (boards.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-orange-200 p-12 text-center">
        <p className="mb-2 text-lg font-medium">Aucun kanban</p>
        <p className="mb-6 text-sm text-muted-foreground">
          Crée ton premier kanban pour organiser tes tâches visuellement.
        </p>
        <Button onClick={() => setDialogOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Créer un kanban
        </Button>
        <CreateKanbanDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          onCreated={fetchBoards}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {boards.map((board) => (
        <KanbanBoardView
          key={board.id}
          board={board}
          onUpdate={fetchBoards}
          userName={userName}
          userImage={userImage}
        />
      ))}
      <Button
        variant="outline"
        onClick={() => setDialogOpen(true)}
        className="w-full shrink-0 gap-2 border-dashed border-orange-200 text-muted-foreground hover:border-orange-400 hover:text-foreground"
      >
        <Plus className="h-4 w-4" />
        Nouveau kanban
      </Button>
      <CreateKanbanDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onCreated={fetchBoards}
      />
    </div>
  );
}
