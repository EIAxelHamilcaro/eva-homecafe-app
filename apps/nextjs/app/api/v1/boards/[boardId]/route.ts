import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import {
  deleteBoardController,
  updateBoardController,
} from "@/adapters/controllers/board/board.controller";
import { getBoardById } from "@/adapters/queries/board-by-id.query";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ boardId: string }> },
) {
  const { boardId } = await params;
  const board = await getBoardById(boardId);
  if (!board) {
    return NextResponse.json({ error: "Board not found" }, { status: 404 });
  }
  return NextResponse.json(board);
}

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
