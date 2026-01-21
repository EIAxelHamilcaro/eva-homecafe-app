import { match } from "@packages/ddd-kit";
import { NextResponse } from "next/server";
import {
  getMessagesInputDtoSchema,
  type IGetMessagesOutputDto,
} from "@/application/dto/chat/get-messages.dto";
import {
  type ISendMessageOutputDto,
  sendMessageInputDtoSchema,
} from "@/application/dto/chat/send-message.dto";
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

export async function getMessagesController(
  request: Request,
  conversationId: string,
): Promise<NextResponse<IGetMessagesOutputDto | { error: string }>> {
  const session = await getAuthenticatedUser(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const page = Number(url.searchParams.get("page")) || 1;
  const limit = Number(url.searchParams.get("limit")) || 20;

  const parsed = getMessagesInputDtoSchema.safeParse({
    conversationId,
    userId: session.user.id,
    pagination: { page, limit },
  });

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 },
    );
  }

  const useCase = getInjection("GetMessagesUseCase");
  const result = await useCase.execute(parsed.data);

  if (result.isFailure) {
    const error = result.getError();
    if (error.includes("not a participant")) {
      return NextResponse.json({ error }, { status: 403 });
    }
    return NextResponse.json({ error }, { status: 500 });
  }

  return NextResponse.json(result.getValue());
}

export async function sendMessageController(
  request: Request,
  conversationId: string,
): Promise<NextResponse<ISendMessageOutputDto | { error: string }>> {
  const session = await getAuthenticatedUser(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const json = await request.json();
  const parsed = sendMessageInputDtoSchema.safeParse({
    conversationId,
    senderId: session.user.id,
    content: json.content,
    attachments: json.attachments,
  });

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 },
    );
  }

  const useCase = getInjection("SendMessageUseCase");
  const result = await useCase.execute(parsed.data);

  if (result.isFailure) {
    const error = result.getError();
    if (error.includes("not a participant")) {
      return NextResponse.json({ error }, { status: 403 });
    }
    return NextResponse.json({ error }, { status: 400 });
  }

  return NextResponse.json(result.getValue(), { status: 201 });
}
