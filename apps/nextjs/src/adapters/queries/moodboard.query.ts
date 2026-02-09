import { db } from "@packages/drizzle";
import { moodboard, pin } from "@packages/drizzle/schema";
import { count, desc, eq, inArray } from "drizzle-orm";

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;

export interface MoodboardPinPreviewDto {
  id: string;
  type: string;
  imageUrl: string | null;
  color: string | null;
  position: number;
}

export interface MoodboardListItemDto {
  id: string;
  title: string;
  pinCount: number;
  previewPins: MoodboardPinPreviewDto[];
  createdAt: string;
}

export interface GetUserMoodboardsOutputDto {
  moodboards: MoodboardListItemDto[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export async function getUserMoodboards(
  userId: string,
  page = DEFAULT_PAGE,
  limit = DEFAULT_LIMIT,
): Promise<GetUserMoodboardsOutputDto> {
  const offset = (page - 1) * limit;

  const [records, countResult] = await Promise.all([
    db
      .select()
      .from(moodboard)
      .where(eq(moodboard.userId, userId))
      .orderBy(desc(moodboard.createdAt))
      .limit(limit)
      .offset(offset),
    db
      .select({ count: count() })
      .from(moodboard)
      .where(eq(moodboard.userId, userId)),
  ]);

  const total = countResult[0]?.count ?? 0;
  const totalPages = Math.ceil(total / limit);

  const moodboardIds = records.map((r) => r.id);
  const pinsByMoodboard: Map<string, MoodboardPinPreviewDto[]> = new Map();

  if (moodboardIds.length > 0) {
    const allPins = await db
      .select()
      .from(pin)
      .where(inArray(pin.moodboardId, moodboardIds))
      .orderBy(pin.position);

    for (const p of allPins) {
      const existing = pinsByMoodboard.get(p.moodboardId) ?? [];
      existing.push({
        id: p.id,
        type: p.type,
        imageUrl: p.imageUrl,
        color: p.color,
        position: p.position,
      });
      pinsByMoodboard.set(p.moodboardId, existing);
    }
  }

  return {
    moodboards: records.map((record) => {
      const boardPins = pinsByMoodboard.get(record.id) ?? [];
      return {
        id: record.id,
        title: record.title,
        pinCount: boardPins.length,
        previewPins: boardPins.slice(0, 4),
        createdAt: record.createdAt.toISOString(),
      };
    }),
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

export interface MoodboardPinDto {
  id: string;
  type: string;
  imageUrl: string | null;
  color: string | null;
  position: number;
  createdAt: string;
}

export interface MoodboardDetailDto {
  id: string;
  title: string;
  userId: string;
  pins: MoodboardPinDto[];
  createdAt: string;
}

export async function getMoodboardDetail(
  moodboardId: string,
  userId: string,
): Promise<MoodboardDetailDto | null> {
  const records = await db
    .select()
    .from(moodboard)
    .where(eq(moodboard.id, moodboardId))
    .limit(1);

  const record = records[0];
  if (!record) {
    return null;
  }

  if (record.userId !== userId) {
    return null;
  }

  const pins = await db
    .select()
    .from(pin)
    .where(eq(pin.moodboardId, moodboardId))
    .orderBy(pin.position);

  return {
    id: record.id,
    title: record.title,
    userId: record.userId,
    pins: pins.map((p) => ({
      id: p.id,
      type: p.type,
      imageUrl: p.imageUrl,
      color: p.color,
      position: p.position,
      createdAt: p.createdAt.toISOString(),
    })),
    createdAt: record.createdAt.toISOString(),
  };
}
