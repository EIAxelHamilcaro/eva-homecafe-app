import type { NextRequest } from "next/server";
import {
  deleteMoodboardController,
  getMoodboardDetailController,
} from "@/adapters/controllers/moodboard/moodboard.controller";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ moodboardId: string }> },
) {
  const { moodboardId } = await params;
  return getMoodboardDetailController(request, moodboardId);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ moodboardId: string }> },
) {
  const { moodboardId } = await params;
  return deleteMoodboardController(request, moodboardId);
}
