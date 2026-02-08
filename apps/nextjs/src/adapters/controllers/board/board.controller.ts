import { match } from "@packages/ddd-kit";
import { NextResponse } from "next/server";
import { getChronology } from "@/adapters/queries/chronology.query";
import type { ICreateBoardOutputDto } from "@/application/dto/board/create-board.dto";
import { createBoardInputDtoSchema } from "@/application/dto/board/create-board.dto";
import type { IDeleteBoardOutputDto } from "@/application/dto/board/delete-board.dto";
import { deleteBoardInputDtoSchema } from "@/application/dto/board/delete-board.dto";
import type { IGetBoardsOutputDto } from "@/application/dto/board/get-boards.dto";
import { getBoardsInputDtoSchema } from "@/application/dto/board/get-boards.dto";
import {
  getChronologyInputDtoSchema,
  type IGetChronologyOutputDto,
} from "@/application/dto/board/get-chronology.dto";
import type { IUpdateBoardOutputDto } from "@/application/dto/board/update-board.dto";
import { updateBoardInputDtoSchema } from "@/application/dto/board/update-board.dto";
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

export async function createBoardController(
  request: Request,
): Promise<NextResponse<ICreateBoardOutputDto | { error: string }>> {
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

  const parsed = createBoardInputDtoSchema.safeParse({
    ...(json as Record<string, unknown>),
    userId: session.user.id,
  });

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 },
    );
  }

  const useCase = getInjection("CreateBoardUseCase");
  const result = await useCase.execute(parsed.data);

  if (result.isFailure) {
    return NextResponse.json({ error: result.getError() }, { status: 500 });
  }

  return NextResponse.json(result.getValue(), { status: 201 });
}

export async function getUserBoardsController(
  request: Request,
): Promise<NextResponse<IGetBoardsOutputDto | { error: string }>> {
  const session = await getAuthenticatedUser(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const pageRaw = url.searchParams.get("page");
  const limitRaw = url.searchParams.get("limit");
  const type = url.searchParams.get("type");

  const parsed = getBoardsInputDtoSchema.safeParse({
    userId: session.user.id,
    type: type || undefined,
    page: pageRaw ? Number(pageRaw) : undefined,
    limit: limitRaw ? Number(limitRaw) : undefined,
  });

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 },
    );
  }

  const useCase = getInjection("GetUserBoardsUseCase");
  const result = await useCase.execute(parsed.data);

  if (result.isFailure) {
    return NextResponse.json({ error: result.getError() }, { status: 500 });
  }

  return NextResponse.json(result.getValue());
}

export async function updateBoardController(
  request: Request,
  boardId: string,
): Promise<NextResponse<IUpdateBoardOutputDto | { error: string }>> {
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

  const parsed = updateBoardInputDtoSchema.safeParse({
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

  const useCase = getInjection("UpdateBoardUseCase");
  const result = await useCase.execute(parsed.data);

  if (result.isFailure) {
    const error = result.getError();
    if (error === "Forbidden") {
      return NextResponse.json({ error }, { status: 403 });
    }
    if (error === "Board not found") {
      return NextResponse.json({ error }, { status: 404 });
    }
    return NextResponse.json({ error }, { status: 500 });
  }

  return NextResponse.json(result.getValue());
}

export async function deleteBoardController(
  request: Request,
  boardId: string,
): Promise<NextResponse<IDeleteBoardOutputDto | { error: string }>> {
  const session = await getAuthenticatedUser(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const parsed = deleteBoardInputDtoSchema.safeParse({
    boardId,
    userId: session.user.id,
  });

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 },
    );
  }

  const useCase = getInjection("DeleteBoardUseCase");
  const result = await useCase.execute(parsed.data);

  if (result.isFailure) {
    const error = result.getError();
    if (error === "Forbidden") {
      return NextResponse.json({ error }, { status: 403 });
    }
    if (error === "Board not found") {
      return NextResponse.json({ error }, { status: 404 });
    }
    return NextResponse.json({ error }, { status: 500 });
  }

  return NextResponse.json(result.getValue());
}

export async function getChronologyController(
  request: Request,
): Promise<NextResponse<IGetChronologyOutputDto | { error: string }>> {
  const session = await getAuthenticatedUser(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const month = url.searchParams.get("month");

  const parsed = getChronologyInputDtoSchema.safeParse({
    userId: session.user.id,
    month: month || undefined,
  });

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 },
    );
  }

  try {
    const result = await getChronology(parsed.data.userId, parsed.data.month);
    return NextResponse.json(result);
  } catch {
    return NextResponse.json(
      { error: "Failed to load chronology" },
      { status: 500 },
    );
  }
}
