import type { NextRequest } from "next/server";
import {
  addReactionController,
  removeReactionController,
} from "@/adapters/controllers/chat/reactions.controller";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ messageId: string }> },
) {
  const { messageId } = await params;
  return addReactionController(request, messageId);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ messageId: string }> },
) {
  const { messageId } = await params;
  return removeReactionController(request, messageId);
}
