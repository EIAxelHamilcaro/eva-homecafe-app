import { db, post } from "@packages/drizzle";
import { and, desc, eq, sql } from "drizzle-orm";
import type {
  IGetJournalEntriesOutputDto,
  IJournalEntryGroupDto,
} from "@/application/dto/journal/get-journal-entries.dto";
import type { IPostDto } from "@/application/dto/post/get-user-posts.dto";

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;

function toPostDto(record: typeof post.$inferSelect): IPostDto {
  return {
    id: record.id,
    content: record.content,
    isPrivate: record.isPrivate,
    images: (record.images as string[]) ?? [],
    userId: record.userId,
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt ? record.updatedAt.toISOString() : null,
  };
}

function formatDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export async function getJournalEntries(
  userId: string,
  date?: string,
  page = DEFAULT_PAGE,
  limit = DEFAULT_LIMIT,
): Promise<IGetJournalEntriesOutputDto> {
  const offset = (page - 1) * limit;

  const conditions = [eq(post.userId, userId), eq(post.isPrivate, true)];

  if (date) {
    conditions.push(
      sql`DATE(${post.createdAt}) = ${date}` as ReturnType<typeof eq>,
    );
  }

  const whereClause = and(...conditions);

  const [records, countResult] = await Promise.all([
    db
      .select()
      .from(post)
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

  const groupMap = new Map<string, IPostDto[]>();
  for (const record of records) {
    const dateKey = formatDateKey(record.createdAt);
    const existing = groupMap.get(dateKey) ?? [];
    existing.push(toPostDto(record));
    groupMap.set(dateKey, existing);
  }

  const groups: IJournalEntryGroupDto[] = [];
  for (const [dateKey, posts] of groupMap) {
    groups.push({ date: dateKey, posts });
  }

  return {
    groups,
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
