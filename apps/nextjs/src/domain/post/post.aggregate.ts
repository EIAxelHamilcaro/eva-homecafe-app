import { Aggregate, Option, Result, UUID } from "@packages/ddd-kit";
import { PostCreatedEvent } from "./events/post-created.event";
import { PostId } from "./post-id";
import type { PostContent } from "./value-objects/post-content.vo";

export interface IPostProps {
  userId: string;
  content: PostContent;
  isPrivate: boolean;
  images: string[];
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

  static reconstitute(props: IPostProps, id: PostId): Post {
    return new Post(props, id);
  }
}
