import type { NextRequest } from "next/server";
import { moveCardController } from "@/adapters/controllers/board/kanban.controller";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ boardId: string; cardId: string }> },
) {
  const { boardId, cardId } = await params;
  return moveCardController(request, boardId, cardId);
}
