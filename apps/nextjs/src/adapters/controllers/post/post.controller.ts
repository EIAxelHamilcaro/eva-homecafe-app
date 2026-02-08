import { match } from "@packages/ddd-kit";
import { NextResponse } from "next/server";
import sanitizeHtml from "sanitize-html";
import type { IGetSessionOutputDto } from "@/application/dto/get-session.dto";
import type { ICreatePostOutputDto } from "@/application/dto/post/create-post.dto";
import { createPostInputDtoSchema } from "@/application/dto/post/create-post.dto";
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
