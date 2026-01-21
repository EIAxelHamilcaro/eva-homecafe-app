import { db, user } from "@packages/drizzle";
import { and, ilike, ne, or } from "drizzle-orm";

export interface RecipientDto {
  id: string;
  name: string;
  email: string;
  image: string | null;
}

export async function searchRecipients(
  search: string,
  currentUserId: string,
  limit = 10,
): Promise<RecipientDto[]> {
  const searchPattern = `%${search}%`;

  const results = await db
    .select({
      id: user.id,
      name: user.name,
      email: user.email,
      image: user.image,
    })
    .from(user)
    .where(
      and(
        ne(user.id, currentUserId),
        or(ilike(user.name, searchPattern), ilike(user.email, searchPattern)),
      ),
    )
    .limit(limit);

  return results;
}
