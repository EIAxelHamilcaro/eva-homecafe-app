import type { NextRequest } from "next/server";
import { deletePinController } from "@/adapters/controllers/moodboard/moodboard.controller";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ moodboardId: string; pinId: string }> },
) {
  const { moodboardId, pinId } = await params;
  return deletePinController(request, moodboardId, pinId);
}
