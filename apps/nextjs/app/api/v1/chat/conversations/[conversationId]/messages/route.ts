import type { NextRequest } from "next/server";
import {
  getMessagesController,
  sendMessageController,
} from "@/adapters/controllers/chat/messages.controller";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ conversationId: string }> },
) {
  const { conversationId } = await params;
  return getMessagesController(request, conversationId);
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ conversationId: string }> },
) {
  const { conversationId } = await params;
  return sendMessageController(request, conversationId);
}
