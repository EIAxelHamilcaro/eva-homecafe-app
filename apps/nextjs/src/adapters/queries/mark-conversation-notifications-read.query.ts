import { and, db, eq, isNull, sql } from "@packages/drizzle";
import { notification } from "@packages/drizzle/schema";

export async function markConversationNotificationsRead(
  userId: string,
  conversationId: string,
): Promise<void> {
  await db
    .update(notification)
    .set({ readAt: new Date() })
    .where(
      and(
        eq(notification.userId, userId),
        eq(notification.type, "new_message"),
        isNull(notification.readAt),
        sql`${notification.data}->>'conversationId' = ${conversationId}`,
      ),
    );
}
