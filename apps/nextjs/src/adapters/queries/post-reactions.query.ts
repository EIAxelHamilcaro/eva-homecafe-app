import { db, postReaction, profile, user } from "@packages/drizzle";
import { eq } from "drizzle-orm";

export interface IPostReactionDetailDto {
  userId: string;
  userName: string;
  displayName: string | null;
  emoji: string;
  createdAt: string;
}

export interface IGetPostReactionsOutputDto {
  reactions: IPostReactionDetailDto[];
  totalCount: number;
}

export async function getPostReactions(
  postId: string,
): Promise<IGetPostReactionsOutputDto> {
  const records = await db
    .select({
      userId: postReaction.userId,
      userName: user.name,
      displayName: profile.displayName,
      emoji: postReaction.emoji,
      createdAt: postReaction.createdAt,
    })
    .from(postReaction)
    .innerJoin(user, eq(postReaction.userId, user.id))
    .leftJoin(profile, eq(user.id, profile.userId))
    .where(eq(postReaction.postId, postId));

  const reactions: IPostReactionDetailDto[] = records.map((r) => ({
    userId: r.userId,
    userName: r.userName,
    displayName: r.displayName ?? null,
    emoji: r.emoji,
    createdAt: r.createdAt.toISOString(),
  }));

  return {
    reactions,
    totalCount: reactions.length,
  };
}
