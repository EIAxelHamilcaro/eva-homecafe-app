import { db, friendRequest, post, profile, user } from "@packages/drizzle";
import { and, desc, eq, inArray, or, sql } from "drizzle-orm";
import type {
  IFeedPostDto,
  IGetFriendFeedOutputDto,
} from "@/application/dto/feed/get-friend-feed.dto";

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;

export async function getFriendFeed(
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

  if (friendIds.length === 0) {
    return {
      data: [],
      hasFriends: false,
      pagination: {
        page,
        limit,
        total: 0,
        totalPages: 0,
        hasNextPage: false,
        hasPreviousPage: false,
      },
    };
  }

  const offset = (page - 1) * limit;

  const whereClause = and(
    inArray(post.userId, friendIds),
    eq(post.isPrivate, false),
  );

  const reactionCountSubquery = sql<number>`(SELECT count(*)::int FROM post_reaction WHERE post_reaction.post_id = ${post.id})`;

  const [records, countResult] = await Promise.all([
    db
      .select({
        id: post.id,
        content: post.content,
        images: post.images,
        createdAt: post.createdAt,
        updatedAt: post.updatedAt,
        authorId: user.id,
        authorName: user.name,
        authorImage: user.image,
        displayName: profile.displayName,
        avatarUrl: profile.avatarUrl,
        reactionCount: reactionCountSubquery.as("reactionCount"),
      })
      .from(post)
      .innerJoin(user, eq(post.userId, user.id))
      .leftJoin(profile, eq(user.id, profile.userId))
      .where(whereClause)
      .orderBy(desc(post.createdAt))
      .limit(limit)
      .offset(offset),
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(post)
      .where(whereClause),
  ]);

  const total = countResult[0]?.count ?? 0;
  const totalPages = Math.ceil(total / limit);

  const data: IFeedPostDto[] = records.map((r) => ({
    id: r.id,
    content: r.content,
    images: (r.images as string[]) ?? [],
    createdAt: r.createdAt.toISOString(),
    updatedAt: r.updatedAt ? r.updatedAt.toISOString() : null,
    author: {
      id: r.authorId,
      name: r.authorName,
      displayName: r.displayName ?? null,
      avatarUrl: r.avatarUrl ?? r.authorImage ?? null,
    },
    reactionCount: r.reactionCount ?? 0,
  }));

  return {
    data,
    hasFriends: true,
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
