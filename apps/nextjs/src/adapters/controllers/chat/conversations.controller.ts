import { match } from "@packages/ddd-kit";
import { NextResponse } from "next/server";
import { getConversationParticipantIds } from "@/adapters/queries/conversation-participants.query";
import { markConversationNotificationsRead } from "@/adapters/queries/mark-conversation-notifications-read.query";
import {
  createConversationInputDtoSchema,
  type ICreateConversationOutputDto,
} from "@/application/dto/chat/create-conversation.dto";
import {
  deleteConversationInputDtoSchema,
  type IDeleteConversationOutputDto,
} from "@/application/dto/chat/delete-conversation.dto";
import {
  getConversationsInputDtoSchema,
  type IGetConversationsOutputDto,
} from "@/application/dto/chat/get-conversations.dto";
import {
  type IMarkConversationReadOutputDto,
  markConversationReadInputDtoSchema,
} from "@/application/dto/chat/mark-conversation-read.dto";
import type { IGetSessionOutputDto } from "@/application/dto/get-session.dto";
import { getInjection } from "@/common/di/container";
import {
  broadcastConversationCreated,
  broadcastConversationDeleted,
  broadcastConversationRead,
} from "./sse.controller";

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

export async function getConversationsController(
  request: Request,
): Promise<NextResponse<IGetConversationsOutputDto | { error: string }>> {
  const session = await getAuthenticatedUser(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const page = Number(url.searchParams.get("page")) || 1;
  const limit = Number(url.searchParams.get("limit")) || 20;

  const parsed = getConversationsInputDtoSchema.safeParse({
    userId: session.user.id,
    pagination: { page, limit },
  });

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 },
    );
  }

  const useCase = getInjection("GetConversationsUseCase");
  const result = await useCase.execute(parsed.data);

  if (result.isFailure) {
    return NextResponse.json({ error: result.getError() }, { status: 500 });
  }

  return NextResponse.json(result.getValue());
}

export async function createConversationController(
  request: Request,
): Promise<NextResponse<ICreateConversationOutputDto | { error: string }>> {
  const session = await getAuthenticatedUser(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const json = await request.json();
  const parsed = createConversationInputDtoSchema.safeParse({
    userId: session.user.id,
    recipientId: json.recipientId,
  });

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 },
    );
  }

  const useCase = getInjection("CreateConversationUseCase");
  const result = await useCase.execute(parsed.data);

  if (result.isFailure) {
    return NextResponse.json({ error: result.getError() }, { status: 400 });
  }

  const output = result.getValue();

  if (output.isNew) {
    const participantIds = [session.user.id, json.recipientId as string];
    broadcastConversationCreated(participantIds, {
      conversationId: output.conversationId,
      createdBy: session.user.id,
      participantIds,
    });
  }

  return NextResponse.json(output, { status: output.isNew ? 201 : 200 });
}

export async function markConversationReadController(
  request: Request,
  conversationId: string,
): Promise<NextResponse<IMarkConversationReadOutputDto | { error: string }>> {
  const session = await getAuthenticatedUser(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const parsed = markConversationReadInputDtoSchema.safeParse({
    conversationId,
    userId: session.user.id,
  });

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 },
    );
  }

  const useCase = getInjection("MarkConversationReadUseCase");
  const result = await useCase.execute(parsed.data);

  if (result.isFailure) {
    const error = result.getError();
    if (error.includes("not found")) {
      return NextResponse.json({ error }, { status: 404 });
    }
    if (error.includes("not a participant")) {
      return NextResponse.json({ error }, { status: 403 });
    }
    return NextResponse.json({ error }, { status: 500 });
  }

  const readOutput = result.getValue();

  getConversationParticipantIds(conversationId)
    .then((participantIds) => {
      broadcastConversationRead(participantIds, {
        conversationId,
        userId: session.user.id,
        readAt: readOutput.readAt.toISOString(),
      });
    })
    .catch(() => {});

  markConversationNotificationsRead(session.user.id, conversationId).catch(
    () => {},
  );

  return NextResponse.json(readOutput);
}

export async function deleteConversationController(
  request: Request,
  conversationId: string,
): Promise<NextResponse<IDeleteConversationOutputDto | { error: string }>> {
  const session = await getAuthenticatedUser(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const parsed = deleteConversationInputDtoSchema.safeParse({
    conversationId,
    userId: session.user.id,
  });

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 },
    );
  }

  const participantIds = await getConversationParticipantIds(conversationId);

  const useCase = getInjection("DeleteConversationUseCase");
  const result = await useCase.execute(parsed.data);

  if (result.isFailure) {
    const error = result.getError();
    if (error.includes("not found")) {
      return NextResponse.json({ error }, { status: 404 });
    }
    if (error.includes("not a participant")) {
      return NextResponse.json({ error }, { status: 403 });
    }
    return NextResponse.json({ error }, { status: 500 });
  }

  broadcastConversationDeleted(participantIds, {
    conversationId,
    deletedBy: session.user.id,
  });

  return NextResponse.json(result.getValue());
}
