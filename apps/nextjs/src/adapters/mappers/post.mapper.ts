import { Option, Result, UUID } from "@packages/ddd-kit";
import type { post as postTable } from "@packages/drizzle/schema";
import { Post } from "@/domain/post/post.aggregate";
import { PostId } from "@/domain/post/post-id";
import { PostContent } from "@/domain/post/value-objects/post-content.vo";

type PostRecord = typeof postTable.$inferSelect;

type PostPersistence = Omit<PostRecord, "createdAt" | "updatedAt"> & {
  createdAt?: Date;
  updatedAt?: Date | null;
};

export function postToDomain(record: PostRecord): Result<Post> {
  const contentResult = PostContent.create(record.content);
  if (contentResult.isFailure) {
    return Result.fail(contentResult.getError());
  }

  const post = Post.reconstitute(
    {
      userId: record.userId,
      content: contentResult.getValue(),
      isPrivate: record.isPrivate,
      images: (record.images as string[]) ?? [],
      createdAt: record.createdAt,
      updatedAt: Option.fromNullable(record.updatedAt),
    },
    PostId.create(new UUID(record.id)),
  );

  return Result.ok(post);
}

export function postToPersistence(post: Post): PostPersistence {
  return {
    id: post.id.value.toString(),
    userId: post.get("userId"),
    content: post.get("content").value,
    isPrivate: post.get("isPrivate"),
    images: post.get("images"),
    createdAt: post.get("createdAt"),
    updatedAt: post.get("updatedAt").isSome()
      ? post.get("updatedAt").unwrap()
      : null,
  };
}
