import type { NextRequest } from "next/server";
import { markConversationReadController } from "@/adapters/controllers/chat/conversations.controller";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ conversationId: string }> },
) {
  const { conversationId } = await params;
  return markConversationReadController(request, conversationId);
}
