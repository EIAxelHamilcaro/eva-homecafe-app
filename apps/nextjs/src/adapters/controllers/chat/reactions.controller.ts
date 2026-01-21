import { match } from "@packages/ddd-kit";
import { NextResponse } from "next/server";
import {
  addReactionInputDtoSchema,
  type IAddReactionOutputDto,
} from "@/application/dto/chat/add-reaction.dto";
import type { IGetSessionOutputDto } from "@/application/dto/get-session.dto";
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

export async function addReactionController(
  request: Request,
  messageId: string,
): Promise<NextResponse<IAddReactionOutputDto | { error: string }>> {
  const session = await getAuthenticatedUser(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const json = await request.json();
  const parsed = addReactionInputDtoSchema.safeParse({
    messageId,
    userId: session.user.id,
    emoji: json.emoji,
  });

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 },
    );
  }

  const useCase = getInjection("AddReactionUseCase");
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

export async function removeReactionController(
  request: Request,
  messageId: string,
): Promise<NextResponse<IAddReactionOutputDto | { error: string }>> {
  const session = await getAuthenticatedUser(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const emoji = url.searchParams.get("emoji");

  if (!emoji) {
    return NextResponse.json(
      { error: "Missing emoji query parameter" },
      { status: 400 },
    );
  }

  const parsed = addReactionInputDtoSchema.safeParse({
    messageId,
    userId: session.user.id,
    emoji,
  });

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 },
    );
  }

  const useCase = getInjection("AddReactionUseCase");
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
