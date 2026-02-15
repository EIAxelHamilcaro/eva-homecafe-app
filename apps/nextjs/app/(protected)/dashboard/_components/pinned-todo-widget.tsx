"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@packages/ui/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@packages/ui/components/ui/tooltip";
import { Info, Pin } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { IBoardDto } from "@/application/dto/board/common-board.dto";
import {
  useDashboardLayoutQuery,
  useUpdateDashboardLayoutMutation,
} from "../../_hooks/use-dashboard-layout";
import { TodoBoardCard } from "../../organization/_components/todo-board-card";

export function PinnedTodoWidget() {
  const [boards, setBoards] = useState<IBoardDto[]>([]);
  const [loading, setLoading] = useState(true);
  const { data: layoutData, isLoading: layoutLoading } =
    useDashboardLayoutQuery();
  const updateLayout = useUpdateDashboardLayoutMutation();

  const pinnedIds = useMemo(
    () => layoutData?.pinnedBoardIds ?? [],
    [layoutData?.pinnedBoardIds],
  );

  const fetchBoards = useCallback(async () => {
    if (pinnedIds.length === 0) {
      setBoards([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const results = await Promise.all(
        pinnedIds.map(async (id) => {
          const response = await fetch(`/api/v1/boards/${id}`);
          if (!response.ok) return null;
          return response.json() as Promise<IBoardDto>;
        }),
      );
      setBoards(results.filter((b): b is IBoardDto => b !== null));
    } catch {
      setBoards([]);
    } finally {
      setLoading(false);
    }
  }, [pinnedIds]);

  useEffect(() => {
    if (!layoutLoading) {
      fetchBoards();
    }
  }, [fetchBoards, layoutLoading]);

  const handleUnpin = useCallback(
    (boardId: string) => {
      const newPinnedIds = pinnedIds.filter((id) => id !== boardId);
      updateLayout.mutate({ pinnedBoardIds: newPinnedIds });
    },
    [pinnedIds, updateLayout],
  );

  const isLoading = layoutLoading || loading;

  return (
    <Card className="border-0">
      <CardHeader>
        <div className="flex items-center gap-2">
          <CardTitle>To do list</CardTitle>
          <Tooltip>
            <TooltipTrigger asChild>
              <Info className="h-3.5 w-3.5 cursor-help text-muted-foreground" />
            </TooltipTrigger>
            <TooltipContent side="top">
              <p>
                Épingle tes listes depuis la page Organisation pour les
                retrouver ici.
              </p>
            </TooltipContent>
          </Tooltip>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Chargement...</p>
        ) : boards.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-4 text-center">
            <Pin className="h-8 w-8 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">
              Aucune liste épinglée
            </p>
            <Link
              href="/organization"
              className="inline-block rounded-full bg-primary px-4 py-1.5 text-sm font-medium text-white hover:opacity-90"
            >
              Épingler une liste
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {boards.map((board) => (
              <TodoBoardCard
                key={board.id}
                board={board}
                onUpdate={fetchBoards}
                isPinned
                onTogglePin={handleUnpin}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
