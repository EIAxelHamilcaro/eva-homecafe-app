import type { NextRequest } from "next/server";
import {
  removeColumnController,
  updateColumnController,
} from "@/adapters/controllers/board/kanban.controller";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ boardId: string; columnId: string }> },
) {
  const { boardId, columnId } = await params;
  return updateColumnController(request, boardId, columnId);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ boardId: string; columnId: string }> },
) {
  const { boardId, columnId } = await params;
  return removeColumnController(request, boardId, columnId);
}
