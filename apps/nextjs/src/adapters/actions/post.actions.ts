"use server";

import { revalidatePath } from "next/cache";
import sanitizeHtml from "sanitize-html";
import { authGuard } from "@/adapters/guards/auth.guard";
import type { ICreatePostOutputDto } from "@/application/dto/post/create-post.dto";
import { createPostInputDtoSchema } from "@/application/dto/post/create-post.dto";
import type { IDeletePostOutputDto } from "@/application/dto/post/delete-post.dto";
import { deletePostInputDtoSchema } from "@/application/dto/post/delete-post.dto";
import type { IUpdatePostOutputDto } from "@/application/dto/post/update-post.dto";
import { updatePostInputDtoSchema } from "@/application/dto/post/update-post.dto";
import type { ActionResult } from "@/common/action-result";
import { getInjection } from "@/common/di/container";

const ALLOWED_TAGS = [
  "p",
  "br",
  "strong",
  "em",
  "u",
  "ul",
  "ol",
  "li",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "blockquote",
  "code",
  "pre",
  "hr",
];

export async function createPostAction(input: {
  content: string;
  images?: string[];
  isPrivate: boolean;
  createdAt?: string;
}): Promise<ActionResult<ICreatePostOutputDto>> {
  const guard = await authGuard();
  if (!guard.authenticated) {
    return { success: false, error: "Non authentifié" };
  }

  const sanitizedContent = sanitizeHtml(input.content, {
    allowedTags: ALLOWED_TAGS,
    allowedAttributes: {},
  });

  const parsed = createPostInputDtoSchema.safeParse({
    ...input,
    content: sanitizedContent,
    userId: guard.session.user.id,
  });

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid input",
    };
  }

  const useCase = getInjection("CreatePostUseCase");
  const result = await useCase.execute(parsed.data);

  if (result.isFailure) {
    return { success: false, error: result.getError() };
  }

  revalidatePath("/journal");
  revalidatePath("/posts");
  revalidatePath("/dashboard");
  revalidatePath("/feed");

  return { success: true, data: result.getValue() };
}

export async function updatePostAction(
  postId: string,
  input: {
    content?: string;
    images?: string[];
    isPrivate?: boolean;
  },
): Promise<ActionResult<IUpdatePostOutputDto>> {
  const guard = await authGuard();
  if (!guard.authenticated) {
    return { success: false, error: "Non authentifié" };
  }

  const sanitizedInput = { ...input };
  if (typeof sanitizedInput.content === "string") {
    sanitizedInput.content = sanitizeHtml(sanitizedInput.content, {
      allowedTags: ALLOWED_TAGS,
      allowedAttributes: {},
    });
  }

  const parsed = updatePostInputDtoSchema.safeParse({
    ...sanitizedInput,
    postId,
    userId: guard.session.user.id,
  });

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid input",
    };
  }

  const useCase = getInjection("UpdatePostUseCase");
  const result = await useCase.execute(parsed.data);

  if (result.isFailure) {
    return { success: false, error: result.getError() };
  }

  revalidatePath("/journal");
  revalidatePath("/posts");
  revalidatePath(`/posts/${postId}`);
  revalidatePath("/dashboard");

  return { success: true, data: result.getValue() };
}

export async function deletePostAction(
  postId: string,
): Promise<ActionResult<IDeletePostOutputDto>> {
  const guard = await authGuard();
  if (!guard.authenticated) {
    return { success: false, error: "Non authentifié" };
  }

  const parsed = deletePostInputDtoSchema.safeParse({
    postId,
    userId: guard.session.user.id,
  });

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid input",
    };
  }

  const useCase = getInjection("DeletePostUseCase");
  const result = await useCase.execute(parsed.data);

  if (result.isFailure) {
    return { success: false, error: result.getError() };
  }

  revalidatePath("/journal");
  revalidatePath("/posts");
  revalidatePath("/dashboard");
  revalidatePath("/feed");

  return { success: true, data: result.getValue() };
}
