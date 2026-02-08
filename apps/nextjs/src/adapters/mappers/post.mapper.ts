import { Option, Result, UUID } from "@packages/ddd-kit";
import type {
  postReaction as postReactionTable,
  post as postTable,
} from "@packages/drizzle/schema";
import { Post } from "@/domain/post/post.aggregate";
import { PostId } from "@/domain/post/post-id";
import { PostContent } from "@/domain/post/value-objects/post-content.vo";
import { PostReaction } from "@/domain/post/value-objects/post-reaction.vo";
import type { PostReactionEmoji } from "@/domain/post/value-objects/post-reaction-type.vo";
import { PostReactionsList } from "@/domain/post/watched-lists/post-reactions.list";

type PostRecord = typeof postTable.$inferSelect;
type PostReactionRecord = typeof postReactionTable.$inferSelect;

type PostPersistence = Omit<PostRecord, "createdAt" | "updatedAt"> & {
  createdAt?: Date;
  updatedAt?: Date | null;
};

export interface PostReactionPersistence {
  postId: string;
  userId: string;
  emoji: string;
  createdAt: Date;
}

export function postToDomain(
  record: PostRecord,
  reactionRecords?: PostReactionRecord[],
): Result<Post> {
  const contentResult = PostContent.create(record.content);
  if (contentResult.isFailure) {
    return Result.fail(contentResult.getError());
  }

  const reactions: PostReaction[] = [];
  if (reactionRecords) {
    for (const r of reactionRecords) {
      const reactionResult = PostReaction.create({
        userId: r.userId,
        emoji: r.emoji as PostReactionEmoji,
        createdAt: r.createdAt,
      });
      if (reactionResult.isFailure) {
        return Result.fail(reactionResult.getError());
      }
      reactions.push(reactionResult.getValue());
    }
  }

  const post = Post.reconstitute(
    {
      userId: record.userId,
      content: contentResult.getValue(),
      isPrivate: record.isPrivate,
      images: (record.images as string[]) ?? [],
      reactions: PostReactionsList.create(reactions),
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
