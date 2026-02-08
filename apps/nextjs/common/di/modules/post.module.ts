import { createModule } from "@evyweb/ioctopus";
import { DrizzlePostRepository } from "@/adapters/repositories/post.repository";
import { CreatePostUseCase } from "@/application/use-cases/post/create-post.use-case";
import { DI_SYMBOLS } from "../types";

export const createPostModule = () => {
  const postModule = createModule();

  postModule.bind(DI_SYMBOLS.IPostRepository).toClass(DrizzlePostRepository);

  postModule
    .bind(DI_SYMBOLS.CreatePostUseCase)
    .toClass(CreatePostUseCase, [DI_SYMBOLS.IPostRepository]);

  return postModule;
};
