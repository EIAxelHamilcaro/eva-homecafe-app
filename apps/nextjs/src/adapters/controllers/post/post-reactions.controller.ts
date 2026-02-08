import { match } from "@packages/ddd-kit";
import { NextResponse } from "next/server";
import type { IGetPostReactionsOutputDto } from "@/adapters/queries/post-reactions.query";
import { getPostReactions } from "@/adapters/queries/post-reactions.query";
import type { IGetSessionOutputDto } from "@/application/dto/get-session.dto";
import {
  type ITogglePostReactionOutputDto,
  togglePostReactionInputDtoSchema,
} from "@/application/dto/post/toggle-post-reaction.dto";
import { getInjection } from "@/common/di/container";

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

export async function togglePostReactionController(
  request: Request,
  postId: string,
): Promise<NextResponse<ITogglePostReactionOutputDto | { error: string }>> {
  const session = await getAuthenticatedUser(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const json = await request.json();
  const parsed = togglePostReactionInputDtoSchema.safeParse({
    postId,
    userId: session.user.id,
    emoji: json.emoji,
  });

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 },
    );
  }

  const useCase = getInjection("TogglePostReactionUseCase");
  const result = await useCase.execute(parsed.data);

  if (result.isFailure) {
    const error = result.getError();
    if (error.includes("not found")) {
      return NextResponse.json({ error }, { status: 404 });
    }
    return NextResponse.json({ error }, { status: 400 });
  }

  return NextResponse.json(result.getValue());
}

export async function getPostReactionsController(
  request: Request,
  postId: string,
): Promise<NextResponse<IGetPostReactionsOutputDto | { error: string }>> {
  const session = await getAuthenticatedUser(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const reactions = await getPostReactions(postId);
  return NextResponse.json(reactions);
}
