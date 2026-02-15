import { match } from "@packages/ddd-kit";
import { NextResponse } from "next/server";
import type { IAddCardOutputDto } from "@/application/dto/board/add-card.dto";
import { addCardInputDtoSchema } from "@/application/dto/board/add-card.dto";
import type { IAddColumnOutputDto } from "@/application/dto/board/add-column.dto";
import { addColumnInputDtoSchema } from "@/application/dto/board/add-column.dto";
import type { ICreateKanbanBoardOutputDto } from "@/application/dto/board/create-kanban-board.dto";
import { createKanbanBoardInputDtoSchema } from "@/application/dto/board/create-kanban-board.dto";
import type { IMoveCardOutputDto } from "@/application/dto/board/move-card.dto";
import { moveCardInputDtoSchema } from "@/application/dto/board/move-card.dto";
import type { IRemoveCardOutputDto } from "@/application/dto/board/remove-card.dto";
import { removeCardInputDtoSchema } from "@/application/dto/board/remove-card.dto";
import type { IRemoveColumnOutputDto } from "@/application/dto/board/remove-column.dto";
import { removeColumnInputDtoSchema } from "@/application/dto/board/remove-column.dto";
import type { IUpdateCardOutputDto } from "@/application/dto/board/update-card.dto";
import { updateCardInputDtoSchema } from "@/application/dto/board/update-card.dto";
import type { IUpdateColumnOutputDto } from "@/application/dto/board/update-column.dto";
import { updateColumnInputDtoSchema } from "@/application/dto/board/update-column.dto";
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

function handleUseCaseError(error: string): NextResponse<{ error: string }> {
  if (error === "Forbidden") {
    return NextResponse.json({ error }, { status: 403 });
  }
  if (
    error === "Board not found" ||
    error === "Card not found" ||
    error === "Column not found" ||
    error === "Card not found in column" ||
    error === "Card not found in any column" ||
    error === "Target column not found"
  ) {
    return NextResponse.json({ error }, { status: 404 });
  }
  if (error === "Can only add columns to kanban boards") {
    return NextResponse.json({ error }, { status: 400 });
  }
  if (error === "Cannot remove column with cards") {
    return NextResponse.json({ error }, { status: 400 });
  }
  return NextResponse.json({ error }, { status: 500 });
}

export async function createKanbanBoardController(
  request: Request,
): Promise<NextResponse<ICreateKanbanBoardOutputDto | { error: string }>> {
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

  const parsed = createKanbanBoardInputDtoSchema.safeParse({
    ...(json as Record<string, unknown>),
    userId: session.user.id,
  });

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 },
    );
  }

  const useCase = getInjection("CreateKanbanBoardUseCase");
  const result = await useCase.execute(parsed.data);

  if (result.isFailure) {
    return NextResponse.json({ error: result.getError() }, { status: 500 });
  }

  return NextResponse.json(result.getValue(), { status: 201 });
}

export async function moveCardController(
  request: Request,
  boardId: string,
  cardId: string,
): Promise<NextResponse<IMoveCardOutputDto | { error: string }>> {
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

  const parsed = moveCardInputDtoSchema.safeParse({
    ...(json as Record<string, unknown>),
    boardId,
    cardId,
    userId: session.user.id,
  });

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 },
    );
  }

  const useCase = getInjection("MoveCardUseCase");
  const result = await useCase.execute(parsed.data);

  if (result.isFailure) {
    return handleUseCaseError(result.getError());
  }

  return NextResponse.json(result.getValue());
}

export async function addColumnController(
  request: Request,
  boardId: string,
): Promise<NextResponse<IAddColumnOutputDto | { error: string }>> {
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

  const parsed = addColumnInputDtoSchema.safeParse({
    ...(json as Record<string, unknown>),
    boardId,
    userId: session.user.id,
  });

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 },
    );
  }

  const useCase = getInjection("AddColumnUseCase");
  const result = await useCase.execute(parsed.data);

  if (result.isFailure) {
    return handleUseCaseError(result.getError());
  }

  return NextResponse.json(result.getValue(), { status: 201 });
}

export async function updateCardController(
  request: Request,
  boardId: string,
  cardId: string,
): Promise<NextResponse<IUpdateCardOutputDto | { error: string }>> {
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

  const parsed = updateCardInputDtoSchema.safeParse({
    ...(json as Record<string, unknown>),
    boardId,
    cardId,
    userId: session.user.id,
  });

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 },
    );
  }

  const useCase = getInjection("UpdateCardUseCase");
  const result = await useCase.execute(parsed.data);

  if (result.isFailure) {
    return handleUseCaseError(result.getError());
  }

  return NextResponse.json(result.getValue());
}

export async function removeCardController(
  request: Request,
  boardId: string,
  cardId: string,
): Promise<NextResponse<IRemoveCardOutputDto | { error: string }>> {
  const session = await getAuthenticatedUser(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const parsed = removeCardInputDtoSchema.safeParse({
    boardId,
    cardId,
    userId: session.user.id,
  });

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 },
    );
  }

  const useCase = getInjection("RemoveCardUseCase");
  const result = await useCase.execute(parsed.data);

  if (result.isFailure) {
    return handleUseCaseError(result.getError());
  }

  return NextResponse.json(result.getValue());
}

export async function updateColumnController(
  request: Request,
  boardId: string,
  columnId: string,
): Promise<NextResponse<IUpdateColumnOutputDto | { error: string }>> {
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

  const parsed = updateColumnInputDtoSchema.safeParse({
    ...(json as Record<string, unknown>),
    boardId,
    columnId,
    userId: session.user.id,
  });

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 },
    );
  }

  const useCase = getInjection("UpdateColumnUseCase");
  const result = await useCase.execute(parsed.data);

  if (result.isFailure) {
    return handleUseCaseError(result.getError());
  }

  return NextResponse.json(result.getValue());
}

export async function removeColumnController(
  request: Request,
  boardId: string,
  columnId: string,
): Promise<NextResponse<IRemoveColumnOutputDto | { error: string }>> {
  const session = await getAuthenticatedUser(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const parsed = removeColumnInputDtoSchema.safeParse({
    boardId,
    columnId,
    userId: session.user.id,
  });

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 },
    );
  }

  const useCase = getInjection("RemoveColumnUseCase");
  const result = await useCase.execute(parsed.data);

  if (result.isFailure) {
    return handleUseCaseError(result.getError());
  }

  return NextResponse.json(result.getValue());
}

export async function addCardToColumnController(
  request: Request,
  boardId: string,
): Promise<NextResponse<IAddCardOutputDto | { error: string }>> {
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

  const parsed = addCardInputDtoSchema.safeParse({
    ...(json as Record<string, unknown>),
    boardId,
    userId: session.user.id,
  });

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 },
    );
  }

  const useCase = getInjection("AddCardToColumnUseCase");
  const result = await useCase.execute(parsed.data);

  if (result.isFailure) {
    return handleUseCaseError(result.getError());
  }

  return NextResponse.json(result.getValue(), { status: 201 });
}
