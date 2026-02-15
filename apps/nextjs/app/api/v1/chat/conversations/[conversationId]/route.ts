import type { NextRequest } from "next/server";
import { deleteConversationController } from "@/adapters/controllers/chat/conversations.controller";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ conversationId: string }> },
) {
  const { conversationId } = await params;
  return deleteConversationController(request, conversationId);
}
