import { match } from "@packages/ddd-kit";
import { NextResponse } from "next/server";
import sanitizeHtml from "sanitize-html";
import { getFriendFeed } from "@/adapters/queries/friend-feed.query";
import { getJournalEntries } from "@/adapters/queries/journal.query";
import { calculateStreak } from "@/adapters/queries/streak.query";
import { getUnifiedFeed } from "@/adapters/queries/unified-feed.query";
import type { IGetFriendFeedOutputDto } from "@/application/dto/feed/get-friend-feed.dto";
import type { IGetSessionOutputDto } from "@/application/dto/get-session.dto";
import type { IGetJournalEntriesOutputDto } from "@/application/dto/journal/get-journal-entries.dto";
import type { IGetStreakOutputDto } from "@/application/dto/journal/get-streak.dto";
import type { ICreatePostOutputDto } from "@/application/dto/post/create-post.dto";
import { createPostInputDtoSchema } from "@/application/dto/post/create-post.dto";
import type { IDeletePostOutputDto } from "@/application/dto/post/delete-post.dto";
import { deletePostInputDtoSchema } from "@/application/dto/post/delete-post.dto";
import type { IGetPostDetailOutputDto } from "@/application/dto/post/get-post-detail.dto";
import type { IGetUserPostsOutputDto } from "@/application/dto/post/get-user-posts.dto";
import type { IUpdatePostOutputDto } from "@/application/dto/post/update-post.dto";
import { updatePostInputDtoSchema } from "@/application/dto/post/update-post.dto";
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

async function getAuthenticatedUser(
  request: Request,
): Promise<IGetSessionOutputDto | null> {
  const useCase = getInjection("GetSessionUseCase");
  const result = await useCase.execute(request.headers);

  if (result.isFailure) {
    return null;
  }

  return match<IGetSessionOutputDto, IGetSessionOutputDto | null>(
    result.getValue(),
    {
      Some: (session) => session,
      None: () => null,
    },
  );
}

export async function createPostController(
  request: Request,
): Promise<NextResponse<ICreatePostOutputDto | { error: string }>> {
  const session = await getAuthenticatedUser(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const body = json as Record<string, unknown>;
  if (typeof body.content === "string") {
    body.content = sanitizeHtml(body.content, {
      allowedTags: ALLOWED_TAGS,
      allowedAttributes: {},
    });
  }

  const parsed = createPostInputDtoSchema.safeParse({
    ...body,
    userId: session.user.id,
  });

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 },
    );
  }

  const useCase = getInjection("CreatePostUseCase");
  const result = await useCase.execute(parsed.data);

  if (result.isFailure) {
    return NextResponse.json({ error: result.getError() }, { status: 500 });
  }

  return NextResponse.json(result.getValue(), { status: 201 });
}

export async function getUserPostsController(
  request: Request,
): Promise<NextResponse<IGetUserPostsOutputDto | { error: string }>> {
  const session = await getAuthenticatedUser(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const pageRaw = url.searchParams.get("page");
  const limitRaw = url.searchParams.get("limit");
  const page = pageRaw ? Number.parseInt(pageRaw, 10) : Number.NaN;
  const limit = limitRaw ? Number.parseInt(limitRaw, 10) : Number.NaN;

  const useCase = getInjection("GetUserPostsUseCase");
  const result = await useCase.execute({
    userId: session.user.id,
    page: page > 0 ? page : undefined,
    limit: limit > 0 && limit <= 100 ? limit : undefined,
  });

  if (result.isFailure) {
    return NextResponse.json({ error: result.getError() }, { status: 500 });
  }

  return NextResponse.json(result.getValue());
}

export async function getPostDetailController(
  request: Request,
  postId: string,
): Promise<NextResponse<IGetPostDetailOutputDto | { error: string }>> {
  const session = await getAuthenticatedUser(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const useCase = getInjection("GetPostDetailUseCase");
  const result = await useCase.execute({
    postId,
    requestingUserId: session.user.id,
  });

  if (result.isFailure) {
    const error = result.getError();
    const status = error === "Post not found" ? 404 : 500;
    return NextResponse.json({ error }, { status });
  }

  return NextResponse.json(result.getValue());
}

export async function updatePostController(
  request: Request,
  postId: string,
): Promise<NextResponse<IUpdatePostOutputDto | { error: string }>> {
  const session = await getAuthenticatedUser(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const body = json as Record<string, unknown>;
  if (typeof body.content === "string") {
    body.content = sanitizeHtml(body.content, {
      allowedTags: ALLOWED_TAGS,
      allowedAttributes: {},
    });
  }

  const parsed = updatePostInputDtoSchema.safeParse({
    ...body,
    postId,
    userId: session.user.id,
  });

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 },
    );
  }

  const useCase = getInjection("UpdatePostUseCase");
  const result = await useCase.execute(parsed.data);

  if (result.isFailure) {
    const error = result.getError();
    if (error === "Forbidden") {
      return NextResponse.json({ error }, { status: 403 });
    }
    if (error === "Post not found") {
      return NextResponse.json({ error }, { status: 404 });
    }
    return NextResponse.json({ error }, { status: 500 });
  }

  return NextResponse.json(result.getValue());
}

