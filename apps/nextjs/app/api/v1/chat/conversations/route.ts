import {
  createConversationController,
  getConversationsController,
} from "@/adapters/controllers/chat/conversations.controller";

export const GET = getConversationsController;
export const POST = createConversationController;
