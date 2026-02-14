import { db, friendRequest, profile, user } from "@packages/drizzle";
import { and, eq, inArray, or } from "drizzle-orm";

export interface FriendPreview {
  id: string;
  name: string;
  displayName: string | null;
  avatarUrl: string | null;
}

export interface FriendsPreviewData {
  count: number;
  friends: FriendPreview[];
}

export async function getFriendsPreview(
  userId: string,
): Promise<FriendsPreviewData> {
  const acceptedRequests = await db
    .select({
      senderId: friendRequest.senderId,
      receiverId: friendRequest.receiverId,
    })
    .from(friendRequest)
    .where(
      and(
        eq(friendRequest.status, "accepted"),
        or(
          eq(friendRequest.senderId, userId),
          eq(friendRequest.receiverId, userId),
        ),
      ),
    );

  const friendIds = acceptedRequests.map((r) =>
    r.senderId === userId ? r.receiverId : r.senderId,
  );

  if (friendIds.length === 0) {
    return { count: 0, friends: [] };
  }

  const friendsData = await db
    .select({
      id: user.id,
      name: user.name,
      displayName: profile.displayName,
      avatarUrl: profile.avatarUrl,
    })
    .from(user)
    .leftJoin(profile, eq(user.id, profile.userId))
    .where(inArray(user.id, friendIds))
    .limit(4);

  return {
    count: friendIds.length,
    friends: friendsData.map((f) => ({
      id: f.id,
      name: f.name,
      displayName: f.displayName,
      avatarUrl: f.avatarUrl,
    })),
  };
}
