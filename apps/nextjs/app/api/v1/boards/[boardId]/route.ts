import type { NextRequest } from "next/server";
import {
  deleteBoardController,
  updateBoardController,
} from "@/adapters/controllers/board/board.controller";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ boardId: string }> },
) {
  const { boardId } = await params;
  return updateBoardController(request, boardId);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ boardId: string }> },
) {
  const { boardId } = await params;
  return deleteBoardController(request, boardId);
}
