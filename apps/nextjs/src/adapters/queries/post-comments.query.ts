import { db, postComment, profile, user } from "@packages/drizzle";
import { desc, eq } from "drizzle-orm";

export interface IPostCommentDto {
  id: string;
  userId: string;
  userName: string;
  displayName: string | null;
  avatarUrl: string | null;
  content: string;
  createdAt: string;
}

export interface IGetPostCommentsOutputDto {
  comments: IPostCommentDto[];
  totalCount: number;
}

export async function getPostComments(
  postId: string,
): Promise<IGetPostCommentsOutputDto> {
  const records = await db
    .select({
      id: postComment.id,
      userId: postComment.userId,
      userName: user.name,
      displayName: profile.displayName,
      avatarUrl: profile.avatarUrl,
      content: postComment.content,
      createdAt: postComment.createdAt,
    })
    .from(postComment)
    .innerJoin(user, eq(postComment.userId, user.id))
    .leftJoin(profile, eq(user.id, profile.userId))
    .where(eq(postComment.postId, postId))
    .orderBy(desc(postComment.createdAt));

  const comments: IPostCommentDto[] = records.map((r) => ({
    id: r.id,
    userId: r.userId,
    userName: r.userName,
    displayName: r.displayName ?? null,
    avatarUrl: r.avatarUrl ?? null,
    content: r.content,
    createdAt: r.createdAt.toISOString(),
  }));

  return {
    comments,
    totalCount: comments.length,
  };
}
