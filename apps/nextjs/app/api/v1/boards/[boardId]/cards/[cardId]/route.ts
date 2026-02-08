import type { NextRequest } from "next/server";
import { updateCardController } from "@/adapters/controllers/board/kanban.controller";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ boardId: string; cardId: string }> },
) {
  const { boardId, cardId } = await params;
  return updateCardController(request, boardId, cardId);
}
