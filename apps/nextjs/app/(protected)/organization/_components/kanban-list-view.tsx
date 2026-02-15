"use client";

import { Button } from "@packages/ui/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@packages/ui/components/ui/select";
import { Plus } from "lucide-react";
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
        setError("Impossible de charger les boards");
        return;
      }
      const data = await response.json();
      setBoards(data.boards);
      if (data.boards.length > 0 && !selectedBoardId) {
        setSelectedBoardId(data.boards[0].id);
      }
      setError(null);
    } catch {
      setError("Impossible de charger les boards");
    } finally {
      setLoading(false);
    }
  }, [selectedBoardId]);

  useEffect(() => {
    fetchBoards();
  }, [fetchBoards]);

  const selectedBoard = boards.find((b) => b.id === selectedBoardId) ?? null;

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
    <div>
      <div className="mb-4 flex items-center justify-between gap-3">
        {boards.length > 1 ? (
          <Select
            value={selectedBoardId ?? undefined}
            onValueChange={setSelectedBoardId}
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Choisir un board" />
            </SelectTrigger>
            <SelectContent>
              {boards.map((b) => (
                <SelectItem key={b.id} value={b.id}>
                  {b.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          <h3 className="text-lg font-semibold">{selectedBoard?.title}</h3>
        )}
        <Button
          variant="outline"
          size="sm"
          onClick={() => setDialogOpen(true)}
          className="gap-1.5"
        >
          <Plus className="h-4 w-4" />
          Nouveau
        </Button>
      </div>

      {selectedBoard && (
        <KanbanBoardView
          board={selectedBoard}
          onBack={() => {}}
          onUpdate={fetchBoards}
        />
      )}

      <CreateKanbanDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onCreated={fetchBoards}
      />
    </div>
  );
}
