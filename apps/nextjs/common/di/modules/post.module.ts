import { createModule } from "@evyweb/ioctopus";
import { DrizzlePostRepository } from "@/adapters/repositories/post.repository";
import { CreatePostUseCase } from "@/application/use-cases/post/create-post.use-case";
import { DeletePostUseCase } from "@/application/use-cases/post/delete-post.use-case";
import { GetPostDetailUseCase } from "@/application/use-cases/post/get-post-detail.use-case";
import { GetUserPostsUseCase } from "@/application/use-cases/post/get-user-posts.use-case";
import { TogglePostReactionUseCase } from "@/application/use-cases/post/toggle-post-reaction.use-case";
import { UpdatePostUseCase } from "@/application/use-cases/post/update-post.use-case";
import { DI_SYMBOLS } from "../types";

export const createPostModule = () => {
  const postModule = createModule();

  postModule.bind(DI_SYMBOLS.IPostRepository).toClass(DrizzlePostRepository);

  postModule
    .bind(DI_SYMBOLS.CreatePostUseCase)
    .toClass(CreatePostUseCase, [
      DI_SYMBOLS.IPostRepository,
      DI_SYMBOLS.IEventDispatcher,
    ]);

  postModule
    .bind(DI_SYMBOLS.DeletePostUseCase)
    .toClass(DeletePostUseCase, [
      DI_SYMBOLS.IPostRepository,
      DI_SYMBOLS.IEventDispatcher,
    ]);

  postModule
    .bind(DI_SYMBOLS.GetUserPostsUseCase)
    .toClass(GetUserPostsUseCase, [DI_SYMBOLS.IPostRepository]);

  postModule
    .bind(DI_SYMBOLS.GetPostDetailUseCase)
    .toClass(GetPostDetailUseCase, [DI_SYMBOLS.IPostRepository]);

  postModule
    .bind(DI_SYMBOLS.TogglePostReactionUseCase)
    .toClass(TogglePostReactionUseCase, [
      DI_SYMBOLS.IPostRepository,
      DI_SYMBOLS.IEventDispatcher,
    ]);

  postModule
    .bind(DI_SYMBOLS.UpdatePostUseCase)
    .toClass(UpdatePostUseCase, [
      DI_SYMBOLS.IPostRepository,
      DI_SYMBOLS.IEventDispatcher,
    ]);

  return postModule;
};
