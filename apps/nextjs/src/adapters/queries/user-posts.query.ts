import { db, post } from "@packages/drizzle";
import { desc, eq } from "drizzle-orm";
import type { IPostDto } from "@/application/dto/post/get-user-posts.dto";
import { toPostDto } from "./journal.query";

export async function getUserRecentPosts(
  userId: string,
  limit = 5,
): Promise<IPostDto[]> {
  const records = await db
    .select()
    .from(post)
    .where(eq(post.userId, userId))
    .orderBy(desc(post.createdAt))
    .limit(limit);

  return records.map(toPostDto);
}
