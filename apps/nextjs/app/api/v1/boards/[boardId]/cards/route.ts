import type { NextRequest } from "next/server";
import { addCardToColumnController } from "@/adapters/controllers/board/kanban.controller";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ boardId: string }> },
) {
  const { boardId } = await params;
  return addCardToColumnController(request, boardId);
}
