import { Aggregate, Option, Result, UUID } from "@packages/ddd-kit";
import { PostCreatedEvent } from "./events/post-created.event";
import { PostDeletedEvent } from "./events/post-deleted.event";
import { PostReactedEvent } from "./events/post-reacted.event";
import { PostUpdatedEvent } from "./events/post-updated.event";
import { PostId } from "./post-id";
import type { PostContent } from "./value-objects/post-content.vo";
import { PostReaction } from "./value-objects/post-reaction.vo";
import type { PostReactionEmoji } from "./value-objects/post-reaction-type.vo";
import { PostReactionsList } from "./watched-lists/post-reactions.list";

export interface IPostProps {
  userId: string;
  content: PostContent;
  isPrivate: boolean;
  images: string[];
  reactions: PostReactionsList;
  createdAt: Date;
  updatedAt: Option<Date>;
}

export interface ICreatePostProps {
  userId: string;
  content: PostContent;
  isPrivate: boolean;
  images: string[];
}

export class Post extends Aggregate<IPostProps> {
  private constructor(props: IPostProps, id?: UUID<string | number>) {
    super(props, id);
  }

  get id(): PostId {
    return PostId.create(this._id);
  }

  static create(
    props: ICreatePostProps,
    id?: UUID<string | number>,
  ): Result<Post> {
    const newId = id ?? new UUID<string>();
    const now = new Date();

    const post = new Post(
      {
        userId: props.userId,
        content: props.content,
        isPrivate: props.isPrivate,
        images: props.images,
        reactions: PostReactionsList.create([]),
        createdAt: now,
        updatedAt: Option.none(),
      },
      newId,
    );

    post.addEvent(
      new PostCreatedEvent(
        newId.value.toString(),
        props.userId,
        props.isPrivate,
      ),
    );

    return Result.ok(post);
  }

  update(changes: {
    content?: PostContent;
    isPrivate?: boolean;
    images?: string[];
  }): void {
    if (
      changes.content === undefined &&
      changes.isPrivate === undefined &&
      changes.images === undefined
    ) {
      return;
    }

    if (changes.content !== undefined) {
      this._props.content = changes.content;
    }
    if (changes.isPrivate !== undefined) {
      this._props.isPrivate = changes.isPrivate;
    }
    if (changes.images !== undefined) {
      this._props.images = changes.images;
    }

    this._props.updatedAt = Option.some(new Date());
    this.addEvent(
      new PostUpdatedEvent(
        this.id.value.toString(),
        this._props.userId,
        this._props.isPrivate,
      ),
    );
  }

  addReaction(userId: string, emoji: PostReactionEmoji): Result<void> {
    if (this._props.reactions.hasUserReactedWith(userId, emoji)) {
      return Result.fail("User already reacted with this emoji");
    }

    const reactionResult = PostReaction.createNew(userId, emoji);
    if (reactionResult.isFailure) {
      return Result.fail(reactionResult.getError());
    }

    this._props.reactions.add(reactionResult.getValue());
    this._props.updatedAt = Option.some(new Date());

    this.addEvent(
      new PostReactedEvent(this.id.value.toString(), userId, emoji, "added"),
    );

    return Result.ok();
  }

  removeReaction(userId: string, emoji: PostReactionEmoji): Result<void> {
    const reaction = this._props.reactions.findByUserAndEmoji(userId, emoji);

    if (reaction.isNone()) {
      return Result.fail("Reaction not found");
    }

    this._props.reactions.remove(reaction.unwrap());
    this._props.updatedAt = Option.some(new Date());

    this.addEvent(
      new PostReactedEvent(this.id.value.toString(), userId, emoji, "removed"),
    );

    return Result.ok();
  }

  markDeleted(): void {
    this.addEvent(
      new PostDeletedEvent(this.id.value.toString(), this._props.userId),
    );
  }

  static reconstitute(props: IPostProps, id: PostId): Post {
    return new Post(props, id);
  }
}
