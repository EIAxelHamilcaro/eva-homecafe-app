import {
  db,
  friendRequest,
  post,
  postReaction,
  profile,
  user,
} from "@packages/drizzle";
import { and, count, desc, eq, inArray, or } from "drizzle-orm";
import type {
  IFeedPostDto,
  IGetFriendFeedOutputDto,
} from "@/application/dto/feed/get-friend-feed.dto";

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;

export async function getUnifiedFeed(
  userId: string,
  page = DEFAULT_PAGE,
  limit = DEFAULT_LIMIT,
): Promise<IGetFriendFeedOutputDto> {
  const acceptedRequests = await db
    .select({
      senderId: friendRequest.senderId,
      receiverId: friendRequest.receiverId,
    })
    .from(friendRequest)
    .where(
      and(
        or(
          eq(friendRequest.senderId, userId),
          eq(friendRequest.receiverId, userId),
        ),
        eq(friendRequest.status, "accepted"),
      ),
    );

  const friendIds = acceptedRequests.map((fr) =>
    fr.senderId === userId ? fr.receiverId : fr.senderId,
  );

  const offset = (page - 1) * limit;
  const allUserIds = friendIds.length > 0 ? [userId, ...friendIds] : [userId];

  const whereClause = and(
    inArray(post.userId, allUserIds),
    eq(post.isPrivate, false),
  );

  const [records, countResult] = await Promise.all([
    db
      .select({
        id: post.id,
        content: post.content,
        images: post.images,
        isPrivate: post.isPrivate,
        createdAt: post.createdAt,
        updatedAt: post.updatedAt,
        authorId: user.id,
        authorName: user.name,
        authorImage: user.image,
        displayName: profile.displayName,
        avatarUrl: profile.avatarUrl,
      })
      .from(post)
      .innerJoin(user, eq(post.userId, user.id))
      .leftJoin(profile, eq(user.id, profile.userId))
      .where(whereClause)
      .orderBy(desc(post.createdAt))
      .limit(limit)
      .offset(offset),
    db.select({ total: count() }).from(post).where(whereClause),
  ]);

  const postIds = records.map((r) => r.id);

  const [reactionCounts, userReactions] =
    postIds.length > 0
      ? await Promise.all([
          db
            .select({
              postId: postReaction.postId,
              count: count(),
            })
            .from(postReaction)
            .where(inArray(postReaction.postId, postIds))
            .groupBy(postReaction.postId),
          db
            .select({ postId: postReaction.postId })
            .from(postReaction)
            .where(
              and(
                inArray(postReaction.postId, postIds),
                eq(postReaction.userId, userId),
              ),
            ),
        ])
      : [[], []];

  const reactionCountMap = new Map(
    reactionCounts.map((r) => [r.postId, r.count]),
  );
  const userReactionSet = new Set(userReactions.map((r) => r.postId));

  const total = countResult[0]?.total ?? 0;
  const totalPages = Math.ceil(total / limit);

  const data: IFeedPostDto[] = records.map((r) => ({
    id: r.id,
    content: r.content,
    images: (r.images as string[]) ?? [],
    isPrivate: r.isPrivate,
    createdAt: r.createdAt.toISOString(),
    updatedAt: r.updatedAt ? r.updatedAt.toISOString() : null,
    author: {
      id: r.authorId,
      name: r.authorName,
      displayName: r.displayName ?? null,
      avatarUrl: r.avatarUrl ?? r.authorImage ?? null,
    },
    reactionCount: reactionCountMap.get(r.id) ?? 0,
    hasReacted: userReactionSet.has(r.id),
  }));

  return {
    data,
    hasFriends: friendIds.length > 0,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    },
  };
}
