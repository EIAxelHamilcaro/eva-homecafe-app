import { db } from "@packages/drizzle";
import { photo } from "@packages/drizzle/schema";
import { desc, eq, sql } from "drizzle-orm";

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;

export interface GalleryPhotoDto {
  id: string;
  url: string;
  filename: string;
  mimeType: string;
  size: number;
  caption: string | null;
  createdAt: string;
}

export interface GetUserGalleryOutputDto {
  photos: GalleryPhotoDto[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export async function getUserGallery(
  userId: string,
  page = DEFAULT_PAGE,
  limit = DEFAULT_LIMIT,
): Promise<GetUserGalleryOutputDto> {
  const offset = (page - 1) * limit;

  const [records, countResult] = await Promise.all([
    db
      .select()
      .from(photo)
      .where(eq(photo.userId, userId))
      .orderBy(desc(photo.createdAt))
      .limit(limit)
      .offset(offset),
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(photo)
      .where(eq(photo.userId, userId)),
  ]);

  const total = countResult[0]?.count ?? 0;
  const totalPages = Math.ceil(total / limit);

  return {
    photos: records.map((record) => ({
      id: record.id,
      url: record.url,
      filename: record.filename,
      mimeType: record.mimeType,
      size: record.size,
      caption: record.caption,
      createdAt: record.createdAt.toISOString(),
    })),
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
