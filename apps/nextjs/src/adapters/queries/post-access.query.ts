import { db, friendRequest, post } from "@packages/drizzle";
import { and, eq, or } from "drizzle-orm";

export async function canUserAccessPost(
  userId: string,
  postId: string,
): Promise<{ canAccess: boolean; isOwner: boolean }> {
  const [postRecord] = await db
    .select({ userId: post.userId, isPrivate: post.isPrivate })
    .from(post)
    .where(eq(post.id, postId))
    .limit(1);

  if (!postRecord) {
    return { canAccess: false, isOwner: false };
  }

  if (postRecord.userId === userId) {
    return { canAccess: true, isOwner: true };
  }

  if (postRecord.isPrivate) {
    return { canAccess: false, isOwner: false };
  }

  const [friendship] = await db
    .select({ senderId: friendRequest.senderId })
    .from(friendRequest)
    .where(
      and(
        or(
          and(
            eq(friendRequest.senderId, userId),
            eq(friendRequest.receiverId, postRecord.userId),
          ),
          and(
            eq(friendRequest.senderId, postRecord.userId),
            eq(friendRequest.receiverId, userId),
          ),
        ),
        eq(friendRequest.status, "accepted"),
      ),
    )
    .limit(1);

  return { canAccess: !!friendship, isOwner: false };
}
