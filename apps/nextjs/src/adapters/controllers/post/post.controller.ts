import { match } from "@packages/ddd-kit";
import { NextResponse } from "next/server";
import sanitizeHtml from "sanitize-html";
import type { IGetSessionOutputDto } from "@/application/dto/get-session.dto";
import type { ICreatePostOutputDto } from "@/application/dto/post/create-post.dto";
import { createPostInputDtoSchema } from "@/application/dto/post/create-post.dto";
import type { IGetPostDetailOutputDto } from "@/application/dto/post/get-post-detail.dto";
import type { IGetUserPostsOutputDto } from "@/application/dto/post/get-user-posts.dto";
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
  const page = url.searchParams.get("page");
  const limit = url.searchParams.get("limit");

  const useCase = getInjection("GetUserPostsUseCase");
  const result = await useCase.execute({
    userId: session.user.id,
    page: page ? Number.parseInt(page, 10) : undefined,
    limit: limit ? Number.parseInt(limit, 10) : undefined,
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
    return NextResponse.json({ error: result.getError() }, { status: 404 });
  }

  return NextResponse.json(result.getValue());
}