export async function deletePostController(
  request: Request,
  postId: string,
): Promise<NextResponse<IDeletePostOutputDto | { error: string }>> {
  const session = await getAuthenticatedUser(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const parsed = deletePostInputDtoSchema.safeParse({
    postId,
    userId: session.user.id,
  });

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 },
    );
  }

  const useCase = getInjection("DeletePostUseCase");
  const result = await useCase.execute(parsed.data);

  if (result.isFailure) {
    const error = result.getError();
    if (error === "Forbidden") {
      return NextResponse.json({ error }, { status: 403 });
    }
    if (error === "Post not found") {
      return NextResponse.json({ error }, { status: 404 });
    }
    return NextResponse.json({ error }, { status: 500 });
  }

  return NextResponse.json(result.getValue());
}

const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

export async function getJournalEntriesController(
  request: Request,
): Promise<NextResponse<IGetJournalEntriesOutputDto | { error: string }>> {
  const session = await getAuthenticatedUser(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const dateRaw = url.searchParams.get("date");
  const pageRaw = url.searchParams.get("page");
  const limitRaw = url.searchParams.get("limit");

  const page = pageRaw ? Number.parseInt(pageRaw, 10) : Number.NaN;
  const limit = limitRaw ? Number.parseInt(limitRaw, 10) : Number.NaN;

  const date = dateRaw && DATE_REGEX.test(dateRaw) ? dateRaw : undefined;

  try {
    const result = await getJournalEntries(
      session.user.id,
      date,
      page > 0 ? page : undefined,
      limit > 0 && limit <= 100 ? limit : undefined,
    );

    return NextResponse.json(result);
  } catch {
    return NextResponse.json(
      { error: "Failed to load journal entries" },
      { status: 500 },
    );
  }
}

export async function getStreakController(
  request: Request,
): Promise<NextResponse<IGetStreakOutputDto | { error: string }>> {
  const session = await getAuthenticatedUser(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await calculateStreak(session.user.id);
    return NextResponse.json(result);
  } catch {
    return NextResponse.json(
      { error: "Failed to calculate streak" },
      { status: 500 },
    );
  }
}

export async function getFriendFeedController(
  request: Request,
): Promise<NextResponse<IGetFriendFeedOutputDto | { error: string }>> {
  const session = await getAuthenticatedUser(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const pageRaw = url.searchParams.get("page");
  const limitRaw = url.searchParams.get("limit");

  const page = pageRaw ? Number.parseInt(pageRaw, 10) : Number.NaN;
  const limit = limitRaw ? Number.parseInt(limitRaw, 10) : Number.NaN;

  try {
    const result = await getFriendFeed(
      session.user.id,
      page > 0 ? page : undefined,
      limit > 0 && limit <= 100 ? limit : undefined,
    );

    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: "Failed to load feed" }, { status: 500 });
  }
}

export async function getUnifiedFeedController(
  request: Request,
): Promise<NextResponse<IGetFriendFeedOutputDto | { error: string }>> {
  const session = await getAuthenticatedUser(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const pageRaw = url.searchParams.get("page");
  const limitRaw = url.searchParams.get("limit");

  const page = pageRaw ? Number.parseInt(pageRaw, 10) : Number.NaN;
  const limit = limitRaw ? Number.parseInt(limitRaw, 10) : Number.NaN;

  try {
    const result = await getUnifiedFeed(
      session.user.id,
      page > 0 ? page : undefined,
      limit > 0 && limit <= 100 ? limit : undefined,
    );

    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: "Failed to load feed" }, { status: 500 });
  }
}
