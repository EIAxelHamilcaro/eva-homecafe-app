import { db, friendRequest, post, profile, user } from "@packages/drizzle";
import { photo } from "@packages/drizzle/schema";
import { and, desc, eq, inArray, ne, or, sql } from "drizzle-orm";

export interface FeedGalleryPhotoDto {
  photoId: string | null;
  postId: string | null;
  url: string;
  authorId: string;
  authorName: string;
  authorAvatar: string | null;
  createdAt: string;
}

export interface GetFeedGalleryOutputDto {
  photos: FeedGalleryPhotoDto[];
  pagination: {
    page: number;
    limit: number;
    hasNextPage: boolean;
  };
}

async function getFriendIds(userId: string): Promise<string[]> {
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

  return acceptedRequests.map((fr) =>
    fr.senderId === userId ? fr.receiverId : fr.senderId,
  );
}

function buildWhereClause(allUserIds: string[]) {
  const emptyJsonArray = sql`'[]'::jsonb`;
  return and(
    inArray(post.userId, allUserIds),
    eq(post.isPrivate, false),
    ne(post.images, emptyJsonArray),
  );
}

function extractPhotos(
  records: {
    id: string;
    images: unknown;
    createdAt: Date;
    authorId: string;
    authorName: string;
    displayName: string | null;
    avatarUrl: string | null;
    authorImage: string | null;
  }[],
  limit: number,
): FeedGalleryPhotoDto[] {
  const photos: FeedGalleryPhotoDto[] = [];
  for (const record of records) {
    const images = (record.images as string[]) ?? [];
    for (const url of images) {
      if (photos.length >= limit) return photos;
      photos.push({
        photoId: null,
        postId: record.id,
        url,
        authorId: record.authorId,
        authorName: record.displayName ?? record.authorName,
        authorAvatar: record.avatarUrl ?? record.authorImage ?? null,
        createdAt: record.createdAt.toISOString(),
      });
    }
  }
  return photos;
}

async function getStandalonePhotos(
  allUserIds: string[],
  fetchLimit: number,
  offset: number,
): Promise<FeedGalleryPhotoDto[]> {
  const records = await db
    .select({
      id: photo.id,
      url: photo.url,
      createdAt: photo.createdAt,
      authorId: user.id,
      authorName: user.name,
      displayName: profile.displayName,
      avatarUrl: profile.avatarUrl,
      authorImage: user.image,
    })
    .from(photo)
    .innerJoin(user, eq(photo.userId, user.id))
    .leftJoin(profile, eq(user.id, profile.userId))
    .where(and(inArray(photo.userId, allUserIds), eq(photo.isPrivate, false)))
    .orderBy(desc(photo.createdAt))
    .limit(fetchLimit)
    .offset(offset);

  return records.map((r) => ({
    photoId: r.id,
    postId: null,
    url: r.url,
    authorId: r.authorId,
    authorName: r.displayName ?? r.authorName,
    authorAvatar: r.avatarUrl ?? r.authorImage ?? null,
    createdAt: r.createdAt.toISOString(),
  }));
}

export async function getFeedGallery(
  userId: string,
  page = 1,
  limit = 10,
): Promise<GetFeedGalleryOutputDto> {
  const friendIds = await getFriendIds(userId);
  const allUserIds = [userId, ...friendIds];
  const whereClause = buildWhereClause(allUserIds);

  const offset = (page - 1) * limit;
  const fetchLimit = (limit + 1) * 2;

  const [postRecords, standalonePhotos] = await Promise.all([
    db
      .select({
        id: post.id,
        images: post.images,
        createdAt: post.createdAt,
        authorId: user.id,
        authorName: user.name,
        displayName: profile.displayName,
        avatarUrl: profile.avatarUrl,
        authorImage: user.image,
      })
      .from(post)
      .innerJoin(user, eq(post.userId, user.id))
      .leftJoin(profile, eq(user.id, profile.userId))
      .where(whereClause)
      .orderBy(desc(post.createdAt))
      .limit(fetchLimit)
      .offset(offset),
    getStandalonePhotos(allUserIds, fetchLimit, offset),
  ]);

  const postPhotos = extractPhotos(postRecords, fetchLimit);

  const merged = [...postPhotos, ...standalonePhotos].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  const hasNextPage = merged.length > limit;
  const photos = merged.slice(0, limit);

  return {
    photos,
    pagination: { page, limit, hasNextPage },
  };
}
