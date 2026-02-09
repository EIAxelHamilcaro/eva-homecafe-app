import type { NextRequest } from "next/server";
import { addPinController } from "@/adapters/controllers/moodboard/moodboard.controller";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ moodboardId: string }> },
) {
  const { moodboardId } = await params;
  return addPinController(request, moodboardId);
}
