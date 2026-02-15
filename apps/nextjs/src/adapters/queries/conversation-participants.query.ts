import { conversationParticipant, db, eq, message } from "@packages/drizzle";

export async function getConversationParticipantIds(
  conversationId: string,
): Promise<string[]> {
  const rows = await db
    .select({ userId: conversationParticipant.userId })
    .from(conversationParticipant)
    .where(eq(conversationParticipant.conversationId, conversationId));
  return rows.map((r) => r.userId);
}

export async function getMessageConversationAndParticipants(
  messageId: string,
): Promise<{ conversationId: string; participantIds: string[] } | null> {
  const [msg] = await db
    .select({ conversationId: message.conversationId })
    .from(message)
    .where(eq(message.id, messageId))
    .limit(1);

  if (!msg) return null;

  const participantIds = await getConversationParticipantIds(
    msg.conversationId,
  );
  return { conversationId: msg.conversationId, participantIds };
}
